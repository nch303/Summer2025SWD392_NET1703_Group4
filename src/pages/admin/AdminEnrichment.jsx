import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Popconfirm, message, Tag, Modal, Form, 
  Input, InputNumber, DatePicker, Select, Spin, Typography
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './AdminEnrichment.css';
import { 
  getAllEnrichmentPrograms, getEnrichmentProgramById, 
  createEnrichmentProgram, updateEnrichmentProgram, deleteEnrichmentProgram 
} from './AdminEnrichmentService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminEnrichment = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch all enrichment programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getAllEnrichmentPrograms();
      console.log('Fetched programs:', data);
      // Filter out deleted items (isDelete === true)
      const activePrograms = data ? data.filter(program => !program.isDelete) : [];
      setPrograms(activePrograms);
    } catch (error) {
      message.error('Failed to fetch enrichment programs');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Show modal for add/edit
  const showModal = (type, record = null) => {
    form.resetFields();
    setModalType(type);
    
    if (type === 'edit' && record) {
      setSelectedProgram(record);
      form.setFieldsValue({
        ...record,
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
        maxChildren: values.maxChildren,
        fee: values.fee,
        typeProgramID: values.typeProgramID,
        type: values.type
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

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
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
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Filter programs based on search text
  const filteredPrograms = programs.filter(
    (program) =>
      program.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      program.type?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="admin-enrichment">
      <Card className="enrichment-card">
        <div className="enrichment-header">
          <Title level={2}>Enrichment Programs Management</Title>
          <Space>
            <Input.Search
              placeholder="Search programs..."
              allowClear
              onSearch={(value) => setSearchText(value)}
              style={{ width: 300 }}
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
            typeProgramID: 2
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
            <Select placeholder="Select program type">
              <Option value="Swimming">Swimming</Option>
              <Option value="Piano">Piano</Option>
              <Option value="Dancing">Dancing</Option>
              <Option value="Art">Art</Option>
              <Option value="Chess">Chess</Option>
              <Option value="Robotics">Robotics</Option>
              <Option value="Language">Language</Option>
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
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
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
