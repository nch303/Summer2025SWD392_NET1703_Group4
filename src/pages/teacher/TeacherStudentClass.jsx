import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Card, Table, Avatar, Tag, Typography, Input, Button, 
  Tooltip, Space, Empty, Spin, Tabs, Row, Col, Dropdown,
  Badge, Segmented, List, Statistic, Modal, Descriptions, Image
} from 'antd';
import { 
  UserOutlined, SearchOutlined, FilterOutlined, 
  DownloadOutlined, EyeOutlined, MessageOutlined,
  CalendarOutlined, TeamOutlined, SortAscendingOutlined,
  UnorderedListOutlined, AppstoreOutlined, IdcardOutlined,
  ArrowLeftOutlined, PhoneOutlined, HomeOutlined, MailOutlined
} from '@ant-design/icons';
import { getStudentsByClassId, calculateAge, formatBirthday, getStudentDetail } from './TeacherStudentClassService';
import { getClassesByTeacherId } from './TeacherClassService';
import { useUser } from '../../contexts/UserContext';
import './TeacherStudentClass.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

const TeacherStudentClass = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [viewType, setViewType] = useState('table');
  const [searchValue, setSearchValue] = useState('');
  const { currentUser } = useUser();
  
  // Thêm state cho modal và thông tin chi tiết học sinh
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsData = await getStudentsByClassId(classId);
        
        if (currentUser?.id) {
          const classes = await getClassesByTeacherId(currentUser.id);
          const currentClass = classes.find(c => c.id.toString() === classId.toString());
          setClassInfo(currentClass);
        }
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId, currentUser]);

  // Hàm xem chi tiết học sinh
  const showStudentDetail = async (studentId) => {
    try {
      setDetailLoading(true);
      setIsModalVisible(true);
      const detail = await getStudentDetail(studentId);
      setSelectedStudent(detail);
    } catch (error) {
      console.error('Error fetching student detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Hàm đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredStudents(filtered);
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
      title: 'Học sinh',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="student-name-cell">
          <Avatar 
            src={record.avatar} 
            icon={!record.avatar || record.avatar === 'string' ? <UserOutlined /> : null} 
            size={40}
          />
          <div className="student-info">
            <Text strong>{text}</Text>
            <Text type="secondary" className="student-id">ID: {record.id.substring(0, 8)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthday',
      key: 'birthday',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{formatBirthday(date)}</Text>
          <Text type="secondary">{calculateAge(date)} tuổi</Text>
        </Space>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'Male' ? 'blue' : gender === 'Female' ? 'pink' : 'default'}>
          {gender === 'Male' ? 'Nam' : gender === 'Female' ? 'Nữ' : 'Khác'}
        </Tag>
      ),
    },
    {
      title: 'Thành phố',
      dataIndex: 'city',
      key: 'city',
      render: (city) => city === 'string' ? '-' : city,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => showStudentDetail(record.id)} />
          </Tooltip>
          <Tooltip title="Nhắn tin">
            <Button type="text" icon={<MessageOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderGridView = () => (
    <Row gutter={[24, 24]}>
      {filteredStudents.map(student => (
        <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
          <Card 
            className="student-card"
            hoverable
            actions={[
              <Tooltip title="Xem chi tiết">
                <EyeOutlined key="view" onClick={() => showStudentDetail(student.id)} />
              </Tooltip>,
              <Tooltip title="Nhắn tin">
                <MessageOutlined key="message" />
              </Tooltip>,
            ]}
          >
            <div className="student-card-content">
              <Badge.Ribbon 
                text={student.gender === 'Male' ? 'Nam' : student.gender === 'Female' ? 'Nữ' : 'Khác'} 
                color={student.gender === 'Male' ? 'blue' : student.gender === 'Female' ? 'pink' : 'default'}
              >
                <Avatar 
                  src={student.avatar} 
                  icon={!student.avatar || student.avatar === 'string' ? <UserOutlined /> : null} 
                  size={80}
                  className="student-avatar"
                />
              </Badge.Ribbon>
              
              <div className="student-details">
                <Title level={5} className="student-name">{student.name}</Title>
                <div className="student-info-grid">
                  <Text type="secondary"><CalendarOutlined /> {formatBirthday(student.birthday)}</Text>
                  <Text type="secondary"><IdcardOutlined /> {calculateAge(student.birthday)} tuổi</Text>
                  <Text type="secondary" className="student-city">
                    {student.city !== 'string' ? student.city : ''}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Thêm modal xem chi tiết học sinh
  const studentDetailModal = (
    <Modal
      title="Thông tin chi tiết học sinh"
      open={isModalVisible}
      onCancel={handleModalClose}
      footer={null}
      width={700}
      className="student-detail-modal"
    >
      {detailLoading ? (
        <div className="modal-loading">
          <Spin size="large" />
          <Text>Đang tải thông tin...</Text>
        </div>
      ) : selectedStudent ? (
        <div className="student-detail-content">
          <div className="student-profile-header">
            <Avatar 
              src={selectedStudent.avatar} 
              icon={!selectedStudent.avatar || selectedStudent.avatar === 'string' ? <UserOutlined /> : null}
              size={100}
              className="detail-avatar"
            />
            <div className="student-profile-info">
              <Title level={3}>{selectedStudent.name}</Title>
              <div className="profile-tags">
                <Tag color={selectedStudent.gender === 'Male' ? 'blue' : selectedStudent.gender === 'Female' ? 'pink' : 'default'}>
                  {selectedStudent.gender === 'Male' ? 'Nam' : selectedStudent.gender === 'Female' ? 'Nữ' : 'Khác'}
                </Tag>
                <Tag color="green">{calculateAge(selectedStudent.birthday)} tuổi</Tag>
                {selectedStudent.city !== 'string' && <Tag color="orange">{selectedStudent.city}</Tag>}
              </div>
            </div>
          </div>
          
          <Descriptions 
            bordered 
            column={1} 
            className="student-detail-descriptions"
          >
            <Descriptions.Item label="Ngày sinh">{formatBirthday(selectedStudent.birthday)}</Descriptions.Item>
            <Descriptions.Item label="Phụ huynh">{selectedStudent.parentName || '—'}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại liên hệ">{selectedStudent.phoneNumber || '—'}</Descriptions.Item>
            <Descriptions.Item label="Thành phố">{selectedStudent.city !== 'string' ? selectedStudent.city : '—'}</Descriptions.Item>
            <Descriptions.Item label="Ngày nhập học">
              {selectedStudent.enrollDate && selectedStudent.enrollDate !== '0001-01-01T00:00:00' 
                ? formatBirthday(selectedStudent.enrollDate) 
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Giấy khai sinh">
              {selectedStudent.birthCertificate && selectedStudent.birthCertificate !== 'string' ? (
                <div className="certificate-preview">
                  <Image
                    src={selectedStudent.birthCertificate}
                    alt="Giấy khai sinh"
                    width={200}
                  />
                </div>
              ) : '—'}
            </Descriptions.Item>
          </Descriptions>
          
          <div className="modal-actions">
            <Button type="primary" icon={<MessageOutlined />}>
              Liên hệ phụ huynh
            </Button>
          </div>
        </div>
      ) : (
        <Empty description="Không có thông tin chi tiết" />
      )}
    </Modal>
  );

  return (
    <div className="teacher-student-class-container">
      <div className="class-student-header">
        <div className="back-button">
          <Link to="/teacher/classes">
            <Button icon={<ArrowLeftOutlined />} className="back-btn">
              Quay lại danh sách lớp
            </Button>
          </Link>
        </div>
        
        <div className="header-top">
          <div className="header-left">
            <Title level={2}>Danh sách học sinh</Title>
            {classInfo && (
              <Text>Lớp: <Text strong>{classInfo.name}</Text> | Sĩ số: <Text strong>{students.length}/{classInfo.maxChildren}</Text></Text>
            )}
          </div>
          <div className="header-right">
            <Button type="primary" icon={<DownloadOutlined />}>
              Xuất danh sách
            </Button>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-filter">
            <Search
              placeholder="Tìm kiếm học sinh..."
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
                  label: 'Tất cả học sinh',
                },
                {
                  key: '2',
                  label: 'Nam',
                },
                {
                  key: '3',
                  label: 'Nữ',
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
                {
                  key: '3',
                  label: 'Tuổi (tăng dần)',
                },
                {
                  key: '4',
                  label: 'Tuổi (giảm dần)',
                },
              ],
            }} trigger={['click']}>
              <Button icon={<SortAscendingOutlined />}>
                Sắp xếp
              </Button>
            </Dropdown>
          </div>
          
          <Segmented
            options={[
              {
                value: 'table',
                icon: <UnorderedListOutlined />,
              },
              {
                value: 'grid',
                icon: <AppstoreOutlined />,
              },
            ]}
            value={viewType}
            onChange={setViewType}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Đang tải danh sách học sinh...</Text>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Empty 
          description="Không tìm thấy học sinh nào" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <div className="student-list-container">
          {viewType === 'table' ? (
            <Table 
              columns={columns} 
              dataSource={filteredStudents} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
              className="students-table"
            />
          ) : (
            renderGridView()
          )}
        </div>
      )}
      
      {studentDetailModal}
    </div>
  );
};

export default TeacherStudentClass;
