const ERROR_CODES = require('../constants/errorCodes');

class ApiError extends Error {
  constructor(statusCode, message, errors = [], code = ERROR_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = [], code = ERROR_CODES.VALIDATION_ERROR) {
    return new ApiError(400, message, errors, code);
  }

  static unauthorized(message = 'Unauthorized access', code = ERROR_CODES.AUTHENTICATION_ERROR) {
    return new ApiError(401, message, [], code);
  }

  static forbidden(message = 'Forbidden access', code = ERROR_CODES.AUTHORIZATION_ERROR) {
    return new ApiError(403, message, [], code);
  }

  static notFound(message = 'Resource not found', code = ERROR_CODES.NOT_FOUND) {
    return new ApiError(404, message, [], code);
  }

  static conflict(message = 'Resource conflict or duplicate entry', code = ERROR_CODES.DUPLICATE) {
    return new ApiError(409, message, [], code);
  }

  static invalidWorkflowState(message, errors = []) {
    return new ApiError(422, message, errors, ERROR_CODES.INVALID_WORKFLOW_STATE);
  }

  static businessRule(message, errors = []) {
    return new ApiError(422, message, errors, ERROR_CODES.BUSINESS_RULE_ERROR);
  }

  static internal(message = 'Internal server error', code = ERROR_CODES.INTERNAL_SERVER_ERROR) {
    return new ApiError(500, message, [], code);
  }
}

module.exports = ApiError;
