const User = require('../models/User');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Quotation = require('../models/Quotation');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Message = require('../models/Message');
const ContactMessage = require('../models/ContactMessage');

// @desc    Get real dashboard statistics and recent items for Customer
// @route   GET /api/dashboard/customer
// @access  Private/Customer
const getCustomerDashboard = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const [requests, quotations, projects, payments, unreadMessages] = await Promise.all([
      ServiceRequest.find({ customer: customerId })
        .populate('service', 'title slug category iconName')
        .sort({ createdAt: -1 }),
      Quotation.find({ customer: customerId })
        .populate({
          path: 'request',
          select: 'projectTitle service',
          populate: { path: 'service', select: 'title slug' },
        })
        .sort({ createdAt: -1 }),
      Project.find({ customer: customerId })
        .populate('quotation', 'amount estimatedDays')
        .populate({
          path: 'request',
          select: 'projectTitle service',
          populate: { path: 'service', select: 'title slug' },
        })
        .sort({ updatedAt: -1 }),
      Payment.find({ customer: customerId })
        .populate('project', 'projectTitle totalAmount')
        .sort({ paymentDate: -1 }),
      Message.countDocuments({ receiver: customerId, isRead: false }),
    ]);

    const pendingQuotations = quotations.filter((q) => q.status === 'pending').length;
    const activeProjects = projects.filter((p) =>
      ['not_started', 'in_progress', 'on_hold'].includes(p.status)
    ).length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    const totalProjectValue = projects.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    const totalPaid = payments
      .filter((pay) => ['partial', 'paid'].includes(pay.status))
      .reduce((sum, pay) => sum + Number(pay.paidAmount || 0), 0);
    const remainingBalance = Math.max(0, totalProjectValue - totalPaid);

    // Build chronological recent activities from actual database events
    const activities = [];

    requests.slice(0, 4).forEach((r) => {
      activities.push({
        id: `req-${r._id}`,
        type: 'request',
        title: `Submitted request: "${r.projectTitle}"`,
        subtitle: `Service: ${r.service?.title || 'Digital Service'} • Status: ${r.status.replace('_', ' ')}`,
        timestamp: r.createdAt,
      });
    });

    quotations.slice(0, 4).forEach((q) => {
      activities.push({
        id: `quo-${q._id}`,
        type: 'quotation',
        title: `Quotation #${q._id.toString().slice(-6).toUpperCase()} (${q.status.toUpperCase()})`,
        subtitle: `Amount: ৳${Number(q.amount).toLocaleString()} • Delivery: ${q.estimatedDays} days`,
        timestamp: q.respondedAt || q.createdAt,
      });
    });

    projects.slice(0, 4).forEach((p) => {
      activities.push({
        id: `proj-${p._id}`,
        type: 'project',
        title: `Project "${p.projectTitle}" at ${p.progress}% completion`,
        subtitle: `Current status: ${p.status.replace('_', ' ')}`,
        timestamp: p.updatedAt,
      });
    });

    payments.slice(0, 4).forEach((pay) => {
      activities.push({
        id: `pay-${pay._id}`,
        type: 'payment',
        title: `Payment recorded: ৳${Number(pay.paidAmount).toLocaleString()}`,
        subtitle: `${pay.paymentMethod} • Remaining: ৳${Number(pay.remainingAmount).toLocaleString()}`,
        timestamp: pay.paymentDate || pay.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      stats: {
        totalRequests: requests.length,
        pendingQuotations,
        activeProjects,
        completedProjects,
        totalProjectValue,
        totalPaid,
        remainingBalance,
        unreadMessages,
      },
      recentRequests: requests.slice(0, 5),
      recentQuotations: quotations.slice(0, 5),
      recentProjects: projects.slice(0, 5),
      recentPayments: payments.slice(0, 5),
      recentActivities: activities.slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real dashboard statistics and analytics for Admin
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboard = async (_req, res, next) => {
  try {
    const [
      totalCustomers,
      totalServices,
      requests,
      quotations,
      projects,
      payments,
      unreadContacts,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Service.countDocuments({ isActive: true }),
      ServiceRequest.find()
        .populate('customer', 'name email company')
        .populate('service', 'title category')
        .sort({ createdAt: -1 }),
      Quotation.find().sort({ createdAt: -1 }),
      Project.find()
        .populate('customer', 'name email company')
        .sort({ updatedAt: -1 }),
      Payment.find({ status: { $in: ['partial', 'paid'] } })
        .populate('customer', 'name email')
        .populate('project', 'projectTitle')
        .sort({ paymentDate: -1 }),
      ContactMessage.countDocuments({ status: 'new' }),
    ]);

    const pendingRequests = requests.filter((r) =>
      ['pending', 'under_review'].includes(r.status)
    ).length;
    const pendingQuotations = quotations.filter((q) => q.status === 'pending').length;
    const acceptedQuotations = quotations.filter((q) => q.status === 'accepted').length;
    const activeProjects = projects.filter((p) =>
      ['not_started', 'in_progress', 'on_hold'].includes(p.status)
    ).length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    const totalRecordedPayments = payments.reduce(
      (sum, pay) => sum + Number(pay.paidAmount || 0),
      0
    );
    const totalContractedValue = projects.reduce(
      (sum, proj) => sum + Number(proj.totalAmount || 0),
      0
    );
    const totalReceivables = Math.max(0, totalContractedValue - totalRecordedPayments);

    // Chart data: Requests by service category
    const serviceDemandMap = {};
    requests.forEach((r) => {
      const label = r.service?.title || 'Other';
      serviceDemandMap[label] = (serviceDemandMap[label] || 0) + 1;
    });
    const serviceDemandChart = Object.entries(serviceDemandMap).map(([name, count]) => ({
      name: name.length > 20 ? `${name.slice(0, 18)}…` : name,
      fullName: name,
      requests: count,
    }));

    // Chart data: Project status breakdown
    const projectStatusChart = [
      {
        name: 'In Progress',
        value: projects.filter((p) => p.status === 'in_progress').length,
      },
      {
        name: 'Completed',
        value: completedProjects,
      },
      {
        name: 'Not Started',
        value: projects.filter((p) => p.status === 'not_started').length,
      },
      {
        name: 'On Hold',
        value: projects.filter((p) => p.status === 'on_hold').length,
      },
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalServices,
        totalRequests: requests.length,
        pendingRequests,
        totalQuotations: quotations.length,
        pendingQuotations,
        acceptedQuotations,
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalRecordedPayments,
        totalContractedValue,
        totalReceivables,
        paymentRecordCount: payments.length,
        unreadContacts,
      },
      charts: {
        serviceDemandChart,
        projectStatusChart,
      },
      recentRequests: requests.slice(0, 6),
      recentProjects: projects.slice(0, 6),
      recentPayments: payments.slice(0, 6),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerDashboard,
  getAdminDashboard,
};
