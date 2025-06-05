import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import './navbar.css';

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
      <nav className="navbar">
        {/* Remove cloud container */}
        
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-image">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <div className="logo-text">
              <h1 className="logo-title">Little Stars</h1>
              <p className="logo-subtitle">Preschool System</p>
            </div>
          </Link>
          
          {/* Main navigation */}
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${isActive('/') && !isActive('/dashboard') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/contact" className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}>
              Contact
            </Link>
            <Link to="/about-us" className={`navbar-link ${isActive('/about-us') ? 'active' : ''}`}>
              About Us
            </Link>
            <Link to="/news" className={`navbar-link ${isActive('/news') ? 'active' : ''}`}>
              News
            </Link>
          </div>
          
          {/* User actions */}
          <div className="navbar-actions">
            {isLoggedIn ? (
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button 
                  className="user-dropdown-toggle"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="user-avatar">{currentUser?.fullName?.charAt(0) || 'A'}</div>
                  <span className="user-name">{currentUser?.fullName || 'Admin'}</span>
                  <svg 
                    className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5H7z" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-user-details">
                      <div className="dropdown-avatar">{currentUser?.fullName?.charAt(0) || 'A'}</div>
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">{currentUser?.fullName || 'Admin User'}</div>
                        <div className="dropdown-user-email">{currentUser?.email || 'admin@example.com'}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Profile
                    </Link>
                    {currentUser?.roleName === 'Parent' && (
                      <>
                        <Link to="/payment-history" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                          </svg>
                          Payment History
                        </Link>
                        <Link to="/enrollment-tracking" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          Enrollment Tracking
                        </Link>
                      </>
                    )}
                    <Link to="/notifications" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                      </svg>
                      Notifications
                    </Link>
                    <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="dropdown-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-login">
                  Login
                </Link>
                <Link to="/register" className="btn btn-register">
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="mobile-menu-button"
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
        <div className="navbar-decoration"></div>
        
        
        {/* Remove floating clouds container */}
      </nav>
      
      {/* Mobile menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-links">
          <Link 
            to="/" 
            className={`mobile-link ${isActive('/') && !isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className={`mobile-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/students" 
            className={`mobile-link ${isActive('/students') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Students
          </Link>
          <Link 
            to="/classes" 
            className={`mobile-link ${isActive('/classes') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Classes
          </Link>
          <Link 
            to="/enrollment" 
            className={`mobile-link ${isActive('/enrollment') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Enrollment
          </Link>
          <Link 
            to="/activities" 
            className={`mobile-link ${isActive('/activities') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Activities
          </Link>
          {currentUser?.roleName === 'Parent' && (
            <>
              <Link 
                to="/payment-history" 
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Payment History
              </Link>
              <Link 
                to="/enrollment-tracking" 
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Enrollment Tracking
              </Link>
            </>
          )}
        </div>
        
        <div className="mobile-actions">
          {isLoggedIn ? (
            <>
              <div className="mobile-user">
                <div className="mobile-avatar">{currentUser?.fullName?.charAt(0) || 'A'}</div>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{currentUser?.fullName || 'Admin User'}</div>
                  <div className="mobile-user-email">{currentUser?.email || 'admin@example.com'}</div>
                </div>
              </div>
              
              <Link 
                to="/profile" 
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              {currentUser?.roleName === 'Parent' && (
                <Link 
                  to="/payment-history" 
                  className="mobile-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Payment History
                </Link>
              )}
              <button 
                className="mobile-link"
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
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="mobile-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default Navbar;