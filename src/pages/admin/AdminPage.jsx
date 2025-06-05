import React, { useState } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Table, Calendar, Badge, 
  Input, Select, Tabs, Modal, Form, DatePicker, Upload, message,
  Space, Tag, Tooltip, Popconfirm
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend, ArcElement);

// Mock data for dashboard
const stats = {
  totalStudents: 150,
  totalTeachers: 20,
  totalClasses: 8,
  totalActivities: 15
};

// Mock data for students
const students = [
  { id: 1, name: 'John Doe', class: 'Class A', age: 5, parentName: 'Jane Doe', phone: '123-456-7890' },
  { id: 2, name: 'Jane Smith', class: 'Class B', age: 4, parentName: 'John Smith', phone: '234-567-8901' },
  // Add more mock students...
];

// Mock data for classes
const classes = [
  { id: 1, name: 'Class A', teacher: 'Ms. Johnson', students: 20, schedule: 'Mon-Fri 9AM-3PM' },
  { id: 2, name: 'Class B', teacher: 'Mr. Brown', students: 18, schedule: 'Mon-Fri 9AM-3PM' },
  // Add more mock classes...
];

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
          <Input.Search placeholder="Search students..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-student')}>
            Add Student
          </Button>
        </Space>
        <Table 
          dataSource={students}
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Class', dataIndex: 'class' },
            { title: 'Age', dataIndex: 'age' },
            { title: 'Parent', dataIndex: 'parentName' },
            { title: 'Phone', dataIndex: 'phone' },
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
        />
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
          dataSource={classes}
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
          <Input.Search placeholder="Search activities..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('add-activity')}>
            Add Activity
          </Button>
        </Space>
        <Table 
          dataSource={activities}
          columns={[
            { title: 'Activity Name', dataIndex: 'name' },
            { title: 'Teacher', dataIndex: 'teacher' },
            { title: 'Participants', dataIndex: 'participants' },
            { title: 'Schedule', dataIndex: 'schedule' },
            {
              title: 'Actions',
              render: (_, record) => (
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => showModal('edit-activity', record)} />
                  <Popconfirm
                    title="Are you sure you want to delete this activity?"
                    onConfirm={() => handleDelete('activity', record.id)}
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
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      // TODO: Handle form submission with API
      console.log('Form values:', values);
      setIsModalVisible(false);
      message.success('Operation successful!');
    });
  };

  const handleDelete = (type, id) => {
    // TODO: Handle deletion with API
    console.log(`Deleting ${type} with id:`, id);
    message.success('Deleted successfully!');
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'add-student':
      case 'edit-student':
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Student Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="class" label="Class" rules={[{ required: true }]}>
              <Select>
                {classes.map(c => (
                  <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="age" label="Age" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="parentName" label="Parent Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        );
      // Add more form cases for other types...
      default:
        return null;
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
