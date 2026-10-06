const ApiError = require('../utils/apiError');
const ROLES = require('../constants/roles');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');
const Role = require('../models/Role');

const roleCache = new Map();

const getPermissionsForRole = async (roleName) => {
  if (roleCache.has(roleName)) {
    return roleCache.get(roleName);
  }

  const roleDoc = await Role.findOne({ name: roleName, isActive: true });
  let perms = [];
  if (roleDoc && roleDoc.permissions && roleDoc.permissions.length > 0) {
    perms = roleDoc.permissions;
  } else {
    perms = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
  }

  roleCache.set(roleName, perms);
  setTimeout(() => roleCache.delete(roleName), 60 * 1000); // 1 minute TTL cache
  return perms;
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      const rolePerms = await getPermissionsForRole(req.user.role);
      const userCustomPerms = req.user.customPermissions || [];
      const allUserPerms = new Set([...rolePerms, ...userCustomPerms]);

      const hasAllPermissions = requiredPermissions.every((perm) => allUserPerms.has(perm));
      if (!hasAllPermissions) {
        return next(
          ApiError.forbidden(
            `Forbidden: Missing required permission(s): [${requiredPermissions.join(', ')}]`
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireRole,
  requirePermission
};
