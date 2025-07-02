import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, Select, Popconfirm, Modal, Form } from 'antd';
import { SearchOutlined, ReloadOutlined, EditOutlined, LockOutlined, UnlockOutlined, UserAddOutlined, DeleteOutlined, RedoOutlined, ExclamationCircleFilled, EyeOutlined } from '@ant-design/icons';
import { fetchPaginatedAccounts, searchAccounts, changeAccountStatus, createAccount, fetchRoles, updateAccount, banAccount, restoreAccount } from './AccountListService';
import { useCustomToast } from '../../components/toast/CustomToast';
import './AccountListPage.css';

const { Option } = Select;

const AccountListPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const toast = useCustomToast();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [editForm] = Form.useForm();
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  // Add state to track if currently searching
  const [isSearching, setIsSearching] = useState(false);

  // Create debounceTimer variable outside component to avoid recreating on each render
  let debounceTimer;

  const loadAccounts = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      // Nếu có từ khóa tìm kiếm, sử dụng API search
      if (searchText && searchText.trim() !== '') {
        const response = await searchAccounts(searchText, page, pageSize);
        setAccounts(response.data);
        setPagination({
          current: response.pageNumber,
          pageSize: response.pageSize,
          total: response.totalCount
        });
        setIsSearching(true);
      } else {
        // Nếu không có từ khóa tìm kiếm, sử dụng API lấy tất cả tài khoản
        const response = await fetchPaginatedAccounts(page, pageSize);
        setAccounts(response.data);
        setPagination({
          current: response.pageNumber,
          pageSize: response.pageSize,
          total: response.totalCount
        });
        setIsSearching(false);
      }
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadRoles();
  }, []);

  const handleTableChange = (pagination) => {
    loadAccounts(pagination.current, pagination.pageSize);
  };

  const handleStatusChange = async (account, newStatus) => {
    try {
      await changeAccountStatus(account.id, newStatus);
      toast.success(`Account status changed to ${newStatus}`);
      loadAccounts(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error('Failed to change account status');
    }
  };

  // Trong component, sửa lại hàm debouncedSearch
  const debouncedSearch = (value) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Gọi API search trực tiếp tại đây
      if (value.trim() !== '') {
        searchAccounts(value, 1, pagination.pageSize)
          .then(response => {
            setAccounts(response.data);
            setPagination({
              current: response.pageNumber,
              pageSize: response.pageSize,
              total: response.totalCount
            });
            setIsSearching(true);
          })
          .catch(error => {
            toast.error('Failed to search accounts');
          });
      } else {
        // Nếu ô tìm kiếm trống, quay lại hiển thị tất cả tài khoản
        fetchPaginatedAccounts(1, pagination.pageSize)
          .then(response => {
            setAccounts(response.data);
            setPagination({
              current: response.pageNumber,
              pageSize: response.pageSize,
              total: response.totalCount
            });
            setIsSearching(false);
          })
          .catch(error => {
            toast.error('Failed to load accounts');
          });
      }
    }, 300); // Giảm thời gian chờ xuống 300ms
  };

  // Sửa hàm handleSearch
  const handleSearch = (value) => {
    // Không cần setSearchText ở đây vì đã set trong onChange
    loadAccounts(1, pagination.pageSize);
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value);
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
  };

  // Sửa hàm resetFilters để reset cả ô input search
  const resetFilters = () => {
    setSearchText('');
    setFilterRole(null);
    setFilterStatus(null);
    setIsSearching(false);
    form.resetFields();
    
    // Xóa timer debounce hiện tại
    clearTimeout(debounceTimer);
    
    // Reset to first page when filters are cleared
    loadAccounts(1, pagination.pageSize);
  };

  const showModal = () => {
    if (roles.length === 0) {
      loadRoles();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      const values = await form.validateFields();
      
      const createdAccount = await createAccount(values);
      setIsModalVisible(false);
      form.resetFields();
      
      toast.success(`Account created successfully: ${createdAccount.fullName}`, {
        title: 'Account Created',
        duration: 2000
      });
      
      loadAccounts(pagination.current, pagination.pageSize);
    } catch (error) {
      if (error.errorFields) {
        return; // Form validation error, handled by antd form
      }
      
      // Extract error message directly from the response
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage === 'This email already exists.') {
        toast.error('This email is already registered in the system. Please use a different email address.', {
          title: 'Email Already Exists',
          duration: 5000
        });
        // Highlight the email field
        form.setFields([
          {
            name: 'email',
            errors: ['This email already exists']
          }
        ]);
      } else if (errorMessage === 'This phoneNumber already exists.') {
        toast.error('This phone number is already registered in the system. Please use a different phone number.', {
          title: 'Phone Number Already Exists',
          duration: 5000
        });
        // Highlight the phone number field
        form.setFields([
          {
            name: 'phoneNumber',
            errors: ['This phone number already exists']
          }
        ]);
      } else if (errorMessage) {
        toast.error(errorMessage, {
          title: 'Creation Failed',
          duration: 5000
        });
      } else {
        toast.error('Failed to create account. Please try again.', {
          title: 'Creation Failed',
          duration: 5000
        });
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const showEditModal = async (account) => {
    setCurrentAccount(account);
    try {
      // Tải danh sách roles nếu chưa có
      if (roles.length === 0) {
        await loadRoles();
      }
      
      let roleId = null;
      
      console.log('Account data before edit:', account);
      
      // Nếu chỉ có roleName nhưng không có roleId
      if (account.roleName && !account.roleId) {
        // Tìm roleId từ danh sách roles đã tải
        const matchedRole = roles.find(role => role.name === account.roleName);
        if (matchedRole) {
          roleId = matchedRole.id;
          console.log('Found roleId from name:', roleId);
        } else {
          console.log('Could not find matching role for name:', account.roleName);
          toast.warning('Could not determine role ID for this account');
        }
      } else {
        roleId = account.roleId;
        console.log('Using existing roleId:', roleId);
      }
      
      // Đảm bảo roleId là số nguyên nếu nó tồn tại
      if (roleId) {
        roleId = parseInt(roleId, 10);
      }
      
      console.log('Final roleId being set:', roleId);
      
      // Điền thông tin vào form
      editForm.setFieldsValue({
        fullName: account.fullName,
        email: account.email,
        phoneNumber: account.phoneNumber,
        roleId: roleId,
        address: account.address
      });
      
      setIsEditModalVisible(true);
    } catch (error) {
      console.error('Error in showEditModal:', error);
      toast.error('Failed to load account information for editing');
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    editForm.resetFields();
  };

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const values = await editForm.validateFields();
      
      // If password is empty, remove it from the request
      if (!values.password) {
        delete values.password;
      }
      
      // Ensure address is included (even if empty)
      if (values.address === undefined) {
        values.address = '';
      }
      
      // Ensure roleId is a number as required by the API
      if (values.roleId && typeof values.roleId === 'string') {
        values.roleId = parseInt(values.roleId, 10);
      }
      
      // Call the API
      await updateAccount(currentAccount.id, values);
      
      setIsEditModalVisible(false);
      editForm.resetFields();
      
      toast.success(`Account updated successfully: ${values.fullName}`, {
        title: 'Account Updated',
        duration: 2000
      });
      
      loadAccounts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Update error details:', error);
      
      if (error.errorFields) {
        return; // Form validation error, handled by antd form
      }
      
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage === 'This email already exists.') {
        toast.error('This email is already registered in the system. Please use a different email address.', {
          title: 'Email Already Exists',
          duration: 5000
        });
        editForm.setFields([
          {
            name: 'email',
            errors: ['This email already exists']
          }
        ]);
      } else if (errorMessage === 'This phoneNumber already exists.') {
        toast.error('This phone number is already registered in the system. Please use a different phone number.', {
          title: 'Phone Number Already Exists',
          duration: 5000
        });
        editForm.setFields([
          {
            name: 'phoneNumber',
            errors: ['This phone number already exists']
          }
        ]);
      } else if (errorMessage) {
        toast.error(errorMessage, {
          title: 'Update Failed',
          duration: 5000
        });
      } else {
        toast.error('Failed to update account. Please try again.', {
          title: 'Update Failed',
          duration: 5000
        });
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleBanAccount = async (account) => {
    try {
      await banAccount(account.id);
      toast.success(`Account banned successfully: ${account.fullName}`, {
        title: 'Account Banned',
        duration: 2000
      });
      loadAccounts(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error('Failed to ban account');
    }
  };

  const handleRestoreAccount = async (account) => {
    try {
      await restoreAccount(account.id);
      toast.success(`Account restored successfully: ${account.fullName}`, {
        title: 'Account Restored',
        duration: 2000
      });
      loadAccounts(pagination.current, pagination.pageSize);
    } catch (error) {
      toast.error('Failed to restore account');
    }
  };

  const showDetailsModal = (account) => {
    setSelectedAccount(account);
    setIsDetailsModalVisible(true);
  };
  
  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesRole = filterRole === null || account.roleName === filterRole;
    const matchesStatus = filterStatus === null || account.status === filterStatus;
    
    return matchesRole && matchesStatus;
  });

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
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      sorter: (a, b) => a.phoneNumber.localeCompare(b.phoneNumber),
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (role) => (
        <Tag color={role === 'Admin' ? 'blue' : role === 'Staff' ? 'purple' : role === 'Teacher' ? 'cyan' : 'green'}>
          {role}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'Staff', value: 'Staff' },
        { text: 'Parent', value: 'Parent' },
        { text: 'Teacher', value: 'Teacher' },
      ],
      onFilter: (value, record) => record.roleName === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetailsModal(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="account-list-container">
      <toast.ToastContainer position="top-right" />
      <div className="account-list-header">
        <h1>Account Management</h1>
        <div className="account-list-actions">
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={showModal}
            className="create-account-btn"
          >
            Create Account
          </Button>
          <Input
            placeholder="Search by name, email or phone"
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
              loadAccounts(1, pagination.pageSize);
            }}
          />
          <Select
            placeholder="Filter by role"
            allowClear
            style={{ width: 150, marginRight: 8 }}
            onChange={handleRoleFilter}
            value={filterRole}
          >
            <Option value="Admin">Admin</Option>
            <Option value="Staff">Staff</Option>
            <Option value="Parent">Parent</Option>
            <Option value="Teacher">Teacher</Option>
          </Select>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150, marginRight: 8 }}
            onChange={handleStatusFilter}
            value={filterStatus}
          >
            <Option value="Active">Active</Option>
            <Option value="Banned">Banned</Option>
          </Select>
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
        dataSource={filteredAccounts.map(account => ({ ...account, key: account.id }))}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '15', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
        }}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />

      {/* Create Account Modal */}
      <Modal
        title="Create New Account"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={createLoading} 
            onClick={handleCreate}
          >
            Create
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="createAccountForm"
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input the password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input the phone number!' },
              { pattern: /^\d+$/, message: 'Phone number must contain only digits!' }
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select 
              placeholder="Select a role" 
              loading={rolesLoading}
            >
              {roles.map(role => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        title="Edit Account"
        visible={isEditModalVisible}
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
          name="editAccountForm"
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password (leave empty to keep current)"
            rules={[
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter new password (optional)" />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input the phone number!' },
              { pattern: /^\d+$/, message: 'Phone number must contain only digits!' }
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select 
              placeholder="Select a role" 
              loading={rolesLoading}
            >
              {roles.map(role => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea placeholder="Enter address" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Account Details"
        visible={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="close" onClick={handleDetailsCancel}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedAccount && (
          <div className="account-details">
            <div className="detail-row">
              <div className="detail-label">Full Name:</div>
              <div className="detail-value">{selectedAccount.fullName}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email:</div>
              <div className="detail-value">{selectedAccount.email}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone Number:</div>
              <div className="detail-value">{selectedAccount.phoneNumber}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Address:</div>
              <div className="detail-value">{selectedAccount.address || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Role:</div>
              <div className="detail-value">
                <Tag color={selectedAccount.roleName === 'Admin' ? 'blue' : selectedAccount.roleName === 'Staff' ? 'purple' : selectedAccount.roleName === 'Teacher' ? 'cyan' : 'green'}>
                  {selectedAccount.roleName}
                </Tag>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Status:</div>
              <div className="detail-value">
                <Tag color={getStatusColor(selectedAccount.status)}>
                  {selectedAccount.status}
                </Tag>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="detail-row" style={{ marginTop: 16, borderBottom: 'none' }}>
              <div className="detail-label">Actions:</div>
              <div className="detail-value">
                <Space size="middle">
                  <Button 
                    icon={<EditOutlined />} 
                    type="primary"
                    onClick={() => {
                      handleDetailsCancel();
                      showEditModal(selectedAccount);
                    }}
                  >
                    Edit
                  </Button>
                  
                  {/* Ban button - only show when account is not banned */}
                  {selectedAccount.status !== 'Banned' && (
                    <Popconfirm
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: '22px', marginBottom: '8px' }} />
                          <span>Are you sure you want to ban this account?</span>
                        </div>
                      }
                      onConfirm={() => {
                        handleBanAccount(selectedAccount);
                        handleDetailsCancel();
                      }}
                      okText="Ban Account"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                      placement="topRight"
                    >
                      <Button icon={<DeleteOutlined />} danger>Ban</Button>
                    </Popconfirm>
                  )}

                  {/* Restore button - only show when account is banned */}
                  {selectedAccount.status === 'Banned' && (
                    <Popconfirm
                      title={
                        <div style={{ textAlign: 'center' }}>
                          <div>Are you sure you want to restore this account?</div>
                          <div style={{ marginTop: '8px', fontSize: '12px', color: 'gray' }}>This will reactivate the account.</div>
                        </div>
                      }
                      onConfirm={() => {
                        handleRestoreAccount(selectedAccount);
                        handleDetailsCancel();
                      }}
                      okText="Restore"
                      cancelText="Cancel"
                      placement="topRight"
                    >
                      <Button icon={<RedoOutlined />} type="primary" style={{ backgroundColor: '#52c41a' }}>Restore</Button>
                    </Popconfirm>
                  )}
                </Space>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AccountListPage;
