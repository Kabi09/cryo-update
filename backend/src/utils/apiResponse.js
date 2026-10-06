class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = {}, meta = {} } = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta
    });
  }

  static error(res, { statusCode = 500, message = 'Internal Server Error', errors = [], code = 'INTERNAL_SERVER_ERROR' } = {}) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      code
    });
  }
}

module.exports = ApiResponse;
