import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, Row, Col, Statistic, Table, Calendar, Badge,
  Tabs, Tag, Space, Button, Progress, List, Avatar, Select
} from 'antd';
import { 
  TeamOutlined, BookOutlined, CalendarOutlined,
  ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined,
  BellOutlined, StarOutlined, EyeOutlined, PlusOutlined
} from '@ant-design/icons';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for classes
  const myClasses = [
    { id: 1, name: 'Sunshine Class', age: '3-4 years', students: 18, room: 'Room A', time: '8:30 AM - 11:30 AM' },
    { id: 2, name: 'Rainbow Class', age: '4-5 years', students: 20, room: 'Room B', time: '12:30 PM - 3:30 PM' },
    { id: 3, name: 'Stars Class', age: '5-6 years', students: 15, room: 'Room C', time: '8:30 AM - 11:30 AM' },
  ];

  // Mock data for teaching programs
  const teachingPrograms = [
    { id: 1, name: 'Early Literacy', description: 'Basic reading and writing skills', progress: 65, deadline: '2024-08-15' },
    { id: 2, name: 'Number Concepts', description: 'Introduction to counting and numbers', progress: 80, deadline: '2024-08-10' },
    { id: 3, name: 'Social Skills', description: 'Group activities and sharing', progress: 45, deadline: '2024-08-20' },
    { id: 4, name: 'Creative Arts', description: 'Drawing and crafts activities', progress: 30, deadline: '2024-08-25' },
  ];

  // Mock data for upcoming schedule
  const upcomingSchedule = [
    { id: 1, title: 'Morning Circle', time: '08:30 - 09:00', class: 'Sunshine Class', room: 'Room A' },
    { id: 2, title: 'Literacy Time', time: '09:00 - 10:00', class: 'Sunshine Class', room: 'Room A' },
    { id: 3, title: 'Snack Break', time: '10:00 - 10:30', class: 'Sunshine Class', room: 'Cafeteria' },
    { id: 4, title: 'Math Activities', time: '10:30 - 11:30', class: 'Sunshine Class', room: 'Room A' },
    { id: 5, title: 'Lunch Break', time: '11:30 - 12:30', class: '', room: 'Cafeteria' },
    { id: 6, title: 'Circle Time', time: '12:30 - 13:00', class: 'Rainbow Class', room: 'Room B' },
    { id: 7, title: 'Art and Craft', time: '13:00 - 14:00', class: 'Rainbow Class', room: 'Room B' },
    { id: 8, title: 'Outdoor Play', time: '14:00 - 14:30', class: 'Rainbow Class', room: 'Playground' },
    { id: 9, title: 'Story Time', time: '14:30 - 15:30', class: 'Rainbow Class', room: 'Room B' },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    { id: 1, title: 'Parent-Teacher Meeting', date: 'August 12, 2024', type: 'Meeting' },
    { id: 2, title: 'Summer Festival', date: 'August 15, 2024', type: 'School Event' },
    { id: 3, title: 'Professional Development Day', date: 'August 18, 2024', type: 'Training' },
  ];

  // Mock data for recent notifications
  const recentNotifications = [
    { id: 1, title: 'New student added to Rainbow Class', time: '2 hours ago', read: false },
    { id: 2, title: 'Curriculum update for Number Concepts', time: '1 day ago', read: true },
    { id: 3, title: 'Staff meeting scheduled for Friday', time: '2 days ago', read: true },
  ];

  const getListItemClass = (className) => {
    switch (className) {
      case 'Sunshine Class': return 'sunshine-class';
      case 'Rainbow Class': return 'rainbow-class';
      case 'Stars Class': return 'stars-class';
      default: return '';
    }
  };

  // Updated to use cellRender instead of dateCellRender
  const cellRender = (value) => {
    // Lấy ngày, tháng hiện tại để kiểm tra ngày trong tháng hay ngoài tháng
    const currentMonth = value.month();
    const currentDate = value.date();
    
    // Danh sách sự kiện của ngày đó
    let events = [];
    
    // Thêm các sự kiện giả lập vào một số ngày
    if (currentDate === 12) events.push({ type: 'meeting', content: 'Parent Meeting' });
    if (currentDate === 15) events.push({ type: 'event', content: 'School Festival' });
    if (currentDate === 18) events.push({ type: 'training', content: 'Training Day' });
    if (currentDate === 20) events.push({ type: 'deadline', content: 'Reports Due' });

    // Thêm sự kiện cho phần mở rộng lịch
    if (currentDate === 1 && currentMonth === 7) events.push({ type: 'meeting', content: 'Parent Meeting' });
    
    return (
      <div className="calendar-cell">
        {events.length > 0 && (
          <div className="calendar-events">
            {events.map((event, index) => (
              <div 
                key={`event-${currentDate}-${index}`} 
                className={`calendar-event calendar-event-${event.type}`}
              >
                <span 
                  className="event-dot"
                  style={{ 
                    backgroundColor: event.type === 'meeting' ? '#1890ff' : 
                                    event.type === 'event' ? '#52c41a' : 
                                    event.type === 'training' ? '#faad14' : '#f5222d' 
                  }}
                />
                <span className="event-text">{event.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2>Teacher Dashboard</h2>
          <div className="dashboard-breadcrumb">
            <Link to="/">Home</Link> / <span>Teacher Dashboard</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          My Classes
        </button>
        <button 
          className={`tab-button ${activeTab === 'programs' ? 'active' : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          Teaching Programs
        </button>
        <button 
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
      </div>
      
      {activeTab === 'overview' && (
        <>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <div className="card-icon icon-blue">
                <TeamOutlined />
              </div>
              <div className="card-info">
                <h3>53</h3>
                <p>Total Students</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon icon-green">
                <BookOutlined />
              </div>
              <div className="card-info">
                <h3>3</h3>
                <p>Classes</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon icon-orange">
                <FileTextOutlined />
              </div>
              <div className="card-info">
                <h3>4</h3>
                <p>Programs</p>
              </div>
            </div>
            
            <div className="dashboard-card">
              <div className="card-icon icon-purple">
                <CalendarOutlined />
              </div>
              <div className="card-info">
                <h3>9</h3>
                <p>Today's Activities</p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-widgets">
            <div className="widget widget-today-schedule">
              <div className="widget-header">
                <h3>Today's Schedule</h3>
                <div className="widget-actions">
                  <Link to="/teacher/schedule" className="view-all-btn">Full Schedule</Link>
                </div>
              </div>
              <div className="today-schedule">
                <List
                  itemLayout="horizontal"
                  dataSource={upcomingSchedule}
                  renderItem={(item) => (
                    <List.Item key={item.id} className={getListItemClass(item.class)}>
                      <List.Item.Meta
                        avatar={<ClockCircleOutlined />}
                        title={<span>{item.title}</span>}
                        description={
                          <div className="schedule-details">
                            <span className="schedule-time">{item.time}</span>
                            <span className="schedule-location">{item.room}</span>
                            {item.class && <span className="schedule-class">{item.class}</span>}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="dashboard-bottom-widgets">
            <div className="widget widget-programs">
              <div className="widget-header">
                <h3>Teaching Programs</h3>
                <div className="widget-actions">
                  <Link to="/teacher/programs" className="view-all-btn">View All</Link>
                </div>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={teachingPrograms}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={<span>{item.name}</span>}
                      description={
                        <div>
                          <p className="program-description">{item.description}</p>
                          <div className="program-progress">
                            <Progress percent={item.progress} size="small" />
                            <div className="program-deadline">
                              <ClockCircleOutlined /> Due: {item.deadline}
                            </div>
                          </div>
                        </div>
                      }
                    />
                    <Button type="primary" size="small" icon={<EyeOutlined />}>
                      Open
                    </Button>
                  </List.Item>
                )}
              />
            </div>
            
            <div className="widget widget-notifications">
              <div className="widget-header">
                <h3>Notifications</h3>
                <div className="widget-actions">
                  <Link to="/teacher/notifications" className="view-all-btn">View All</Link>
                </div>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={recentNotifications}
                renderItem={(item) => (
                  <List.Item key={item.id} className={!item.read ? 'notification-unread' : ''}>
                    <List.Item.Meta
                      avatar={<BellOutlined className="notification-icon" />}
                      title={<span>{item.title}</span>}
                      description={<span className="notification-time">{item.time}</span>}
                    />
                    {!item.read && <Badge status="processing" />}
                  </List.Item>
                )}
              />
            </div>
            
            <div className="widget widget-events">
              <div className="widget-header">
                <h3>Upcoming Events</h3>
              </div>
              <List
                itemLayout="horizontal"
                dataSource={upcomingEvents}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={<CalendarOutlined className="event-icon" />}
                      title={<span>{item.title}</span>}
                      description={
                        <div className="event-details">
                          <span className="event-date">{item.date}</span>
                          <Tag
                            color={
                              item.type === 'Meeting' ? 'blue' :
                              item.type === 'School Event' ? 'green' : 'orange'
                            }
                          >
                            {item.type}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'classes' && (
        <div className="classes-section">
          <div className="section-header">
            <h3>My Classes</h3>
          </div>
          
          <div className="class-cards">
            {myClasses.map(classItem => (
              <Card key={classItem.id} className="class-card">
                <div className="class-header">
                  <h4>{classItem.name}</h4>
                  <Tag color="blue">{classItem.age}</Tag>
                </div>
                <div className="class-details">
                  <div className="detail-item">
                    <TeamOutlined />
                    <span>{classItem.students} Students</span>
                  </div>
                  <div className="detail-item">
                    <CalendarOutlined />
                    <span>{classItem.time}</span>
                  </div>
                  <div className="detail-item">
                    <BookOutlined />
                    <span>{classItem.room}</span>
                  </div>
                </div>
                <div className="class-actions">
                  <Button type="primary">View Details</Button>
                  <Button>Attendance</Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="student-section">
            <div className="section-header">
              <h3>Students Overview</h3>
            </div>
            
            <Table
              dataSource={[
                { key: '1', name: 'Alex Brown', age: 4, class: 'Sunshine Class', attendance: 95 },
                { key: '2', name: 'Sophia Wang', age: 4, class: 'Sunshine Class', attendance: 88 },
                { key: '3', name: 'Daniel Lee', age: 5, class: 'Rainbow Class', attendance: 92 },
                { key: '4', name: 'Olivia Garcia', age: 5, class: 'Rainbow Class', attendance: 90 },
                { key: '5', name: 'Mason Wilson', age: 6, class: 'Stars Class', attendance: 85 },
              ]}
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Age',
                  dataIndex: 'age',
                  key: 'age',
                },
                {
                  title: 'Class',
                  dataIndex: 'class',
                  key: 'class',
                  render: (text) => {
                    const color = text === 'Sunshine Class' ? 'gold' : 
                                 text === 'Rainbow Class' ? 'cyan' : 'purple';
                    return <Tag color={color}>{text}</Tag>;
                  }
                },
                {
                  title: 'Attendance',
                  dataIndex: 'attendance',
                  key: 'attendance',
                  render: (attendance) => (
                    <Progress percent={attendance} size="small" status={
                      attendance >= 90 ? "success" : attendance >= 80 ? "normal" : "exception"
                    } />
                  )
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: () => (
                    <Space size="small">
                      <Button type="text" icon={<EyeOutlined />}>Profile</Button>
                    </Space>
                  )
                },
              ]}
            />
          </div>
        </div>
      )}
      
      {activeTab === 'programs' && (
        <div className="programs-section">
          <div className="section-header">
            <h3>Teaching Programs</h3>
          </div>
          
          <Row gutter={[24, 24]}>
            {teachingPrograms.map(program => (
              <Col key={program.id} xs={24} md={12}>
                <Card className="program-card">
                  <div className="program-header">
                    <h4>{program.name}</h4>
                    <Tag color={program.progress >= 75 ? "success" : program.progress >= 50 ? "processing" : "warning"}>
                      {program.progress}% Complete
                    </Tag>
                  </div>
                  <div className="program-body">
                    <p>{program.description}</p>
                    <Progress percent={program.progress} />
                    <div className="program-deadline">
                      <ClockCircleOutlined /> Deadline: {program.deadline}
                    </div>
                  </div>
                  <div className="program-actions">
                    <Button type="primary">View Content</Button>
                    <Button>Update Progress</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="resources-section">
            <div className="section-header">
              <h3>Teaching Resources</h3>
            </div>
            
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <Card className="resource-card">
                  <div className="resource-icon">
                    <BookOutlined />
                  </div>
                  <div className="resource-content">
                    <h4>Early Literacy Materials</h4>
                    <p>Flashcards, workbooks, and activity sheets for teaching literacy.</p>
                    <Button type="primary">Access Materials</Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="resource-card">
                  <div className="resource-icon">
                    <FileTextOutlined />
                  </div>
                  <div className="resource-content">
                    <h4>Mathematics Resources</h4>
                    <p>Number cards, counting activities, and math games.</p>
                    <Button type="primary">Access Materials</Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card className="resource-card">
                  <div className="resource-icon">
                    <TeamOutlined />
                  </div>
                  <div className="resource-content">
                    <h4>Social Skills Activities</h4>
                    <p>Group games, sharing activities, and cooperation exercises.</p>
                    <Button type="primary">Access Materials</Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      )}
      
      {activeTab === 'schedule' && (
        <div className="schedule-section">
          <div className="section-header">
            <h3>My Schedule</h3>
            <div className="schedule-actions">
              <Button type="primary" icon={<PlusOutlined />}>Add Event</Button>
              <Select defaultValue="month" style={{ width: 120, marginLeft: 16 }}>
                <Select.Option value="month">Month</Select.Option>
                <Select.Option value="week">Week</Select.Option>
                <Select.Option value="day">Day</Select.Option>
              </Select>
            </div>
          </div>
          
          <div className="schedule-calendar">
            <Calendar 
              cellRender={cellRender}
              headerRender={({ value, type, onChange, onTypeChange }) => {
                const current = value.clone();
                const localeData = value.localeData();
                const months = [];
                for (let i = 0; i < 12; i++) {
                  current.month(i);
                  months.push(localeData.monthsShort(current));
                }
                
                return (
                  <div className="calendar-header">
                    <Button 
                      type="text" 
                      onClick={() => {
                        const newValue = value.clone().subtract(1, 'month');
                        onChange(newValue);
                      }}
                    >
                      &lt;
                    </Button>
                    <Select
                      value={String(value.month())}
                      onChange={(selectedMonth) => {
                        const newValue = value.clone();
                        newValue.month(parseInt(selectedMonth, 10));
                        onChange(newValue);
                      }}
                      style={{ marginRight: 8, width: 100 }}
                    >
                      {months.map((month, index) => (
                        <Select.Option key={`${index}`} value={`${index}`}>
                          {month}
                        </Select.Option>
                      ))}
                    </Select>
                    <Select
                      value={String(value.year())}
                      onChange={(year) => {
                        const newValue = value.clone();
                        newValue.year(parseInt(year, 10));
                        onChange(newValue);
                      }}
                      style={{ width: 80 }}
                    >
                      {[...Array(10)].map((_, index) => {
                        const year = value.year() - 5 + index;
                        return (
                          <Select.Option key={year} value={String(year)}>
                            {year}
                          </Select.Option>
                        );
                      })}
                    </Select>
                    <Button 
                      type="text" 
                      onClick={() => {
                        const newValue = value.clone().add(1, 'month');
                        onChange(newValue);
                      }}
                    >
                      &gt;
                    </Button>
                  </div>
                );
              }}
            />
          </div>
          
          <div className="upcoming-events">
            <div className="section-header">
              <h3>Upcoming Events</h3>
            </div>
            <List
              itemLayout="horizontal"
              dataSource={upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date))}
              renderItem={(item) => (
                <List.Item key={item.id} className="event-item">
                  <div className="event-date-badge">
                    <div className="date-month">
                      {new Date(item.date).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div className="date-day">
                      {new Date(item.date).getDate()}
                    </div>
                  </div>
                  <List.Item.Meta
                    title={<span>{item.title}</span>}
                    description={
                      <div className="event-details">
                        <div className="event-time">
                          <ClockCircleOutlined /> {item.date}
                        </div>
                        <Tag
                          color={
                            item.type === 'Meeting' ? 'blue' :
                            item.type === 'School Event' ? 'green' : 'orange'
                          }
                        >
                          {item.type}
                        </Tag>
                      </div>
                    }
                  />
                  <div>
                    <Button type="text" icon={<EyeOutlined />}>Details</Button>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
