const Payment = require('../models/Payment');
const Project = require('../models/Project');
const { createNotification, notifyAdmins } = require('../services/notificationService');
const { sendPaymentConfirmationEmail } = require('../services/emailService');
const { sendSmsNotification } = require('../services/smsService');
const {
  initiateBkashPayment,
  verifyBkashPayment,
  initiateNagadPayment,
  verifyNagadPayment,
} = require('../services/paymentGatewayService');

const VALID_PAID_STATUSES = ['partial', 'paid'];

const computeProjectPaidTotal = async (projectId, excludePaymentId = null) => {
  const query = {
    project: projectId,
    status: { $in: VALID_PAID_STATUSES },
  };
  if (excludePaymentId) {
    query._id = { $ne: excludePaymentId };
  }
  const existingPayments = await Payment.find(query);
  return existingPayments.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
};

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
      allowAdjustment,
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

    // Duplicate transaction reference prevention
    const trimmedRef = transactionReference ? transactionReference.trim() : '';
    if (trimmedRef) {
      const duplicateTrx = await Payment.findOne({
        transactionReference: trimmedRef,
        status: { $in: VALID_PAID_STATUSES },
      });
      if (duplicateTrx) {
        return res.status(400).json({
          success: false,
          message: `Duplicate transaction reference '${trimmedRef}'. This transaction has already been recorded.`,
        });
      }
    }

    const previouslyPaid = await computeProjectPaidTotal(foundProject._id);
    const cumulativePaid = previouslyPaid + amountNum;
    const totalAmount = Number(foundProject.totalAmount || 0);

    // Business Rule 8: Prevent total payments from exceeding agreed project amount
    if (cumulativePaid > totalAmount && allowAdjustment !== true) {
      const maxAllowed = Math.max(0, totalAmount - previouslyPaid);
      return res.status(400).json({
        success: false,
        message: `Payment amount (৳${amountNum.toLocaleString()}) exceeds the remaining project balance of ৳${maxAllowed.toLocaleString()}.`,
      });
    }

    const remainingAmount = Math.max(0, totalAmount - cumulativePaid);
    const paymentStatus = remainingAmount === 0 && totalAmount > 0 ? 'paid' : 'partial';

    const payment = await Payment.create({
      project: foundProject._id,
      customer: foundProject.customer,
      totalAmount,
      paidAmount: amountNum,
      remainingAmount,
      paymentMethod: paymentMethod || 'Bank Transfer',
      gateway: 'manual',
      gatewayStatus: 'verified',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      transactionReference: trimmedRef,
      status: paymentStatus,
      notes: notes ? notes.trim() : '',
    });

    const populated = await Payment.findById(payment._id)
      .populate('project', 'projectTitle totalAmount progress status')
      .populate('customer', 'name email phone company notificationPreferences');

    await createNotification({
      recipient: foundProject.customer,
      type: 'payment_confirmation',
      title: `Payment Recorded: ৳${amountNum.toLocaleString()}`,
      message: `A payment of ৳${amountNum.toLocaleString()} (${payment.paymentMethod}) was recorded for "${foundProject.projectTitle}". Remaining balance: ৳${remainingAmount.toLocaleString()}.`,
      link: '/customer/payments',
      relatedId: payment._id,
    });

    if (populated.customer) {
      await sendPaymentConfirmationEmail(
        populated.customer,
        payment,
        foundProject.projectTitle
      );
      await sendSmsNotification({
        user: populated.customer,
        message: `Dynamic IT: Payment of BDT ${amountNum.toLocaleString()} confirmed for "${foundProject.projectTitle}". Remaining: BDT ${remainingAmount.toLocaleString()}.`,
        eventType: 'payment_confirmation',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      payment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate bKash or Nagad gateway payment from the backend
// @route   POST /api/payments/gateway/initiate
// @access  Private (Project Owner Customer or Admin)
const initiateGatewayCheckout = async (req, res, next) => {
  try {
    const { projectId, gateway, amount } = req.body;

    if (!projectId || !gateway || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, gateway (bkash or nagad), and payment amount are required.',
      });
    }

    const normalizedGateway = String(gateway).toLowerCase().trim();
    if (!['bkash', 'nagad'].includes(normalizedGateway)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported gateway. Choose 'bkash' or 'nagad'.",
      });
    }

    const foundProject = await Project.findById(projectId);
    if (!foundProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      foundProject.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to initiate a payment for this project.',
      });
    }

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero.',
      });
    }

    const previouslyPaid = await computeProjectPaidTotal(foundProject._id);
    const totalAmount = Number(foundProject.totalAmount || 0);
    const remainingBefore = Math.max(0, totalAmount - previouslyPaid);

    if (remainingBefore <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This project is already paid in full.',
      });
    }

    if (amountNum > remainingBefore) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (৳${amountNum.toLocaleString()}) cannot exceed remaining project balance of ৳${remainingBefore.toLocaleString()}.`,
      });
    }

    const invoiceNumber = `INV-${foundProject._id.toString().slice(-6).toUpperCase()}-${Date.now()}`;
    const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const callbackUrl = `${clientBase}/customer/payments`;

    const session =
      normalizedGateway === 'bkash'
        ? await initiateBkashPayment({
            projectId: foundProject._id,
            customerId: foundProject.customer,
            amount: amountNum,
            invoiceNumber,
            callbackUrl,
          })
        : await initiateNagadPayment({
            projectId: foundProject._id,
            customerId: foundProject.customer,
            amount: amountNum,
            invoiceNumber,
            callbackUrl,
          });

    const pendingPayment = await Payment.create({
      project: foundProject._id,
      customer: foundProject.customer,
      totalAmount,
      paidAmount: amountNum,
      remainingAmount: remainingBefore,
      paymentMethod: normalizedGateway === 'bkash' ? 'bKash' : 'Nagad',
      gateway: normalizedGateway,
      gatewayPaymentId: session.gatewayPaymentId,
      gatewayStatus: 'initiated',
      status: 'pending',
      notes: `${normalizedGateway.toUpperCase()} checkout initiated (${invoiceNumber})`,
    });

    res.status(201).json({
      success: true,
      message: `${normalizedGateway.toUpperCase()} payment session initiated.`,
      paymentRecordId: pendingPayment._id,
      gateway: normalizedGateway,
      mode: session.mode,
      gatewayPaymentId: session.gatewayPaymentId,
      checkoutUrl: session.checkoutUrl,
      verificationToken: session.verificationToken || null,
      amount: amountNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify and complete bKash or Nagad gateway payment on the backend
// @route   POST /api/payments/gateway/verify
// @access  Private (Project Owner Customer or Admin)
const verifyGatewayCheckout = async (req, res, next) => {
  try {
    const {
      paymentRecordId,
      gatewayPaymentId,
      verificationToken,
      outcome = 'success',
      customTrxId,
    } = req.body;

    if (!paymentRecordId && !gatewayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment record ID or gateway payment ID is required for verification.',
      });
    }

    const payment = paymentRecordId
      ? await Payment.findById(paymentRecordId)
      : await Payment.findOne({ gatewayPaymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Gateway payment session not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      payment.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this payment session.',
      });
    }

    if (payment.gatewayStatus === 'verified' || VALID_PAID_STATUSES.includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: 'This payment session has already been verified and processed.',
      });
    }

    const verification =
      payment.gateway === 'bkash'
        ? await verifyBkashPayment({
            gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
            verificationToken,
            outcome,
            customTrxId,
          })
        : await verifyNagadPayment({
            gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
            verificationToken,
            outcome,
            customTrxId,
          });

    if (!verification.verified) {
      payment.gatewayStatus = verification.status || 'failed';
      payment.status = verification.status === 'cancelled' ? 'cancelled' : 'failed';
      payment.notes = verification.message || 'Gateway checkout did not complete.';
      await payment.save();

      return res.status(400).json({
        success: false,
        status: payment.status,
        message: verification.message || 'Payment verification failed.',
        payment,
      });
    }

    // Duplicate transaction ID check
    const existingTrx = await Payment.findOne({
      transactionReference: verification.transactionReference,
      _id: { $ne: payment._id },
      status: { $in: VALID_PAID_STATUSES },
    });

    if (existingTrx) {
      payment.gatewayStatus = 'failed';
      payment.status = 'failed';
      payment.notes = `Rejected duplicate transaction reference: ${verification.transactionReference}`;
      await payment.save();

      return res.status(400).json({
        success: false,
        message: `Duplicate transaction ID '${verification.transactionReference}' rejected.`,
      });
    }

    const foundProject = await Project.findById(payment.project);
    const previouslyPaid = await computeProjectPaidTotal(payment.project, payment._id);
    const totalAmount = Number(foundProject?.totalAmount || payment.totalAmount || 0);
    const cumulativePaid = previouslyPaid + Number(payment.paidAmount || 0);

    if (cumulativePaid > totalAmount) {
      payment.gatewayStatus = 'failed';
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({
        success: false,
        message: 'Verified payment exceeds remaining project balance.',
      });
    }

    const remainingAmount = Math.max(0, totalAmount - cumulativePaid);
    payment.remainingAmount = remainingAmount;
    payment.transactionReference = verification.transactionReference;
    payment.gatewayStatus = 'verified';
    payment.status = remainingAmount === 0 && totalAmount > 0 ? 'paid' : 'partial';
    payment.paymentDate = new Date();
    payment.notes = `Verified ${payment.paymentMethod} transaction (${verification.transactionReference})`;
    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('project', 'projectTitle totalAmount progress status')
      .populate('customer', 'name email phone company notificationPreferences');

    const projectTitle = populated.project?.projectTitle || 'Digital Project';

    await createNotification({
      recipient: payment.customer,
      type: 'payment_confirmation',
      title: `${payment.paymentMethod} Payment Confirmed: ৳${Number(payment.paidAmount).toLocaleString()}`,
      message: `Transaction ${payment.transactionReference} verified for "${projectTitle}". Remaining balance: ৳${remainingAmount.toLocaleString()}.`,
      link: '/customer/payments',
      relatedId: payment._id,
    });

    await notifyAdmins({
      type: 'payment_confirmation',
      title: `New ${payment.paymentMethod} Payment: ৳${Number(payment.paidAmount).toLocaleString()}`,
      message: `${populated.customer?.name || 'Customer'} completed a ${payment.paymentMethod} payment (${payment.transactionReference}) for "${projectTitle}".`,
      link: '/admin/payments',
      relatedId: payment._id,
    });

    if (populated.customer) {
      await sendPaymentConfirmationEmail(populated.customer, payment, projectTitle);
      await sendSmsNotification({
        user: populated.customer,
        message: `Dynamic IT: ${payment.paymentMethod} payment of BDT ${Number(payment.paidAmount).toLocaleString()} (TrxID: ${payment.transactionReference}) verified.`,
        eventType: 'payment_confirmation',
      });
    }

    res.status(200).json({
      success: true,
      message: `${payment.paymentMethod} payment verified and recorded successfully.`,
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
      .filter((p) => VALID_PAID_STATUSES.includes(p.status))
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
      .filter((p) => VALID_PAID_STATUSES.includes(p.status))
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

    const otherPaidSum = await computeProjectPaidTotal(payment.project, payment._id);

    const isInvalidated = ['refunded', 'failed', 'cancelled', 'pending'].includes(status);
    const cumulativePaid = isInvalidated
      ? otherPaidSum
      : otherPaidSum + Number(payment.paidAmount || 0);

    if (
      !isInvalidated &&
      cumulativePaid > Number(payment.totalAmount || 0) &&
      req.body.allowAdjustment !== true
    ) {
      return res.status(400).json({
        success: false,
        message: 'Updated payment amount exceeds total project cost.',
      });
    }

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
  initiateGatewayCheckout,
  verifyGatewayCheckout,
  getMyPayments,
  getAllPayments,
  updatePayment,
};
