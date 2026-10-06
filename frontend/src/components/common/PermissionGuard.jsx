import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const PermissionGuard = ({ permission, role, children, fallback = null }) => {
  const { hasPermission, hasRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
