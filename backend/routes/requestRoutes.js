const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getMyServiceRequests,
  getAllServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.post(
  '/',
  protect,
  authorize('customer', 'admin'),
  upload.array('attachments', 5),
  createServiceRequest
);
router.get('/my', protect, authorize('customer', 'admin'), getMyServiceRequests);
router.get('/', protect, authorize('admin'), getAllServiceRequests);
router.get('/:id', protect, getServiceRequestById);
router.patch('/:id/status', protect, authorize('admin'), updateServiceRequestStatus);

module.exports = router;
