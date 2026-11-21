const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenCookie } = require('../utils/jwt');
const {
  sendRegistrationEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../services/emailService');
const { sendSmsNotification } = require('../services/smsService');

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, company, password, confirmPassword, smsConsent } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and password.',
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const verificationToken = crypto.randomBytes(16).toString('hex');
    const hasSmsConsent = Boolean(smsConsent === true || smsConsent === 'true');

    // Security rule: Never allow public registration to assign admin role
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      company: company ? company.trim() : '',
      password,
      role: 'customer',
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notificationPreferences: {
        email: true,
        sms: hasSmsConsent,
        smsConsentAt: hasSmsConsent ? new Date() : null,
      },
    });

    // Send registration & email verification emails asynchronously
    const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    await sendRegistrationEmail(
      user,
      `${clientBase}/login?verifyToken=${verificationToken}`
    );
    await sendVerificationEmail(user, verificationToken);

    if (hasSmsConsent) {
      await sendSmsNotification({
        user,
        message: `Dynamic IT: Welcome ${user.name}! Your client portal account has been created.`,
        eventType: 'account_registration',
      });
    }

    return sendTokenCookie(req, res, user, 201, 'Customer account registered successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify customer email address
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.',
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token.trim(),
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your email address has been verified.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset token via email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      // Do not leak whether an email exists
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, password reset instructions have been sent.',
      });
    }

    const resetToken = crypto.randomBytes(16).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using valid token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findOne({
      passwordResetToken: token.trim(),
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    await sendSmsNotification({
      user,
      message: 'Dynamic IT Security Alert: Your account password was recently reset.',
      eventType: 'password_reset_alert',
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & set cookie
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact Dynamic IT support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    return sendTokenCookie(req, res, user, 200, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (_req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Update current user profile & notification preferences
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      company,
      currentPassword,
      newPassword,
      notificationPreferences,
    } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (company !== undefined) user.company = company.trim();

    if (notificationPreferences && typeof notificationPreferences === 'object') {
      if (!user.notificationPreferences) {
        user.notificationPreferences = { email: true, sms: false, smsConsentAt: null };
      }
      if (notificationPreferences.email !== undefined) {
        user.notificationPreferences.email = Boolean(notificationPreferences.email);
      }
      if (notificationPreferences.sms !== undefined) {
        const nextSms = Boolean(notificationPreferences.sms);
        user.notificationPreferences.sms = nextSms;
        user.notificationPreferences.smsConsentAt = nextSms
          ? user.notificationPreferences.smsConsentAt || new Date()
          : null;
      }
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide your current password to set a new password.',
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters.',
        });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile and preferences updated successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
};
