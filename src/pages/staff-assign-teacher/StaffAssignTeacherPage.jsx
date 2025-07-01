import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Spin, Avatar, Tag, Typography, Input, 
  Row, Col, message, Modal, Divider, Badge, Alert, 
  Progress, Checkbox, Collapse, Empty, Tooltip, Drawer, notification,
  Select, Radio
} from 'antd';
import { 
  UserOutlined, InfoCircleOutlined, CheckCircleOutlined, 
  WarningOutlined, TeamOutlined, AppstoreOutlined, CloseOutlined
} from '@ant-design/icons';
import './StaffAssignTeacherPage.css';
import { getAllTeachers, assignTeacher, getAllClasses } from './StaffAssignTeacherService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { Title, Text } = Typography;

const StaffAssignTeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesByGrade, setClassesByGrade] = useState({});
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [classDetailModalVisible, setClassDetailModalVisible] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('all');

  // Fetch data
  useEffect(() => {
    fetchClassList();
    fetchTeacherList();
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
      
      // Extract unique grade levels
      const grades = [...new Set(activeClasses
        .filter(c => c.gradeLevelName) // Only classes with grade level
        .map(c => c.gradeLevelName))];
      // Add enrichment as a "grade level" for filtering
      const hasEnrichment = activeClasses.some(c => c.epName);
      if (hasEnrichment) {
        grades.push('Năng khiếu');
      }
      setGradeLevels(grades);
      
      // If no academic year is selected yet, select the most recent one
      if (selectedAcademicYear === 'all' && years.length > 0) {
        setSelectedAcademicYear(years[0]);
      }
      
      // Filter classes by selected filters
      let filteredClasses = activeClasses;
      
      // Filter by academic year if selected
      if (selectedAcademicYear !== 'all') {
        filteredClasses = filteredClasses.filter(c => c.academicYear === selectedAcademicYear);
      }
      
      // Filter by grade level if selected
      if (selectedGradeLevel !== 'all') {
        if (selectedGradeLevel === 'Năng khiếu') {
          filteredClasses = filteredClasses.filter(c => c.epName);
        } else {
          filteredClasses = filteredClasses.filter(c => c.gradeLevelName === selectedGradeLevel);
        }
      }
      
      // Organize classes by grade level or enrichment program
      const organizedClasses = {};
      
      filteredClasses.forEach(classItem => {
        if (classItem.epName) {
          // Tất cả lớp năng khiếu vào cùng một danh mục
          if (!organizedClasses["Năng khiếu"]) {
            organizedClasses["Năng khiếu"] = [];
          }
          organizedClasses["Năng khiếu"].push(classItem);
        } else if (classItem.gradeLevelName) {
          // It's a regular class with a grade level
          if (!organizedClasses[classItem.gradeLevelName]) {
            organizedClasses[classItem.gradeLevelName] = [];
          }
          organizedClasses[classItem.gradeLevelName].push(classItem);
        } else {
          // Classes with neither (shouldn't happen with good data)
          if (!organizedClasses["Khác"]) {
            organizedClasses["Khác"] = [];
          }
          organizedClasses["Khác"].push(classItem);
        }
      });
      
      setClassesByGrade(organizedClasses);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherList = async () => {
    setLoading(true);
    try {
      const data = await getAllTeachers();
      // Filter to only active teachers
      const activeTeachers = data ? data.filter(teacher => teacher.status === 'Active') : [];
      setTeachers(activeTeachers);
      setFilteredTeachers(activeTeachers);
    } catch (err) {
      message.error('Failed to load teacher list');
    } finally {
      setLoading(false);
    }
  };

  // Select a class and open teacher drawer
  const handleClassSelect = (classInfo) => {
    setSelectedClassId(classInfo.id);
    setSelectedClass(classInfo);
    setSelectedTeacher(null);
    setSelectedTeacherId(null);
    
    // Filter teachers if needed (in this case we don't filter by criteria)
    setFilteredTeachers(teachers);
    
    // Open the drawer to show teachers
    setDrawerVisible(true);
  };

  // Toggle teacher selection
  const handleTeacherSelect = (teacher) => {
    if (selectedTeacherId === teacher.id) {
      // Deselect if already selected
      setSelectedTeacher(null);
      setSelectedTeacherId(null);
    } else {
      setSelectedTeacher(teacher);
      setSelectedTeacherId(teacher.id);
    }
  };

  // Handle the assignment process
  const handleAssign = async () => {
    if (!selectedClassId || !selectedTeacherId) {
      message.error('Please select a class and a teacher');
      return;
    }
    
    const teacherName = selectedTeacher?.fullName || 'Selected teacher';
    const className = selectedClass?.name || 'selected class';
    
    setAssigning(true);
    try {
      const loadingMessage = message.loading(`Assigning ${teacherName} to ${className}...`, 0);
      
      console.log(`Attempting to assign teacher ID: ${selectedTeacherId} to class ID: ${selectedClassId}`);
      
      const assignData = {
        classId: selectedClassId,
        teacherId: selectedTeacherId
      };
      
      await assignTeacher(assignData);
      
      loadingMessage();
      
      // Use message instead of notification to avoid React compatibility warning
      message.success({
        content: `Teacher "${teacherName}" successfully assigned to class "${className}"!`,
        duration: 5,
      });
      
      // Reset UI state
      setSelectedTeacher(null);
      setSelectedTeacherId(null);
      setSelectedClass(null);
      setSelectedClassId(null);
      setDrawerVisible(false);
      
      // Refresh data
      await fetchClassList();
      await fetchTeacherList();
      
    } catch (err) {
      console.error('Assignment error:', err);
      
      // Better error handling with specific message for "Class not found"
      let errorMessage = 'Failed to assign teacher';
      
      if (err.message && err.message.includes('Class not found')) {
        errorMessage = `Cannot find class "${className}" (ID: ${selectedClassId}). The class may have been deleted or modified.`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      message.error({
        content: errorMessage,
        duration: 5,
      });
    } finally {
      setAssigning(false);
    }
  };

  // Show teacher details in modal
  const showTeacherDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setDetailModalVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedClassId(null);
    setSelectedClass(null);
    setSelectedTeacher(null);
    setSelectedTeacherId(null);
  };

  const searchTeachers = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredTeachers(teachers);
      return;
    }
    
    const filtered = teachers.filter(
      teacher => 
        teacher.fullName?.toLowerCase().includes(value.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(value.toLowerCase()) ||
        teacher.phoneNumber?.includes(value)
    );
    
    setFilteredTeachers(filtered);
  };

  // Hàm chuyển đổi schedule dạng số thành "Thứ X"
  const formatSchedule = (timetable) => {
    if (!timetable) return null;
    
    return timetable.split(',').map(day => {
      const dayNum = day.trim();
      if (dayNum === '1') return 'Chủ Nhật';
      if (dayNum >= '2' && dayNum <= '7') return `Thứ ${dayNum}`;
      return dayNum; // Trường hợp không phải số từ 1-7
    }).join(', ');
  };

  const showClassDetail = (classItem) => {
    setSelectedClassDetail(classItem);
    setClassDetailModalVisible(true);
  };

  // Thêm hàm xử lý thay đổi năm học
  const handleAcademicYearChange = (value) => {
    setSelectedAcademicYear(value);
    // Sau khi thay đổi năm học, cập nhật lại danh sách lớp đã được tổ chức
    const filteredClasses = value === 'all' 
      ? classes 
      : classes.filter(c => c.academicYear === value);
    
    const organizedClasses = {};
    
    filteredClasses.forEach(classItem => {
      if (classItem.epName) {
        if (!organizedClasses["Năng khiếu"]) {
          organizedClasses["Năng khiếu"] = [];
        }
        organizedClasses["Năng khiếu"].push(classItem);
      } else if (classItem.gradeLevelName) {
        if (!organizedClasses[classItem.gradeLevelName]) {
          organizedClasses[classItem.gradeLevelName] = [];
        }
        organizedClasses[classItem.gradeLevelName].push(classItem);
      } else {
        if (!organizedClasses["Khác"]) {
          organizedClasses["Khác"] = [];
        }
        organizedClasses["Khác"].push(classItem);
      }
    });
    
    setClassesByGrade(organizedClasses);
  };

  // Thêm hàm xử lý thay đổi cấp lớp
  const handleGradeLevelChange = (e) => {
    setSelectedGradeLevel(e.target.value);
    
    // Cập nhật lại lớp học dựa trên bộ lọc mới
    let filteredClasses = classes;
    
    // Filter by academic year if selected
    if (selectedAcademicYear !== 'all') {
      filteredClasses = filteredClasses.filter(c => c.academicYear === selectedAcademicYear);
    }
    
    // Filter by grade level
    if (e.target.value !== 'all') {
      if (e.target.value === 'Năng khiếu') {
        filteredClasses = filteredClasses.filter(c => c.epName);
      } else {
        filteredClasses = filteredClasses.filter(c => c.gradeLevelName === e.target.value);
      }
    }
    
    // Organize classes
    const organizedClasses = {};
    filteredClasses.forEach(classItem => {
      if (classItem.epName) {
        if (!organizedClasses["Năng khiếu"]) {
          organizedClasses["Năng khiếu"] = [];
        }
        organizedClasses["Năng khiếu"].push(classItem);
      } else if (classItem.gradeLevelName) {
        if (!organizedClasses[classItem.gradeLevelName]) {
          organizedClasses[classItem.gradeLevelName] = [];
        }
        organizedClasses[classItem.gradeLevelName].push(classItem);
      } else {
        if (!organizedClasses["Khác"]) {
          organizedClasses["Khác"] = [];
        }
        organizedClasses["Khác"].push(classItem);
      }
    });
    
    setClassesByGrade(organizedClasses);
  };

  return (
    <div className="teacher-assign-container">
      <div className="teacher-assign-page-header">
        <Title level={2} className="teacher-assign-page-title">Assign Teacher to Class</Title>
        {selectedTeacher && (
          <div className="teacher-counter">
            <Badge count={selectedTeacher ? 1 : 0} offset={[0, 10]}>
              <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </Badge>
          </div>
        )}
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {/* Class selection section */}
          <Col span={24}>
            <Card 
              title={
                <div className="card-title-with-icon">
                  <AppstoreOutlined /> Classes by Category
                </div>
              }
              className="teacher-assign-card"
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
                          style={grade === 'Năng khiếu' ? {color: '#722ed1'} : {}}
                        >
                          {grade}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                  
                  {/* Hiển thị lớp đã chọn */}
                  {selectedClass && (
                    <Tag color="blue" className="selected-class-tag">
                      Selected: {selectedClass.name}
                    </Tag>
                  )}
                </div>
              }
            >
              {Object.keys(classesByGrade).length > 0 ? (
                <Collapse 
                  defaultActiveKey={Object.keys(classesByGrade)} 
                  className="teacher-grade-collapse"
                  bordered={false}
                  items={Object.entries(classesByGrade).map(([categoryName, classes]) => {
                    const isEnrichment = categoryName.startsWith('Năng khiếu');
                    return {
                      key: categoryName,
                      label: (
                        <span className={`teacher-category-header ${categoryName === 'Năng khiếu' ? 'enrichment-category' : ''}`}>
                          <span className="teacher-category-icon">
                            {categoryName === 'Năng khiếu' ? 
                              <FontAwesomeIcon icon="star" /> : 
                              <FontAwesomeIcon icon="graduation-cap" />
                            }
                          </span>
                          <span className="teacher-category-name">{categoryName}</span>
                          <Tag color={categoryName === 'Năng khiếu' ? "purple" : "blue"} className="teacher-grade-count">
                            {classes.length} {classes.length > 1 ? 'lớp' : 'lớp'}
                          </Tag>
                        </span>
                      ),
                      children: (
                        <div className="teacher-class-card-container">
                          {classes.map(classItem => (
                            <Card 
                              key={classItem.id} 
                              className={`teacher-class-card ${selectedClassId === classItem.id ? 'teacher-selected-class' : ''}`}
                              hoverable
                              onClick={() => handleClassSelect(classItem)}
                            >
                              {selectedClassId === classItem.id && (
                                <CheckCircleOutlined className="teacher-selected-icon" />
                              )}
                              
                              <div className="teacher-class-card-header">
                                <span className="teacher-class-name">{classItem.name}</span>
                                <Tag color={classItem.status === 'Available' ? 'green' : 'orange'}>
                                  {classItem.status}
                                </Tag>
                              </div>
                              
                              <div className="teacher-class-info-compact">
                                {/* Thông tin cơ bản quan trọng nhất */}
                                <div className="teacher-class-main-info">
                                  {/* Remove grade level badge for Mầm, Chồi, Lá and only keep for other types */}
                                  {classItem.epName ? (
                                    <Tag color="purple" className="teacher-class-tag">{classItem.epName}</Tag>
                                  ) : null}
                                </div>
                                
                                {/* Hiển thị giáo viên đã phân công - luôn hiển thị */}
                                <div className="teacher-assigned-compact">
                                  <Text type="secondary">Giáo viên:</Text>
                                  <div className="teacher-tag-container-compact">
                                    {classItem.teacherNames && classItem.teacherNames.length > 0 ? (
                                      classItem.teacherNames.map((name, idx) => (
                                        <Tag key={idx} icon={<UserOutlined />}>{name}</Tag>
                                      ))
                                    ) : (
                                      <Text type="secondary" italic>Chưa có</Text>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Dung lượng lớp - hiển thị dạng progress */}
                                <div className="teacher-capacity-compact">
                                  <div className="capacity-label-container">
                                    <Text type="secondary">Sĩ số:</Text>
                                    <Text className={classItem.quantity >= classItem.maxChildren ? 'capacity-full' : ''}>
                                      {classItem.quantity}/{classItem.maxChildren}
                                    </Text>
                                  </div>
                                  <Progress 
                                    percent={(classItem.quantity / classItem.maxChildren) * 100} 
                                    showInfo={false}
                                    size="small"
                                    status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
                                  />
                                </div>
                              </div>
                              
                              <div className="teacher-card-actions">
                                <Button 
                                  type="default" 
                                  size="small" 
                                  icon={<InfoCircleOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showClassDetail(classItem);
                                  }}
                                >
                                  Chi tiết
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )
                    };
                  })}
                />
              ) : (
                <Empty description="No classes available" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Teacher List Drawer */}
      <Drawer
        title={
          <div className="teacher-drawer-header">
            <div className="teacher-drawer-title">
              {selectedClass && (
                <>
                  <div className="teacher-drawer-title-text">
                    Teachers for {selectedClass.name}
                  </div>
                  <div className="teacher-drawer-subtitle">
                    <Tag color="blue">
                      {selectedClass.gradeLevelName}
                    </Tag>
                  </div>
                </>
              )}
            </div>
            <div className="teacher-search-container">
                <Input.Search
                  placeholder="Search teachers..."
                  allowClear
                onChange={e => searchTeachers(e.target.value)}
                style={{ width: 180 }}
              />
            </div>
          </div>
        }
        placement="right"
        width={500}
        onClose={closeDrawer}
        open={drawerVisible}
        closeIcon={<CloseOutlined />}
        className="teacher-list-drawer"
      >
        {filteredTeachers.length > 0 ? (
          <div className="teacher-drawer-list">
            {filteredTeachers.map(teacher => {
              const isSelected = selectedTeacherId === teacher.id;
              const isAssignedToClass = selectedClass?.teacherNames?.includes(teacher.fullName);
              
              return (
                <div 
                  key={teacher.id} 
                  className={`teacher-drawer-card ${isSelected ? 'teacher-selected' : ''} ${isAssignedToClass ? 'teacher-already-assigned' : ''}`}
                  onClick={() => !isAssignedToClass && handleTeacherSelect(teacher)}
                >
                  <div className="teacher-drawer-content">
                    <Avatar 
                      icon={<UserOutlined />} 
                      size={54}
                      className="staff-assign-teacher-avatar" 
                    />
                    <div className="teacher-drawer-info">
                      <h3 className="teacher-drawer-name">{teacher.fullName}</h3>
                      <p className="teacher-drawer-details">
                        {teacher.email}
                        <span className="detail-separator">•</span>
                        {teacher.phoneNumber}
                      </p>
                    </div>
                  </div>
                  
                  <div className="teacher-drawer-actions">
                    {isAssignedToClass ? (
                      <Tag color="green">Already Assigned</Tag>
                    ) : (
                      <Checkbox 
                        checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeacherSelect(teacher);
                        }}
                      />
                    )}
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        showTeacherDetail(teacher);
                      }}
                      className="teacher-drawer-detail-btn"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="No teachers available" />
        )}
        
        {/* Bottom actions in drawer */}
        {selectedTeacher && (
          <div className="teacher-drawer-footer-actions">
            <Button
              type="primary"
              onClick={handleAssign}
              loading={assigning}
              size="large"
              icon={<UserOutlined />}
              block
            >
              Assign {selectedTeacher?.fullName} to {selectedClass?.name}
            </Button>
          </div>
        )}
      </Drawer>

      {/* Teacher Detail Modal */}
      <Modal
        title="Teacher Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedTeacher && (
          <div className="teacher-detail-content">
            <div className="teacher-detail-header">
              <Avatar 
                icon={<UserOutlined />}
                size={100}
                className="teacher-detail-avatar"
              />
              <div className="teacher-detail-title">
                <h2>{selectedTeacher.fullName}</h2>
                <Tag color="blue">{selectedTeacher.roleName}</Tag>
              </div>
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="teacher-detail-item">
                  <div className="teacher-detail-label">Email:</div>
                  <div>{selectedTeacher.email}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="teacher-detail-item">
                  <div className="teacher-detail-label">Phone Number:</div>
                  <div>{selectedTeacher.phoneNumber}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="teacher-detail-item">
                  <div className="teacher-detail-label">Status:</div>
                  <div>
                    <Tag color={selectedTeacher.status === 'Active' ? 'green' : 'red'}>
                      {selectedTeacher.status}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="teacher-detail-item">
                  <div className="teacher-detail-label">Address:</div>
                  <div>{selectedTeacher.address || 'Not provided'}</div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Modal chi tiết lớp học - thiết kế mới */}
      <Modal
        title={null}
        open={classDetailModalVisible}
        onCancel={() => setClassDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setClassDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={() => {
              setClassDetailModalVisible(false);
              if (selectedClassDetail) handleClassSelect(selectedClassDetail);
            }}
          >
            Phân công giáo viên
          </Button>
        ]}
        width={700}
        className="class-detail-modal"
      >
        {selectedClassDetail && (
          <div className="class-detail-content">
            {/* Header với tên lớp và trạng thái */}
            <div className="class-detail-header">
              <div className="class-detail-title">
                <h2>{selectedClassDetail.name}</h2>
                <div className="class-detail-badges">
                  <Tag color={selectedClassDetail.status === 'Available' ? 'green' : 'orange'}>
                    {selectedClassDetail.status}
                  </Tag>
                  {selectedClassDetail.epName ? (
                    <Tag color="purple">{selectedClassDetail.epName}</Tag>
                  ) : selectedClassDetail.gradeLevelName ? (
                    <Tag color="blue">{selectedClassDetail.gradeLevelName}</Tag>
                  ) : null}
                  <Tag color="gold">{selectedClassDetail.academicYear}</Tag>
                </div>
              </div>
              <div className="class-detail-icon">
                {selectedClassDetail.epName ? (
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

            {/* Thông tin cơ bản */}
            <Card bordered={false} className="class-detail-card">
              <div className="class-detail-section">
                <h3>
                  <FontAwesomeIcon icon="info-circle" /> Thông tin cơ bản
                </h3>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className="detail-item">
                      <div className="detail-label">Chương trình học:</div>
                      <div className="detail-value">{selectedClassDetail.syllabusName}</div>
                    </div>
                  </Col>
                  {selectedClassDetail.timetable && (
                    <Col span={12}>
                      <div className="detail-item">
                        <div className="detail-label">Lịch học:</div>
                        <div className="detail-value highlight">
                          {formatSchedule(selectedClassDetail.timetable)}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Sĩ số lớp */}
              <div className="class-detail-section">
                <h3>
                  <FontAwesomeIcon icon="users" /> Sĩ số lớp học
                </h3>
                <div className="capacity-summary">
                  <div className="capacity-numbers">
                    <span className="current-capacity">{selectedClassDetail.quantity}</span>
                    <span className="capacity-separator">/</span>
                    <span className="max-capacity">{selectedClassDetail.maxChildren}</span>
                    <span className="capacity-label">học sinh</span>
                  </div>
                  <Progress 
                    percent={(selectedClassDetail.quantity / selectedClassDetail.maxChildren) * 100}
                    status={selectedClassDetail.quantity >= selectedClassDetail.maxChildren ? "exception" : "active"}
                    strokeWidth={10}
                  />
                </div>
                {selectedClassDetail.quantity >= selectedClassDetail.maxChildren && (
                  <div className="capacity-warning">
                    <FontAwesomeIcon icon="exclamation-triangle" /> Lớp học đã đạt số lượng tối đa
                  </div>
                )}
              </div>

              {/* Giáo viên */}
              <div className="class-detail-section">
                <h3>
                  <FontAwesomeIcon icon="chalkboard-teacher" /> Giáo viên phụ trách
                </h3>
                {selectedClassDetail.teacherNames && selectedClassDetail.teacherNames.length > 0 ? (
                  <div className="teachers-assigned-list">
                    {selectedClassDetail.teacherNames.map((name, idx) => (
                      <div className="teacher-card" key={idx}>
                        <Avatar icon={<UserOutlined />} className="staff-assign-teacher-avatar" />
                        <div className="teacher-name">{name}</div>
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
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffAssignTeacherPage;
