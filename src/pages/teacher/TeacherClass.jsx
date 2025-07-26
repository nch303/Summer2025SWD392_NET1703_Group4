import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Tag, Empty, Input,
  Segmented, Button, Progress, Tabs, Skeleton, Avatar, Dropdown, Select,
  Title, Text, Search,
  TeamOutlined, ReadOutlined, BookOutlined, SearchOutlined,
  AppstoreOutlined, UnorderedListOutlined, FilterOutlined,
  EllipsisOutlined, FileTextOutlined, UserOutlined, CalendarOutlined,
  PieChartOutlined, LeftOutlined, RightOutlined
} from '../../utils/AntComponents';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { getClassesByTeacherId, getStatusColor } from '../../services/TeacherService';
import styles from './TeacherClass.module.css';

const { Option } = Select;

const TeacherClass = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [searchValue, setSearchValue] = useState('');
  const [academicYears, setAcademicYears] = useState(['all']);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0); // Track index instead of value
  const { currentUser } = useUser();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Update the useEffect that extracts academic years
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (currentUser?.id) {
          const data = await getClassesByTeacherId(currentUser.id);
          setClasses(data);
          
          // Extract unique academic years
          const years = extractAcademicYears(data);
          setAcademicYears(years);
          
          // Set default to current academic year
          const currentYear = getCurrentAcademicYear();
          const currentYearIndex = years.indexOf(currentYear);
          
          // If current year exists in the list, select it
          if (currentYearIndex !== -1) {
            setSelectedYearIndex(currentYearIndex);
          }
          
          // Set filtered classes
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
  
  // Extract academic years from classes
  const extractAcademicYears = (classList) => {
    const yearsSet = new Set();
    
    classList.forEach(classItem => {
      // Extract academic year from the class data
      const year = classItem.academicYear || getCurrentAcademicYear();
      yearsSet.add(year);
    });
    
    // Sort years but don't add "all" option
    return Array.from(yearsSet).sort();
  };
  
  // Get current academic year
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-based
    
    // Academic year typically starts in September
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  // Combined filter function
  const applyFilters = () => {
    let result = [...classes];
    
    // Apply search filter
    if (searchValue) {
      result = result.filter(classItem =>
        classItem.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (classItem.syllabusName && classItem.syllabusName.toLowerCase().includes(searchValue.toLowerCase())) ||
        (classItem.gradeLevelName && classItem.gradeLevelName.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }
    
    // Apply academic year filter if there are years available
    if (academicYears.length > 0 && selectedYearIndex >= 0 && selectedYearIndex < academicYears.length) {
      const selectedYear = academicYears[selectedYearIndex];
      result = result.filter(classItem => {
        const classYear = classItem.academicYear || getCurrentAcademicYear();
        return classYear === selectedYear;
      });
    }
    
    setFilteredClasses(result);
  };

  // Navigation functions for academic year
  const goToPreviousYear = () => {
    if (selectedYearIndex > 0) {
      setSelectedYearIndex(selectedYearIndex - 1);
    }
  };

  const goToNextYear = () => {
    if (selectedYearIndex < academicYears.length - 1) {
      setSelectedYearIndex(selectedYearIndex + 1);
    }
  };

  // Update filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [selectedYearIndex, searchValue, classes]);

  // Hàm tìm kiếm/lọc lớp học
  const handleSearch = (value) => {
    setSearchValue(value);
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
  const moreMenu = (classItem) => {
    return {
      items: [
        {
          key: '1',
          label: <Link to={`/teacher/classes/${classItem.id}`}>View class details</Link>,
          icon: <TeamOutlined />,
        },
        {
          key: '2',
          label: <Link to={`/teacher/syllabus?syllabusId=${classItem.syllabusID || classItem.syllabusId}&openDrawer=true`}>View syllabus</Link>,
          icon: <BookOutlined />,
        },
        {
          key: '3',
          label: <Link to={`/teacher/classes/${classItem.id}/view-all-attendance`}>Attendance history</Link>,
          icon: <FileTextOutlined />,
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
            className={styles.classCard}
            hoverable
            actions={[
              <div key="students">
                <TeamOutlined />
                <Text>{classItem.quantity}/{classItem.maxChildren}</Text>
              </div>,
              <Link to={`/teacher/classes/${classItem.id}/check-attendance`} key="attendance">
                <FileTextOutlined />
                <Text>Attendance</Text>
              </Link>,
              <Dropdown menu={moreMenu(classItem)} trigger={['click']}>
                <Button type="text">
                  <EllipsisOutlined />
                </Button>
              </Dropdown>
            ]}
          >
            <div className={styles.teacherClassStatusBadge}>
              <Tag color={getStatusColor(classItem.status)}>
                {classItem.status}
              </Tag>
            </div>

            <Link to={`/teacher/classes/${classItem.id}`} className={styles.contentLink}>
              <div className={styles.classCardHeader}>
                <div className={styles.classAvatar}>
                  {classItem.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.classTitleContainer}>
                  <Title level={4} className={styles.className}>{classItem.name}</Title>
                  <div className={styles.classTags}>
                    {classItem.gradeLevelName && <Tag color="blue">{classItem.gradeLevelName}</Tag>}
                  </div>
                </div>
              </div>

              <div className={styles.classDetails}>
                <div className={styles.classInfoRow}>
                  <Text type="secondary">Syllabus:</Text>
                  <Text strong ellipsis>{classItem.syllabusName}</Text>
                </div>

                <div className={styles.classInfoRow}>
                  <Text type="secondary">Number of students:</Text>
                  <div className={styles.studentProgress}>
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
    <div className={styles.classListView}>
      {filteredClasses.map((classItem) => (
        <Card className={styles.classListCard} key={classItem.id} hoverable>
          <div className={styles.listCardContent}>
            <div className={styles.listCardLeft}>
              <Avatar size={60} className={styles.listAvatar}>
                {classItem.name.charAt(0).toUpperCase()}
              </Avatar>
            </div>

            <div className={styles.listCardMiddle}>
              <div className={styles.listCardTitle}>
                <Title level={4}>{classItem.name}</Title>
                <Tag color={getStatusColor(classItem.status)}>
                  {classItem.status}
                </Tag>
              </div>
              <div className={styles.listCardDetails}>
                <Tag icon={<BookOutlined />} color="processing">
                  {classItem.syllabusName}
                </Tag>
                <Tag icon={<TeamOutlined />} color="success">
                  {classItem.quantity}/{classItem.maxChildren} students
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

            <div className={styles.listCardRight}>
              <Progress
                type="circle"
                percent={Math.round((classItem.quantity / classItem.maxChildren) * 100)}
                size={50}
                format={() => `${Math.round((classItem.quantity / classItem.maxChildren) * 100)}%`}
                status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
              />
            </div>

            <div className={styles.listCardActions}>
              <Link to={`/teacher/classes/${classItem.id}`}>
                <Button type="primary" icon={<TeamOutlined />}>View class</Button>
              </Link>
              <Link to={`/teacher/classes/${classItem.id}/check-attendance`}>
                <Button icon={<FileTextOutlined />}>Attendance</Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Render empty state
  const renderEmpty = () => (
    <div className={styles.emptyState}>
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{ height: 160 }}
        description={
          <span>
            {searchValue
              ? "No class found matching the keyword"
              : "You haven't been assigned any class"}
          </span>
        }
      >
        {searchValue && (
          <Button type="primary" onClick={() => handleSearch('')}>
            View all classes
          </Button>
        )}
      </Empty>
    </div>
  );

  // Dashboard tổng quan
  const renderDashboard = () => (
    <div className={styles.classDashboard}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className={`${styles.dashboardCard} ${styles.totalClasses}`}>
            <div className={styles.dashboardCardContent}>
              <div className={styles.dashboardIcon}>
                <ReadOutlined />
              </div>
              <div className={styles.dashboardInfo}>
                <div className={styles.dashboardValue}>{classes.length}</div>
                <div className={styles.dashboardLabel}>Total number of classes</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={`${styles.dashboardCard} ${styles.totalStudents}`}>
            <div className={styles.dashboardCardContent}>
              <div className={styles.dashboardIcon}>
                <TeamOutlined />
              </div>
              <div className={styles.dashboardInfo}>
                <div className={styles.dashboardValue}>{totalStudents}</div>
                <div className={styles.dashboardLabel}>Total number of students</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className={`${styles.dashboardCard} ${styles.activeClasses}`}>
            <div className={styles.dashboardCardContent}>
              <div className={styles.dashboardIcon}>
                <BookOutlined />
              </div>
              <div className={styles.dashboardInfo}>
                <div className={styles.dashboardValue}>{activeClasses}</div>
                <div className={styles.dashboardLabel}>Active classes</div>
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
      label: 'All classes',
      children: filteredClasses.length === 0 ?
        renderEmpty() :
        (viewType === 'grid' ? renderGridView() : renderListView())
    },
  ];

  return (
    <div className={styles.teacherClassContainer}>
      <div className={styles.classHeader}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <Title level={2}>My classes</Title>
            <Text>Manage and view information about the classes assigned to me</Text>
          </div>
        </div>

        {!loading && classes.length > 0 && (
          <div className={styles.headerActions}>
            <div className={styles.searchFilter}>
              <Search
                placeholder="Search classes..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={e => setSearchValue(e.target.value)}
                style={{ width: 300 }}
              />
              
              <div className={styles.academicYearNavigator}>
                <Button 
                  icon={<LeftOutlined />} 
                  onClick={goToPreviousYear}
                  disabled={selectedYearIndex === 0}
                  className={styles.yearNavButton}
                />
                <div className={styles.yearDisplay}>
                  {academicYears.length > 0 && selectedYearIndex >= 0 && selectedYearIndex < academicYears.length ? 
                    academicYears[selectedYearIndex] : 'No academic years'}
                </div>
                <Button 
                  icon={<RightOutlined />} 
                  onClick={goToNextYear}
                  disabled={selectedYearIndex === academicYears.length - 1}
                  className={styles.yearNavButton}
                />
              </div>

              <Dropdown menu={{
                items: [
                  {
                    key: '1',
                    label: 'All classes',
                  },
                ],
              }} trigger={['click']}>
                <Button icon={<FilterOutlined />} size="large">
                  Filter
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
        <div className={styles.loadingState}>
          {renderDashboard()}
          <div className={styles.skeletonContainer}>
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
            className={styles.classTabs}
            items={tabItems}
          />
        </>
      )}
    </div>
  );
};

export default TeacherClass;
