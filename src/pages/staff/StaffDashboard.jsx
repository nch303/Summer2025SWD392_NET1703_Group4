import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Statistic, Button, Spin, Avatar,
  List, Tag, Progress, Tabs, Badge, Empty, Tooltip
} from 'antd';
import {
  AppstoreOutlined, TeamOutlined, UserOutlined,
  FormOutlined, BookOutlined, ScheduleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
  FileTextOutlined, CalendarOutlined, BarChartOutlined,
  ProfileOutlined, BellOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './staffDashboard.css';
import { getAllClasses, getAllApplications, getAllChildren, getAllTeachers } from '../../services/StaffService';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalTeachers: 0,
    totalStudents: 0,
    pendingApplications: 0,
    availableClasses: 0,
    enrolledStudents: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [classesByCapacity, setClassesByCapacity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [classesData, applicationsData, childrenData, teachersData] = await Promise.all([
        getAllClasses(),
        getAllApplications(),
        getAllChildren(),
        getAllTeachers()
      ]);

      // Process classes data
      const activeClasses = classesData.filter(c => c.status !== 'Deleted');
      const availableClasses = activeClasses.filter(c => c.status === 'Available');

      // Calculate enrollment stats
      const enrolledStudents = activeClasses.reduce((total, cls) => total + cls.quantity, 0);
      const pendingApplications = applicationsData.filter(app => app.status === 'Pending').length;

      // Set capacity-sorted classes (highest % filled first)
      const sortedClasses = [...activeClasses]
        .map(cls => ({
          ...cls,
          capacityPercent: Math.round((cls.quantity / cls.maxChildren) * 100)
        }))
        .sort((a, b) => b.capacityPercent - a.capacityPercent)
        .slice(0, 5); // Top 5 by capacity

      // Get recent applications
      const recentApps = applicationsData
        .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
        .slice(0, 5);

      // Update state with all data
      setStats({
        totalClasses: activeClasses.length,
        totalTeachers: childrenData.length,
        totalStudents: childrenData.length,
        pendingApplications,
        availableClasses: availableClasses.length,
        enrolledStudents
      });

      setRecentApplications(recentApps);
      setClassesByCapacity(sortedClasses);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Navigation shortcuts
  const quickAccessLinks = [
    {
      title: 'Class management',
      icon: <BookOutlined />,
      color: '#4a6cf7',
      path: '/staff/classes',
      description: 'View and manage class list'
    },
    {
      title: 'Student management',
      icon: <TeamOutlined />,
      color: '#54d62c',
      path: '/staff/students',
      description: 'Manage student information and records'
    },
    {
      title: 'Teacher assignment',
      icon: <UserOutlined />,
      color: '#a46bf5',
      path: '/staff/assign-teachers',
      description: 'Assign teachers to classes'
    },
    {
      title: 'Enrollment application',
      icon: <FormOutlined />,
      color: '#ffab00',
      path: '/staff/enrollment-applications',
      description: 'Process enrollment applications'
    },
    {
      title: 'Class assignment',
      icon: <AppstoreOutlined />,
      color: '#00bcd4',
      path: '/staff/assign-students',
      description: 'Assign students to classes'
    },
    {
      title: 'Refund list',
      icon: <ProfileOutlined />,
      color: '#ff5555',
      path: '/staff/refund-list',
      description: 'View refund list'
    }
  ];

  return (
    <div className="staff-dashboard-container">
      <div className="dashboard-welcome-header">
        <div className="welcome-content">
          <h1>Hello, <span className="staff-name">Staff</span></h1>
          <p>Welcome back to Little Stars Preschool</p>
        </div>
        <div className="dashboard-date">
          <CalendarOutlined /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <Spin spinning={loading} tip="Loading data...">
        {/* Stats Row */}
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} sm={12} lg={8}>
            <Card variant="borderless" className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(74, 108, 247, 0.1)' }}>
                <BookOutlined style={{ color: '#4a6cf7' }} />
              </div>
              <Statistic
                title="Active classes"
                className="staff-dashboard-ant-statistic-content"
                value={stats.totalClasses}
                suffix={
                  <Tag color="blue">
                    {stats.availableClasses} classes can accept students
                  </Tag>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card variant="borderless" className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(84, 214, 44, 0.1)' }}>
                <TeamOutlined style={{ color: '#54d62c' }} />
              </div>
              <Statistic
                title="Enrolled students"
                value={stats.enrolledStudents}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card variant="borderless" className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(255, 171, 0, 0.1)' }}>
                <FormOutlined style={{ color: '#ffab00' }} />
              </div>
              <Statistic
                title="Enrollment applications pending"
                value={stats.pendingApplications}
                valueStyle={{ color: stats.pendingApplications > 0 ? '#ffab00' : undefined }}
              />
              {stats.pendingApplications > 0 && (
                <Button
                  type="primary"
                  size="small"
                  icon={<FormOutlined />}
                  style={{ marginTop: 16, background: '#ffab00', borderColor: '#ffab00' }}
                  onClick={() => navigate('/staff/enrollment-applications')}
                >
                  Process now
                </Button>
              )}
            </Card>
          </Col>
        </Row>

        {/* Quick Access Section */}
        <Card
          title={
            <span className="staff-dashboard-section-title">
              <AppstoreOutlined /> Quick access
            </span>
          }
          variant="borderless"
          className="section-card"
        >
          <Row gutter={[24, 24]}>
            {quickAccessLinks.map(link => (
              <Col xs={24} sm={12} md={8} key={link.path}>
                <Link to={link.path} className="quick-access-link">
                  <Card
                    variant="borderless"
                    hoverable
                    className="quick-access-card"
                  >
                    <div className="quick-access-header">
                      <div className="quick-icon" style={{ backgroundColor: `${link.color}20`, color: link.color }}>
                        {link.icon}
                      </div>
                      <h3>{link.title}</h3>
                    </div>
                    <p className="quick-description">{link.description}</p>
                    <div className="quick-access-arrow">
                      <FontAwesomeIcon icon="arrow-right" />
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Card>

        <Row gutter={[24, 24]} className="dashboard-sections">
          {/* Recent Applications */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span className="staff-dashboard-section-title">
                  <FormOutlined /> Recent enrollment applications
                </span>
              }
              variant="borderless"
              className="section-card"
              extra={
                <Link to="/staff/enrollment-applications">
                  View all
                </Link>
              }
            >
              {recentApplications.length > 0 ? (
                <List
                  dataSource={recentApplications}
                  renderItem={(app) => (
                    <List.Item key={app.eaid} className="app-list-item">
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<UserOutlined />} />
                        }
                        title={
                          <div className="app-title">
                            <span>{app.childrenName}</span>
                            <Tag color={
                              app.status === 'Paid' ? 'green' :
                                app.status === 'Enrolled' ? 'green' :
                                  app.status === 'Approved' ? 'green' :
                                    app.status === 'Pending' ? 'orange' : 'red'
                            }>
                              {app.status === 'Paid' ? 'Paid' :
                                app.status === 'Enrolled' ? 'Enrolled' :
                                  app.status === 'Approved' ? 'Approved' :
                                    app.status === 'Pending' ? 'Pending' : 'Rejected'}
                            </Tag>
                          </div>
                        }
                        description={
                          <div className="app-description">
                            <span>Parent: {app.parentName}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No recent enrollment applications" />
              )}
            </Card>
          </Col>

          {/* Class Capacity - Enhanced Design without visible teachers */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span className="staff-dashboard-section-title">
                  <BarChartOutlined /> Class status
                </span>
              }
              variant="borderless"
              className="section-card class-capacity-card"
              extra={
                <Link to="/staff/classes">
                  View all
                </Link>
              }
            >
              {classesByCapacity.length > 0 ? (
                <div className="class-capacity-list">
                  {classesByCapacity.map((cls) => (
                    <Tooltip
                      key={cls.id}
                      title={
                        <div className="class-tooltip-content">
                          <div className="tooltip-title">Teacher:</div>
                          <div className="tooltip-content">
                            {cls.teacherNames && cls.teacherNames.length > 0 ?
                              cls.teacherNames.join(', ') :
                              'No teacher'
                            }
                          </div>
                        </div>
                      }
                      placement="right"
                    >
                      <div className="class-capacity-item-enhanced">
                        <div className="class-main-info">
                          <div className="class-badge-name">
                            <div className={`class-type-badge ${cls.epName ? 'enrichment' : 'regular'}`}>
                              {cls.epName ? 'NK' : cls.gradeLevelName || 'L'}
                            </div>
                            <div className="class-name-text">{cls.name}</div>
                          </div>
                          <div className="capacity-indicator">
                            <span className={cls.quantity >= cls.maxChildren ? 'capacity-full' :
                              cls.capacityPercent >= 75 ? 'capacity-high' :
                                cls.capacityPercent >= 50 ? 'capacity-medium' : 'capacity-low'}>
                              {cls.quantity}/{cls.maxChildren}
                            </span>
                          </div>
                        </div>
                        <div className="capacity-progress-container">
                          <div className="capacity-progress-bar">
                            <div
                              className={`capacity-progress-fill ${cls.quantity >= cls.maxChildren ? 'full' :
                                  cls.capacityPercent >= 75 ? 'high' :
                                    cls.capacityPercent >= 50 ? 'medium' : 'low'
                                }`}
                              style={{ width: `${cls.capacityPercent}%` }}
                            />
                          </div>
                          <div className="capacity-percentage">{cls.capacityPercent}%</div>
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <Empty description="No class data" />
              )}
            </Card>
          </Col>
        </Row>

        {/* Todo list and notifications section */}
        <Row gutter={[24, 24]} className="dashboard-sections">
          <Col xs={24} lg={24}>
            <Card
              title={
                <span className="staff-dashboard-section-title">
                  <ProfileOutlined /> Tasks to do
                </span>
              }
              variant="borderless"
              className="section-card todo-card"
            >
              <div className="task-item-list">
                {stats.pendingApplications > 0 && (
                  <div className="task-item priority-high">
                    <div className="task-icon">
                      <FormOutlined />
                    </div>
                    <div className="task-content">
                      <div className="task-title">
                        <span>Process enrollment applications</span>
                        <Badge count={stats.pendingApplications} style={{ backgroundColor: '#ff4d4f' }} />
                      </div>
                      <div className="task-description">
                        There are {stats.pendingApplications} enrollment applications pending
                      </div>
                    </div>
                    <Button
                      type="primary"
                      danger
                      onClick={() => navigate('/staff/enrollment-applications')}
                    >
                      Process
                    </Button>
                  </div>
                )}

                <div className="task-item priority-medium">
                  <div className="task-icon">
                    <BookOutlined />
                  </div>
                  <div className="task-content">
                    <div className="task-title">
                      <span>Check class status</span>
                    </div>
                    <div className="task-description">
                      Update class status and assign students
                    </div>
                  </div>
                  <Button onClick={() => navigate('/staff/classes')}>
                    View class
                  </Button>
                </div>

                <div className="task-item priority-normal">
                  <div className="task-icon">
                    <CalendarOutlined />
                  </div>
                  <div className="task-content">
                    <div className="task-title">
                      <span>View schedule</span>
                    </div>
                    <div className="task-description">
                      Check schedule and confirm class schedule
                    </div>
                  </div>
                  <Button onClick={() => navigate('/staff/schedule')}>
                    View schedule
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default StaffDashboard;