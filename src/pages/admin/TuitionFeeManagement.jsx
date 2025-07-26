import React, { useState, useEffect } from 'react';
import {
  Table, Button, Modal, Form, Input, DatePicker, Select, Radio,
  message, Popconfirm, Typography, Space, InputNumber, Tag, notification,
  PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, LeftOutlined, RightOutlined,
  InfoCircleOutlined, Dropdown, Menu
} from '../../utils/AntComponents';
import moment from 'moment';
import {
  getAllTuitionFees,
  createTuitionFee,
  updateTuitionFee,
  deleteTuitionFee,
  getGradeLevels,
  updateGradeLevel
} from '../../services/AdminService';
import styles from './TuitionFeeManagement.module.css';
import { useCustomToast } from '../../components/CustomToast';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TuitionFeeManagement = () => {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [feeItems, setFeeItems] = useState([{ name: '', amount: 0 }]);
  const [monthInput, setMonthInput] = useState('');
  const [yearInput, setYearInput] = useState('');
  const [gradeLevelDetailVisible, setGradeLevelDetailVisible] = useState(false);
  const [selectedGradeLevelDetail, setSelectedGradeLevelDetail] = useState(null);
  const [gradeLevelFeeForm] = Form.useForm();
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [rightClickedGradeLevel, setRightClickedGradeLevel] = useState(null);

  // Initialize the custom toast hook
  const toast = useCustomToast();

  // Load tuition fees and grade levels on component mount
  useEffect(() => {
    fetchTuitionFees();
    fetchGradeLevels();
  }, []);

  // Extract available years from tuition fees data
  useEffect(() => {
    if (tuitionFees.length > 0) {
      // Extract school years (e.g. "2025-2026") instead of calendar years
      const schoolYears = [];

      tuitionFees.forEach(fee => {
        const date = new Date(fee.date);
        const month = date.getMonth() + 1; // JavaScript months are 0-based
        const year = date.getFullYear();

        let schoolYear;
        if (month >= 9) { // September or later
          schoolYear = `${year}-${year + 1}`;
        } else { // Before September (Jan-Aug)
          schoolYear = `${year - 1}-${year}`;
        }

        if (!schoolYears.includes(schoolYear)) {
          schoolYears.push(schoolYear);
        }
      });

      // Sort school years in descending order
      schoolYears.sort().reverse();

      setAvailableYears(schoolYears);

      // Set default selected year to the most recent
      if (!selectedYear && schoolYears.length > 0) {
        setSelectedYear(schoolYears[0]);
      }
    }
  }, [tuitionFees]);

  // Fetch tuition fees from the API
  const fetchTuitionFees = async () => {
    try {
      setLoading(true);
      const data = await getAllTuitionFees();
      setTuitionFees(data);
    } catch (error) {
      message.error('Failed to fetch tuition fees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch grade levels for the dropdown
  const fetchGradeLevels = async () => {
    try {
      const data = await getGradeLevels();
      console.log('Fetched grade levels:', data);
      setGradeLevels(data);
    } catch (error) {
      message.error('Failed to fetch grade levels');
    }
  };

  // Handle form submission for create/update
  const handleSubmit = async (values) => {
    try {
      // Format the date
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        fee: parseInt(values.fee, 10) || 0,
        gradeLevelID: parseInt(values.gradeLevelID, 10)
      };

      console.log('Submitting values:', formattedValues);

      if (editingId) {
        await updateTuitionFee(editingId, formattedValues);
        // Use custom toast for success update
        toast.success(`Update tuition fee "${formattedValues.name}" successfully!`, {
          title: 'Success',
          duration: 3000
        });
      } else {
        await createTuitionFee(formattedValues);
        // Use custom toast for success create
        toast.success(`Add new tuition fee "${formattedValues.name}" successfully!`, {
          title: 'Success',
          duration: 3000
        });
      }

      // Reset and close form
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);

      // Refresh data
      fetchTuitionFees();

    } catch (error) {
      // Extract the error message from different possible locations
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'An error occurred while saving tuition fee information';

      // Use custom toast to show the specific error
      toast.error(errorMessage, {
        title: 'Error',
        duration: 4000
      });
      console.error('Submit error details:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      date: moment(record.date),
      fee: record.fee,
      gradeLevelID: record.gradeLevelID
    });
    setModalVisible(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    try {
      await deleteTuitionFee(id);
      toast.success('Tuition fee deleted successfully');
      fetchTuitionFees();
    } catch (error) {
      toast.error('Error deleting tuition fee');
    }
  };

  // Filter tuition fees by grade level
  const handleGradeLevelFilter = (value) => {
    setSelectedGradeLevel(value);
  };

  // Filter tuition fees by year
  const handleYearFilter = (value) => {
    setSelectedYear(value);
  };

  // Get filtered tuition fees based on selected grade level and year
  const getFilteredTuitionFees = () => {
    let filtered = [...tuitionFees];

    // Filter by grade level if selected
    if (selectedGradeLevel) {
      filtered = filtered.filter(fee => fee.gradeLevelID === selectedGradeLevel);
    }

    // Filter by school year if selected
    if (selectedYear) {
      const [startYear, endYear] = selectedYear.split('-').map(Number);

      filtered = filtered.filter(fee => {
        const date = new Date(fee.date);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (month >= 9 && month <= 12) {
          // Fall term (Sep-Dec)
          return year === startYear;
        } else {
          // Spring term (Jan-May)
          return year === endYear;
        }
      });
    }

    return filtered;
  };

  // Update the helper function to format the description text with colons
  const formatDescription = (description) => {
    if (!description) return 'No';

    // Split by '+' to get individual fee items
    const items = description.split('+').map(item => item.trim());

    // Format each item with bullet point and add colon before amount
    return items.map(item => {
      // Replace parentheses around amounts and add colon
      // For example: "Phí nhập học (2.000.000)" becomes "Phí nhập học: 2.000.000"
      return '• ' + item.replace(/\s*\(([^)]+)\)/g, ': $1');
    }).join('\n');
  };

  // Add this function to extract and sum fees from the description
  const calculateTotalFee = (description) => {
    if (!description) return 0;

    // Extract all numbers in parentheses
    const regex = /\(([0-9.,]+)(?:đ)?\)/g;
    let match;
    let total = 0;

    while ((match = regex.exec(description)) !== null) {
      // Get the number part and remove dots
      const amount = match[1].replace(/\./g, '');
      total += parseInt(amount, 10) || 0;
    }

    return total;
  };

  // Add this function to convert fee items to description string
  const convertFeeItemsToDescription = (items) => {
    return items
      .filter(item => item.name.trim() !== '')
      .map(item => `${item.name} (${item.amount})`)
      .join(' + ');
  };

  // Add this function to calculate total from fee items
  const calculateTotalFromItems = (items) => {
    return items.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0);
  };

  // Add this function to handle adding a new fee item
  const addFeeItem = () => {
    setFeeItems([...feeItems, { name: '', amount: 0 }]);
  };

  // Add this function to handle removing a fee item
  const removeFeeItem = (index) => {
    const newItems = [...feeItems];
    newItems.splice(index, 1);
    setFeeItems(newItems);

    // Update form values
    const descriptionString = convertFeeItemsToDescription(newItems);
    const total = calculateTotalFromItems(newItems);
    form.setFieldsValue({
      description: descriptionString,
      fee: total
    });
  };

  // Add this function to handle fee item changes
  const handleFeeItemChange = (index, field, value) => {
    const newItems = [...feeItems];
    newItems[index][field] = value;
    setFeeItems(newItems);

    // Update form values
    const descriptionString = convertFeeItemsToDescription(newItems);
    const total = calculateTotalFromItems(newItems);
    form.setFieldsValue({
      description: descriptionString,
      fee: total
    });
  };

  // Add this effect to parse description when editing
  useEffect(() => {
    if (modalVisible && editingId) {
      const description = form.getFieldValue('description');
      if (description) {
        // Parse description string back to fee items
        const items = description.split('+').map(item => {
          const trimmed = item.trim();
          const nameMatch = trimmed.match(/(.*)\s*\(([^)]+)\)/);

          if (nameMatch) {
            return {
              name: nameMatch[1].trim(),
              amount: nameMatch[2].replace(/\./g, '')
            };
          }
          return { name: trimmed, amount: 0 };
        });

        setFeeItems(items.length > 0 ? items : [{ name: '', amount: 0 }]);
      }
    } else if (!modalVisible) {
      // Reset fee items when modal closes
      setFeeItems([{ name: '', amount: 0 }]);
    }
  }, [modalVisible, editingId]);

  // Add this function to handle month/year change
  const handleMonthYearChange = (type, value) => {
    if (type === 'month') {
      setMonthInput(value);
      // Ensure month is between 1-12
      if (value && yearInput) {
        // Pad month with leading zero if needed
        const formattedMonth = value.toString().padStart(2, '0');
        form.setFieldsValue({ name: `${formattedMonth}/${yearInput}` });
      }
    } else {
      setYearInput(value);
      if (monthInput && value) {
        const formattedMonth = monthInput.toString().padStart(2, '0');
        form.setFieldsValue({ name: `${formattedMonth}/${value}` });
      }
    }
  };

  // Add this to the useEffect for handling modal visibility
  useEffect(() => {
    if (modalVisible && editingId) {
      const nameValue = form.getFieldValue('name');
      if (nameValue) {
        const [month, year] = nameValue.split('/');
        setMonthInput(parseInt(month, 10));
        setYearInput(parseInt(year, 10));
      }
    } else if (!modalVisible) {
      setMonthInput('');
      setYearInput('');
    }
  }, [modalVisible, editingId]);

  // Add this function to handle right-click on grade level
  const handleGradeLevelRightClick = (e, gradeLevel) => {
    e.preventDefault();
    setRightClickedGradeLevel(gradeLevel);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  // Add this function to handle context menu click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuVisible) {
        setContextMenuVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenuVisible]);

  // Update the handleViewGradeLevelDetails function to work with our existing data
  const handleViewGradeLevelDetails = (gradeLevel) => {
    setContextMenuVisible(false);
    setSelectedGradeLevelDetail(gradeLevel);
    
    // Use the data from the grade level directly
    gradeLevelFeeForm.setFieldsValue({
      id: gradeLevel.id,
      name: gradeLevel.name,
      fee: gradeLevel.fee
    });
    
    setGradeLevelDetailVisible(true);
  };

  // Add this function to update grade level fee
  const handleUpdateGradeLevelFee = async (values) => {
    try {
      await updateGradeLevel(values);
      
      // Update the grade level in the local state
      const updatedGradeLevels = gradeLevels.map(level => 
        level.id === values.id ? { ...level, fee: values.fee } : level
      );
      setGradeLevels(updatedGradeLevels);
      
      toast.success(`Updated fee for "${values.name}" grade level successfully!`, {
        title: 'Success',
        duration: 3000
      });
      
      setGradeLevelDetailVisible(false);
    } catch (error) {
      toast.error('Failed to update grade level fee', {
        title: 'Error',
        duration: 3000
      });
    }
  };

  // Add this to render the context menu
  const renderContextMenu = () => {
    if (!contextMenuVisible || !rightClickedGradeLevel) return null;

    return (
      <div 
        className={styles.contextMenu} 
        style={{ 
          top: contextMenuPosition.y, 
          left: contextMenuPosition.x 
        }}
      >
        <div 
          className={styles.contextMenuItem}
          onClick={() => handleViewGradeLevelDetails(rightClickedGradeLevel)}
        >
          <InfoCircleOutlined /> View Details
        </div>
      </div>
    );
  };

  // Fix for the form not connected warning
  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields(); // Reset before showing modal
    setModalVisible(true);
  };

  // Define table columns
  const columns = [
    {
      title: 'Month/Year',
      dataIndex: 'name',
      key: 'name',
      defaultSortOrder: 'ascend',
      sorter: (a, b) => {
        const [monthA, yearA] = a.name.split('/').map(Number);
        const [monthB, yearB] = b.name.split('/').map(Number);

        if (yearA !== yearB) {
          return yearA - yearB;
        }

        return monthA - monthB;
      },
      render: (name) => {
        return <strong>{name}</strong>;
      }
    },
    {
      title: 'Tuition fees',
      dataIndex: 'description',
      key: 'description',
      ellipsis: { showTitle: true },
      render: (description) => (
        <div style={{ whiteSpace: 'pre-line' }}>
          {formatDescription(description)}
        </div>
      )
    },
    {
      title: 'Due date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Total (VND)',
      dataIndex: 'fee',
      key: 'fee',
      render: (fee) => new Intl.NumberFormat('vi-VN').format(fee),
      sorter: (a, b) => a.fee - b.fee,
    },
    {
      title: 'Grade level',
      dataIndex: 'gradeLevelID',
      key: 'gradeLevelID',
      render: (gradeLevelID) => {
        const gradeLevel = gradeLevels.find(level => level.id === gradeLevelID);
        return gradeLevel ? gradeLevel.name : 'Not specified';
      },
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this fee?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className={styles.adminTuitionManagement}>
        <div className={styles.adminTuitionHeader}>
          <Title level={2}>Tuition Fee Management</Title>
          <div className={styles.adminTuitionFilterContainer}>
            <div className={styles.adminTuitionFilterGroups}>
              <div className={styles.adminTuitionFilterSection}>
                <span className={styles.filterLabel}>Academic Year:</span>
                <div className={styles.yearNavigator}>
                  <Button
                    icon={<LeftOutlined />}
                    onClick={() => {
                      const currentIndex = availableYears.indexOf(selectedYear);
                      if (currentIndex < availableYears.length - 1) {
                        handleYearFilter(availableYears[currentIndex + 1]);
                      }
                    }}
                    disabled={selectedYear === null || availableYears.indexOf(selectedYear) === availableYears.length - 1}
                  />
                  <div className={styles.yearDisplay}>
                    {selectedYear || 'All'}
                  </div>
                  <Button
                    icon={<RightOutlined />}
                    onClick={() => {
                      const currentIndex = availableYears.indexOf(selectedYear);
                      if (currentIndex > 0) {
                        handleYearFilter(availableYears[currentIndex - 1]);
                      }
                    }}
                    disabled={selectedYear === null || availableYears.indexOf(selectedYear) === 0}
                  />
                </div>
              </div>

              <div className={styles.adminTuitionFilterSection}>
                <span className={styles.filterLabel}>Grade Level:</span>
                <div className={styles.gradeLevelSelector}>
                  {gradeLevels.map(level => (
                    <div
                      key={level.id}
                      className={`${styles.gradeLevelItem} ${selectedGradeLevel === level.id ? styles.active : ''}`}
                      onClick={() => handleGradeLevelFilter(selectedGradeLevel === level.id ? null : level.id)}
                      onContextMenu={(e) => handleGradeLevelRightClick(e, level)}
                    >
                      <div className={styles.gradeLevelIcon}>
                        {level.name === "Mầm" && "🌱"}
                        {level.name === "Chồi" && "🌿"}
                        {level.name === "Lá" && "🍃"}
                        {!["Mầm", "Chồi", "Lá"].includes(level.name) && "✓"}
                      </div>
                      <div className={styles.gradeLevelName}>{level.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className={styles.addTuitionButton}
            onClick={handleAddNew}
          >
            Add New Tuition Fee
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={getFilteredTuitionFees()}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingId ? 'Update Fee' : 'Add New Fee'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          destroyOnHidden
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item label="Month/Year" required style={{ marginBottom: 0 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  noStyle
                  rules={[
                    { required: true, message: 'Enter month' }
                  ]}
                >
                  <InputNumber
                    placeholder="Month"
                    min={1}
                    max={12}
                    value={monthInput}
                    onChange={(value) => handleMonthYearChange('month', value)}
                    style={{ width: '50%' }}
                    // Prevent non-numeric input
                    onKeyDown={(e) => {
                      if (!/[0-9]|\./g.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  rules={[
                    { required: true, message: 'Enter year' }
                  ]}
                >
                  <InputNumber
                    placeholder="Year"
                    min={2020}
                    max={2050}
                    value={yearInput}
                    onChange={(value) => handleMonthYearChange('year', value)}
                    style={{ width: '50%' }}
                    // Prevent non-numeric input
                    onKeyDown={(e) => {
                      if (!/[0-9]|\./g.test(e.key) &&
                        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </Form.Item>
              </Space.Compact>

              {/* Hidden field to store the combined value */}
              <Form.Item
                name="name"
                hidden
                rules={[{ required: true, message: 'Please enter month/year' }]}
              >
                <Input />
              </Form.Item>
            </Form.Item>

            <Form.Item
              label="Fee Items"
              required
            >
              <div className={styles.feeItemsContainer}>
                {feeItems.map((item, index) => (
                  <div key={index} className={styles.feeItemRow}>
                    <Input
                      placeholder="Fee Name"
                      value={item.name}
                      onChange={(e) => handleFeeItemChange(index, 'name', e.target.value)}
                      style={{ width: '60%', marginRight: '8px' }}
                    />
                    <InputNumber
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(value) => handleFeeItemChange(index, 'amount', value)}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      style={{ width: '30%' }}
                      // Prevent non-numeric input
                      onKeyDown={(e) => {
                        if (!/[0-9]|\./g.test(e.key) &&
                          !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeFeeItem(index)}
                      disabled={feeItems.length <= 1}
                    />
                  </div>
                ))}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addFeeItem}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Add Fee Item
                </Button>
              </div>

              {/* Hidden form item to store the actual description */}
              <Form.Item
                name="description"
                hidden
              >
                <Input />
              </Form.Item>
            </Form.Item>

            <Form.Item
              name="date"
              label="Due Date"
              rules={[{ required: true, message: 'Please select due date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                styles={{
                  popup: {
                    root: {
                      width: '280px',
                      position: 'absolute',
                      zIndex: 1100
                    }
                  }
                }}
                size="middle"
                placement="bottomLeft"
              />
            </Form.Item>

            <Form.Item
              name="fee"
              label="Total (VND)"
              initialValue={0}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                disabled
              />
            </Form.Item>

            <Form.Item
              name="gradeLevelID"
              label="Grade Level"
              rules={[{ required: true, message: 'Please select grade level' }]}
            >
              <Radio.Group>
                <div className={styles.gradeLevelRadioGroup}>
                  {gradeLevels.map(level => (
                    <Radio key={level.id} value={level.id}>
                      <div className={styles.gradeRadioContent}>
                        <span className={styles.gradeRadioIcon}>
                          {level.name === "Mầm" && "🌱"}
                          {level.name === "Chồi" && "🌿"}
                          {level.name === "Lá" && "🍃"}
                          {!["Mầm", "Chồi", "Lá"].includes(level.name) && "✓"}
                        </span>
                        <span>{level.name}</span>
                      </div>
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Space className={styles.adminTuitionFormButtons}>
                <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Add Grade Level Detail Modal */}
        <Modal
          title={`Grade Level: ${selectedGradeLevelDetail?.name}`}
          open={gradeLevelDetailVisible}
          onCancel={() => setGradeLevelDetailVisible(false)}
          footer={null}
        >
          <Form
            form={gradeLevelFeeForm}
            layout="vertical"
            onFinish={handleUpdateGradeLevelFee}
          >
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <div className={styles.gradeLevelDetailHeader}>
              <div className={styles.gradeLevelDetailIcon}>
                {selectedGradeLevelDetail?.name === "Mầm" && "🌱"}
                {selectedGradeLevelDetail?.name === "Chồi" && "🌿"}
                {selectedGradeLevelDetail?.name === "Lá" && "🍃"}
                {!["Mầm", "Chồi", "Lá"].includes(selectedGradeLevelDetail?.name) && "✓"}
              </div>
              <Form.Item
                name="name"
                label="Grade Level Name"
              >
                <Input disabled />
              </Form.Item>
            </div>

            <Form.Item
              name="fee"
              label="Standard Fee (VND)"
              rules={[{ required: true, message: 'Please enter the standard fee' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                min={0}
              />
            </Form.Item>

            <Form.Item>
              <Space className={styles.gradeLevelDetailActions}>
                <Button onClick={() => setGradeLevelDetailVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Update Fee
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Render the context menu */}
        {renderContextMenu()}

        {/* Keep the toast container at the end of the component */}
        <toast.ToastContainer position="top-right" />
      </div>
    </>
  );
};

export default TuitionFeeManagement;
