const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const ERROR_CODES = require('../constants/errorCodes');

const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      errors: [],
      code: ERROR_CODES.AUTHORIZATION_ERROR
    });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 login attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes.',
      errors: [],
      code: ERROR_CODES.AUTHENTICATION_ERROR
    });
  }
});

module.exports = { apiLimiter, authLimiter };
