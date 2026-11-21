const express = require('express');
const router = express.Router();
const {
  recordPayment,
  initiateGatewayCheckout,
  verifyGatewayCheckout,
  getMyPayments,
  getAllPayments,
  updatePayment,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), recordPayment);
router.post('/gateway/initiate', protect, authorize('customer', 'admin'), initiateGatewayCheckout);
router.post('/gateway/verify', protect, authorize('customer', 'admin'), verifyGatewayCheckout);
router.get('/my', protect, authorize('customer', 'admin'), getMyPayments);
router.get('/', protect, authorize('admin'), getAllPayments);
router.patch('/:id', protect, authorize('admin'), updatePayment);

module.exports = router;
