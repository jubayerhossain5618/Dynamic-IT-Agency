const Payment = require('../models/Payment');
const Project = require('../models/Project');

// @desc    Record a manual payment for a project
// @route   POST /api/payments
// @access  Private/Admin
const recordPayment = async (req, res, next) => {
  try {
    const {
      project,
      projectId,
      paidAmount,
      paymentMethod,
      paymentDate,
      transactionReference,
      notes,
    } = req.body;

    const targetProjectId = project || projectId;

    if (!targetProjectId || paidAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide project ID and paid amount.',
      });
    }

    const foundProject = await Project.findById(targetProjectId);
    if (!foundProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const amountNum = Number(paidAmount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount must be greater than zero.',
      });
    }

    const existingPayments = await Payment.find({
      project: foundProject._id,
      status: { $ne: 'refunded' },
    });

    const previouslyPaid = existingPayments.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    const cumulativePaid = previouslyPaid + amountNum;
    const totalAmount = Number(foundProject.totalAmount || 0);
    const remainingAmount = Math.max(0, totalAmount - cumulativePaid);

    let paymentStatus = 'partial';
    if (remainingAmount === 0 && totalAmount > 0) {
      paymentStatus = 'paid';
    }

    const payment = await Payment.create({
      project: foundProject._id,
      customer: foundProject.customer,
      totalAmount,
      paidAmount: amountNum,
      remainingAmount,
      paymentMethod: paymentMethod || 'Bank Transfer',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      transactionReference: transactionReference ? transactionReference.trim() : '',
      status: paymentStatus,
      notes: notes ? notes.trim() : '',
    });

    const populated = await Payment.findById(payment._id)
      .populate('project', 'projectTitle totalAmount progress status')
      .populate('customer', 'name email phone company');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      payment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in customer's payments
// @route   GET /api/payments/my
// @access  Private/Customer
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ customer: req.user._id })
      .populate('project', 'projectTitle totalAmount progress status expectedDeliveryDate')
      .sort({ paymentDate: -1, createdAt: -1 });

    const projects = await Project.find({ customer: req.user._id }).select(
      'projectTitle totalAmount status progress'
    );

    const totalProjectValue = projects.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    const totalPaid = payments
      .filter((p) => p.status !== 'refunded')
      .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
    const totalRemaining = Math.max(0, totalProjectValue - totalPaid);

    res.status(200).json({
      success: true,
      count: payments.length,
      summary: {
        totalProjectValue,
        totalPaid,
        totalRemaining,
      },
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res, next) => {
  try {
    const { projectId, customerId, status } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    if (customerId) filter.customer = customerId;
    if (status && status !== 'all') filter.status = status;

    const payments = await Payment.find(filter)
      .populate('project', 'projectTitle totalAmount progress status')
      .populate('customer', 'name email phone company')
      .sort({ paymentDate: -1, createdAt: -1 });

    const totalCollected = payments
      .filter((p) => p.status !== 'refunded')
      .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);

    res.status(200).json({
      success: true,
      count: payments.length,
      totalCollected,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a payment record (Admin)
// @route   PATCH /api/payments/:id
// @access  Private/Admin
const updatePayment = async (req, res, next) => {
  try {
    const { paidAmount, paymentMethod, paymentDate, status, notes, transactionReference } =
      req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    if (paidAmount !== undefined) payment.paidAmount = Number(paidAmount);
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (paymentDate) payment.paymentDate = new Date(paymentDate);
    if (notes !== undefined) payment.notes = notes.trim();
    if (transactionReference !== undefined) {
      payment.transactionReference = transactionReference.trim();
    }

    // Recalculate remaining balance based on project total and all non-refunded payments
    const otherPayments = await Payment.find({
      project: payment.project,
      _id: { $ne: payment._id },
      status: { $ne: 'refunded' },
    });

    const otherPaidSum = otherPayments.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    const cumulativePaid =
      status === 'refunded' ? otherPaidSum : otherPaidSum + Number(payment.paidAmount || 0);
    payment.remainingAmount = Math.max(0, Number(payment.totalAmount || 0) - cumulativePaid);

    if (status) {
      payment.status = status;
    } else {
      payment.status =
        payment.remainingAmount === 0 && payment.totalAmount > 0 ? 'paid' : 'partial';
    }

    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('project', 'projectTitle totalAmount progress status')
      .populate('customer', 'name email phone company');

    res.status(200).json({
      success: true,
      message: 'Payment record updated successfully.',
      payment: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  getMyPayments,
  getAllPayments,
  updatePayment,
};
