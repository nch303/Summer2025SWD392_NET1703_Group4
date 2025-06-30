import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Typography, Spin, Empty, Button, 
  Tooltip, Statistic, Row, Col, Progress
} from 'antd';
import { 
  ArrowLeftOutlined, CalendarOutlined, 
  CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAllClassAttendance } from './TeacherCheckAttendanceService';
import { getClassesByTeacherId } from './TeacherClassService';
import { useUser } from '../../contexts/UserContext';
import './TeacherAttendanceAll.css';

const { Title, Text, Paragraph } = Typography;

const TeacherAttendanceAll = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [attendanceDates, setAttendanceDates] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllClassAttendance(classId);
        setAttendanceData(data);
        
        // Get class info
        if (currentUser?.id) {
          const classes = await getClassesByTeacherId(currentUser.id);
          const currentClass = classes.find(c => c.id.toString() === classId.toString());
          setClassInfo(currentClass);
        }
        
        // Process data for table display
        processAttendanceData(data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId, currentUser]);

  const processAttendanceData = (data) => {
    // Extract unique dates and sort them
    const uniqueDates = [...new Set(data.map(item => item.date.split('T')[0]))].sort();
    setAttendanceDates(uniqueDates);

    // Group by student
    const studentGroups = data.reduce((groups, item) => {
      const { childrenName, classChildrenID, date, status } = item;
      if (!groups[classChildrenID]) {
        groups[classChildrenID] = {
          childrenName,
          classChildrenID,
          attendances: {},
          totalPresent: 0,
          totalAbsent: 0
        };
      }
      
      const dateKey = date.split('T')[0];
      groups[classChildrenID].attendances[dateKey] = status;
      
      if (status === 'Attend') {
        groups[classChildrenID].totalPresent += 1;
      } else {
        groups[classChildrenID].totalAbsent += 1;
      }
      
      return groups;
    }, {});
    
    // Convert to array format for table
    const processedData = Object.values(studentGroups).map((student, index) => {
      // Replace this calculation with one based on total dates
      const totalDates = uniqueDates.length;
      const attendanceRate = totalDates > 0 
        ? Math.round((student.totalPresent / totalDates) * 100) 
        : 0;
      
      return {
        key: student.classChildrenID,
        index: index + 1,
        childrenName: student.childrenName,
        classChildrenID: student.classChildrenID,
        attendances: student.attendances,
        attendanceRate,
        totalPresent: student.totalPresent,
        totalAbsent: student.totalAbsent,
        totalDates
      };
    });
    
    setProcessedData(processedData);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Create dynamic columns based on attendance dates
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      className: 'teacher-attendance-index-column'
    },
    {
      title: 'Học sinh',
      dataIndex: 'childrenName',
      key: 'childrenName',
      width: 180,
      fixed: 'left',
      className: 'teacher-attendance-student-column',
      render: (text) => <Text strong>{text}</Text>
    },
    ...attendanceDates.map(date => ({
      title: () => {
        // Format date for display (DD/MM)
        const displayDate = new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit'
        });
        return (
          <Tooltip title={new Date(date).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}>
            {displayDate}
          </Tooltip>
        );
      },
      dataIndex: 'attendances',
      key: date,
      width: 70,
      align: 'center',
      className: 'teacher-attendance-date-column',
      render: (attendances) => {
        const status = attendances[date];
        return status === 'Attend' ? (
          <div className="teacher-attendance-present">
            <Text>P</Text>
          </div>
        ) : (
          <div className="teacher-attendance-absent">
            <Text>A</Text>
          </div>
        );
      }
    })),
    {
      title: 'Tỉ lệ đi học',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 150,
      align: 'center',
      fixed: 'right',
      className: 'teacher-attendance-rate-column',
      render: (rate, record) => (
        <Tooltip title={`${record.totalPresent}/${record.totalDates} buổi (${rate}%)`}>
          <Progress 
            percent={rate} 
            size="small" 
            status={rate < 80 ? "exception" : "success"}
            format={percent => `${percent}%`}
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate
    }
  ];

  // Calculate overall statistics
  const calculateStats = () => {
    if (processedData.length === 0) return { presentRate: 0, absentRate: 0 };
    
    const totalPresent = processedData.reduce((sum, student) => sum + student.totalPresent, 0);
    const totalPossibleAttendances = processedData.length * attendanceDates.length;
    
    const presentRate = totalPossibleAttendances > 0 ? Math.round((totalPresent / totalPossibleAttendances) * 100) : 0;
    const absentRate = 100 - presentRate;
    
    return { presentRate, absentRate };
  };
  
  const stats = calculateStats();

  return (
    <div className="teacher-attendance-all-container">
      <Card className="teacher-attendance-all-card">
        <div className="teacher-attendance-all-header">
          <div className="teacher-attendance-all-title-section">
            <Title level={2}>Báo cáo điểm danh lớp học</Title>
            {classInfo && (
              <Paragraph className="teacher-attendance-all-class-info">
                Lớp: <Text strong>{classInfo.name}</Text> | Sĩ số: <Text strong>{processedData.length}</Text>
              </Paragraph>
            )}
          </div>
        </div>

        {loading ? (
          <div className="teacher-attendance-all-loading">
            <Spin size="large" />
            <Text>Đang tải dữ liệu điểm danh...</Text>
          </div>
        ) : processedData.length > 0 ? (
          <>
            <div className="teacher-attendance-stats-summary">
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Card className="teacher-attendance-stat-card overall-rate">
                    <Statistic 
                      title="Tỉ lệ đi học chung" 
                      value={stats.presentRate} 
                      suffix="%" 
                      precision={0}
                      valueStyle={{ 
                        color: stats.presentRate < 80 ? '#ff4d4f' : '#3f8600'
                      }}
                    />
                    <Progress 
                      percent={stats.presentRate} 
                      status={stats.presentRate < 80 ? "exception" : "success"} 
                      showInfo={false}
                      className="teacher-attendance-stat-progress"
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="teacher-attendance-stat-card present-stat">
                    <Statistic
                      title="Điểm danh đầy đủ"
                      value={processedData.filter(student => student.attendanceRate === 100).length}
                      suffix={`/${processedData.length} học sinh`}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className="teacher-attendance-stat-card absent-stat">
                    <Statistic
                      title="Cần chú ý"
                      value={processedData.filter(student => student.attendanceRate < 80).length}
                      suffix={`/${processedData.length} học sinh`}
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
            
            <Card 
              title={
                <div className="teacher-attendance-table-header">
                  <Text strong>Bảng điểm danh theo ngày</Text>
                  <Text type="secondary">
                    <CalendarOutlined /> {attendanceDates.length} ngày điểm danh
                  </Text>
                </div>
              }
              className="teacher-attendance-table-card"
            >
              <Table 
                dataSource={processedData}
                columns={columns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                className="teacher-attendance-all-table"
                bordered
                size="middle"
              />
            </Card>
          </>
        ) : (
          <Empty description="Không có dữ liệu điểm danh" />
        )}

        <div className="teacher-attendance-all-footer">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            className="teacher-attendance-all-back-button"
            size="large"
          >
            Quay lại
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeacherAttendanceAll;
