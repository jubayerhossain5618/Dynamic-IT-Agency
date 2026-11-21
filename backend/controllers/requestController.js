const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const { processUploadedFiles } = require('../middleware/uploadMiddleware');
const { notifyAdmins } = require('../services/notificationService');
const { sendNewRequestEmail } = require('../services/emailService');

// @desc    Create a new customer service request
// @route   POST /api/requests
// @access  Private/Customer
const createServiceRequest = async (req, res, next) => {
  try {
    const {
      service,
      serviceId,
      projectTitle,
      description,
      requirements,
      budget,
      preferredDeadline,
    } = req.body;

    const targetServiceId = service || serviceId;

    if (!targetServiceId || !projectTitle || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a service, project title, and project description.',
      });
    }

    const foundService = await Service.findById(targetServiceId);
    if (!foundService) {
      return res.status(404).json({
        success: false,
        message: 'Selected service does not exist.',
      });
    }

    const parsedBudget =
      budget !== undefined && budget !== '' ? Number(budget) : foundService.startingPrice || 0;

    if (Number.isNaN(parsedBudget) || parsedBudget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be a valid non-negative number.',
      });
    }

    const deadlineDate = preferredDeadline
      ? new Date(preferredDeadline)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const attachments = await processUploadedFiles(req.files || []);

    // Security rule: Always assign customer from authenticated JWT user
    const serviceRequest = await ServiceRequest.create({
      customer: req.user._id,
      service: foundService._id,
      projectTitle: projectTitle.trim(),
      description: description.trim(),
      requirements: requirements ? requirements.trim() : '',
      budget: parsedBudget,
      preferredDeadline: deadlineDate,
      attachments,
      status: 'pending',
    });

    const populated = await ServiceRequest.findById(serviceRequest._id)
      .populate('service', 'title slug category startingPrice')
      .populate('customer', 'name email phone company');

    await notifyAdmins({
      type: 'new_request',
      title: `New Service Request: ${serviceRequest.projectTitle}`,
      message: `${req.user.name} submitted a request for ${foundService.title}.`,
      link: '/admin/requests',
      relatedId: serviceRequest._id,
    });

    await sendNewRequestEmail(req.user, serviceRequest, foundService.title);

    res.status(201).json({
      success: true,
      message: 'Your service request has been submitted successfully.',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in customer's service requests
// @route   GET /api/requests/my
// @access  Private/Customer
const getMyServiceRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user._id })
      .populate('service', 'title slug category startingPrice iconName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all service requests (Admin)
// @route   GET /api/requests
// @access  Private/Admin
const getAllServiceRequests = async (req, res, next) => {
  try {
    const { status, search, customerId } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (customerId) {
      filter.customer = customerId;
    }

    let requests = await ServiceRequest.find(filter)
      .populate('customer', 'name email phone company')
      .populate('service', 'title slug category startingPrice')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.projectTitle?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.customer?.name?.toLowerCase().includes(q) ||
          r.customer?.email?.toLowerCase().includes(q) ||
          r.service?.title?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service request by ID
// @route   GET /api/requests/:id
// @access  Private (Owner Customer or Admin)
const getServiceRequestById = async (req, res, next) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id)
      .populate('customer', 'name email phone company')
      .populate('service', 'title slug category startingPrice features');

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found.',
      });
    }

    // Ownership validation
    if (
      req.user.role !== 'admin' &&
      serviceRequest.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this service request.',
      });
    }

    const quotations = await Quotation.find({ request: serviceRequest._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    const project = await Project.findOne({ request: serviceRequest._id });

    res.status(200).json({
      success: true,
      request: serviceRequest,
      quotations,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status and admin notes
// @route   PATCH /api/requests/:id/status
// @access  Private/Admin
const updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found.',
      });
    }

    if (status) {
      serviceRequest.status = status;
    }
    if (adminNotes !== undefined) {
      serviceRequest.adminNotes = adminNotes.trim();
    }

    await serviceRequest.save();

    const updated = await ServiceRequest.findById(serviceRequest._id)
      .populate('customer', 'name email phone company')
      .populate('service', 'title slug category startingPrice');

    res.status(200).json({
      success: true,
      message: 'Service request updated successfully.',
      request: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
};
