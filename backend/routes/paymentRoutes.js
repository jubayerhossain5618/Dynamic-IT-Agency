const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getMyPayments,
  getAllPayments,
  updatePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), recordPayment);
router.get('/my', protect, authorize('customer', 'admin'), getMyPayments);
router.get('/', protect, authorize('admin'), getAllPayments);
router.patch('/:id', protect, authorize('admin'), updatePayment);

module.exports = router;
