import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Form, Select, message, 
  Modal, Spin, Input, Typography, Tag, Row, Col, Avatar, Divider
} from 'antd';
import { 
  UserAddOutlined, UserOutlined, InfoCircleOutlined, 
  CheckCircleFilled, CloseCircleFilled
} from '@ant-design/icons';
import './StaffAssignTeacherPage.css';
import { getAllTeachers, assignTeacher, getAllClasses } from './StaffAssignTeacherService';

const { Title, Text } = Typography;
const { Option } = Select;

const StaffAssignTeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classSearchText, setClassSearchText] = useState('');

  // Fetch all teachers and classes
  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, classesData] = await Promise.all([
        getAllTeachers(),
        getAllClasses()
      ]);
      
      setTeachers(teachersData || []);
      
      // Filter out deleted classes
      const activeClasses = classesData ? classesData.filter(c => c.status !== 'Deleted') : [];
      setClasses(activeClasses);
    } catch (error) {
      message.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle teacher selection
  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherId(teacher.id);
  };

  // Handle class selection
  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    setSelectedClassId(classData.id);
    
    // If the class has teachers, find that teacher in the teachers list
    if (classData.teacherNames && classData.teacherNames.length > 0) {
      // Find the teacher object that matches the name in the class's teacherNames
      const assignedTeacher = teachers.find(teacher => 
        classData.teacherNames.includes(teacher.fullName)
      );
      
      if (assignedTeacher) {
        setSelectedTeacher(assignedTeacher);
        setSelectedTeacherId(assignedTeacher.id);
        
        // Show a message to inform the user
        message.info(`This class is already assigned to teacher: ${assignedTeacher.fullName}`);
      } else {
        // Reset teacher selection if we couldn't find the matching teacher
        setSelectedTeacher(null);
        setSelectedTeacherId(null);
      }
    } else {
      // If no teachers assigned to the class, reset teacher selection
      setSelectedTeacher(null);
      setSelectedTeacherId(null);
    }
  };

  // Show teacher details modal
  const showTeacherDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setDetailModalVisible(true);
  };

  // Handle assignment submission
  const handleAssign = async () => {
    if (!selectedClassId || !selectedTeacherId) {
      message.error('Please select both a class and a teacher');
      return;
    }
    
    const teacherName = selectedTeacher?.fullName || 'Selected teacher';
    const className = selectedClass?.name || 'selected class';
    
    setAssigning(true);
    try {
      // Show loading message
      const loadingMessage = message.loading(`Assigning ${teacherName} to ${className}...`, 0);
      
      // Send only the essential data in the format the API expects
      const assignData = {
        classId: selectedClassId,  // Don't parse as integer, send as is
        teacherId: selectedTeacherId
      };
      
      console.log('Sending assignment data:', assignData);
      
      const response = await assignTeacher(assignData);
      
      // Close loading message
      loadingMessage();
      
      // Success message
      message.success({
        content: `Teacher "${teacherName}" successfully assigned to class "${className}"!`,
        duration: 5,
        icon: <CheckCircleFilled style={{ color: '#52c41a' }} />
      });
      
      // Reset selections and refresh data
      setSelectedTeacher(null);
      setSelectedTeacherId(null);
      setSelectedClass(null);
      setSelectedClassId(null);
      fetchData();
      
    } catch (error) {
      console.error('Assignment error:', error);
      message.error({
        content: `Failed to assign teacher: ${error.message || 'Unknown error'}`,
        duration: 5,
        icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />
      });
    } finally {
      setAssigning(false);
    }
  };

  // Filter teachers based on search text
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      teacher.phoneNumber?.includes(searchText)
  );

  // Add a filtered classes function similar to filtered teachers
  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name?.toLowerCase().includes(classSearchText.toLowerCase()) ||
      classItem.syllabusName?.toLowerCase().includes(classSearchText.toLowerCase()) ||
      classItem.gradeLevelName?.toLowerCase().includes(classSearchText.toLowerCase()) ||
      classItem.academicYear?.toLowerCase().includes(classSearchText.toLowerCase())
  );

  // Class table columns
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
              <Tag color={record.status === 'Available' ? 'green' : 'orange'}>
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
          <Row gutter={16}>
            <Col span={24}>
              <Text strong>Teachers:</Text>{' '}
              {record.teacherNames && record.teacherNames.length > 0 
                ? record.teacherNames.map(name => (
                    <Tag color="blue" key={name}>{name}</Tag>
                  ))
                : <Text type="secondary">No teachers assigned</Text>
              }
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
          onClick={() => handleClassSelect(record)}
          disabled={selectedClassId === record.id}
          className={selectedClassId === record.id ? 'selected-button' : ''}
        >
          {selectedClassId === record.id ? 'Selected' : 'Select'}
        </Button>
      ),
    },
  ];

  // Teacher table columns
  const teacherColumns = [
    {
      title: '',
      key: 'avatar',
      width: '80px',
      render: () => (
        <Avatar
          icon={<UserOutlined />}
          size={64}
          className="teacher-avatar"
        />
      ),
    },
    {
      title: 'Teacher Information',
      key: 'info',
      render: (record) => (
        <div className="teacher-info">
          <div className="teacher-name">{record.fullName}</div>
          <div>
            <Text strong>Email:</Text> {record.email}
          </div>
          <div>
            <Text strong>Phone:</Text> {record.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: '180px',
      render: (_, record) => {
        const isSelected = selectedTeacherId === record.id;
        const isAssignedToClass = selectedClass && 
                                 selectedClass.teacherNames && 
                                 selectedClass.teacherNames.includes(record.fullName);
        
        return (
          <div className="action-buttons">
            <Button 
              type="default"
              icon={<InfoCircleOutlined />}
              onClick={() => showTeacherDetail(record)}
              className="detail-button"
            >
              Detail
            </Button>
            <Button 
              type={isSelected || isAssignedToClass ? 'default' : 'primary'}
              onClick={() => {
                if (isSelected || isAssignedToClass) {
                  setSelectedTeacher(null);
                  setSelectedTeacherId(null);
                } else {
                  handleTeacherSelect(record);
                }
              }}
              className={(isSelected || isAssignedToClass) ? 'selected-button' : ''}
              disabled={record.status !== 'Active'}
            >
              {isSelected || isAssignedToClass ? 'Unselect' : 'Select'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="assign-teacher-container">
      <Title level={2}>Assign Teacher to Class</Title>
      <Divider />
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Left side - Classes */}
          <Col xs={24} lg={12}>
            <Card 
              title="Class List" 
              variant="borderless" 
              className="list-card"
              extra={
                <Input.Search
                  placeholder="Search classes..."
                  allowClear
                  onSearch={(value) => setClassSearchText(value)}
                  style={{ width: 200 }}
                />
              }
            >
              <Table 
                dataSource={filteredClasses} 
                columns={classColumns}
                rowKey={record => record.id}
                pagination={{ pageSize: 5 }}
                scroll={{ y: 400 }}
                className="custom-table"
                rowClassName={(record) => selectedClassId === record.id ? 'selected-row' : ''}
              />
            </Card>
          </Col>
          
          {/* Right side - Teachers */}
          <Col xs={24} lg={12}>
            <Card 
              title="Teachers List" 
              variant="borderless" 
              className="list-card"
              extra={
                <Input.Search
                  placeholder="Search teachers..."
                  allowClear
                  onSearch={(value) => setSearchText(value)}
                  style={{ width: 200 }}
                />
              }
            >
              <Table 
                dataSource={filteredTeachers} 
                columns={teacherColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                scroll={{ y: 400 }}
                className="custom-table"
                rowClassName={(record) => selectedTeacherId === record.id ? 'selected-row' : ''}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        {/* Assignment section */}
        <Card title="Assignment Information" variant="borderless" className="assignment-card">
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Selected Class:</Text> {selectedClass?.name || 'None'}
            </Col>
            <Col span={12}>
              <Text strong>Selected Teacher:</Text> {selectedTeacher?.fullName || 'None'}
            </Col>
          </Row>
          
          <div className="assign-button-container">
            <Button
              type="primary"
              onClick={handleAssign}
              loading={assigning}
              disabled={assigning || !selectedClassId || !selectedTeacherId}
              size="large"
              className="assign-button"
            >
              Assign Teacher to Class
            </Button>
          </div>
        </Card>
      </Spin>

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
          <div className="teacher-detail">
            <div className="teacher-detail-header">
              <Avatar 
                icon={<UserOutlined />}
                size={100}
                className="detail-avatar"
              />
              <div className="teacher-detail-title">
                <h2>{selectedTeacher.fullName}</h2>
                <Tag color="blue">{selectedTeacher.roleName}</Tag>
              </div>
            </div>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Email:</div>
                  <div>{selectedTeacher.email}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Phone Number:</div>
                  <div>{selectedTeacher.phoneNumber}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Status:</div>
                  <div>
                    <Tag color={selectedTeacher.status === 'Active' ? 'green' : 'red'}>
                      {selectedTeacher.status}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="detail-item">
                  <div className="detail-label">Address:</div>
                  <div>{selectedTeacher.address}</div>
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
