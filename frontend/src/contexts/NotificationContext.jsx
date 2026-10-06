import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import governanceApi from '../services/api/governanceApi';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await governanceApi.getNotifications({ limit: 10 });
      setNotifications(res.data);
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      // In-app notifications fetch is graceful
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await governanceApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const showSuccess = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg) => showToast(msg, 'error'), [showToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        showSuccess,
        showError,
        removeToast,
        fetchNotifications,
        markAsRead
      }}
    >
      {children}
      {/* Toast Overlay */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background:
                toast.type === 'success'
                  ? '#064e3b'
                  : toast.type === 'error'
                  ? '#881337'
                  : toast.type === 'warning'
                  ? '#78350f'
                  : '#0f172a',
              color: '#ffffff',
              border: `1px solid ${
                toast.type === 'success'
                  ? '#10b981'
                  : toast.type === 'error'
                  ? '#f43f5e'
                  : toast.type === 'warning'
                  ? '#f59e0b'
                  : '#38bdf8'
              }`,
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              maxWidth: '380px',
              animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: '1rem',
                marginLeft: 'auto'
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = useNotification;

export default NotificationContext;
