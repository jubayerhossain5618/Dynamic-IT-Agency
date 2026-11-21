const express = require('express');
const router = express.Router();
const {
  createQuotation,
  getAllQuotations,
  getMyQuotations,
  getQuotationById,
  respondToQuotation,
  updateQuotation,
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createQuotation);
router.get('/', protect, authorize('admin'), getAllQuotations);
router.get('/my', protect, authorize('customer', 'admin'), getMyQuotations);
router.get('/:id', protect, getQuotationById);
router.put('/:id', protect, authorize('admin'), updateQuotation);
router.patch('/:id/respond', protect, authorize('customer'), respondToQuotation);

module.exports = router;
