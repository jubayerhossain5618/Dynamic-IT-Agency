const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerDetails,
  toggleCustomerStatus,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getAllCustomers);
router.get('/:id', protect, authorize('admin'), getCustomerDetails);
router.patch('/:id/status', protect, authorize('admin'), toggleCustomerStatus);

module.exports = router;
