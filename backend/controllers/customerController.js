const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const Payment = require('../models/Payment');

// @desc    Get all customers with statistics (Admin)
// @route   GET /api/customers
// @access  Private/Admin
const getAllCustomers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { role: 'customer' };

    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(filter).select('-password').sort({ createdAt: -1 });
    const customerIds = customers.map((c) => c._id);

    const [requests, projects, payments] = await Promise.all([
      ServiceRequest.find({ customer: { $in: customerIds } }).select('customer status'),
      Project.find({ customer: { $in: customerIds } }).select('customer status totalAmount progress'),
      Payment.find({ customer: { $in: customerIds }, status: { $ne: 'refunded' } }).select(
        'customer paidAmount'
      ),
    ]);

    const statsMap = {};
    customerIds.forEach((id) => {
      statsMap[id.toString()] = {
        requestCount: 0,
        projectCount: 0,
        activeProjects: 0,
        totalPaid: 0,
      };
    });

    requests.forEach((r) => {
      const cid = r.customer.toString();
      if (statsMap[cid]) statsMap[cid].requestCount += 1;
    });

    projects.forEach((p) => {
      const cid = p.customer.toString();
      if (statsMap[cid]) {
        statsMap[cid].projectCount += 1;
        if (['not_started', 'in_progress', 'on_hold'].includes(p.status)) {
          statsMap[cid].activeProjects += 1;
        }
      }
    });

    payments.forEach((pay) => {
      const cid = pay.customer.toString();
      if (statsMap[cid]) {
        statsMap[cid].totalPaid += Number(pay.paidAmount || 0);
      }
    });

    const enriched = customers.map((c) => ({
      ...c.toObject(),
      stats: statsMap[c._id.toString()] || {
        requestCount: 0,
        projectCount: 0,
        activeProjects: 0,
        totalPaid: 0,
      },
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      customers: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer profile, requests, quotations, projects, payments (Admin)
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    const [requests, quotations, projects, payments] = await Promise.all([
      ServiceRequest.find({ customer: customer._id })
        .populate('service', 'title slug category')
        .sort({ createdAt: -1 }),
      Quotation.find({ customer: customer._id })
        .populate('request', 'projectTitle')
        .sort({ createdAt: -1 }),
      Project.find({ customer: customer._id }).sort({ createdAt: -1 }),
      Payment.find({ customer: customer._id })
        .populate('project', 'projectTitle')
        .sort({ paymentDate: -1 }),
    ]);

    res.status(200).json({
      success: true,
      customer,
      requests,
      quotations,
      projects,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate customer account (Admin)
// @route   PATCH /api/customers/:id/status
// @access  Private/Admin
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const customer = await User.findById(req.params.id).select('-password');

    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found.',
      });
    }

    customer.isActive = isActive !== undefined ? Boolean(isActive) : !customer.isActive;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer account has been ${customer.isActive ? 'activated' : 'deactivated'}.`,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerDetails,
  toggleCustomerStatus,
};
