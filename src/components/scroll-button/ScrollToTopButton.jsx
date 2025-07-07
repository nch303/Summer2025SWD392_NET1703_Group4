import React, { useState, useEffect } from 'react';
import styles from './ScrollToTopButton.module.css';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Custom sequential scroll animation
  const scrollToTop = () => {
    const duration = 1000; // Duration in ms
    const startPosition = window.pageYOffset;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      
      // Calculate how far to scroll with easing
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      // Move window by calculated amount
      window.scrollTo(0, startPosition * (1 - easeProgress));
      
      // Continue animation if not complete
      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    // Start the animation
    requestAnimationFrame(animateScroll);
  };

  return (
    <>
      {isVisible && (
        <button 
          className={styles.scrollToTopBtn}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <div className={styles.balloonContainer}>
            <div className={styles.balloon}></div>
            <div className={styles.balloonString}></div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/>
          </svg>
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;