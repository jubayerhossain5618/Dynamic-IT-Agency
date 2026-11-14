const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'dynamic_it_university_project_jwt_secret_key_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const sendTokenCookie = (res, user, statusCode = 200, message = 'Authenticated successfully') => {
  const token = generateToken(user._id, user.role);

  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company || '',
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
};

module.exports = {
  generateToken,
  sendTokenCookie,
};
