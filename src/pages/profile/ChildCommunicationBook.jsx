import React, { useState, useEffect, useRef } from 'react';
import { getChildClassInfo } from '../../services/ProfileService';
import styles from './ChildCommunicationBook.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ChildCommunicationBook = ({ isOpen, onClose, childId }) => {
  const [classesInfo, setClassesInfo] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const tabsRef = useRef(null);
  const activeTabRef = useRef(null);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [hasAttendanceData, setHasAttendanceData] = useState(false);
  const [attendStats, setAttendStats] = useState({ attend: 0, absent: 0, late: 0 });
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedMonths, setSelectedMonths] = useState({});

  useEffect(() => {
    if (isOpen && childId) {
      fetchChildInfo();
    }
  }, [isOpen, childId]);

  // Hiệu ứng cho indicator
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabElement = document.querySelector(`.${styles.communicationTab}[data-tab="${activeTab}"]`);

      if (tabElement) {
        const tabsContainer = tabsRef.current;
        const tabRect = tabElement.getBoundingClientRect();
        const containerRect = tabsContainer.getBoundingClientRect();

        // Đặt vị trí và độ rộng cho indicator
        const leftPosition = tabElement.offsetLeft;
        const width = tabRect.width;

        tabsContainer.style.setProperty('--indicator-left', `${leftPosition}px`);
        tabsContainer.style.setProperty('--indicator-width', `${width}px`);

        // Scroll to active tab
        const scrollLeft = tabElement.offsetLeft - (containerRect.width - tabRect.width) / 2;
        tabsContainer.scrollLeft = scrollLeft;

        // Kiểm tra nếu có overflow để hiển thị indicator
        checkTabsOverflow();
      }
    }
  }, [activeTab, filteredClasses]);

  // Extract unique academic years from classes
  useEffect(() => {
    if (classesInfo && classesInfo.length > 0) {
      const years = [...new Set(classesInfo.map(item => item.classResponse.academicYear))].sort();
      setAcademicYears(years);

      // Set the most recent year as default
      if (years.length > 0 && !selectedAcademicYear) {
        setSelectedAcademicYear(years[years.length - 1]);
      }
    }
  }, [classesInfo]);

  // Filter classes based on selected academic year
  useEffect(() => {
    if (selectedAcademicYear && classesInfo.length > 0) {
      const filtered = classesInfo.filter(
        item => item.classResponse.academicYear === selectedAcademicYear
      );
      setFilteredClasses(filtered);

      // Reset selected class index when filter changes
      setSelectedClassIndex(0);
    } else {
      setFilteredClasses(classesInfo);
    }
  }, [selectedAcademicYear, classesInfo]);

  // Navigate to previous academic year
  const handlePrevYear = () => {
    const currentIndex = academicYears.indexOf(selectedAcademicYear);
    if (currentIndex > 0) {
      setSelectedAcademicYear(academicYears[currentIndex - 1]);
    }
  };

  // Navigate to next academic year
  const handleNextYear = () => {
    const currentIndex = academicYears.indexOf(selectedAcademicYear);
    if (currentIndex < academicYears.length - 1) {
      setSelectedAcademicYear(academicYears[currentIndex + 1]);
    }
  };

  // Kiểm tra overflow cho tabs
  const checkTabsOverflow = () => {
    if (tabsRef.current) {
      const tabsContainer = tabsRef.current;
      const isOverflowing = tabsContainer.scrollWidth > tabsContainer.clientWidth;

      if (isOverflowing) {
        tabsContainer.classList.add(styles.hasOverflow);
      } else {
        tabsContainer.classList.remove(styles.hasOverflow);
      }
    }
  };

  // Theo dõi resize
  useEffect(() => {
    window.addEventListener('resize', checkTabsOverflow);
    return () => {
      window.removeEventListener('resize', checkTabsOverflow);
    };
  }, []);

  const fetchChildInfo = async () => {
    try {
      setIsLoading(true);
      const data = await getChildClassInfo(childId);
      setClassesInfo(data); // Lưu toàn bộ mảng dữ liệu thay vì chỉ phần tử đầu tiên
      setFilteredClasses(data);
      setError('');
      setHasAttendanceData(data.some(item => item.attendanceResponses && item.attendanceResponses.length > 0));
      setAttendStats({
        attend: data.reduce((total, item) => total + item.attendanceResponses.filter(r => r.status === 'Attend').length, 0),
        absent: data.reduce((total, item) => total + item.attendanceResponses.filter(r => r.status === 'Absent').length, 0),
        late: data.reduce((total, item) => total + item.attendanceResponses.filter(r => r.status === 'Late').length, 0)
      });
    } catch (error) {
      setError('Cannot load child information. Please try again later.');
      console.error('Error fetching child info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return '';

    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // For children under 1
    if (age === 0) {
      const monthAge = (today - birthDate) / (1000 * 60 * 60 * 24 * 30.4375);
      return `${Math.floor(monthAge)} months`;
    }

    return `${age} years`;
  };

  // Map attendance status to display value
  const mapAttendanceStatus = (status) => {
    switch (status) {
      case 'Attend': return 'Present';
      case 'Absent': return 'Absent';
      default: return status;
    }
  };

  // Group attendance by month for better organization
  const groupAttendanceByMonth = (attendanceList) => {
    if (!attendanceList || attendanceList.length === 0) return {};

    const groupedByMonth = {};

    attendanceList.forEach(record => {
      const date = new Date(record.date);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;

      if (!groupedByMonth[monthYear]) {
        groupedByMonth[monthYear] = [];
      }

      groupedByMonth[monthYear].push(record);
    });

    // Sort records within each month
    Object.keys(groupedByMonth).forEach(key => {
      groupedByMonth[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    return groupedByMonth;
  };

  // Handle month selection for a specific class
  const handleMonthSelect = (classId, monthYear) => {
    setSelectedMonths(prev => ({
      ...prev,
      [classId]: monthYear
    }));
  };

  // Find most recent month for initial selection
  useEffect(() => {
    if (filteredClasses.length > 0) {
      const newSelectedMonths = {};

      filteredClasses.forEach(classItem => {
        if (classItem.attendanceResponses && classItem.attendanceResponses.length > 0) {
          const grouped = groupAttendanceByMonth(classItem.attendanceResponses);
          const months = Object.keys(grouped).sort((a, b) => {
            const [monthA, yearA] = a.split('-').map(Number);
            const [monthB, yearB] = b.split('-').map(Number);
            return yearB - yearA || monthB - monthA;
          });

          if (months.length > 0) {
            newSelectedMonths[classItem.id] = months[0];
          }
        }
      });

      setSelectedMonths(newSelectedMonths);
    }
  }, [filteredClasses]);

  // Sử dụng phần tử đầu tiên cho thông tin cá nhân vì thông tin này giống nhau ở tất cả các phần tử
  const childInfo = classesInfo.length > 0 ? classesInfo[0] : null;

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.communicationBookModal}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>
            <FontAwesomeIcon icon="book" />
            Child communication book
          </h3>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>

        {isLoading ? (
          <div className={`${styles.modalBody} ${styles.communicationBookLoading}`}>
            <div className={styles.profileLoadingSpinner}></div>
            <p>Loading information...</p>
          </div>
        ) : error ? (
          <div className={styles.modalBody}>
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon="exclamation-circle" />
              <p>{error}</p>
            </div>
          </div>
        ) : childInfo ? (
          <>
            <div className={`${styles.communicationBookTabs}`} ref={tabsRef} style={{
              '--indicator-left': '0px',
              '--indicator-width': '0px'
            }}>
              <button
                className={`${styles.communicationTab} ${activeTab === 'personal' ? styles.active : ''}`}
                onClick={() => setActiveTab('personal')}
                data-tab="personal"
                ref={activeTab === 'personal' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="user" />
                <span>Personal information</span>
              </button>
              <button
                className={`${styles.communicationTab} ${activeTab === 'parent' ? styles.active : ''}`}
                onClick={() => setActiveTab('parent')}
                data-tab="parent"
                ref={activeTab === 'parent' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="user-friends" />
                <span>Parent information</span>
              </button>
              <button
                className={`${styles.communicationTab} ${activeTab === 'class' ? styles.active : ''}`}
                onClick={() => setActiveTab('class')}
                data-tab="class"
                ref={activeTab === 'class' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="chalkboard" />
                <span>Class information</span>
              </button>
              <button
                className={`${styles.communicationTab} ${activeTab === 'attendance' ? styles.active : ''}`}
                onClick={() => setActiveTab('attendance')}
                data-tab="attendance"
                ref={activeTab === 'attendance' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="calendar-check" />
                <span>Attendance</span>
              </button>
            </div>

            <div className={`${styles.modalBody} ${styles.communicationBookContent}`}>
              {activeTab === 'personal' && (
                <div className={`${styles.communicationTabPanel}`}>

                  <div className={styles.communicationBookHeader}>
                    <div className={styles.communicationBookAvatar}>
                      {childInfo.childrenResponse.avatar ? (
                        <img
                          src={childInfo.childrenResponse.avatar}
                          alt={`Avatar of ${childInfo.childrenResponse.name}`}
                        />
                      ) : (
                        <FontAwesomeIcon icon="child" size="3x" />
                      )}
                    </div>
                    <div className={styles.communicationBookHeaderInfo}>
                      <h2>{childInfo.childrenResponse.name}</h2>
                      <div className={styles.communicationBookBadges}>
                        <div className={`${styles.genderBadge} ${childInfo.childrenResponse.gender === 'Male' ? styles.male : styles.female}`}>
                          <FontAwesomeIcon icon={childInfo.childrenResponse.gender === 'Male' ? 'mars' : 'venus'} />
                          {childInfo.childrenResponse.gender === 'Male' ? 'Male' : 'Female'}
                        </div>
                        <div className={styles.ageBadge}>
                          <FontAwesomeIcon icon="birthday-cake" />
                          {calculateAge(childInfo.childrenResponse.birthday)}
                        </div>
                        {childInfo.childrenResponse.city && (
                          <div className={styles.cityBadge}>
                            <FontAwesomeIcon icon="map-marker-alt" />
                            {childInfo.childrenResponse.city}
                          </div>
                        )}
                        <div className={`${styles.statusBadge} ${childInfo.childrenResponse.status === 'Active' ? styles.active : styles.inactive}`}>
                          <FontAwesomeIcon icon={childInfo.childrenResponse.status === 'Active' ? 'check-circle' : 'times-circle'} />
                          {childInfo.childrenResponse.status === 'Active' ? 'Enrolled' : 'Not enrolled'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.communicationBookSection}>
                    <h4>
                      <FontAwesomeIcon icon="info-circle" />
                      Detailed information
                    </h4>
                    <div className={styles.communicationBookInfoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="user" /> Name</span>
                        <span className={styles.infoValue}>{childInfo.childrenResponse.name}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="birthday-cake" /> Birthday</span>
                        <span className={styles.infoValue}>{formatDate(childInfo.childrenResponse.birthday)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon={childInfo.childrenResponse.gender === 'Male' ? 'mars' : 'venus'} /> Gender</span>
                        <span className={styles.infoValue}>{childInfo.childrenResponse.gender === 'Male' ? 'Male' : 'Female'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="map-marker-alt" /> City</span>
                        <span className={styles.infoValue}>{childInfo.childrenResponse.city || 'Not updated'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="school" /> Grade level</span>
                        <span className={styles.infoValue}>{childInfo.childrenResponse.gradeLevelName || 'Not determined'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="calendar-plus" /> Enroll date</span>
                        <span className={styles.infoValue}>
                          {childInfo.childrenResponse.enrollDate && childInfo.childrenResponse.enrollDate !== '0001-01-01T00:00:00'
                            ? formatDate(childInfo.childrenResponse.enrollDate)
                            : 'Not determined'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="check-circle" /> Status</span>
                        <span className={`${styles.infoValue} ${styles.statusText}`}>
                          {childInfo.childrenResponse.status === 'Active' ? 'Enrolled' : 'Not enrolled'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {childInfo.childrenResponse.birthCertificate && (
                    <div className={styles.communicationBookSection}>
                      <h4>
                        <FontAwesomeIcon icon="certificate" />
                        Birth certificate
                      </h4>
                      <div className={styles.birthCertificateContainer}>
                        <img
                          src={childInfo.childrenResponse.birthCertificate}
                          alt="Birth certificate"
                          className={styles.birthCertificateImg}
                          onClick={() => window.open(childInfo.childrenResponse.birthCertificate, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'parent' && (
                <div className={styles.communicationTabPanel}>

                  <div className={styles.communicationBookSection}>
                    <h4>
                      <FontAwesomeIcon icon="user-friends" />
                      Parent information
                    </h4>
                    <div className={styles.communicationBookInfoGrid}>
                      <div className={`${styles.infoItem} ${styles.highlight}`}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="user" /> Name</span>
                        <span className={styles.infoValue}>{childInfo.childrenResponse.parentName || 'Not updated'}</span>
                      </div>
                      <div className={`${styles.infoItem} ${styles.highlight}`}>
                        <span className={styles.infoLabel}><FontAwesomeIcon icon="phone" /> Phone number</span>
                        <span className={styles.infoValue}>{childInfo.childrenResponse.phoneNumber || 'Not updated'}</span>
                      </div>
                    </div>

                    <div className={styles.quickContact}>
                      <button className={`${styles.contactBtn} ${styles.contactPhone}`} onClick={() => window.location.href = `tel:${childInfo.childrenResponse.phoneNumber}`}>
                        <FontAwesomeIcon icon="phone" /> Call
                      </button>
                      <button className={`${styles.contactBtn} ${styles.contactSms}`} onClick={() => window.location.href = `sms:${childInfo.childrenResponse.phoneNumber}`}>
                        <FontAwesomeIcon icon="sms" /> Send message
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'class' && (
                <div className={styles.communicationTabPanel}>
                  <div className={styles.communicationBookSummaryCard}>
                    <h5>
                      <FontAwesomeIcon icon="chalkboard" />
                      Class information
                    </h5>
                    <p>The child {childInfo.childrenResponse.name} is currently enrolled in {filteredClasses.length} classes at the school. Select a class to view detailed information.</p>
                  </div>

                  {academicYears.length > 0 && (
                    <div className={styles.academicYearSelector}>
                      <button
                        className={styles.yearNavButton}
                        onClick={handlePrevYear}
                        disabled={academicYears.indexOf(selectedAcademicYear) === 0}
                      >
                        <FontAwesomeIcon icon="chevron-left" />
                      </button>
                      <div className={styles.currentAcademicYear}>
                        <FontAwesomeIcon icon="calendar-alt" />
                        <span>{selectedAcademicYear}</span>
                      </div>
                      <button
                        className={styles.yearNavButton}
                        onClick={handleNextYear}
                        disabled={academicYears.indexOf(selectedAcademicYear) === academicYears.length - 1}
                      >
                        <FontAwesomeIcon icon="chevron-right" />
                      </button>
                    </div>
                  )}

                  <div className={styles.classSelector}>
                    {filteredClasses.map((classItem, index) => (
                      <div
                        key={classItem.id}
                        className={`${styles.classCardSmall} ${selectedClassIndex === index ? styles.active : ''} ${classItem.classResponse.gradeLevelName ? styles.regularClass : styles.enrichmentClass}`}
                        onClick={() => setSelectedClassIndex(index)}
                      >
                        <div className={styles.classCardName}>{classItem.classResponse.name}</div>
                        <div className={styles.classCardGrade}>
                          {classItem.classResponse.gradeLevelName ? (
                            <>
                              <FontAwesomeIcon icon="graduation-cap" />
                              {classItem.classResponse.gradeLevelName}
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon="star" />
                              Enrichment class
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.communicationBookSection}>
                    {selectedClassIndex !== null && filteredClasses.length > 0 && (
                      <>
                        <div className={styles.classInfoContainer}>
                          <div className={styles.classInfoHeader}>
                            <div className={styles.className}>
                              <h3>{filteredClasses[selectedClassIndex].classResponse.name}</h3>
                              <span className={styles.classGradeLevel}>{filteredClasses[selectedClassIndex].classResponse.gradeLevelName || 'Enrichment'}</span>
                            </div>
                            <div className={styles.classStatusBadge}>
                              {filteredClasses[selectedClassIndex].classResponse.status === 'Available' ? 'Active' : 'Closed'}
                            </div>
                          </div>

                          <div className={styles.communicationBookInfoGrid}>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}><FontAwesomeIcon icon="school" /> Class name</span>
                              <span className={styles.infoValue}>{filteredClasses[selectedClassIndex].classResponse.name}</span>
                            </div>
                            {filteredClasses[selectedClassIndex].classResponse.gradeLevelName && (
                              <div className={styles.infoItem}>
                                <span className={styles.infoLabel}><FontAwesomeIcon icon="graduation-cap" /> Grade level</span>
                                <span className={styles.infoValue}>{filteredClasses[selectedClassIndex].classResponse.gradeLevelName}</span>
                              </div>
                            )}
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}><FontAwesomeIcon icon="book" /> Syllabus</span>
                              <span className={styles.infoValue}>{filteredClasses[selectedClassIndex].classResponse.syllabusName}</span>
                            </div>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}><FontAwesomeIcon icon="calendar" /> Academic year</span>
                              <span className={styles.infoValue}>{filteredClasses[selectedClassIndex].classResponse.academicYear}</span>
                            </div>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}><FontAwesomeIcon icon="users" /> Maximum number of students</span>
                              <span className={styles.infoValue}>{filteredClasses[selectedClassIndex].classResponse.maxChildren} students</span>
                            </div>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}><FontAwesomeIcon icon="flag" /> Status</span>
                              <span className={styles.infoValue}>{filteredClasses[selectedClassIndex].classResponse.status === 'Available' ? 'Active' : 'Closed'}</span>
                            </div>
                          </div>

                          <div className={styles.communicationBookClassCapacity}>
                            <div className={styles.capacityBar}>
                              <div
                                className={styles.capacityFilled}
                                style={{ width: `${(filteredClasses[selectedClassIndex].classResponse.quantity / filteredClasses[selectedClassIndex].classResponse.maxChildren) * 100}%` }}
                              ></div>
                            </div>
                            <div className={styles.capacityText}>
                              {filteredClasses[selectedClassIndex].classResponse.quantity}/{filteredClasses[selectedClassIndex].classResponse.maxChildren} students
                            </div>
                          </div>

                          {/* Phần giáo viên */}
                          <h5 className={styles.communicationBookTeacherSectionTitle}>Teacher</h5>
                          {filteredClasses[selectedClassIndex].teachers && filteredClasses[selectedClassIndex].teachers.length > 0 ? (
                            <div className={styles.communicationBookTeachersList}>
                              {filteredClasses[selectedClassIndex].teachers.map((teacher) => (
                                <div key={teacher.id} className={styles.communicationBookTeacherCard}>
                                  <div className={styles.communicationBookTeacherAvatar}>
                                    <FontAwesomeIcon icon="user-tie" />
                                  </div>
                                  <div className={styles.communicationBookTeacherInfo}>
                                    <h5>{teacher.fullName}</h5>
                                    <div className={styles.communicationBookTeacherContact}>
                                      <div className={styles.communicationBookTeacherEmail}>
                                        <FontAwesomeIcon icon="envelope" />
                                        <span>{teacher.email}</span>
                                      </div>
                                      <div className={styles.communicationBookTeacherPhone}>
                                        <FontAwesomeIcon icon="phone" />
                                        <span>{teacher.phoneNumber}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className={styles.communicationBookNoTeachersMessage}>
                              <FontAwesomeIcon icon="info-circle" />
                              <span>No teacher information</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className={styles.communicationTabPanel}>
                  <div className={styles.communicationBookSummaryCard}>
                    <h5>
                      <FontAwesomeIcon icon="calendar-check" />
                      Attendance
                    </h5>
                    <p>Attendance information for the child {childInfo.childrenResponse.name} in the classes. Attendance data helps track the child's learning progress.</p>
                  </div>

                  {academicYears.length > 0 && (
                    <div className={styles.academicYearSelector}>
                      <button
                        className={styles.yearNavButton}
                        onClick={handlePrevYear}
                        disabled={academicYears.indexOf(selectedAcademicYear) === 0}
                      >
                        <FontAwesomeIcon icon="chevron-left" />
                      </button>
                      <div className={styles.currentAcademicYear}>
                        <FontAwesomeIcon icon="calendar-alt" />
                        <span>{selectedAcademicYear}</span>
                      </div>
                      <button
                        className={styles.yearNavButton}
                        onClick={handleNextYear}
                        disabled={academicYears.indexOf(selectedAcademicYear) === academicYears.length - 1}
                      >
                        <FontAwesomeIcon icon="chevron-right" />
                      </button>
                    </div>
                  )}

                  {hasAttendanceData && (
                    <div className={styles.attendanceStatistics}>
                      <div className={`${styles.attendanceStatCard} ${styles.statAttend}`}>
                        <div className={styles.statNumber}>{attendStats.attend}</div>
                        <div className={styles.communicationBookStatLabel}>Present</div>
                      </div>
                      <div className={`${styles.attendanceStatCard} ${styles.statAbsent}`}>
                        <div className={styles.statNumber}>{attendStats.absent}</div>
                        <div className={styles.communicationBookStatLabel}>Absent</div>
                      </div>
                    </div>
                  )}

                  {filteredClasses.some(item => item.attendanceResponses && item.attendanceResponses.length > 0) ? (
                    <div className={styles.attendanceRecords}>
                      {filteredClasses.map((classItem) => {
                        if (!classItem.attendanceResponses || classItem.attendanceResponses.length === 0) return null;

                        const groupedAttendance = groupAttendanceByMonth(classItem.attendanceResponses);
                        const availableMonths = Object.keys(groupedAttendance).sort((a, b) => {
                          const [monthA, yearA] = a.split('-').map(Number);
                          const [monthB, yearB] = b.split('-').map(Number);
                          return yearB - yearA || monthB - monthA;
                        });

                        const selectedMonth = selectedMonths[classItem.id] || (availableMonths.length > 0 ? availableMonths[0] : null);

                        const monthNames = ["", "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"];

                        // Format month year for display
                        let selectedMonthDisplay = '';
                        if (selectedMonth) {
                          const [month, year] = selectedMonth.split('-').map(Number);
                          selectedMonthDisplay = `${monthNames[month]} ${year}`;
                        }

                        return (
                          <div key={classItem.id} className={styles.classAttendanceBlock}>
                            <h5 className={styles.classAttendanceTitle}>
                              <div className={styles.classTitleContent}>
                                <FontAwesomeIcon icon="chalkboard" />
                                <span>Class: {classItem.classResponse.name}</span>
                              </div>
                              <div className={`${styles.classTypeBadge} ${classItem.classResponse.gradeLevelName ? styles.regular : styles.enrichment}`}>
                                <FontAwesomeIcon icon={classItem.classResponse.gradeLevelName ? "graduation-cap" : "star"} />
                                <span>{classItem.classResponse.gradeLevelName || "Enrichment"}</span>
                              </div>
                            </h5>

                            <div className={styles.monthSelector}>
                              <div className={styles.monthSelectorButtons}>
                                {availableMonths.map(monthYear => {
                                  const [month, year] = monthYear.split('-').map(Number);
                                  const isSelected = selectedMonth === monthYear;

                                  return (
                                    <button
                                      key={monthYear}
                                      className={`${styles.monthButton} ${isSelected ? styles.active : ''}`}
                                      onClick={() => handleMonthSelect(classItem.id, monthYear)}
                                    >
                                      {monthNames[month]} {year}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {selectedMonth && groupedAttendance[selectedMonth] && (
                              <div className={styles.attendanceMonth}>
                                <div className={styles.currentMonthIndicator}>
                                  <FontAwesomeIcon icon="calendar-alt" />
                                  <span>Attendance for {selectedMonthDisplay}</span>
                                </div>
                                <div className={styles.attendanceTable}>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th width="25%">Date</th>
                                        <th width="25%">Status</th>
                                        <th>Note</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {groupedAttendance[selectedMonth].map(record => (
                                        <tr key={record.id} className={`${styles.attendanceStatus} ${record.status.toLowerCase()}`}>
                                          <td>{formatDate(record.date)}</td>
                                          <td>
                                            <span className={`${styles.attendanceStatus} ${styles[record.status.toLowerCase()]}`}>
                                              {mapAttendanceStatus(record.status)}
                                            </span>
                                          </td>
                                          <td>{record.notes || 'No note'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noAttendanceMessage}>
                      <FontAwesomeIcon icon="info-circle" />
                      <span>No attendance information</span>
                    </div>
                  )}

                  <div className={styles.attendanceSummary}>
                    <div className={styles.attendanceLegend}>
                      <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.attend}`}></span>
                        <span>Present</span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={`${styles.legendColor} ${styles.absent}`}></span>
                        <span>Absent</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.modalBody}>
            <div className={styles.errorMessage}>
              <FontAwesomeIcon icon="exclamation-circle" />
              <p>No information found for the child</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildCommunicationBook;
