import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, Space, Tag,
  Tooltip, Empty, Spin, Tabs, Avatar, Dropdown,
  Drawer, Descriptions, Divider,
  Title, Text, Search,
  BookOutlined, EyeOutlined, FilterOutlined,
  SortAscendingOutlined,
  BookFilled, CheckCircleOutlined,
  SearchOutlined
} from '../../utils/AntComponents';
import {
  getAllSyllabi,
  getSyllabusDetailById
} from '../../services/TeacherService';
import styles from './TeacherSyllabus.module.css';

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

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const syllabusId = searchParams.get('syllabusId');
    const openDrawer = searchParams.get('openDrawer') === 'true';
    
    let checkInterval = null;
    let checkTimeout = null;
    
    if (syllabusId && openDrawer) {
      const syllabus = syllabi.find(s => s.id === parseInt(syllabusId));
      if (syllabus) {
        showSyllabusDetail(syllabus);
        // Clear URL parameters after opening the drawer
        navigate('/teacher/syllabus', { replace: true });
      } else if (syllabi.length > 0) {
        // If we have syllabi but didn't find the one we want
        navigate('/teacher/syllabus', { replace: true });
      } else {
        // If syllabi are not loaded yet, check again when they are
        checkInterval = setInterval(() => {
          const foundSyllabus = syllabi.find(s => s.id === parseInt(syllabusId));
          if (foundSyllabus) {
            showSyllabusDetail(foundSyllabus);
            clearInterval(checkInterval);
            // Clear URL parameters after opening the drawer
            navigate('/teacher/syllabus', { replace: true });
          } else if (syllabi.length > 0) {
            // If we have syllabi but didn't find the one we want
            clearInterval(checkInterval);
            navigate('/teacher/syllabus', { replace: true });
          }
        }, 500);
        
        // Clear interval after 5 seconds if syllabus not found
        checkTimeout = setTimeout(() => {
          if (checkInterval) {
            clearInterval(checkInterval);
          }
          navigate('/teacher/syllabus', { replace: true });
        }, 5000);
      }
    }
    
    // Cleanup function to prevent memory leaks and unexpected behaviors
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
    };
  }, [syllabi, searchParams, navigate]);

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
    
    // Make sure we're on the clean URL
    const currentPath = window.location.pathname;
    if (currentPath === '/teacher/syllabus' && window.location.search) {
      navigate('/teacher/syllabus', { replace: true });
    }
  };

  // Mô phỏng dữ liệu giáo trình đã gán
  const assignedSyllabi = [
    { id: 3, name: "học học nữa học máu", className: "Lớp Chồi", status: "Đang dạy", progress: 75 },
    { id: 2, name: "học ăn học nói học gói mang về", className: "Lớp Mầm", status: "Sắp dạy", progress: 0 }
  ];

  const columns = [
    {
      title: 'ID',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text>{index + 1}</Text>
      ),
    },
    {
      title: 'Syllabus name',
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
      title: 'Number of lessons',
      dataIndex: 'slotAmount',
      key: 'slotAmount',
      width: 150,
      align: 'center',
      render: (slotAmount) => (
        <Tag color="blue">{slotAmount} buổi</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showSyllabusDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const assignedColumns = [
    {
      title: 'ID',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text>{index + 1}</Text>
      ),
    },
    {
      title: 'Syllabus name',
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
      title: 'Number of lessons',
      dataIndex: 'slotAmount',
      key: 'slotAmount',
      width: 150,
      align: 'center',
      render: (slotAmount) => slotAmount ? (
        <Tag color="blue">{slotAmount} lessons</Tag>
      ) : (
        <Tag color="default">Not updated</Tag>
      ),
    },
    {
      title: 'Class',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Teaching' ? 'processing' : status === 'To be taught' ? 'warning' : 'success'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <div className={styles.progressCell}>
          <div className={styles.progressBar}>
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
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View detail">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showSyllabusDetail(record)}
            />
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
      <div className={styles.syllabusDetail}>
        <div className={styles.syllabusHeader}>
          <Avatar
            className={styles.syllabusAvatar}
            icon={<BookOutlined />}
            size={80}
          />
          <div className={styles.syllabusTitle}>
            <Title level={3}>{selectedSyllabus.name}</Title>
            <div className={styles.syllabusTags}>
              <Tag color="blue">{selectedSyllabus.slotAmount || syllabusSlots.length || 0} lessons</Tag>
            </div>
          </div>
        </div>

        <Divider />

        <Descriptions
          title="Syllabus information"
          bordered
          column={1}
          className={styles.syllabusDescriptions}
        >
          <Descriptions.Item label="ID of syllabus">{selectedSyllabus.id}</Descriptions.Item>
          <Descriptions.Item label="Syllabus name">{selectedSyllabus.name}</Descriptions.Item>
          <Descriptions.Item label="Number of lessons">{selectedSyllabus.slotAmount || syllabusSlots.length || 0}</Descriptions.Item>
        </Descriptions>

        {detailLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <Text>Loading syllabus detail...</Text>
          </div>
        ) : syllabusSlots.length > 0 ? (
          <>
            <Divider orientation="left">Lesson details</Divider>
            <div className={styles.syllabusSlots}>
              {groupedSlots.map((group, groupIndex) => (
                <Card
                  key={groupIndex}
                  className={styles.unitCard}
                  title={
                    <Text strong>Lesson group {groupIndex + 1} (Lesson {group[0].slot} - {group[group.length - 1].slot})</Text>
                  }
                  style={{ marginBottom: 16 }}
                >
                  {group.map((slot) => (
                    <div key={slot.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <Space size="middle">
                        <Tag color="blue">Lesson {slot.slot}</Tag>
                        <Text>{slot.content}</Text>
                        <Tag color="green">{slot.duration} minutes</Tag>
                      </Space>
                    </div>
                  ))}
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Empty description="No lesson detail" />
        )}
      </div>
    );
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <BookOutlined />
          All syllabi
        </span>
      ),
      children: (
        <>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Spin size="large" />
              <Text>Loading syllabus list...</Text>
            </div>
          ) : filteredSyllabi.length === 0 ? (
            <Empty
              description="No syllabus found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredSyllabi}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className={styles.syllabiTable}
            />
          )}
        </>
      )
    },
  ];

  return (
    <div className={styles.teacherSyllabusContainer}>
      <div className={styles.syllabusHeaderSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <Title level={2}>Syllabus</Title>
            <Text>Manage and track the teaching syllabus</Text>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchFilter}>
            <Search
              placeholder="Search syllabus..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              onSearch={handleSearch}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />

          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className={styles.syllabusTabs}
        items={tabItems}
      />

      <Drawer
        title="Syllabus detail"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={600}
        className={styles.syllabusDrawer}
        destroyOnClose
      >
        {renderSyllabusDetail()}
      </Drawer>
    </div>
  );
};

export default TeacherSyllabus;
