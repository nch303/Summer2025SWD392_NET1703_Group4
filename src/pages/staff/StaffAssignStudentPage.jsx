import React, { useState, useEffect } from 'react';
import { Button, message, Spin, Card, Row, Col, Badge, Divider, Avatar, Tag, Typography, Modal, Alert, Progress, Checkbox, Collapse, Space, Empty, Tooltip, Drawer, notification, Radio } from 'antd';
import { getAllClasses, getPaidChildren, assignChildrenToClass } from '../../services/StaffService';
import { UserOutlined, InfoCircleOutlined, CheckCircleOutlined, WarningOutlined, TeamOutlined, PlusOutlined, AppstoreOutlined, CloseOutlined } from '@ant-design/icons';
import styles from './StaffAssignStudentPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const { Title, Text } = Typography;

const StaffAssignStudentPage = () => {
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [classList, setClassList] = useState([]);
  const [classListByGrade, setClassListByGrade] = useState({});
  const [allChildrenList, setAllChildrenList] = useState([]);
  const [filteredChildrenList, setFilteredChildrenList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  // Add drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  // First, add state variables for academic year filtering
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('all');

  // Fetch data
  useEffect(() => {
    fetchClassList();
    fetchChildrenList();
  }, []);

  const fetchClassList = async () => {
    setLoading(true);
    try {
      const data = await getAllClasses();
      // Filter out classes with non-null EP name
      const filteredClasses = data.filter(classItem => classItem.epName === null);
      setClassList(filteredClasses);

      // Extract unique academic years
      const years = [...new Set(filteredClasses.map(c => c.academicYear))].sort();
      setAcademicYears(years);

      // Extract unique grade levels
      const grades = [...new Set(filteredClasses.map(c => c.gradeLevelName).filter(Boolean))];
      setGradeLevels(grades);

      // If no academic year is selected yet, select the most recent one
      if (selectedAcademicYear === 'all' && years.length > 0) {
        setSelectedAcademicYear(years[0]);
      }

      // Apply filters
      let classesToOrganize = filteredClasses;

      // Filter by academic year if selected
      if (selectedAcademicYear !== 'all') {
        classesToOrganize = classesToOrganize.filter(c => c.academicYear === selectedAcademicYear);
      }

      // Filter by grade level if selected
      if (selectedGradeLevel !== 'all') {
        classesToOrganize = classesToOrganize.filter(c => c.gradeLevelName === selectedGradeLevel);
      }

      // Organize classes by grade level
      const classesByGrade = {};
      classesToOrganize.forEach(classItem => {
        if (!classesByGrade[classItem.gradeLevelName]) {
          classesByGrade[classItem.gradeLevelName] = [];
        }
        classesByGrade[classItem.gradeLevelName].push(classItem);
      });
      setClassListByGrade(classesByGrade);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenList = async () => {
    setLoading(true);
    try {
      const data = await getPaidChildren();
      setAllChildrenList(data);
    } catch (err) {
      message.error('Failed to load children list');
    } finally {
      setLoading(false);
    }
  };

  // Select a class and filter students
  const handleClassSelect = (classInfo) => {
    setSelectedClassId(classInfo.id);
    setSelectedClass(classInfo);
    setSelectedChildren([]);
    setSelectAll(false);

    // Filter children by grade level
    const filtered = allChildrenList.filter(
      child => child.gradeLevelName === classInfo.gradeLevelName
    );

    setFilteredChildrenList(filtered);

    // Open the drawer to show students
    setDrawerVisible(true);
  };

  // Toggle select all students
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      // Calculate how many students we can add based on remaining capacity
      const remainingCapacity = selectedClass ? selectedClass.maxChildren - selectedClass.quantity : 0;
      const studentsToAdd = filteredChildrenList.slice(0, remainingCapacity);
      setSelectedChildren(studentsToAdd.map(child => child.id));

      // Show warning if not all students can be added
      if (studentsToAdd.length < filteredChildrenList.length) {
        message.warning(`Only ${remainingCapacity} students can be added due to class capacity limits.`);
      }
    } else {
      setSelectedChildren([]);
    }
  };

  // Toggle a single student selection
  const toggleStudentSelection = (studentId) => {
    const isSelected = selectedChildren.includes(studentId);

    if (isSelected) {
      setSelectedChildren(selectedChildren.filter(id => id !== studentId));
      setSelectAll(false);
    } else {
      // Check if adding this student would exceed class capacity
      if (selectedClass && selectedChildren.length >= selectedClass.maxChildren - selectedClass.quantity) {
        message.warning('Class capacity limit reached. Cannot add more students.');
        return;
      }

      setSelectedChildren([...selectedChildren, studentId]);

      // Check if all students are now selected
      if (selectedChildren.length + 1 === filteredChildrenList.length ||
        selectedChildren.length + 1 === selectedClass.maxChildren - selectedClass.quantity) {
        setSelectAll(true);
      }
    }
  };

  // Handle the assignment process
  const handleAssign = async () => {
    if (!selectedClassId || selectedChildren.length === 0) {
      message.error('Please select a class and at least one student');
      return;
    }

    const className = selectedClass?.name || 'selected class';
    const studentCount = selectedChildren.length;

    setAssigning(true);
    try {
      const loadingMessage = message.loading(`Assigning ${studentCount} student(s) to ${className}...`, 0);

      await assignChildrenToClass(selectedClassId, selectedChildren);

      loadingMessage();

      // Show success notification instead of modal
      notification.success({
        message: 'Assignment Successful',
        description: `${studentCount} student(s) successfully assigned to ${className}!`,
        placement: 'topRight',
        duration: 5,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        className: styles.assignmentSuccessNotification,
        // Replace inline styles with CSS module
        // style: {
        //   boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        //   borderRadius: '8px',
        // }
      });

      // Reset UI state
      setSelectedChildren([]);
      setSelectedClassId(null);
      setSelectedClass(null);
      setSelectAll(false);
      setDrawerVisible(false);

      // Refresh data
      await fetchClassList();
      await fetchChildrenList();
      setFilteredChildrenList([]);

    } catch (err) {
      console.error('Assignment error:', err);

      Modal.error({
        title: 'Assignment Failed',
        content: (
          <div>
            <p>Failed to assign students to class.</p>
            <p>Error: {err.message || 'Unknown error'}</p>
          </div>
        ),
        okText: 'Try Again',
      });
    } finally {
      setAssigning(false);
    }
  };

  // Format date and calculate age
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Show student details in modal
  const showStudentDetail = (student) => {
    setSelectedStudent(student);
    setDetailModalVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedClassId(null);
    setSelectedClass(null);
    setSelectedChildren([]);
    setSelectAll(false);
    setFilteredChildrenList([]);
  };

  // Add handlers for academic year and grade level changes
  const handleAcademicYearChange = (value) => {
    setSelectedAcademicYear(value);

    // Apply filter
    let classesToOrganize = classList.filter(classItem => classItem.epName === null);

    // Filter by academic year
    if (value !== 'all') {
      classesToOrganize = classesToOrganize.filter(c => c.academicYear === value);
    }

    // Keep grade level filter if active
    if (selectedGradeLevel !== 'all') {
      classesToOrganize = classesToOrganize.filter(c => c.gradeLevelName === selectedGradeLevel);
    }

    // Organize classes by grade level
    const classesByGrade = {};
    classesToOrganize.forEach(classItem => {
      if (!classesByGrade[classItem.gradeLevelName]) {
        classesByGrade[classItem.gradeLevelName] = [];
      }
      classesByGrade[classItem.gradeLevelName].push(classItem);
    });
    setClassListByGrade(classesByGrade);
  };

  const handleGradeLevelChange = (e) => {
    const value = e.target.value;
    setSelectedGradeLevel(value);

    // Apply filter
    let classesToOrganize = classList.filter(classItem => classItem.epName === null);

    // Keep academic year filter if active
    if (selectedAcademicYear !== 'all') {
      classesToOrganize = classesToOrganize.filter(c => c.academicYear === selectedAcademicYear);
    }

    // Filter by grade level
    if (value !== 'all') {
      classesToOrganize = classesToOrganize.filter(c => c.gradeLevelName === value);
    }

    // Organize classes by grade level
    const classesByGrade = {};
    classesToOrganize.forEach(classItem => {
      if (!classesByGrade[classItem.gradeLevelName]) {
        classesByGrade[classItem.gradeLevelName] = [];
      }
      classesByGrade[classItem.gradeLevelName].push(classItem);
    });
    setClassListByGrade(classesByGrade);
  };

  return (
    <div className={styles.staffAssignContainer}>
      <div className={styles.staffAssignPageHeader}>
        <Title level={2} className={styles.staffAssignPageTitle}>Assign Students to Class</Title>
        <div className={styles.studentCounter}>
          <Badge count={selectedChildren.length} offset={[0, 10]}>
            <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </Badge>
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {/* Class selection section */}
          <Col span={24}>
            <Card
              title={
                <div className={styles.cardTitleWithIcon} >
                  <AppstoreOutlined /> Classes by Grade Level
                </div>
              }
              className={styles.staffAssignCard}
              extra={
                <div className={styles.cardHeaderActions}>
                  {/* Academic year filter */}
                  <div className={styles.academicYearFilter}>
                    <span className={styles.filterLabel}> Academic year:</span>
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

                  {/* Grade level filter */}
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
                        <Radio.Button key={grade} value={grade}>
                          {grade}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>

                  {/* Selected class tag */}
                  {selectedClass && (
                    <Tag color="blue" className={styles.selectedClassTag}>
                      Selected: {selectedClass.name}
                    </Tag>
                  )}
                </div>
              }
            >
              {Object.keys(classListByGrade).length > 0 ? (
                <Collapse
                  defaultActiveKey={Object.keys(classListByGrade)}
                  className={styles.gradeCollapse}
                  items={Object.entries(classListByGrade).map(([gradeName, classes]) => ({
                    key: gradeName,
                    label: (
                      <span className={styles.gradeHeader}>
                        <span className={styles.gradeName}>{gradeName}</span>
                        <Tag color="blue" className={styles.gradeCount}>{classes.length} classes</Tag>
                      </span>
                    ),
                    children: (
                      <div className={styles.classCardContainer}>
                        {classes.map(classItem => (
                          <Card
                            key={classItem.id}
                            className={`${styles.classCard} ${selectedClassId === classItem.id ? styles.selectedClass : ''}`}
                            onClick={() => handleClassSelect(classItem)}
                          >
                            {selectedClassId === classItem.id && (
                              <CheckCircleOutlined className={styles.selectedIcon} />
                            )}

                            <div className={styles.classCardHeader}>
                              <span className={styles.className}>{classItem.name}</span>
                            </div>

                            <div className={styles.classInfo}>
                              <p>
                                <Text strong>Syllabus:</Text> {classItem.syllabusName}
                              </p>
                              <p>
                                <Text strong>Status:</Text>{' '}
                                <Tag color={classItem.status === 'Available' ? 'green' : 'red'}>
                                  {classItem.status || 'Unknown'}
                                </Tag>
                              </p>
                              <div className={styles.capacitySection}>
                                <div className={styles.capacityText}>
                                  <Text strong>Capacity:</Text>
                                  <span className={classItem.quantity >= classItem.maxChildren ? styles.capacityFull : ''}>
                                    {classItem.quantity}/{classItem.maxChildren} students
                                  </span>
                                </div>
                                <Progress
                                  percent={(classItem.quantity / classItem.maxChildren) * 100}
                                  showInfo={false}
                                  status={classItem.quantity >= classItem.maxChildren ? "exception" : "active"}
                                  size="small"
                                  className={styles.capacityProgress}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )
                  }))}
                />
              ) : (
                <Empty description="No classes available" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Student List Drawer */}
      <Drawer
        title={
          <div className={styles.drawerHeader}>
            <div className={styles.drawerTitle}>
              {selectedClass && (
                <>
                  <div className={styles.drawerTitleText}>
                    Students for {selectedClass.gradeLevelName} - {selectedClass.name}
                  </div>
                  <div className={styles.drawerSubtitle}>
                    <Tooltip title={`${selectedClass.quantity}/${selectedClass.maxChildren} students currently in class`}>
                      <Tag color={selectedClass.quantity >= selectedClass.maxChildren ? "red" : "green"}>
                        {selectedClass.maxChildren - selectedClass.quantity} spots available
                      </Tag>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>
            <Checkbox
              onChange={handleSelectAll}
              checked={selectAll}
              disabled={selectedClass && selectedClass.quantity >= selectedClass.maxChildren}
            >
              Select All
            </Checkbox>
          </div>
        }
        placement="right"
        width={500}
        onClose={closeDrawer}
        open={drawerVisible}
        closeIcon={<CloseOutlined />}
        className={styles.studentListDrawer}
      >
        {filteredChildrenList.length > 0 ? (
          <div className={styles.drawerStudentList}>
            {filteredChildrenList.map(student => {
              const isSelected = selectedChildren.includes(student.id);
              const isCapacityReached = !isSelected &&
                selectedClass && selectedClass.quantity + selectedChildren.length >= selectedClass.maxChildren;

              return (
                <div
                  key={student.id}
                  className={`${styles.drawerStudentCard} ${isSelected ? styles.selectedStudent : ''}`}
                  onClick={() => !isCapacityReached && toggleStudentSelection(student.id)}
                >
                  <div className={styles.drawerStudentContent}>
                    <Avatar
                      src={student.avatar}
                      icon={!student.avatar && <UserOutlined />}
                      size={54}
                      className={styles.studentAvatar}
                    />
                    <div className={styles.drawerStudentInfo}>
                      <h3 className={styles.drawerStudentName}>{student.name}</h3>
                      <p className={styles.drawerStudentDetails}>
                        {formatDate(student.birthday)} ({calculateAge(student.birthday)} years)
                        <span className={styles.detailSeparator}>•</span>
                        {student.gender}
                      </p>
                    </div>
                  </div>

                  <div className={styles.drawerStudentActions}>
                    <Checkbox
                      checked={isSelected}
                      disabled={isCapacityReached && !isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isCapacityReached || isSelected) {
                          toggleStudentSelection(student.id);
                        }
                      }}
                    />
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        showStudentDetail(student);
                      }}
                      className={styles.drawerDetailBtn}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty description="No students available for this grade level" />
        )}

        {/* Show warning if we're close to capacity */}
        {selectedClass && selectedClass.maxChildren - selectedClass.quantity - selectedChildren.length <= 3 &&
          selectedClass.maxChildren - selectedClass.quantity > 0 && (
            <Alert
              message="Class is almost full"
              description={`This class has only ${selectedClass.maxChildren - selectedClass.quantity - selectedChildren.length} spots remaining after your current selection.`}
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginTop: 16 }}
            />
          )}

        {/* Show error if class is full */}
        {selectedClass && selectedClass.maxChildren <= selectedClass.quantity && (
          <Alert
            message="Class is at full capacity"
            description="This class cannot accept any more students. Please select another class."
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {/* Bottom actions in drawer */}
        {selectedChildren.length > 0 && (
          <div className={styles.drawerFooterActions}>
            <Button
              type="primary"
              onClick={handleAssign}
              loading={assigning}
              size="large"
              icon={<PlusOutlined />}
              block
            >
              Assign {selectedChildren.length} Student{selectedChildren.length !== 1 ? 's' : ''} to {selectedClass?.name}
            </Button>
          </div>
        )}
      </Drawer>

      {/* Student Detail Modal - Improved Design */}
      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
        className={styles.studentDetailModal}
        wrapClassName={styles.studentDetailModalWrapper}
      >
        {selectedStudent && (
          <div className={styles.studentDetailContent}>
            {/* Header with student name */}
            <div className={styles.studentDetailHeader}>
              <div className={styles.studentDetailTitle}>
                <h2>{selectedStudent.name}</h2>
                <div className={styles.studentDetailBadges}>
                  <Tag color="blue">{selectedStudent.gradeLevelName}</Tag>
                  <Tag color={selectedStudent.gender === 'Male' ? 'blue' : 'magenta'}>{selectedStudent.gender}</Tag>
                </div>
              </div>
              <Avatar
                src={selectedStudent.avatar}
                icon={!selectedStudent.avatar && <UserOutlined />}
                size={80}
                className={styles.studentDetailAvatar}
              />
            </div>

            {/* Student information card */}
            <Card variant="borderless" className={styles.studentDetailCard}>
              <div className={styles.studentDetailSection}>
                <h3>
                  <FontAwesomeIcon icon="user" /> Thông tin cá nhân
                </h3>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Birthday:</div>
                      <div className={styles.detailValue}>{formatDate(selectedStudent.birthday)} ({calculateAge(selectedStudent.birthday)} years)</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Birth certificate:</div>
                      <div className={styles.detailValue}>
                        {selectedStudent.birthCertificate ? (
                          <a href={selectedStudent.birthCertificate} target="_blank" rel="noopener noreferrer">
                            View certificate
                          </a>
                        ) : (
                          'No certificate'
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className={styles.studentDetailSection}>
                <h3>
                  <FontAwesomeIcon icon="home" /> Contact information
                </h3>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Parent:</div>
                      <div className={styles.detailValue}>{selectedStudent.parentName}</div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Phone number:</div>
                      <div className={styles.detailValue}>{selectedStudent.phoneNumber}</div>
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>City:</div>
                      <div className={styles.detailValue}>{selectedStudent.city}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className={styles.studentDetailSection}>
                <h3>
                  <FontAwesomeIcon icon="calendar-alt" /> Learning information
                </h3>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Enrollment date:</div>
                      <div className={`${styles.detailValue} ${styles.highlight}`}>
                        {formatDate(selectedStudent.enrollDate)}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>Grade level:</div>
                      <div className={styles.detailValue}>
                        <Tag color="blue">{selectedStudent.gradeLevelName}</Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffAssignStudentPage; 