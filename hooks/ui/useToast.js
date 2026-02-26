import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for toast notifications
 */
export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
  });
  const timeoutRef = useRef(null);

  const show = useCallback((message, type = 'info', duration = 3000) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      visible: true,
      message,
      type,
    });

    // Auto-hide after duration
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, duration);
    }
  }, []);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showSuccess = useCallback(
    (message, duration) => show(message, 'success', duration),
    [show]
  );

  const showError = useCallback(
    (message, duration) => show(message, 'error', duration),
    [show]
  );

  const showWarning = useCallback(
    (message, duration) => show(message, 'warning', duration),
    [show]
  );

  const showInfo = useCallback(
    (message, duration) => show(message, 'info', duration),
    [show]
  );

  return {
    toast,
    show,
    hide,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useToast;
