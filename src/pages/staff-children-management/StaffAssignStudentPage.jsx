import React, { useState, useEffect } from 'react';
import { Button, message, Spin, Card, Row, Col, Table, Divider, Avatar, Tag, Typography, Modal } from 'antd';
import { getAllClasses, getPaidChildren, assignChildrenToClass } from './StaffAssignStudentService.js';
import { UserOutlined, InfoCircleOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
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
      
      // Success message with more details
      message.success({
        content: `${studentCount} student(s) successfully assigned to ${className}!`,
        duration: 5,
        icon: <CheckCircleFilled style={{ color: '#52c41a' }} />
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
        
        message.success({
          content: 'Student list refreshed successfully',
          duration: 3
        });
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
      message.error({
        content: `Failed to assign students to class: ${err.message || 'Unknown error'}`,
        duration: 5,
        icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />
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

  // Columns for classes table
  const classColumns = [
    {
      title: 'Class Information',
      key: 'info',
      render: (record) => (
        <div className="class-info">
          <div className="class-name">{record.name}</div>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Grade Level:</Text> {record.gradeLevelName}
            </Col>
            <Col span={12}>
              <Text strong>Status:</Text>{' '}
              <Tag color={record.status === 'Available' ? 'green' : 'red'}>
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
              <Text strong>Current/Max:</Text> {record.quantity}/{record.maxChildren} students
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '120px',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => handleClassSelect(record.id)}
          disabled={selectedClassId === record.id}
          className={selectedClassId === record.id ? 'selected-button' : ''}
        >
          {selectedClassId === record.id ? 'Selected' : 'Select'}
        </Button>
      ),
    },
  ];

  // Simplified children table
  const childrenColumns = [
    {
      title: '',
      key: 'avatar',
      width: '80px',
      render: (record) => (
        <Avatar 
          src={record.avatar} 
          icon={!record.avatar && <UserOutlined />} 
          size={64}
          className="student-avatar" 
        />
      ),
    },
    {
      title: 'Student Information',
      key: 'info',
      render: (record) => (
        <div className="student-info">
          <div className="student-name">{record.name}</div>
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
      render: (_, record) => {
        const isSelected = selectedChildren.includes(record.id);
        return (
          <div className="action-buttons">
            <Button 
              type="default"
              icon={<InfoCircleOutlined />}
              onClick={() => showStudentDetail(record)}
              className="detail-button"
            >
              Detail
            </Button>
            <Button 
              type={isSelected ? 'default' : 'primary'}
              onClick={() => {
                if (isSelected) {
                  setSelectedChildren(prev => prev.filter(id => id !== record.id));
                } else {
                  setSelectedChildren(prev => [...prev, record.id]);
                }
              }}
              className={isSelected ? 'selected-button' : ''}
            >
              {isSelected ? 'Unselect' : 'Select'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="assign-student-container">
      <Title level={2}>Assign Students to Class</Title>
      <Divider />
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Left side - Classes */}
          <Col xs={24} lg={12}>
            <Card title="Class List" variant="borderless" className="list-card">
              <Table 
                dataSource={classList} 
                columns={classColumns}
                rowKey={record => record.id || record.ID}
                pagination={{ pageSize: 5 }}
                scroll={{ y: 400 }}
                className="custom-table"
                rowClassName={(record) => selectedClassId === record.id ? 'selected-row' : ''}
              />
            </Card>
          </Col>
          
          {/* Right side - Children */}
          <Col xs={24} lg={12}>
            <Card 
              title={selectedGradeLevel ? 
                `Paid Students List (${selectedGradeLevel} Grade Level)` : 
                "Paid Students List"
              } 
              variant="borderless" 
              className="list-card"
            >
              <Table 
                dataSource={filteredChildrenList} 
                columns={childrenColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 600 }}
                className="custom-table"
                rowClassName={(record) => selectedChildren.includes(record.id) ? 'selected-row' : ''}
                locale={{ emptyText: selectedClassId ? 
                  'No students available for this grade level' : 
                  'Please select a class first'
                }}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        {/* Assignment section */}
        <Card title="Assignment Information" variant="borderless" className="assignment-card">
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Selected Class:</Text> {classList.find(c => c.id === selectedClassId)?.name || 'None'}
            </Col>
            <Col span={12}>
              <Text strong>Selected Students:</Text> {selectedChildren.length}
            </Col>
          </Row>
          
          <div className="assign-button-container">
            <Button
              type="primary"
              onClick={handleAssign}
              loading={assigning}
              disabled={assigning || !selectedClassId || selectedChildren.length === 0}
              size="large"
              className="assign-button"
            >
              Assign Students to Class
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
          <div className="student-detail">
            <div className="student-detail-header">
              <Avatar 
                src={selectedStudent.avatar} 
                icon={!selectedStudent.avatar && <UserOutlined />} 
                size={100}
                className="detail-avatar"
              />
              <div className="student-detail-title">
                <h2>{selectedStudent.name}</h2>
                <Tag color="blue">{selectedStudent.gradeLevelName}</Tag>
              </div>
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Birthday:</div>
                  <div>{formatDate(selectedStudent.birthday)} ({calculateAge(selectedStudent.birthday)} years)</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Gender:</div>
                  <div>{selectedStudent.gender}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Parent Name:</div>
                  <div>{selectedStudent.parentName}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Phone Number:</div>
                  <div>{selectedStudent.phoneNumber}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">City:</div>
                  <div>{selectedStudent.city}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Enrollment Date:</div>
                  <div>{formatDate(selectedStudent.enrollDate)}</div>
                </div>
              </Col>
              <Col span={24}>
                <div className="detail-item">
                  <div className="detail-label">Birth Certificate:</div>
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