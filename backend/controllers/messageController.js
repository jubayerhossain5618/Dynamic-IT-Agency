const Message = require('../models/Message');
const Project = require('../models/Project');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

// @desc    Send a message related to a project or request
// @route   POST /api/messages
// @access  Private (Customer or Admin)
const sendMessage = async (req, res, next) => {
  try {
    const { receiver, receiverId, project, projectId, request, requestId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    const targetProjectId = project || projectId || null;
    const targetRequestId = request || requestId || null;
    let targetReceiverId = receiver || receiverId || null;

    let foundProject = null;
    let foundRequest = null;

    if (targetProjectId) {
      foundProject = await Project.findById(targetProjectId);
      if (!foundProject) {
        return res.status(404).json({
          success: false,
          message: 'Referenced project not found.',
        });
      }

      if (
        req.user.role !== 'admin' &&
        foundProject.customer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to send messages for this project.',
        });
      }
    }

    if (targetRequestId) {
      foundRequest = await ServiceRequest.findById(targetRequestId);
      if (!foundRequest) {
        return res.status(404).json({
          success: false,
          message: 'Referenced service request not found.',
        });
      }

      if (
        req.user.role !== 'admin' &&
        foundRequest.customer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to send messages for this service request.',
        });
      }
    }

    // Automatically determine receiver if not explicitly passed
    if (!targetReceiverId) {
      if (req.user.role === 'customer') {
        const adminUser = await User.findOne({ role: 'admin', isActive: true });
        if (!adminUser) {
          return res.status(404).json({
            success: false,
            message: 'No active administrator found to receive message.',
          });
        }
        targetReceiverId = adminUser._id;
      } else {
        // Sender is admin
        if (foundProject) {
          targetReceiverId = foundProject.customer;
        } else if (foundRequest) {
          targetReceiverId = foundRequest.customer;
        }
      }
    }

    if (!targetReceiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver user ID, project ID, or request ID is required.',
      });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: targetReceiverId,
      project: foundProject ? foundProject._id : null,
      request: foundRequest ? foundRequest._id : foundProject ? foundProject.request : null,
      message: message.trim(),
      isRead: false,
    });

    const populated = await Message.findById(newMessage._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('project', 'projectTitle status progress')
      .populate('request', 'projectTitle status');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for the logged-in user (or all messages for Admin)
// @route   GET /api/messages/my
// @access  Private
const getMyMessages = async (req, res, next) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : {
            $or: [{ sender: req.user._id }, { receiver: req.user._id }],
          };

    const messages = await Message.find(filter)
      .populate('sender', 'name email role company')
      .populate('receiver', 'name email role company')
      .populate('project', 'projectTitle status progress customer')
      .populate('request', 'projectTitle status customer')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a specific project
// @route   GET /api/messages/:projectId
// @access  Private (Project Owner Customer or Admin)
const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      project.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages for this project.',
      });
    }

    const messages = await Message.find({ project: project._id })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: 1 });

    // Mark unread messages addressed to current user as read
    await Message.updateMany(
      {
        project: project._id,
        receiver: req.user._id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a message as read
// @route   PATCH /api/messages/:id/read
// @access  Private
const markMessageAsRead = async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      msg.receiver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message.',
      });
    }

    msg.isRead = true;
    await msg.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read.',
      data: msg,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMyMessages,
  getProjectMessages,
  markMessageAsRead,
};
