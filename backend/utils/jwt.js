const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      'FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing or too short. Set a strong secret in backend/.env.'
    );
  }
  if (process.env.NODE_ENV === 'production' && secret.trim().length < 32) {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET must be at least 32 characters long in production.'
    );
  }
  return secret.trim();
};

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenCookie = (
  req,
  res,
  user,
  statusCode = 200,
  message = 'Authenticated successfully'
) => {
  const token = generateToken(user._id, user.role);
  const isProd = process.env.NODE_ENV === 'production';
  const sameSiteMode = process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax');

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd || sameSiteMode === 'none',
    sameSite: sameSiteMode,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const responsePayload = {
    success: true,
    message,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company || '',
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: Boolean(user.isEmailVerified),
      notificationPreferences: user.notificationPreferences || {
        email: true,
        sms: false,
        smsConsentAt: null,
      },
      createdAt: user.createdAt,
    },
  };

  // Only include raw token when explicitly requested by a non-browser API client header
  if (req && req.headers && req.headers['x-auth-token-response'] === 'true') {
    responsePayload.token = token;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  getJwtSecret,
  generateToken,
  sendTokenCookie,
};
