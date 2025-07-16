import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Input, Form, DatePicker, Upload, message,
  Space, Spin, Select, Modal, Row, Col, Image, Tag, Tooltip, Avatar,
  EditOutlined, UploadOutlined, ExclamationCircleOutlined, UserOutlined,
  FilterOutlined, FileSearchOutlined, ReloadOutlined, EyeOutlined
} from '../../utils/AntComponents';
import styles from './StudentsManagement.module.css';
import dayjs from 'dayjs';
import { searchStudents, fetchAllStudents, updateStudent } from '../../services/AdminService';

const StudentsManagement = () => {
  const [form] = Form.useForm();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [filterGender, setFilterGender] = useState(null);
  const [filterCity, setFilterCity] = useState(null);
  const [studentStats, setStudentStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    other: 0
  });

  useEffect(() => {
    if (searchText.trim() === '') {
      fetchChildren();
    } else {
      searchStudentsHandler(searchText);
    }
  }, [searchText]);
  
  useEffect(() => {
    if (children.length > 0) {
      // Calculate stats
      const stats = {
        total: children.length,
        male: children.filter(c => c.gender === 'Male').length,
        female: children.filter(c => c.gender === 'Female').length,
        other: children.filter(c => c.gender === 'Other').length
      };
      setStudentStats(stats);
    }
  }, [children]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await fetchAllStudents();
      setChildren(response.data);
    } catch (error) {
      displayError('Failed to load children data', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to display errors
  const displayError = (messageText, error) => {
    console.error(error);
    const errorDetail = error.response?.data?.message || error.message || 'Unknown error';
    message.error({
      content: (
        <div>
          <div><ExclamationCircleOutlined /> {messageText}</div>
          <div className={styles.errorDetail}>{errorDetail}</div>
        </div>
      ),
      duration: 5
    });
  };

  // Filter children based on search text and filters
  const filteredChildren = children.filter(child => {
    const matchesSearch = child.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         child.parentName?.toLowerCase().includes(searchText.toLowerCase());
    const matchesGender = filterGender ? child.gender === filterGender : true;
    const matchesCity = filterCity ? child.city === filterCity : true;
    
    return matchesSearch && matchesGender && matchesCity;
  });

  // Get unique cities for filtering
  const uniqueCities = [...new Set(children.map(child => child.city).filter(Boolean))];

  // Search students
  const searchStudentsHandler = async (query) => {
    try {
      setLoading(true);
      const response = await searchStudents(query);
      setChildren(response.data);
    } catch (error) {
      displayError('Failed to search students', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchText('');
    setFilterGender(null);
    setFilterCity(null);
    fetchChildren();
  };

  const showEditModal = (record) => {
    setIsModalVisible(true);
    form.resetFields();
    setFormErrors({});

    if (record) {
      setSelectedStudent(record);
      if (record.birthday) {
        const recordCopy = { ...record };
        recordCopy.birthday = dayjs(recordCopy.birthday);
        form.setFieldsValue(recordCopy);
      } else {
        form.setFieldsValue(record);
      }
    }
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      setFormErrors({});

      if (values.birthday && dayjs.isDayjs(values.birthday)) {
        values.birthday = values.birthday.format('YYYY-MM-DD');
      }

      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('Birthday', values.birthday);
      formData.append('Gender', values.gender);
      formData.append('City', values.city || '');
      formData.append('ParentName', values.parentName || '');
      formData.append('PhoneNumber', values.phoneNumber || '');

      // Handle file uploads only if new files were selected
      if (values.avatar instanceof File) {
        formData.append('Avatar', values.avatar);
      }

      if (values.birthCertificate instanceof File) {
        formData.append('BirthCertificate', values.birthCertificate);
      }

      try {
        await updateStudent(selectedStudent.id, formData);
        message.success('Student updated successfully!');
        fetchChildren();
        setIsModalVisible(false);
      } catch (error) {
        const errorData = error.response?.data;
        if (errorData?.errors) {
          // Map API validation errors to form fields
          const errors = {};
          Object.keys(errorData.errors).forEach(key => {
            errors[key.toLowerCase()] = errorData.errors[key][0];
          });
          setFormErrors(errors);
        }
        displayError('Failed to update student', error);
      }
    } catch (error) {
      // Form validation errors
      displayError('Please check the form for errors', error);
    }
  };

  const getGenderColor = (gender) => {
    switch(gender) {
      case 'Male': return 'blue';
      case 'Female': return 'pink';
      case 'Other': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div className={styles.studentsManagement}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Student Management</h1>
        <div className={styles.statCards}>
          <Card className={styles.statCard}>
            <div className={styles.statCardContent}>
              <UserOutlined className={styles.statIcon} />
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{studentStats.total}</div>
                <div className={styles.statLabel}>Total Students</div>
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={`${styles.statIcon} ${styles.maleIcon}`}>M</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{studentStats.male}</div>
                <div className={styles.statLabel}>Male Students</div>
              </div>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={`${styles.statIcon} ${styles.femaleIcon}`}>F</div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{studentStats.female}</div>
                <div className={styles.statLabel}>Female Students</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className={styles.mainCard}>
        <div className={styles.filterSection}>
          <div className={styles.searchWrapper}>
            <Input.Search
              placeholder="Search by name or parent..."
              allowClear
              enterButton={<Button type="primary" icon={<FileSearchOutlined />}>Search</Button>}
              size="large"
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.filterControls}>
            <Select
              placeholder="Filter by Gender"
              allowClear
              style={{ width: 160 }}
              onChange={(value) => setFilterGender(value)}
              value={filterGender}
              className={styles.filterSelect}
            >
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
            
            <Select
              placeholder="Filter by City"
              allowClear
              style={{ width: 180 }}
              onChange={(value) => setFilterCity(value)}
              value={filterCity}
              className={styles.filterSelect}
            >
              {uniqueCities.map(city => (
                <Select.Option key={city} value={city}>{city}</Select.Option>
              ))}
            </Select>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={resetFilters}
              className={styles.resetButton}
            >
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className={styles.tableWrapper}>
          <Spin spinning={loading}>
            <Table
              dataSource={filteredChildren}
              columns={[
                {
                  title: 'Student',
                  key: 'student',
                  render: (_, record) => (
                    <div className={styles.studentCell}>
                      <Avatar
                        size={46}
                        src={record.avatar}
                        icon={!record.avatar && <UserOutlined />}
                        className={styles.studentAvatar}
                      />
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>{record.name}</div>
                        <div className={styles.studentDetails}>
                          <Tag color={getGenderColor(record.gender)}>{record.gender}</Tag>
                          {record.city && <span>{record.city}</span>}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: 'Birthday',
                  dataIndex: 'birthday',
                  render: (date) => date ? (
                    <div className={styles.birthdayCell}>
                      {new Date(date).toLocaleDateString()}
                      <span className={styles.ageLabel}>
                        ({dayjs().diff(dayjs(date), 'year')} years old)
                      </span>
                    </div>
                  ) : '-',
                  sorter: (a, b) => new Date(a.birthday) - new Date(b.birthday),
                },
                {
                  title: 'Parent Contact',
                  key: 'parentContact',
                  render: (_, record) => (
                    <div className={styles.parentInfo}>
                      <div className={styles.parentName}>{record.parentName || '-'}</div>
                      <div className={styles.phoneNumber}>{record.phoneNumber || '-'}</div>
                    </div>
                  ),
                },
                {
                  title: 'Documents',
                  key: 'documents',
                  render: (_, record) => (
                    <div className={styles.documentLinks}>
                      {record.birthCertificate ? (
                        <Tooltip title="View birth certificate">
                          <a
                            href={record.birthCertificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.documentLink}
                          >
                            <EyeOutlined /> Certificate
                          </a>
                        </Tooltip>
                      ) : (
                        <Tag color="error">Missing</Tag>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Button 
                      type="primary"
                      icon={<EditOutlined />} 
                      onClick={() => showEditModal(record)}
                      className={styles.editButton}
                    >
                      Edit
                    </Button>
                  ),
                },
              ]}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Total ${total} students` 
              }}
              rowClassName={styles.tableRow}
              className={styles.studentsTable}
              locale={{
                emptyText: (
                  <div className={styles.emptyState}>
                    <UserOutlined className={styles.emptyIcon} />
                    <p>No students found</p>
                    <Button type="primary" onClick={resetFilters}>Clear filters</Button>
                  </div>
                )
              }}
            />
          </Spin>
        </div>
      </Card>

      <Modal
        title="Edit Student Information"
        open={isModalVisible}
        onOk={handleEditOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        styles={{
          body: { padding: '24px' }
        }}
        style={{ top: 20 }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginBottom: 0 }}
          className={styles.editStudentForm}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="id" hidden>
                <Input />
              </Form.Item>
              <Form.Item
                name="name"
                label="Student Name"
                rules={[{ required: true }]}
                validateStatus={formErrors.name ? 'error' : ''}
                help={formErrors.name}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="birthday"
                label="Birthday"
                rules={[
                  { required: true, message: 'Please select birthday' },
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isAfter(dayjs())) {
                        return Promise.reject('Birthday cannot be in the future');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
                validateStatus={formErrors.birthday ? 'error' : ''}
                help={formErrors.birthday}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  disabledDate={current => current && current > dayjs().endOf('day')}
                />
              </Form.Item>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true }]}
                validateStatus={formErrors.gender ? 'error' : ''}
                help={formErrors.gender}
              >
                <Select>
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="city"
                label="City"
                validateStatus={formErrors.city ? 'error' : ''}
                help={formErrors.city}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="parentName"
                label="Parent Name"
                validateStatus={formErrors.parentName ? 'error' : ''}
                help={formErrors.parentName}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                validateStatus={formErrors.phoneNumber ? 'error' : ''}
                help={formErrors.phoneNumber}
              >
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="avatar"
                    label="Avatar"
                    valuePropName="file"
                    getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
                    validateStatus={formErrors.avatar ? 'error' : ''}
                    help={formErrors.avatar}
                  >
                    <div className={styles.uploadContainer}>
                      {selectedStudent?.avatar && (
                        <Image
                          src={selectedStudent.avatar}
                          alt="Current avatar"
                          className={styles.previewImage}
                          preview={true}
                        />
                      )}
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        showUploadList={false}
                        className={styles.uploadButton}
                      >
                        <Button icon={<UploadOutlined />}>
                          {selectedStudent?.avatar ? 'Change Avatar' : 'Upload Avatar'}
                        </Button>
                      </Upload>
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="birthCertificate"
                    label="Birth Certificate"
                    valuePropName="file"
                    getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
                    validateStatus={formErrors.birthCertificate ? 'error' : ''}
                    help={formErrors.birthCertificate}
                  >
                    <div className={styles.uploadContainer}>
                      {selectedStudent?.birthCertificate && (
                        <Button
                          type="primary"
                          href={selectedStudent.birthCertificate}
                          target="_blank"
                          className={styles.viewDocButton}
                        >
                          <EyeOutlined /> View Certificate
                        </Button>
                      )}
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        showUploadList={false}
                        className={styles.uploadButton}
                      >
                        <Button icon={<UploadOutlined />}>
                          {selectedStudent?.birthCertificate ? 'Change Certificate' : 'Upload Certificate'}
                        </Button>
                      </Upload>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentsManagement;
