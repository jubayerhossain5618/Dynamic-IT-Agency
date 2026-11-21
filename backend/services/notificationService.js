const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

/**
 * Persists a notification in MongoDB and immediately emits it via Socket.IO
 * exclusively to the authorized recipient's private room (`user:<recipientId>`).
 */
const createNotification = async ({
  recipient,
  type,
  title,
  message,
  link = '',
  relatedId = null,
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      type,
      title: title.trim(),
      message: message.trim(),
      link,
      relatedId,
      isRead: false,
    });

    const io = getIO();
    if (io) {
      io.to(`user:${recipient.toString()}`).emit('notification:new', notification);
    }

    return notification;
  } catch (err) {
    console.warn('[NotificationService] Could not create notification:', err.message);
    return null;
  }
};

/**
 * Persists and emits a notification to all active administrators.
 */
const notifyAdmins = async ({ type, title, message, link = '', relatedId = null }) => {
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    const created = [];

    for (const admin of admins) {
      const n = await createNotification({
        recipient: admin._id,
        type,
        title,
        message,
        link,
        relatedId,
      });
      if (n) created.push(n);
    }

    return created;
  } catch (err) {
    console.warn('[NotificationService] Could not notify admins:', err.message);
    return [];
  }
};

module.exports = {
  createNotification,
  notifyAdmins,
};
