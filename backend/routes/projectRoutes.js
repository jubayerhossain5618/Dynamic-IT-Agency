const express = require('express');
const router = express.Router();
const {
  createProject,
  getMyProjects,
  getAllProjects,
  getProjectById,
  updateProjectProgress,
  updateProjectStatus,
  addMilestone,
  updateMilestoneStatus,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createProject);
router.get('/my', protect, authorize('customer', 'admin'), getMyProjects);
router.get('/', protect, authorize('admin'), getAllProjects);
router.get('/:id', protect, getProjectById);
router.patch('/:id/progress', protect, authorize('admin'), updateProjectProgress);
router.patch('/:id/status', protect, authorize('admin'), updateProjectStatus);
router.post('/:id/milestones', protect, authorize('admin'), addMilestone);
router.patch('/:id/milestones/:milestoneId', protect, authorize('admin'), updateMilestoneStatus);

module.exports = router;
