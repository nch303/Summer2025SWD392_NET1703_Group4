import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Spin, Avatar, Tag, Typography, Input, 
  Row, Col, message, Modal, Divider, Badge, Alert, 
  Progress, Checkbox, Collapse, Empty, Tooltip, Drawer
} from 'antd';
import { 
  UserOutlined, InfoCircleOutlined, CheckCircleOutlined, 
  WarningOutlined, TeamOutlined, AppstoreOutlined, CloseOutlined
} from '@ant-design/icons';
import './StaffAssignTeacherPage.css';
import { getAllTeachers, assignTeacher, getAllClasses } from './StaffAssignTeacherService';

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
      
      // Organize classes by grade level
      const classesByGrade = {};
      
      activeClasses.forEach(classItem => {
        if (classItem.epName) {
          // If class has an epName, put it in the "Năng khiếu" category
          if (!classesByGrade["Năng khiếu"]) {
            classesByGrade["Năng khiếu"] = [];
          }
          classesByGrade["Năng khiếu"].push(classItem);
        } else {
          // Regular class goes into its normal grade level
          if (!classesByGrade[classItem.gradeLevelName]) {
            classesByGrade[classItem.gradeLevelName] = [];
          }
          classesByGrade[classItem.gradeLevelName].push(classItem);
        }
      });
      
      setClassesByGrade(classesByGrade);
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
      
      const assignData = {
        classId: selectedClassId,
        teacherId: selectedTeacherId
      };
      
      await assignTeacher(assignData);
      
      loadingMessage();
      
      // Show success notification
      notification.success({
        message: 'Assignment Successful',
        description: `Teacher "${teacherName}" successfully assigned to class "${className}"!`,
        placement: 'topRight',
        duration: 5,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        className: 'teacher-assignment-success-notification',
        style: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
        }
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
      
      notification.error({
        message: 'Assignment Failed',
        description: `Failed to assign teacher: ${err.message || 'Unknown error'}`,
        placement: 'topRight',
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
                  <AppstoreOutlined /> Classes by Grade Level
                </div>
              }
              className="teacher-assign-card"
              extra={
                selectedClass && (
                  <Tag color="blue" className="selected-class-tag">
                    Selected: {selectedClass.name}
                  </Tag>
                )
              }
            >
              {Object.keys(classesByGrade).length > 0 ? (
                <Collapse 
                  defaultActiveKey={Object.keys(classesByGrade)} 
                  className="teacher-grade-collapse"
                  items={Object.entries(classesByGrade).map(([gradeName, classes]) => ({
                    key: gradeName,
                    label: (
                      <span className="teacher-grade-header">
                        <span className="teacher-grade-name">{gradeName}</span>
                        <Tag color="blue" className="teacher-grade-count">{classes.length} classes</Tag>
                      </span>
                    ),
                    children: (
                      <div className="teacher-class-card-container">
                        {classes.map(classItem => (
                          <Card 
                            key={classItem.id} 
                            className={`teacher-class-card ${selectedClassId === classItem.id ? 'teacher-selected-class' : ''}`}
                            onClick={() => handleClassSelect(classItem)}
                          >
                            {selectedClassId === classItem.id && (
                              <CheckCircleOutlined className="teacher-selected-icon" />
                            )}
                            
                            <div className="teacher-class-card-header">
                              <span className="teacher-class-name">{classItem.name}</span>
                            </div>
                            
                            <div className="teacher-class-info">
                              <p>
                                <Text strong>Syllabus:</Text> {classItem.syllabusName}
                              </p>
                              <p>
                                <Text strong>Status:</Text>{' '}
                                <Tag color={classItem.status === 'Available' ? 'green' : 'red'}>
                                  {classItem.status || 'Unknown'}
                                </Tag>
                              </p>
                              <div className="teacher-capacity-section">
                                <div className="teacher-capacity-text">
                                  <Text strong>Capacity:</Text> 
                                  <span className={classItem.quantity >= classItem.maxChildren ? 'teacher-capacity-full' : ''}>
                                    {classItem.quantity}/{classItem.maxChildren} students
                                  </span>
                                </div>
                                <Progress 
                                  percent={(classItem.quantity / classItem.maxChildren) * 100} 
                                  showInfo={false}
                                  status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
                                  size="small"
                                />
                              </div>
                              {classItem.teacherNames && classItem.teacherNames.length > 0 && (
                                <div className="teacher-assigned-section">
                                  <Text strong>Assigned Teachers:</Text>
                                  <div className="teacher-tag-container">
                                    {classItem.teacherNames.map((name, idx) => (
                                      <Tag key={idx} color="blue">{name}</Tag>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {classItem.epName && (
                                <p>
                                  <Text strong>Enrichment:</Text> {classItem.epName}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )
                  }))}
                />
              ) : (
                <Empty description="No classes available" />
              )}
            </Card>
          </Col>
          
          {/* Instruction message when no class is selected */}
          {!selectedClass && !loading && (
            <Col span={24}>
              <Alert
                message="Select a Class"
                description="Please select a class from above to view available teachers for assignment."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </Col>
          )}
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
                      className="teacher-avatar" 
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
    </div>
  );
};

export default StaffAssignTeacherPage;
