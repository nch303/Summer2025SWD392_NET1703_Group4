import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Select, Spin, Typography, 
  Table, Tabs, Empty, Button, message, Tag, Tooltip,
  UserOutlined, TeamOutlined, CalendarOutlined,
  FileTextOutlined, DollarOutlined, CheckCircleOutlined,
  CloseCircleOutlined, BarChartOutlined, DownloadOutlined,
  TransactionOutlined, LinkOutlined,
} from '../../utils/AntComponents';
import styles from './AdminPage.module.css';
import { getDashboardData, exportDashboardToExcel, getTransactionHistory } from '../../services/AdminService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const { Title, Text } = Typography;

const AdminPage = () => {
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);

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

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setTransactionsLoading(true);
      try {
        const data = await getTransactionHistory();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        message.error('Failed to load transaction history');
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Calculate total net revenue
  const calculateNetRevenue = (data) => {
    if (!data) return 0;
    
    // Calculate total revenue from monthlyRevenueRefunds
    const totalRevenue = data.monthlyRevenueRefunds.reduce(
      (total, month) => total + month.revenue, 0
    );
    
    // Calculate total refunds
    const totalRefunds = data.totalRefunds || 
      data.monthlyRevenueRefunds.reduce((total, month) => total + month.refund, 0);
    
    // Calculate net revenue (revenue - refund)
    return totalRevenue - totalRefunds;
  };

  // Transaction columns configuration
  const transactionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 80,
      render: (text) => (
        <div className={styles.transactionNameCell}>
          <div className={styles.transactionId}>{text.substring(0, 8)}...</div>
          <div className={styles.transactionIdFull}>{text}</div>
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'name',
      key: 'name',
      ellipsis: false,
      width: '25%',
      render: (name, record) => (
        <div className={styles.transactionNameCell}>
          <div className={styles.transactionName}>{name}</div>
          <div className={styles.transactionId}>ID: {record.id}</div>
        </div>
      )
    },
    {
      title: 'Parent',
      dataIndex: 'parentName',
      key: 'parentName',
      ellipsis: true,
    },
    {
      title: 'Child',
      dataIndex: 'childrenName',
      key: 'childrenName',
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = 'default';
        let icon = null;
        
        switch(status) {
          case 'Success':
            color = 'success';
            icon = <CheckCircleOutlined />;
            break;
          case 'Failed':
            color = 'error';
            icon = <CloseCircleOutlined />;
            break;
          case 'Refunded':
            color = 'warning';
            icon = <TransactionOutlined />;
            break;
          default:
            color = 'default';
        }
        
        return <Tag color={color} icon={icon}>{status}</Tag>;
      },
      filters: [
        { text: 'Success', value: 'Success' },
        { text: 'Failed', value: 'Failed' },
        { text: 'Refunded', value: 'Refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.dashboardHeader}>
        <Title level={2}>Admin Dashboard</Title>
        <div className={styles.dashboardActions}>
          <div className={styles.yearFilter}>
            <Text>Year: </Text>
            <Select
              defaultValue={year}
              onChange={setYear}
              style={{ width: 120 }}
            >
              {availableYears().map(y => (
                <Select.Option key={y} value={y}>{y}</Select.Option>
              ))}
            </Select>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExportExcel}
            className={styles.exportBtn}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      ) : dashboardData ? (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Active Students"
                  value={dashboardData.totalActiveStudents}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#ff7e29' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Active Teachers"
                  value={dashboardData.totalActiveTeachers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#ff7e29' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Active Classes"
                  value={dashboardData.totalActiveClasses}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#ff7e29' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard}>
                <Statistic
                  title="Active Accounts"
                  value={dashboardData.totalActiveAccounts}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#ff7e29' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Revenue Cards - Split into Money In and Money Out */}
          <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} md={8}>
              <Card className={`${styles.statCard} ${styles.revenueInCard}`}>
                <Statistic
                  title="Money In (Total Revenue)"
                  value={dashboardData.monthlyRevenueRefunds.reduce((total, month) => total + month.revenue, 0)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#4caf50' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={`${styles.statCard} ${styles.revenueOutCard}`}>
                <Statistic
                  title="Money Out (Total Refunds)"
                  value={dashboardData.totalRefunds || 0}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#ff5630' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className={`${styles.statCard} ${styles.netRevenueCard}`}>
                <Statistic
                  title="Net Revenue (Revenue - Refund)"
                  value={calculateNetRevenue(dashboardData)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#4caf50' }}
                  formatter={(value) => formatCurrency(value)}
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
                    data={dashboardData.monthlyRevenueRefunds}
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
                    <RechartsTooltip
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
                    <Bar
                      dataKey="refund"
                      name="Refund"
                      fill="#ff5630"
                      radius={[5, 5, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Enrollment Application Chart */}
            <Col xs={24} lg={8}>
              <Card title={<Title level={4}><FileTextOutlined /> Enrollment Applications</Title>} className={styles.chartCard}>
                <div className={styles.pieContainer}>
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
                      <RechartsTooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.pieStats}>
                    <div className={styles.pieStatItem}>
                      <CheckCircleOutlined style={{ color: '#54d62c' }} /> Approved: {dashboardData.totalApprovedEA}
                    </div>
                    <div className={styles.pieStatItem}>
                      <CloseCircleOutlined style={{ color: '#ff5630' }} /> Rejected: {dashboardData.totalRejectedEA}
                    </div>
                    <div className={`${styles.pieStatItem} ${styles.pieStatTotal}`}>
                      <FileTextOutlined /> Total: {dashboardData.totalApprovedEA + dashboardData.totalRejectedEA}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Quarterly Revenue */}
          <Row gutter={[16, 16]} className={styles.mt16}>
            <Col xs={24}>
              <Card title={<Title level={4}><BarChartOutlined /> Revenue Analysis</Title>} className={styles.chartCard}>
                <Tabs 
                  defaultActiveKey="quarterly"
                  items={[
                    {
                      key: "quarterly",
                      label: "Quarterly Revenue",
                      children: (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={dashboardData.quarterlyRevenueRefunds}
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
                            <RechartsTooltip
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
                            <Bar
                              dataKey="refund"
                              name="Quarterly Refund"
                              fill="#ff5630"
                              radius={[5, 5, 0, 0]}
                              barSize={40}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )
                    },
                    {
                      key: "yearly",
                      label: "Yearly Revenue",
                      children: (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={dashboardData.yearlyRevenue.map(item => ({
                              ...item,
                              refund: dashboardData.totalRefunds
                            }))}
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
                            <RechartsTooltip
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
                            <Bar
                              dataKey="refund"
                              name="Yearly Refund"
                              fill="#ff5630"
                              radius={[5, 5, 0, 0]}
                              barSize={60}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      )
                    }
                  ]}
                />
              </Card>
            </Col>
          </Row>
          
          {/* Transaction History Section */}
          <Row gutter={[16, 16]} className={styles.mt16}>
            <Col xs={24}>
              <Card 
                title={<Title level={4}><TransactionOutlined /> Transaction History</Title>}
                className={styles.transactionCard}
                extra={
                  <div className={styles.transactionSummary}>
                    <div className={styles.transactionStat}>
                      <Tag color="success" icon={<CheckCircleOutlined />}>Success: {transactions.filter(t => t.status === 'Success').length}</Tag>
                    </div>
                    <div className={styles.transactionStat}>
                      <Tag color="error" icon={<CloseCircleOutlined />}>Failed: {transactions.filter(t => t.status === 'Failed').length}</Tag>
                    </div>
                    <div className={styles.transactionStat}>
                      <Tag color="warning" icon={<TransactionOutlined />}>Refunded: {transactions.filter(t => t.status === 'Refunded').length}</Tag>
                    </div>
                  </div>
                }
              >
                <Table 
                  dataSource={transactions} 
                  columns={transactionColumns}
                  rowKey="id"
                  loading={transactionsLoading}
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Total ${total} transactions`
                  }}
                  scroll={{ x: 'max-content' }}
                  className={styles.transactionTable}
                />
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
