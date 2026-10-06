const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const User = require('../models/User');
const Role = require('../models/Role');
const { recordAudit } = require('../utils/auditLogger');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn
  });

  const refreshToken = jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });

  return { accessToken, refreshToken };
};

const login = async ({ email, password, req }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokenHash');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('User account is deactivated');
  }

  if (user.isLocked()) {
    throw ApiError.forbidden('Account is temporarily locked due to multiple failed attempts. Try again later.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
    }
    await user.save();
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Reset login failures
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();

  const { accessToken, refreshToken } = generateTokens(user);
  const salt = await bcrypt.genSalt(10);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  await user.save();

  await recordAudit({
    req,
    user,
    action: 'LOGIN',
    module: 'AUTH',
    entityType: 'User',
    entityId: user._id,
    remarks: 'User logged in successfully'
  });

  // Get effective permissions
  const roleDoc = await Role.findOne({ name: user.role, isActive: true });
  const permissions = roleDoc ? roleDoc.permissions : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department,
      designation: user.designation,
      permissions
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

const register = async ({ name, email, password, role, employeeId, department, designation, phone, req }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('User with this email already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'SALES',
    employeeId,
    department,
    designation,
    phone
  });

  await recordAudit({
    req,
    user,
    action: 'REGISTER',
    module: 'AUTH',
    entityType: 'User',
    entityId: user._id,
    remarks: `New user registered: ${user.email} (${user.role})`
  });

  const { accessToken, refreshToken } = generateTokens(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
};

const refreshToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw ApiError.badRequest('Refresh token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or deactivated');
  }

  if (!user.refreshTokenHash) {
    throw ApiError.unauthorized('Refresh token revoked');
  }

  const isMatch = await bcrypt.compare(incomingRefreshToken, user.refreshTokenHash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokens = generateTokens(user);
  const salt = await bcrypt.genSalt(10);
  user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, salt);
  await user.save();

  return tokens;
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  return true;
};

const changePassword = async (userId, { currentPassword, newPassword, req }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokenHash = null; // Logout from other sessions
  await user.save();

  await recordAudit({
    req,
    user,
    action: 'CHANGE_PASSWORD',
    module: 'AUTH',
    entityType: 'User',
    entityId: user._id,
    remarks: 'User password changed successfully'
  });

  return true;
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const roleDoc = await Role.findOne({ name: user.role, isActive: true });
  const permissions = roleDoc ? roleDoc.permissions : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    department: user.department,
    designation: user.designation,
    permissions
  };
};

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  changePassword,
  getMe
};
