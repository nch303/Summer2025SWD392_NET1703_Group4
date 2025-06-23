import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Table, Calendar, Badge, 
  Input, Select, Tabs, Modal, Form, DatePicker, Upload, message,
  Space, Tag, Tooltip, Popconfirm, Spin, Empty, Descriptions
} from 'antd';
import { 
  UserOutlined, TeamOutlined, BookOutlined, CalendarOutlined, 
  PlusOutlined, NotificationOutlined, PieChartOutlined, 
  BarChartOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, UploadOutlined, ExportOutlined
} from '@ant-design/icons';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import './AdminPage.css';
import dayjs from 'dayjs';
import api from '../../config/axiosConfig';
import { getAllNews, getNewsById, createNews, updateNews, deleteNews } from '../news/NewsService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

// Mock data for dashboard
const stats = {
  totalStudents: 150,
  totalTeachers: 20,
  totalClasses: 8,
  totalActivities: 15
};

// Mock data for activities
const activities = [
  { id: 1, name: 'Art Class', teacher: 'Ms. Davis', participants: 15, schedule: 'Mon 2PM-3PM' },
  { id: 2, name: 'Music Class', teacher: 'Mr. Wilson', participants: 12, schedule: 'Wed 2PM-3PM' },
  // Add more mock activities...
];

// Mock data for news
const news = [
  { id: 1, title: 'Summer Program Registration', content: 'Registration for summer programs...', date: '2024-06-01' },
  { id: 2, title: 'Parent-Teacher Meeting', content: 'Annual parent-teacher meeting...', date: '2024-06-15' },
  // Add more mock news...
];

// Mock data for users
const users = [
  { id: 1, username: 'admin', role: 'Admin', email: 'admin@school.com', status: 'Active' },
  { id: 2, username: 'teacher1', role: 'Teacher', email: 'teacher1@school.com', status: 'Active' },
  // Add more mock users...
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [classList, setClassList] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [newsDetailVisible, setNewsDetailVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [originalNewsImages, setOriginalNewsImages] = useState({ image: null, banner: null });

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/Children');
      setChildren(response.data);
    } catch (error) {
      message.error('Failed to load children data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      if (searchText.trim() === '') {
        fetchChildren();
      } else {
        searchStudents(searchText);
      }
    }
    if (activeTab === 'classes') {
      fetchClassList();
    }
    if (activeTab === 'news') {
      fetchNews();
    }
  }, [activeTab, searchText]);

  // Filter children based on search text
  const filteredChildren = children.filter(child => 
    child.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    child.parentName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Fetch all classes for dropdown
  const fetchClassList = async () => {
    try {
      setClassLoading(true);
      const response = await api.get('/api/Class/get-all-classes');
      setClassList(response.data);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setClassLoading(false);
    }
  };
  // Fetch all children for multi-select
  const fetchChildrenList = async () => {
    try {
      const response = await api.get('/api/Children');
      setChildrenList(response.data);
    } catch (err) {
      message.error('Failed to load children list');
    }
  };
  // Open assign modal
  const openAssignModal = () => {
    fetchClassList();
    fetchChildrenList();
    setAssignModalVisible(true);
  };
  // Assign children to class
  const handleAssign = async () => {
    if (!selectedClassId || selectedChildren.length === 0) {
      message.error('Please select a class and at least one child');
      return;
    }
    setAssignLoading(true);
    try {
      await api.post(`/api/Staff/AssignChildrenToClass/${selectedClassId}`, selectedChildren);
      message.success('Children assigned to class successfully!');
      setAssignModalVisible(false);
      setSelectedChildren([]);
      setSelectedClassId(null);
    } catch (err) {
      message.error('Failed to assign children to class');
    } finally {
      setAssignLoading(false);
    }
  };

  // Dashboard Section
  const DashboardSection = () => (
    <div>
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Students" value={stats.totalStudents} prefix={<TeamOutlined />} valueStyle={{ color: '#ff7e29' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Teachers" value={stats.totalTeachers} prefix={<UserOutlined />} valueStyle={{ color: '#ff7e29' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Classes" value={stats.totalClasses} prefix={<CalendarOutlined />} valueStyle={{ color: '#ff7e29' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Activities" value={stats.totalActivities} prefix={<FileTextOutlined />} valueStyle={{ color: '#ff7e29' }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Activities" className="activity-card">
            <Table 
              dataSource={activities.slice(0, 5)} 
              columns={[
                { title: 'Activity', dataIndex: 'name' },
                { title: 'Teacher', dataIndex: 'teacher' },
                { title: 'Schedule', dataIndex: 'schedule' },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Upcoming Events" className="activity-card">
            <Calendar 
              fullscreen={false} 
              dateCellRender={(date) => {
                const dateStr = date.format('YYYY-MM-DD');
                const events = news.filter(n => n.date === dateStr);
                return (
                  <ul className="events">
                    {events.map(event => (
                      <li key={event.id}>
                        <Badge color="#ff914d" text={event.title} />
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Students Section
  const StudentsSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Search students..." 
            style={{ width: 300 }} 
            onSearch={(value) => setSearchText(value)}
            allowClear
            enterButton
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-student')}>
            Add Student
          </Button>
        </Space>
        <Spin spinning={loading}>
          <Table 
            dataSource={filteredChildren}
            columns={[
              {
                title: 'Avatar',
                dataIndex: 'avatar',
                render: (url) => url ? <img src={url} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : null,
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
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal('edit-student', record)} />
                    <Popconfirm
                      title="Are you sure you want to delete this student?"
                      onConfirm={() => handleDelete('student', record.id)}
                    >
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
            rowKey="id"
          />
        </Spin>
      </Card>
    </div>
  );

  // Classes Section
  const ClassesSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Search classes..."
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Add Class
          </Button>
        </Space>
        <Spin spinning={classLoading}>
          <Table
            dataSource={classList}
            rowKey="id"
            columns={[
              { title: 'Class Name', dataIndex: 'name' },
              { title: 'Syllabus', dataIndex: 'syllabusName' },
              { title: 'Grade Level', dataIndex: 'gradeLevelName' },
              { title: 'Max Children', dataIndex: 'maxChildren' },
              { title: 'Current Quantity', dataIndex: 'quantity' },
              { 
                title: 'Status', 
                dataIndex: 'status',
                render: (status) => (
                  <Tag color={status === 'Available' ? 'green' : 'red'}>
                    {status}
                  </Tag>
                )
              },
              {
                title: 'Actions',
                render: (_, record) => (
                  <Space>
                    <Button icon={<EditOutlined />} />
                    <Popconfirm
                      title="Are you sure you want to delete this class?"
                      onConfirm={() => message.info('Delete action not implemented')}
                    >
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Spin>
      </Card>
    </div>
  );

  // News Section with more complete properties
  const NewsSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search 
            placeholder="Search news..." 
            style={{ width: 300 }}
            allowClear 
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-news')}>
            Add News
          </Button>
        </Space>
        <Table 
          dataSource={newsItems}
          loading={newsLoading}
          rowKey={record => {
            console.log("Table record:", record);
            return record.id || record.newsId || record.ID || Math.random().toString(36).substr(2, 9);
          }}
          columns={[
            { title: 'Title', dataIndex: 'title', width: '20%' },
            { 
              title: 'Content', 
              dataIndex: 'content',
              width: '25%',
              ellipsis: true,
              render: content => (
                <Tooltip placement="topLeft" title={content}>
                  {content}
                </Tooltip>
              )
            },
            { 
              title: 'Publish Date', 
              dataIndex: 'publishDate', 
              width: '15%',
              render: (date) => new Date(date).toLocaleDateString() 
            },
            { 
              title: 'Banner', 
              dataIndex: 'banner',
              width: '15%',
              render: (url) => url ? (
                <img 
                  src={url} 
                  alt="banner" 
                  style={{ width: 80, height: 45, objectFit: 'cover', cursor: 'pointer' }} 
                  onClick={() => window.open(url, '_blank')}
                />
              ) : 'No banner'
            },
            { 
              title: 'Status', 
              dataIndex: 'status',
              width: '10%',
              render: (status) => <Tag color="blue">{status}</Tag>
            },
            {
              title: 'Actions',
              width: '15%',
              render: (_, record) => {
                console.log("Action record:", record);
                const newsId = record.id || record.newsId || record.ID;
                return (
                  <Space>
                    <Button onClick={() => showNewsDetail(record)}>View</Button>
                    <Button icon={<EditOutlined />} onClick={() => showModal('edit-news', record)} />
                    <Popconfirm
                      title="Are you sure you want to delete this news?"
                      onConfirm={() => {
                        console.log(`Deleting news with ID: ${newsId}`);
                        handleDelete('news', newsId);
                      }}
                    >
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>
      
      {/* News Detail Modal */}
      <Modal
        title="News Details"
        open={newsDetailVisible}
        onCancel={() => setNewsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNewsDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedNews && (
          <div style={{ padding: '0 20px' }}>
            <h2 style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>{selectedNews.title}</h2>
            
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ marginBottom: '20px' }}>
                  <h3>Content</h3>
                  <div style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '10px', borderRadius: '4px' }}>
                    {selectedNews.content}
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <Card title="Banner Image" bordered={false}>
                  {selectedNews.banner ? (
                    <img 
                      src={selectedNews.banner} 
                      alt="Banner" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <Empty description="No banner" />
                  )}
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="Thumbnail Image" bordered={false}>
                  {selectedNews.image ? (
                    <img 
                      src={selectedNews.image} 
                      alt="Image" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                    />
                  ) : (
                    <Empty description="No image" />
                  )}
                </Card>
              </Col>
              
              <Col span={12}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Publish Date">
                    {new Date(selectedNews.publishDate).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color="blue">{selectedNews.status}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );

  // Users Section
  const UsersSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search placeholder="Search users..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-user')}>
            Add User
          </Button>
        </Space>
        <Table 
          dataSource={users}
          columns={[
            { title: 'Username', dataIndex: 'username' },
            { title: 'Role', dataIndex: 'role' },
            { title: 'Email', dataIndex: 'email' },
            { 
              title: 'Status', 
              dataIndex: 'status',
              render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>
                  {status}
                </Tag>
              )
            },
            {
              title: 'Actions',
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => showModal('edit-user', record)} />
                  <Popconfirm
                    title="Are you sure you want to delete this user?"
                    onConfirm={() => handleDelete('user', record.id)}
                  >
                    <Button icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  // Reports Section
  const ReportsSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select defaultValue="students" style={{ width: 200 }}>
            <Select.Option value="students">Students Report</Select.Option>
            <Select.Option value="classes">Classes Report</Select.Option>
            <Select.Option value="activities">Activities Report</Select.Option>
          </Select>
          <DatePicker.RangePicker />
          <Button type="primary" icon={<ExportOutlined />}>
            Export Report
          </Button>
        </Space>
        <Table 
          dataSource={[]}
          columns={[
            { title: 'Report Type', dataIndex: 'type' },
            { title: 'Generated Date', dataIndex: 'date' },
            { title: 'Status', dataIndex: 'status' },
            {
              title: 'Actions',
              render: () => (
                <Space>
                  <Button icon={<ExportOutlined />}>Download</Button>
                  <Button icon={<DeleteOutlined />} danger>Delete</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  const showModal = (type, record = null) => {
    setModalType(type);
    setIsModalVisible(true);
    form.resetFields();

    if (record) {
      // For news items, make sure to properly set image and banner display info
      if (type === 'edit-news') {
        // First set all fields
        form.setFieldsValue({
          id: record.id,
          title: record.title,
          content: record.content,
          status: record.status,
          // Don't set image/banner files directly, they'll be handled by the Upload component
        });
        
        // Store original image/banner URLs in component state for later reference
        setOriginalNewsImages({
          image: record.image,
          banner: record.banner
        });
      } 
      // For students, handle birthday conversion
      else if (type === 'edit-student' && record.birthday) {
        const recordCopy = { ...record };
        recordCopy.birthday = dayjs(recordCopy.birthday);
        form.setFieldsValue(recordCopy);
      }
      else {
        form.setFieldsValue(record);
      }
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = modalType.startsWith('edit');
      
      // Make sure we have all the data we need for debugging
      console.log('Form values:', values);
      console.log('Is edit?', isEdit);
      console.log('Modal type:', modalType);

      // Handle different entity types
      if (modalType.includes('student')) {
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
  
        if (values.avatar instanceof File) {
          formData.append('Avatar', values.avatar);
        }
  
        if (values.birthCertificate instanceof File) {
          formData.append('BirthCertificate', values.birthCertificate);
        }
  
        try {
          if (isEdit) {
            await api.put(`/api/Children/${values.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } else {
            await api.post('/api/Children', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
          message.success(`Student ${isEdit ? 'updated' : 'added'} successfully!`);
          fetchChildren();
        } catch (error) {
          throw new Error(`Failed to ${isEdit ? 'update' : 'create'} student: ${error.message}`);
        }
      }
      else if (modalType.includes('news')) {
        const formData = new FormData();
        formData.append('Title', values.title);
        formData.append('Content', values.content);
        formData.append('Status', values.status || 'Published');
        
        if (isEdit) {
          // Make sure to include the ID in the form data
          formData.append('Id', values.id);
          console.log('Updating news with ID:', values.id);
        }
        
        // Handle image file uploads
        if (values.image instanceof File) {
          formData.append('Image', values.image);
        } else if (isEdit && originalNewsImages.image) {
          // If no new image was selected but there was an original image
          formData.append('ExistingImage', originalNewsImages.image);
        }
        
        if (values.banner instanceof File) {
          formData.append('Banner', values.banner);
        } else if (isEdit && originalNewsImages.banner) {
          // If no new banner was selected but there was an original banner
          formData.append('ExistingBanner', originalNewsImages.banner);
        }
        
        try {
          if (isEdit) {
            // Fix the API call to ensure ID is included
            if (!values.id) {
              throw new Error('Cannot update news: ID is missing');
            }
            await updateNews(values.id, formData);
            message.success('News updated successfully!');
          } else {
            await createNews(formData);
            message.success('News created successfully!');
          }
          fetchNews();
        } catch (error) {
          console.error('Error:', error);
          throw new Error(`Failed to ${isEdit ? 'update' : 'create'} news: ${error.message}`);
        }
      }
      
      setIsModalVisible(false);
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      console.log(`About to delete ${type} with ID: ${id}`);
      
      if (!id) {
        message.error(`Cannot delete ${type}: ID is missing`);
        return;
      }
      
      if (type === 'student' || type === '') {
        await api.delete(`/api/Children/${id}`);
        message.success('Student deleted successfully!');
        fetchChildren();
      } 
      else if (type === 'news') {
        // Direct API call to ensure proper URL
        try {
          await api.delete(`/api/News/delete-news/${id}`);
          message.success('News deleted successfully!');
          fetchNews();
        } catch (error) {
          console.error("Delete error:", error);
          message.error(`Failed to delete news: ${error.message}`);
        }
      }
      else {
        message.warning('Delete operation not implemented for this type');
      }
    } catch (error) {
      message.error(`Failed to delete ${type}: ` + error.message);
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'add-student':
      case 'edit-student':
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="name" label="Student Name" rules={[{ required: true }]}> 
              <Input />
            </Form.Item>
            <Form.Item name="birthday" label="Birthday" rules={[
              { required: true, message: 'Please select birthday' },
              {
                validator: (_, value) => {
                  if (value && dayjs(value).isAfter(dayjs())) {
                    return Promise.reject('Birthday cannot be in the future');
                  }
                  return Promise.resolve();
                }
              }
            ]}> 
              <DatePicker 
                style={{ width: '100%' }} 
                format="YYYY-MM-DD" 
                disabledDate={current => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true }]}> 
              <Select>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="avatar"
              label="Avatar"
              valuePropName="file"
              getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                listType="picture"
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload Avatar</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="city" label="City"> 
              <Input />
            </Form.Item>
            <Form.Item
              name="birthCertificate"
              label="Birth Certificate"
              valuePropName="file"
              getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                listType="picture"
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Upload Certificate</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="parentName" label="Parent Name"> 
              <Input />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number"> 
              <Input />
            </Form.Item>
          </Form>
        );
      case 'add-news':
      case 'edit-news':
        const isEditingNews = modalType === 'edit-news';
        
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter news title' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please enter news content' }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="image"
              label="Image"
              valuePropName="file"
              getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                listType="picture"
                accept="image/*"
                fileList={isEditingNews && originalNewsImages?.image ? [
                  {
                    uid: '-1',
                    name: 'Current Image',
                    status: 'done',
                    url: originalNewsImages.image,
                  }
                ] : []}
              >
                <Button icon={<UploadOutlined />}>
                  {isEditingNews ? 'Change Image' : 'Upload Image'}
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item
              name="banner"
              label="Banner Image"
              valuePropName="file"
              getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj}
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                listType="picture"
                accept="image/*"
                fileList={isEditingNews && originalNewsImages?.banner ? [
                  {
                    uid: '-1',
                    name: 'Current Banner',
                    status: 'done',
                    url: originalNewsImages.banner,
                  }
                ] : []}
              >
                <Button icon={<UploadOutlined />}>
                  {isEditingNews ? 'Change Banner' : 'Upload Banner'}
                </Button>
              </Upload>
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
              <Select>
                <Select.Option value="Published">Published</Select.Option>
                <Select.Option value="Draft">Draft</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  // Fetch enrichment activities from API
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await api.get('/api/EnrichmentProgram/get-all-enrichment-program');
      setActivities(response.data);
    } catch (err) {
      message.error('Error loading enrichment activities: ' + err.message);
      console.error('Error fetching enrichment programs:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchActivities();
  }, []);

  // Handle create/edit activity
  const handleActivitySubmit = async (values) => {
    try {
      if (editingActivity) {
        await api.put(`/api/EnrichmentProgram/${editingActivity.id || editingActivity.ID}`, values);
        message.success('Update enrichment program successfully!');
      } else {
        await api.post('/api/EnrichmentProgram/create-enrichment-program', values);
        message.success('Create enrichment program successfully!');
      }
      setActivityModalVisible(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (err) {
      message.error('Error saving enrichment program: ' + err.message);
      console.error('Error saving activity:', err);
    }
  };

  // Handle delete activity
  const handleDeleteActivity = async (id) => {
    try {
      await api.delete(`/api/EnrichmentProgram/${id}`);
      message.success('Delete enrichment program successfully!');
      fetchActivities();
    } catch (err) {
      message.error('Error deleting enrichment program: ' + err.message);
      console.error('Error deleting activity:', err);
    }
  };

  // Handle open modal
  const openActivityModal = (activity = null) => {
    setEditingActivity(activity);
    setActivityModalVisible(true);
  };

  // Handle send announcement
  const handleSendAnnouncement = async () => {
    try {
      await api.post('/api/Announcement/send', announcementForm);
      message.success('Send announcement successfully!');
      setAnnouncementModalVisible(false);
      setAnnouncementForm({ title: '', content: '' });
    } catch (err) {
      message.error('Error sending announcement!');
    }
  };

  // Replace searchStudents function with axios
  const searchStudents = async (query) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/Children/search?query=${encodeURIComponent(query)}`);
      setChildren(response.data);
    } catch (error) {
      message.error('Failed to search students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch news function
  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const response = await getAllNews();
      console.log("Raw news data received:", response);
      const newsData = response.data || [];
      console.log("News items to be displayed:", newsData);
      setNewsItems(newsData);
    } catch (error) {
      console.error("News fetch error:", error);
      message.error('Failed to load news');
    } finally {
      setNewsLoading(false);
    }
  };

  // Add this function to show news details
  const showNewsDetail = (news) => {
    setSelectedNews(news);
    setNewsDetailVisible(true);
  };

  return (
    <div className="admin-dashboard">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'dashboard',
            label: 'Dashboard',
            children: <DashboardSection />,
          },
          {
            key: 'students',
            label: 'Students',
            children: <StudentsSection />,
          },
          {
            key: 'classes',
            label: 'Classes',
            children: <ClassesSection />,
          },
          {
            key: 'news',
            label: 'News',
            children: <NewsSection />,
          },
          {
            key: 'users',
            label: 'Users',
            children: <UsersSection />,
          },
          {
            key: 'reports',
            label: 'Reports',
            children: <ReportsSection />,
          },
        ]}
      />

      <Modal
        title={modalType.startsWith('add') ? 'Add New' : 'Edit'} 
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default AdminPage;
