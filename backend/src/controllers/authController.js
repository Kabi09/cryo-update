const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password, req });
    return ApiResponse.success(res, {
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register({ ...req.body, req });
    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    return ApiResponse.success(res, {
      message: 'Tokens refreshed successfully',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    return ApiResponse.success(res, {
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userProfile = await authService.getMe(req.user._id);
    return ApiResponse.success(res, {
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user._id, { ...req.body, req });
    return ApiResponse.success(res, {
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  getMe,
  changePassword
};
