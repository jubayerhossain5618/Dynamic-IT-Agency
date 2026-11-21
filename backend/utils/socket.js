const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Message = require('../models/Message');
const { getJwtSecret } = require('./jwt');

let ioInstance = null;
const onlineUserSockets = new Map(); // userId -> Set<socketId>

const parseCookieToken = (cookieHeader = '') => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [k, v] = part.trim().split('=');
    if (k === 'token' && v) {
      return decodeURIComponent(v);
    }
  }
  return null;
};

const addOnlineSocket = (userId, socketId) => {
  const key = userId.toString();
  if (!onlineUserSockets.has(key)) {
    onlineUserSockets.set(key, new Set());
  }
  onlineUserSockets.get(key).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const key = userId.toString();
  const set = onlineUserSockets.get(key);
  if (set) {
    set.delete(socketId);
    if (set.size === 0) {
      onlineUserSockets.delete(key);
    }
  }
};

const getOnlineUserIds = () => Array.from(onlineUserSockets.keys());

const initSocketServer = (httpServer, allowedOrigins = []) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by Socket.IO CORS'));
      },
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookieToken = parseCookieToken(socket.handshake.headers?.cookie);
      const authToken =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.split(' ')[1]
          : null);

      const token = cookieToken || authToken;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User invalid or inactive'));
      }

      socket.user = user;
      return next();
    } catch (_err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    addOnlineSocket(userId, socket.id);

    // Join personal user room for targeted real-time notifications
    socket.join(`user:${userId}`);
    if (socket.user.role === 'admin') {
      socket.join('role:admin');
    }

    // Broadcast updated online user presence list
    io.emit('presence:online_users', getOnlineUserIds());

    // Join a specific project conversation room with strict ownership check
    socket.on('project:join', async (payload, callback) => {
      try {
        const projectId = typeof payload === 'string' ? payload : payload?.projectId;
        if (!projectId) {
          if (typeof callback === 'function') {
            callback({ success: false, status: 400, message: 'Project ID is required.' });
          }
          return;
        }

        const project = await Project.findById(projectId).select('customer projectTitle');
        if (!project) {
          if (typeof callback === 'function') {
            callback({ success: false, status: 404, message: 'Project not found.' });
          }
          return;
        }

        if (
          socket.user.role !== 'admin' &&
          project.customer.toString() !== userId
        ) {
          if (typeof callback === 'function') {
            callback({
              success: false,
              status: 403,
              message: 'Unauthorized: You cannot access another customer project room.',
            });
          }
          return;
        }

        socket.join(`project:${project._id.toString()}`);
        if (typeof callback === 'function') {
          callback({
            success: true,
            room: `project:${project._id.toString()}`,
          });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ success: false, status: 500, message: err.message });
        }
      }
    });

    socket.on('project:leave', (payload) => {
      const projectId = typeof payload === 'string' ? payload : payload?.projectId;
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    // Real-time chat message sending with MongoDB persistence & ownership validation
    socket.on('chat:send_message', async (payload, callback) => {
      try {
        const { projectId, message } = payload || {};
        if (!projectId || !message || !String(message).trim()) {
          if (typeof callback === 'function') {
            callback({
              success: false,
              status: 400,
              message: 'Project ID and non-empty message are required.',
            });
          }
          return;
        }

        const project = await Project.findById(projectId);
        if (!project) {
          if (typeof callback === 'function') {
            callback({ success: false, status: 404, message: 'Project not found.' });
          }
          return;
        }

        if (
          socket.user.role !== 'admin' &&
          project.customer.toString() !== userId
        ) {
          if (typeof callback === 'function') {
            callback({
              success: false,
              status: 403,
              message: 'Unauthorized to send messages in this project.',
            });
          }
          return;
        }

        let targetReceiverId = null;
        if (socket.user.role === 'customer') {
          const adminUser = await User.findOne({ role: 'admin', isActive: true });
          targetReceiverId = adminUser ? adminUser._id : null;
        } else {
          targetReceiverId = project.customer;
        }

        if (!targetReceiverId) {
          if (typeof callback === 'function') {
            callback({
              success: false,
              status: 404,
              message: 'Recipient user not found.',
            });
          }
          return;
        }

        const savedMsg = await Message.create({
          sender: socket.user._id,
          receiver: targetReceiverId,
          project: project._id,
          request: project.request,
          message: String(message).trim().slice(0, 2000),
          isRead: false,
        });

        const populated = await Message.findById(savedMsg._id)
          .populate('sender', 'name email role')
          .populate('receiver', 'name email role')
          .populate('project', 'projectTitle status progress');

        const roomName = `project:${project._id.toString()}`;
        io.to(roomName)
          .to(`user:${targetReceiverId.toString()}`)
          .to(`user:${userId}`)
          .emit('chat:new_message', populated);

        // Also create a real-time notification for the recipient
        const { createNotification } = require('../services/notificationService');
        await createNotification({
          recipient: targetReceiverId,
          type: 'new_message',
          title: `New message on "${project.projectTitle}"`,
          message: `${socket.user.name}: ${String(message).trim().slice(0, 120)}`,
          link:
            socket.user.role === 'admin'
              ? `/customer/messages?projectId=${project._id}`
              : `/admin/messages?projectId=${project._id}`,
          relatedId: project._id,
        });

        if (typeof callback === 'function') {
          callback({ success: true, data: populated });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ success: false, status: 500, message: err.message });
        }
      }
    });

    socket.on('disconnect', () => {
      removeOnlineSocket(userId, socket.id);
      io.emit('presence:online_users', getOnlineUserIds());
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => ioInstance;

module.exports = {
  initSocketServer,
  getIO,
  getOnlineUserIds,
};
