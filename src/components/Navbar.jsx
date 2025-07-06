import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import NotificationBell from '../pages/notification/NotificationBell';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, handleLogout, fetchCurrentUser } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const lastPathRef = useRef(location.pathname);
  
  useEffect(() => {
    // Check if user just logged in (coming from login page)
    const isComingFromLogin = lastPathRef.current.includes('/login') && 
                             !location.pathname.includes('/login');
    
    if (isComingFromLogin) {
      // Refresh user data when coming from login page
      fetchCurrentUser();
    }
    
    // Update last path reference
    lastPathRef.current = location.pathname;
  }, [location.pathname, fetchCurrentUser]); 
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const onLogout = () => {
    handleLogout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      <nav className={styles.navbar}>
        {/* Remove cloud container */}
        
        <div className={styles.navbarContainer}>
          {/* Logo */}
          <Link to="/" className={styles.navbarLogo}>
            <div className={styles.logoImage}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <div className={styles.logoText}>
              <h1 className={styles.logoTitle}>Little Stars</h1>
              <p className={styles.logoSubtitle}>Preschool System</p>
            </div>
          </Link>
          
          {/* Main navigation */}
          <div className={styles.navbarLinks}>
            <Link to="/" className={`${styles.navbarLink} ${isActive('/') && !isActive('/dashboard') ? styles.active : ''}`}>
              Home
            </Link>
            <Link to="/contact" className={`${styles.navbarLink} ${isActive('/contact') ? styles.active : ''}`}>
              Contact
            </Link>
            <Link to="/about-us" className={`${styles.navbarLink} ${isActive('/about-us') ? styles.active : ''}`}>
              About Us
            </Link>
            <Link to="/news" className={`${styles.navbarLink} ${isActive('/news') ? styles.active : ''}`}>
              News
            </Link>
            {currentUser?.roleName === 'Parent' && (
              <Link to="/enrichment-program" className={`${styles.navbarLink} ${isActive('/enrichment-program') ? styles.active : ''}`}>
                Enrichment Program
              </Link>
            )}
          </div>
          
          {/* User actions */}
          <div className={styles.navbarActions}>
            {isLoggedIn ? (
              <>
                {/* Add notification bell */}
                <NotificationBell />
                
                <div className={styles.userDropdownContainer} ref={dropdownRef}>
                  <button 
                    className={styles.userDropdownToggle}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className={styles.userAvatar}>{currentUser?.fullName?.charAt(0) || 'A'}</div>
                    <span className={styles.userName}>{currentUser?.fullName || 'Admin'}</span>
                    <svg 
                      className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.open : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className={styles.userDropdown}>
                      <div className={styles.dropdownUserDetails}>
                        <div className={styles.dropdownAvatar}>{currentUser?.fullName?.charAt(0) || 'A'}</div>
                        <div className={styles.dropdownUserInfo}>
                          <div className={styles.dropdownUserName}>{currentUser?.fullName || 'Admin User'}</div>
                          <div className={styles.dropdownUserEmail}>{currentUser?.email || 'admin@example.com'}</div>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <Link to="/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        Profile
                      </Link>
                      {currentUser?.roleName === 'Parent' && (
                        <>
                          <Link to="/tuition-fee" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                            </svg>
                            Tuition Fee
                          </Link>
                          <Link to="/payment-history" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                            </svg>
                            Payment History
                          </Link>
                          <Link to="/enrollment-tracking" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            Enrollment Tracking
                          </Link>
                        </>
                      )}
                      <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className={styles.dropdownItem}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={`${styles.btn} ${styles.btnLogin}`}>
                  Login
                </Link>
                <Link to="/register" className={`${styles.btn} ${styles.btnRegister}`}>
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Decorative bottom border */}
        <div className={styles.navbarDecoration}></div>
        
        
        {/* Remove floating clouds container */}
      </nav>
      
      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileLinks}>
          <Link 
            to="/" 
            className={`${styles.mobileLink} ${isActive('/') && !isActive('/dashboard') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/enrichment-program" 
            className={`${styles.mobileLink} ${isActive('/enrichment-program') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Enrichment Program
          </Link>
          <Link 
            to="/contact" 
            className={`${styles.mobileLink} ${isActive('/contact') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link 
            to="/about-us" 
            className={`${styles.mobileLink} ${isActive('/about-us') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>
          <Link 
            to="/news" 
            className={`${styles.mobileLink} ${isActive('/activities') ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Activities
          </Link>
          {currentUser?.roleName === 'Parent' && (
            <>
              <Link 
                to="/tuition-fee" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Học phí
              </Link>
              <Link 
                to="/payment-history" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Payment History
              </Link>
              <Link 
                to="/enrollment-tracking" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Enrollment Tracking
              </Link>
            </>
          )}
        </div>
        
        <div className={styles.mobileActions}>
          {isLoggedIn ? (
            <>
              <div className={styles.mobileUser}>
                <div className={styles.mobileAvatar}>{currentUser?.fullName?.charAt(0) || 'A'}</div>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileUserName}>{currentUser?.fullName || 'Admin User'}</div>
                  <div className={styles.mobileUserEmail}>{currentUser?.email || 'admin@example.com'}</div>
                </div>
              </div>
              
              <Link 
                to="/profile" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              {currentUser?.roleName === 'Parent' && (
                <Link 
                  to="/tuition-fee" 
                  className={styles.mobileLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Học phí
                </Link>
              )}
              <Link 
                to="/notifications" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Notifications
              </Link>
              <button 
                className={styles.mobileLink}
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className={styles.navbarSpacer}></div>
    </>
  );
};

export default Navbar;