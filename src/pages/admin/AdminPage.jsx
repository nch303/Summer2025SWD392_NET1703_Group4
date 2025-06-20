import React, { useState } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Table, Calendar, Badge, 
  Input, Select, Tabs, Modal, Form, DatePicker, Upload, message,
  Space, Tag, Tooltip, Popconfirm, Spin
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
import { useEffect } from 'react';
import {
  getEnrichmentActivities
} from '../enrichment-activities/EnrichmentActivityListService';
import { createEnrichmentActivity } from '../enrichment-activities/EnrichmentActivityCreateService';
import { updateEnrichmentActivity } from '../enrichment-activities/EnrichmentActivityEditService';
import { deleteEnrichmentActivity } from '../enrichment-activities/EnrichmentActivityDeleteService';
import { sendAnnouncement } from '../announcement/SendAnnouncementService';

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

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7216/api/Children');
      if (!response.ok) {
        throw new Error('Failed to fetch children data');
      }
      const data = await response.json();
      setChildren(data);
    } catch (error) {
      message.error('Failed to load children data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students') {
      fetchChildren();
    }
    if (activeTab === 'classes') {
      fetchClassList()
    }
  }, [activeTab]);

  // Filter children based on search text
  const filteredChildren = children.filter(child => 
    child.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    child.parentName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Fetch all classes for dropdown
  const fetchClassList = async () => {
    try {
      const res = await fetch('https://localhost:7216/api/Class/get-all-classes');
      if (!res.ok) throw new Error('Failed to fetch class list');
      const data = await res.json();
      setClassList(data);
    } catch (err) {
      message.error('Failed to load class list');
    }
  };
  // Fetch all children for multi-select
  const fetchChildrenList = async () => {
    try {
      const res = await fetch('https://localhost:7216/api/Children');
      if (!res.ok) throw new Error('Failed to fetch children list');
      const data = await res.json();
      setChildrenList(data);
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
      const res = await fetch(`https://localhost:7216/api/Staff/AssignChildrenToClass/${selectedClassId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedChildren),
      });
      if (!res.ok) throw new Error('Failed to assign children to class');
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
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
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
          <Input.Search placeholder="Search classes..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-class')}>
            Add Class
          </Button>
        </Space>
        <Table 
          dataSource={classList}
          columns={[
            { title: 'Class Name', dataIndex: 'name' },
            { title: 'Teacher', dataIndex: 'teacher' },
            { title: 'Students', dataIndex: 'students' },
            { title: 'Schedule', dataIndex: 'schedule' },
            {
              title: 'Actions',
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => showModal('edit-class', record)} />
                  <Popconfirm
                    title="Are you sure you want to delete this class?"
                    onConfirm={() => handleDelete('class', record.id)}
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

  // Activities Section
  const ActivitiesSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openActivityModal()}>
            Add Enrichment Activity
          </Button>
          <Button icon={<NotificationOutlined />} onClick={() => setAnnouncementModalVisible(true)}>
            Send Announcement
          </Button>
        </Space>
        <Table 
          dataSource={activities}
          loading={activitiesLoading}
          rowKey={record => record.id || record.ID}
          columns={[
            { title: 'Activity Name', dataIndex: 'name', key: 'name' },
            { title: '', dataIndex: 'description', key: 'description' },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => openActivityModal(record)} />
                  <Popconfirm
                    title="Are you sure you want to delete this activity?"
                    onConfirm={() => handleDeleteActivity(record.id || record.ID)}
                  >
                    <Button icon={<DeleteOutlined />} danger />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <Modal
        title={editingActivity ? 'Edit Enrichment Activity' : 'Add Enrichment Activity'}
        open={activityModalVisible}
        onCancel={() => { setActivityModalVisible(false); setEditingActivity(null); }}
        onOk={() => {
          form
            .validateFields()
            .then(values => {
              handleActivitySubmit(values);
            });
        }}
        okText={editingActivity ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingActivity || { name: '', description: '' }}
          key={editingActivity ? editingActivity.id || editingActivity.ID : 'new'}
        >
          <Form.Item name="name" label="Activity Name" rules={[{ required: true, message: 'Enter activity name' }]}> <Input /> </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Enter description' }]}> <Input.TextArea /> </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Send Announcement"
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        onOk={handleSendAnnouncement}
        okText="Send"
      >
        <Form layout="vertical">
          <Form.Item label="Title" required>
            <Input
              value={announcementForm.title}
              onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Content" required>
            <Input.TextArea
              value={announcementForm.content}
              onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // News Section
  const NewsSection = () => (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input.Search placeholder="Search news..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-news')}>
            Add News
          </Button>
        </Space>
        <Table 
          dataSource={news}
          columns={[
            { title: 'Title', dataIndex: 'title' },
            { title: 'Date', dataIndex: 'date' },
            {
              title: 'Actions',
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => showModal('edit-news', record)} />
                  <Popconfirm
                    title="Are you sure you want to delete this news?"
                    onConfirm={() => handleDelete('news', record.id)}
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
  
    if (record) {
      const { birthday, ...rest } = record;
      form.setFieldsValue({
        ...rest,
        birthday: birthday ? dayjs(birthday) : null,
        id: record.id || null, // đảm bảo ID luôn được truyền vào form
      });
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const isEdit = modalType.startsWith('edit');
  
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
  
      // 🖼️ Nếu người dùng chọn file mới thì thêm vào
      if (values.avatar instanceof File) {
        formData.append('Avatar', values.avatar);
      }
  
      if (values.birthCertificate instanceof File) {
        formData.append('BirthCertificate', values.birthCertificate);
      }
  
      const url = isEdit
        ? `https://localhost:7216/api/Children/${values.id}`
        : 'https://localhost:7216/api/Children';
  
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to save student data');
      }
  
      setIsModalVisible(false);
      message.success(`Student ${isEdit ? 'updated' : 'added'} successfully!`);
      fetchChildren();
    } catch (error) {
      message.error('Operation failed: ' + error.message);
    }
  };


  const handleDelete = async (type, id) => {
    try {
      const response = await fetch(`https://localhost:7216/api/Children/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      message.success('Student deleted successfully!');
      fetchChildren(); // Refresh the list
    } catch (error) {
      message.error('Failed to delete student: ' + error.message);
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
            <Form.Item name="birthday" label="Birthday" rules={[{ required: true }]}> 
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
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
      // Add more form cases for other types...
      default:
        return null;
    }
  };

  // Fetch enrichment activities from API
  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const data = await getEnrichmentActivities();
      setActivities(data);
    } catch (err) {
      message.error('Error loading enrichment activities');
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
        await updateEnrichmentActivity(editingActivity.id || editingActivity.ID, values);
        message.success('Update enrichment activity successfully!');
      } else {
        await createEnrichmentActivity(values);
        message.success('Create enrichment activity successfully!');
      }
      setActivityModalVisible(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (err) {
      message.error('Error saving enrichment activity!');
    }
  };

  // Handle delete activity
  const handleDeleteActivity = async (id) => {
    try {
      await deleteEnrichmentActivity(id);
      message.success('Delete enrichment activity successfully!');
      fetchActivities();
    } catch (err) {
      message.error('Error deleting enrichment activity!');
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
      await sendAnnouncement(announcementForm);
      message.success('Send announcement successfully!');
      setAnnouncementModalVisible(false);
      setAnnouncementForm({ title: '', content: '' });
    } catch (err) {
      message.error('Error sending announcement!');
    }
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
            key: 'activities',
            label: 'Activities',
            children: <ActivitiesSection />,
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
