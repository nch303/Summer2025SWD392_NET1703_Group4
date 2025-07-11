import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout, Menu, Avatar, Dropdown, Badge, Button,
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
  DollarOutlined,
} from '../utils/AntComponents';
import { useUser } from '../contexts/UserContext';
import Navbar from '../components/Navbar';
import styles from './AdminLayout.module.css';
import ScrollToTopButton from '../components/ScrollToTopButton';

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
      key: '/admin/users/list',
      icon: <UserOutlined />,
      label: 'Users',
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
      key: '/admin/classes/list',
      icon: <CalendarOutlined />,
      label: 'Classes',
    },
    {
      key: '/admin/syllabus',
      icon: <FileTextOutlined />,
      label: 'Syllabus',
    },
    {
      key: '/admin/tuition-fees',
      icon: <DollarOutlined />,
      label: 'Tuition Fees',
    },
    {
      key: '/admin/enrichment',
      icon: <BookOutlined />,
      label: 'Enrichment Activities',
    },
    {
      key: '/admin/enrichment-participants',
      icon: <BarChartOutlined />,
      label: 'Enrichment Participants',
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
    <div className={styles.adminNavbarWrapper}>
      <Navbar />
      <Layout className={styles.adminLayout}>
        <Sider
          width={250}
          className={styles.adminSider}
          collapsed={collapsed}
          collapsible
          trigger={null}
        >
          <div className={styles.adminLogo}>
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
          <Header className={styles.adminHeader}>
            <div className={styles.headerLeft}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className={styles.triggerButton}
              />
              <h1>Little Stars Preschool</h1>
            </div>
            <div className={styles.headerRight}>
              <Badge count={5} className={styles.notificationBadge}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className={styles.notificationButton}
                />
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
              >
                <div className={styles.userProfile}>
                  <Avatar icon={<UserOutlined />} />
                  <span className={styles.username}>Admin</span>
                </div>
              </Dropdown>
            </div>
          </Header>
          <Content className="admin-content">
            <Outlet />
          </Content>
          <ScrollToTopButton />
        </Layout>
      </Layout>
    </div>
  );
};

export default AdminLayout;
