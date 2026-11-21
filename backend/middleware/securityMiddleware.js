/**
 * Production Security Middlewares:
 * 1. HTTP Security Headers (Helmet-equivalent)
 * 2. NoSQL Injection & Prototype Pollution Sanitizer
 * 3. Memory-safe IP Rate Limiter (for Auth, Contact & General API)
 */

const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i += 1) {
      obj[i] = sanitizeObject(obj[i]);
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (
      key.startsWith('$') ||
      key.includes('.') ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

const mongoSanitize = (req, _res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP, please try again later.',
} = {}) => {
  const hits = new Map();

  // Periodic cleanup of expired IP buckets
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Skip rate limit during automated local test suite runs if flagged
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const now = Date.now();
    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      hits.set(ip, record);
    }

    record.count += 1;

    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));

    if (record.count > max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
};

module.exports = {
  securityHeaders,
  mongoSanitize,
  createRateLimiter,
};
