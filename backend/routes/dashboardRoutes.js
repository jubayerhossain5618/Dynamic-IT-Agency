const express = require('express');
const router = express.Router();
const {
  getCustomerDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/customer', protect, authorize('customer', 'admin'), getCustomerDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
