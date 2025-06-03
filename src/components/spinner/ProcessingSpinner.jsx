import React, { useEffect, createContext, useState, useContext } from 'react';
import './ProcessingSpinner.css';

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
    <div className="processing-overlay">
      <div className="processing-container">
        <div className="spinner-container">
          <div className="processing-spinner"></div>
        </div>
        <div className="processing-text">
          <p>{message}</p>
          <div className="processing-dots">
            <span className="dot dot1">.</span>
            <span className="dot dot2">.</span>
            <span className="dot dot3">.</span>
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