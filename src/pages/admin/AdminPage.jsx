import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Select, Spin, Typography, Table, Tabs, Empty, Button, message
} from 'antd';
import { 
  UserOutlined, TeamOutlined, CalendarOutlined, 
  FileTextOutlined, DollarOutlined, CheckCircleOutlined,
  CloseCircleOutlined, BarChartOutlined, DownloadOutlined
} from '@ant-design/icons';
import './AdminPage.css';
import { getDashboardData, exportDashboardToExcel } from './AdminDashboardService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Colors for charts
const COLORS = ['#4a6cf7', '#54d62c', '#ffab00', '#ff5630', '#a46bf5'];

const AdminPage = () => {
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(null);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await getDashboardData(year);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [year]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage for pie chart labels
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Generate available years for the filter
  const availableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    
    return years;
  };
  
  // Prepare data for enrollment applications pie chart
  const prepareEAData = () => {
    if (!dashboardData) return [];
    
    return [
      { name: 'Approved', value: dashboardData.totalApprovedEA },
      { name: 'Rejected', value: dashboardData.totalRejectedEA },
    ];
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportDashboardToExcel(year);
      message.success(`Dashboard data for ${year} exported successfully`);
    } catch (error) {
      message.error('Failed to export dashboard data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Admin Dashboard</Title>
        <div className="dashboard-actions">
          <div className="year-filter">
            <Text>Year: </Text>
            <Select 
              defaultValue={year} 
              onChange={setYear}
              style={{ width: 120 }}
            >
              {availableYears().map(y => (
                <Option key={y} value={y}>{y}</Option>
              ))}
            </Select>
          </div>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExportExcel}
            className="export-btn"
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : dashboardData ? (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Active Students" 
                  value={dashboardData.totalActiveStudents} 
                  prefix={<TeamOutlined />} 
                  valueStyle={{ color: '#ff7e29' }} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Active Teachers" 
                  value={dashboardData.totalActiveTeachers} 
                  prefix={<UserOutlined />} 
                  valueStyle={{ color: '#ff7e29' }} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Active Classes" 
                  value={dashboardData.totalActiveClasses} 
                  prefix={<CalendarOutlined />} 
                  valueStyle={{ color: '#ff7e29' }} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card">
                <Statistic 
                  title="Active Accounts" 
                  value={dashboardData.totalActiveAccounts} 
                  prefix={<UserOutlined />} 
                  valueStyle={{ color: '#ff7e29' }} 
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Revenue Chart */}
            <Col xs={24} lg={16}>
              <Card title={<Title level={4}><DollarOutlined /> {year} Monthly Revenue</Title>} className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dashboardData.monthlyRevenue}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickFormatter={(value) => new Date(0, value - 1).toLocaleString('default', { month: 'short' })} />
                    <YAxis 
                      tickFormatter={(value) => value >= 1000000 
                        ? `${(value / 1000000).toFixed(0)}M` 
                        : value >= 1000 
                          ? `${(value / 1000).toFixed(0)}K` 
                          : value
                      } 
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => new Date(0, label - 1).toLocaleString('default', { month: 'long' })}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill="#4a6cf7" 
                      radius={[5, 5, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Enrollment Application Chart */}
            <Col xs={24} lg={8}>
              <Card title={<Title level={4}><FileTextOutlined /> Enrollment Applications</Title>} className="chart-card">
                <div className="pie-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={prepareEAData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                      >
                        <Cell key="approved" fill="#54d62c" />
                        <Cell key="rejected" fill="#ff5630" />
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-stats">
                    <div className="pie-stat-item">
                      <CheckCircleOutlined style={{ color: '#54d62c' }} /> Approved: {dashboardData.totalApprovedEA}
                    </div>
                    <div className="pie-stat-item">
                      <CloseCircleOutlined style={{ color: '#ff5630' }} /> Rejected: {dashboardData.totalRejectedEA}
                    </div>
                    <div className="pie-stat-item pie-stat-total">
                      <FileTextOutlined /> Total: {dashboardData.totalApprovedEA + dashboardData.totalRejectedEA}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quarterly Revenue */}
          <Row gutter={[16, 16]} className="mt-16">
            <Col xs={24}>
              <Card title={<Title level={4}><BarChartOutlined /> Revenue Analysis</Title>} className="chart-card">
                <Tabs defaultActiveKey="quarterly">
                  <TabPane tab="Quarterly Revenue" key="quarterly">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={dashboardData.quarterlyRevenue}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" tickFormatter={(value) => `Q${value}`} />
                        <YAxis 
                          tickFormatter={(value) => value >= 1000000 
                            ? `${(value / 1000000).toFixed(0)}M` 
                            : value >= 1000 
                              ? `${(value / 1000).toFixed(0)}K` 
                              : value
                          } 
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          labelFormatter={(label) => `Quarter ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="revenue" 
                          name="Quarterly Revenue" 
                          fill="#a46bf5"
                          radius={[5, 5, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabPane>
                  <TabPane tab="Yearly Revenue" key="yearly">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={dashboardData.yearlyRevenue}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis 
                          tickFormatter={(value) => value >= 1000000 
                            ? `${(value / 1000000).toFixed(0)}M` 
                            : value >= 1000 
                              ? `${(value / 1000).toFixed(0)}K` 
                              : value
                          } 
                        />
                        <Tooltip 
                          formatter={(value) => formatCurrency(value)}
                          labelFormatter={(label) => `Year ${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="revenue" 
                          name="Yearly Revenue" 
                          fill="#ffab00"
                          radius={[5, 5, 0, 0]}
                          barSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabPane>
                </Tabs>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Empty description="No data available for the selected year" />
      )}
    </div>
  );
};

export default AdminPage;
