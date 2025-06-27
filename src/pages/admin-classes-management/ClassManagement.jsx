import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Card, Input, Select, Row, Col, Typography, Spin, Modal, Descriptions, List, Avatar, Empty, Divider, Progress, Tabs, Statistic, Form, InputNumber, notification, Badge, Alert } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, UserOutlined, BookOutlined, ScheduleOutlined, TeamOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, StopOutlined, InfoCircleOutlined, EditOutlined, SaveOutlined, MailOutlined, PhoneOutlined, HomeOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { getAllClasses, getClassDetail, updateClass, getStudentDetail, getTeacherDetail, createClass, getAllSyllabi, getAllGradeLevels, getAllEnrichmentPrograms, deleteClass, restoreClass } from './ClassManagementService';
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

  // Add these states to the component
  const [studentDetailVisible, setStudentDetailVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  // Add these new states to the component
  const [teacherDetailVisible, setTeacherDetailVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherDetailLoading, setTeacherDetailLoading] = useState(false);

  // Add these state variables near the top with other state declarations
  const [createVisible, setCreateVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  // Add these state variables
  const [syllabi, setSyllabi] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [enrichmentPrograms, setEnrichmentPrograms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Add these state variables with other state declarations
  const [gradeLevelFilter, setGradeLevelFilter] = useState('All');
  const [enrichmentFilter, setEnrichmentFilter] = useState('All');

  // Add this state for delete confirmation
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deletingClass, setDeletingClass] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add these states for restore confirmation
  const [restoreConfirmVisible, setRestoreConfirmVisible] = useState(false);
  const [restoringClass, setRestoringClass] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
    loadFormOptions(); // This will load grade levels and enrichment programs for filters
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
      
      // Debug log to see data structure
      if (data.length > 0) {
        console.log('Class data structure example:', data[0]);
        // Log all classes and their deleted status properties
        data.forEach(item => {
          console.log(`Class ID: ${item.id}, Name: ${item.name}, Status: ${item.status}, isDeleted: ${item.isDeleted}`);
        });
      }
      
      setClasses(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setLoading(false);
    }
  };

  const fetchClassDetail = async (id) => {
    try {
      setDetailLoading(true);
      // Call the API to get detailed class information
      const detailData = await getClassDetail(id);
      setSelectedClass(detailData);
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

  // Add handler functions for the new filters
  const handleGradeLevelFilter = (value) => {
    setGradeLevelFilter(value);
  };

  const handleEnrichmentFilter = (value) => {
    setEnrichmentFilter(value);
  };

  // Update the filtered classes logic to focus on IDs
  const filteredClasses = classes.filter((classItem) => {
    // Name search
    const matchesSearch = classItem.name?.toLowerCase().includes(searchText.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'All' || classItem.status === statusFilter;
    
    // Grade level filter - Check multiple possible property names and handle type conversion
    const gradeId = parseInt(gradeLevelFilter);
    const matchesGradeLevel = 
      gradeLevelFilter === 'All' || 
      (classItem.gradeLevelID && parseInt(classItem.gradeLevelID) === gradeId) || 
      (classItem.gradeLevelId && parseInt(classItem.gradeLevelId) === gradeId) ||
      (classItem.gradeLevelName && gradeLevels.some(g => g.id === gradeId && g.name === classItem.gradeLevelName));
    
    // Enrichment program filter - Check multiple possible property names and handle type conversion
    const enrichmentId = parseInt(enrichmentFilter);
    const matchesEnrichment = 
      enrichmentFilter === 'All' || 
      (classItem.enrichmentProgramId && parseInt(classItem.enrichmentProgramId) === enrichmentId) || 
      (classItem.enrichmentProgramID && parseInt(classItem.enrichmentProgramID) === enrichmentId) ||
      (classItem.epName && enrichmentPrograms.some(e => e.id === enrichmentId && e.name === classItem.epName));
    
    return matchesSearch && matchesStatus && matchesGradeLevel && matchesEnrichment;
  });

  // Calculate summary statistics
  const totalClasses = classes.length;
  const availableClasses = classes.filter(c => c.status === 'Available').length;
  const fullClasses = classes.filter(c => c.status === 'Full').length;

  const columns = [
    {
      title: () => <div className="column-title">#</div>,
      key: 'index',
      width: '5%',
      render: (_, __, index) => (
        <div className="student-index">{index + 1}</div>
      ),
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
        { text: 'Unavailable', value: 'Unavailable' },
        { text: 'Full', value: 'Full' },
        { text: 'Closed', value: 'Closed' },
        { text: 'Deleted', value: 'Deleted' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: () => <div className="column-title">Actions</div>,
      key: 'actions',
      width: '20%',
      render: (_, record) => {
        // Enhanced check for deleted status to cover all possible variations
        const isDeleted = 
          record.isDeleted === true || 
          record.deleted === true || 
          record.isDeleted === 1 ||
          record.deleted === 1 ||
          record.status === "Deleted" || 
          record.Status === "Deleted";
        
        console.log(`Class ${record.name} (ID: ${record.id}) - isDeleted: ${isDeleted}, status: ${record.status}`);
        
        return (
          <div onClick={e => e.stopPropagation()}>
            <Space size="middle" className="action-buttons">
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
                onClick={e => {
                  e.stopPropagation();
                  showEditModal(record, e);
                }}
              >
                Edit
              </Button>
              {isDeleted ? (
                <Button
                  type="primary"
                  icon={<UndoOutlined />}
                  size="middle"
                  onClick={e => {
                    e.stopPropagation();
                    console.log(`Restore button clicked for ID: ${record.id}`);
                    showRestoreConfirm(record);
                  }}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="middle"
                  onClick={e => {
                    e.stopPropagation();
                    showDeleteConfirm(record);
                  }}
                >
                  Delete
                </Button>
              )}
            </Space>
          </div>
        );
      }
    },
  ];

  // Add this function to fetch student details
  const fetchStudentDetail = async (id) => {
    try {
      setStudentDetailLoading(true);
      const detailData = await getStudentDetail(id);
      setSelectedStudent(detailData);
      setStudentDetailLoading(false);
    } catch (error) {
      console.error(`Failed to fetch student detail for ID ${id}:`, error);
      setStudentDetailLoading(false);
    }
  };

  // Add function to show student detail modal
  const showStudentDetail = (studentId) => {
    fetchStudentDetail(studentId);
    setStudentDetailVisible(true);
  };

  // Add function to close the student detail modal
  const handleStudentDetailModalClose = () => {
    setStudentDetailVisible(false);
    setSelectedStudent(null);
  };

  // Add function to fetch teacher details
  const fetchTeacherDetail = async (id) => {
    try {
      setTeacherDetailLoading(true);
      const detailData = await getTeacherDetail(id);
      setSelectedTeacher(detailData);
      setTeacherDetailLoading(false);
    } catch (error) {
      console.error(`Failed to fetch teacher detail for ID ${id}:`, error);
      setTeacherDetailLoading(false);
    }
  };

  // Add function to show teacher detail modal
  const showTeacherDetail = (teacherId) => {
    console.log('Showing teacher detail for ID:', teacherId);
    fetchTeacherDetail(teacherId);
    setTeacherDetailVisible(true);
  };

  // Add function to close the teacher detail modal
  const handleTeacherDetailModalClose = () => {
    setTeacherDetailVisible(false);
    setSelectedTeacher(null);
  };

  // Add a function to load dropdown data
  const loadFormOptions = async () => {
    setLoadingOptions(true);
    try {
      const [syllabiData, gradeLevelsData, enrichmentProgramsData] = await Promise.all([
        getAllSyllabi(),
        getAllGradeLevels(),
        getAllEnrichmentPrograms()
      ]);
      
      setSyllabi(syllabiData);
      setGradeLevels(gradeLevelsData);
      setEnrichmentPrograms(enrichmentProgramsData);
    } catch (error) {
      console.error('Error loading form options:', error);
      notification.error({
        message: 'Failed to load options',
        description: 'Unable to load form options. Please refresh and try again.'
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  // Update the showCreateModal function to load data
  const showCreateModal = () => {
    createForm.resetFields();
    loadFormOptions();
    setCreateVisible(true);
  };

  const handleCreateModalClose = () => {
    setCreateVisible(false);
    createForm.resetFields();
  };

  const handleCreateClass = async (values) => {
    try {
      setCreateLoading(true);
      await createClass(values);
      
      // Show success notification
      notification.success({
        message: 'Class Created',
        description: `${values.name} has been successfully created.`,
      });
      
      // Refresh the class list
      fetchClasses();
      
      // Close modal
      setCreateVisible(false);
      createForm.resetFields();
    } catch (error) {
      console.error('Failed to create class:', error);
      
      // Show error notification
      notification.error({
        message: 'Creation Failed',
        description: 'There was an error creating the class. Please try again.',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Then, let's update the refresh function to properly reset filters and reload data
  const handleRefresh = () => {
    // Reset filters to default values
    setSearchText('');
    setStatusFilter('All');
    setGradeLevelFilter('All');
    setEnrichmentFilter('All');
    
    // Reload data
    fetchClasses();
    loadFormOptions();
  };

  // Add function to show delete confirmation modal
  const showDeleteConfirm = (classData) => {
    console.log('Delete confirmation called for:', classData.name);
    setDeletingClass(classData);
    setDeleteConfirmVisible(true);
  };

  // Add function to handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
    setDeletingClass(null);
  };

  // Add function to handle class deletion
  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    
    try {
      setDeleteLoading(true);
      await deleteClass(deletingClass.id);
      
      // Show success notification
      notification.success({
        message: 'Class Deleted',
        description: `${deletingClass.name} has been successfully deleted.`,
      });
      
      // Refresh class list
      fetchClasses();
      
      // Close modal
      setDeleteConfirmVisible(false);
      setDeletingClass(null);
    } catch (error) {
      console.error('Failed to delete class:', error);
      
      // Show error notification
      notification.error({
        message: 'Deletion Failed',
        description: 'There was an error deleting the class. Please try again.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Add function to show restore confirmation modal
  const showRestoreConfirm = (classData) => {
    console.log('Restore confirmation called for:', classData.name);
    setRestoringClass(classData);
    setRestoreConfirmVisible(true);
  };

  // Add function to handle restore cancellation
  const handleRestoreCancel = () => {
    setRestoreConfirmVisible(false);
    setRestoringClass(null);
  };

  // Update the handleRestoreClass function to add more logging
  const handleRestoreClass = async () => {
    if (!restoringClass) return;
    
    try {
      setRestoreLoading(true);
      console.log(`Attempting to restore class with ID: ${restoringClass.id}`);
      const response = await restoreClass(restoringClass.id);
      console.log('Restore API response:', response);
      
      // Show success notification
      notification.success({
        message: 'Class Restored',
        description: `${restoringClass.name} has been successfully restored.`,
      });
      
      // Refresh class list
      fetchClasses();
      
      // Close modal
      setRestoreConfirmVisible(false);
      setRestoringClass(null);
    } catch (error) {
      console.error('Failed to restore class:', error);
      
      // Show error notification
      notification.error({
        message: 'Restoration Failed',
        description: 'There was an error restoring the class. Please try again.',
      });
    } finally {
      setRestoreLoading(false);
    }
  };

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
            onClick={showCreateModal}
          >
            Add New Class
          </Button>
        </div>
        
        <Divider className="header-divider" />
        
        <div className="filter-section">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={6}>
              <Input
                placeholder="Search by class name"
                prefix={<SearchOutlined />}
                allowClear
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Select
                value={statusFilter}
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
                <Option value="Unavailable">
                  <CloseCircleOutlined style={{ color: 'orange' }} /> Unavailable
                </Option>
                <Option value="Full">
                  <ExclamationCircleOutlined style={{ color: 'orange' }} /> Full
                </Option>
                <Option value="Closed">
                  <StopOutlined style={{ color: 'red' }} /> Closed
                </Option>
                <Option value="Deleted">
                  <DeleteOutlined style={{ color: 'red' }} /> Deleted
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Select
                value={gradeLevelFilter}
                style={{ width: '100%' }}
                onChange={(value) => {
                  console.log('Selected Grade Level:', value, typeof value); // Debug log
                  setGradeLevelFilter(value);
                }}
                className="grade-select"
                size="large"
                placeholder="Filter by grade"
                loading={loadingOptions}
              >
                <Option value="All">All Grades</Option>
                {gradeLevels.map(grade => (
                  <Option key={grade.id} value={grade.id}>{grade.name}</Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Select
                value={enrichmentFilter}
                style={{ width: '100%' }}
                onChange={(value) => {
                  console.log('Selected Enrichment:', value, typeof value); // Debug log
                  setEnrichmentFilter(value);
                }}
                className="enrichment-select"
                size="large"
                placeholder="Filter by enrichment"
                loading={loadingOptions}
              >
                <Option value="All">All Programs</Option>
                {enrichmentPrograms.map(program => (
                  <Option key={program.id} value={program.id}>
                    {program.name} - {program.type}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                className="refresh-button"
                size="large"
              >
                Reset Filters
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
                    {selectedClass.classTeachers && selectedClass.classTeachers.length > 0 ? (
                      <div className="teachers-grid">
                        {selectedClass.classTeachers.map(teacher => (
                          <Card 
                            key={teacher.teacherID} 
                            className="admin-teacher-card" 
                            hoverable
                            onClick={() => showTeacherDetail(teacher.teacherID)}
                          >
                            <div className="admin-teacher-card-content">
                              <div className="teacher-avatar-container">
                                <Avatar 
                                  size={70} 
                                  src={teacher.avatar || null}
                                  icon={!teacher.avatar ? <UserOutlined /> : null} 
                                  className="teacher-avatar" 
                                />
                                <Tag color="blue" className="teacher-tag">
                                  Teacher
                                </Tag>
                              </div>
                              <div className="teacher-info">
                                <Title level={5} className="teacher-name">{teacher.teacherName}</Title>
                                <Button
                                  type="primary"
                                  size="small"
                                  icon={<FileTextOutlined />}
                                  className="view-teacher-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showTeacherDetail(teacher.teacherID);
                                  }}
                                >
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Empty 
                        description={
                          <div className="empty-message">
                            <Title level={5}>No Teachers Assigned</Title>
                            <Text type="secondary">This class doesn't have any teachers assigned yet.</Text>
                          </div>
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        className="empty-data"
                      />
                    )}
                  </div>
                </TabPane>
                
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined /> Students ({selectedClass.quantity || 0})
                    </span>
                  } 
                  key="students"
                >
                  <div className="list-section">
                    {selectedClass.classChildrens && selectedClass.classChildrens.length > 0 ? (
                      <>
                        <div className="student-header">
                          <Title level={5}>Enrolled Students</Title>
                          <Badge 
                            count={selectedClass.classChildrens.length} 
                            style={{ backgroundColor: '#52c41a' }} 
                          />
                        </div>
                        
                        <div className="students-grid">
                          {selectedClass.classChildrens.map((student, index) => (
                            <Card 
                              key={student.childrenID}
                              className="admin-student-card" 
                              hoverable
                              onClick={() => showStudentDetail(student.childrenID)}
                            >
                              <div className="student-number">{index + 1}</div>
                              <div className="admin-student-card-inner">
                                <Avatar 
                                  size={60} 
                                  src={student.avatar && student.avatar !== "string" ? student.avatar : null}
                                  icon={!student.avatar || student.avatar === "string" ? <UserOutlined /> : null} 
                                  className={`student-avatar ${student.gender?.toLowerCase() === "female" ? "female-avatar" : "male-avatar"}`}
                                />
                                <div className="admin-student-card-details">
                                  <Text strong className="admin-student-card-name">{student.childrenName}</Text>
                                  <div className="admin-student-card-badges">
                                    {student.gender && student.gender !== "string" && (
                                      <Tag color={student.gender.toLowerCase() === "female" ? "pink" : "blue"} className="gender-tag">
                                        {student.gender}
                                      </Tag>
                                    )}
                                    <Button 
                                      type="primary" 
                                      size="small" 
                                      icon={<FileTextOutlined />}
                                      className="view-details-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        showStudentDetail(student.childrenID);
                                      }}
                                    >
                                      Details
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Empty 
                        description={
                          <div className="empty-message">
                            <Title level={5}>No Students Enrolled</Title>
                            <Text type="secondary">This class doesn't have any students enrolled yet.</Text>
                          </div>
                        }
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

      {/* Student Detail Modal */}
      <Modal
        title={
          <div className="modal-title">
            <UserOutlined className="modal-icon" />
            <span>Student Details</span>
          </div>
        }
        open={studentDetailVisible}
        onCancel={handleStudentDetailModalClose}
        width={700}
        className="student-detail-modal"
        footer={[
          <Button key="close" onClick={handleStudentDetailModalClose} size="large">
            Close
          </Button>
        ]}
      >
        <Spin spinning={studentDetailLoading}>
          {selectedStudent && (
            <div className="student-detail-content">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className="student-profile-photo">
                    <Avatar 
                      size={150} 
                      src={selectedStudent.avatar && selectedStudent.avatar !== "string" ? selectedStudent.avatar : null}
                      icon={!selectedStudent.avatar || selectedStudent.avatar === "string" ? <UserOutlined /> : null} 
                      className="big-avatar"
                    />
                    <div className="student-name-tag">
                      <Text strong>{selectedStudent.name}</Text>
                    </div>
                    <div className="student-tags">
                      <Tag color={selectedStudent.gender?.toLowerCase() === "female" ? "pink" : "blue"} className="gender-tag-large">
                        {selectedStudent.gender || 'Unspecified'}
                      </Tag>
                      <Tag color={selectedStudent.status === "Active" ? "green" : "orange"} className="status-tag-large">
                        {selectedStudent.status || 'Unknown'}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <Card className="student-info-card" title="Personal Information">
                    <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 500 }}>
                      <Descriptions.Item label="Full Name">{selectedStudent.name}</Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {new Date(selectedStudent.birthday).toLocaleDateString()}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">{selectedStudent.gender}</Descriptions.Item>
                      <Descriptions.Item label="City">{selectedStudent.city !== "string" ? selectedStudent.city : "-"}</Descriptions.Item>
                      <Descriptions.Item label="Class Name">{selectedClass.name || "-"}</Descriptions.Item>
                      <Descriptions.Item label="Grade Level">
                        {selectedStudent.gradeLevelName || selectedClass.gradeLevelName || "-"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Enrollment Date">
                        {selectedStudent.enrollDate !== "0001-01-01T00:00:00" ? 
                          new Date(selectedStudent.enrollDate).toLocaleDateString() : "-"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={[24, 24]} className="detail-row">
                <Col xs={24} md={12}>
                  <Card className="student-info-card" title="Parent Information">
                    <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 500 }}>
                      <Descriptions.Item label="Parent Name">{selectedStudent.parentName}</Descriptions.Item>
                      <Descriptions.Item label="Contact Number">{selectedStudent.phoneNumber}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card className="student-info-card" title="Documents">
                    <div className="document-preview">
                      {selectedStudent.birthCertificate && selectedStudent.birthCertificate !== "string" ? (
                        <div className="document-item">
                          <img 
                            src={selectedStudent.birthCertificate} 
                            alt="Birth Certificate" 
                            className="document-thumbnail" 
                            onClick={() => window.open(selectedStudent.birthCertificate, '_blank')}
                          />
                          <div className="document-label">Birth Certificate</div>
                        </div>
                      ) : (
                        <Empty 
                          description="No birth certificate provided" 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        />
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Teacher Detail Modal */}
      <Modal
        title={
          <div className="modal-title">
            <TeamOutlined className="modal-icon" />
            <span>Teacher Details</span>
          </div>
        }
        open={teacherDetailVisible}
        onCancel={handleTeacherDetailModalClose}
        width={700}
        className="teacher-detail-modal"
        footer={[
          <Button key="close" onClick={handleTeacherDetailModalClose} size="large">
            Close
          </Button>
        ]}
      >
        <Spin spinning={teacherDetailLoading}>
          {selectedTeacher && (
            <div className="teacher-detail-content">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className="teacher-profile-photo">
                    <Avatar 
                      size={150} 
                      icon={<UserOutlined />} 
                      className="big-teacher-avatar" 
                    />
                    <div className="teacher-name-tag">
                      <Text strong>{selectedTeacher.fullName}</Text>
                    </div>
                    <div className="teacher-tags">
                      <Tag color="blue" className="role-tag-large">
                        {selectedTeacher.roleName}
                      </Tag>
                      <Tag 
                        color={selectedTeacher.status === "Active" ? "green" : "orange"} 
                        className="status-tag-large"
                      >
                        {selectedTeacher.status}
                      </Tag>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <Card className="teacher-info-card" title="Personal Information">
                    <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 500 }}>
                      <Descriptions.Item label="Full Name">{selectedTeacher.fullName}</Descriptions.Item>
                      <Descriptions.Item label="Email Address">{selectedTeacher.email}</Descriptions.Item>
                      <Descriptions.Item label="Phone Number">{selectedTeacher.phoneNumber || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Address">{selectedTeacher.address || '-'}</Descriptions.Item>
                      <Descriptions.Item label="Role">{selectedTeacher.roleName}</Descriptions.Item>
                      <Descriptions.Item label="Status">{selectedTeacher.status}</Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
              </Row>
              
              <Row gutter={[24, 24]} className="detail-row">
                <Col xs={24}>
                  <Card className="class-info-card" title="Currently Teaching">
                    <div className="current-class-info">
                      <div className="class-icon-wrapper">
                        <BookOutlined className="class-icon" />
                      </div>
                      <div className="class-details">
                        <Text strong>{selectedClass.name}</Text>
                        <div className="class-meta">
                          <Tag color="cyan">{selectedClass.gradeLevelName}</Tag>
                          <Tag color="purple">{selectedClass.syllabusName}</Tag>
                          <Tag color="green">
                            {selectedClass.quantity} Students
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Create Class Modal */}
      <Modal
        title={
          <div className="modal-title">
            <PlusOutlined className="modal-icon" />
            <span>Create New Class</span>
          </div>
        }
        open={createVisible}
        onCancel={handleCreateModalClose}
        footer={null}
        width={600}
        className="create-class-modal"
        maskClosable={false}
        destroyOnClose={true}
      >
        <div className="create-class-content">
          <Spin spinning={loadingOptions}>
            <Form
              form={createForm}
              layout="vertical"
              onFinish={handleCreateClass}
              className="create-form"
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
                  className="create-input"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="syllabusID"
                label="Syllabus"
                rules={[
                  { 
                    required: true, 
                    message: 'Please select a syllabus!' 
                  }
                ]}
              >
                <Select
                  placeholder="Select syllabus"
                  size="large"
                  className="create-select"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {syllabi.map(syllabus => (
                    <Option key={syllabus.id} value={syllabus.id}>{syllabus.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="gradeLevelID"
                label="Grade Level"
                rules={[
                  { 
                    required: true, 
                    message: 'Please select a grade level!' 
                  }
                ]}
              >
                <Select
                  placeholder="Select grade level"
                  size="large"
                  className="create-select"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {gradeLevels.map(grade => (
                    <Option key={grade.id} value={grade.id}>{grade.name}</Option>
                  ))}
                </Select>
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
              >
                <InputNumber 
                  placeholder="Enter maximum children" 
                  className="create-input-number"
                  min={1}
                  max={100}
                  size="large"
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item
                name="enrichmentProgramId"
                label="Enrichment Program (Optional)"
              >
                <Select
                  placeholder="Select enrichment program (optional)"
                  size="large"
                  className="create-select"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option value={0}>None</Option>
                  {enrichmentPrograms.map(program => (
                    <Option key={program.id} value={program.id}>
                      {program.name} - {program.type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item className="form-actions">
                <Button 
                  type="default" 
                  onClick={handleCreateModalClose}
                  className="cancel-button"
                  size="large"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  loading={createLoading}
                  className="save-button"
                  size="large"
                >
                  Create Class
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="modal-title">
            <DeleteOutlined className="modal-icon" style={{ color: '#ff4d4f' }} />
            <span>Confirm Deletion</span>
          </div>
        }
        open={deleteConfirmVisible}
        onCancel={handleDeleteCancel}
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel} size="large">
            Cancel
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            loading={deleteLoading}
            onClick={handleDeleteClass}
            size="large"
          >
            Delete
          </Button>
        ]}
      >
        {deletingClass && (
          <div className="delete-confirmation-content">
            <p>Are you sure you want to delete the class <Text strong>{deletingClass.name}</Text>?</p>
            <p>This action cannot be undone.</p>
            
            {deletingClass.quantity > 0 && (
              <Alert
                message="Warning"
                description={`This class currently has ${deletingClass.quantity} student(s) enrolled. Deleting this class may affect these students.`}
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal
        title={
          <div className="modal-title">
            <UndoOutlined className="modal-icon" style={{ color: '#52c41a' }} />
            <span>Confirm Restoration</span>
          </div>
        }
        open={restoreConfirmVisible}
        onCancel={handleRestoreCancel}
        footer={[
          <Button key="cancel" onClick={handleRestoreCancel} size="large">
            Cancel
          </Button>,
          <Button 
            key="restore" 
            type="primary" 
            loading={restoreLoading}
            onClick={handleRestoreClass}
            size="large"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Restore
          </Button>
        ]}
      >
        {restoringClass && (
          <div className="restore-confirmation-content">
            <p>Are you sure you want to restore the class <Text strong>{restoringClass.name}</Text>?</p>
            <p>The class will be available again after restoration.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClassManagement;
