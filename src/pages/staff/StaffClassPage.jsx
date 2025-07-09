import React, { useState, useEffect } from 'react';
import {
  Card, Button, Spin, Avatar, Tag, Typography, Radio,
  Row, Col, message, Modal, Tabs, Badge, Table, Alert,
  Progress, Empty, Tooltip, Popconfirm, Checkbox,
  UserOutlined, InfoCircleOutlined, CheckCircleOutlined,
  CalendarOutlined, TeamOutlined, CloseOutlined,
  DeleteOutlined, WarningOutlined, Title, Text, TabPane
} from '../../utils/AntComponents';
import styles from './StaffClassPage.module.css';
import { getAllClasses, getClassAttendance, 
  getStudentsByClassId, kickStudentFromClass, 
  kickStudentFromEnrichmentClass, openClass, 
  finishClass, upgradeStudents, 
  upgradeEnrichmentStudents } from '../../services/StaffService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { useCustomToast } from '../../components/toast/CustomToast';

const StaffClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [classesByCategory, setClassesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [groupedAttendance, setGroupedAttendance] = useState({});
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('all');
  const [activeTab, setActiveTab] = useState('1');
  const [activeDate, setActiveDate] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [kickingStudent, setKickingStudent] = useState(false);
  const [openingClass, setOpeningClass] = useState(false);
  const [finishingClass, setFinishingClass] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [upgradingStudents, setUpgradingStudents] = useState(false);
  const [selectAllStudents, setSelectAllStudents] = useState(false);
  const toast = useCustomToast();

  // Fetch data
  useEffect(() => {
    fetchClassList();
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

      // Extract unique grade levels, but group all enrichment classes
      const regularGrades = [...new Set(activeClasses
        .filter(c => c.gradeLevelName)
        .map(c => c.gradeLevelName))];

      // Add a single "Enrichment" option instead of individual enrichment programs
      const hasEnrichmentClasses = activeClasses.some(c => c.epName);

      // Set grade levels with any regular grades plus a single "Năng khiếu" option if needed
      setGradeLevels([
        ...regularGrades,
        ...(hasEnrichmentClasses ? ["Enrichment"] : [])
      ]);

      // If no academic year is selected yet, select the most recent one
      if (selectedAcademicYear === 'all' && years.length > 0) {
        setSelectedAcademicYear(years[0]);
      }

      organizeClasses(activeClasses, selectedAcademicYear, selectedGradeLevel);
    } catch (err) {
      message.error('Failed to load class list');
    } finally {
      setLoading(false);
    }
  };

  const organizeClasses = (classData, academicYear, gradeLevel) => {
    let filteredClasses = classData;

    // Filter by academic year if selected
    if (academicYear !== 'all') {
      filteredClasses = filteredClasses.filter(c => c.academicYear === academicYear);
    }

    // Filter by grade level if selected
    if (gradeLevel !== 'all') {
      filteredClasses = filteredClasses.filter(c => {
        if (gradeLevel === "Enrichment") {
          // Show all enrichment classes for the "Enrichment" filter
          return c.epName !== null;
        } else {
          // Show regular classes with the specific grade level
          return c.gradeLevelName === gradeLevel;
        }
      });
    }

    // Organize classes into just two categories
    const organizedClasses = {
      regularClasses: [],
      enrichmentClasses: []
    };

    filteredClasses.forEach(classItem => {
      if (classItem.epName) {
        // It's an enrichment class (has epName)
        organizedClasses.enrichmentClasses.push(classItem);
      } else {
        // It's a regular class
        organizedClasses.regularClasses.push(classItem);
      }
    });

    setClassesByCategory(organizedClasses);
  };

  const handleAcademicYearChange = (value) => {
    setSelectedAcademicYear(value);
    organizeClasses(classes, value, selectedGradeLevel);
  };

  const handleGradeLevelChange = (e) => {
    setSelectedGradeLevel(e.target.value);
    organizeClasses(classes, selectedAcademicYear, e.target.value);
  };

  const showClassDetail = async (classItem) => {
    setSelectedClass(classItem);
    setDetailModalVisible(true);
    setActiveTab('1'); // Reset to info tab

    // If the class has students, fetch attendance records
    if (classItem.quantity > 0) {
      setAttendanceLoading(true);
      try {
        const data = await getClassAttendance(classItem.id);
        setAttendanceRecords(data);

        // Group attendance records by date
        const grouped = {};
        data.forEach(record => {
          const date = record.date.split('T')[0];
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(record);
        });

        setGroupedAttendance(grouped);

        // Set initial activeDate if there are attendance records
        if (Object.keys(grouped).length > 0) {
          setActiveDate(Object.keys(grouped)[0]);
        }
      } catch (err) {
        message.error('Failed to load attendance records');
      } finally {
        setAttendanceLoading(false);
      }

      // Fetch students list
      setStudentsLoading(true);
      try {
        const studentData = await getStudentsByClassId(classItem.id);
        setStudents(studentData);
      } catch (err) {
        message.error('Failed to load students list');
      } finally {
        setStudentsLoading(false);
      }
    }
  };

  // Format timetable from numbers to day names
  const formatSchedule = (timetable) => {
    if (!timetable) return "No schedule";

    return timetable.split(',').map(day => {
      const dayNum = day.trim();
      if (dayNum === '1') return 'Sunday';
      if (dayNum >= '2' && dayNum <= '7') return `Day ${dayNum}`;
      return dayNum; // In case it's not a number from 1-7
    }).join(', ');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Format date function for student age calculation
  const calculateAge = (birthday) => {
    if (!birthday) return "N/A";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${age} years old`;
  };

  // Render attendance table columns
  const attendanceColumns = [
    {
      title: 'Student name',
      dataIndex: 'childrenName',
      key: 'childrenName',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'Attend' ? 'green' : 'red'}>
          {status === 'Attend' ? 'Present' : 'Absent'}
        </Tag>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text) => text || <Text type="secondary" italic>No notes</Text>,
    }
  ];

  // Handle kicking student
  const handleKickStudent = async (childId, studentName) => {
    if (!selectedClass || !childId) return;

    setKickingStudent(true);
    try {
      // Choose the appropriate API based on whether it's an enrichment class
      const response = selectedClass.epName
        ? await kickStudentFromEnrichmentClass(childId, selectedClass.id)
        : await kickStudentFromClass(childId, selectedClass.id);

      toast.success(response.message || 'Student removed from class successfully', {
        title: 'Student removed successfully',
        duration: 3000
      });

      // Refresh student list
      const updatedStudents = await getStudentsByClassId(selectedClass.id);
      setStudents(updatedStudents);

      // Also update the class data since the student count has changed
      fetchClassList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot remove student from class', {
        title: 'Error',
        duration: 5000
      });
    } finally {
      setKickingStudent(false);
    }
  };

  // Add handler for opening a class
  const handleOpenClass = async (classId, e) => {
    if (e) e.stopPropagation(); // Prevent triggering row click

    setOpeningClass(true);
    try {
      const response = await openClass(classId);
      toast.success(response.message || 'Class opened successfully', {
        title: 'Class opened successfully',
        duration: 3000
      });

      // Refresh the class list
      fetchClassList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot open class', {
        title: 'Error',
        duration: 5000
      });
    } finally {
      setOpeningClass(false);
    }
  };

  // Add handler for finishing a class
  const handleFinishClass = async (classId, e) => {
    if (e) e.stopPropagation(); // Prevent triggering row click

    setFinishingClass(true);
    try {
      const response = await finishClass([classId]); // API expects an array of class IDs
      toast.success(response.message || 'Class finished successfully', {
        title: 'Class finished successfully',
        duration: 3000
      });

      // Refresh the class list
      fetchClassList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot finish class', {
        title: 'Error',
        duration: 5000
      });
    } finally {
      setFinishingClass(false);
    }
  };

  // Student table columns
  const studentColumns = [
    ...(selectedClass?.status === 'Finished' ? [{
      title: <Checkbox
        checked={selectAllStudents}
        onChange={(e) => handleSelectAllStudentsToggle(e.target.checked)}
      />,
      dataIndex: 'selection',
      key: 'selection',
      width: 50,
      render: (_, record) => {
        // For regular classes: disable for Graduated/Completed students
        // For enrichment classes: disable for Completed students
        const isDisabled = selectedClass.epName
          ? record.enrichmentClassChildrenStatus === 'Completed'
          : (record.childrenGradeStatus === 'Graduated' || record.childrenGradeStatus === 'Completed');

        return (
          <Checkbox
            checked={selectedStudentIds.includes(record.id)}
            onChange={() => toggleStudentSelection(record.id)}
            disabled={isDisabled}
          />
        );
      },
    }] : []),
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar
            src={record.avatar}
            icon={!record.avatar && <UserOutlined />}
            size="large"
          />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender) => (
        <Tag color={gender === 'Male' ? 'blue' : 'pink'}>
          {gender === 'Male' ? 'Male' : 'Female'}
        </Tag>
      ),
    },
    {
      title: 'Birthday',
      dataIndex: 'birthday',
      key: 'birthday',
      width: 150,
      render: (birthday) => (
        <div>
          <div>{formatDate(birthday)}</div>
          <small style={{ color: '#8c8c8c' }}>{calculateAge(birthday)}</small>
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Status',
      dataIndex: selectedClass?.epName ? 'enrichmentClassChildrenStatus' : 'childrenGradeStatus',
      key: 'status',
      width: 120,
      render: (status, record) => {
        let color = 'green';
        let text = status;

        // For enrichment classes
        if (selectedClass?.epName) {
          switch (record.enrichmentClassChildrenStatus) {
            case 'Completed':
              color = 'purple';
              text = 'Completed';
              break;
            case 'Active':
              color = 'green';
              text = 'Active';
              break;
            default:
              color = 'default';
          }
        }
        // For regular classes
        else {
          switch (record.childrenGradeStatus) {
            case 'Graduated':
              color = 'purple';
              text = 'Graduated';
              break;
            case 'Completed':
              color = 'blue';
              text = 'Completed';
              break;
            case 'Active':
              color = 'green';
              text = 'Active';
              break;
            default:
              color = 'default';
              text = record.childrenGradeStatus || 'N/A';
          }
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      align: 'center',
      render: (_, record) => {
        // Hide delete button for Graduated/Completed students in regular classes
        // Hide delete button for Completed students in enrichment classes
        const isCompleted = selectedClass?.epName
          ? record.enrichmentClassChildrenStatus === 'Completed'
          : (record.childrenGradeStatus === 'Graduated' || record.childrenGradeStatus === 'Completed');

        if (isCompleted) {
          return null;
        }

        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Popconfirm
              title="Remove student from class"
              description={`Are you sure you want to remove student "${record.name}" from this class?`}
              onConfirm={() => handleKickStudent(record.id, record.name)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
              maskClosable={false}
            >
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                size="small"
                loading={kickingStudent}
                className={styles.staffKickStudentBtn}
              >
                Remove
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  // Add this function to handle student upgrade
  const handleUpgradeStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.warning('Please select at least one student to upgrade', {
        title: 'Select student',
        duration: 3000
      });
      return;
    }

    setUpgradingStudents(true);
    try {
      const response = await upgradeStudents(selectedStudentIds);
      toast.success(response.message || 'Students have been upgraded to the next grade level.', {
        title: 'Upgrade successful',
        duration: 3000
      });

      // Reset selection
      setSelectedStudentIds([]);
      setSelectAllStudents(false);

      // Refresh the class list to show updated data
      fetchClassList();

      // Refresh the student list if needed
      if (selectedClass) {
        const updatedStudents = await getStudentsByClassId(selectedClass.id);
        setStudents(updatedStudents);
      }
    } catch (error) {
      // Check for the specific error message
      if (error.response?.status === 400 && error.response?.data?.message === "Children are not eligible to move up to grade level.") {
        toast.error('Students are not eligible to move up to the next grade level.', {
          title: 'Cannot upgrade',
          duration: 5000
        });
      } else {
        toast.error(error.response?.data?.message || 'Cannot upgrade students', {
          title: 'Error',
          duration: 5000
        });
      }
    } finally {
      setUpgradingStudents(false);
    }
  };

  // Add this function to handle enrichment upgrade
  const handleUpgradeEnrichmentStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.warning('Please select at least one student to upgrade', {
        title: 'Select student',
        duration: 3000
      });
      return;
    }

    setUpgradingStudents(true);
    try {
      const response = await upgradeEnrichmentStudents(selectedClass.id, selectedStudentIds);
      toast.success(response.message || 'Students have been upgraded to the next enrichment level.', {
        title: 'Upgrade successful',
        duration: 3000
      });

      // Reset selection
      setSelectedStudentIds([]);
      setSelectAllStudents(false);

      // Refresh the class list
      fetchClassList();

      // Refresh the student list if needed
      if (selectedClass) {
        const updatedStudents = await getStudentsByClassId(selectedClass.id);
        setStudents(updatedStudents);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot upgrade enrichment students', {
        title: 'Error',
        duration: 5000
      });
    } finally {
      setUpgradingStudents(false);
    }
  };

  // Update the handleSelectAllStudentsToggle function
  const handleSelectAllStudentsToggle = (checked) => {
    setSelectAllStudents(checked);
    if (checked) {
      // Only select students who are eligible for upgrade
      // For regular classes: not Graduated or Completed
      // For enrichment classes: not Completed
      const eligibleStudentIds = students
        .filter(student => {
          if (selectedClass?.epName) {
            return student.enrichmentClassChildrenStatus !== 'Completed';
          } else {
            return (student.childrenGradeStatus !== 'Graduated' &&
              student.childrenGradeStatus !== 'Completed');
          }
        })
        .map(student => student.id);

      setSelectedStudentIds(eligibleStudentIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  // Update the toggleStudentSelection function
  const toggleStudentSelection = (studentId) => {
    const student = students.find(s => s.id === studentId);

    // Check if student is eligible for selection based on class type
    const isIneligible = selectedClass?.epName
      ? student.enrichmentClassChildrenStatus === 'Completed'
      : (student.childrenGradeStatus === 'Graduated' || student.childrenGradeStatus === 'Completed');

    // Don't allow selection of ineligible students
    if (isIneligible) {
      return;
    }

    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
      setSelectAllStudents(false);
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);

      // Check if all eligible students are now selected
      const eligibleStudents = students.filter(s => {
        if (selectedClass?.epName) {
          return s.enrichmentClassChildrenStatus !== 'Completed';
        } else {
          return (s.childrenGradeStatus !== 'Graduated' &&
            s.childrenGradeStatus !== 'Completed');
        }
      });

      if (selectedStudentIds.length + 1 === eligibleStudents.length) {
        setSelectAllStudents(true);
      }
    }
  };

  return (
    <div className={styles.staffClassContainer}>
      <div className={styles.staffClassPageHeader}>
        <Title level={2} className={styles.staffClassPageTitle}>Class management</Title>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {/* Class list section */}
          <Col span={24}>
            <Card
              className={styles.staffClassCard}
              extra={
                <div className={styles.staffCardHeaderActions}>
                  {/* Bộ lọc theo năm học */}
                  <div className={styles.staffAcademicYearFilter}>
                    <span className={styles.staffFilterLabel}>Academic year:</span>
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
                    <span className={styles.staffAcademicYearDisplay}>
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
                  <div className={styles.staffGradeLevelFilter}>
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
                        >
                          {grade}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                </div>
              }
            >
              {/* Regular Classes */}
              {classesByCategory.regularClasses?.length > 0 && (
                <div className={styles.staffClassSection}>
                  <div className={`${styles.staffClassSectionHeader} ${styles.regular}`}>
                    <FontAwesomeIcon icon="graduation-cap" className={styles.staffClassSectionIcon} />
                    <span className={styles.staffSectionTitle}>Regular classes</span>
                    <Tag color="blue" className={styles.staffSectionCount}>
                      {classesByCategory.regularClasses.length} classes
                    </Tag>
                  </div>

                  <div className={styles.staffClassListContainer}>
                    <Table
                      dataSource={classesByCategory.regularClasses}
                      rowKey="id"
                      rowClassName={styles.staffRegularRow}
                      onRow={(record) => ({
                        onClick: () => showClassDetail(record),
                        style: { cursor: 'pointer' }
                      })}
                      columns={[
                        {
                          title: 'Class name',
                          dataIndex: 'name',
                          key: 'name',
                          render: (text) => <span className={styles.staffClassNameCell}>{text}</span>
                        },
                        {
                          title: 'Grade level',
                          dataIndex: 'gradeLevelName',
                          key: 'gradeLevelName',
                          render: (text) => text || <span className={styles.staffTextMuted}>-</span>
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          width: 120,
                          render: (status) => (
                            <Tag color={status === 'Available' ? 'green' : 'orange'}>
                              {status}
                            </Tag>
                          )
                        },
                        {
                          title: 'Quantity',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: 200,
                          render: (quantity, record) => (
                            <div className={styles.staffClassCapacityCell}>
                              <span className={quantity >= record.maxChildren ? styles.staffCapacityFull : ''}>
                                {quantity}/{record.maxChildren}
                              </span>
                              <Progress
                                percent={(quantity / record.maxChildren) * 100}
                                showInfo={false}
                                size="small"
                                status={quantity >= record.maxChildren ? "exception" : "active"}
                              />
                            </div>
                          )
                        },
                        {
                          title: 'Teacher',
                          dataIndex: 'teacherNames',
                          key: 'teacherNames',
                          render: (teacherNames) => (
                            <div className={styles.staffClassTeacherTags}>
                              {teacherNames && teacherNames.length > 0 ? (
                                teacherNames.map((name, idx) => (
                                  <Tag key={idx} icon={<UserOutlined />}>{name}</Tag>
                                ))
                              ) : (
                                <Text type="secondary" italic>No teacher</Text>
                              )}
                            </div>
                          )
                        },
                        {
                          title: 'Action',
                          key: 'action',
                          width: 180,
                          align: 'center',
                          render: (_, record) => (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <Button
                                type="primary"
                                icon={<InfoCircleOutlined />}
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showClassDetail(record);
                                }}
                              >
                                Detail
                              </Button>

                              {record.status === 'Available' && (
                                <Popconfirm
                                  description={
                                    <div>
                                      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Warning:</span>
                                      </div>
                                      <p>Please ensure the academic year has ended before performing this action.</p>
                                      <p>Are you sure you want to finish this class?</p>
                                    </div>
                                  }
                                  onConfirm={(e) => handleFinishClass(record.id, e)}
                                  okText="Yes, finish class"
                                  cancelText="Cancel"
                                  okButtonProps={{
                                    style: { backgroundColor: '#faad14', borderColor: '#faad14' },
                                    loading: finishingClass
                                  }}
                                  icon={<WarningOutlined style={{ color: '#faad14' }} />}
                                  maskClosable={false}
                                >
                                  <Button
                                    type="default"
                                    danger
                                    className={styles.staffFinishClassBtn}
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Finish
                                  </Button>
                                </Popconfirm>
                              )}

                              {record.status !== 'Available' && record.status !== 'Finished' && (
                                <Button
                                  type="success"
                                  className={styles.staffOpenClassBtn}
                                  icon={<CheckCircleOutlined />}
                                  size="small"
                                  onClick={(e) => handleOpenClass(record.id, e)}
                                  loading={openingClass}
                                >
                                  Open
                                </Button>
                              )}
                            </div>
                          )
                        }
                      ]}
                      pagination={false}
                      className={styles.staffClassTable}
                    />
                  </div>
                </div>
              )}

              {/* Enrichment Classes */}
              {classesByCategory.enrichmentClasses?.length > 0 && (
                <div className={styles.staffClassSection}>
                  <div className={`${styles.staffClassSectionHeader} ${styles.enrichment}`}>
                    <FontAwesomeIcon icon="star" className={styles.staffSectionEnrichmentIcon} />
                    <span className={styles.staffSectionTitle}>Enrichment classes</span>
                    <Tag color="purple" className={styles.staffSectionCount}>
                      {classesByCategory.enrichmentClasses.length} classes
                    </Tag>
                  </div>

                  <div className={styles.staffClassListContainer}>
                    <Table
                      dataSource={classesByCategory.enrichmentClasses}
                      rowKey="id"
                      rowClassName={styles.staffEnrichmentRow}
                      onRow={(record) => ({
                        onClick: () => showClassDetail(record),
                        style: { cursor: 'pointer' }
                      })}
                      columns={[
                        {
                          title: 'Class name',
                          dataIndex: 'name',
                          key: 'name',
                          render: (text) => <span className={styles.staffClassNameCell}>{text}</span>
                        },
                        {
                          title: 'Program',
                          dataIndex: 'epName',
                          key: 'epName',
                          render: (text) => text || <span className={styles.staffTextMuted}>-</span>
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          width: 120,
                          render: (status) => (
                            <Tag color={status === 'Available' ? 'green' : 'orange'}>
                              {status}
                            </Tag>
                          )
                        },
                        {
                          title: 'Quantity',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: 200,
                          render: (quantity, record) => (
                            <div className={styles.staffClassCapacityCell}>
                              <span className={quantity >= record.maxChildren ? styles.staffCapacityFull : ''}>
                                {quantity}/{record.maxChildren}
                              </span>
                              <Progress
                                percent={(quantity / record.maxChildren) * 100}
                                showInfo={false}
                                size="small"
                                status={quantity >= record.maxChildren ? "exception" : "active"}
                              />
                            </div>
                          )
                        },
                        {
                          title: 'Teacher',
                          dataIndex: 'teacherNames',
                          key: 'teacherNames',
                          render: (teacherNames) => (
                            <div className={styles.staffClassTeacherTags}>
                              {teacherNames && teacherNames.length > 0 ? (
                                teacherNames.map((name, idx) => (
                                  <Tag key={idx} icon={<UserOutlined />}>{name}</Tag>
                                ))
                              ) : (
                                <Text type="secondary" italic>No teacher</Text>
                              )}
                            </div>
                          )
                        },
                        {
                          title: 'Action',
                          key: 'action',
                          width: 180,
                          align: 'center',
                          render: (_, record) => (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <Button
                                type="primary"
                                icon={<InfoCircleOutlined />}
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showClassDetail(record);
                                }}
                              >
                                Detail
                              </Button>

                              {record.status === 'Available' && (
                                <Popconfirm
                                  description={
                                    <div>
                                      <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Warning:</span>
                                      </div>
                                      <p>Please ensure the academic year has ended before performing this action.</p>
                                      <p>Are you sure you want to finish this class?</p>
                                    </div>
                                  }
                                  onConfirm={(e) => handleFinishClass(record.id, e)}
                                  okText="Yes, finish class"
                                  cancelText="Cancel"
                                  okButtonProps={{
                                    style: { backgroundColor: '#faad14', borderColor: '#faad14' },
                                    loading: finishingClass
                                  }}
                                  icon={<WarningOutlined style={{ color: '#faad14' }} />}
                                  maskClosable={false}
                                >
                                  <Button
                                    type="default"
                                    danger
                                    className={styles.staffFinishClassBtn}
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Finish
                                  </Button>
                                </Popconfirm>
                              )}

                              {record.status !== 'Available' && record.status !== 'Finished' && (
                                <Button
                                  type="success"
                                  className={styles.staffOpenClassBtn}
                                  icon={<CheckCircleOutlined />}
                                  size="small"
                                  onClick={(e) => handleOpenClass(record.id, e)}
                                  loading={openingClass}
                                >
                                  Open
                                </Button>
                              )}
                            </div>
                          )
                        }
                      ]}
                      pagination={false}
                      className={styles.staffClassTable}
                    />
                  </div>
                </div>
              )}

              {Object.keys(classesByCategory.regularClasses || {}).length === 0 &&
                Object.keys(classesByCategory.enrichmentClasses || {}).length === 0 && (
                  <Empty description="No class found" />
                )}
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* Class Detail Modal - Enhanced UI */}
      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        className={styles.staffClassDetailModal}
      >
        {selectedClass && (
          <div className={styles.staffClassDetailContent}>
            {/* Enhanced header with gradient background */}
            <div className={`${styles.staffClassDetailHeader} ${selectedClass.epName ? styles.enrichment : styles.regular}`}>
              <div className={styles.staffClassDetailTitle}>
                <h2>{selectedClass.name}</h2>
                <div className={styles.staffClassDetailBadges}>
                  <Tag color={selectedClass.status === 'Available' ? 'green' : 'orange'}>
                    {selectedClass.status}
                  </Tag>
                  {selectedClass.epName ? (
                    <Tag color="purple">{selectedClass.epName}</Tag>
                  ) : selectedClass.gradeLevelName ? (
                    <Tag color="blue">{selectedClass.gradeLevelName}</Tag>
                  ) : null}
                  <Tag color="gold">{selectedClass.academicYear}</Tag>
                </div>
              </div>
              <div className={styles.staffDetailIcon}>
                {selectedClass.epName ? (
                  <div className={`${styles.staffDetailIcon} ${styles.enrichment}`}>
                    <FontAwesomeIcon icon="star" />
                  </div>
                ) : (
                  <div className={`${styles.staffDetailIcon} ${styles.regular}`}>
                    <FontAwesomeIcon icon="graduation-cap" />
                  </div>
                )}
              </div>
            </div>

            {/* Tabs with enhanced styling */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className={styles.staffClassDetailTabs}
              type="card"
              items={[
                {
                  key: "1",
                  label: (
                    <span className={styles.tabLabel}>
                      <InfoCircleOutlined /> Class information
                    </span>
                  ),
                  children: (
                    <div className={styles.staffClassDetailTabContent}>
                      <Row gutter={[24, 24]}>
                        {/* Left column: Basic Information */}
                        <Col span={14}>
                          <Card>
                            <Row gutter={[16, 16]}>
                              <Col span={16}>
                                <div className={styles.staffClassDetailItem}> 
                                  <div className={styles.staffClassDetailLabel}>Learning program:</div>
                                  <div className={styles.staffClassDetailValue}>{selectedClass.syllabusName}</div>
                                </div>
                              </Col>

                              {selectedClass.epName && (
                                <Col span={12}>
                                  <div className={styles.staffClassDetailItem}>
                                    <div className={styles.staffClassDetailLabel}>Enrichment program:</div>
                                    <div className={styles.staffClassDetailValue}>
                                      <Tag color="purple">{selectedClass.epName}</Tag>
                                    </div>
                                  </div>
                                </Col>
                              )}

                              {selectedClass.timetable && (
                                <Col span={24}>
                                  <div className={styles.staffClassDetailItem}>
                                    <div className={styles.staffClassDetailLabel}>Schedule:</div>
                                    <div className={`${styles.staffClassDetailValue} ${styles.highlight} ${styles.scheduleDisplay}`}>
                                      {formatSchedule(selectedClass.timetable).split(', ').map((day, index) => (
                                        <Tag key={index} color="blue" className={styles.staffScheduleDayTag}>
                                          {day}
                                        </Tag>
                                      ))}
                                    </div>
                                  </div>
                                </Col>
                              )}
                            </Row>
                          </Card>

                          {/* Teacher section with enhanced visuals */}
                          <Card
                            title={
                              <span className={styles.staffClassDetailCardTitle}>
                                <FontAwesomeIcon icon="chalkboard-teacher" /> Teacher
                              </span>
                            }
                            variant="borderless"
                            className={styles.staffClassDetailCard}
                          >
                            {selectedClass.teacherNames && selectedClass.teacherNames.length > 0 ? (
                              <div className={styles.staffClassTeachersAssignedList}>
                                {selectedClass.teacherNames.map((name, idx) => (
                                  <div className={styles.staffClassTeacherCard} key={idx}>
                                    <Avatar
                                      icon={<UserOutlined />}
                                      className={styles.staffClassTeacherAvatar}
                                      size={64}
                                    />
                                    <div className={styles.staffClassName}>{name}</div>
                                    <Tag color="blue">Teacher</Tag>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={styles.staffNoTeachers}>
                                <Empty
                                  description="No teacher assigned"
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                              </div>
                            )}
                          </Card>
                        </Col>

                        {/* Right column: Capacity visualization */}
                        <Col span={10}>
                          <Card
                            title={
                              <span className={styles.staffClassDetailCardTitle}>
                                <FontAwesomeIcon icon="users" /> Class capacity
                              </span>
                            }
                            variant="borderless"
                            className={styles.staffClassDetailCard}
                          >
                            <div className={styles.staffCapacityVisualization}>
                              <div className={styles.staffCapacityDonutDetailCard}>
                                <Progress
                                  type="circle"
                                  percent={Math.round((selectedClass.quantity / selectedClass.maxChildren) * 100)}
                                  format={percent => `${percent}%`}
                                  status={selectedClass.quantity >= selectedClass.maxChildren ? "exception" : "normal"}
                                  size={180}
                                />
                              </div>
                              <div className={styles.staffClassCapacityStats}>
                                <div className={styles.staffClassCapacityStatItem}>
                                  <div className={styles.staffClassCapacityStatValue}>{selectedClass.quantity}</div>
                                  <div className={styles.staffClassCapacityStatLabel}>Currently</div>
                                </div>
                                <div className={styles.staffClassCapacityStatDivider}>/</div>
                                <div className={styles.staffClassCapacityStatItem}>
                                  <div className={styles.staffClassCapacityStatValue}>{selectedClass.maxChildren}</div>
                                  <div className={styles.staffClassCapacityStatLabel}>Maximum</div>
                                </div>
                              </div>

                              {selectedClass.quantity >= selectedClass.maxChildren && (
                                <Alert
                                  message="Class has reached the maximum capacity"
                                  type="warning"
                                  showIcon
                                  icon={<FontAwesomeIcon icon="exclamation-triangle" />}
                                  className={styles.staffClassCapacityWarningAlert}
                                />
                              )}

                              <div className={styles.staffClassCapacityDescription}>
                                <p>
                                  This class currently has <strong>{selectedClass.quantity}</strong> students,
                                  {selectedClass.quantity < selectedClass.maxChildren ?
                                    ` can still accept ${selectedClass.maxChildren - selectedClass.quantity} more students.` :
                                    ' has reached the maximum capacity.'}
                                </p>
                              </div>
                            </div>
                          </Card>

                          {/* Class status card */}
                          <Card
                            title={
                              <span className={styles.staffClassDetailCardTitle}>
                                <FontAwesomeIcon icon="clipboard-list" /> Status
                              </span>
                            }
                            variant="borderless"
                            className={styles.staffClassDetailCard}
                          >
                            <div className={`${styles.staffClassStatus} ${styles[selectedClass.status.toLowerCase()]}`}>
                              <div className={styles.staffClassStatusIcon}>
                                <FontAwesomeIcon
                                  icon={selectedClass.status === 'Available' ? 'check-circle' :
                                    selectedClass.status === 'Finished' ? 'history' : 'clock'}
                                />
                              </div>
                              <div className={styles.staffClassStatusDetails}>
                                <div className={styles.staffClassStatusValue}>{selectedClass.status}</div>
                                <div className={styles.staffClassStatusDescription}>
                                  {selectedClass.status === 'Available'
                                    ? 'Class is open and can accept students.'
                                    : selectedClass.status === 'Finished'
                                      ? 'Class is currently unavailable. The academic year has ended.'
                                      : 'Class is currently unavailable.'}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: "2",
                  label: (
                    <span className={styles.tabLabel}>
                      <CalendarOutlined /> Attendance
                    </span>
                  ),
                  disabled: selectedClass.quantity === 0,
                  children: (
                    <div className={styles.staffClassDetailTabContent}>
                      <Spin spinning={attendanceLoading}>
                        {selectedClass.quantity > 0 ? (
                          <>
                            {Object.keys(groupedAttendance).length > 0 ? (
                              <div className={styles.staffAttendanceContainer}>
                                <div className={styles.staffAttendanceDateSelector}>
                                  <Radio.Group
                                    buttonStyle="solid"
                                    defaultValue={activeDate}
                                    onChange={(e) => setActiveDate(e.target.value)}
                                    className={styles.staffDateRadioGroup}
                                  >
                                    {Object.keys(groupedAttendance).map(date => (
                                      <Radio.Button key={date} value={date}>
                                        <CalendarOutlined /> {formatDate(date)}
                                      </Radio.Button>
                                    ))}
                                  </Radio.Group>
                                </div>

                                {Object.entries(groupedAttendance).map(([date, records]) => (
                                  <div
                                    key={date}
                                    className={styles.staffAttendanceDateSection}
                                    style={{ display: activeDate === date ? 'block' : 'none' }}
                                  >
                                    <div className={styles.staffAttendanceSummaryCards}>
                                      <Row gutter={16}>
                                        <Col span={12}>
                                          <Card className={`${styles.staffSummaryCard} ${styles.present}`}>
                                            <div className={styles.staffSummaryIcon}>
                                              <FontAwesomeIcon icon="check-circle" />
                                            </div>
                                            <div className={styles.staffSummaryContent}>
                                              <div className={styles.staffSummaryCount}>
                                                {records.filter(r => r.status === 'Attend').length}
                                              </div>
                                              <div className={styles.staffSummaryLabel}>Present</div>
                                            </div>
                                          </Card>
                                        </Col>
                                        <Col span={12}>
                                          <Card className={`${styles.staffSummaryCard} ${styles.absent}`}>
                                            <div className={styles.staffSummaryIcon}>
                                              <FontAwesomeIcon icon="times-circle" />
                                            </div>
                                            <div className={styles.staffSummaryContent}>
                                              <div className={styles.staffSummaryCount}>
                                                {records.filter(r => r.status === 'Absent').length}
                                              </div>
                                              <div className={styles.staffSummaryLabel}>Absent</div>
                                            </div>
                                          </Card>
                                        </Col>
                                      </Row>
                                    </div>

                                    <div className={styles.staffAttendanceTableContainer}>
                                      <h3 className={styles.staffAttendanceDateTitle}>
                                        <CalendarOutlined /> Attendance on {formatDate(date)}
                                      </h3>

                                      <Table
                                        dataSource={records}
                                        columns={attendanceColumns}
                                        rowKey="id"
                                        pagination={false}
                                        className={styles.staffAttendanceTableEnhanced}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Empty
                                description="No attendance data for this class"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            )}
                          </>
                        ) : (
                          <Alert
                            message="Class has no students"
                            description="This class currently has no students assigned. Attendance will be available when there are students in the class."
                            type="info"
                            showIcon
                          />
                        )}
                      </Spin>
                    </div>
                  )
                },
                {
                  key: "3",
                  label: (
                    <span className={styles.tabLabel}>
                      <TeamOutlined /> Students
                    </span>
                  ),
                  disabled: selectedClass.quantity === 0,
                  children: (
                    <div className={styles.staffClassDetailTabContent}>
                      <Spin spinning={studentsLoading}>
                        {selectedClass.quantity > 0 ? (
                          <>
                            {students && students.length > 0 ? (
                              <div className={styles.staffClassStudentsContainer}>
                                <Card
                                  title={
                                    <span className={styles.staffClassDetailCardTitle}>
                                      <FontAwesomeIcon icon="user-graduate" /> List of students
                                    </span>
                                  }
                                  extra={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <Badge count={students.length} style={{ backgroundColor: '#1890ff' }} />
                                      {selectedClass.status === 'Finished' && (
                                        <Tooltip
                                          title={selectedStudentIds.length === 0 ? "Please select students before upgrading" : ""}
                                        >
                                          <Button
                                            type="primary"
                                            icon={<FontAwesomeIcon icon="level-up-alt" />}
                                            onClick={selectedClass.epName ? handleUpgradeEnrichmentStudents : handleUpgradeStudents}
                                            disabled={selectedStudentIds.length === 0}
                                            loading={upgradingStudents}
                                            className={selectedStudentIds.length === 0 ? styles.staffUpgradeBtnDisabled : styles.staffUpgradeBtn}
                                          >
                                            {selectedClass.epName ? 'Upgrade Level' : 'Upgrade Grade'} {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''}
                                          </Button>
                                        </Tooltip>
                                      )}
                                    </div>
                                  }
                                  className={styles.staffClassDetailCard}
                                >
                                  {selectedClass.status === 'Finished' && (
                                    <Alert
                                      message="Class has ended"
                                      description={selectedClass.epName
                                        ? "You can select students to upgrade to the next enrichment level."
                                        : "You can select students to upgrade to the next grade level."}
                                      type="info"
                                      showIcon
                                      style={{ marginBottom: '16px' }}
                                    />
                                  )}
                                  <Table
                                    dataSource={students}
                                    columns={studentColumns}
                                    rowKey="id"
                                    pagination={{ pageSize: 5 }}
                                    className={styles.staffClassStudentsTableEnhanced}
                                  />
                                </Card>
                              </div>
                            ) : (
                              <Empty
                                description="No students in this class"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                              />
                            )}
                          </>
                        ) : (
                          <Alert
                            message="Class has no students"
                            description="This class currently has no students assigned."
                            type="info"
                            showIcon
                          />
                        )}
                      </Spin>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Add toast container */}
      <toast.ToastContainer position="top-right" />
    </div>
  );
};

export default StaffClassPage;
