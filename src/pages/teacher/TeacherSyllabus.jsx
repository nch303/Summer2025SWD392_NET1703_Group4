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
import { getAllSyllabi, getSyllabusById, getSyllabusDetailById } from './TeacherSyllabusService';
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
  const [syllabusSlots, setSyllabusSlots] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
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

  const showSyllabusDetail = async (syllabus) => {
    setSelectedSyllabus(syllabus);
    setDrawerVisible(true);
    
    try {
      setDetailLoading(true);
      const slotsData = await getSyllabusDetailById(syllabus.id);
      setSyllabusSlots(slotsData);
    } catch (error) {
      console.error('Failed to fetch syllabus details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedSyllabus(null);
    setSyllabusSlots([]);
  };

  // Mô phỏng dữ liệu giáo trình đã gán
  const assignedSyllabi = [
    { id: 3, name: "học học nữa học máu", className: "Lớp Chồi", status: "Đang dạy", progress: 75 },
    { id: 2, name: "học ăn học nói học gói mang về", className: "Lớp Mầm", status: "Sắp dạy", progress: 0 }
  ];

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
      title: 'Số buổi học',
      dataIndex: 'slotAmount',
      key: 'slotAmount',
      width: 150,
      align: 'center',
      render: (slotAmount) => (
        <Tag color="blue">{slotAmount} buổi</Tag>
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
      title: 'Số buổi học',
      dataIndex: 'slotAmount',
      key: 'slotAmount',
      width: 150,
      align: 'center',
      render: (slotAmount) => slotAmount ? (
        <Tag color="blue">{slotAmount} buổi</Tag>
      ) : (
        <Tag color="default">Chưa cập nhật</Tag>
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
          <div className="progress-bar">
            <div 
              style={{ 
                width: `${progress}%`,
                height: '100%',
                backgroundColor: progress === 0 ? '#f5f5f5' : progress < 30 ? '#ff4d4f' : progress < 70 ? '#faad14' : '#52c41a'
              }} 
            />
          </div>
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

    // Group slots by 5 for better display
    const groupedSlots = [];
    if (syllabusSlots.length > 0) {
      for (let i = 0; i < syllabusSlots.length; i += 5) {
        groupedSlots.push(syllabusSlots.slice(i, i + 5));
      }
    }

    return (
      <div className="syllabus-detail">
        <div className="syllabus-header">
          <Avatar 
            className="syllabus-avatar" 
            icon={<BookOutlined />} 
            size={80} 
          />
          <div className="syllabus-title">
            <Title level={3}>{selectedSyllabus.name}</Title>
            <div className="syllabus-tags">
              <Tag color="blue">{selectedSyllabus.slotAmount || syllabusSlots.length || 0} buổi học</Tag>
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
          <Descriptions.Item label="ID giáo trình">{selectedSyllabus.id}</Descriptions.Item>
          <Descriptions.Item label="Tên giáo trình">{selectedSyllabus.name}</Descriptions.Item>
          <Descriptions.Item label="Số buổi học">{selectedSyllabus.slotAmount || syllabusSlots.length || 0}</Descriptions.Item>
        </Descriptions>

        {detailLoading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Đang tải chi tiết giáo trình...</Text>
          </div>
        ) : syllabusSlots.length > 0 ? (
          <>
            <Divider orientation="left">Chi tiết các buổi học</Divider>
            <div className="syllabus-slots">
              {groupedSlots.map((group, groupIndex) => (
                <Card 
                  key={groupIndex}
                  className="unit-card"
                  title={
                    <Text strong>Nhóm buổi học {groupIndex + 1} (Buổi {group[0].slot} - {group[group.length-1].slot})</Text>
                  }
                  style={{ marginBottom: 16 }}
                >
                  {group.map((slot) => (
                    <div key={slot.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space size="middle">
                        <Tag color="blue">Buổi {slot.slot}</Tag>
                        <Text>{slot.content}</Text>
                        <Tag color="green">{slot.duration} phút</Tag>
                      </Space>
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Empty description="Không có thông tin chi tiết buổi học" />
        )}
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
