import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component automatically scrolls to top when navigation occurs
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  // This component doesn't render anything
  return null;
};

export default ScrollToTop;