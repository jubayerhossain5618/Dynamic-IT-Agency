const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAllContactMessages,
  updateContactStatus,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', submitContactMessage);
router.get('/', protect, authorize('admin'), getAllContactMessages);
router.patch('/:id', protect, authorize('admin'), updateContactStatus);

module.exports = router;
