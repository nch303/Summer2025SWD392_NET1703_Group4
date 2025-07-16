import React, { useEffect, useState, useRef } from 'react';
import styles from './CustomToast.module.css';

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const CustomToast = ({
  message,
  type = TOAST_TYPES.SUCCESS,
  title,
  duration = 3000,
  onClose
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef(null);

  useEffect(() => {
    // Set animation duration
    if (progressRef.current) {
      progressRef.current.style.animationDuration = `${duration}ms`;
    }

    // Timer to remove toast
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!visible) return null;

  const getIconByType = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case TOAST_TYPES.ERROR:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
      case TOAST_TYPES.WARNING:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        );
      case TOAST_TYPES.INFO:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS: return 'Success!';
      case TOAST_TYPES.ERROR: return 'Error!';
      case TOAST_TYPES.WARNING: return 'Warning!';
      case TOAST_TYPES.INFO: return 'Info';
      default: return '';
    }
  };

  return (
    <div className={`${styles.customToast} ${getTypeClass(type)}`}>
      <div className={`${styles.customToastIcon} ${type === 'success' ? styles.successIcon : type === 'error' ? styles.errorIcon : type === 'warning' ? styles.warningIcon : styles.infoIcon}`}>
        {getIconByType()}
      </div>
      <div className={styles.customToastContent}>
        <span className={styles.customToastTitle}>{title || getDefaultTitle()}</span>
        <span className={styles.customToastMessage}>{message}</span>
      </div>
      <div
        ref={progressRef}
        className={`${styles.customToastProgress} ${type === 'success' ? styles.successProgress : type === 'error' ? styles.errorProgress : type === 'warning' ? styles.warningProgress : styles.infoProgress}`}
      ></div>
    </div>
  );
};

export const useCustomToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (options) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, ...options }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const show = (message, options = {}) => {
    return addToast({ message, ...options });
  };

  const success = (message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.SUCCESS, ...options });
  };

  const error = (message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.ERROR, ...options });
  };

  const warning = (message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.WARNING, ...options });
  };

  const info = (message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.INFO, ...options });
  };

  const ToastContainer = ({ position = 'center' }) => {
    // Separate success toasts from all other types
    const successToasts = toasts.filter(toast => toast.type === TOAST_TYPES.SUCCESS);
    const nonSuccessToasts = toasts.filter(toast => toast.type !== TOAST_TYPES.SUCCESS);

    return (
      <>
        {/* Overlay backdrop when success toasts are present */}
        {successToasts.length > 0 && (
          <div className={styles.toastOverlay}></div>
        )}

        {/* Container for success toasts - always centered */}
        {successToasts.length > 0 && (
          <div className={`${styles.customToastContainer} ${getPositionClass('center')}`}>
            {successToasts.map((toast) => (
              <CustomToast
                key={toast.id}
                {...toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        )}

        {/* Container for all non-success toasts - always top-right */}
        {nonSuccessToasts.length > 0 && (
          <div className={`${styles.customToastContainer} ${getPositionClass('top-right')}`}>
            {nonSuccessToasts.map((toast) => (
              <CustomToast
                key={toast.id}
                {...toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return {
    show,
    success,
    error,
    warning,
    info,
    ToastContainer
  };
};

export { TOAST_TYPES };
export default CustomToast;

// Đối với position, sử dụng hàm để chuyển đổi position thành tên class CSS module
const getPositionClass = (position) => {
  const positionMap = {
    'top-right': styles.topRight,
    'top-left': styles.topLeft,
    'bottom-right': styles.bottomRight,
    'bottom-left': styles.bottomLeft,
    'top-center': styles.topCenter,
    'center': styles.center,
    'bottom-center': styles.bottomCenter
  };
  return positionMap[position] || styles.center;
};

// Đối với type, sử dụng hàm để chuyển đổi type thành tên class CSS module
const getTypeClass = (type) => {
  const typeMap = {
    'success': styles.successToast,
    'error': styles.errorToast,
    'warning': styles.warningToast,
    'info': styles.infoToast
  };
  return typeMap[type] || '';
};