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
import { getAllClasses } from './StaffClassService';
import { getAllApplications } from './EnrollmentApplicationManagementService';
import { getAllChildren } from '../staff-children-management/ChildrenManagementService';
import { getAllTeachers } from '../staff-assign-teacher/StaffAssignTeacherService';

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
      title: 'Quản lý lớp học',
      icon: <BookOutlined />,
      color: '#4a6cf7',
      path: '/staff/classes',
      description: 'Xem và quản lý danh sách lớp học'
    },
    {
      title: 'Quản lý học sinh',
      icon: <TeamOutlined />,
      color: '#54d62c',
        path: '/staff/students',
      description: 'Quản lý thông tin và hồ sơ học sinh'
    },
    {
      title: 'Phân công giáo viên',
      icon: <UserOutlined />,
      color: '#a46bf5',
      path: '/staff/assign-teachers',
      description: 'Phân công giáo viên cho các lớp học'
    },
    {
      title: 'Đơn nhập học',
      icon: <FormOutlined />,
      color: '#ffab00',
      path: '/staff/enrollment-applications',
      description: 'Xử lý các đơn đăng ký nhập học'
    },
    {
      title: 'Xếp lớp',
      icon: <AppstoreOutlined />,
      color: '#00bcd4',
      path: '/staff/assign-students',
      description: 'Phân bổ học sinh vào lớp học'
    },
    {
      title: 'Lịch học',
      icon: <CalendarOutlined />,
      color: '#ff5555',
      path: '/staff/schedule',
      description: 'Xem lịch học và phân công'
    }
  ];

  return (
    <div className="staff-dashboard-container">
      <div className="dashboard-welcome-header">
        <div className="welcome-content">
          <h1>Xin chào, <span className="staff-name">Nhân viên</span></h1>
          <p>Chào mừng quay trở lại trang quản lý Little Stars Preschool</p>
        </div>
        <div className="dashboard-date">
          <CalendarOutlined /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        {/* Stats Row */}
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} sm={12} lg={8}>
            <Card variant="borderless" className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(74, 108, 247, 0.1)' }}>
                <BookOutlined style={{ color: '#4a6cf7' }} />
              </div>
              <Statistic
                title="Lớp học đang hoạt động"
                className="staff-dashboard-ant-statistic-content"
                value={stats.totalClasses}
                suffix={
                  <Tag color="blue">
                    {stats.availableClasses} lớp có thể nhận học sinh
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
                title="Học sinh đã nhập học"
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
                title="Đơn nhập học chờ xử lý"
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
                  Xử lý ngay
                </Button>
              )}
            </Card>
          </Col>
        </Row>

        {/* Quick Access Section */}
        <Card
          title={
            <span className="section-title">
              <AppstoreOutlined /> Truy cập nhanh
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
                <span className="section-title">
                  <FormOutlined /> Đơn nhập học gần đây
                </span>
              }
              variant="borderless"
              className="section-card"
              extra={
                <Link to="/staff/enrollment-applications">
                  Xem tất cả
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
                              {app.status === 'Paid' ? 'Đã thanh toán' :
                                app.status === 'Enrolled' ? 'Đã xếp lớp' :
                                  app.status === 'Approved' ? 'Đã duyệt' :
                                    app.status === 'Pending' ? 'Chờ duyệt' : 'Đã từ chối'}
                            </Tag>
                          </div>
                        }
                        description={
                          <div className="app-description">
                            <span>Phụ huynh: {app.parentName}</span>
                            <span>Ngày đăng ký: {formatDate(app.applicationDate)}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Không có đơn nhập học gần đây" />
              )}
            </Card>
          </Col>

          {/* Class Capacity - Enhanced Design without visible teachers */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span className="section-title">
                  <BarChartOutlined /> Tình trạng lớp học
                </span>
              }
              variant="borderless"
              className="section-card class-capacity-card"
              extra={
                <Link to="/staff/classes">
                  Xem tất cả
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
                          <div className="tooltip-title">Giáo viên:</div>
                          <div className="tooltip-content">
                            {cls.teacherNames && cls.teacherNames.length > 0 ? 
                              cls.teacherNames.join(', ') : 
                              'Chưa có'
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
                              className={`capacity-progress-fill ${
                                cls.quantity >= cls.maxChildren ? 'full' : 
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
                <Empty description="Không có dữ liệu lớp học" />
              )}
            </Card>
          </Col>
        </Row>

        {/* Todo list and notifications section */}
        <Row gutter={[24, 24]} className="dashboard-sections">
          <Col xs={24} lg={24}>
            <Card
              title={
                <span className="section-title">
                  <ProfileOutlined /> Công việc cần làm
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
                        <span>Xử lý đơn nhập học</span>
                        <Badge count={stats.pendingApplications} style={{ backgroundColor: '#ff4d4f' }} />
                      </div>
                      <div className="task-description">
                        Có {stats.pendingApplications} đơn nhập học đang chờ được xử lý
                      </div>
                    </div>
                    <Button
                      type="primary"
                      danger
                      onClick={() => navigate('/staff/enrollment-applications')}
                    >
                      Xử lý
                    </Button>
                  </div>
                )}

                <div className="task-item priority-medium">
                  <div className="task-icon">
                    <BookOutlined />
                  </div>
                  <div className="task-content">
                    <div className="task-title">
                      <span>Kiểm tra lớp học</span>
                    </div>
                    <div className="task-description">
                      Cập nhật trạng thái và phân bổ học sinh cho các lớp học
                    </div>
                  </div>
                  <Button onClick={() => navigate('/staff/classes')}>
                    Xem lớp học
                  </Button>
                </div>

                <div className="task-item priority-normal">
                  <div className="task-icon">
                    <CalendarOutlined />
                  </div>
                  <div className="task-content">
                    <div className="task-title">
                      <span>Xem lịch học</span>
                    </div>
                    <div className="task-description">
                      Kiểm tra lịch học và xác nhận thời khóa biểu các lớp
                    </div>
                  </div>
                  <Button onClick={() => navigate('/staff/schedule')}>
                    Xem lịch
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