import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Card, Input, Select, Row, Col, Typography, Spin, Modal, Descriptions, List, Avatar, Empty, Divider, Progress, Tabs, Statistic, Form, InputNumber, notification } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, UserOutlined, BookOutlined, ScheduleOutlined, TeamOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { getAllClasses, getClassDetail, updateClass } from './ClassManagementService';
import './ClassManagement.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ClassManagement = () => {
  // Add edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form] = Form.useForm();

  // Existing states
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  // Update form when editing class changes
  useEffect(() => {
    if (editingClass) {
      form.setFieldsValue({
        name: editingClass.name,
        syllabusID: editingClass.syllabusID || 3, // Default to 3 if not available
        maxChildren: editingClass.maxChildren,
      });
    }
  }, [editingClass, form]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await getAllClasses();
      // Add index as temporary ID for each class
      const classesWithIds = data.map((classItem, index) => ({
        ...classItem,
        id: index + 1, // Use index + 1 as a temporary ID
      }));
      setClasses(classesWithIds);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setLoading(false);
    }
  };

  const fetchClassDetail = async (id) => {
    try {
      setDetailLoading(true);
      // Since we're using the class object itself for detail view in this mock
      const selectedClass = classes.find(c => c.id === id);
      setSelectedClass(selectedClass);
      setDetailLoading(false);
    } catch (error) {
      console.error(`Failed to fetch class detail for ID ${id}:`, error);
      setDetailLoading(false);
    }
  };

  const showClassDetail = (classId) => {
    fetchClassDetail(classId);
    setDetailVisible(true);
  };

  const handleDetailModalClose = () => {
    setDetailVisible(false);
    setSelectedClass(null);
  };

  // New function to show edit modal with stopPropagation to prevent row expansion
  const showEditModal = (classData, e) => {
    // Stop event propagation to prevent row expansion
    if (e) {
      e.stopPropagation();
    }
    setEditingClass(classData);
    setEditVisible(true);
  };

  // New function to handle edit modal close
  const handleEditModalClose = () => {
    setEditVisible(false);
    setEditingClass(null);
    form.resetFields();
  };

  // New function to handle form submission
  const handleUpdateClass = async (values) => {
    if (!editingClass) return;
    
    try {
      setEditLoading(true);
      await updateClass(editingClass.id, values);
      
      // Show success notification
      notification.success({
        message: 'Class Updated',
        description: `${values.name} has been successfully updated.`,
      });
      
      // Refresh class list
      fetchClasses();
      
      // Close modal
      setEditVisible(false);
      setEditingClass(null);
      form.resetFields();
      setEditLoading(false);
    } catch (error) {
      console.error('Failed to update class:', error);
      
      // Show error notification
      notification.error({
        message: 'Update Failed',
        description: 'There was an error updating the class. Please try again.',
      });
      
      setEditLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Full':
        return 'orange';
      case 'Closed':
        return 'red';
      default:
        return 'blue';
    }
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'All' || classItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalClasses = classes.length;
  const availableClasses = classes.filter(c => c.status === 'Available').length;
  const fullClasses = classes.filter(c => c.status === 'Full').length;

  const columns = [
    {
      title: () => <div className="column-title">ID</div>,
      dataIndex: 'id',
      key: 'id',
      width: '5%',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: () => <div className="column-title">Class Name</div>,
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: () => <div className="column-title">Grade / Syllabus</div>,
      key: 'gradeAndSyllabus',
      width: '20%',
      render: (_, record) => (
        <>
          <div><Text strong>Grade:</Text> {record.gradeLevelName}</div>
          <div><Text type="secondary"><Text strong>Syllabus:</Text> {record.syllabusName}</Text></div>
        </>
      ),
    },
    {
      title: () => <div className="column-title">Capacity</div>,
      key: 'capacity',
      width: '20%',
      render: (_, record) => (
        <div className="capacity-column">
          <Progress 
            percent={Math.round((record.quantity / record.maxChildren) * 100)} 
            size="small" 
            status={record.quantity >= record.maxChildren ? "exception" : "active"}
            format={() => `${record.quantity}/${record.maxChildren}`}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            strokeWidth={8}
          />
          <Text type="secondary" className="capacity-text">
            {Math.round((record.quantity / record.maxChildren) * 100)}% Full
          </Text>
        </div>
      ),
      sorter: (a, b) => (a.quantity / a.maxChildren) - (b.quantity / b.maxChildren),
    },
    {
      title: () => <div className="column-title">Status</div>,
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => (
        <Tag 
          color={getStatusColor(status)}
          icon={status === 'Available' ? <CheckCircleOutlined /> : status === 'Full' ? <CloseCircleOutlined /> : <InfoCircleOutlined />}
          className="status-tag-table"
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Available', value: 'Available' },
        { text: 'Full', value: 'Full' },
        { text: 'Closed', value: 'Closed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: () => <div className="column-title">Actions</div>,
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="middle" className="action-buttons" onClick={(e) => e.stopPropagation()}>
          <Button 
            type="primary" 
            icon={<FileTextOutlined />}
            onClick={() => showClassDetail(record.id)}
            size="middle"
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            size="middle"
            onClick={(e) => showEditModal(record, e)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="class-management-container">
      <div className="page-header">
        <Title level={2} className="page-title">Class Management</Title>
        <div className="header-underline"></div>
      </div>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic 
              title={<span className="stat-title">Total Classes</span>} 
              value={totalClasses} 
              prefix={<BookOutlined />} 
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic 
              title={<span className="stat-title">Available Classes</span>} 
              value={availableClasses} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic 
              title={<span className="stat-title">Full Classes</span>} 
              value={fullClasses} 
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}  
            />
          </Card>
        </Col>
      </Row>
      
      <Card className="class-list-card">
        <div className="card-header">
          <div className="section-title">
            <Title level={4}>Class List</Title>
            <div className="section-underline"></div>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            className="add-button"
            size="large"
          >
            Add New Class
          </Button>
        </div>
        
        <Divider className="header-divider" />
        
        <div className="filter-section">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={10} lg={8}>
              <Input
                placeholder="Search by class name"
                prefix={<SearchOutlined />}
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                defaultValue="All"
                style={{ width: '100%' }}
                onChange={handleStatusFilter}
                className="status-select"
                size="large"
                placeholder="Filter by status"
              >
                <Option value="All">All Statuses</Option>
                <Option value="Available">
                  <CheckCircleOutlined style={{ color: 'green' }} /> Available
                </Option>
                <Option value="Full">
                  <CloseCircleOutlined style={{ color: 'orange' }} /> Full
                </Option>
                <Option value="Closed">
                  <InfoCircleOutlined style={{ color: 'red' }} /> Closed
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchClasses}
                className="refresh-button"
                size="large"
              >
                Refresh
              </Button>
            </Col>
          </Row>
        </div>
        
        <div className="table-container">
          <Spin spinning={loading}>
            <Table 
              columns={columns} 
              dataSource={filteredClasses} 
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} classes`,
                pageSizeOptions: ['10', '20', '50'],
              }}
              className="classes-table"
              rowClassName="table-row"
              onRow={(record) => ({
                onClick: () => showClassDetail(record.id), // Show class details on row click instead of expanding
              })}
            />
          </Spin>
        </div>
      </Card>

      {/* Class Detail Modal */}
      <Modal
        title={
          <div className="modal-title">
            <FileTextOutlined className="modal-icon" />
            <span>Class Details</span>
          </div>
        }
        open={detailVisible}
        onCancel={handleDetailModalClose}
        width={800}
        className="class-detail-modal"
        footer={[
          <Button key="close" onClick={handleDetailModalClose} size="large">
            Close
          </Button>
        ]}
      >
        <Spin spinning={detailLoading}>
          {selectedClass && (
            <div className="class-detail-content">
              <div className="class-header">
                <div className="class-name">
                  <Title level={3}>{selectedClass.name}</Title>
                  <Tag color={getStatusColor(selectedClass.status)} className="status-tag">
                    {selectedClass.status}
                  </Tag>
                </div>
              </div>
              
              <Tabs defaultActiveKey="overview" className="class-detail-tabs">
                <TabPane 
                  tab={
                    <span>
                      <FileTextOutlined /> Overview
                    </span>
                  } 
                  key="overview"
                >
                  <div className="overview-section">
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Card className="info-card" title="Class Information">
                          <div className="info-item">
                            <Text strong>Grade Level:</Text>
                            <Text>{selectedClass.gradeLevelName || 'Not specified'}</Text>
                          </div>
                          <div className="info-item">
                            <Text strong>Syllabus:</Text>
                            <Text>{selectedClass.syllabusName || 'Not specified'}</Text>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="info-card" title="Capacity Information">
                          <div className="capacity-wrapper">
                            <Progress
                              type="circle"
                              percent={Math.round((selectedClass.quantity / selectedClass.maxChildren) * 100)}
                              format={() => `${selectedClass.quantity}/${selectedClass.maxChildren}`}
                              width={120}
                              status={selectedClass.quantity >= selectedClass.maxChildren ? "exception" : "normal"}
                            />
                            <div className="capacity-text">
                              <Text>{selectedClass.quantity} students currently enrolled</Text>
                              <Text type="secondary">{selectedClass.maxChildren - selectedClass.quantity} spots remaining</Text>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <TeamOutlined /> Teachers
                    </span>
                  } 
                  key="teachers"
                >
                  <div className="list-section">
                    {selectedClass.classTeachers && selectedClass.classTeachers && selectedClass.classTeachers.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={selectedClass.classTeachers}
                        renderItem={teacher => (
                          <List.Item className="teacher-list-item">
                            <List.Item.Meta
                              avatar={<Avatar size={48} icon={<UserOutlined />} className="teacher-avatar" />}
                              title={<Text strong>{teacher.teacherName || 'Teacher Name'}</Text>}
                              description={
                                <div className="teacher-details">
                                  <Tag color="blue">{teacher.subject || 'Subject'}</Tag>
                                  {teacher.email && <div><Text type="secondary">Email: {teacher.email}</Text></div>}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty 
                        description="No teachers assigned to this class" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        className="empty-data"
                      />
                    )}
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined /> Students
                    </span>
                  } 
                  key="students"
                >
                  <div className="list-section">
                    {selectedClass.classChildrens && selectedClass.classChildrens && selectedClass.classChildrens.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={selectedClass.classChildrens}
                        renderItem={student => (
                          <List.Item className="student-list-item">
                            <List.Item.Meta
                              avatar={<Avatar size={48} icon={<UserOutlined />} className="student-avatar" />}
                              title={<Text strong>{student.childName || 'Student Name'}</Text>}
                              description={
                                <div className="student-details">
                                  {student.enrollmentDate && (
                                    <div>
                                      <ScheduleOutlined /> <Text type="secondary">Enrolled: {student.enrollmentDate}</Text>
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty 
                        description="No students enrolled in this class" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        className="empty-data"
                      />
                    )}
                  </div>
                </TabPane>
              </Tabs>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        title={
          <div className="modal-title">
            <EditOutlined className="modal-icon" />
            <span>Edit Class</span>
          </div>
        }
        open={editVisible}
        onCancel={handleEditModalClose}
        footer={null}
        width={600}
        className="edit-class-modal"
        maskClosable={false}
        destroyOnClose={true}
      >
        <div className="edit-class-content">
          {editingClass && (
            <>
              <div className="edit-class-header">
                <div className="edit-class-id">
                  <Text type="secondary">ID: {editingClass.id}</Text>
                </div>
                <div className="edit-class-status">
                  <Text>Current Status: </Text>
                  <Tag 
                    color={getStatusColor(editingClass.status)} 
                    className="status-tag-modal"
                  >
                    {editingClass.status}
                  </Tag>
                </div>
              </div>
              
              <Divider className="edit-divider" />
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdateClass}
                className="edit-form"
              >
                <Form.Item
                  name="name"
                  label="Class Name"
                  rules={[
                    { 
                      required: true, 
                      message: 'Please enter the class name!' 
                    },
                    {
                      max: 100,
                      message: 'Class name cannot exceed 100 characters!'
                    }
                  ]}
                >
                  <Input 
                    placeholder="Enter class name" 
                    className="edit-input"
                    size="large"
                  />
                </Form.Item>
                
                <Form.Item
                  name="syllabusID"
                  label="Syllabus ID"
                  rules={[
                    { 
                      required: true, 
                      message: 'Please enter the syllabus ID!' 
                    },
                    {
                      type: 'number',
                      message: 'Please enter a valid number!'
                    }
                  ]}
                >
                  <InputNumber 
                    placeholder="Enter syllabus ID" 
                    className="edit-input-number"
                    min={1}
                    size="large"
                  />
                </Form.Item>
                
                <Form.Item
                  name="maxChildren"
                  label="Maximum Children"
                  rules={[
                    { 
                      required: true, 
                      message: 'Please enter the maximum number of children!' 
                    },
                    {
                      type: 'number',
                      min: 1,
                      message: 'Maximum children must be at least 1!'
                    },
                    {
                      type: 'number',
                      max: 100,
                      message: 'Maximum children cannot exceed 100!'
                    }
                  ]}
                  extra={editingClass.quantity > 0 ? 
                    <Text type="warning">
                      Note: This class currently has {editingClass.quantity} students enrolled. 
                      Setting a value below this may affect the class status.
                    </Text> : null
                  }
                >
                  <InputNumber 
                    placeholder="Enter maximum children" 
                    className="edit-input-number"
                    min={1}
                    max={100}
                    size="large"
                  />
                </Form.Item>
                
                <Form.Item className="form-actions">
                  <Button 
                    type="default" 
                    onClick={handleEditModalClose}
                    className="cancel-button"
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={editLoading}
                    className="save-button"
                    size="large"
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClassManagement;
