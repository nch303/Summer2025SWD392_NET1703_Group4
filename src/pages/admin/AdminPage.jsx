import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Button, Table, Calendar, Badge, 
  Input, Select, DatePicker, message, Space
} from 'antd';
import { 
  UserOutlined, TeamOutlined, CalendarOutlined, 
  FileTextOutlined
} from '@ant-design/icons';
import './AdminPage.css';
import dayjs from 'dayjs';
import api from '../../config/axiosConfig';

// Mock data for dashboard
const stats = {
  totalStudents: 150,
  totalTeachers: 20,
  totalClasses: 8,
  totalActivities: 15
};

// Mock data for activities
const activities = [
  { id: 1, name: 'Art Class', teacher: 'Ms. Davis', participants: 15, schedule: 'Mon 2PM-3PM' },
  { id: 2, name: 'Music Class', teacher: 'Mr. Wilson', participants: 12, schedule: 'Wed 2PM-3PM' },
  // Add more mock activities...
];

// Mock data for news
const news = [
  { id: 1, title: 'Summer Program Registration', content: 'Registration for summer programs...', date: '2024-06-01' },
  { id: 2, title: 'Parent-Teacher Meeting', content: 'Annual parent-teacher meeting...', date: '2024-06-15' },
  // Add more mock news...
];

const AdminPage = () => {
  return (
    <div className="admin-dashboard">
      <div>
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Students" value={stats.totalStudents} prefix={<TeamOutlined />} valueStyle={{ color: '#ff7e29' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Teachers" value={stats.totalTeachers} prefix={<UserOutlined />} valueStyle={{ color: '#ff7e29' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Classes" value={stats.totalClasses} prefix={<CalendarOutlined />} valueStyle={{ color: '#ff7e29' }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic title="Total Activities" value={stats.totalActivities} prefix={<FileTextOutlined />} valueStyle={{ color: '#ff7e29' }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="Recent Activities" className="activity-card">
              <Table 
                dataSource={activities.slice(0, 5)} 
                columns={[
                  { title: 'Activity', dataIndex: 'name' },
                  { title: 'Teacher', dataIndex: 'teacher' },
                  { title: 'Schedule', dataIndex: 'schedule' },
                ]}
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Upcoming Events" className="activity-card">
              <Calendar 
                fullscreen={false} 
                dateCellRender={(date) => {
                  const dateStr = date.format('YYYY-MM-DD');
                  const events = news.filter(n => n.date === dateStr);
                  return (
                    <ul className="events">
                      {events.map(event => (
                        <li key={event.id}>
                          <Badge color="#ff914d" text={event.title} />
                        </li>
                      ))}
                    </ul>
                  );
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminPage;
