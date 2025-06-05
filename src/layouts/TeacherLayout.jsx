import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

const { Header, Sider, Content } = Layout;

const TeacherLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
      key: 'lessons',
      icon: <BookOutlined />,
      label: <Link to="/teacher/lessons">Lessons</Link>,
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'white', margin: 0 }}>{collapsed ? 'PS' : 'Preschool'}</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ marginRight: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={3}>
              <Button type="text" icon={<MessageOutlined />} />
            </Badge>
            <Dropdown
              menu={{
                items: userMenuItems,
              }}
              placement="bottomRight"
            >
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
                <span style={{ marginRight: '8px' }}>Teacher Name</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
