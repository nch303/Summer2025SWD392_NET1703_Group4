import React, { useState, useEffect, useRef } from 'react';
import { getChildClassInfo } from './ChildProfileService';
import './ChildCommunicationBook.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ChildCommunicationBook = ({ isOpen, onClose, childId }) => {
  const [classesInfo, setClassesInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const tabsRef = useRef(null);
  const activeTabRef = useRef(null);
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [hasAttendanceData, setHasAttendanceData] = useState(false);
  const [attendStats, setAttendStats] = useState({ attend: 0, absent: 0, late: 0 });

  useEffect(() => {
    if (isOpen && childId) {
      fetchChildInfo();
    }
  }, [isOpen, childId]);

  // Hiệu ứng cho indicator
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabElement = document.querySelector(`.communication-tab[data-tab="${activeTab}"]`);
      
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
  }, [activeTab, classesInfo]);

  // Kiểm tra overflow cho tabs
  const checkTabsOverflow = () => {
    if (tabsRef.current) {
      const tabsContainer = tabsRef.current;
      const isOverflowing = tabsContainer.scrollWidth > tabsContainer.clientWidth;
      
      if (isOverflowing) {
        tabsContainer.classList.add('has-overflow');
      } else {
        tabsContainer.classList.remove('has-overflow');
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
      setError('');
      setHasAttendanceData(data.some(item => item.attendanceResponses && item.attendanceResponses.length > 0));
      setAttendStats({
        attend: data.reduce((total, item) => total + item.attendanceResponses.filter(r => r.status === 'Attend').length, 0),
        absent: data.reduce((total, item) => total + item.attendanceResponses.filter(r => r.status === 'Absent').length, 0),
        late: data.reduce((total, item) => total + item.attendanceResponses.filter(r => r.status === 'Late').length, 0)
      });
    } catch (error) {
      setError('Không thể tải thông tin của bé. Vui lòng thử lại sau.');
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
      return `${Math.floor(monthAge)} tháng`;
    }
    
    return `${age} tuổi`;
  };

  // Map attendance status to display value
  const mapAttendanceStatus = (status) => {
    switch (status) {
      case 'Attend': return 'Có mặt';
      case 'Absent': return 'Vắng mặt';
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

  // Sử dụng phần tử đầu tiên cho thông tin cá nhân vì thông tin này giống nhau ở tất cả các phần tử
  const childInfo = classesInfo.length > 0 ? classesInfo[0] : null;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content communication-book-modal" 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon="book" /> 
            Sổ liên lạc của bé
          </h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose} 
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="modal-body communication-book-loading">
            <div className="profile-loading-spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        ) : error ? (
          <div className="modal-body">
            <div className="error-message">
              <FontAwesomeIcon icon="exclamation-circle" />
              <p>{error}</p>
            </div>
          </div>
        ) : childInfo ? (
          <>
            <div className="communication-book-tabs" ref={tabsRef} style={{
              '--indicator-left': '0px',
              '--indicator-width': '0px'
            }}>
              <button 
                className={`communication-tab ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
                data-tab="personal"
                ref={activeTab === 'personal' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="user" />
                <span>Thông tin cá nhân</span>
              </button>
              <button 
                className={`communication-tab ${activeTab === 'parent' ? 'active' : ''}`}
                onClick={() => setActiveTab('parent')}
                data-tab="parent"
                ref={activeTab === 'parent' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="user-friends" />
                <span>Thông tin phụ huynh</span>
              </button>
              <button 
                className={`communication-tab ${activeTab === 'class' ? 'active' : ''}`}
                onClick={() => setActiveTab('class')}
                data-tab="class"
                ref={activeTab === 'class' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="chalkboard" />
                <span>Thông tin lớp học</span>
              </button>
              <button 
                className={`communication-tab ${activeTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setActiveTab('attendance')}
                data-tab="attendance"
                ref={activeTab === 'attendance' ? activeTabRef : null}
              >
                <FontAwesomeIcon icon="calendar-check" />
                <span>Điểm danh</span>
              </button>
            </div>
            
            <div className="modal-body communication-book-content">
              {activeTab === 'personal' && (
                <div className="communication-tab-panel">
                  
                  <div className="communication-book-header">
                    <div className="communication-book-avatar">
                      {childInfo.childrenResponse.avatar ? (
                        <img 
                          src={childInfo.childrenResponse.avatar} 
                          alt={`Ảnh của ${childInfo.childrenResponse.name}`} 
                        />
                      ) : (
                        <FontAwesomeIcon icon="child" size="3x" />
                      )}
                    </div>
                    <div className="communication-book-header-info">
                      <h2>{childInfo.childrenResponse.name}</h2>
                      <div className="communication-book-badges">
                        <div className={`gender-badge ${childInfo.childrenResponse.gender === 'Male' ? 'male' : 'female'}`}>
                          <FontAwesomeIcon icon={childInfo.childrenResponse.gender === 'Male' ? 'mars' : 'venus'} />
                          {childInfo.childrenResponse.gender === 'Male' ? 'Nam' : 'Nữ'}
                        </div>
                        <div className="age-badge">
                          <FontAwesomeIcon icon="birthday-cake" />
                          {calculateAge(childInfo.childrenResponse.birthday)}
                        </div>
                        {childInfo.childrenResponse.city && (
                          <div className="city-badge">
                            <FontAwesomeIcon icon="map-marker-alt" />
                            {childInfo.childrenResponse.city}
                          </div>
                        )}
                        <div className={`status-badge ${childInfo.childrenResponse.status === 'Active' ? 'active' : 'inactive'}`}>
                          <FontAwesomeIcon icon={childInfo.childrenResponse.status === 'Active' ? 'check-circle' : 'times-circle'} />
                          {childInfo.childrenResponse.status === 'Active' ? 'Đang học' : 'Không học'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="communication-book-section">
                    <h4>
                      <FontAwesomeIcon icon="info-circle" />
                      Thông tin chi tiết
                    </h4>
                    <div className="communication-book-info-grid">
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon="user" /> Họ và tên</span>
                        <span className="info-value">{childInfo.childrenResponse.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon="birthday-cake" /> Ngày sinh</span>
                        <span className="info-value">{formatDate(childInfo.childrenResponse.birthday)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon={childInfo.childrenResponse.gender === 'Male' ? 'mars' : 'venus'} /> Giới tính</span>
                        <span className="info-value">{childInfo.childrenResponse.gender === 'Male' ? 'Nam' : 'Nữ'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon="map-marker-alt" /> Thành phố</span>
                        <span className="info-value">{childInfo.childrenResponse.city || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon="school" /> Cấp lớp</span>
                        <span className="info-value">{childInfo.childrenResponse.gradeLevelName || 'Chưa xác định'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon="calendar-plus" /> Ngày nhập học</span>
                        <span className="info-value">
                          {childInfo.childrenResponse.enrollDate && childInfo.childrenResponse.enrollDate !== '0001-01-01T00:00:00' 
                            ? formatDate(childInfo.childrenResponse.enrollDate) 
                            : 'Chưa xác định'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><FontAwesomeIcon icon="check-circle" /> Trạng thái</span>
                        <span className="info-value status-text">
                          
                          {childInfo.childrenResponse.status === 'Active' ? 'Đang học' : 'Không học'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {childInfo.childrenResponse.birthCertificate && (
                    <div className="communication-book-section">
                      <h4>
                        <FontAwesomeIcon icon="certificate" />
                        Giấy khai sinh
                      </h4>
                      <div className="birth-certificate-container">
                        <img 
                          src={childInfo.childrenResponse.birthCertificate} 
                          alt="Giấy khai sinh" 
                          className="birth-certificate-img"
                          onClick={() => window.open(childInfo.childrenResponse.birthCertificate, '_blank')}
                        />
                        <div className="view-certificate-overlay">
                          <FontAwesomeIcon icon="search-plus" />
                          <span>Xem chi tiết</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'parent' && (
                <div className="communication-tab-panel">
                  
                  <div className="communication-book-section">
                    <h4>
                      <FontAwesomeIcon icon="user-friends" />
                      Liên hệ phụ huynh
                    </h4>
                    <div className="communication-book-info-grid">
                      <div className="info-item highlight">
                        <span className="info-label"><FontAwesomeIcon icon="user" /> Họ và tên</span>
                        <span className="info-value">{childInfo.childrenResponse.parentName || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="info-item highlight">
                        <span className="info-label"><FontAwesomeIcon icon="phone" /> Số điện thoại</span>
                        <span className="info-value">{childInfo.childrenResponse.phoneNumber || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                    
                    <div className="quick-contact">
                      <button className="contact-btn contact-phone" onClick={() => window.location.href = `tel:${childInfo.childrenResponse.phoneNumber}`}>
                        <FontAwesomeIcon icon="phone" /> Gọi điện
                      </button>
                      <button className="contact-btn contact-sms" onClick={() => window.location.href = `sms:${childInfo.childrenResponse.phoneNumber}`}>
                        <FontAwesomeIcon icon="sms" /> Nhắn tin
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'class' && (
                <div className="communication-tab-panel">
                  <div className="summary-card">
                    <h5>
                      <FontAwesomeIcon icon="chalkboard" />
                      Thông tin lớp học
                    </h5>
                    <p>Bé {childInfo.childrenResponse.name} hiện đang tham gia {classesInfo.length} lớp học tại trường. Chọn một lớp học để xem thông tin chi tiết.</p>
                  </div>
                  
                  <div className="class-selector">
                    {classesInfo.map((classItem, index) => (
                      <div 
                        key={classItem.id} 
                        className={`class-card-small ${selectedClassIndex === index ? 'active' : ''}`}
                        onClick={() => setSelectedClassIndex(index)}
                      >
                        <div className="class-card-name">{classItem.classResponse.name}</div>
                        <div className="class-card-grade">
                          <FontAwesomeIcon icon="graduation-cap" />
                          {classItem.classResponse.gradeLevelName}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="communication-book-section">
                    {selectedClassIndex !== null && (
                      <>
                        <div className="class-info-container">
                          <div className="class-info-header">
                            <div className="class-info-name">
                              <h3>{classesInfo[selectedClassIndex].classResponse.name}</h3>
                              <span className="class-grade-level">{classesInfo[selectedClassIndex].classResponse.gradeLevelName}</span>
                            </div>
                            <div className="class-status-badge">
                              {classesInfo[selectedClassIndex].classResponse.status === 'Available' ? 'Đang hoạt động' : 'Đóng'}
                            </div>
                          </div>
                          
                          <div className="communication-book-info-grid">
                            <div className="info-item">
                              <span className="info-label"><FontAwesomeIcon icon="school" /> Tên lớp học</span>
                              <span className="info-value">{classesInfo[selectedClassIndex].classResponse.name}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label"><FontAwesomeIcon icon="graduation-cap" /> Cấp lớp</span>
                              <span className="info-value">{classesInfo[selectedClassIndex].classResponse.gradeLevelName}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label"><FontAwesomeIcon icon="book" /> Giáo trình</span>
                              <span className="info-value">{classesInfo[selectedClassIndex].classResponse.syllabusName}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label"><FontAwesomeIcon icon="calendar" /> Năm học</span>
                              <span className="info-value">{classesInfo[selectedClassIndex].classResponse.academicYear}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label"><FontAwesomeIcon icon="users" /> Sĩ số tối đa</span>
                              <span className="info-value">{classesInfo[selectedClassIndex].classResponse.maxChildren} học sinh</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label"><FontAwesomeIcon icon="flag" /> Trạng thái</span>
                              <span className="info-value">{classesInfo[selectedClassIndex].classResponse.status === 'Available' ? 'Đang hoạt động' : 'Đóng'}</span>
                            </div>
                          </div>
                          
                          <div className="class-capacity">
                            <div className="capacity-bar">
                              <div 
                                className="capacity-filled" 
                                style={{ width: `${(classesInfo[selectedClassIndex].classResponse.quantity / classesInfo[selectedClassIndex].classResponse.maxChildren) * 100}%` }}
                              ></div>
                            </div>
                            <div className="capacity-text">
                              {classesInfo[selectedClassIndex].classResponse.quantity}/{classesInfo[selectedClassIndex].classResponse.maxChildren} học sinh
                            </div>
                          </div>
                          
                          {/* Phần giáo viên */}
                          <h5 className="teacher-section-title">Giáo viên phụ trách</h5>
                          {classesInfo[selectedClassIndex].teachers && classesInfo[selectedClassIndex].teachers.length > 0 ? (
                            <div className="teachers-list">
                              {classesInfo[selectedClassIndex].teachers.map((teacher) => (
                                <div key={teacher.id} className="teacher-card">
                                  <div className="teacher-avatar">
                                    <FontAwesomeIcon icon="user-tie" />
                                  </div>
                                  <div className="teacher-info">
                                    <h5>{teacher.fullName}</h5>
                                    <div className="teacher-contact">
                                      <div className="teacher-email">
                                        <FontAwesomeIcon icon="envelope" />
                                        <span>{teacher.email}</span>
                                      </div>
                                      <div className="teacher-phone">
                                        <FontAwesomeIcon icon="phone" />
                                        <span>{teacher.phoneNumber}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="no-teachers-message">
                              <FontAwesomeIcon icon="info-circle" />
                              <span>Chưa có thông tin giáo viên</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'attendance' && (
                <div className="communication-tab-panel">
                  <div className="summary-card">
                    <h5>
                      <FontAwesomeIcon icon="calendar-check" />
                      Điểm danh
                    </h5>
                    <p>Thông tin điểm danh của bé {childInfo.childrenResponse.name} tại các lớp học. Dữ liệu điểm danh giúp theo dõi quá trình học tập của bé.</p>
                  </div>
                  
                  {hasAttendanceData && (
                    <div className="attendance-statistics">
                      <div className="attendance-stat-card stat-attend">
                        <div className="stat-number">{attendStats.attend}</div>
                        <div className="stat-label">Có mặt</div>
                      </div>
                      <div className="attendance-stat-card stat-absent">
                        <div className="stat-number">{attendStats.absent}</div>
                        <div className="stat-label">Vắng mặt</div>
                      </div>
                    </div>
                  )}
                  
                  {classesInfo.some(item => item.attendanceResponses && item.attendanceResponses.length > 0) ? (
                    <div className="attendance-records">
                      {classesInfo.map((classItem) => (
                        classItem.attendanceResponses && classItem.attendanceResponses.length > 0 && (
                          <div key={classItem.id} className="class-attendance-block">
                            <h5 className="class-attendance-title">
                              <FontAwesomeIcon icon="chalkboard" /> 
                              Lớp: {classItem.classResponse.name}
                            </h5>
                            
                            {/* Phần code điểm danh hiện tại */}
                            {Object.entries(groupAttendanceByMonth(classItem.attendanceResponses))
                              .sort((a, b) => {
                                const [monthA, yearA] = a[0].split('-').map(Number);
                                const [monthB, yearB] = b[0].split('-').map(Number);
                                return yearB - yearA || monthB - monthA;
                              })
                              .map(([monthYear, records]) => {
                                const [month, year] = monthYear.split('-');
                                const monthNames = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                                                  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
                                
                                return (
                                  <div key={monthYear} className="attendance-month">
                                    <h5 className="month-header">
                                      <FontAwesomeIcon icon="calendar-alt" />
                                      {monthNames[parseInt(month)]} {year}
                                    </h5>
                                    <div className="attendance-table">
                                      <table>
                                        <thead>
                                          <tr>
                                            <th>Ngày</th>
                                            <th>Trạng thái</th>
                                            <th>Ghi chú</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {records.map(record => (
                                            <tr key={record.id} className={`attendance-${record.status.toLowerCase()}`}>
                                              <td>{formatDate(record.date)}</td>
                                              <td>
                                                <span className={`attendance-status ${record.status.toLowerCase()}`}>
                                                  {mapAttendanceStatus(record.status)}
                                                </span>
                                              </td>
                                              <td>{record.notes || 'Không có ghi chú'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div className="no-attendance-message">
                      <FontAwesomeIcon icon="info-circle" />
                      <span>Chưa có thông tin điểm danh</span>
                    </div>
                  )}
                  
                  <div className="attendance-summary">
                    <div className="attendance-legend">
                      <div className="legend-item">
                        <span className="legend-color attend"></span>
                        <span>Có mặt</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color absent"></span>
                        <span>Vắng mặt</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="modal-body">
            <div className="error-message">
              <FontAwesomeIcon icon="exclamation-circle" />
              <p>Không tìm thấy thông tin của bé</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildCommunicationBook;
