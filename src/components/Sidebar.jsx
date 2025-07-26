import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { ROUTES } from '../constants/routes';

const Sidebar = ({ isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={styles.staffSidebar}>
      <div className={styles.staffSidebarHeader}>
        <h3 className={styles.staffSidebarTitle}>Staff Portal</h3>
        <button
          className={styles.staffSidebarToggle}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
            </svg>
          )}
        </button>
      </div>

      <nav className={styles.staffSidebarNav}>
        <Link
          to="/staff/dashboard"
          className={`${styles.staffSidebarLink} ${isActive('/staff/dashboard') ? styles.active : ''}`}
          aria-label="Dashboard"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Overview</span>
        </Link>

        <Link
          to={ROUTES.STAFF_STUDENTS}
          className={`${styles.staffSidebarLink} ${isActive(ROUTES.STAFF_STUDENTS) ? styles.active : ''}`}
          aria-label="Students"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Students</span>
        </Link>

        <Link to="/staff/enrichment-participants" className={`${styles.staffSidebarLink} ${isActive('/staff/enrichment-participants') ? styles.active : ''}`}>
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Enrichment Participants</span>
        </Link>

        <Link
          to="/staff/enrollment-applications"
          className={`${styles.staffSidebarLink} ${isActive('/staff/enrollment-applications') ? styles.active : ''}`}
          aria-label="Enrollment Applications"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Enrollment Applications</span>
        </Link>

        <Link
          to="/staff/classes"
          className={`${styles.staffSidebarLink} ${isActive('/staff/classes') ? styles.active : ''}`}
          aria-label="Classes"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Classes</span>
        </Link>

        <Link
          to="/staff/assign-students"
          className={`${styles.staffSidebarLink} ${isActive('/staff/assign-students') ? styles.active : ''}`}
          aria-label="Assign Students"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Assign Students</span>
        </Link>

        <Link
          to="/staff/assign-teachers"
          className={`${styles.staffSidebarLink} ${isActive('/staff/assign-teachers') ? styles.active : ''}`}
          aria-label="Assign Teachers"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Assign Teachers</span>
        </Link>

        <Link
          to="/staff/refund-list"
          className={`${styles.staffSidebarLink} ${isActive('/staff/refund-list') ? styles.active : ''}`}
          aria-label="Refund Management"
        >
          <div className={styles.staffSidebarIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H4c-.55 0-1-.45-1-1V8h18v9c0 .55-.45 1-1 1zM8 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1H8v-1h4v-2H8c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1zm9-7h-3v-1h4V7h-6v4c0 .55.45 1 1 1h3v1h-4v2h6v-4c0-.55-.45-1-1-1z" />
            </svg>
          </div>
          <span className={styles.staffSidebarText}>Refund Management</span>
        </Link>
        
      </nav>
    </aside>
  );
};

export default Sidebar;