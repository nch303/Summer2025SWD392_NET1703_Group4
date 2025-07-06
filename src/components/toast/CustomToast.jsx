import React, { useEffect, useState, useRef } from 'react';
import './CustomToast.css';

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
    <div className={`custom-toast ${type}-toast`}>
      <div className={`custom-toast-icon ${type}-icon`}>
        {getIconByType()}
      </div>
      <div className="custom-toast-content">
        <span className="custom-toast-title">{title || getDefaultTitle()}</span>
        <span className="custom-toast-message">{message}</span>
      </div>
      <div 
        ref={progressRef}
        className={`custom-toast-progress ${type}-progress`}
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
    // Tách thông báo thành 2 nhóm: success và các loại khác
    const successToasts = toasts.filter(toast => toast.type === TOAST_TYPES.SUCCESS);
    const otherToasts = toasts.filter(toast => toast.type !== TOAST_TYPES.SUCCESS);
    
    return (
      <>
        {/* Overlay backdrop when success toasts are present */}
        {successToasts.length > 0 && (
          <div className="toast-overlay"></div>
        )}
        
        {/* Container cho thông báo success - luôn ở center */}
        {successToasts.length > 0 && (
          <div className="custom-toast-container center">
            {successToasts.map((toast) => (
              <CustomToast
                key={toast.id}
                {...toast}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        )}
        
        {/* Container cho các thông báo khác - sử dụng position được truyền vào */}
        {otherToasts.length > 0 && (
          <div className={`custom-toast-container ${position}`}>
            {otherToasts.map((toast) => (
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