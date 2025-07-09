import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Spin,
  Empty, Radio, message, Badge, Tooltip, Progress,
  Title, Text, Paragraph,
  CalendarOutlined, SaveOutlined, UndoOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  ArrowLeftOutlined, InfoCircleOutlined, TextArea
} from '../../utils/AntComponents';
import { useParams, useNavigate } from 'react-router-dom';
import { getTodayAttendance, updateAttendanceRecords } from '../../services/TeacherService';
import styles from './TeacherCheckAttendance.module.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      message.error('Cannot load attendance data');
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
    message.info('Changes have been reverted');
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

      toast.success('Attendance saved successfully!', {
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
      toast.error('Cannot save attendance data. Please try again.', {
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
      title: 'ID',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Student',
      dataIndex: 'childrenName',
      key: 'childrenName',
      render: (name) => (
        <Text strong>{name}</Text>
      )
    },
    {
      title: 'Status',
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
              <CheckCircleOutlined /> Present
            </Radio.Button>
            <Radio.Button
              value="Absent"
              className={`teacher-status-btn ${status === 'Absent' ? 'teacher-status-btn-absent-active' : ''}`}
            >
              <CloseCircleOutlined /> Absent
            </Radio.Button>
          </Radio.Group>
        </div>
      )
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes, record) => (
        <TextArea
          placeholder="Enter notes (optional)"
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
    <div className={styles.teacherAttendanceContainer}>
      <Card className={styles.teacherAttendancePageCard}>
        <div className={styles.teacherAttendanceHeader}>
          <div className={styles.teacherAttendanceTitleSection}>
            <Title level={2}>Attendance</Title>
            <Paragraph className={styles.teacherAttendanceDescription}>
              Attendance of students and notes for today
            </Paragraph>
          </div>

          <div className={styles.teacherAttendanceDate}>
            <CalendarOutlined className={styles.teacherDateIcon} />
            <Text strong>{todayDate}</Text>
          </div>
        </div>

        {loading ? (
          <div className={styles.teacherLoadingState}>
            <Spin size="large" />
            <Text>Loading attendance data...</Text>
          </div>
        ) : attendanceData.length > 0 ? (
          <>
            <div className={styles.teacherAttendanceSummary}>
              <Card className={`${styles.teacherSummaryCard} ${styles.teacherSummaryCardPercentage}`}>
                <div className={styles.teacherSummaryHeader}>
                  <Text type="secondary" style={{ marginRight: '3px' }}>Attendance rate</Text>
                  <Tooltip title="Attendance rate of students">
                    <InfoCircleOutlined className={styles.teacherInfoIcon} />
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
                  className={styles.teacherAttendanceProgress}
                />
              </Card>

              <Card className={`${styles.teacherSummaryCard} ${styles.present}`}>
                <div className={styles.teacherSummaryHeader}>
                  <Text type="secondary">Present</Text>
                  <Badge status="success" />
                </div>
                <div className={styles.teacherSummaryValue}>
                  {getPresentCount()}/{attendanceData.length}
                </div>
                <div className={styles.teacherSummarySubtitle}>
                  students
                </div>
              </Card>

              <Card className={`${styles.teacherSummaryCard} ${styles.absent}`}>
                <div className={styles.teacherSummaryHeader}>
                  <Text type="secondary">Absent</Text>
                  <Badge status="error" />
                </div>
                <div className={styles.teacherSummaryValue}>
                  {getAbsentCount()}/{attendanceData.length}
                </div>
                <div className={styles.teacherSummarySubtitle}>
                  students
                </div>
              </Card>
            </div>

            <Card
              title={
                <div className={styles.teacherTableHeader}>
                  <Text strong>Attendance list</Text>
                </div>
              }
              className={styles.teacherAttendanceCard}
            >
              <Table
                dataSource={attendanceData}
                columns={columns}
                pagination={false}
                className={styles.teacherAttendanceTable}
                rowClassName={(record) =>
                  record.status === 'Attend' ? styles.teacherRowAttend : styles.teacherRowAbsent
                }
                bordered
                size="middle"
              />
            </Card>

            <div className={styles.teacherAttendanceActions}>
              <Button
                onClick={handleBack}
                icon={<ArrowLeftOutlined />}
                className={styles.teacherBackButton}
                size="large"
              >
                Back
              </Button>
              <div className={styles.teacherActionSpacer}></div>
              <Button
                onClick={resetChanges}
                icon={<UndoOutlined />}
                disabled={!hasChanges()}
                size="large"
              >
                Revert
              </Button>
              <Button
                type="primary"
                onClick={saveAttendance}
                loading={saving}
                icon={<SaveOutlined />}
                disabled={!hasChanges()}
                size="large"
              >
                Save attendance
              </Button>
            </div>
          </>
        ) : (
          <Empty
            description="No attendance data for today"
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
        className={styles.teacherToastContainer}
      />
    </div>
  );
};

export default TeacherCheckAttendance;