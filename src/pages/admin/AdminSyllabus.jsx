import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Space, Input, Modal, Form, 
  Typography, Popconfirm, message, Spin, Tag, Tooltip,
  Breadcrumb, Steps, Divider, Row, Col, Progress, Upload, Statistic
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, BookOutlined, ExclamationCircleOutlined, 
  ReloadOutlined, MinusCircleOutlined, CheckCircleOutlined,
  InfoCircleOutlined, CheckOutlined, UploadOutlined, FileExcelOutlined,
  LoadingOutlined, CloseOutlined
} from '@ant-design/icons';
import { getAllSyllabi, createSyllabus, createSyllabusDetails, 
  deleteSyllabus, getSyllabusDetails, 
  updateMultipleSyllabi, updateSyllabusDetail } from '../../services/AdminService';
import * as XLSX from 'xlsx'; 
import './AdminSyllabus.css';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Step } = Steps;
const { Dragger } = Upload;

// Silence antd compatibility warnings
const originalConsoleWarn = console.warn;
console.warn = function(msg) {
  if (typeof msg === 'string' && msg.includes('[antd: compatible]')) {
    return;
  }
  originalConsoleWarn.apply(console, arguments);
};

const AdminSyllabus = () => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [detailsForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [newSyllabusId, setNewSyllabusId] = useState(null);
  const [detailsCount, setDetailsCount] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0);
  const [step1Values, setStep1Values] = useState({name: '', slotAmount: 1});
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [syllabusDetails, setSyllabusDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSyllabusDetails, setEditingSyllabusDetails] = useState([]);

  useEffect(() => {
    fetchSyllabi();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      if (currentStep === 0) {
        // Only set form values when the modal is actually visible
        form.setFieldsValue({
          name: editingSyllabus ? editingSyllabus.name : step1Values.name,
          slotAmount: editingSyllabus ? editingSyllabus.slotAmount : step1Values.slotAmount
        });
      } else if (currentStep === 1) {
        // Initialize the details form with existing values if editing, or empty array if new
        const initialDetails = editingSyllabus ? 
          (editingSyllabusDetails || []).map(detail => ({
            content: detail.content,
            duration: detail.duration
          })) : [];
          
        detailsForm.setFieldsValue({
          details: initialDetails
        });
        
        setTimeout(updateDetailsCount, 0);
      }
    }
  }, [currentStep, editingSyllabus, editingSyllabusDetails, step1Values, modalVisible]);

  // Add this effect to disable body scrolling when modal is open
  useEffect(() => {
    // Store original body styles to restore them properly
    const originalStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    };

    if (modalVisible) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.width = originalStyles.width;
      document.body.style.overflow = originalStyles.overflow;
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    return () => {
      document.body.style.position = originalStyles.position;
      document.body.style.top = originalStyles.top;
      document.body.style.width = originalStyles.width;
      document.body.style.overflow = originalStyles.overflow;
    };
  }, [modalVisible]);

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      const data = await getAllSyllabi(); // dữ liệu đã được backend lọc
      setSyllabi(data); // không cần filter isDeleted nữa
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
    syllabus.name.toLowerCase().includes(searchText.toLowerCase()) && 
    syllabus.isDeleted === false
  );

  const showAddModal = () => {
    setEditingSyllabus(null);
    setModalTitle('Add New Syllabus');
    setCurrentStep(0);
    setNewSyllabusId(null);
    setDetailsCount(0);
    setTotalSlots(0);
    
    // Reset both forms before showing modal
    setTimeout(() => {
      form.resetFields();
      detailsForm.resetFields();
      setStep1Values({name: '', slotAmount: 1});
      setModalVisible(true);
    }, 0);
  };

  const showEditModal = async (syllabus) => {
    setEditingSyllabus(syllabus);
    setModalTitle('Edit Syllabus');
    setCurrentStep(0);
    setTotalSlots(syllabus.slotAmount);
    
    form.resetFields();
    form.setFieldsValue({
      name: syllabus.name,
      slotAmount: syllabus.slotAmount,
    });
    
    try {
      // Fetch syllabus details
      setDetailsLoading(true);
      const details = await getSyllabusDetails(syllabus.id);
      
      // Set details in the form for step 2
      detailsForm.resetFields();
      detailsForm.setFieldsValue({
        details: details.map(detail => ({
          content: detail.content,
          duration: detail.duration
        }))
      });
      
      setEditingSyllabusDetails(details);
      setDetailsCount(details.length);
      setDetailsLoading(false);
    } catch (error) {
      message.error('Failed to fetch syllabus details');
      console.error(error);
    }
    
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields();
  
        if (editingSyllabus) {
          // For editing: Save values for next step without API call
          setStep1Values(values);
          setTotalSlots(Number(values.slotAmount));
          message.success('Basic information validated. Please edit details in the next step.');
          setCurrentStep(1);
        } else {
          // For new syllabus: Save form values
          setStep1Values(values);
          setTotalSlots(Number(values.slotAmount));
          message.success('Basic information validated. Please add details in the next step.');
          setCurrentStep(1);
        }
      } catch (error) {
        message.error('Please fill in all required fields correctly');
        console.error('Form validation failed:', error);
      }
    } else {
      // Step 2: Update both syllabus and details
      try {
        const detailValues = await detailsForm.validateFields();
  
        // Validate basic info
        if (!step1Values.name || isNaN(Number(step1Values.slotAmount))) {
          message.error('Invalid syllabus information. Please go back to step 1.');
          return;
        }
  
        setSubmitting(true);
  
        if (editingSyllabus) {
          // Prepare syllabus data
          const syllabusData = [{
            id: editingSyllabus.id,
            name: step1Values.name,
            slotAmount: Number(step1Values.slotAmount)
          }];
  
          // Update syllabus
          await updateMultipleSyllabi(syllabusData);
  
          // 🔍 Ensure slot ID list is available
          if (!editingSyllabusDetails || editingSyllabusDetails.length === 0) {
            message.error('Missing slot IDs. Please reopen the edit form.');
            setSubmitting(false);
            return;
          }
  
          // Update each slot detail
          const detailsPromises = detailValues.details.map((detail, index) => {
            // Lấy đúng ID của SyllabusDetail từ mảng đã fetch
            const detailId = editingSyllabusDetails[index]?.id;
            if (!detailId) {
              console.error(`Missing detail ID for index ${index}`);
              return Promise.resolve(); // skip if no id
            }
            console.log(`Updating detail ${detailId} with content: ${detail.content}, duration: ${detail.duration}`);
            
            // Gọi updateSyllabusDetail với detailId
            return updateSyllabusDetail(detailId, {
              content: detail.content,
              duration: Number(detail.duration)
            });
          });
  
          await Promise.all(detailsPromises);
  
          setSubmitting(false);
          setModalVisible(false);
          fetchSyllabi();
          addToast('success', 'Syllabus Updated', `"${step1Values.name}" has been successfully updated.`);
        } else {
          // Create new syllabus
          const syllabusData = {
            name: step1Values.name,
            slotAmount: Number(step1Values.slotAmount)
          };
  
          const syllabusResponse = await createSyllabus(syllabusData);
          const newId = syllabusResponse.id;
  
          await createSyllabusDetails(newId, detailValues.details.map(detail => ({
            content: detail.content,
            duration: Number(detail.duration)
          })));
  
          setSubmitting(false);
          setModalVisible(false);
          fetchSyllabi();
          addToast('success', 'Syllabus Created Successfully', `"${step1Values.name}" with ${step1Values.slotAmount} slots has been created.`);
        }
  
        // Reset state
        form.resetFields();
        detailsForm.resetFields();
        setStep1Values({ name: '', slotAmount: 1 });
        setDetailsCount(0);
        setTotalSlots(0);
        setCurrentStep(0);
      } catch (error) {
        setSubmitting(false);
        console.error('Operation failed:', error);
        message.error('Failed to update syllabus. Please check all fields are filled correctly.');
      }
    }
  };
  

  // Function to count total details in the form
  const updateDetailsCount = () => {
    try {
      const formValues = detailsForm.getFieldsValue();
      const count = formValues.details ? formValues.details.length : 0;
      setDetailsCount(count);
    } catch (error) {
      console.error('Error counting details:', error);
    }
  };

  const handleDelete = (syllabusId) => {
    Modal.confirm({
      title: 'Delete Syllabus',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete syllabus with ID ${syllabusId}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        // Using fetch directly instead of through service
        fetch(`/api/Syllabus/${syllabusId}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (response.ok) {
            message.success('Syllabus deleted successfully');
            // Refresh data
            fetchSyllabi();
          } else {
            throw new Error(`HTTP error: ${response.status}`);
          }
        })
        .catch(error => {
          console.error('Delete error:', error);
          message.error(`Failed to delete: ${error.message}`);
        });
      },
    });
  };

  // Update the handleExcelImport function
  const handleExcelImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const validDetails = [];
        let hasErrors = false;
        
        jsonData.forEach((row, index) => {
          // Check for required fields
          if (!row.content || row.duration === undefined) {
            message.error(`Row ${index + 1} is missing required fields (content or duration)`);
            hasErrors = true;
            return;
          }
          
          // Check that duration is a number
          const duration = Number(row.duration);
          if (isNaN(duration) || duration <= 0) {
            message.error(`Row ${index + 1} has an invalid duration (must be a positive number)`);
            hasErrors = true;
            return;
          }
          
          validDetails.push({
            content: row.content,
            duration: duration
          });
        });
        
        if (hasErrors) {
          return;
        }
        
        // Check if number of details matches required slots
        if (validDetails.length > totalSlots) {
          message.warning(`The Excel file contains ${validDetails.length} details, but only ${totalSlots} slots are needed. Extra details will be ignored.`);
          validDetails.splice(totalSlots);
        } else if (validDetails.length < totalSlots) {
          message.warning(`The Excel file contains only ${validDetails.length} details, but ${totalSlots} slots are needed. You'll need to add ${totalSlots - validDetails.length} more details.`);
        }
        
        // Clear existing form data first
        const currentDetails = detailsForm.getFieldValue('details') || [];
        detailsForm.setFieldsValue({ 
          details: [] 
        });
        
        // Then set the new details after a short delay to ensure form updates
        setTimeout(() => {
          detailsForm.setFieldsValue({ 
            details: validDetails 
          });
          
          // Update details count
          setDetailsCount(validDetails.length);
          
          // Show success message with specific content details
          message.success(
            <div>
              <div>Successfully imported {validDetails.length} syllabus details</div>
              <Button 
                type="link" 
                onClick={() => {
                  // Scroll to the details form
                  document.querySelector('.admin-syllabus-detail-form').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                View imported details
              </Button>
            </div>
          );
          
          // Highlight the imported rows with animation
          const detailRows = document.querySelectorAll('.admin-syllabus-detail-item-row');
          detailRows.forEach(row => {
            row.classList.add('admin-syllabus-imported-row');
            setTimeout(() => {
              row.classList.remove('admin-syllabus-imported-row');
            }, 3000);
          });
          
        }, 100);
        
      } catch (error) {
        message.error('Failed to parse Excel file. Please check the format.');
        console.error('Excel import error:', error);
      }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Prevent default upload behavior
    return false;
  };

  // Add props for Excel upload
  const excelUploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: handleExcelImport,
    showUploadList: false,
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
  };

  const showDetailsModal = async (syllabus) => {
    try {
      setSelectedSyllabus(syllabus);
      setDetailsLoading(true);
      setDetailsModalVisible(true);
      const details = await getSyllabusDetails(syllabus.id);
      setSyllabusDetails(details);
    } catch (error) {
      message.error('Failed to fetch syllabus details');
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
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
      title: 'Slot Amount',
      dataIndex: 'slotAmount',
      key: 'slotAmount',
      width: 120,
      render: (slotAmount) => (
        <Tag color="blue">{slotAmount} slots</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="primary"
              icon={<InfoCircleOutlined />}
              size="small"
              onClick={() => showDetailsModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Syllabus"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={async () => {
              try {
                await fetch(`https://localhost:7216/api/Syllabus/${record.id}`, {
                  method: 'DELETE',
                });
                addToast('success', 'Syllabus Deleted', `"${record.name}" has been successfully deleted.`);
                fetchSyllabi();
              } catch (error) {
                console.error('Delete error:', error);
                addToast('error', 'Delete Failed', `Failed to delete syllabus: ${error.message}`);
              }
            }}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-syllabus-container">
      <div className="admin-syllabus-toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`admin-syllabus-toast admin-syllabus-toast-${toast.type}`}
          >
            <div className="admin-syllabus-toast-header">
              <span className="admin-syllabus-toast-title">{toast.title}</span>
              <Button 
                type="text" 
                size="small" 
                className="admin-syllabus-toast-close" 
                onClick={() => removeToast(toast.id)}
                icon={<CloseOutlined />}
              />
            </div>
            <div className="admin-syllabus-toast-message">{toast.message}</div>
            <div className="admin-syllabus-toast-progress"></div>
          </div>
        ))}
      </div>

      <Breadcrumb 
        className="admin-syllabus-breadcrumb"
        items={[
          {
            title: 'Admin',
          },
          {
            title: 'Syllabus',
          }
        ]}
      />

      <Card className="admin-syllabus-card">
        <div className="admin-syllabus-header">
          <Title level={3}>
            <BookOutlined style={{ marginRight: 10, color: '#1890ff' }} />
            Syllabus Management
          </Title>
          <div className="admin-syllabus-actions">
            <Input
              placeholder="Search syllabi..."
              prefix={<SearchOutlined />}
              className="admin-syllabus-search-input"
              onChange={handleSearch}
              value={searchText}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
              className="admin-syllabus-primary-button"
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
          <div className="admin-syllabus-loading-container">
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
        title={
          <div className="admin-syllabus-modal-header-with-steps">
            <div>{modalTitle}</div>
            <Steps 
              size="small" 
              current={currentStep} 
              className="admin-syllabus-steps-container"
              style={{ marginTop: 16 }}
            >
              <Step title="Basic Info" description="Enter syllabus details" />
              <Step title="Slot Details" description="Add content for each slot" />
            </Steps>
          </div>
        }
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={currentStep === 1 ? 720 : 540}
        className={`admin-syllabus-modal ${currentStep === 0 ? 'step-1' : 'step-2'}`}
        style={{ top: '5%' }}
      >
        <div className="admin-syllabus-modal-content">
          {currentStep === 0 ? (
            <>
              <div className="admin-syllabus-step-content">
                <div className="admin-syllabus-step-title">Step 1: Enter Syllabus Details</div>
                <div className="admin-syllabus-step-description">
                  Enter the basic information for the syllabus. You'll add slot details in the next step before creating the syllabus.
                </div>
                
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{ name: '', slotAmount: 1 }}
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
                    <Input placeholder="Enter syllabus name" id="syllabus-name-input" />
                  </Form.Item>
                  <Form.Item
                    name="slotAmount"
                    label="Slot Amount"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the slot amount',
                      },
                      {
                        validator: (_, value) => {
                          const numValue = Number(value);
                          if (isNaN(numValue)) {
                            return Promise.reject('Slot amount must be a number');
                          }
                          if (numValue < 1) {
                            return Promise.reject('Slot amount must be a positive number');
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input type="number" min={1} placeholder="Enter slot amount" id="syllabus-slot-amount-input" />
                  </Form.Item>
                </Form>
              </div>
              <div className="admin-syllabus-modal-footer">
                <div className="admin-syllabus-step-nav-buttons">
                  <Button onClick={handleModalCancel}>
                    Cancel
                  </Button>
                  <Button 
                    type="primary"
                    onClick={handleModalSubmit}
                    icon={<PlusOutlined />}
                    className="admin-syllabus-action-button"
                  >
                    {editingSyllabus ? 'Continue to details' : 'Continue to details'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="admin-syllabus-step-content">
                <div className="admin-syllabus-step-title">
                  Step 2: Add Slot Details
                  <span className="admin-syllabus-detail-count-badge">
                    {detailsCount}/{totalSlots} slots added
                  </span>
                </div>
                
                <div className="admin-syllabus-step-description">
                  Add content and duration for each slot in the syllabus. 
                  You need to add exactly {totalSlots} slots to complete this step.
                </div>
                
                {/* Excel Import Option - Updated section */}
                <div className="admin-syllabus-excel-import">
                  <Divider>
                    <Space>
                      <FileExcelOutlined className="admin-syllabus-excel-icon" />
                      <span style={{ fontWeight: 'bold' }}>Excel Import</span>
                    </Space>
                  </Divider>
                  
                  <div className="admin-syllabus-excel-actions">
                    <Button 
                      type="primary"
                      icon={<UploadOutlined />}
                      className="admin-syllabus-excel-button"
                      onClick={() => {
                        // Show file chooser dialog directly
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = (e) => {
                          if (e.target.files.length > 0) {
                            handleExcelImport(e.target.files[0]);
                          }
                        };
                        input.click();
                      }}
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a'
                      }}
                    >
                      Import Excel File
                    </Button>
                    
                    <Button 
                      type="default"
                      icon={<FileExcelOutlined />}
                      className="admin-syllabus-excel-button"
                      onClick={() => {
                        // Create a simple template Excel file
                        const worksheet = XLSX.utils.json_to_sheet([
                          { content: 'Example content 1', duration: 60 },
                          { content: 'Example content 2', duration: 45 }
                        ]);
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'SyllabusDetails');
                        XLSX.writeFile(workbook, 'syllabus_details_template.xlsx');
                      }}
                    >
                      Download Template
                    </Button>
                  </div>
                  
                  {/* Hide the actual upload component but make it accessible via the button */}
                  <Upload
                    {...excelUploadProps}
                    style={{ display: 'none' }}
                  >
                    <input id="excel-upload-input" type="file" style={{ display: 'none' }} />
                  </Upload>
                  
                  <Dragger {...excelUploadProps} className="admin-syllabus-excel-dragger">
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ color: '#52c41a', fontSize: '32px' }} />
                    </p>
                    <p className="ant-upload-text">Click or drag Excel file to this area to upload</p>
                    <p className="ant-upload-hint">
                      Excel file should have columns named "content" and "duration"
                    </p>
                  </Dragger>
                  
                  <div className="admin-syllabus-excel-note">
                    <InfoCircleOutlined style={{ marginRight: 8 }} />
                    <Text>The Excel file should contain a list of syllabus details with "content" and "duration" columns.</Text>
                  </div>
                </div>
                
                <Divider>
                  <Space>
                    <PlusOutlined />
                    Or Add Details Manually
                  </Space>
                </Divider>
                
                <div className="admin-syllabus-step-progress-container">
                  <Progress 
                    percent={Math.round((detailsCount/totalSlots) * 100)} 
                    format={() => `${detailsCount}/${totalSlots} slots`}
                    status={detailsCount > totalSlots ? "exception" : 
                           detailsCount === totalSlots ? "success" : "active"}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  
                  <div className="admin-syllabus-progress-status">
                    {detailsCount === totalSlots ? (
                      <span className="admin-syllabus-details-complete">
                        <CheckCircleOutlined className="admin-syllabus-progress-icon" /> All slots added! Ready to create.
                      </span>
                    ) : (
                      <span className="admin-syllabus-details-incomplete">
                        <InfoCircleOutlined className="admin-syllabus-progress-icon" /> 
                        {totalSlots - detailsCount} more slot{totalSlots - detailsCount !== 1 ? 's' : ''} needed
                      </span>
                    )}
                  </div>
                </div>
                
                <Form
                  form={detailsForm}
                  layout="vertical"
                  className="admin-syllabus-detail-form"
                  initialValues={{ details: [] }}
                  onValuesChange={updateDetailsCount}
                >
                  <Form.List name="details">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={16} align="middle" className="admin-syllabus-detail-item-row">
                            <Col span={14}>
                              <Form.Item
                                {...restField}
                                name={[name, 'content']}
                                label={`Slot ${name + 1} Content`}
                                rules={[{ required: true, message: 'Content is required' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input 
                                  placeholder="Enter content for this slot" 
                                  id={`syllabus-detail-content-${name}`}
                                  aria-label={`Content for slot ${name + 1}`}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'duration']}
                                label={`Slot ${name + 1} Duration`}
                                rules={[{ required: true, message: 'Duration is required' }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input 
                                  type="number" 
                                  min={1} 
                                  placeholder="Duration" 
                                  id={`syllabus-detail-duration-${name}`}
                                  aria-label={`Duration for slot ${name + 1}`}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4} className="admin-syllabus-detail-remove-button">
                              <Button
                                type="text"
                                icon={<MinusCircleOutlined />}
                                onClick={() => {
                                  remove(name);
                                  setTimeout(updateDetailsCount, 0);
                                }}
                                aria-label={`Remove slot ${name + 1}`}
                              />
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button 
                            type="dashed" 
                            onClick={() => {
                              add();
                              setTimeout(updateDetailsCount, 0);
                            }} 
                            block 
                            icon={<PlusOutlined />}
                            className="admin-syllabus-add-detail-button"
                            disabled={detailsCount >= totalSlots}
                          >
                            Add Slot
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form>
              </div>
              <div className="admin-syllabus-modal-footer">
                <div className="admin-syllabus-step-nav-buttons">
                  <Button onClick={() => setCurrentStep(0)}>
                    Back to Step 1
                  </Button>
                  <Button 
                    type="primary"
                    onClick={handleModalSubmit}
                    disabled={detailsCount !== totalSlots}
                    className="admin-syllabus-action-button"
                    icon={<CheckOutlined />}
                  >
                    {editingSyllabus ? 'Update Syllabus' : 'Create Syllabus'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        {submitting && (
          <div className="admin-syllabus-loading-cover">
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} 
              tip="Processing..." 
              size="large" 
            />
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div className="admin-syllabus-detail-modal-header">
            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {selectedSyllabus ? `Details for "${selectedSyllabus.name}" Syllabus` : 'Syllabus Details'}
          </div>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {detailsLoading ? (
          <div className="admin-syllabus-loading-container">
            <Spin size="large" />
            <Text>Loading details...</Text>
          </div>
        ) : (
          <>
            <div className="admin-syllabus-detail-stats">
              <Row gutter={16}>
                <Col span={8}>
                  <Card size="small">
                    <Statistic 
                      title="Total Slots" 
                      value={syllabusDetails.length} 
                      prefix={<BookOutlined />} 
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic 
                      title="Total Duration" 
                      value={syllabusDetails.reduce((sum, item) => sum + item.duration, 0)} 
                      suffix="minutes" 
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Statistic 
                      title="Average Duration" 
                      value={Math.round(syllabusDetails.reduce((sum, item) => sum + item.duration, 0) / (syllabusDetails.length || 1))} 
                      suffix="min/slot" 
                      precision={0}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            <Table
              className="admin-syllabus-details-table"
              dataSource={syllabusDetails}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} slots`,
              }}
              bordered
              scroll={{ y: 400 }}
              columns={[
                {
                  title: 'Slot',
                  dataIndex: 'slot',
                  key: 'slot',
                  width: 80,
                  render: (slot) => <span className="admin-syllabus-slot-badge">{slot}</span>
                },
                {
                  title: 'Content',
                  dataIndex: 'content',
                  key: 'content',
                  render: (content) => <div className="admin-syllabus-content-cell">{content}</div>
                },
                {
                  title: 'Duration',
                  dataIndex: 'duration',
                  key: 'duration',
                  width: 100,
                  render: (duration) => <span className="admin-syllabus-duration-cell">{duration} min</span>,
                },
              ]}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminSyllabus;
