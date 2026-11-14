const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMyMessages,
  getProjectMessages,
  markMessageAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/my', protect, getMyMessages);
router.get('/:projectId', protect, getProjectMessages);
router.patch('/:id/read', protect, markMessageAsRead);

module.exports = router;
