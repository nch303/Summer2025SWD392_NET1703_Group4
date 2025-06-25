import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Tag, Spin, Empty, Badge, Statistic, Input, 
  Segmented, Button, Tooltip, Progress, Tabs, Skeleton, Avatar, Dropdown 
} from 'antd';
import { 
  TeamOutlined, ReadOutlined, BookOutlined, SearchOutlined, 
  AppstoreOutlined, UnorderedListOutlined, FilterOutlined, 
  EllipsisOutlined, FileTextOutlined, UserOutlined, CalendarOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getClassesByTeacherId, getStatusColor } from './TeacherClassService';
import './TeacherClass.css';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const TeacherClass = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [searchValue, setSearchValue] = useState('');
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (currentUser?.id) {
          const data = await getClassesByTeacherId(currentUser.id);
          setClasses(data);
          setFilteredClasses(data);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [currentUser]);

  // Hàm tìm kiếm/lọc lớp học
  const handleSearch = (value) => {
    setSearchValue(value);
    const filtered = classes.filter(classItem => 
      classItem.name.toLowerCase().includes(value.toLowerCase()) ||
      classItem.syllabusName.toLowerCase().includes(value.toLowerCase()) ||
      classItem.gradeLevelName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClasses(filtered);
  };

  // Render skeleton loading
  const renderSkeletons = () => {
    return Array(6).fill().map((_, index) => (
      <Col key={index} xs={24} sm={12} md={8} lg={8}>
        <Card className="class-card">
          <Skeleton active avatar paragraph={{ rows: 3 }} />
        </Card>
      </Col>
    ));
  };

  // Tính tổng số học sinh và lớp học
  const totalStudents = classes.reduce((total, classItem) => total + classItem.quantity, 0);
  const activeClasses = classes.filter(c => c.status === 'Available').length;

  // Menu cho các actions
  const moreMenu = (classId) => {
    return {
      items: [
        {
          key: '1',
          label: <Link to={`/teacher/classes/${classId}`}>Xem chi tiết lớp học</Link>,
          icon: <TeamOutlined />,
        },
        {
          key: '2',
          label: <span>Xem giáo trình</span>,
          icon: <BookOutlined />,
        },
        {
          key: '3',
          label: <Link to={`/teacher/classes/${classId}/view-all-attendance`}>Lịch sử điểm danh</Link>,
          icon: <FileTextOutlined />,
        },
        {
          key: '4',
          label: <span>Báo cáo tiến độ</span>,
          icon: <PieChartOutlined />,
        },
      ],
    };
  };

  // Render grid view
  const renderGridView = () => (
    <Row gutter={[24, 24]}>
      {filteredClasses.map((classItem) => (
        <Col key={classItem.id} xs={24} sm={12} md={8} lg={8}>
          <Card 
            className="class-card" 
            hoverable
            extra={
              <Tag color={getStatusColor(classItem.status)} className="status-tag">
                {classItem.status}
              </Tag>
            }
            actions={[
              <div key="students">
                <TeamOutlined />
                <Text>{classItem.quantity}/{classItem.maxChildren}</Text>
              </div>,
              <Link to={`/teacher/classes/${classItem.id}/check-attendance`} key="attendance">
                <FileTextOutlined />
                <Text>Điểm danh</Text>
              </Link>,
              <Dropdown menu={moreMenu(classItem.id)} trigger={['click']}>
                <Button type="text">
                  <EllipsisOutlined />
                </Button>
              </Dropdown>
            ]}
          >
            <Link to={`/teacher/classes/${classItem.id}`} className="content-link">
              <div className="class-content">
                <div className="class-avatar-container">
                  <div className="class-avatar">
                    {classItem.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="class-main-info">
                  <div className="class-name-container">
                    <Title level={4} className="class-name">{classItem.name}</Title>
                    <Tag color="blue" className="grade-tag">{classItem.gradeLevelName}</Tag>
                  </div>
                  
                  <div className="class-curriculum">
                    <Text type="secondary">Giáo trình</Text>
                    <Text className="curriculum-name" ellipsis>{classItem.syllabusName}</Text>
                  </div>
                  
                  <div className="student-count">
                    <Text type="secondary">Sĩ số lớp</Text>
                    <Progress 
                      percent={Math.round((classItem.quantity / classItem.maxChildren) * 100)} 
                      size="small"
                      format={() => `${classItem.quantity}/${classItem.maxChildren}`}
                      status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Render list view
  const renderListView = () => (
    <div className="class-list-view">
      {filteredClasses.map((classItem) => (
        <Card className="class-list-card" key={classItem.id} hoverable>
          <div className="list-card-content">
            <div className="list-card-left">
              <Avatar size={60} className="list-avatar">
                {classItem.name.charAt(0).toUpperCase()}
              </Avatar>
            </div>
            
            <div className="list-card-middle">
              <div className="list-card-title">
                <Title level={4}>{classItem.name}</Title>
                <Tag color={getStatusColor(classItem.status)}>
                  {classItem.status}
                </Tag>
              </div>
              <div className="list-card-details">
                <Tag icon={<BookOutlined />} color="processing">
                  {classItem.syllabusName}
                </Tag>
                <Tag icon={<TeamOutlined />} color="success">
                  {classItem.quantity}/{classItem.maxChildren} học sinh
                </Tag>
                <Tag icon={<UserOutlined />} color="warning">
                  {classItem.gradeLevelName}
                </Tag>
                {classItem.epName && (
                  <Tag icon={<CalendarOutlined />} color="default">
                    {classItem.epName}
                  </Tag>
                )}
              </div>
            </div>
            
            <div className="list-card-right">
              <Progress 
                type="circle" 
                percent={Math.round((classItem.quantity / classItem.maxChildren) * 100)} 
                width={50}
                format={() => `${Math.round((classItem.quantity / classItem.maxChildren) * 100)}%`}
                status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
              />
            </div>
            
            <div className="list-card-actions">
              <Link to={`/teacher/classes/${classItem.id}`}>
                <Button type="primary" icon={<TeamOutlined />}>Xem lớp</Button>
              </Link>
              <Link to={`/teacher/classes/${classItem.id}/check-attendance`}>
                <Button icon={<FileTextOutlined />}>Điểm danh</Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
  
  // Render empty state
  const renderEmpty = () => (
    <div className="empty-state">
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{ height: 160 }}
        description={
          <span>
            {searchValue 
              ? "Không tìm thấy lớp học phù hợp với từ khóa" 
              : "Bạn chưa được phân công lớp học nào"}
          </span>
        }
      >
        {searchValue && (
          <Button type="primary" onClick={() => handleSearch('')}>
            Xem tất cả lớp học
          </Button>
        )}
      </Empty>
    </div>
  );

  // Dashboard tổng quan
  const renderDashboard = () => (
    <div className="class-dashboard">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="dashboard-card total-classes">
            <div className="dashboard-card-content">
              <div className="dashboard-icon">
                <ReadOutlined />
              </div>
              <div className="dashboard-info">
                <div className="dashboard-value">{classes.length}</div>
                <div className="dashboard-label">Tổng số lớp</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="dashboard-card total-students">
            <div className="dashboard-card-content">
              <div className="dashboard-icon">
                <TeamOutlined />
              </div>
              <div className="dashboard-info">
                <div className="dashboard-value">{totalStudents}</div>
                <div className="dashboard-label">Tổng số học sinh</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="dashboard-card active-classes">
            <div className="dashboard-card-content">
              <div className="dashboard-icon">
                <BookOutlined />
              </div>
              <div className="dashboard-info">
                <div className="dashboard-value">{activeClasses}</div>
                <div className="dashboard-label">Lớp đang hoạt động</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Replace Tabs with TabPane children with the items array approach
  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả lớp học',
      children: filteredClasses.length === 0 ? 
        renderEmpty() : 
        (viewType === 'grid' ? renderGridView() : renderListView())
    },
    {
      key: 'active',
      label: 'Lớp đang hoạt động',
      children: null // Replace with actual content when needed
    },
    {
      key: 'full',
      label: 'Lớp đầy',
      children: null // Replace with actual content when needed
    }
  ];

  return (
    <div className="teacher-class-container">
      <div className="class-header">
        <div className="header-top">
          <div className="header-left">
            <Title level={2}>Lớp học của tôi</Title>
            <Text>Quản lý và xem thông tin các lớp học được phân công</Text>
          </div>
        </div>
        
        {!loading && classes.length > 0 && (
          <div className="header-actions">
            <div className="search-filter">
              <Search
                placeholder="Tìm kiếm lớp học..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: 300 }}
              />
              
              <Dropdown menu={{
                items: [
                  {
                    key: '1',
                    label: 'Tất cả lớp học',
                  },
                  {
                    key: '2',
                    label: 'Lớp đang hoạt động',
                  },
                  {
                    key: '3',
                    label: 'Lớp đã đầy',
                  },
                ],
              }} trigger={['click']}>
                <Button icon={<FilterOutlined />} size="large">
                  Lọc
                </Button>
              </Dropdown>
            </div>
            
            <Segmented
              options={[
                {
                  value: 'grid',
                  icon: <AppstoreOutlined />,
                },
                {
                  value: 'list',
                  icon: <UnorderedListOutlined />,
                },
              ]}
              value={viewType}
              onChange={setViewType}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          {renderDashboard()}
          <div className="skeleton-container">
            <Row gutter={[24, 24]}>
              {renderSkeletons()}
            </Row>
          </div>
        </div>
      ) : (
        <>
          {classes.length > 0 && renderDashboard()}

          <Tabs 
            defaultActiveKey="all" 
            className="class-tabs" 
            items={tabItems}
          />
        </>
      )}
    </div>
  );
};

export default TeacherClass;
