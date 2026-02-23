import React, { createContext, useState, useCallback, useRef } from 'react';

export const NotificationContext = createContext(null);

/**
 * Notification Context Provider
 * Manages in-app notifications and toasts
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const notificationIdRef = useRef(0);

  const addNotification = useCallback((notification) => {
    const id = notificationIdRef.current++;
    const newNotification = {
      id,
      type: 'info',
      duration: 3000,
      ...notification,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback(
    (message, options = {}) => {
      return addNotification({ message, type: 'success', ...options });
    },
    [addNotification]
  );

  const showError = useCallback(
    (message, options = {}) => {
      return addNotification({ message, type: 'error', ...options });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => {
      return addNotification({ message, type: 'warning', ...options });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => {
      return addNotification({ message, type: 'info', ...options });
    },
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
