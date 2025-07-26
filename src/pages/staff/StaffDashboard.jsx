import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Statistic, Button, Spin, Avatar,
  List, Tag, Badge, Empty, Tooltip, Table, Input, DatePicker, Select, Space,
  AppstoreOutlined, TeamOutlined, UserOutlined,
  FormOutlined, BookOutlined, CalendarOutlined, BarChartOutlined,
  ProfileOutlined, DollarOutlined, SearchOutlined, FilterOutlined
} from '../../utils/AntComponents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './StaffDashboard.module.css';
import {
  getAllClasses, getAllApplications,
  getAllChildren, getAllTeachers, getTransactionHistory
} from '../../services/StaffService';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

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
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all required data in parallel
      const [classesData, applicationsData, childrenData, teachersData, transactionsData] = await Promise.all([
        getAllClasses(),
        getAllApplications(),
        getAllChildren(),
        getAllTeachers(),
        getTransactionHistory()
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

      // Get all transactions and sort by date (newest first)
      const allTransactions = transactionsData
        .sort((a, b) => new Date(b.date) - new Date(a.date));

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
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);

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

  // Search and filtering functionality
  const handleSearch = (value) => {
    setSearchText(value);
    filterTransactions(value, filterStatus, dateRange);
  };

  const handleStatusChange = (value) => {
    setFilterStatus(value);
    filterTransactions(searchText, value, dateRange);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    filterTransactions(searchText, filterStatus, dates);
  };

  const filterTransactions = (text, status, dates) => {
    let result = [...transactions];

    // Filter by search text
    if (text) {
      result = result.filter(
        item =>
          (item.id && item.id.toString().toLowerCase().includes(text.toLowerCase())) ||
          (item.name && item.name.toLowerCase().includes(text.toLowerCase())) ||
          (item.parentName && item.parentName.toLowerCase().includes(text.toLowerCase())) ||
          (item.childrenName && item.childrenName.toLowerCase().includes(text.toLowerCase()))
      );
    }

    // Filter by status
    if (status !== 'All') {
      result = result.filter(item => item.status === status);
    }

    // Filter by date range
    if (dates && dates.length === 2) {
      const startDate = dates[0].startOf('day');
      const endDate = dates[1].endOf('day');
      result = result.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredTransactions(result);
  };

  const resetFilters = () => {
    setSearchText('');
    setFilterStatus('All');
    setDateRange(null);
    setFilteredTransactions(transactions);
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
    <div className={styles.staffDashboardContainer}>
      <div className={styles.dashboardWelcomeHeader}>
        <div className={styles.welcomeContent}>
          <h1>Hello, <span className={styles.staffName}>Staff</span></h1>
          <p>Welcome back to Little Stars Preschool</p>
        </div>
        <div className={styles.dashboardDate}>
          <CalendarOutlined /> {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <Spin spinning={loading} tip="Loading data...">
        {/* Stats Row */}
        <Row gutter={[24, 24]} className={styles.statsRow}>
          <Col xs={24} sm={12} lg={8}>
            <Card variant="borderless" className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(74, 108, 247, 0.1)' }}>
                <BookOutlined style={{ color: '#4a6cf7' }} />
              </div>
              <Statistic
                title="Active classes"
                className={styles.antStatisticContent}
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
            <Card variant="borderless" className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(84, 214, 44, 0.1)' }}>
                <TeamOutlined style={{ color: '#54d62c' }} />
              </div>
              <Statistic
                title="Enrolled students"
                value={stats.enrolledStudents}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card variant="borderless" className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ backgroundColor: 'rgba(255, 171, 0, 0.1)' }}>
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
            <span className={styles.sectionTitle}>
              <AppstoreOutlined /> Quick access
            </span>
          }
          variant="borderless"
          className={styles.sectionCard}
        >
          <Row gutter={[24, 24]}>
            {quickAccessLinks.map(link => (
              <Col xs={24} sm={12} md={8} key={link.path}>
                <Link to={link.path} className={styles.quickAccessLink}>
                  <Card
                    variant="borderless"
                    hoverable
                    className={styles.quickAccessCard}
                  >
                    <div className={styles.quickAccessHeader}>
                      <div className={styles.quickIcon} style={{ backgroundColor: `${link.color}20`, color: link.color }}>
                        {link.icon}
                      </div>
                      <h3>{link.title}</h3>
                    </div>
                    <p className={styles.quickDescription}>{link.description}</p>
                    <div className={styles.quickAccessArrow}>
                      <FontAwesomeIcon icon="arrow-right" />
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Card>

        <Row gutter={[24, 24]} className={styles.dashboardSections}>
          {/* Recent Applications */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <span className={styles.sectionTitle}>
                  <FormOutlined /> Recent enrollment applications
                </span>
              }
              variant="borderless"
              className={styles.sectionCard}
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
                    <List.Item key={app.eaid} className={styles.appListItem}>
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<UserOutlined />} />
                        }
                        title={
                          <div className={styles.appTitle}>
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
                          <div className={styles.appDescription}>
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
                <span className={styles.sectionTitle}>
                  <BarChartOutlined /> Class status
                </span>
              }
              variant="borderless"
              className={styles.sectionCard}
              extra={
                <Link to="/staff/classes">
                  View all
                </Link>
              }
            >
              {classesByCapacity.length > 0 ? (
                <div className={styles.classCapacityList}>
                  {classesByCapacity.map((cls) => (
                    <Tooltip
                      key={cls.id}
                      title={
                        <div className={styles.classTooltipContent}>
                          <div className={styles.tooltipTitle}>Teacher:</div>
                          <div className={styles.tooltipContent}>
                            {cls.teacherNames && cls.teacherNames.length > 0 ?
                              cls.teacherNames.join(', ') :
                              'No teacher'
                            }
                          </div>
                        </div>
                      }
                      placement="right"
                    >
                      <div className={styles.classCapacityItemEnhanced}>
                        <div className={styles.classMainInfo}>
                          <div className={styles.classBadgeName}>
                            <div className={`${styles.classTypeBadge} ${cls.epName ? styles.enrichment : styles.regular}`}>
                              {cls.epName ? 'NK' : cls.gradeLevelName || 'L'}
                            </div>
                            <div className={styles.classNameText}>{cls.name}</div>
                          </div>
                          <div className={styles.capacityIndicator}>
                            <span className={cls.quantity >= cls.maxChildren ? styles.capacityFull :
                              cls.capacityPercent >= 75 ? styles.capacityHigh :
                                cls.capacityPercent >= 50 ? styles.capacityMedium : styles.capacityLow}>
                              {cls.quantity}/{cls.maxChildren}
                            </span>
                          </div>
                        </div>
                        <div className={styles.capacityProgressContainer}>
                          <div className={styles.capacityProgressBar}>
                            <div
                              className={`${styles.capacityProgressFill} ${cls.quantity >= cls.maxChildren ? styles.full :
                                cls.capacityPercent >= 75 ? styles.high :
                                  cls.capacityPercent >= 50 ? styles.medium : styles.low
                                }`}
                              style={{ width: `${cls.capacityPercent}%` }}
                            />
                          </div>
                          <div className={styles.capacityPercentage}>{cls.capacityPercent}%</div>
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

        {/* Transaction History Section - Full list with pagination and search */}
        <Card
          title={
            <span className={styles.sectionTitle}>
              <DollarOutlined /> Transaction History
            </span>
          }
          variant="borderless"
          className={styles.sectionCard}
        >
          <div className={styles.transactionSearchContainer}>
            <div className={styles.searchControls}>
              <Space wrap>
                <Search
                  placeholder="Search transactions..."
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  style={{ width: 250 }}
                />
                <Select
                  value={filterStatus}
                  onChange={handleStatusChange}
                  style={{ width: 120 }}
                >
                  <Option value="All">All Status</Option>
                  <Option value="Success">Success</Option>
                  <Option value="Failed">Failed</Option>
                  <Option value="Refunded">Refunded</Option>
                </Select>
                <RangePicker 
                  value={dateRange} 
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                />
                <Button onClick={resetFilters} icon={<FilterOutlined />}>
                  Reset
                </Button>
              </Space>
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className={styles.transactionHistoryContainer}>
              <Table
                dataSource={filteredTransactions}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (total) => `Total ${total} transactions`,
                }}
                size="small"
                className={styles.transactionTable}
                columns={[
                  {
                    title: 'Transaction Name',
                    dataIndex: 'name',
                    key: 'name',
                    ellipsis: false,
                    width: '25%',
                    render: (name, record) => (
                      <div className={styles.transactionNameCell}>
                        <div className={styles.transactionName}>{name}</div>
                        <div className={styles.transactionId}>ID: {record.id}</div>
                      </div>
                    )
                  },
                  {
                    title: 'Parent',
                    dataIndex: 'parentName',
                    key: 'parentName',
                    ellipsis: true,
                  },
                  {
                    title: 'Child',
                    dataIndex: 'childrenName',
                    key: 'childrenName',
                    ellipsis: true,
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: amount => <span className={styles.amount}>{amount.toLocaleString()} VND</span>,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: status => (
                      <Tag color={
                        status === 'Success' ? 'green' :
                        status === 'Failed' ? 'red' :
                        status === 'Refunded' ? 'orange' : 'blue'
                      }>
                        {status}
                      </Tag>
                    ),
                    filters: [
                      { text: 'Success', value: 'Success' },
                      { text: 'Failed', value: 'Failed' },
                      { text: 'Refunded', value: 'Refunded' },
                    ],
                    onFilter: (value, record) => record.status === value,
                  },
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                    render: date => formatDate(date),
                    sorter: (a, b) => new Date(a.date) - new Date(b.date),
                  },
                ]}
              />
            </div>
          ) : (
            <Empty description="No transaction data matching your search" />
          )}
        </Card>

        {/* Todo list and notifications section */}
        <Row gutter={[24, 24]} className={styles.dashboardSections}>
          <Col xs={24} lg={24}>
            <Card
              title={
                <span className={styles.sectionTitle}>
                  <ProfileOutlined /> Tasks to do
                </span>
              }
              variant="borderless"
              className={styles.sectionCard}
            >
              <div className={styles.taskItemList}>
                {stats.pendingApplications > 0 && (
                  <div className={`${styles.taskItem} ${styles.priorityHigh}`}>
                    <div className={styles.taskIcon}>
                      <FormOutlined />
                    </div>
                    <div className={styles.taskContent}>
                      <div className={styles.taskTitle}>
                        <span>Process enrollment applications</span>
                        <Badge count={stats.pendingApplications} style={{ backgroundColor: '#ff4d4f' }} />
                      </div>
                      <div className={styles.taskDescription}>
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

                <div className={`${styles.taskItem} ${styles.priorityMedium}`}>
                  <div className={styles.taskIcon}>
                    <BookOutlined />
                  </div>
                  <div className={styles.taskContent}>
                    <div className={styles.taskTitle}>
                      <span>Check class status</span>
                    </div>
                    <div className={styles.taskDescription}>
                      Update class status and assign students
                    </div>
                  </div>
                  <Button onClick={() => navigate('/staff/classes')}>
                    View class
                  </Button>
                </div>

                <div className={`${styles.taskItem} ${styles.priorityNormal}`}>
                  <div className={styles.taskIcon}>
                    <CalendarOutlined />
                  </div>
                  <div className={styles.taskContent}>
                    <div className={styles.taskTitle}>
                      <span>View schedule</span>
                    </div>
                    <div className={styles.taskDescription}>
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