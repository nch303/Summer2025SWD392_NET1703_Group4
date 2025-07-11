import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, 
  Button, Input, Modal, 
  Form, Popconfirm, Spin,
  SearchOutlined, ReloadOutlined, EditOutlined, EyeOutlined, 
  DeleteOutlined, RedoOutlined, UserAddOutlined 
} from '../../utils/AntComponents';
import { 
  fetchTeachers, updateTeacher, deleteTeacher, restoreTeacher, searchTeachers 
} from '../../services/AdminService';
import { useCustomToast } from '../../components/CustomToast';
import styles from './TeachersManagement.module.css';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [editForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const toast = useCustomToast();

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Debounced search tracking
  const [isSearching, setIsSearching] = useState(false);
  let debounceTimer;

  // Load teachers data
  const loadTeachers = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // If there's a search keyword, use search API
      if (searchText && searchText.trim() !== '') {
        const response = await searchTeachers(searchText, page, pageSize);
        setTeachers(response.data);
        setPagination({
          current: response.pageNumber,
          pageSize: response.pageSize,
          total: response.totalCount
        });
        setIsSearching(true);
      } else {
        // Otherwise, load all teachers
        const response = await fetchTeachers(page, pageSize);
        setTeachers(response.data);
        setPagination({
          current: response.pageNumber,
          pageSize: response.pageSize,
          total: response.totalCount
        });
        setIsSearching(false);
      }
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Load teachers on component mount
  useEffect(() => {
    loadTeachers();
  }, []);

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    loadTeachers(pagination.current, pagination.pageSize);
  };

  // Handle search with debounce
  const debouncedSearch = (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadTeachers(1, pagination.pageSize);
    }, 500);
  };

  // Reset filters and reload data
  const resetFilters = () => {
    setSearchText('');
    loadTeachers(1, pagination.pageSize);
  };

  // Show edit modal with teacher data
  const showEditModal = (teacher) => {
    setCurrentTeacher(teacher);
    editForm.setFieldsValue({
      fullName: teacher.fullName,
      email: teacher.email,
      phoneNumber: teacher.phoneNumber,
      address: teacher.address || '',
    });
    setIsEditModalVisible(true);
  };

  // Handle edit modal cancel
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };

  // Update teacher information
  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const values = await editForm.validateFields();
      
      await updateTeacher(currentTeacher.id, values);
      
      setIsEditModalVisible(false);
      editForm.resetFields();
      
      toast.success(`Teacher updated successfully: ${values.fullName}`, {
        title: 'Teacher Updated',
        duration: 2000
      });
      
      loadTeachers(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error('Failed to update teacher');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete/ban teacher
  const handleDeleteTeacher = async (teacher) => {
    try {
      await deleteTeacher(teacher.id);
      toast.success(`Teacher account banned: ${teacher.fullName}`, {
        title: 'Teacher Banned',
        duration: 2000
      });
      loadTeachers(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error('Failed to ban teacher account');
    }
  };

  // Restore deleted/banned teacher
  const handleRestoreTeacher = async (teacher) => {
    try {
      await restoreTeacher(teacher.id);
      toast.success(`Teacher account restored: ${teacher.fullName}`, {
        title: 'Teacher Restored',
        duration: 2000
      });
      loadTeachers(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error('Failed to restore teacher account');
    }
  };

  // Show teacher details modal
  const showDetailsModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailsModalVisible(true);
  };
  
  // Close details modal
  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
  };

  // Get status tag color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Pending':
        return 'warning';
      case 'Banned':
        return 'black';
      default:
        return 'default';
    }
  };

  // Table columns definition
  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetailsModal(record)}
          >
            Details
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          {record.status !== 'Banned' ? (
            <Popconfirm
              title="Are you sure you want to ban this teacher?"
              onConfirm={() => handleDeleteTeacher(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
              >
                Ban
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="default"
              icon={<RedoOutlined />}
              onClick={() => handleRestoreTeacher(record)}
            >
              Restore
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.teachersManagementContainer}>
      <toast.ToastContainer position="top-right" />
      <div className={styles.teachersManagementHeader}>
        <h1>Teacher Management</h1>
        <div className={styles.teachersManagementActions}>
          <Input
            placeholder="Search teachers by name, email or phone"
            prefix={<SearchOutlined />}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              debouncedSearch(value);
            }}
            value={searchText}
            style={{ width: 300, marginRight: 8 }}
            allowClear
            onClear={() => {
              setSearchText('');
              loadTeachers(1, pagination.pageSize);
            }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={resetFilters}
            loading={loading}
          >
            Reset & Refresh
          </Button>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={teachers.map(teacher => ({ ...teacher, key: teacher.id }))}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        onChange={handleTableChange}
        scroll={{ x: 800 }}
      />

      {/* Edit Teacher Modal */}
      <Modal
        title="Edit Teacher"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="back" onClick={handleEditCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={updateLoading} 
            onClick={handleUpdate}
          >
            Update
          </Button>,
        ]}
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input the phone number!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number (10-11 digits)!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Teacher Details Modal */}
      <Modal
        title="Teacher Details"
        open={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="back" onClick={handleDetailsCancel}>
            Close
          </Button>,
        ]}
      >
        {selectedTeacher && (
          <div className={styles.teacherDetails}>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Full Name:</div>
              <div className={styles.detailValue}>{selectedTeacher.fullName}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Email:</div>
              <div className={styles.detailValue}>{selectedTeacher.email}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Phone Number:</div>
              <div className={styles.detailValue}>{selectedTeacher.phoneNumber}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Address:</div>
              <div className={styles.detailValue}>{selectedTeacher.address || 'N/A'}</div>
            </div>
            <div className={styles.detailRow}>
              <div className={styles.detailLabel}>Status:</div>
              <div className={styles.detailValue}>
                <Tag color={getStatusColor(selectedTeacher.status)}>
                  {selectedTeacher.status}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeachersManagement;
