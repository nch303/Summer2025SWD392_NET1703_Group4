import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Table, Input, Form, DatePicker, Upload, message,
  Space, Spin, Select, Modal, Row, Col, Image
} from 'antd';
import { 
  EditOutlined, UploadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import './StudentsManagement.css';
import dayjs from 'dayjs';
import api from '../../config/axiosConfig';
import { searchStudents, fetchAllStudents, updateStudent } from './StudentsManagementService';

const StudentsManagement = () => {
  const [form] = Form.useForm();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (searchText.trim() === '') {
      fetchChildren();
    } else {
      searchStudentsHandler(searchText);
    }
  }, [searchText]);

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
          <div className="error-detail">{errorDetail}</div>
        </div>
      ),
      duration: 5
    });
  };

  // Filter children based on search text
  const filteredChildren = children.filter(child => 
    child.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    child.parentName?.toLowerCase().includes(searchText.toLowerCase())
  );

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

  return (
    <div className="students-management">
      <Card title="Students Management">
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Search students..." 
            style={{ width: 300 }} 
            onSearch={(value) => setSearchText(value)}
            allowClear
            enterButton
          />
        </Space>
        <Spin spinning={loading}>
          <Table 
            dataSource={filteredChildren}
            columns={[
              {
                title: 'Avatar',
                dataIndex: 'avatar',
                render: (url) => url ? <img src={url} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} /> : null,
              },
              { title: 'Name', dataIndex: 'name' },
              {
                title: 'Birthday',
                dataIndex: 'birthday',
                render: (date) => date ? new Date(date).toLocaleDateString() : '',
              },
              { title: 'Gender', dataIndex: 'gender' },
              { title: 'City', dataIndex: 'city' },
              { title: 'Parent', dataIndex: 'parentName' },
              { title: 'Phone', dataIndex: 'phoneNumber' },
              {
                title: 'Birth Certificate',
                dataIndex: 'birthCertificate',
                render: (url) => url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(90deg, #c3aed6 0%, #f5d0fe 100%)',
                      color: '#7c3aed',
                      padding: '2px 12px',
                      borderRadius: '8px',
                      textDecoration: 'underline',
                      fontWeight: 500,
                      boxShadow: '0 1px 4px 0 rgba(195,174,214,0.10)',
                      transition: 'background 0.3s, color 0.3s',
                      display: 'inline-block',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, #b39ddb 0%, #e0c3fc 100%)';
                      e.currentTarget.style.color = '#5b21b6';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'linear-gradient(90deg, #c3aed6 0%, #f5d0fe 100%)';
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    View
                  </a>
                ) : '',
              },
              {
                title: 'Actions',
                render: (_, record) => (
                  <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                    Edit
                  </Button>
                ),
              },
            ]}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title="Edit Student" 
        open={isModalVisible}
        onOk={handleEditOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        bodyStyle={{ padding: '24px' }}
        style={{ top: 20 }}
        centered
      >
        <Form 
          form={form} 
          layout="vertical"
          style={{ marginBottom: 0 }}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedStudent?.avatar && (
                        <Image 
                          src={selectedStudent.avatar} 
                          alt="Current avatar" 
                          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                          preview={true}
                        />
                      )}
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="small">
                          Change Avatar
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedStudent?.birthCertificate && (
                        <Button 
                          type="primary" 
                          href={selectedStudent.birthCertificate} 
                          target="_blank"
                          style={{
                            background: 'linear-gradient(90deg, #c3aed6 0%, #f5d0fe 100%)',
                            border: 'none',
                            height: 'auto',
                            padding: '4px 12px'
                          }}
                        >
                          View current certificate
                        </Button>
                      )}
                      <Upload
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />} size="small">
                          Change Certificate
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
