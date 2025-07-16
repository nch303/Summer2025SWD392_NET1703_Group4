import React, { useState, useEffect } from 'react';
import {
  Card, Button, Spin, Avatar, Tag, Input,
  Row, Col, message, Modal, Divider, Badge,
  Progress, Checkbox, Collapse, Empty, Drawer,
  Radio, Title, Text,
  UserOutlined, InfoCircleOutlined, CheckCircleOutlined,
  TeamOutlined, AppstoreOutlined, CloseOutlined,
} from '../../utils/AntComponents';
import styles from './StaffAssignTeacherPage.module.css';
import { getAllTeachers, assignTeacher, getAllClasses } from '../../services/StaffService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StaffAssignTeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesByGrade, setClassesByGrade] = useState({});
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [classDetailModalVisible, setClassDetailModalVisible] = useState(false);
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('all');

  // Fetch data
  useEffect(() => {
    fetchClassList();
    fetchTeacherList();
  }, []);

  const fetchClassList = async () => {
    setLoading(true);
    try {
      const data = await getAllClasses();
      // Filter out deleted classes
      const activeClasses = data ? data.filter(c => c.status !== 'Deleted') : [];
      setClasses(activeClasses);

      // Extract unique academic years
      const years = [...new Set(activeClasses.map(c => c.academicYear))].sort();
      setAcademicYears(years);

      // Extract unique grade levels
      const grades = [...new Set(activeClasses
        .filter(c => c.gradeLevelName) // Only classes with grade level
        .map(c => c.gradeLevelName))];
      // Add enrichment as a "grade level" for filtering
      const hasEnrichment = activeClasses.some(c => c.epName);
      if (hasEnrichment) {
        grades.push('Enrichment');
      }
      setGradeLevels(grades);

      // If no academic year is selected yet, select the most recent one
      if (selectedAcademicYear === 'all' && years.length > 0) {
        setSelectedAcademicYear(years[0]);
      }

      // Filter classes by selected filters
      let filteredClasses = activeClasses;

      // Filter by academic year if selected
      if (selectedAcademicYear !== 'all') {
        filteredClasses = filteredClasses.filter(c => c.academicYear === selectedAcademicYear);
      }

      // Filter by grade level if selected
      if (selectedGradeLevel !== 'all') {
        if (selectedGradeLevel === 'Enrichment') {
          filteredClasses = filteredClasses.filter(c => c.epName);
        } else {
          filteredClasses = filteredClasses.filter(c => c.gradeLevelName === selectedGradeLevel);
        }
      }

      // Organize classes by grade level or enrichment program
      const organizedClasses = {};

      filteredClasses.forEach(classItem => {
        if (classItem.epName) {
          // Tất cả lớp năng khiếu vào cùng một danh mục
          if (!organizedClasses["Enrichment"]) {
            organizedClasses["Enrichment"] = [];
          }
          organizedClasses["Enrichment"].push(classItem);
        } else if (classItem.gradeLevelName) {
          // It's a regular class with a grade level
          if (!organizedClasses[classItem.gradeLevelName]) {
            organizedClasses[classItem.gradeLevelName] = [];
          }
          organizedClasses[classItem.gradeLevelName].push(classItem);
        } else {
          // Classes with neither (shouldn't happen with good data)
          if (!organizedClasses["Other"]) {
            organizedClasses["Other"] = [];
          }
          organizedClasses["Other"].push(classItem);
        }
      });

      setClassesByGrade(organizedClasses);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherList = async () => {
    setLoading(true);
    try {
      const data = await getAllTeachers();
      // Filter to only active teachers
      const activeTeachers = data ? data.filter(teacher => teacher.status === 'Active') : [];
      setTeachers(activeTeachers);
      setFilteredTeachers(activeTeachers);
    } catch (err) {
      message.error('Failed to load teacher list');
    } finally {
      setLoading(false);
    }
  };

  // Select a class and open teacher drawer
  const handleClassSelect = (classInfo) => {
    setSelectedClassId(classInfo.id);
    setSelectedClass(classInfo);
    setSelectedTeacher(null);
    setSelectedTeacherId(null);

    // Filter teachers if needed (in this case we don't filter by criteria)
    setFilteredTeachers(teachers);

    // Open the drawer to show teachers
    setDrawerVisible(true);
  };

  // Toggle teacher selection
  const handleTeacherSelect = (teacher) => {
    if (selectedTeacherId === teacher.id) {
      // Deselect if already selected
      setSelectedTeacher(null);
      setSelectedTeacherId(null);
    } else {
      setSelectedTeacher(teacher);
      setSelectedTeacherId(teacher.id);
    }
  };

  // Handle the assignment process
  const handleAssign = async () => {
    if (!selectedClassId || !selectedTeacherId) {
      message.error('Please select a class and a teacher');
      return;
    }

    const teacherName = selectedTeacher?.fullName || 'Selected teacher';
    const className = selectedClass?.name || 'selected class';

    setAssigning(true);
    try {
      const loadingMessage = message.loading(`Assigning ${teacherName} to ${className}...`, 0);

      console.log(`Attempting to assign teacher ID: ${selectedTeacherId} to class ID: ${selectedClassId}`);

      const assignData = {
        classId: selectedClassId,
        teacherId: selectedTeacherId
      };

      await assignTeacher(assignData);

      loadingMessage();

      // Use message instead of notification to avoid React compatibility warning
      message.success({
        content: `Teacher "${teacherName}" successfully assigned to class "${className}"!`,
        duration: 5,
      });

      // Reset UI state
      setSelectedTeacher(null);
      setSelectedTeacherId(null);
      setSelectedClass(null);
      setSelectedClassId(null);
      setDrawerVisible(false);

      // Refresh data
      await fetchClassList();
      await fetchTeacherList();

    } catch (err) {
      console.error('Assignment error:', err);

      // Better error handling with specific message for "Class not found"
      let errorMessage = 'Failed to assign teacher';

      if (err.message && err.message.includes('Class not found')) {
        errorMessage = `Cannot find class "${className}" (ID: ${selectedClassId}). The class may have been deleted or modified.`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      message.error({
        content: errorMessage,
        duration: 5,
      });
    } finally {
      setAssigning(false);
    }
  };

  // Show teacher details in modal
  const showTeacherDetail = (teacher) => {
    setSelectedTeacher(teacher);
    setDetailModalVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedClassId(null);
    setSelectedClass(null);
    setSelectedTeacher(null);
    setSelectedTeacherId(null);
  };

  const searchTeachers = (value) => {
    setSearchText(value);
    if (!value) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(
      teacher =>
        teacher.fullName?.toLowerCase().includes(value.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(value.toLowerCase()) ||
        teacher.phoneNumber?.includes(value)
    );

    setFilteredTeachers(filtered);
  };

  // Hàm chuyển đổi schedule dạng số thành "Thứ X"
  const formatSchedule = (timetable) => {
    if (!timetable) return null;

    return timetable.split(',').map(day => {
      const dayNum = day.trim();
      if (dayNum === '1') return 'Chủ Nhật';
      if (dayNum >= '2' && dayNum <= '7') return `Thứ ${dayNum}`;
      return dayNum; // Trường hợp không phải số từ 1-7
    }).join(', ');
  };

  const showClassDetail = (classItem) => {
    setSelectedClassDetail(classItem);
    setClassDetailModalVisible(true);
  };

  // Thêm hàm xử lý thay đổi năm học
  const handleAcademicYearChange = (value) => {
    setSelectedAcademicYear(value);
    // Sau khi thay đổi năm học, cập nhật lại danh sách lớp đã được tổ chức
    const filteredClasses = value === 'all'
      ? classes
      : classes.filter(c => c.academicYear === value);

    const organizedClasses = {};

    filteredClasses.forEach(classItem => {
      if (classItem.epName) {
        if (!organizedClasses["Enrichment"]) {
          organizedClasses["Enrichment"] = [];
        }
        organizedClasses["Enrichment"].push(classItem);
      } else if (classItem.gradeLevelName) {
        if (!organizedClasses[classItem.gradeLevelName]) {
          organizedClasses[classItem.gradeLevelName] = [];
        }
        organizedClasses[classItem.gradeLevelName].push(classItem);
      } else {
        if (!organizedClasses["Other"]) {
          organizedClasses["Other"] = [];
        }
        organizedClasses["Other"].push(classItem);
      }
    });

    setClassesByGrade(organizedClasses);
  };

  // Thêm hàm xử lý thay đổi cấp lớp
  const handleGradeLevelChange = (e) => {
    setSelectedGradeLevel(e.target.value);

    // Cập nhật lại lớp học dựa trên bộ lọc mới
    let filteredClasses = classes;

    // Filter by academic year if selected
    if (selectedAcademicYear !== 'all') {
      filteredClasses = filteredClasses.filter(c => c.academicYear === selectedAcademicYear);
    }

    // Filter by grade level
    if (e.target.value !== 'all') {
      if (e.target.value === 'Enrichment') {
        filteredClasses = filteredClasses.filter(c => c.epName);
      } else {
        filteredClasses = filteredClasses.filter(c => c.gradeLevelName === e.target.value);
      }
    }

    // Organize classes
    const organizedClasses = {};
    filteredClasses.forEach(classItem => {
      if (classItem.epName) {
        if (!organizedClasses["Enrichment"]) {
          organizedClasses["Enrichment"] = [];
        }
        organizedClasses["Enrichment"].push(classItem);
      } else if (classItem.gradeLevelName) {
        if (!organizedClasses[classItem.gradeLevelName]) {
          organizedClasses[classItem.gradeLevelName] = [];
        }
        organizedClasses[classItem.gradeLevelName].push(classItem);
      } else {
        if (!organizedClasses["Other"]) {
          organizedClasses["Other"] = [];
        }
        organizedClasses["Other"].push(classItem);
      }
    });

    setClassesByGrade(organizedClasses);
  };

  return (
    <div className={styles.teacherAssignContainer}>
      <div className={styles.teacherAssignPageHeader}>
        <Title level={2} className={styles.teacherAssignPageTitle}>Assign Teacher to Class</Title>
        {selectedTeacher && (
          <div className={styles.teacherCounter}>
            <Badge count={selectedTeacher ? 1 : 0} offset={[0, 10]}>
              <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </Badge>
          </div>
        )}
      </div>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {/* Class selection section */}
          <Col span={24}>
            <Card
              title={
                <div className={styles.cardTitleWithIcon}>
                  <AppstoreOutlined /> Classes by Category
                </div>
              }
              className={styles.teacherAssignCard}
              extra={
                <div className={styles.cardHeaderActions}>
                  {/* Bộ lọc theo năm học */}
                  <div className={styles.academicYearFilter}>
                    <span className={styles.filterLabel}>Academic year:</span>
                    <Button
                      icon={<FontAwesomeIcon icon="chevron-left" />}
                      size="small"
                      onClick={() => {
                        const currentIndex = academicYears.indexOf(selectedAcademicYear);
                        if (currentIndex > 0) {
                          handleAcademicYearChange(academicYears[currentIndex - 1]);
                        }
                      }}
                      disabled={academicYears.indexOf(selectedAcademicYear) === 0}
                    />
                    <span className={styles.academicYearDisplay}>
                      {selectedAcademicYear || 'All'}
                    </span>
                    <Button
                      icon={<FontAwesomeIcon icon="chevron-right" />}
                      size="small"
                      onClick={() => {
                        const currentIndex = academicYears.indexOf(selectedAcademicYear);
                        if (currentIndex < academicYears.length - 1) {
                          handleAcademicYearChange(academicYears[currentIndex + 1]);
                        }
                      }}
                      disabled={academicYears.indexOf(selectedAcademicYear) === academicYears.length - 1}
                    />
                  </div>

                  {/* Bộ lọc theo cấp lớp */}
                  <div className={styles.gradeLevelFilter}>
                    <Radio.Group
                      value={selectedGradeLevel}
                      onChange={handleGradeLevelChange}
                      buttonStyle="solid"
                      size="small"
                      optionType="button"
                    >
                      <Radio.Button value="all">All</Radio.Button>
                      {gradeLevels.map(grade => (
                        <Radio.Button
                          key={grade}
                          value={grade}
                          style={grade === 'Enrichment' ? { color: '#722ed1' } : {}}
                        >
                          {grade}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>

                  {/* Hiển thị lớp đã chọn */}
                  {selectedClass && (
                    <Tag color="blue" className={styles.selectedClassTag}>
                      Selected: {selectedClass.name}
                    </Tag>
                  )}
                </div>
              }
            >
              {Object.keys(classesByGrade).length > 0 ? (
                <Collapse
                  defaultActiveKey={Object.keys(classesByGrade)}
                  className={styles.teacherGradeCollapse}
                  variant="borderless" // Use this instead of bordered={false}
                  items={Object.entries(classesByGrade).map(([categoryName, classes]) => {
                    const isEnrichment = categoryName.startsWith('Enrichment');
                    return {
                      key: categoryName,
                      label: (
                        <span className={`${styles.teacherCategoryHeader} ${categoryName === 'Enrichment' ? styles.enrichmentCategory : ''}`}>
                          <span className={styles.teacherCategoryIcon}>
                            {categoryName === 'Enrichment' ?
                              <FontAwesomeIcon icon="star" /> :
                              <FontAwesomeIcon icon="graduation-cap" />
                            }
                          </span>
                          <span className={styles.teacherCategoryName}>{categoryName}</span>
                          <Tag color={categoryName === 'Enrichment' ? "purple" : "blue"} className={styles.teacherGradeCount}>
                            {classes.length} {classes.length > 1 ? 'classes' : 'class'}
                          </Tag>
                        </span>
                      ),
                      children: (
                        <div className={styles.teacherClassCardContainer}>
                          {classes.map(classItem => (
                            <Card
                              key={classItem.id}
                              className={`${styles.teacherClassCard} ${selectedClassId === classItem.id ? styles.teacherSelectedClass : ''}`}
                              hoverable
                              onClick={() => handleClassSelect(classItem)}
                            >
                              {selectedClassId === classItem.id && (
                                <CheckCircleOutlined className={styles.teacherSelectedIcon} />
                              )}

                              <div className={styles.teacherClassCardHeader}>
                                <span className={styles.teacherClassName}>{classItem.name}</span>
                                <Tag color={classItem.status === 'Available' ? 'green' : 'orange'}>
                                  {classItem.status}
                                </Tag>
                              </div>

                              <div className={styles.teacherClassInfoCompact}>
                                {/* Thông tin cơ bản quan trọng nhất */}
                                <div className={styles.teacherClassMainInfo}>
                                  {/* Remove grade level badge for Mầm, Chồi, Lá and only keep for other types */}
                                  {classItem.epName ? (
                                    <Tag color="purple" className={styles.teacherClassTag}>{classItem.epName}</Tag>
                                  ) : null}
                                </div>

                                {/* Hiển thị giáo viên đã phân công - luôn hiển thị */}
                                <div className={styles.teacherAssignedCompact}>
                                  <Text type="secondary">Teacher:</Text>
                                  <div className={styles.teacherTagContainerCompact}>
                                    {classItem.teacherNames && classItem.teacherNames.length > 0 ? (
                                      classItem.teacherNames.map((name, idx) => (
                                        <Tag key={idx} icon={<UserOutlined />}>{name}</Tag>
                                      ))
                                    ) : (
                                      <Text type="secondary" italic>No teacher</Text>
                                    )}
                                  </div>
                                </div>

                                {/* Dung lượng lớp - hiển thị dạng progress */}
                                <div className={styles.teacherCapacityCompact}>
                                  <div className={styles.capacityLabelContainer}>
                                    <Text type="secondary">Capacity:</Text>
                                    <Text className={classItem.quantity >= classItem.maxChildren ? 'capacity-full' : ''}>
                                      {classItem.quantity}/{classItem.maxChildren}
                                    </Text>
                                  </div>
                                  <Progress
                                    percent={(classItem.quantity / classItem.maxChildren) * 100}
                                    showInfo={false}
                                    size="small"
                                    status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
                                  />
                                </div>
                              </div>

                              <div className={styles.teacherCardActions}>
                                <Button
                                  type="default"
                                  size="small"
                                  icon={<InfoCircleOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showClassDetail(classItem);
                                  }}
                                >
                                  Details
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )
                    };
                  })}
                />
              ) : (
                <Empty description="No classes available" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Teacher List Drawer */}
      <Drawer
        title={
          <div className={styles.teacherDrawerHeader}>
            <div className={styles.teacherDrawerTitle}>
              {selectedClass && (
                <>
                  <div className={styles.teacherDrawerTitleText}>
                    Teachers for {selectedClass.name}
                  </div>
                  {selectedClass.epName && (
                    <div className={styles.teacherDrawerSubtitle}>
                      <Tag color="purple">{selectedClass.epName}</Tag>
                    </div>
                  )}
                  {selectedClass.gradeLevelName && (
                  <div className={styles.teacherDrawerSubtitle}>
                    <Tag color="blue">
                      {selectedClass.gradeLevelName}
                    </Tag>
                  </div>
                  )}
                </>
              )}
            </div>
            <div className={styles.teacherSearchContainer}>
              <Input.Search
                placeholder="Search teachers"
                allowClear
                onChange={e => searchTeachers(e.target.value)}
                style={{ width: 180 }}
              />
            </div>
          </div>
        }
        placement="right"
        width={500}
        onClose={closeDrawer}
        open={drawerVisible}
        closeIcon={<CloseOutlined />}
        className={styles.teacherListDrawer}
      >
        {filteredTeachers.length > 0 ? (
          <div className={styles.teacherDrawerList}>
            {filteredTeachers.map(teacher => {
              const isSelected = selectedTeacherId === teacher.id;
              const isAssignedToClass = selectedClass?.teacherNames?.includes(teacher.fullName);

              return (
                <div
                  key={teacher.id}
                  className={`${styles.teacherDrawerCard} ${isSelected ? styles.teacherSelected : ''} ${isAssignedToClass ? styles.teacherAlreadyAssigned : ''}`}
                  onClick={() => !isAssignedToClass && handleTeacherSelect(teacher)}
                >
                  <div className={styles.teacherDrawerContent}>
                    <Avatar
                      icon={<UserOutlined />}
                      size={54}
                      className={styles.teacherDrawerAvatar}
                    />
                    <div className={styles.teacherDrawerInfo}>
                      <h3 className={styles.teacherDrawerName}>{teacher.fullName}</h3>
                      <p className={styles.teacherDrawerDetails}>
                        {teacher.email}
                        <span className={styles.detailSeparator}>•</span>
                        {teacher.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className={styles.teacherDrawerActions}>
                    {isAssignedToClass ? (
                      <Tag color="green">Already Assigned</Tag>
                    ) : (
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeacherSelect(teacher);
                        }}
                      />
                    )}
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        showTeacherDetail(teacher);
                      }}
                      className={styles.teacherDrawerDetailBtn}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="No teachers available" />
        )}

        {/* Bottom actions in drawer */}
        {selectedTeacher && (
          <div className={styles.teacherDrawerFooterActions}>
            <Button
              type="primary"
              onClick={handleAssign}
              loading={assigning}
              size="large"
              icon={<UserOutlined />}
              block
            >
              Assign {selectedTeacher?.fullName} to {selectedClass?.name}
            </Button>
          </div>
        )}
      </Drawer>

      {/* Teacher Detail Modal */}
      <Modal
        title="Teacher Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedTeacher && (
          <div className={styles.teacherDetailContent}>
            <div className={styles.teacherDetailHeader}>
              <Avatar
                icon={<UserOutlined />}
                size={100}
                className={styles.teacherDetailAvatar}
              />
              <div className={styles.teacherDetailTitle}>
                <h2>{selectedTeacher.fullName}</h2>
                <Tag color="blue">{selectedTeacher.roleName}</Tag>
              </div>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className={styles.teacherDetailItem}>
                  <div className={styles.teacherDetailLabel}>Email:</div>
                  <div>{selectedTeacher.email}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.teacherDetailItem}>
                  <div className={styles.teacherDetailLabel}>Phone Number:</div>
                  <div>{selectedTeacher.phoneNumber}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.teacherDetailItem}>
                  <div className={styles.teacherDetailLabel}>Status:</div>
                  <div>
                    <Tag color={selectedTeacher.status === 'Active' ? 'green' : 'red'}>
                      {selectedTeacher.status}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className={styles.teacherDetailItem}>
                  <div className={styles.teacherDetailLabel}>Address:</div>
                  <div>{selectedTeacher.address || 'Not provided'}</div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Modal chi tiết lớp học - thiết kế mới */}
      <Modal
        title={null}
        open={classDetailModalVisible}
        onCancel={() => setClassDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setClassDetailModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="assign"
            type="primary"
            onClick={() => {
              setClassDetailModalVisible(false);
              if (selectedClassDetail) handleClassSelect(selectedClassDetail);
            }}
          >
            Assign teacher
          </Button>
        ]}
        width={700}
        className={styles.classDetailModal}
      >
        {selectedClassDetail && (
          <div className={styles.classDetailContent}>
            {/* Header với tên lớp và trạng thái */}
            <div className={styles.classDetailHeader}>
              <div className={styles.classDetailTitle}>
                <h2>{selectedClassDetail.name}</h2>
                <div className={styles.classDetailBadges}>
                  <Tag color={selectedClassDetail.status === 'Available' ? 'green' : 'orange'}>
                    {selectedClassDetail.status}
                  </Tag>
                  {selectedClassDetail.epName ? (
                    <Tag color="purple">{selectedClassDetail.epName}</Tag>
                  ) : selectedClassDetail.gradeLevelName ? (
                    <Tag color="blue">{selectedClassDetail.gradeLevelName}</Tag>
                  ) : null}
                  <Tag color="gold">{selectedClassDetail.academicYear}</Tag>
                </div>
              </div>
              <div className={styles.classDetailIcon}>
                {selectedClassDetail.epName ? (
                  <div className={`${styles.detailIcon} ${styles.enrichment}`}>
                    <FontAwesomeIcon icon="star" />
                  </div>
                ) : (
                  <div className={`${styles.detailIcon} ${styles.regular}`}>
                    <FontAwesomeIcon icon="graduation-cap" />
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <Card variant="borderless" className={styles.classDetailCard}>
              <div className={styles.classDetailSection}>
                <h3>
                  <FontAwesomeIcon icon="info-circle" /> Basic information
                </h3>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Syllabus:</div>
                      <div className={styles.detailValue}>{selectedClassDetail.syllabusName}</div>
                    </div>
                  </Col>
                  {selectedClassDetail.timetable && (
                    <Col span={12}>
                      <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Schedule:</div>
                        <div className={styles.detailValue}>
                          {formatSchedule(selectedClassDetail.timetable)}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Sĩ số lớp */}
              <div className={styles.classDetailSection}>
                <h3>
                  <FontAwesomeIcon icon="users" /> Class capacity
                </h3>
                <div className={styles.capacitySummary}>
                  <div className={styles.capacityNumbers}>
                    <span className={styles.currentCapacity}>{selectedClassDetail.quantity}</span>
                    <span className={styles.capacitySeparator}>/</span>
                    <span className={styles.maxCapacity}>{selectedClassDetail.maxChildren}</span>
                    <span className={styles.capacityLabel}>students</span>
                  </div>
                  <Progress
                    percent={(selectedClassDetail.quantity / selectedClassDetail.maxChildren) * 100}
                    status={selectedClassDetail.quantity >= selectedClassDetail.maxChildren ? "exception" : "active"}
                    size={{ strokeWidth: 10 }} // Proper way to use size with a strokeWidth
                  />
                </div>
                {selectedClassDetail.quantity >= selectedClassDetail.maxChildren && (
                  <div className={styles.capacityWarning}>
                    <FontAwesomeIcon icon="exclamation-triangle" /> Class is at maximum capacity
                  </div>
                )}
              </div>

              {/* Giáo viên */}
              <div className={styles.classDetailSection}>
                <h3>
                  <FontAwesomeIcon icon="chalkboard-teacher" /> Teacher
                </h3>
                {selectedClassDetail.teacherNames && selectedClassDetail.teacherNames.length > 0 ? (
                  <div className={styles.teachersAssignedList}>
                    {selectedClassDetail.teacherNames.map((name, idx) => (
                      <div className={styles.teacherCard} key={idx}>
                        <Avatar icon={<UserOutlined />} className={styles.staffAssignTeacherAvatar} />
                        <div className={styles.teacherName}>{name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noTeachers}>
                    <Empty
                      description="No teacher assigned"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffAssignTeacherPage;
