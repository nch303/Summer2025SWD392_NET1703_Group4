import React, { useState, useEffect } from 'react';
import { Button, message, Spin, Card, Row, Col, Table, Divider, Avatar, Tag, Typography, Modal, Alert, Progress, Badge, Radio } from 'antd';
import { getAllClasses, getPaidChildren, assignChildrenToClass } from './StaffAssignStudentService.js';
import { UserOutlined, InfoCircleOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleOutlined, RightOutlined, TeamOutlined } from '@ant-design/icons';
import './StaffAssignStudentPage.css';

const { Title, Text } = Typography;

const StaffAssignStudentPage = () => {
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [classList, setClassList] = useState([]);
  const [allChildrenList, setAllChildrenList] = useState([]); // Store all children
  const [filteredChildrenList, setFilteredChildrenList] = useState([]); // Store filtered children
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Extract the fetch functions so they can be reused
  const fetchClassList = async () => {
    setLoading(true);
    try {
      const data = await getAllClasses();
      // Filter out classes with non-null EP name
      const filteredClasses = data.filter(classItem => classItem.epName === null);
      setClassList(filteredClasses);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenList = async () => {
    setLoading(true);
    try {
      const data = await getPaidChildren();
      setAllChildrenList(data);
      setFilteredChildrenList(data); // Initially show all children
    } catch (err) {
      message.error('Failed to load children list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassList();
    fetchChildrenList();
  }, []);

  // Filter children when a class is selected
  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
    setSelectedChildren([]); // Clear selected children when changing class
    
    // Find the selected class
    const selectedClass = classList.find(c => c.id === classId);
    
    if (selectedClass) {
      // Store the grade level for filtering
      setSelectedGradeLevel(selectedClass.gradeLevelName);
      
      // Filter children by grade level
      const filtered = allChildrenList.filter(
        child => child.gradeLevelName === selectedClass.gradeLevelName
      );
      
      setFilteredChildrenList(filtered);
      
      // Show message about filtering
      message.info(`Showing ${filtered.length} students in ${selectedClass.gradeLevelName} grade level`);
    }
  };

  const handleAssign = async () => {
    if (!selectedClassId || selectedChildren.length === 0) {
      message.error('Please select a class and at least one student');
      return;
    }
    
    // Get class name for messages
    const className = classList.find(c => c.id === selectedClassId)?.name || 'selected class';
    const studentCount = selectedChildren.length;
    
    setAssigning(true);
    try {
      // Show loading message
      const loadingMessage = message.loading(`Assigning ${studentCount} student(s) to ${className}...`, 0);
      
      // Perform assignment
      await assignChildrenToClass(selectedClassId, selectedChildren);
      
      // Close loading message
      loadingMessage();
      
      // Success notification with Modal
      Modal.success({
        title: 'Assignment Successful',
        content: (
          <div>
            <p>{studentCount} student(s) successfully assigned to {className}!</p>
            <p>The student list will now be refreshed.</p>
          </div>
        ),
        okText: 'OK',
        icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
        maskClosable: true
      });
      
      // Reset selections
      setSelectedChildren([]);
      setSelectedClassId(null);
      setSelectedGradeLevel(null);
      
      // Completely refresh data with new API calls
      setLoading(true);
      
      try {
        // Fetch fresh class data
        const classData = await getAllClasses();
        const filteredClasses = classData.filter(classItem => classItem.epName === null);
        setClassList(filteredClasses);
        
        // Fetch fresh student data
        const studentData = await getPaidChildren();
        
        // Update both student lists
        setAllChildrenList(studentData);
        setFilteredChildrenList(studentData);
      } catch (refreshError) {
        message.warning({
          content: 'Assignment successful, but failed to refresh data. Please reload the page.',
          duration: 5
        });
        console.error('Error refreshing data:', refreshError);
      } finally {
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Assignment error:', err);
      
      // Error notification with Modal
      Modal.error({
        title: 'Assignment Failed',
        content: (
          <div>
            <p>Failed to assign students to class.</p>
            <p>Error: {err.message || 'Unknown error'}</p>
          </div>
        ),
        okText: 'Try Again',
        icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />,
        maskClosable: true
      });
    } finally {
      setAssigning(false);
    }
  };

  // Format date to display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const showStudentDetail = (student) => {
    setSelectedStudent(student);
    setDetailModalVisible(true);
  };

  // Modify the class columns to use simplified radio buttons
  const classColumns = [
    {
      title: 'Class Information',
      dataIndex: 'info',
      key: 'info',
      ellipsis: false,
      width: 'calc(100% - 70px)',
      render: (_, record) => (
        <div className="staff-assign-class-info">
          <div className="staff-assign-class-name">{record.name}</div>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Grade Level:</Text> {record.gradeLevelName}
            </Col>
            <Col span={12}>
              <Text strong>Status:</Text>{' '}
              <Tag 
                className="staff-assign-status-tag" 
                color={record.status === 'Available' ? 'green' : 'red'}
              >
                {record.status || 'Unknown'}
              </Tag>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Text strong>Syllabus:</Text> {record.syllabusName}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Text strong>Capacity:</Text> {record.quantity}/{record.maxChildren} students
              <div className="staff-assign-capacity-bar">
                <div 
                  className="staff-assign-capacity-fill" 
                  style={{ width: `${(record.quantity / record.maxChildren) * 100}%` }}
                />
              </div>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: 'Select',
      dataIndex: 'action',
      key: 'action',
      width: 70,
      align: 'center',
      render: (_, record) => (
        <Radio 
          checked={selectedClassId === record.id}
          onChange={() => {
            if (selectedClassId === record.id) {
              setSelectedClassId(null);
              setSelectedGradeLevel(null);
              setSelectedChildren([]);
              setFilteredChildrenList(allChildrenList);
              message.info('Class selection cleared');
            } else {
              handleClassSelect(record.id);
            }
          }}
        />
      ),
    },
  ];

  // Simplify the onRow handler
  const onRowClick = (record) => {
    return {
      onClick: (e) => {
        // Only trigger when clicking on the last cell (radio button cell)
        if (e.target.closest('td') && e.target.closest('td').cellIndex === 1) {
          if (selectedClassId === record.id) {
            setSelectedClassId(null);
            setSelectedGradeLevel(null);
            setSelectedChildren([]);
            setFilteredChildrenList(allChildrenList);
            message.info('Class selection cleared');
          } else {
            handleClassSelect(record.id);
          }
        }
      }
    };
  };

  // Update children columns with better width configurations
  const childrenColumns = [
    {
      title: '',
      key: 'avatar',
      width: '100px',
      className: 'avatar-column',
      render: (record) => (
        <Avatar 
          src={record.avatar} 
          icon={!record.avatar && <UserOutlined />} 
          size={64}
          className="staff-assign-student-avatar" 
        />
      ),
    },
    {
      title: 'Student Information',
      key: 'info',
      className: 'info-column',
      render: (record) => (
        <div className="staff-assign-student-info">
          <div className="staff-assign-student-name">{record.name}</div>
          <div>
            <Text strong>Birthday:</Text> {formatDate(record.birthday)} ({calculateAge(record.birthday)} years)
          </div>
          <div>
            <Text strong>Grade Level:</Text> {record.gradeLevelName}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '180px',
      className: 'action-column',
      render: (_, record) => {
        const isSelected = selectedChildren.includes(record.id);
        return (
          <div className="staff-assign-action-buttons">
            <Button 
              type="default"
              icon={<InfoCircleOutlined />}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                showStudentDetail(record);
              }}
              className="staff-assign-detail-btn"
            >
              Detail
            </Button>
            <Button 
              type={isSelected ? 'default' : 'primary'}
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                if (isSelected) {
                  setSelectedChildren(prev => prev.filter(id => id !== record.id));
                } else {
                  setSelectedChildren(prev => [...prev, record.id]);
                }
              }}
              className={isSelected ? 'staff-assign-selected-btn' : ''}
              disabled={!selectedClassId}
            >
              {isSelected ? 'Unselect' : 'Select'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="staff-assign-container">
      <div className="staff-assign-page-header">
        <Title level={2} className="staff-assign-page-title">Assign Students to Class</Title>
        <Badge count={selectedChildren.length} offset={[0, 10]}>
          <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        </Badge>
      </div>
      
      <div className="staff-assign-divider">
        <span className="staff-assign-divider-text">Select Class & Students</span>
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[24, 16]}>
          {/* Left side - Classes */}
          <Col xs={24} lg={12}>
            <Card 
              title="Available Classes" 
              extra={<Badge count={classList.length} style={{ backgroundColor: '#108ee9' }} />}
              variant="borderless" 
              className="staff-assign-card"
            >
              {classList.length > 0 ? (
                <Table 
                  dataSource={classList} 
                  columns={classColumns}
                  rowKey={record => record.id || record.ID}
                  pagination={{ pageSize: 5 }}
                  scroll={{ y: 400 }}
                  className="staff-assign-table"
                  rowClassName={(record) => selectedClassId === record.id ? 'staff-assign-selected-row' : ''}
                  onRow={onRowClick}
                  tableLayout="fixed"
                />
              ) : (
                <Alert 
                  message="No Classes Available" 
                  description="There are currently no classes available for assignment." 
                  type="info" 
                  showIcon 
                />
              )}
            </Card>
          </Col>
          
          {/* Right side - Children */}
          <Col xs={24} lg={12}>
            <Card 
              title={selectedGradeLevel ? 
                `Paid Students (${selectedGradeLevel} Grade Level)` : 
                "Paid Students"
              }
              extra={<Badge count={filteredChildrenList.length} style={{ backgroundColor: '#52c41a' }} />}
              variant="borderless" 
              className="staff-assign-card"
            >
              <Table 
                dataSource={filteredChildrenList} 
                columns={childrenColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 600, x: false }} // Remove horizontal scroll
                className="staff-assign-table staff-assign-student-table" // Add the specific student table class
                rowClassName={(record) => selectedChildren.includes(record.id) ? 'staff-assign-selected-row' : ''}
                locale={{ emptyText: selectedClassId ? 
                  'No students available for this grade level' : 
                  'Please select a class first to see available students'
                }}
              />
              {!selectedClassId && (
                <div className="staff-assign-warning">
                  <ExclamationCircleOutlined /> 
                  Please select a class before selecting students
                </div>
              )}
            </Card>
          </Col>
        </Row>
        
        <div className="staff-assign-divider">
          <span className="staff-assign-divider-text">Review & Confirm</span>
        </div>
        
        {/* Assignment section */}
        <Card 
          title="Assignment Information" 
          variant="borderless" 
          className="staff-assign-summary-card"
        >
          <div className="staff-assign-info-box">
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Selected Class:</Text> {classList.find(c => c.id === selectedClassId)?.name || 'None'}
              </Col>
              <Col span={12}>
                <Text strong>Students to Assign:</Text> {selectedChildren.length}
              </Col>
            </Row>
          </div>
          
          <div className="staff-assign-button-container">
            <Button
              type="primary"
              onClick={handleAssign}
              loading={assigning}
              disabled={assigning || !selectedClassId || selectedChildren.length === 0}
              size="large"
              className="staff-assign-button"
              icon={<RightOutlined />}
            >
              Assign {selectedChildren.length} Student{selectedChildren.length !== 1 ? 's' : ''} to Class
            </Button>
          </div>
        </Card>
      </Spin>

      {/* Student Detail Modal */}
      <Modal
        title="Student Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedStudent && (
          <div className="staff-assign-student-detail">
            <div className="staff-assign-detail-header">
              <Avatar 
                src={selectedStudent.avatar} 
                icon={!selectedStudent.avatar && <UserOutlined />} 
                size={100}
                className="staff-assign-detail-avatar"
              />
              <div className="staff-assign-detail-title">
                <h2>{selectedStudent.name}</h2>
                <Tag color="blue">{selectedStudent.gradeLevelName}</Tag>
              </div>
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">Birthday:</div>
                  <div>{formatDate(selectedStudent.birthday)} ({calculateAge(selectedStudent.birthday)} years)</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">Gender:</div>
                  <div>{selectedStudent.gender}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">Parent Name:</div>
                  <div>{selectedStudent.parentName}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">Phone Number:</div>
                  <div>{selectedStudent.phoneNumber}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">City:</div>
                  <div>{selectedStudent.city}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">Enrollment Date:</div>
                  <div>{formatDate(selectedStudent.enrollDate)}</div>
                </div>
              </Col>
              <Col span={24}>
                <div className="staff-assign-detail-item">
                  <div className="staff-assign-detail-label">Birth Certificate:</div>
                  <div>
                    <a href={selectedStudent.birthCertificate} target="_blank" rel="noopener noreferrer">
                      View Certificate
                    </a>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffAssignStudentPage; 