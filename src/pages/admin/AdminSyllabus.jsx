import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Space, Input, Modal, Form, 
  Typography, Popconfirm, message, Spin, Tag, Tooltip,
  Breadcrumb
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, BookOutlined, ExclamationCircleOutlined, 
  ReloadOutlined
} from '@ant-design/icons';
import { getAllSyllabi, createSyllabus, updateSyllabus, deleteSyllabus } from './AdminSyllabusService';
import './AdminSyllabus.css';

const { Title, Text } = Typography;
const { confirm } = Modal;

const AdminSyllabus = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSyllabi();
  }, []);

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      const data = await getAllSyllabi();
      setSyllabi(data);
    } catch (error) {
      message.error('Failed to fetch syllabi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredSyllabi = syllabi.filter(syllabus => 
    syllabus.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const showAddModal = () => {
    setEditingSyllabus(null);
    setModalTitle('Add New Syllabus');
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (syllabus) => {
    setEditingSyllabus(syllabus);
    setModalTitle('Edit Syllabus');
    form.setFieldsValue({
      name: syllabus.name,
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSyllabus) {
        // Edit existing syllabus
        await updateSyllabus(editingSyllabus.id, values);
        message.success('Syllabus updated successfully');
      } else {
        // Add new syllabus
        await createSyllabus(values);
        message.success('Syllabus created successfully');
      }
      
      setModalVisible(false);
      fetchSyllabi();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleDelete = (syllabusId) => {
    confirm({
      title: 'Are you sure you want to delete this syllabus?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteSyllabus(syllabusId);
          message.success('Syllabus deleted successfully');
          fetchSyllabi();
        } catch (error) {
          message.error('Failed to delete syllabus');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this syllabus?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-syllabus-container">
      <Breadcrumb className="breadcrumb">
        <Breadcrumb.Item>Admin</Breadcrumb.Item>
        <Breadcrumb.Item>Syllabus</Breadcrumb.Item>
      </Breadcrumb>

      <Card className="syllabus-card">
        <div className="syllabus-header">
          <Title level={3}>Syllabus Management</Title>
          <div className="syllabus-actions">
            <Input
              placeholder="Search syllabi..."
              prefix={<SearchOutlined />}
              className="search-input"
              onChange={handleSearch}
              value={searchText}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Add Syllabus
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSyllabi}
            >
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Loading syllabi...</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredSyllabi}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
            bordered
          />
        )}
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText={editingSyllabus ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Syllabus Name"
            rules={[
              {
                required: true,
                message: 'Please enter the syllabus name',
              },
            ]}
          >
            <Input placeholder="Enter syllabus name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminSyllabus;
