import React, { useState, useEffect } from 'react';
import {
  Card, Table, Spin, Empty, Button,
  Tooltip, Statistic, Row, Col, Progress,
  ArrowLeftOutlined, CalendarOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  Title, Text, Paragraph
} from '../../utils/AntComponents';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAllClassAttendance,
  getClassesByTeacherId
} from '../../services/TeacherService';
import { useUser } from '../../contexts/UserContext';
import styles from './TeacherAttendanceAll.module.css';

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
      title: 'ID',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      className: styles.teacherAttendanceIndexColumn
    },
    {
      title: 'Student',
      dataIndex: 'childrenName',
      key: 'childrenName',
      width: 180,
      fixed: 'left',
      className: styles.teacherAttendanceStudentColumn,
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
      className: styles.teacherAttendanceDateColumn,
      render: (attendances) => {
        const status = attendances[date];
        return status === 'Attend' ? (
          <div className={styles.teacherAttendancePresent}>
            <Text>P</Text>
          </div>
        ) : (
          <div className={styles.teacherAttendanceAbsent}>
            <Text>A</Text>
          </div>
        );
      }
    })),
    {
      title: 'Attendance rate',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 150,
      align: 'center',
      fixed: 'right',
      className: styles.teacherAttendanceRateColumn,
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
    <div className={styles.teacherAttendanceAllContainer}>
      <Card className={styles.teacherAttendanceAllCard}>
        <div className={styles.teacherAttendanceAllHeader}>
          <div className={styles.teacherAttendanceAllTitleSection}>
            <Title level={2}>Attendance report</Title>
            {classInfo && (
              <Paragraph className={styles.teacherAttendanceAllClassInfo}>
                Class: <Text strong>{classInfo.name}</Text> | Number of students: <Text strong>{processedData.length}</Text>
              </Paragraph>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.teacherAttendanceAllLoading}>
            <Spin size="large" />
            <Text>Loading attendance data...</Text>
          </div>
        ) : processedData.length > 0 ? (
          <>
            <div className={styles.teacherAttendanceStatsSummary}>
              <Row gutter={24}>
                <Col xs={24} md={8}>
                  <Card className={`${styles.teacherAttendanceStatCard} ${styles.overallRate}`}>
                    <Statistic
                      title="Attendance rate"
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
                      className={styles.teacherAttendanceStatProgress}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className={`${styles.teacherAttendanceStatCard} ${styles.presentStat}`}>
                    <Statistic
                      title="Full attendance"
                      value={processedData.filter(student => student.attendanceRate === 100).length}
                      suffix={`/${processedData.length} students`}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card className={`${styles.teacherAttendanceStatCard} ${styles.absentStat}`}>
                    <Statistic
                      title="Need attention"
                      value={processedData.filter(student => student.attendanceRate < 80).length}
                      suffix={`/${processedData.length} students`}
                      valueStyle={{ color: '#cf1322' }}
                      prefix={<CloseCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            <Card
              title={
                <div className={styles.teacherAttendanceTableHeader}>
                  <Text strong>Attendance table by day</Text>
                  <Text type="secondary">
                    <CalendarOutlined /> {attendanceDates.length} days
                  </Text>
                </div>
              }
              className={styles.teacherAttendanceTableCard}
            >
              <Table
                dataSource={processedData}
                columns={columns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 'max-content' }}
                className={styles.teacherAttendanceAllTable}
                bordered
                size="middle"
              />
            </Card>
          </>
        ) : (
          <Empty description="No attendance data" />
        )}

        <div className={styles.teacherAttendanceAllFooter}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className={styles.teacherAttendanceAllBackButton}
            size="large"
          >
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TeacherAttendanceAll;
