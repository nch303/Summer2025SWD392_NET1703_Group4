import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import ScrollToTopButton from '../components/scroll-button/ScrollToTopButton';

const { Sider, Content } = Layout;

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  // Lấy location hiện tại để xác định menu item nào đang active
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Xác định key của menu item đang active dựa trên đường dẫn hiện tại
  const getActiveMenuKey = () => {
    if (currentPath.startsWith('/teacher/dashboard')) return 'dashboard';
    if (currentPath.startsWith('/teacher/classes')) return 'classes';
    if (currentPath.startsWith('/teacher/syllabus')) return 'syllabus';
    if (currentPath.startsWith('/teacher/schedule')) return 'schedule';
    if (currentPath.startsWith('/teacher/assignments')) return 'assignments';
    if (currentPath.startsWith('/teacher/messages')) return 'messages';
    if (currentPath.startsWith('/teacher/settings')) return 'settings';
    return 'dashboard'; // default
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
      key: 'schedule',
      icon: <CalendarOutlined />,
      label: <Link to="/teacher/schedule">Schedule</Link>,
    },
    {
      key: 'assignments',
      icon: <FileTextOutlined />,
      label: <Link to="/teacher/assignments">Assignments</Link>,
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: (
        <Link to="/teacher/messages">
          Messages
          <Badge count={5} style={{ marginLeft: '8px' }} />
        </Link>
      ),
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <div style={{ display: 'flex', flex: 1, position: 'relative', paddingTop: '0' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          style={{ 
            position: 'fixed',
            top: 64,
            left: 0,
            height: 'calc(100vh - 64px)',
            zIndex: 10,
            overflow: 'auto'
          }}
        >
          <div className="demo-logo-vertical" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: 'white', margin: 0 }}>{collapsed ? 'PS' : 'Preschool'}</h2>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getActiveMenuKey()]} // Đặt selectedKeys dựa trên đường dẫn hiện tại
            items={menuItems}
            style={{ paddingBottom: '48px' }}
          />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: '100%',
              height: 48,
              color: 'rgba(255, 255, 255, 0.65)',
              position: 'absolute',
              bottom: 0,
              left: 0,
            }}
          />
        </Sider>
        
        <div 
          style={{ 
            marginLeft: collapsed ? 80 : 200,
            transition: 'margin-left 0.2s',
            width: '100%',
            paddingRight: '16px'
          }}
        >
          <Content
            style={{
              margin: '16px 16px 24px',
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 'calc(100vh - 140px)',
            }}
          >
            <Outlet />
          </Content>
          
          <Footer />
        </div>
      </div>
      
      <ScrollToTopButton />
    </div>
  );
};

export default TeacherLayout;
