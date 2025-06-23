import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Calendar, Badge
} from 'antd';
import { 
  UserOutlined, TeamOutlined, CalendarOutlined, 
  FileTextOutlined
} from '@ant-design/icons';
import './AdminPage.css';
import api from '../../config/axiosConfig';

// Mock data for dashboard
const stats = {
  totalStudents: 150,
  totalTeachers: 20,
  totalClasses: 8,
  totalActivities: 15
};

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
                dataSource={[]} 
                columns={[
                  { title: 'Activity', dataIndex: 'name' },
                  { title: 'Teacher', dataIndex: 'teacher' },
                  { title: 'Schedule', dataIndex: 'schedule' },
                ]}
                pagination={false}
                locale={{ emptyText: 'No activities available' }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Upcoming Events" className="activity-card">
              <Calendar 
                fullscreen={false}
                dateCellRender={() => null}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminPage;
