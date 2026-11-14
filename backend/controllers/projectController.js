const Project = require('../models/Project');
const Quotation = require('../models/Quotation');
const ServiceRequest = require('../models/ServiceRequest');
const Payment = require('../models/Payment');
const Message = require('../models/Message');

const buildPaymentSummary = async (projectIds) => {
  const payments = await Payment.find({ project: { $in: projectIds } }).sort({ paymentDate: -1 });
  const summaryMap = {};

  payments.forEach((p) => {
    const pid = p.project.toString();
    if (!summaryMap[pid]) {
      summaryMap[pid] = {
        totalPaid: 0,
        paymentCount: 0,
        lastPaymentDate: p.paymentDate,
        payments: [],
      };
    }
    if (p.status !== 'refunded') {
      summaryMap[pid].totalPaid += Number(p.paidAmount || 0);
    }
    summaryMap[pid].paymentCount += 1;
    summaryMap[pid].payments.push(p);
  });

  return summaryMap;
};

// @desc    Create a project from an accepted quotation
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
  try {
    const {
      quotation,
      quotationId,
      projectTitle,
      description,
      startDate,
      expectedDeliveryDate,
      milestones,
    } = req.body;

    const targetQuotationId = quotation || quotationId;

    if (!targetQuotationId) {
      return res.status(400).json({
        success: false,
        message: 'Accepted quotation ID is required to create a project.',
      });
    }

    const foundQuotation = await Quotation.findById(targetQuotationId).populate('request');
    if (!foundQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    if (foundQuotation.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Projects can only be created from an accepted quotation (current status: '${foundQuotation.status}').`,
      });
    }

    // Security rule 9: Prevent duplicate project creation from the same accepted quotation
    const existingProject = await Project.findOne({ quotation: foundQuotation._id });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'A project has already been created from this accepted quotation.',
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const expected = expectedDeliveryDate
      ? new Date(expectedDeliveryDate)
      : new Date(start.getTime() + (foundQuotation.estimatedDays || 15) * 24 * 60 * 60 * 1000);

    const defaultMilestones =
      Array.isArray(milestones) && milestones.length > 0
        ? milestones
        : [
            {
              title: 'Requirement Discovery & Architecture Wireframing',
              description: 'Finalize technical specifications, sitemap, and design direction.',
              dueDate: new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000),
              status: 'in_progress',
            },
            {
              title: 'Core Implementation & Responsive UI Development',
              description: 'Develop core modules, responsive layouts, and dynamic integrations.',
              dueDate: new Date(start.getTime() + Math.ceil((foundQuotation.estimatedDays || 15) * 0.6) * 24 * 60 * 60 * 1000),
              status: 'pending',
            },
            {
              title: 'Quality Assurance, Optimization & Final Handover',
              description: 'Cross-device testing, client review, and deployment sign-off.',
              dueDate: expected,
              status: 'pending',
            },
          ];

    const project = await Project.create({
      quotation: foundQuotation._id,
      request: foundQuotation.request._id,
      customer: foundQuotation.customer,
      projectTitle: projectTitle
        ? projectTitle.trim()
        : foundQuotation.request.projectTitle,
      description: description
        ? description.trim()
        : foundQuotation.scope || foundQuotation.request.description,
      totalAmount: foundQuotation.amount,
      startDate: start,
      expectedDeliveryDate: expected,
      progress: 0,
      status: 'in_progress',
      milestones: defaultMilestones,
    });

    await ServiceRequest.findByIdAndUpdate(foundQuotation.request._id, {
      status: 'project_created',
    });

    const populated = await Project.findById(project._id)
      .populate('customer', 'name email phone company')
      .populate('quotation', 'amount estimatedDays scope terms')
      .populate({
        path: 'request',
        select: 'projectTitle budget preferredDeadline service',
        populate: { path: 'service', select: 'title slug category' },
      });

    res.status(201).json({
      success: true,
      message: 'Project created from accepted quotation successfully.',
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in customer's projects
// @route   GET /api/projects/my
// @access  Private/Customer
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ customer: req.user._id })
      .populate('quotation', 'amount estimatedDays scope terms')
      .populate({
        path: 'request',
        select: 'projectTitle budget preferredDeadline service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .sort({ createdAt: -1 });

    const summaryMap = await buildPaymentSummary(projects.map((p) => p._id));

    const enriched = projects.map((p) => {
      const obj = p.toObject();
      const summary = summaryMap[p._id.toString()] || {
        totalPaid: 0,
        paymentCount: 0,
        lastPaymentDate: null,
        payments: [],
      };
      const remainingAmount = Math.max(0, obj.totalAmount - summary.totalPaid);
      const paymentStatus =
        summary.totalPaid >= obj.totalAmount && obj.totalAmount > 0
          ? 'paid'
          : summary.totalPaid > 0
          ? 'partial'
          : 'unpaid';

      return {
        ...obj,
        paymentSummary: {
          totalAmount: obj.totalAmount,
          paidAmount: summary.totalPaid,
          remainingAmount,
          paymentStatus,
          paymentCount: summary.paymentCount,
          lastPaymentDate: summary.lastPaymentDate,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      projects: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (Admin)
// @route   GET /api/projects
// @access  Private/Admin
const getAllProjects = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (customerId) {
      filter.customer = customerId;
    }

    const projects = await Project.find(filter)
      .populate('customer', 'name email phone company')
      .populate('quotation', 'amount estimatedDays scope terms')
      .populate({
        path: 'request',
        select: 'projectTitle budget preferredDeadline service',
        populate: { path: 'service', select: 'title slug category' },
      })
      .sort({ createdAt: -1 });

    const summaryMap = await buildPaymentSummary(projects.map((p) => p._id));

    const enriched = projects.map((p) => {
      const obj = p.toObject();
      const summary = summaryMap[p._id.toString()] || {
        totalPaid: 0,
        paymentCount: 0,
        lastPaymentDate: null,
        payments: [],
      };
      const remainingAmount = Math.max(0, obj.totalAmount - summary.totalPaid);
      const paymentStatus =
        summary.totalPaid >= obj.totalAmount && obj.totalAmount > 0
          ? 'paid'
          : summary.totalPaid > 0
          ? 'partial'
          : 'unpaid';

      return {
        ...obj,
        paymentSummary: {
          totalAmount: obj.totalAmount,
          paidAmount: summary.totalPaid,
          remainingAmount,
          paymentStatus,
          paymentCount: summary.paymentCount,
          lastPaymentDate: summary.lastPaymentDate,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      projects: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
// @access  Private (Owner Customer or Admin)
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('customer', 'name email phone company')
      .populate('quotation', 'amount estimatedDays scope terms validUntil respondedAt')
      .populate({
        path: 'request',
        populate: { path: 'service', select: 'title slug category' },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this project.',
      });
    }

    const payments = await Payment.find({ project: project._id }).sort({ paymentDate: -1 });
    const totalPaid = payments
      .filter((p) => p.status !== 'refunded')
      .reduce((acc, p) => acc + Number(p.paidAmount || 0), 0);
    const remainingAmount = Math.max(0, project.totalAmount - totalPaid);
    const paymentStatus =
      totalPaid >= project.totalAmount && project.totalAmount > 0
        ? 'paid'
        : totalPaid > 0
        ? 'partial'
        : 'unpaid';

    const messages = await Message.find({ project: project._id })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        paymentSummary: {
          totalAmount: project.totalAmount,
          paidAmount: totalPaid,
          remainingAmount,
          paymentStatus,
          paymentCount: payments.length,
        },
      },
      payments,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project progress percentage & milestones
// @route   PATCH /api/projects/:id/progress
// @access  Private/Admin
const updateProjectProgress = async (req, res, next) => {
  try {
    const { progress, milestones, status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (progress !== undefined) {
      const numericProgress = Number(progress);
      if (Number.isNaN(numericProgress) || numericProgress < 0 || numericProgress > 100) {
        return res.status(400).json({
          success: false,
          message: 'Progress percentage must be a number between 0 and 100.',
        });
      }
      project.progress = numericProgress;

      if (numericProgress === 100 && !status) {
        project.status = 'completed';
      } else if (numericProgress > 0 && project.status === 'not_started' && !status) {
        project.status = 'in_progress';
      }
    }

    if (status) {
      project.status = status;
    }

    if (Array.isArray(milestones)) {
      project.milestones = milestones;
    }

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('customer', 'name email phone company')
      .populate('quotation', 'amount estimatedDays scope')
      .populate({
        path: 'request',
        select: 'projectTitle service',
        populate: { path: 'service', select: 'title slug category' },
      });

    res.status(200).json({
      success: true,
      message: `Project progress updated to ${project.progress}%.`,
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project status
// @route   PATCH /api/projects/:id/status
// @access  Private/Admin
const updateProjectStatus = async (req, res, next) => {
  try {
    const { status, progress, expectedDeliveryDate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Project status is required.',
      });
    }

    project.status = status;
    if (status === 'completed') {
      project.progress = 100;
    } else if (progress !== undefined) {
      project.progress = Number(progress);
    }

    if (expectedDeliveryDate) {
      project.expectedDeliveryDate = new Date(expectedDeliveryDate);
    }

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('customer', 'name email phone company')
      .populate('quotation', 'amount estimatedDays scope')
      .populate({
        path: 'request',
        select: 'projectTitle service',
        populate: { path: 'service', select: 'title slug category' },
      });

    res.status(200).json({
      success: true,
      message: `Project status updated to '${project.status}'.`,
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a milestone in a project
// @route   POST /api/projects/:id/milestones
// @access  Private/Admin
const addMilestone = async (req, res, next) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Milestone title is required.',
      });
    }

    project.milestones.push({
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'pending',
      completedAt: status === 'completed' ? new Date() : null,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Milestone added successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone status
// @route   PATCH /api/projects/:id/milestones/:milestoneId
// @access  Private/Admin
const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { status, title, description } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.',
      });
    }

    if (status) {
      milestone.status = status;
      milestone.completedAt = status === 'completed' ? new Date() : null;
    }
    if (title) milestone.title = title.trim();
    if (description !== undefined) milestone.description = description.trim();

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully.',
      project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getAllProjects,
  getProjectById,
  updateProjectProgress,
  updateProjectStatus,
  addMilestone,
  updateMilestoneStatus,
};
