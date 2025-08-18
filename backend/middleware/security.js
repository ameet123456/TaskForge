import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { body, validationResult } from 'express-validator';
import logger from '../config/logger.js';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.google.com", "https://accounts.google.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable if causing issues with OAuth
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  contentTypeOptions: true,
  dnsPrefetchControl: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024, // Only compress if size > 1KB
});

// Request size limiting
export const requestSizeLimit = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    logger.warn('Request size exceeded limit', {
      size: req.headers['content-length'],
      maxSize,
      ip: req.ip,
      path: req.path
    });
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  next();
};

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/ready' || req.path === '/metrics';
  }
});

// Stricter rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      email: req.body?.email
    });
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: 900
    });
  }
});

// IP-based brute force protection for failed logins
const failedLogins = new Map();

export const bruteForceProtection = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;
  
  // Clean old entries
  for (const [key, data] of failedLogins.entries()) {
    if (now - data.firstAttempt > windowMs) {
      failedLogins.delete(key);
    }
  }
  
  const attempts = failedLogins.get(ip) || { count: 0, firstAttempt: now };
  
  if (attempts.count >= maxAttempts) {
    logger.warn('Brute force protection triggered', {
      ip,
      attempts: attempts.count,
      path: req.path
    });
    return res.status(429).json({
      success: false,
      message: 'Too many failed attempts. Please try again later.',
      retryAfter: Math.ceil((windowMs - (now - attempts.firstAttempt)) / 1000)
    });
  }
  
  // Store failed attempt in res.locals for use in auth controllers
  res.locals.recordFailedAttempt = () => {
    attempts.count += 1;
    attempts.firstAttempt = attempts.firstAttempt || now;
    failedLogins.set(ip, attempts);
  };
  
  // Clear attempts on successful login
  res.locals.clearFailedAttempts = () => {
    failedLogins.delete(ip);
  };
  
  next();
};

// Input validation middleware
export const validateInput = (req, res, next) => {
  // Sanitize common XSS patterns
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload/gi, '')
      .replace(/onerror/gi, '')
      .replace(/onclick/gi, '');
  };

  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };

  // Sanitize request body, query, and params
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// Validation rules for different endpoints
export const validateRegistration = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email too long'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['member', 'team_lead', 'admin'])
    .withMessage('Role must be member, team_lead, or admin')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password length invalid')
];

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors', {
      errors: errors.array(),
      ip: req.ip,
      path: req.path,
      body: JSON.stringify(req.body).substring(0, 200)
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// CSRF protection for state-changing operations
export const csrfProtection = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for API endpoints using JWT (they have their own protection)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // Check for CSRF token in header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    logger.warn('CSRF token validation failed', {
      ip: req.ip,
      path: req.path,
      hasToken: !!token,
      hasSessionToken: !!sessionToken
    });
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

// Generate CSRF token endpoint
export const generateCSRFToken = (req, res) => {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  req.session.csrfToken = token;
  res.json({ csrfToken: token });
};

// Security headers for API responses
export const apiSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};