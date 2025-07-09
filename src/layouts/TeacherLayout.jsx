import React, { useState, Suspense } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Badge } from 'antd';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTopButton from '../components/scroll-button/ScrollToTopButton';
import PageLoadingScreen from '../components/loading/PageLoadingScreen';
import styles from './TeacherLayout.module.css';

const { Sider, Content } = Layout;

const TeacherLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/teacher/dashboard">Overview</Link>,
    },
    {
      key: 'classes',
      icon: <TeamOutlined />,
      label: <Link to="/teacher/classes">My Classes</Link>,
    },
    {
      key: 'syllabus',
      icon: <BookOutlined />,
      label: <Link to="/teacher/syllabus">Syllabus</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: '1',
      label: 'My Profile',
    },
    {
      key: '2',
      label: 'Account Settings',
    },
    {
      key: '3',
      label: 'Help & Support',
    },
    {
      key: '4',
      label: 'Logout',
    },
  ];

  return (
    <div className={`${styles.teacherLayout} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <Navbar />
      <div className={styles.teacherContainer}>
        <aside className={styles.teacherSidebar}>
          <div className={styles.teacherSidebarHeader}>
            <h3 className={styles.teacherSidebarTitle}>Teacher Portal</h3>
            <button 
              className={styles.teacherSidebarToggle} 
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
          
          <nav className={styles.teacherSidebarNav}>
            <Link 
              to="/teacher/dashboard" 
              className={`${styles.teacherSidebarLink} ${isActive('/teacher/dashboard') ? styles.active : ''}`}
              aria-label="Dashboard"
            >
              <div className={styles.teacherSidebarIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <span className={styles.teacherSidebarText}>Overview</span>
            </Link>
            
            <Link 
              to="/teacher/classes" 
              className={`${styles.teacherSidebarLink} ${isActive('/teacher/classes') ? styles.active : ''}`}
              aria-label="My Classes"
            >
              <div className={styles.teacherSidebarIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <span className={styles.teacherSidebarText}>My Classes</span>
            </Link>

            <Link 
              to="/teacher/syllabus" 
              className={`${styles.teacherSidebarLink} ${isActive('/teacher/syllabus') ? styles.active : ''}`}
              aria-label="Syllabus"
            >
              <div className={styles.teacherSidebarIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <span className={styles.teacherSidebarText}>Syllabus</span>
            </Link>
          </nav>
        </aside>
        <main className={styles.teacherContent}>
          <Suspense fallback={<PageLoadingScreen message="Loading..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default TeacherLayout;
