const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const { getJwtSecret } = require('./utils/jwt');
const { initSocketServer } = require('./utils/socket');
const { protect } = require('./middleware/authMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const {
  securityHeaders,
  mongoSanitize,
  createRateLimiter,
} = require('./middleware/securityMiddleware');
const ServiceRequest = require('./models/ServiceRequest');

const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const contactRoutes = require('./routes/contactRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Trust first proxy (Render, Railway, Nginx, Cloudflare) for secure cookies & client IP
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security headers
app.use(securityHeaders);

// Explicit CORS Allowlist (no arbitrary origins permitted)
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : Array.from(new Set([...configuredOrigins, ...devOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const corsErr = new Error(`Origin '${origin}' is not permitted by CORS allowlist.`);
      corsErr.statusCode = 403;
      return callback(corsErr);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token-Response'],
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(mongoSanitize);

// Rate Limiters
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many API requests from this IP, please try again in a few minutes.',
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Too many authentication attempts. Please wait 15 minutes and try again.',
});

const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many contact inquiries submitted recently. Please try again later.',
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/contact', contactLimiter);

// Protected Customer Document Delivery (Prevents unrestricted public access & path traversal)
const serveProtectedUpload = async (req, res, next) => {
  try {
    const safeFileName = path.basename(req.params.filename || '');
    if (!safeFileName || safeFileName.startsWith('.')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file reference.',
      });
    }

    const associatedRequest = await ServiceRequest.findOne({
      'attachments.fileName': safeFileName,
    }).select('customer attachments');

    if (!associatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Requested attachment was not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      associatedRequest.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this document.',
      });
    }

    const filePath = path.join(__dirname, 'uploads', safeFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Attachment file is not available on local storage.',
      });
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"`);
    return res.sendFile(filePath);
  } catch (error) {
    return next(error);
  }
};

app.get('/api/uploads/:filename', protect, serveProtectedUpload);
app.get('/uploads/:filename', protect, serveProtectedUpload);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    platform: 'Dynamic IT — Digital Agency Service Management & Project Tracking Platform',
    environment: process.env.NODE_ENV || 'development',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Optional Single-Server Production Static Frontend Hosting
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (
  (process.env.SERVE_FRONTEND === 'true' || process.env.NODE_ENV === 'production') &&
  fs.existsSync(path.join(frontendDistPath, 'index.html'))
) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/uploads') ||
      req.originalUrl.startsWith('/socket.io')
    ) {
      return next();
    }
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocketServer(httpServer, allowedOrigins);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify JWT secret requirements before starting
    getJwtSecret();

    await connectDB();

    // Auto-seed initial services and admin if database is empty (and sync service images)
    const ensureInitialData = require('./scripts/ensureSeed');
    await ensureInitialData();

    httpServer.listen(PORT, () => {
      console.log(
        `[Server] Dynamic IT Backend API + Socket.IO (${
          process.env.NODE_ENV || 'development'
        }) running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, httpServer, startServer };
