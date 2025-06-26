import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Spin, Avatar, Tag, Typography, Input, Radio,
  Row, Col, message, Modal, Tabs, Badge, Table, Alert, 
  Progress, Collapse, Empty, Tooltip, DatePicker
} from 'antd';
import { 
  UserOutlined, InfoCircleOutlined, CheckCircleOutlined, 
  CalendarOutlined, TeamOutlined, AppstoreOutlined, CloseOutlined, 
  BookOutlined, ScheduleOutlined
} from '@ant-design/icons';
import './StaffClassPage.css';
import { getAllClasses, getClassAttendance } from './StaffClassService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const StaffClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [classesByCategory, setClassesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [groupedAttendance, setGroupedAttendance] = useState({});
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('all');
  const [activeTab, setActiveTab] = useState('1');
  const [activeDate, setActiveDate] = useState('');

  // Fetch data
  useEffect(() => {
    fetchClassList();
  }, []);

  const fetchClassList = async () => {
    setLoading(true);
    try {
      const data = await getAllClasses();
      // Filter out deleted classes
      const activeClasses = data ? data.filter(c => c.status !== 'Deleted') : [];
      setClasses(activeClasses);
      
      // Extract unique academic years
      const years = [...new Set(activeClasses.map(c => c.academicYear))].sort();
      setAcademicYears(years);
      
      // Extract unique grade levels, but group all enrichment classes
      const regularGrades = [...new Set(activeClasses
        .filter(c => c.gradeLevelName)
        .map(c => c.gradeLevelName))];
      
      // Add a single "Năng khiếu" option instead of individual enrichment programs
      const hasEnrichmentClasses = activeClasses.some(c => c.epName);
      
      // Set grade levels with any regular grades plus a single "Năng khiếu" option if needed
      setGradeLevels([
        ...regularGrades,
        ...(hasEnrichmentClasses ? ["Năng khiếu"] : [])
      ]);
      
      // If no academic year is selected yet, select the most recent one
      if (selectedAcademicYear === 'all' && years.length > 0) {
        setSelectedAcademicYear(years[0]);
      }
      
      organizeClasses(activeClasses, selectedAcademicYear, selectedGradeLevel);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setLoading(false);
    }
  };

  const organizeClasses = (classData, academicYear, gradeLevel) => {
    let filteredClasses = classData;
    
    // Filter by academic year if selected
    if (academicYear !== 'all') {
      filteredClasses = filteredClasses.filter(c => c.academicYear === academicYear);
    }
    
    // Filter by grade level if selected
    if (gradeLevel !== 'all') {
      filteredClasses = filteredClasses.filter(c => {
        if (gradeLevel === "Năng khiếu") {
          // Show all enrichment classes for the "Năng khiếu" filter
          return c.epName !== null;
        } else {
          // Show regular classes with the specific grade level
          return c.gradeLevelName === gradeLevel;
        }
      });
    }
    
    // Organize classes into just two categories
    const organizedClasses = {
      regularClasses: [],
      enrichmentClasses: []
    };
    
    filteredClasses.forEach(classItem => {
      if (classItem.epName) {
        // It's an enrichment class (has epName)
        organizedClasses.enrichmentClasses.push(classItem);
      } else {
        // It's a regular class
        organizedClasses.regularClasses.push(classItem);
      }
    });
    
    setClassesByCategory(organizedClasses);
  };

  const handleAcademicYearChange = (value) => {
    setSelectedAcademicYear(value);
    organizeClasses(classes, value, selectedGradeLevel);
  };

  const handleGradeLevelChange = (e) => {
    setSelectedGradeLevel(e.target.value);
    organizeClasses(classes, selectedAcademicYear, e.target.value);
  };

  const showClassDetail = async (classItem) => {
    setSelectedClass(classItem);
    setDetailModalVisible(true);
    setActiveTab('1'); // Reset to info tab
    
    // If the class has students, fetch attendance records
    if (classItem.quantity > 0) {
      setAttendanceLoading(true);
      try {
        const data = await getClassAttendance(classItem.id);
        setAttendanceRecords(data);
        
        // Group attendance records by date
        const grouped = {};
        data.forEach(record => {
          const date = record.date.split('T')[0];
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(record);
        });
        
        setGroupedAttendance(grouped);
        
        // Set initial activeDate if there are attendance records
        if (Object.keys(grouped).length > 0) {
          setActiveDate(Object.keys(grouped)[0]);
        }
      } catch (err) {
        message.error('Failed to load attendance records');
      } finally {
        setAttendanceLoading(false);
      }
    }
  };

  // Format timetable from numbers to day names
  const formatSchedule = (timetable) => {
    if (!timetable) return "Chưa có lịch học";
    
    return timetable.split(',').map(day => {
      const dayNum = day.trim();
      if (dayNum === '1') return 'Chủ Nhật';
      if (dayNum >= '2' && dayNum <= '7') return `Thứ ${dayNum}`;
      return dayNum; // In case it's not a number from 1-7
    }).join(', ');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Render attendance table columns
  const attendanceColumns = [
    {
      title: 'Họ tên học sinh',
      dataIndex: 'childrenName',
      key: 'childrenName',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'Attend' ? 'green' : 'red'}>
          {status === 'Attend' ? 'Có mặt' : 'Vắng mặt'}
        </Tag>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || <Text type="secondary" italic>Không có ghi chú</Text>,
    }
  ];

  return (
    <div className="staff-class-container">
      <div className="staff-class-page-header">
        <Title level={2} className="staff-class-page-title">Quản lý lớp học</Title>
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {/* Class list section */}
          <Col span={24}>
            <Card 
              className="staff-class-card"
              extra={
                <div className="card-header-actions">
                  {/* Bộ lọc theo năm học */}
                  <div className="academic-year-filter">
                    <span className="filter-label">Năm học:</span>
                    <Button 
                      icon={<FontAwesomeIcon icon="chevron-left" />} 
                      size="small"
                      onClick={() => {
                        const currentIndex = academicYears.indexOf(selectedAcademicYear);
                        if (currentIndex > 0) {
                          handleAcademicYearChange(academicYears[currentIndex - 1]);
                        }
                      }}
                      disabled={academicYears.indexOf(selectedAcademicYear) === 0}
                    />
                    <span className="academic-year-display">
                      {selectedAcademicYear || 'Tất cả'}
                    </span>
                    <Button 
                      icon={<FontAwesomeIcon icon="chevron-right" />} 
                      size="small"
                      onClick={() => {
                        const currentIndex = academicYears.indexOf(selectedAcademicYear);
                        if (currentIndex < academicYears.length - 1) {
                          handleAcademicYearChange(academicYears[currentIndex + 1]);
                        }
                      }}
                      disabled={academicYears.indexOf(selectedAcademicYear) === academicYears.length - 1}
                    />
                  </div>
                  
                  {/* Bộ lọc theo cấp lớp */}
                  <div className="grade-level-filter">
                    <Radio.Group 
                      value={selectedGradeLevel}
                      onChange={handleGradeLevelChange}
                      buttonStyle="solid"
                      size="small"
                      optionType="button"
                    >
                      <Radio.Button value="all">Tất cả</Radio.Button>
                      {gradeLevels.map(grade => (
                        <Radio.Button 
                          key={grade} 
                          value={grade}
                        >
                          {grade}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                </div>
              }
            >
              {/* Regular Classes */}
              {classesByCategory.regularClasses?.length > 0 && (
                <div className="class-section">
                  <div className="class-section-header">
                    <FontAwesomeIcon icon="graduation-cap" className="section-icon" /> 
                    <span className="section-title">Lớp học chính khóa</span>
                    <Tag color="blue" className="section-count">
                      {classesByCategory.regularClasses.length} lớp
                    </Tag>
                  </div>
                  
                  <div className="class-list-container">
                    <Table 
                      dataSource={classesByCategory.regularClasses}
                      rowKey="id"
                      rowClassName="regular-row"
                      onRow={(record) => ({
                        onClick: () => showClassDetail(record),
                        style: { cursor: 'pointer' }
                      })}
                      columns={[
                        {
                          title: 'Tên lớp',
                          dataIndex: 'name',
                          key: 'name',
                          render: (text) => <span className="class-name-cell">{text}</span>
                        },
                        {
                          title: 'Cấp lớp',
                          dataIndex: 'gradeLevelName',
                          key: 'gradeLevelName',
                          render: (text) => text || <span className="text-muted">-</span>
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          width: 120,
                          render: (status) => (
                            <Tag color={status === 'Available' ? 'green' : 'orange'}>
                              {status}
                            </Tag>
                          )
                        },
                        {
                          title: 'Sĩ số',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: 200,
                          render: (quantity, record) => (
                            <div className="class-capacity-cell">
                              <span className={quantity >= record.maxChildren ? 'capacity-full' : ''}>
                                {quantity}/{record.maxChildren}
                              </span>
                              <Progress 
                                percent={(quantity / record.maxChildren) * 100} 
                                showInfo={false}
                                size="small"
                                status={quantity >= record.maxChildren ? "exception" : "active"}
                              />
                            </div>
                          )
                        },
                        {
                          title: 'Giáo viên',
                          dataIndex: 'teacherNames',
                          key: 'teacherNames',
                          render: (teacherNames) => (
                            <div className="teacher-tags">
                              {teacherNames && teacherNames.length > 0 ? (
                                teacherNames.map((name, idx) => (
                                  <Tag key={idx} icon={<UserOutlined />}>{name}</Tag>
                                ))
                              ) : (
                                <Text type="secondary" italic>Chưa có</Text>
                              )}
                            </div>
                          )
                        },
                        {
                          title: 'Thao tác',
                          key: 'action',
                          width: 100,
                          render: (_, record) => (
                            <Button
                              type="primary"
                              icon={<InfoCircleOutlined />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                showClassDetail(record);
                              }}
                            >
                              Chi tiết
                            </Button>
                          )
                        }
                      ]}
                      pagination={false}
                      className="class-table"
                    />
                  </div>
                </div>
              )}
              
              {/* Enrichment Classes */}
              {classesByCategory.enrichmentClasses?.length > 0 && (
                <div className="class-section">
                  <div className="class-section-header enrichment">
                    <FontAwesomeIcon icon="star" className="section-icon" /> 
                    <span className="section-title">Lớp học năng khiếu</span>
                    <Tag color="purple" className="section-count">
                      {classesByCategory.enrichmentClasses.length} lớp
                    </Tag>
                  </div>
                  
                  <div className="class-list-container">
                    <Table 
                      dataSource={classesByCategory.enrichmentClasses}
                      rowKey="id"
                      rowClassName="enrichment-row"
                      onRow={(record) => ({
                        onClick: () => showClassDetail(record),
                        style: { cursor: 'pointer' }
                      })}
                      columns={[
                        {
                          title: 'Tên lớp',
                          dataIndex: 'name',
                          key: 'name',
                          render: (text) => <span className="class-name-cell">{text}</span>
                        },
                        {
                          title: 'Chương trình',
                          dataIndex: 'epName',
                          key: 'epName',
                          render: (text) => text || <span className="text-muted">-</span>
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          width: 120,
                          render: (status) => (
                            <Tag color={status === 'Available' ? 'green' : 'orange'}>
                              {status}
                            </Tag>
                          )
                        },
                        {
                          title: 'Sĩ số',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: 200,
                          render: (quantity, record) => (
                            <div className="class-capacity-cell">
                              <span className={quantity >= record.maxChildren ? 'capacity-full' : ''}>
                                {quantity}/{record.maxChildren}
                              </span>
                              <Progress 
                                percent={(quantity / record.maxChildren) * 100} 
                                showInfo={false}
                                size="small"
                                status={quantity >= record.maxChildren ? "exception" : "active"}
                              />
                            </div>
                          )
                        },
                        {
                          title: 'Giáo viên',
                          dataIndex: 'teacherNames',
                          key: 'teacherNames',
                          render: (teacherNames) => (
                            <div className="teacher-tags">
                              {teacherNames && teacherNames.length > 0 ? (
                                teacherNames.map((name, idx) => (
                                  <Tag key={idx} icon={<UserOutlined />}>{name}</Tag>
                                ))
                              ) : (
                                <Text type="secondary" italic>Chưa có</Text>
                              )}
                            </div>
                          )
                        },
                        {
                          title: 'Thao tác',
                          key: 'action',
                          width: 100,
                          render: (_, record) => (
                            <Button
                              type="primary"
                              icon={<InfoCircleOutlined />}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                showClassDetail(record);
                              }}
                            >
                              Chi tiết
                            </Button>
                          )
                        }
                      ]}
                      pagination={false}
                      className="class-table"
                    />
                  </div>
                </div>
              )}
              
              {Object.keys(classesByCategory.regularClasses || {}).length === 0 &&
               Object.keys(classesByCategory.enrichmentClasses || {}).length === 0 && (
                <Empty description="Không tìm thấy lớp học phù hợp với điều kiện lọc" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Class Detail Modal - Enhanced UI */}
      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        className="class-detail-modal"
      >
        {selectedClass && (
          <div className="class-detail-content">
            {/* Enhanced header with gradient background */}
            <div className={`class-detail-header ${selectedClass.epName ? 'enrichment' : 'regular'}`}>
              <div className="class-detail-title">
                <h2>{selectedClass.name}</h2>
                <div className="class-detail-badges">
                  <Tag color={selectedClass.status === 'Available' ? 'green' : 'orange'}>
                    {selectedClass.status}
                  </Tag>
                  {selectedClass.epName ? (
                    <Tag color="purple">{selectedClass.epName}</Tag>
                  ) : selectedClass.gradeLevelName ? (
                    <Tag color="blue">{selectedClass.gradeLevelName}</Tag>
                  ) : null}
                  <Tag color="gold">{selectedClass.academicYear}</Tag>
                </div>
              </div>
              <div className="class-detail-icon">
                {selectedClass.epName ? (
                  <div className="detail-icon enrichment">
                    <FontAwesomeIcon icon="star" />
                  </div>
                ) : (
                  <div className="detail-icon regular">
                    <FontAwesomeIcon icon="graduation-cap" />
                  </div>
                )}
              </div>
            </div>

            {/* Tabs with enhanced styling */}
            <Tabs 
              activeKey={activeTab}
              onChange={setActiveTab}
              className="class-detail-tabs"
              type="card"
              items={[
                {
                  key: "1",
                  label: (
                    <span className="tab-label">
                      <InfoCircleOutlined /> Thông tin lớp học
                    </span>
                  ),
                  children: (
                    <div className="class-detail-tab-content">
                      <Row gutter={[24, 24]}>
                        {/* Left column: Basic Information */}
                        <Col span={14}>
                          <Card>
                            <Row gutter={[16, 16]}>
                              <Col span={16}>
                                <div className="detail-item">
                                  <div className="detail-label">Chương trình học:</div>
                                  <div className="detail-value">{selectedClass.syllabusName}</div>
                                </div>
                              </Col>
                              
                              {selectedClass.epName && (
                                <Col span={12}>
                                  <div className="detail-item">
                                    <div className="detail-label">Chương trình năng khiếu:</div>
                                    <div className="detail-value">
                                      <Tag color="purple">{selectedClass.epName}</Tag>
                                    </div>
                                  </div>
                                </Col>
                              )}
                              
                              {selectedClass.timetable && (
                                <Col span={24}>
                                  <div className="detail-item">
                                    <div className="detail-label">Lịch học:</div>
                                    <div className="detail-value highlight schedule-display">
                                      {formatSchedule(selectedClass.timetable).split(', ').map((day, index) => (
                                        <Tag key={index} color="blue" className="schedule-day-tag">
                                          {day}
                                        </Tag>
                                      ))}
                                    </div>
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Card>
                          
                          {/* Teacher section with enhanced visuals */}
                          <Card
                            title={
                              <span className="detail-card-title">
                                <FontAwesomeIcon icon="chalkboard-teacher" /> Giáo viên phụ trách
                              </span>
                            }
                            variant="borderless"
                            className="class-detail-card teacher-section"
                          >
                            {selectedClass.teacherNames && selectedClass.teacherNames.length > 0 ? (
                              <div className="teachers-assigned-list">
                                {selectedClass.teacherNames.map((name, idx) => (
                                  <div className="teacher-card" key={idx}>
                                    <Avatar 
                                      icon={<UserOutlined />} 
                                      className="teacher-avatar"
                                      size={64}
                                    />
                                    <div className="teacher-name">{name}</div>
                                    <Tag color="blue">Giáo viên</Tag>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-teachers">
                                <Empty 
                                  description="Chưa có giáo viên được phân công" 
                                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                />
                              </div>
                            )}
                          </Card>
                        </Col>
                        
                        {/* Right column: Capacity visualization */}
                        <Col span={10}>
                          <Card
                            title={
                              <span className="detail-card-title">
                                <FontAwesomeIcon icon="users" /> Sĩ số lớp học
                              </span>
                            }
                            variant="borderless"
                            className="class-detail-card capacity-card"
                          >
                            <div className="capacity-visualization">
                              <div className="capacity-donut">
                                <Progress 
                                  type="circle"
                                  percent={Math.round((selectedClass.quantity / selectedClass.maxChildren) * 100)}
                                  format={percent => `${percent}%`}
                                  status={selectedClass.quantity >= selectedClass.maxChildren ? "exception" : "normal"}
                                  size={180}
                                />
                              </div>
                              <div className="capacity-stats">
                                <div className="capacity-stat-item">
                                  <div className="capacity-stat-value">{selectedClass.quantity}</div>
                                  <div className="capacity-stat-label">Hiện có</div>
                                </div>
                                <div className="capacity-stat-divider">/</div>
                                <div className="capacity-stat-item">
                                  <div className="capacity-stat-value">{selectedClass.maxChildren}</div>
                                  <div className="capacity-stat-label">Tối đa</div>
                                </div>
                              </div>
                              
                              {selectedClass.quantity >= selectedClass.maxChildren && (
                                <Alert
                                  message="Lớp học đã đạt số lượng tối đa"
                                  type="warning"
                                  showIcon
                                  icon={<FontAwesomeIcon icon="exclamation-triangle" />}
                                  className="capacity-warning-alert"
                                />
                              )}
                              
                              <div className="capacity-description">
                                <p>
                                  Lớp học này hiện có <strong>{selectedClass.quantity}</strong> học sinh, 
                                  {selectedClass.quantity < selectedClass.maxChildren ? 
                                    ` còn có thể tiếp nhận thêm ${selectedClass.maxChildren - selectedClass.quantity} học sinh.` : 
                                    ' đã đạt số lượng tối đa.'}
                                </p>
                              </div>
                            </div>
                          </Card>
                          
                          {/* Class status card */}
                          <Card
                            title={
                              <span className="detail-card-title">
                                <FontAwesomeIcon icon="clipboard-list" /> Trạng thái
                              </span>
                            }
                            variant="borderless"
                            className="class-detail-card status-card"
                          >
                            <div className={`class-status ${selectedClass.status.toLowerCase()}`}>
                              <div className="status-icon">
                                <FontAwesomeIcon 
                                  icon={selectedClass.status === 'Available' ? 'check-circle' : 'clock'} 
                                />
                              </div>
                              <div className="status-details">
                                <div className="status-value">{selectedClass.status}</div>
                                <div className="status-description">
                                  {selectedClass.status === 'Available' 
                                    ? 'Lớp học đang mở và có thể tiếp nhận học sinh.' 
                                    : 'Lớp học hiện tại không khả dụng.'}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: "2",
                  label: (
                    <span className="tab-label">
                      <CalendarOutlined /> Điểm danh
                    </span>
                  ),
                  disabled: selectedClass.quantity === 0,
                  children: (
                    <div className="class-detail-tab-content">
                      <Spin spinning={attendanceLoading}>
                        {selectedClass.quantity > 0 ? (
                          <>
                            {Object.keys(groupedAttendance).length > 0 ? (
                              <div className="attendance-container">
                                <div className="attendance-date-selector">
                                  <Radio.Group 
                                    buttonStyle="solid"
                                    defaultValue={activeDate}
                                    onChange={(e) => setActiveDate(e.target.value)}
                                    className="date-radio-group"
                                  >
                                    {Object.keys(groupedAttendance).map(date => (
                                      <Radio.Button key={date} value={date}>
                                        <CalendarOutlined /> {formatDate(date)}
                                      </Radio.Button>
                                    ))}
                                  </Radio.Group>
                                </div>
                                
                                {Object.entries(groupedAttendance).map(([date, records]) => (
                                  <div 
                                    key={date}
                                    className="attendance-date-section"
                                    style={{ display: activeDate === date ? 'block' : 'none' }}
                                  >
                                    <div className="attendance-summary-cards">
                                      <Row gutter={16}>
                                        <Col span={12}>
                                          <Card className="summary-card present">
                                            <div className="summary-icon">
                                              <FontAwesomeIcon icon="check-circle" />
                                            </div>
                                            <div className="summary-content">
                                              <div className="summary-count">
                                                {records.filter(r => r.status === 'Attend').length}
                                              </div>
                                              <div className="summary-label">Có mặt</div>
                                            </div>
                                          </Card>
                                        </Col>
                                        <Col span={12}>
                                          <Card className="summary-card absent">
                                            <div className="summary-icon">
                                              <FontAwesomeIcon icon="times-circle" />
                                            </div>
                                            <div className="summary-content">
                                              <div className="summary-count">
                                                {records.filter(r => r.status === 'Absent').length}
                                              </div>
                                              <div className="summary-label">Vắng mặt</div>
                                            </div>
                                          </Card>
                                        </Col>
                                      </Row>
                                    </div>
                                    
                                    <div className="attendance-table-container">
                                      <h3 className="attendance-date-title">
                                        <CalendarOutlined /> Điểm danh ngày {formatDate(date)}
                                      </h3>
                                      
                                      <Table 
                                        dataSource={records} 
                                        columns={attendanceColumns}
                                        rowKey="id"
                                        pagination={false}
                                        className="attendance-table enhanced"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Empty 
                                description="Không có dữ liệu điểm danh cho lớp học này" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            )}
                          </>
                        ) : (
                          <Alert
                            message="Lớp học chưa có học sinh"
                            description="Lớp học này hiện chưa có học sinh nào được phân công. Điểm danh sẽ khả dụng khi có học sinh trong lớp."
                            type="info"
                            showIcon
                          />
                        )}
                      </Spin>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffClassPage;
