import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  NotificationOutlined,
  BarChartOutlined,
  ReadOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
import Navbar from '../components/navbar/Navbar';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUser();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/students',
      icon: <TeamOutlined />,
      label: 'Students',
    },
    {
      key: '/admin/teachers',
      icon: <UserOutlined />,
      label: 'Teachers',
    },
    {
      key: '/admin/enrichment',
      icon: <BookOutlined />,
      label: 'Enrichment Activities',
    },
    {
      key: '/admin/news',
      icon: <NotificationOutlined />,
      label: 'News',
    },
    {
      key: '/admin/send-announcement',
      icon: <BellOutlined />,
      label: 'Send Announcement',
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/admin/syllabus',
      icon: <FileTextOutlined />,
      label: 'Syllabus',
    },
    {
      key: '/admin/classes',
      icon: <CalendarOutlined />,
      label: 'Classes',
    },
    {
      key: '/admin/users/list',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  return (
    <div className="admin-navbar-wrapper">
      <Navbar />
      <Layout className="admin-layout">
        <Sider 
          width={250} 
          className="admin-sider"
          collapsed={collapsed}
          collapsible
          trigger={null}
        >
          <div className="admin-logo">
            <h2>{collapsed ? 'LS' : 'Little Stars'}</h2>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout>
          <Header className="admin-header">
            <div className="header-left">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="trigger-button"
              />
              <h1>Little Stars Preschool</h1>
            </div>
            <div className="header-right">
              <Badge count={5} className="notification-badge">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  className="notification-button"
                />
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div className="user-profile">
                  <Avatar icon={<UserOutlined />} />
                  <span className="username">Admin</span>
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content className="admin-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default AdminLayout;
