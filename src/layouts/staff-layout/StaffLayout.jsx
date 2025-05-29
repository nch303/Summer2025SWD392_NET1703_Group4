import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Navbar from '../../shared/components/navbar/Navbar';
import Footer from '../../shared/components/footer/Footer';
import ScrollToTopButton from '../../shared/components/scroll-button/ScrollToTopButton';
import './staff-layout.css';

const StaffLayout = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`staff-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar />
      <div className="staff-container">
        <aside className="staff-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Staff</h3>
            <button 
              className="sidebar-toggle" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"/>
                </svg>
              )}
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <Link to="/staff/dashboard" className={`sidebar-link ${isActive('/staff/dashboard') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <span className="sidebar-text">Dashboard</span>
            </Link>
            <Link to="/staff/list" className={`sidebar-link ${isActive('/staff/list') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <span className="sidebar-text">Staff List</span>
            </Link>
            <Link to="/staff/add" className={`sidebar-link ${isActive('/staff/add') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <span className="sidebar-text">Add Staff</span>
            </Link>
            <Link to="/staff/attendance" className={`sidebar-link ${isActive('/staff/attendance') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <span className="sidebar-text">Attendance</span>
            </Link>
            <Link to="/staff/schedule" className={`sidebar-link ${isActive('/staff/schedule') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <span className="sidebar-text">Schedule</span>
            </Link>
            <Link to="/staff/payroll" className={`sidebar-link ${isActive('/staff/payroll') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <span className="sidebar-text">Payroll</span>
            </Link>
            <Link to="/staff/performance" className={`sidebar-link ${isActive('/staff/performance') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <span className="sidebar-text">Performance</span>
            </Link>
            <Link to="/staff/training" className={`sidebar-link ${isActive('/staff/training') ? 'active' : ''}`}>
              <div className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                </svg>
              </div>
              <span className="sidebar-text">Training</span>
            </Link>
          </nav>
        </aside>
        
        <main className="staff-content">
          <Outlet />
        </main>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default StaffLayout;