const Quotation = require('../models/Quotation');
const ServiceRequest = require('../models/ServiceRequest');
const Project = require('../models/Project');
const User = require('../models/User');
const { createNotification, notifyAdmins } = require('../services/notificationService');
const {
  sendNewQuotationEmail,
  sendQuotationResponseEmail,
} = require('../services/emailService');
const { sendSmsNotification } = require('../services/smsService');

const syncExpiredQuotations = async (quotations) => {
  const now = new Date();
  for (const q of quotations) {
    if (q.status === 'pending' && q.validUntil && new Date(q.validUntil) < now) {
      q.status = 'expired';
      await q.save();
    }
  }
};

// @desc    Create a custom quotation for a service request
// @route   POST /api/quotations
// @access  Private/Admin
const createQuotation = async (req, res, next) => {
  try {
    const {
      request,
      requestId,
      amount,
      currency,
      estimatedDays,
      scope,
      terms,
      validUntil,
    } = req.body;

    const targetRequestId = request || requestId;

    if (!targetRequestId || amount === undefined || !estimatedDays || !scope) {
      return res.status(400).json({
        success: false,
        message: 'Please provide request ID, proposed amount, estimated delivery days, and project scope.',
      });
    }

    const serviceRequest = await ServiceRequest.findById(targetRequestId);
    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Associated service request not found.',
      });
    }

    const existingProject = await Project.findOne({ request: serviceRequest._id });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'A project has already been created for this service request.',
      });
    }

    const defaultValidUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const expiryDate = validUntil ? new Date(validUntil) : defaultValidUntil;

    const quotation = await Quotation.create({
      request: serviceRequest._id,
      customer: serviceRequest.customer,
      createdBy: req.user._id,
      amount: Number(amount),
      currency: currency || 'BDT',
      estimatedDays: Number(estimatedDays),
      scope: scope.trim(),
      terms:
        terms && terms.trim()
          ? terms.trim()
          : '50% advance payment upon quotation acceptance, remaining 50% upon final project delivery and sign-off.',
      validUntil: expiryDate,
      status: 'pending',
    });

    serviceRequest.status = 'quoted';
    await serviceRequest.save();

    const populated = await Quotation.findById(quotation._id)
      .populate({
        path: 'request',
        select: 'projectTitle description budget preferredDeadline status service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .populate('customer', 'name email phone company notificationPreferences')
      .populate('createdBy', 'name email');

    await createNotification({
      recipient: serviceRequest.customer,
      type: 'new_quotation',
      title: `New Custom Quotation: ${serviceRequest.projectTitle}`,
      message: `Dynamic IT sent a quotation of ৳${Number(quotation.amount).toLocaleString()} (${quotation.estimatedDays} days delivery).`,
      link: '/customer/quotations',
      relatedId: quotation._id,
    });

    if (populated.customer) {
      await sendNewQuotationEmail(
        populated.customer,
        quotation,
        serviceRequest.projectTitle
      );
      await sendSmsNotification({
        user: populated.customer,
        message: `Dynamic IT: New quotation (BDT ${Number(quotation.amount).toLocaleString()}) ready for "${serviceRequest.projectTitle}".`,
        eventType: 'new_quotation',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quotation created and sent to customer successfully.',
      quotation: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quotations (Admin)
// @route   GET /api/quotations
// @access  Private/Admin
const getAllQuotations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const quotations = await Quotation.find(filter)
      .populate({
        path: 'request',
        select: 'projectTitle budget preferredDeadline status service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .populate('customer', 'name email phone company')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    await syncExpiredQuotations(quotations);

    // Attach whether a project has already been created for each accepted quotation
    const acceptedIds = quotations.filter((q) => q.status === 'accepted').map((q) => q._id);
    const projects = await Project.find({ quotation: { $in: acceptedIds } }).select('_id quotation status progress');
    const projectMap = {};
    projects.forEach((p) => {
      projectMap[p.quotation.toString()] = p;
    });

    const enriched = quotations.map((q) => {
      const obj = q.toObject();
      obj.project = projectMap[q._id.toString()] || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      quotations: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in customer's quotations
// @route   GET /api/quotations/my
// @access  Private/Customer
const getMyQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find({ customer: req.user._id })
      .populate({
        path: 'request',
        select: 'projectTitle description budget preferredDeadline status service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    await syncExpiredQuotations(quotations);

    const quotationIds = quotations.map((q) => q._id);
    const projects = await Project.find({ quotation: { $in: quotationIds } }).select('_id quotation status progress');
    const projectMap = {};
    projects.forEach((p) => {
      projectMap[p.quotation.toString()] = p;
    });

    const enriched = quotations.map((q) => {
      const obj = q.toObject();
      obj.project = projectMap[q._id.toString()] || null;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      quotations: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quotation details by ID
// @route   GET /api/quotations/:id
// @access  Private (Owner Customer or Admin)
const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate({
        path: 'request',
        populate: { path: 'service', select: 'title slug category' },
      })
      .populate('customer', 'name email phone company')
      .populate('createdBy', 'name email');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      quotation.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this quotation.',
      });
    }

    await syncExpiredQuotations([quotation]);

    const project = await Project.findOne({ quotation: quotation._id });

    res.status(200).json({
      success: true,
      quotation,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer accepts or rejects a quotation
// @route   PATCH /api/quotations/:id/respond
// @access  Private/Customer
const respondToQuotation = async (req, res, next) => {
  try {
    const { status, action, customerNote } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    // Security rule: Only the quotation's owner customer can respond
    if (quotation.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this quotation.',
      });
    }

    // Security rule: Customer must not be able to change quotation amount
    if (req.body.amount !== undefined && Number(req.body.amount) !== quotation.amount) {
      return res.status(403).json({
        success: false,
        message: 'Customers cannot modify the proposed quotation amount.',
      });
    }

    if (quotation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot respond to a quotation that is already '${quotation.status}'.`,
      });
    }

    // Security rule: Reject expired quotation responses
    if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
      quotation.status = 'expired';
      await quotation.save();
      return res.status(400).json({
        success: false,
        message: 'This quotation has expired and can no longer be accepted. Please request a revised quotation.',
      });
    }

    let nextStatus = status;
    if (!nextStatus && action) {
      if (action === 'accept') nextStatus = 'accepted';
      if (action === 'reject') nextStatus = 'rejected';
    }

    if (!['accepted', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid response ('accepted' or 'rejected').",
      });
    }

    quotation.status = nextStatus;
    quotation.respondedAt = new Date();
    if (customerNote) {
      quotation.customerNote = customerNote.trim();
    }
    await quotation.save();

    const serviceRequest = await ServiceRequest.findById(quotation.request);
    if (serviceRequest) {
      serviceRequest.status = nextStatus === 'accepted' ? 'accepted' : 'rejected';
      await serviceRequest.save();
    }

    const populated = await Quotation.findById(quotation._id)
      .populate({
        path: 'request',
        select: 'projectTitle description budget preferredDeadline status service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .populate('customer', 'name email phone company')
      .populate('createdBy', 'name email');

    const projTitle = populated.request?.projectTitle || 'Custom Service Request';

    await notifyAdmins({
      type: 'quotation_response',
      title: `Quotation ${nextStatus.toUpperCase()}: ${projTitle}`,
      message: `${req.user.name} ${nextStatus} quotation #${quotation._id.toString().slice(-6).toUpperCase()} (৳${Number(quotation.amount).toLocaleString()}).`,
      link: '/admin/quotations',
      relatedId: quotation._id,
    });

    await sendQuotationResponseEmail(
      populated.createdBy?.email || 'admin@dynamicit.com',
      req.user,
      quotation,
      projTitle
    );

    res.status(200).json({
      success: true,
      message:
        nextStatus === 'accepted'
          ? 'Quotation accepted! Dynamic IT will now initialize your project.'
          : 'Quotation has been declined.',
      quotation: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a pending quotation (Admin)
// @route   PUT /api/quotations/:id
// @access  Private/Admin
const updateQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    const existingProject = await Project.findOne({ quotation: quotation._id });
    if (existingProject || quotation.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'An accepted quotation or one linked to an active project cannot be modified.',
      });
    }

    const { amount, estimatedDays, scope, terms, validUntil, status } = req.body;

    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (Number.isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quotation amount must be greater than zero.',
        });
      }
      quotation.amount = numericAmount;
    }

    if (estimatedDays !== undefined) {
      const numericDays = Number(estimatedDays);
      if (Number.isNaN(numericDays) || numericDays < 1) {
        return res.status(400).json({
          success: false,
          message: 'Estimated delivery days must be at least 1.',
        });
      }
      quotation.estimatedDays = numericDays;
    }

    if (scope !== undefined) quotation.scope = scope.trim();
    if (terms !== undefined) quotation.terms = terms.trim();
    if (validUntil) quotation.validUntil = new Date(validUntil);
    if (status && ['pending', 'expired'].includes(status)) {
      quotation.status = status;
    }

    await quotation.save();

    const populated = await Quotation.findById(quotation._id)
      .populate({
        path: 'request',
        select: 'projectTitle description budget preferredDeadline status service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .populate('customer', 'name email phone company')
      .populate('createdBy', 'name email');

    const projTitle = populated.request?.projectTitle || 'Custom Service Request';

    await createNotification({
      recipient: quotation.customer,
      type: 'new_quotation',
      title: `Updated Quotation: ${projTitle}`,
      message: `Dynamic IT updated your quotation to ৳${Number(quotation.amount).toLocaleString()} (${quotation.estimatedDays} days).`,
      link: '/customer/quotations',
      relatedId: quotation._id,
    });

    res.status(200).json({
      success: true,
      message: 'Quotation updated successfully.',
      quotation: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuotation,
  getAllQuotations,
  getMyQuotations,
  getQuotationById,
  respondToQuotation,
  updateQuotation,
};
