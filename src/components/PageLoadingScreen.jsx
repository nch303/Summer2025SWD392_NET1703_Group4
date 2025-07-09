import React, { useState, useEffect } from 'react';
import { ProcessingSpinner } from './ProcessingSpinner';
import styles from './PageLoadingScreen.module.css';

const PageLoadingScreen = ({
  isLoading = true,
  message = 'Đang tải trang',
  minDisplayTime = 300,
  children,
  fullScreen = true
}) => {
  const [shouldDisplay, setShouldDisplay] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(minDisplayTime - elapsedTime, 0);

      // Ensure spinner stays visible for at least minDisplayTime
      const timer = setTimeout(() => {
        setShouldDisplay(false);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minDisplayTime, startTime]);

  // If not loading and past minimum time, render children
  if (!isLoading && !shouldDisplay) {
    return children;
  }

  // If component just for loading state (no children)
  if (!children) {
    return <ProcessingSpinner isVisible={true} message={message} />;
  }

  // When loading or within minimum display time
  return (
    <>
      <ProcessingSpinner isVisible={true} message={message} />
      <div className={`${styles.pageLoadingContent} ${shouldDisplay ? styles.hidden : ''}`}>
        {children}
      </div>
    </>
  );
};

// Component level usage (wrapping a specific component)
export const withPageLoading = (Component, loadingProps = {}) => {
  return (props) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      setIsLoaded(true);
    }, []);

    return (
      <PageLoadingScreen
        isLoading={!isLoaded}
        message={loadingProps.message || 'Loading...'}
        {...loadingProps}
      >
        <Component {...props} />
      </PageLoadingScreen>
    );
  };
};

// Custom hook for controlling loading manually
export const usePageLoading = (initialState = true) => {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = (message) => setIsLoading({ isLoading: true, message });
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
    loadingProps: { isLoading }
  };
};

export default PageLoadingScreen;
