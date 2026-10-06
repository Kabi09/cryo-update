const logger = require('../config/logger');
const config = require('../config/env');
const ERROR_CODES = require('../constants/errorCodes');
const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];
  let code = err.code || ERROR_CODES.INTERNAL_SERVER_ERROR;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    code = ERROR_CODES.DUPLICATE;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value entered for ${field}`;
    errors = [{ field, message }];
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = `Invalid format for field: ${err.path}`;
    errors = [{ field: err.path, message: `Expected valid ${err.kind}` }];
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}: ${err.message}\n${err.stack}`);
  } else {
    logger.warn(`[Client Error] ${req.method} ${req.originalUrl} (${statusCode} - ${code}): ${message}`);
  }

  const responseBody = {
    success: false,
    message,
    errors,
    code
  };

  if (config.env === 'development' && statusCode >= 500) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
