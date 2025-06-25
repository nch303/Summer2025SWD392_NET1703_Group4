import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Typography, Button, Table, Spin, 
  Empty, Radio, Input, message, Space, Badge, Tag, Tooltip, Progress
} from 'antd';
import { 
  CalendarOutlined, SaveOutlined, UndoOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined,
  ArrowLeftOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getTodayAttendance, updateAttendanceRecords } from './TeacherCheckAttendanceService';
import './TeacherCheckAttendance.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TeacherCheckAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [todayDate, setTodayDate] = useState('');
  
  useEffect(() => {
    fetchAttendanceData();
    // Format today's date
    const today = new Date();
    setTodayDate(today.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, [classId]);
  
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await getTodayAttendance(classId);
      setAttendanceData(data.map(item => ({
        ...item,
        key: item.id
      })));
      setOriginalData(JSON.parse(JSON.stringify(data)));
      setLoading(false);
    } catch (error) {
      message.error('Không thể tải dữ liệu điểm danh');
      setLoading(false);
    }
  };
  
  const handleStatusChange = (record, status) => {
    const newData = attendanceData.map(item => {
      if (item.id === record.id) {
        return { ...item, status };
      }
      return item;
    });
    setAttendanceData(newData);
  };
  
  const handleNotesChange = (record, notes) => {
    const newData = attendanceData.map(item => {
      if (item.id === record.id) {
        return { ...item, notes };
      }
      return item;
    });
    setAttendanceData(newData);
  };
  
  const resetChanges = () => {
    setAttendanceData(JSON.parse(JSON.stringify(originalData)));
    message.info('Đã hoàn tác các thay đổi');
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const saveAttendance = async () => {
    try {
      setSaving(true);
      const recordsToUpdate = attendanceData.map(item => ({
        attendanceID: item.id,
        status: item.status,
        notes: item.notes || ''
      }));
      
      await updateAttendanceRecords(recordsToUpdate);
      
      setOriginalData(JSON.parse(JSON.stringify(attendanceData)));
      
      toast.success('Đã lưu điểm danh thành công!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'teacher-toast-success'
      });
      
      setSaving(false);
    } catch (error) {
      toast.error('Không thể lưu dữ liệu điểm danh. Vui lòng thử lại.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: 'teacher-toast-error'
      });
      setSaving(false);
    }
  };
  
  const hasChanges = () => {
    return JSON.stringify(attendanceData) !== JSON.stringify(originalData);
  };
  
  const getPresentCount = () => {
    return attendanceData.filter(item => item.status === 'Attend').length;
  };
  
  const getAbsentCount = () => {
    return attendanceData.filter(item => item.status === 'Absent').length;
  };
  
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Học sinh',
      dataIndex: 'childrenName',
      key: 'childrenName',
      render: (name) => (
        <Text strong>{name}</Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div className="teacher-status-selection">
          <Radio.Group 
            value={status} 
            onChange={(e) => handleStatusChange(record, e.target.value)}
            buttonStyle="solid"
            className="teacher-status-radio-group"
          >
            <Radio.Button 
              value="Attend" 
              className={`teacher-status-btn ${status === 'Attend' ? 'teacher-status-btn-attend-active' : ''}`}
            >
              <CheckCircleOutlined /> Có mặt
            </Radio.Button>
            <Radio.Button 
              value="Absent" 
              className={`teacher-status-btn ${status === 'Absent' ? 'teacher-status-btn-absent-active' : ''}`}
            >
              <CloseCircleOutlined /> Vắng mặt
            </Radio.Button>
          </Radio.Group>
        </div>
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes, record) => (
        <TextArea 
          placeholder="Nhập ghi chú (nếu có)"
          value={notes} 
          onChange={(e) => handleNotesChange(record, e.target.value)}
          autoSize={{ minRows: 1, maxRows: 3 }}
          className="teacher-notes-input"
          maxLength={200}
        />
      )
    }
  ];
  
  const attendancePercentage = attendanceData.length > 0 
    ? Math.round((getPresentCount() / attendanceData.length) * 100) 
    : 0;
  
  return (
    <div className="teacher-attendance-container">
      <Card className="teacher-attendance-page-card">
        <div className="teacher-attendance-header">
          <div className="teacher-attendance-title-section">
            <Title level={2}>Điểm danh lớp học</Title>
            <Paragraph className="teacher-attendance-description">
              Điểm danh học sinh và ghi chú cho ngày hôm nay
            </Paragraph>
          </div>
          
          <div className="teacher-attendance-date">
            <CalendarOutlined className="teacher-date-icon" />
            <Text strong>{todayDate}</Text>
          </div>
        </div>
      
        {loading ? (
          <div className="teacher-loading-state">
            <Spin size="large" />
            <Text>Đang tải dữ liệu điểm danh...</Text>
          </div>
        ) : attendanceData.length > 0 ? (
          <>
            <div className="teacher-attendance-summary">
              <Card className="teacher-summary-card teacher-summary-card-percentage">
                <div className="teacher-summary-header">
                  <Text type="secondary" style={{ marginRight: '3px'}}>Tỉ lệ điểm danh</Text>
                  <Tooltip title="Tỉ lệ học sinh có mặt trên tổng số học sinh">
                    <InfoCircleOutlined className="teacher-info-icon" />
                  </Tooltip>
                </div>
                <Progress 
                  type="circle" 
                  percent={attendancePercentage}
                  size={80}
                  format={percent => `${percent}%`}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  className="teacher-attendance-progress"
                />
              </Card>
              
              <Card className="teacher-summary-card present">
                <div className="teacher-summary-header">
                  <Text type="secondary">Có mặt</Text>
                  <Badge status="success" />
                </div>
                <div className="teacher-summary-value">
                  {getPresentCount()}/{attendanceData.length}
                </div>
                <div className="teacher-summary-subtitle">
                  học sinh
                </div>
              </Card>
              
              <Card className="teacher-summary-card absent">
                <div className="teacher-summary-header">
                  <Text type="secondary">Vắng mặt</Text>
                  <Badge status="error" />
                </div>
                <div className="teacher-summary-value">
                  {getAbsentCount()}/{attendanceData.length}
                </div>
                <div className="teacher-summary-subtitle">
                  học sinh
                </div>
              </Card>
            </div>
            
            <Card 
              title={
                <div className="teacher-table-header">
                  <Text strong>Danh sách điểm danh</Text>
                </div>
              }
              className="teacher-attendance-card"
            >
              <Table
                dataSource={attendanceData}
                columns={columns}
                pagination={false}
                className="teacher-attendance-table"
                rowClassName={(record) => 
                  record.status === 'Attend' ? 'teacher-row-attend' : 'teacher-row-absent'
                }
                bordered
                size="middle"
              />
            </Card>
            
            <div className="teacher-attendance-actions">
              <Button 
                onClick={handleBack}
                icon={<ArrowLeftOutlined />}
                className="teacher-back-button"
                size="large"
              >
                Quay lại
              </Button>
              <div className="teacher-action-spacer"></div>
              <Button 
                onClick={resetChanges}
                icon={<UndoOutlined />}
                disabled={!hasChanges()}
                size="large"
              >
                Hoàn tác
              </Button>
              <Button 
                type="primary" 
                onClick={saveAttendance} 
                loading={saving}
                icon={<SaveOutlined />}
                disabled={!hasChanges()}
                size="large"
              >
                Lưu điểm danh
              </Button>
            </div>
          </>
        ) : (
          <Empty 
            description="Không có dữ liệu điểm danh cho ngày hôm nay" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ top: '70px' }}
        className="teacher-toast-container"
      />
    </div>
  );
};

export default TeacherCheckAttendance;