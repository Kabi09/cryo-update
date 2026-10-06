import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cryo_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cryo_access_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cryo_access_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('cryo_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session verification failed, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: userData, tokens } = res.data;

    setUser(userData);
    setToken(tokens.accessToken);
    localStorage.setItem('cryo_access_token', tokens.accessToken);
    localStorage.setItem('cryo_refresh_token', tokens.refreshToken);
    localStorage.setItem('cryo_user', JSON.stringify(userData));

    return userData;
  };

  const logout = useCallback(() => {
    try {
      authApi.logout().catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cryo_access_token');
      localStorage.removeItem('cryo_refresh_token');
      localStorage.removeItem('cryo_user');
    }
  }, []);

  // Permission evaluation helper
  const hasPermission = useCallback(
    (permissionCode) => {
      if (!user) return false;
      if (user.role === 'ADMIN') return true;
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permissionCode);
      }
      return false;
    },
    [user]
  );

  // Role evaluation helper
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
