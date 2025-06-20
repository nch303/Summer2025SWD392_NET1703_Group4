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
      key: 'students',
      icon: <TeamOutlined />,
      label: 'Students',
      children: [
        {
          key: '/admin/students/list',
          label: 'View Students',
        },
        {
          key: '/admin/students/assign-class',
          label: 'Assign to Class',
        },
        {
          key: '/admin/students/activities',
          label: 'Enrichment Activities',
        },
      ],
    },
    {
      key: 'classes',
      icon: <CalendarOutlined />,
      label: 'Classes',
      children: [
        {
          key: '/admin/classes/list',
          label: 'View Classes',
        },
        {
          key: '/admin/classes/assign-teacher',
          label: 'Assign Teacher',
        },
        {
          key: '/admin/classes/syllabi',
          label: 'Syllabi',
        },
      ],
    },
    {
      key: 'syllabus',
      icon: <BookOutlined />,
      label: 'Syllabus',
    },
    {
      key: 'activities',
      icon: <FileTextOutlined />,
      label: 'Activities',
      children: [
        {
          key: '/admin/activities/list',
          label: 'View Activities',
        },
        {
          key: '/admin/activities/create',
          label: 'Create Activity',
        },
      ],
    },
    {
      key: 'news',
      icon: <NotificationOutlined />,
      label: 'News',
      children: [
        {
          key: '/admin/news/list',
          label: 'View News',
        },
        {
          key: '/admin/news/create',
          label: 'Create News',
        },
      ],
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
      children: [
        {
          key: '/admin/users/list',
          label: 'View Users',
        },
        {
          key: '/admin/users/create',
          label: 'Create User',
        },
      ],
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
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
