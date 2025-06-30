import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Statistic, Table, Calendar, Badge, Spin,
  Tabs, Tag, Space, Button, Progress, List, Avatar, Select,
  Tooltip, Alert
} from 'antd';
import {
  TeamOutlined, BookOutlined, CalendarOutlined,
  ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined,
  BellOutlined, StarOutlined, EyeOutlined, PlusOutlined,
  LineChartOutlined, PieChartOutlined, BarChartOutlined,
  CheckOutlined, CloseOutlined, FileOutlined, SettingOutlined
} from '@ant-design/icons';
import { UserContext } from '../../contexts/UserContext';
import { getClassesByTeacherId, getStatusColor } from './TeacherClassService';
import { getAllSyllabi } from './TeacherSyllabusService';
import { getStudentsByClassId } from './TeacherStudentClassService';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import './TeacherDashboard.css';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const TeacherDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0 });
  const [syllabi, setSyllabi] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [genderDistribution, setGenderDistribution] = useState({ male: 0, female: 0 });

  // Load data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (!user || !user.id) {
          console.error("User ID not available");
          return;
        }

        setLoading(true);

        // Fetch classes taught by the teacher
        const classesData = await getClassesByTeacherId(user.id);
        setTeacherClasses(classesData);

        // Fetch syllabi
        const syllabiData = await getAllSyllabi();
        setSyllabi(syllabiData);

        // Calculate total students and fetch student details for each class
        let studentsCount = 0;
        let maleCount = 0;
        let femaleCount = 0;
        const studentsByClassMap = {};

        for (const classItem of classesData) {
          const studentsData = await getStudentsByClassId(classItem.id);
          studentsByClassMap[classItem.id] = studentsData;
          studentsCount += studentsData.length;

          // Calculate gender distribution
          studentsData.forEach(student => {
            if (student.gender === 'Male') maleCount++;
            else if (student.gender === 'Female') femaleCount++;
          });
        }

        setTotalStudents(studentsCount);
        setStudentsByClass(studentsByClassMap);
        setGenderDistribution({ male: maleCount, female: femaleCount });

        // Mock attendance data (would be replaced by actual API call)
        setAttendanceStats({
          present: Math.floor(studentsCount * 0.85),
          absent: Math.floor(studentsCount * 0.10),
          late: Math.floor(studentsCount * 0.05)
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Chart data
  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent, attendanceStats.late],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
        borderWidth: 1,
      },
    ],
  };

  const genderChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [genderDistribution.male, genderDistribution.female],
        backgroundColor: ['#2196f3', '#e91e63'],
        borderWidth: 1,
      },
    ],
  };

  const weeklyProgressData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    datasets: [
      {
        label: 'Assignments Completed',
        data: [12, 15, 10, 14, 16],
        borderColor: '#4a6cf7',
        backgroundColor: 'rgba(74, 108, 247, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const studentPerformanceData = {
    labels: ['A', 'B', 'C', 'D', 'Needs Improvement'],
    datasets: [
      {
        label: 'Student Performance',
        data: [15, 20, 10, 5, 3],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  const classDataBySize = {
    labels: teacherClasses.map(cls => cls.name || `Class ${cls.id}`),
    datasets: [
      {
        label: 'Students per Class',
        data: teacherClasses.map(cls => {
          return studentsByClass[cls.id]?.length || 0;
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  // Today's date for calendar
  const today = new Date();

  // Quick access items
  const quickAccessItems = [
    {
      title: 'Attendance',
      icon: <CheckCircleOutlined />,
      color: '#4caf50',
      path: '/teacher/attendance',
      description: 'Take class attendance'
    },
    {
      title: 'My Classes',
      icon: <TeamOutlined />,
      color: '#2196f3',
      path: '/teacher/classes',
      description: 'View your class details'
    },
    {
      title: 'Syllabus',
      icon: <BookOutlined />,
      color: '#9c27b0',
      path: '/teacher/syllabus',
      description: 'Access teaching materials'
    },
    {
      title: 'Schedule',
      icon: <CalendarOutlined />,
      color: '#ff9800',
      path: '#',
      description: 'View your timetable'
    },
    {
      title: 'Reports',
      icon: <FileOutlined />,
      color: '#795548',
      path: '#',
      description: 'Generate reports'
    },
    {
      title: 'Settings',
      icon: <SettingOutlined />,
      color: '#607d8b',
      path: '/teacher/settings',
      description: 'Update preferences'
    },
  ];

  // Mock data for today's schedule
  const todaySchedule = [
    { id: 1, title: 'Morning Circle', time: '08:30 - 09:00', class: 'Sunshine Class', room: 'Room A' },
    { id: 2, title: 'Literacy Time', time: '09:00 - 10:00', class: 'Sunshine Class', room: 'Room A' },
    { id: 3, title: 'Snack Break', time: '10:00 - 10:30', class: 'Sunshine Class', room: 'Cafeteria' },
    { id: 4, title: 'Math Activities', time: '10:30 - 11:30', class: 'Sunshine Class', room: 'Room A' },
  ];

  // Helper function to get class for schedule items
  const getListItemClass = (className) => {
    switch (className) {
      case 'Sunshine Class': return 'sunshine-class';
      case 'Rainbow Class': return 'rainbow-class';
      case 'Stars Class': return 'stars-class';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2>Teacher Dashboard</h2>
        </div>
      </div>

      {!user && (
        <Alert
          message="Authentication Required"
          description="Please log in to access your dashboard."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Stats Overview */}
      <div className="dashboard-stats-cards">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="My Classes"
                value={teacherClasses.length}
                prefix={<BookOutlined className="stat-icon blue" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Total Students"
                value={totalStudents}
                prefix={<TeamOutlined className="stat-icon green" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Attendance Rate"
                value={totalStudents ? Math.round((attendanceStats.present / totalStudents) * 100) : 0}
                suffix="%"
                prefix={<CheckCircleOutlined className="stat-icon orange" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="Active Programs"
                value={syllabi.length || 0}
                prefix={<FileTextOutlined className="stat-icon purple" />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Quick Access Section */}
      <h3 className="section-title">Quick Access</h3>
      <div className="quick-access-section">
        <Row gutter={[16, 16]}>
          {quickAccessItems.map((item, index) => (
            <Col xs={12} sm={8} md={4} key={index}>
              <Link to={item.path}>
                <Card className="quick-access-card" hoverable>
                  <div className="quick-icon" style={{ backgroundColor: item.color }}>
                    {item.icon}
                  </div>
                  <div className="quick-title">{item.title}</div>
                  <div className="quick-description">{item.description}</div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

      {/* Charts & Analytics Section */}
      <h3 className="section-title">Analytics & Insights</h3>
      <Row gutter={[24, 24]} className="charts-section">
        <Col xs={24} md={12} lg={8}>
          <Card title="Today's Attendance" className="chart-card">
            <div className="chart-container">
              <Pie data={attendanceChartData} />
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#4caf50' }}></span>
                <span>Present: {attendanceStats.present} students</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f44336' }}></span>
                <span>Absent: {attendanceStats.absent} students</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ff9800' }}></span>
                <span>Late: {attendanceStats.late} students</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Gender Distribution" className="chart-card">
            <div className="chart-container">
              <Pie data={genderChartData} />
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#2196f3' }}></span>
                <span>Male: {genderDistribution.male} students</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#e91e63' }}></span>
                <span>Female: {genderDistribution.female} students</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Weekly Progress" className="chart-card">
            <div className="chart-container">
              <Line
                data={weeklyProgressData}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="charts-section">
        <Col xs={24} md={12}>
          <Card title="Students Per Class" className="chart-card">
            <div className="chart-container">
              <Bar
                data={classDataBySize}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="My Classes" className="classes-card">
            <List
              itemLayout="horizontal"
              dataSource={teacherClasses}
              renderItem={(classItem) => (
                <List.Item key={classItem.id} className="class-list-item">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: classItem.name?.includes('Sunshine') ? '#ffcc00' :
                            classItem.name?.includes('Rainbow') ? '#00bcd4' : '#9c27b0'
                        }}
                      >
                        {classItem.name?.charAt(0) || 'C'}
                      </Avatar>
                    }
                    title={<span>{classItem.name || `Class ${classItem.id}`}</span>}
                    description={
                      <div className="class-item-details">
                        <span>
                          <TeamOutlined /> {studentsByClass[classItem.id]?.length || 0} students
                        </span>
                        {classItem.room && (
                          <span>
                            <BookOutlined /> {classItem.room}
                          </span>
                        )}
                        {classItem.time && (
                          <span>
                            <ClockCircleOutlined /> {classItem.time}
                          </span>
                        )}
                      </div>
                    }
                  />
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/teacher/classes/${classItem.id}`)}
                  >
                    View Class
                  </Button>
                </List.Item>
              )}
            />
            <div className="view-all-link">
              <Link to="/teacher/classes">Manage Classes</Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Activities Section */}
      <Row gutter={[24, 24]} className="upcoming-section">
        <Col xs={24}>
          <Card title="Teaching Program Progress" className="programs-card">
            {syllabi.length > 0 ? (
              <Row gutter={[16, 16]}>
                {syllabi.slice(0, 4).map((program) => (
                  <Col xs={24} sm={12} md={6} key={program.id}>
                    <Card className="program-progress-card">
                      <h4>{program.title || program.name || `Program ${program.id}`}</h4>
                      <Progress
                        percent={program.progress || Math.floor(Math.random() * 100)}
                        status={program.status === 'Completed' ? 'success' : 'active'}
                      />
                      <div className="program-details">
                        <span>{program.description || 'Teaching program for students'}</span>
                        {program.deadline && (
                          <div className="program-deadline">
                            <ClockCircleOutlined /> Deadline: {program.deadline}
                          </div>
                        )}
                      </div>
                      <Button type="link" onClick={() => navigate(`/teacher/syllabus/${program.id}`)}>
                        View Content
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="empty-state">
                <p>No active teaching programs found.</p>
                <Button type="primary">Browse Programs</Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard;
