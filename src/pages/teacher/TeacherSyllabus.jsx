import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Typography, Input, Button, Space, Tag, 
  Tooltip, Empty, Spin, Tabs, Row, Col, Avatar, Dropdown, 
  Modal, Drawer, Descriptions, Divider
} from 'antd';
import { 
  SearchOutlined, FileTextOutlined, BookOutlined, 
  DownloadOutlined, EyeOutlined, FilterOutlined,
  SortAscendingOutlined, PlusOutlined, FilePdfOutlined,
  BookFilled, ReadOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { getAllSyllabi } from './TeacherSyllabusService';
import './TeacherSyllabus.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const TeacherSyllabus = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [filteredSyllabi, setFilteredSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchSyllabi = async () => {
      try {
        setLoading(true);
        const data = await getAllSyllabi();
        setSyllabi(data);
        setFilteredSyllabi(data);
      } catch (error) {
        console.error('Failed to fetch syllabi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabi();
  }, []);

  const handleSearch = (value) => {
    setSearchValue(value);
    const filtered = syllabi.filter(syllabus => 
      syllabus.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSyllabi(filtered);
  };

  const showSyllabusDetail = (syllabus) => {
    setSelectedSyllabus(syllabus);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedSyllabus(null);
  };

  // Mô phỏng dữ liệu giáo trình đã gán
  const assignedSyllabi = [
    { id: 3, name: "học học nữa học máu", className: "Lớp Chồi", status: "Đang dạy", progress: 75 },
    { id: 2, name: "học ăn học nói học gói mang về", className: "Lớp Mầm", status: "Sắp dạy", progress: 0 }
  ];

  // Giả lập dữ liệu chi tiết giáo trình
  const syllabusDetailData = {
    id: 3,
    name: "học học nữa học máu",
    description: "Giáo trình dành cho trẻ từ 3-4 tuổi, tập trung vào phát triển kỹ năng ngôn ngữ và tư duy logic.",
    ageGroup: "3-4 tuổi",
    duration: "12 tuần",
    author: "Ban Giáo dục Mầm non",
    publisher: "NXB Giáo dục",
    publishYear: 2023,
    units: [
      { name: "Đơn vị 1: Làm quen với chữ cái", status: "Hoàn thành", progress: 100 },
      { name: "Đơn vị 2: Học đếm số", status: "Đang dạy", progress: 80 },
      { name: "Đơn vị 3: Khám phá thế giới tự nhiên", status: "Chưa bắt đầu", progress: 0 },
      { name: "Đơn vị 4: Phát triển kỹ năng vận động", status: "Chưa bắt đầu", progress: 0 }
    ]
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text>{index + 1}</Text>
      ),
    },
    {
      title: 'Tên giáo trình',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookFilled style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => showSyllabusDetail(record)} 
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button type="text" icon={<DownloadOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const assignedColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text>{index + 1}</Text>
      ),
    },
    {
      title: 'Tên giáo trình',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <BookFilled style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Đang dạy' ? 'processing' : status === 'Sắp dạy' ? 'warning' : 'success'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <div className="progress-cell">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: progress === 0 ? '#f5f5f5' : progress < 30 ? '#ff4d4f' : progress < 70 ? '#faad14' : '#52c41a'
            }} 
          />
          <Text>{progress}%</Text>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => showSyllabusDetail(record)} 
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button type="text" icon={<DownloadOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderSyllabusDetail = () => {
    if (!selectedSyllabus) return null;

    // Sử dụng dữ liệu chi tiết giả lập
    const detail = syllabusDetailData;

    return (
      <div className="syllabus-detail">
        <div className="syllabus-header">
          <Avatar 
            className="syllabus-avatar" 
            icon={<BookOutlined />} 
            size={80} 
          />
          <div className="syllabus-title">
            <Title level={3}>{detail.name}</Title>
            <div className="syllabus-tags">
              <Tag color="blue">{detail.ageGroup}</Tag>
              <Tag color="purple">{detail.duration}</Tag>
            </div>
          </div>
        </div>

        <Divider />

        <Descriptions 
          title="Thông tin giáo trình" 
          bordered 
          column={1}
          className="syllabus-descriptions"
        >
          <Descriptions.Item label="Mô tả">{detail.description}</Descriptions.Item>
          <Descriptions.Item label="Tác giả">{detail.author}</Descriptions.Item>
          <Descriptions.Item label="Nhà xuất bản">{detail.publisher}</Descriptions.Item>
          <Descriptions.Item label="Năm xuất bản">{detail.publishYear}</Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Nội dung giáo trình</Divider>

        <div className="syllabus-units">
          {detail.units.map((unit, index) => (
            <Card 
              key={index}
              className="unit-card"
              title={
                <Space>
                  <Text strong>{unit.name}</Text>
                  <Tag 
                    color={
                      unit.status === 'Hoàn thành' ? 'success' : 
                      unit.status === 'Đang dạy' ? 'processing' : 
                      'default'
                    }
                  >
                    {unit.status}
                  </Tag>
                </Space>
              }
              extra={
                <div className="unit-progress">
                  <Text>{unit.progress}%</Text>
                </div>
              }
            >
              <div className="unit-progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${unit.progress}%`,
                    backgroundColor: unit.progress === 0 ? '#f5f5f5' : unit.progress < 30 ? '#ff4d4f' : unit.progress < 70 ? '#faad14' : '#52c41a'
                  }} 
                />
              </div>

              <div className="unit-actions">
                <Button type="primary" icon={<EyeOutlined />}>Xem chi tiết</Button>
                <Button icon={<DownloadOutlined />}>Tải tài liệu</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="teacher-syllabus-container">
      <div className="syllabus-header-section">
        <div className="header-top">
          <div className="header-left">
            <Title level={2}>Giáo trình</Title>
            <Text>Quản lý và theo dõi giáo trình giảng dạy</Text>
          </div>
          <div className="header-right">
            <Button type="primary" icon={<DownloadOutlined />}>
              Tải tài liệu giảng dạy
            </Button>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-filter">
            <Search
              placeholder="Tìm kiếm giáo trình..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
            
            <Dropdown menu={{
              items: [
                {
                  key: '1',
                  label: 'Tất cả giáo trình',
                },
                {
                  key: '2',
                  label: 'Mới nhất',
                },
                {
                  key: '3',
                  label: 'Phổ biến nhất',
                },
              ],
            }} trigger={['click']}>
              <Button icon={<FilterOutlined />}>
                Lọc
              </Button>
            </Dropdown>
            
            <Dropdown menu={{
              items: [
                {
                  key: '1',
                  label: 'Tên (A-Z)',
                },
                {
                  key: '2',
                  label: 'Tên (Z-A)',
                },
              ],
            }} trigger={['click']}>
              <Button icon={<SortAscendingOutlined />}>
                Sắp xếp
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="syllabus-tabs"
      >
        <TabPane 
          tab={
            <span>
              <BookOutlined />
              Tất cả giáo trình
            </span>
          } 
          key="all"
        >
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <Text>Đang tải danh sách giáo trình...</Text>
            </div>
          ) : filteredSyllabi.length === 0 ? (
            <Empty 
              description="Không tìm thấy giáo trình nào" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          ) : (
            <Table 
              columns={columns} 
              dataSource={filteredSyllabi} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="syllabi-table"
            />
          )}
        </TabPane>
        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Giáo trình đã gán
            </span>
          } 
          key="assigned"
        >
          <Table 
            columns={assignedColumns} 
            dataSource={assignedSyllabi} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="syllabi-table"
          />
        </TabPane>
      </Tabs>

      <Drawer
        title="Chi tiết giáo trình"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={600}
        className="syllabus-drawer"
        destroyOnClose
      >
        {renderSyllabusDetail()}
      </Drawer>
    </div>
  );
};

export default TeacherSyllabus;
