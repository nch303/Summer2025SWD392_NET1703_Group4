import React, { useEffect, createContext, useState, useContext } from 'react';
import styles from './ProcessingSpinner.module.css';

const ProcessingSpinner = ({
  isVisible = false,
  message = 'Processing',
  preventNavigation = true
}) => {
  // Prevent navigation when active
  useEffect(() => {
    if (!isVisible || !preventNavigation) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Prevent navigation away
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isVisible, preventNavigation]);

  if (!isVisible) return null;

  return (
    <div className={styles.processingOverlay}>
      <div className={styles.processingContainer}>
        <div className={styles.spinnerContainer}>
          <div className={styles.processingSpinner}></div>
        </div>
        <div className={styles.processingText}>
          <p>{message}</p>
          <div className={styles.processingDots}>
            <span className={`${styles.dot} ${styles.dot1}`}></span>
            <span className={`${styles.dot} ${styles.dot2}`}></span>
            <span className={`${styles.dot} ${styles.dot3}`}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a React context to use the spinner anywhere in the app
const ProcessingSpinnerContext = createContext();

export const ProcessingSpinnerProvider = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing');

  const showSpinner = (message = 'Processing') => {
    setProcessingMessage(message);
    setIsProcessing(true);
  };

  const hideSpinner = () => {
    setIsProcessing(false);
  };

  // Utility function for wrapping async operations
  const withProcessing = async (asyncFunction, message = 'Processing') => {
    showSpinner(message);
    try {
      return await asyncFunction();
    } finally {
      hideSpinner();
    }
  };

  return (
    <ProcessingSpinnerContext.Provider value={{ showSpinner, hideSpinner, withProcessing }}>
      {children}
      <ProcessingSpinner isVisible={isProcessing} message={processingMessage} />
    </ProcessingSpinnerContext.Provider>
  );
};

export const useProcessingSpinner = () => {
  const context = useContext(ProcessingSpinnerContext);
  if (!context) {
    throw new Error('useProcessingSpinner must be used within a ProcessingSpinnerProvider');
  }
  return context;
};

export { ProcessingSpinner };
export default ProcessingSpinner;