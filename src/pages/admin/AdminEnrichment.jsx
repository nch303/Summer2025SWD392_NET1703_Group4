import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Popconfirm, message, Tag, Modal, Form, 
  Input, InputNumber, DatePicker, Select, Spin, Typography, Switch
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, DollarOutlined, UndoOutlined, TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './AdminEnrichment.css';
import { 
  getAllEnrichmentPrograms, getEnrichmentProgramById, 
  createEnrichmentProgram, updateEnrichmentProgram, deleteEnrichmentProgram,
  restoreEnrichmentProgram, getAllProgramTypes
} from './AdminEnrichmentService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminEnrichment = () => {
  const [programs, setPrograms] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch all enrichment programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getAllEnrichmentPrograms();
      console.log('Fetched programs:', data);
      setPrograms(data || []);
    } catch (error) {
      message.error('Failed to fetch enrichment programs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all program types
  const fetchProgramTypes = async () => {
    try {
      const data = await getAllProgramTypes();
      setProgramTypes(data || []);
    } catch (error) {
      message.error('Failed to fetch program types');
    }
  };

  // Initial load
  useEffect(() => {
    fetchPrograms();
    fetchProgramTypes();
  }, []);

  // Show modal for add/edit
  const showModal = (type, record = null) => {
    form.resetFields();
    setModalType(type);
    
    if (type === 'edit' && record) {
      setSelectedProgram(record);
      form.setFieldsValue({
        ...record,
        level: record.level || 1,
        dates: record.startDate && record.endDate ? 
          [dayjs(record.startDate), dayjs(record.endDate)] : undefined
      });
    } else {
      setSelectedProgram(null);
    }
    
    setModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Extract startDate and endDate from the date range picker
      const [startDate, endDate] = values.dates || [];
      
      const programData = {
        name: values.name,
        description: values.description,
        startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
        endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
        level: values.level || 1,
        maxChildren: values.maxChildren,
        fee: values.fee,
        typeProgramID: values.typeProgramID
      };

      if (modalType === 'edit') {
        await updateEnrichmentProgram(selectedProgram.id, programData);
        message.success('Enrichment program updated successfully');
      } else {
        await createEnrichmentProgram(programData);
        message.success('Enrichment program created successfully');
      }
      
      setModalVisible(false);
      fetchPrograms();
      
    } catch (error) {
      message.error(`Failed to ${modalType} enrichment program: ${error.message}`);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteEnrichmentProgram(id);
      message.success('Enrichment program deleted successfully');
      fetchPrograms();
    } catch (error) {
      message.error(`Failed to delete enrichment program: ${error.message}`);
    }
  };

  // Handle restore
  const handleRestore = async (record) => {
    try {
      await restoreEnrichmentProgram(record);
      message.success('Enrichment program restored successfully');
      fetchPrograms();
    } catch (error) {
      message.error(`Failed to restore enrichment program: ${error.message}`);
    }
  };

  // Function to get level badge color
  const getLevelColor = (level) => {
    switch (level) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'purple';
      case 4: return 'gold';
      case 5: return 'magenta';
      default: return 'default';
    }
  };

  // Function to get level name
  const getLevelName = (level) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Elementary';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return `Level ${level}`;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <span style={{ textDecoration: record.isDelete ? 'line-through' : 'none' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type, record) => (
        <Tag color={record.isDelete ? 'default' : 'blue'}>{type}</Tag>
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={getLevelColor(level)} icon={<TrophyOutlined />}>
          {getLevelName(level)}
        </Tag>
      ),
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text, record) => (
        <span style={{ textDecoration: record.isDelete ? 'line-through' : 'none' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Max Children',
      dataIndex: 'maxChildren',
      key: 'maxChildren',
      sorter: (a, b) => a.maxChildren - b.maxChildren,
    },
    {
      title: 'Fee (VND)',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => (
        <span>
          <DollarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {new Intl.NumberFormat('vi-VN').format(fee)}
        </span>
      ),
      sorter: (a, b) => a.fee - b.fee,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isDelete ? 'volcano' : 'green'}>
          {record.isDelete ? 'Deleted' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          {record.isDelete ? (
            <Button 
              type="primary" 
              icon={<UndoOutlined />} 
              onClick={() => handleRestore(record)}
              className="restore-button"
            >
              Restore
            </Button>
          ) : (
            <>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => showModal('edit', record)}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this program?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />}
                >
                  Delete
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Filter programs based on search text and deleted status
  const filteredPrograms = programs.filter(
    (program) =>
      (showDeleted || !program.isDelete) &&
      (program.name?.toLowerCase().includes(searchText.toLowerCase()) ||
       program.description?.toLowerCase().includes(searchText.toLowerCase()) ||
       program.type?.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="admin-enrichment">
      <Card className="enrichment-card">
        <div className="enrichment-header">
          <Title level={2}>Enrichment Programs Management</Title>
          <Space wrap>
            <Input.Search
              placeholder="Search programs..."
              allowClear
              onSearch={(value) => setSearchText(value)}
              style={{ width: 300 }}
            />
            <Switch
              checked={showDeleted}
              onChange={setShowDeleted}
              checkedChildren="Show Deleted"
              unCheckedChildren="Hide Deleted"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal('add')}
            >
              Add Program
            </Button>
          </Space>
        </div>

        <Spin spinning={loading}>
          <Table 
            dataSource={filteredPrograms} 
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            rowClassName={(record) => record.isDelete ? 'deleted-row' : ''}
          />
        </Spin>
      </Card>

      <Modal
        title={modalType === 'add' ? 'Add New Enrichment Program' : 'Edit Enrichment Program'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
        okText={modalType === 'add' ? 'Create' : 'Update'}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            maxChildren: 30,
            typeProgramID: 2,
            level: 1
          }}
        >
          <Form.Item 
            name="name" 
            label="Program Name"
            rules={[{ required: true, message: 'Please enter program name' }]}
          >
            <Input placeholder="e.g. Swimming Class - Summer 2025" />
          </Form.Item>
          
          <Form.Item 
            name="type" 
            label="Program Type"
            rules={[{ required: true, message: 'Please select program type' }]}
          >
            <Select 
              placeholder="Select program type"
              onChange={(value, option) => {
                // Set the corresponding typeProgramID based on selected type
                form.setFieldsValue({ typeProgramID: option.key });
              }}
            >
              {programTypes.map(type => (
                <Option key={type.id} value={type.name}>{type.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="level" 
            label="Program Level"
            rules={[{ required: true, message: 'Please select program level' }]}
          >
            <Select placeholder="Select program level">
              <Option value={1}>Level 1 - Beginner</Option>
              <Option value={2}>Level 2 - Elementary</Option>
              <Option value={3}>Level 3 - Intermediate</Option>
              <Option value={4}>Level 4 - Advanced</Option>
              <Option value={5}>Level 5 - Expert</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={4} placeholder="Program description" />
          </Form.Item>
          
          <Form.Item 
            name="dates" 
            label="Program Duration"
            rules={[{ required: true, message: 'Please select start and end dates' }]}
          >
            <RangePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              inputReadOnly={false}
              allowClear={true}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1] && dates[1].isBefore(dates[0])) {
                  message.error('End date cannot be before start date');
                  form.setFieldsValue({ dates: [dates[0], null] });
                }
              }}
            />
          </Form.Item>
          
          <Form.Item 
            name="maxChildren" 
            label="Maximum Children"
            rules={[{ required: true, message: 'Please enter maximum children' }]}
          >
            <InputNumber min={1} max={200} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            name="fee" 
            label="Fee (VND)"
            rules={[{ required: true, message: 'Please enter fee' }]}
          >
            <InputNumber 
              min={0} 
              step={10000} 
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="e.g. 350,000"
            />
          </Form.Item>

          <Form.Item 
            name="typeProgramID" 
            label="Program Type ID" 
            hidden={true}
          >
            <InputNumber />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminEnrichment;
