import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';
import { ROUTES } from '../../constants/routes';

const Sidebar = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
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
        
        <Link to={ROUTES.STAFF_STUDENTS} className={`sidebar-link ${isActive(ROUTES.STAFF_STUDENTS) ? 'active' : ''}`}>
          <div className="sidebar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <span className="sidebar-text">Students</span>
        </Link>

        <Link to="/staff/assign-students" className={`sidebar-link ${isActive('/staff/assign-students') ? 'active' : ''}`}>
          <div className="sidebar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <span className="sidebar-text">Assign Student to Class</span>
        </Link>

        <Link to="/staff/enrollment-applications" className={`sidebar-link ${isActive('/staff/enrollment-applications') ? 'active' : ''}`}>
          <div className="sidebar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <span className="sidebar-text">Enrollment Applications</span>
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
        
        <Link to="/staff/performance" className={`sidebar-link ${isActive('/staff/performance') ? 'active' : ''}`}>
          <div className="sidebar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
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
  );
};

export default Sidebar;