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
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import ScrollToTopButton from '../components/scroll-button/ScrollToTopButton';
import PageLoadingScreen from '../components/loading/PageLoadingScreen';
import './TeacherLayout.css';

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
      label: <Link to="/teacher/dashboard">Dashboard</Link>,
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
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/teacher/settings">Settings</Link>,
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
    <div className={`teacher-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar />
      <div className="teacher-container">
        <aside className="teacher-sidebar">
          <div className="teacher-sidebar-header">
            <h3 className="teacher-sidebar-title">Teacher Portal</h3>
            <button 
              className="teacher-sidebar-toggle" 
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
          
          <nav className="teacher-sidebar-nav">
            <Link 
              to="/teacher/dashboard" 
              className={`teacher-sidebar-link ${isActive('/teacher/dashboard') ? 'active' : ''}`}
              aria-label="Dashboard"
            >
              <div className="teacher-sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <span className="teacher-sidebar-text">Dashboard</span>
            </Link>
            
            <Link 
              to="/teacher/classes" 
              className={`teacher-sidebar-link ${isActive('/teacher/classes') ? 'active' : ''}`}
              aria-label="My Classes"
            >
              <div className="teacher-sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <span className="teacher-sidebar-text">My Classes</span>
            </Link>

            <Link 
              to="/teacher/syllabus" 
              className={`teacher-sidebar-link ${isActive('/teacher/syllabus') ? 'active' : ''}`}
              aria-label="Syllabus"
            >
              <div className="teacher-sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <span className="teacher-sidebar-text">Syllabus</span>
            </Link>

            <Link 
              to="/teacher/settings" 
              className={`teacher-sidebar-link ${isActive('/teacher/settings') ? 'active' : ''}`}
              aria-label="Settings"
            >
              <div className="teacher-sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
              </div>
              <span className="teacher-sidebar-text">Settings</span>
            </Link>
          </nav>
        </aside>
        <main className="teacher-content">
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
