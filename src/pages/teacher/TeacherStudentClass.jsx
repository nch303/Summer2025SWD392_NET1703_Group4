import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card, Table, Avatar, Tag, Button,
  Tooltip, Space, Empty, Spin, Tabs, Row, Col, Dropdown,
  Badge, Segmented, List, Statistic, Modal, Image, message,
  UserOutlined, SearchOutlined, FilterOutlined,
  EyeOutlined, MessageOutlined,
  CalendarOutlined, TeamOutlined, SortAscendingOutlined,
  UnorderedListOutlined, AppstoreOutlined, IdcardOutlined,
  ArrowLeftOutlined, PhoneOutlined, HomeOutlined, MailOutlined,
  FileTextOutlined, CloseOutlined, Title, Text, Search,
} from '../../utils/AntComponents';
import {
  getStudentsByClassId, calculateAge,
  formatBirthday, getStudentDetail,
  getClassesByTeacherId
} from '../../services/TeacherService';
import { useUser } from '../../contexts/UserContext';
import styles from './TeacherStudentClass.module.css';

const TeacherStudentClass = () => {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [viewType, setViewType] = useState('table');
  const [searchValue, setSearchValue] = useState('');
  const { currentUser } = useUser();

  // Add state for modal and student detail
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 1. First, add a function to ensure unique data by checking for duplicate IDs
  const ensureUniqueData = (data) => {
    const seen = new Set();
    return data.filter((student) => {
      if (seen.has(student.id)) {
        console.warn(`Duplicate student ID found: ${student.id}`);
        return false;
      }
      seen.add(student.id);
      return true;
    });
  };

  // 2. Update the useEffect to filter out duplicates and ensure unique data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsData = await getStudentsByClassId(classId);

        // Apply the unique filter
        const uniqueStudentsData = ensureUniqueData(studentsData);

        if (currentUser?.id) {
          const classes = await getClassesByTeacherId(currentUser.id);
          const currentClass = classes.find(c => c.id.toString() === classId.toString());
          setClassInfo(currentClass);
        }

        setStudents(uniqueStudentsData);
        setFilteredStudents(uniqueStudentsData);

        if (studentsData.length !== uniqueStudentsData.length) {
          message.warning(`Some duplicate student records were filtered out (${studentsData.length - uniqueStudentsData.length})`);
        }
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

  // Function to view student detail
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

  // Function to close modal
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
      title: 'ID',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <Text>{index + 1}</Text>
      ),
    },
    {
      title: 'Student',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className={styles.studentNameCell}>
          <Avatar
            src={record.avatar}
            icon={!record.avatar || record.avatar === 'string' ? <UserOutlined /> : null}
            size={40}
          />
          <div className={styles.studentInfo}>
            <Text strong>{text}</Text>
            <Text type="secondary" className={styles.studentId}>ID: {record.id.substring(0, 8)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Birthday',
      dataIndex: 'birthday',
      key: 'birthday',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{formatBirthday(date)}</Text>
          <Text type="secondary">{calculateAge(date)} years old</Text>
        </Space>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'Male' ? 'blue' : gender === 'Female' ? 'pink' : 'default'}>
          {gender === 'Male' ? 'Male' : gender === 'Female' ? 'Female' : 'Other'}
        </Tag>
      ),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (city) => city === 'string' ? '-' : city,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View detail">
            <Button type="text" icon={<EyeOutlined />} onClick={() => showStudentDetail(record.id)} />
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
            className={styles.studentCard}
            hoverable
            actions={[
              <Tooltip title="View detail">
                <EyeOutlined key="view" onClick={() => showStudentDetail(student.id)} />
              </Tooltip>,
              <Tooltip title="Send message">
                <MessageOutlined key="message" />
              </Tooltip>,
            ]}
          >
            <div className={styles.studentCardContent}>
              <Badge.Ribbon
                text={student.gender === 'Male' ? 'Male' : student.gender === 'Female' ? 'Female' : 'Other'}
                color={student.gender === 'Male' ? 'blue' : student.gender === 'Female' ? 'pink' : 'default'}
              >
                <Avatar
                  src={student.avatar}
                  icon={!student.avatar || student.avatar === 'string' ? <UserOutlined /> : null}
                  size={80}
                  className={styles.studentAvatar}
                />
              </Badge.Ribbon>

              <div className={styles.teacherClassStudentDetails}>
                <Title level={5} className={styles.studentName}>{student.name}</Title>
                <div className={styles.studentInfoGrid}>
                  <Text type="secondary"><CalendarOutlined /> {formatBirthday(student.birthday)}</Text>
                  <Text type="secondary"><IdcardOutlined /> {calculateAge(student.birthday)} years old</Text>
                  <Text type="secondary" className={styles.studentCity}>
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

  // Modal to view student detail
  const studentDetailModal = (
    <Modal
      title={null}
      open={isModalVisible}
      onCancel={handleModalClose}
      footer={null}
      width={850}
      className={styles.tscEnhancedModal}
      centered
      mask={false}
      closeIcon={<CloseOutlined className={styles.tscModalCloseIcon} />}
    >
      {detailLoading ? (
        <div className={styles.tscModalLoading}>
          <div className={styles.tscLoadingSpinner}>
            <Spin size="large" />
          </div>
          <Text>Loading...</Text>
        </div>
      ) : selectedStudent ? (
        <div className={styles.tscModalContainer}>
          <div className={styles.tscModalHeader}>
            <div className={styles.tscModalHeaderContent}>
              <Avatar
                src={selectedStudent.avatar}
                icon={!selectedStudent.avatar || selectedStudent.avatar === 'string' ? <UserOutlined /> : null}
                size={120}
                className={styles.tscStudentAvatar}
              />
              <div className={styles.tscHeaderInfo}>
                <Title level={2} className={styles.tscStudentName}>{selectedStudent.name}</Title>
                <div className={styles.tscStudentTags}>
                  <Tag color={selectedStudent.gender === 'Male' ? 'blue' : selectedStudent.gender === 'Female' ? 'pink' : 'default'}>
                    {selectedStudent.gender === 'Male' ? 'Male' : selectedStudent.gender === 'Female' ? 'Female' : 'Other'}
                  </Tag>
                  <Tag color="green">{calculateAge(selectedStudent.birthday)} years old</Tag>
                  {selectedStudent.city !== 'string' && <Tag color="orange">{selectedStudent.city}</Tag>}
                </div>
                <Text className={styles.tscStudentId}>ID: {selectedStudent.id.substring(0, 8)}</Text>
              </div>
            </div>
          </div>

          <div className={styles.tscModalBody}>
            <Tabs
              defaultActiveKey="1"
              className={styles.tscDetailTabs}
              items={[
                {
                  key: '1',
                  label: <span><IdcardOutlined /> Personal information</span>,
                  children: (
                    <div className={styles.tscTabStatistics}>
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <Statistic
                            title="Birthday"
                            value={formatBirthday(selectedStudent.birthday)}
                            prefix={<CalendarOutlined />}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Age"
                            value={`${calculateAge(selectedStudent.birthday)} years old`}
                            prefix={<IdcardOutlined />}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Gender"
                            value={selectedStudent.gender === 'Male' ? 'Male' : selectedStudent.gender === 'Female' ? 'Female' : 'Other'}
                            prefix={<TeamOutlined />}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Enroll Date"
                            value={
                              selectedStudent.enrollDate && selectedStudent.enrollDate !== '0001-01-01T00:00:00'
                                ? formatBirthday(selectedStudent.enrollDate)
                                : '—'
                            }
                            prefix={<CalendarOutlined />}
                          />
                        </Col>
                        <Col span={24}>
                          <Statistic
                            title="City"
                            value={selectedStudent.city !== 'string' ? selectedStudent.city : '—'}
                            prefix={<HomeOutlined />}
                          />
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: '2',
                  label: <span><TeamOutlined /> Contact information</span>,
                  children: (
                    <div className={styles.tscTabContent}>
                      <Row gutter={[24, 16]}>
                        <Col span={24}>
                          <Card className={styles.tscContactCard}>
                            <div className={styles.tscContactInfo}>
                              <Avatar icon={<UserOutlined />} size={64} className={styles.tscParentAvatar} />
                              <div className={styles.tscParentDetails}>
                                <Title level={4}>{selectedStudent.parentName || 'Not updated'}</Title>
                                <Text type="secondary">Parent</Text>
                                <Space direction="vertical" style={{ width: '100%', marginTop: '12px' }}>
                                  <div className={styles.tscContactDetail}>
                                    <PhoneOutlined />
                                    <Text>{selectedStudent.phoneNumber || 'Not updated'}</Text>
                                  </div>
                                  <div className={styles.tscContactDetail}>
                                    <MailOutlined />
                                    <Text>{selectedStudent.email || 'Not updated'}</Text>
                                  </div>
                                  <div className={styles.tscContactDetail}>
                                    <HomeOutlined />
                                    <Text>{selectedStudent.address || 'Not updated'}</Text>
                                  </div>
                                </Space>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: '3',
                  label: <span><FileTextOutlined /> Documents</span>,
                  children: (
                    <div className={styles.tscDocumentsTab}>
                      <List
                        className={styles.tscDocList}
                        itemLayout="horizontal"
                        dataSource={[
                          {
                            title: 'Birth certificate',
                            image: selectedStudent.birthCertificate && selectedStudent.birthCertificate !== 'string'
                              ? selectedStudent.birthCertificate
                              : null
                          },
                          // Có thể thêm các loại tài liệu khác ở đây
                        ]}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<FileTextOutlined className={styles.tscDocIcon} />}
                              title={item.title}
                              description={item.image ? 'Updated' : 'Not updated'}
                            />
                            {item.image ? (
                              <div className={styles.tscDocPreview}>
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  height={80}
                                  className={styles.tscDocThumbnail}
                                />
                              </div>
                            ) : (
                              <Button type="default" size="small" disabled>
                                No
                              </Button>
                            )}
                          </List.Item>
                        )}
                      />
                    </div>
                  )
                }
              ]}
            />
          </div>

          <div className={styles.tscModalFooter}>
            <Button className={styles.tscActionButtonDefault} onClick={handleModalClose}>
              Close
            </Button>
            <Button type="primary" icon={<MessageOutlined />} className={styles.tscActionButtonPrimary}>
              Contact parent
            </Button>
          </div>
        </div>
      ) : (
        <Empty description="No detail information" />
      )}
    </Modal>
  );

  return (
    <div className={styles.teacherStudentClassContainer}>
      <div className={styles.classStudentHeader}>
        <div className={styles.backButton}>
          <Link to="/teacher/classes">
            <Button icon={<ArrowLeftOutlined />} className={styles.backBtn}>
              Back to class list
            </Button>
          </Link>
        </div>

        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <Title level={2}>Student list</Title>
            {classInfo && (
              <Text>Class: <Text strong>{classInfo.name}</Text> | Number of students: <Text strong>{students.length}/{classInfo.maxChildren}</Text></Text>
            )}
          </div>
          <div className={styles.headerRight}>
            <Space>
              <Link to={`/teacher/classes/${classId}/view-all-attendance`}>
                <Button type="primary" icon={<FileTextOutlined />} style={{ marginRight: '8px' }}>
                  View attendance
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchFilter}>
            <Search
              placeholder="Search students..."
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
                  label: 'All students',
                },
                {
                  key: '2',
                  label: 'Male',
                },
                {
                  key: '3',
                  label: 'Female',
                },
              ],
            }} trigger={['click']}>
              <Button icon={<FilterOutlined />}>
                Filter
              </Button>
            </Dropdown>

            <Dropdown menu={{
              items: [
                {
                  key: '1',
                  label: 'Name (A-Z)',
                },
                {
                  key: '2',
                  label: 'Name (Z-A)',
                },
                {
                  key: '3',
                  label: 'Age (ascending)',
                },
                {
                  key: '4',
                  label: 'Age (descending)',
                },
              ],
            }} trigger={['click']}>
              <Button icon={<SortAscendingOutlined />}>
                Sort
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
        <div className={styles.loadingContainer}>
          <Spin size="large" />
          <Text>Loading student list...</Text>
        </div>
      ) : filteredStudents.length === 0 ? (
        <Empty
          description="No student found matching the keyword"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className={styles.studentListContainer}>
          {viewType === 'table' ? (
            <Table
              columns={columns}
              dataSource={filteredStudents}
              rowKey={(record) => `student-${record.id}-${record.name}`}
              pagination={{ pageSize: 10 }}
              className={styles.studentsTable}
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
