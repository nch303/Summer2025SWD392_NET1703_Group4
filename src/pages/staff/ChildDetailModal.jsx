import React, { useState, useEffect } from 'react';
import styles from './ChildDetailModal.module.css';
import { getClassChildrenByChildId } from '../../services/StaffService';

const ChildDetailModal = ({ isOpen, onClose, child }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [childDetails, setChildDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && child && child.id) {
      setLoading(true);
      getClassChildrenByChildId(child.id)
        .then(data => {
          setChildDetails(data);
        })
        .catch(error => {
          console.error('Error fetching child details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, child]);
  
  if (!isOpen || !child) return null;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate age
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get gender display
  const getGenderDisplay = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      default: return 'Other';
    }
  };
  
  // Open image in fullscreen modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Get attendance status display
  const getAttendanceStatus = (status) => {
    switch (status) {
      case 'Attend': return <span className={styles.statusAttend}>Present</span>;
      case 'Absent': return <span className={styles.statusAbsent}>Absent</span>;
      case 'Late': return <span className={styles.statusLate}>Late</span>;
      default: return <span>{status}</span>;
    }
  };

  // Get class status display
  const getClassStatus = (status) => {
    switch (status) {
      case 'Active': return <span className={styles.statusActive}>Active</span>;
      case 'Completed': return <span className={styles.statusCompleted}>Completed</span>;
      default: return <span>{status}</span>;
    }
  };

  const studentInfo = childDetails?.length > 0 ? childDetails[0].childrenResponse : child;

  return (
    <>
      <div className={styles.staffChildrenModalOverlay} onClick={onClose}>
        <div className={styles.staffChildrenDetailModal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.staffChildrenModalHeader}>
            <h2>
              <i className="fas fa-user-circle"></i>
              Student details
            </h2>
            <button className={styles.staffChildrenCloseModal} onClick={onClose} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className={styles.staffChildrenModalContent}>
            <div className={styles.staffChildrenChildProfile}>
              <div className={styles.staffChildrenAvatarContainer}>
                {studentInfo.avatar ? (
                  <img 
                    src={studentInfo.avatar} 
                    alt={`Avatar of ${studentInfo.name}`} 
                    className={styles.staffChildrenAvatarLarge}
                    onClick={() => openImageModal(studentInfo.avatar)}
                    onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                  />
                ) : (
                  <div className={styles.staffChildrenAvatarPlaceholderLarge}>
                    {studentInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {studentInfo.avatar && (
                  <div className={styles.staffChildrenZoomHint}>
                    <i className="fas fa-search-plus"></i>
                  </div>
                )}
              </div>
              
              <div className={styles.staffChildrenChildInfo}>
                <div className={styles.staffChildrenNameBadge}>
                  <h3>{studentInfo.name}</h3>
                  <span className={`${styles.staffChildrenGenderTag} ${styles[studentInfo.gender?.toLowerCase()]}`}>
                    {getGenderDisplay(studentInfo.gender)}
                  </span>
                </div>
                
                <div className={styles.staffChildrenInfoBadges}>
                  <div className={styles.staffChildrenInfoBadge}>
                    <i className="fas fa-birthday-cake"></i>
                    <div className={styles.staffChildrenInfoBadgeText}>
                      <span className={styles.staffChildrenBadgeLabel}>Birthday</span>
                      <span className={styles.staffChildrenBadgeValue}>{formatDate(studentInfo.birthday)}</span>
                    </div>
                  </div>
                  <div className={styles.staffChildrenInfoBadge}>
                    <i className="fas fa-child"></i>
                    <div className={styles.staffChildrenInfoBadgeText}>
                      <span className={styles.staffChildrenBadgeLabel}>Age</span>
                      <span className={styles.staffChildrenBadgeValue}>{calculateAge(studentInfo.birthday)} years</span>
                    </div>
                  </div>
                  <div className={styles.staffChildrenInfoBadge}>
                    <i className="fas fa-map-marker-alt"></i>
                    <div className={styles.staffChildrenInfoBadgeText}>
                      <span className={styles.staffChildrenBadgeLabel}>City</span>
                      <span className={styles.staffChildrenBadgeValue}>{studentInfo.city || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className={styles.staffChildrenInfoBadge}>
                    <i className="fas fa-id-badge"></i>
                    <div className={styles.staffChildrenInfoBadgeText}>
                      <span className={styles.staffChildrenBadgeLabel}>ID</span>
                      <span className={`${styles.staffChildrenBadgeValue} ${styles.staffChildrenIdValue}`}>{studentInfo.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.staffChildrenTabs}>
              <div 
                className={`${styles.staffChildrenTab} ${activeTab === 'info' ? styles.active : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <i className="fas fa-info-circle"></i>
                <span>Student</span>
              </div>
              <div 
                className={`${styles.staffChildrenTab} ${activeTab === 'parent' ? styles.active : ''}`}
                onClick={() => setActiveTab('parent')}
              >
                <i className="fas fa-user-friends"></i>
                <span>Parent</span>
              </div>
              <div 
                className={`${styles.staffChildrenTab} ${activeTab === 'classes' ? styles.active : ''}`}
                onClick={() => setActiveTab('classes')}
              >
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Classes</span>
              </div>
              <div 
                className={`${styles.staffChildrenTab} ${activeTab === 'attendance' ? styles.active : ''}`}
                onClick={() => setActiveTab('attendance')}
              >
                <i className="fas fa-calendar-check"></i>
                <span>Attendance</span>
              </div>
            </div>
            
            {loading ? (
              <div className={styles.staffChildrenLoading}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading student data...</p>
              </div>
            ) : (
              <>
                {/* Student Info Tab */}
                {activeTab === 'info' && (
                  <div className={styles.staffChildrenInfoSection}>
                    <h4><i className="fas fa-user-graduate"></i> Student information</h4>
                    <div className={styles.staffChildrenInfoCards}>
                      <div className={styles.staffChildrenInfoCard}>
                        <div className={styles.staffChildrenInfoCardIcon}>
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                        <div className={styles.staffChildrenInfoCardContent}>
                          <div className={styles.staffChildrenInfoCardLabel}>Grade level</div>
                          <div className={styles.staffChildrenInfoCardValue}>{studentInfo.gradeLevelName || 'Not assigned'}</div>
                        </div>
                      </div>
                      <div className={styles.staffChildrenInfoCard}>
                        <div className={styles.staffChildrenInfoCardIcon}>
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className={styles.staffChildrenInfoCardContent}>
                          <div className={styles.staffChildrenInfoCardLabel}>Enrollment date</div>
                          <div className={styles.staffChildrenInfoCardValue}>
                            {studentInfo.enrollDate ? formatDate(studentInfo.enrollDate) : 'Not available'}
                          </div>
                        </div>
                      </div>
                      <div className={styles.staffChildrenInfoCard}>
                        <div className={styles.staffChildrenInfoCardIcon}>
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className={styles.staffChildrenInfoCardContent}>
                          <div className={styles.staffChildrenInfoCardLabel}>Status</div>
                          <div className={styles.staffChildrenInfoCardValue}>{studentInfo.status || 'Not available'}</div>
                        </div>
                      </div>
                    </div>

                    <h4><i className="fas fa-id-card"></i> Birth certificate</h4>
                    <div className={styles.staffChildrenDocumentContainer}>
                      {studentInfo.birthCertificate ? (
                        <div className={styles.staffChildrenDocumentPreview} onClick={() => openImageModal(studentInfo.birthCertificate)}>
                          <img 
                            src={studentInfo.birthCertificate} 
                            alt="Birth certificate" 
                            className={styles.staffChildrenCertificate}
                            onError={(e) => { e.target.src = '/images/no-document.png'; }}
                          />
                          <div className={styles.staffChildrenDocumentOverlay}>
                            <div className={styles.staffChildrenDocumentOverlayContent}>
                              <i className="fas fa-search-plus"></i>
                              <span>Click to view</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.staffChildrenNoDocument}>
                          <i className="fas fa-file-alt"></i>
                          <p>No birth certificate</p>
                          <button className={styles.staffChildrenUploadBtn}>
                            <i className="fas fa-upload"></i> Upload
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parent Tab */}
                {activeTab === 'parent' && (
                  <div className={styles.staffChildrenInfoSection}>
                    <h4><i className="fas fa-user-friends"></i> Parent information</h4>
                    <div className={styles.parentInfoSection}>
                      <div className={styles.parentInfoCard}>
                        <div className={styles.parentInfoHeader}>
                          <div className={styles.parentInfoIcon}>
                            <i className="fas fa-user"></i>
                          </div>
                          <h5 className={styles.parentInfoTitle}>Name</h5>
                        </div>
                        <div className={styles.parentInfoDetail}>{studentInfo.parentName || 'Not specified'}</div>
                      </div>
                      <div className={styles.parentInfoCard}>
                        <div className={styles.parentInfoHeader}>
                          <div className={styles.parentInfoIcon}>
                            <i className="fas fa-phone-alt"></i>
                          </div>
                          <h5 className={styles.parentInfoTitle}>Phone number</h5>
                        </div>
                        <div className={styles.parentInfoDetail}>{studentInfo.phoneNumber || 'Not specified'}</div>
                      </div>
                      <div className={styles.parentInfoCard}>
                        <div className={styles.parentInfoHeader}>
                          <div className={styles.parentInfoIcon}>
                            <i className="fas fa-id-card"></i>
                          </div>
                          <h5 className={styles.parentInfoTitle}>Parent ID</h5>
                        </div>
                        <div className={styles.parentInfoDetail}>
                          {studentInfo.parentID || 'Not specified'}
                        </div>
                      </div>
                      <div className={styles.parentInfoCard}>
                        <div className={styles.parentInfoHeader}>
                          <div className={styles.parentInfoIcon}>
                            <i className="fas fa-map-marked-alt"></i>
                          </div>
                          <h5 className={styles.parentInfoTitle}>Address</h5>
                        </div>
                        <div className={styles.parentInfoDetail}>{studentInfo.address || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                  <div className={styles.staffChildrenInfoSection}>
                    <h4><i className="fas fa-chalkboard-teacher"></i> Class information</h4>
                    
                    {childDetails && childDetails.length > 0 ? (
                      <div className={styles.classesContainer}>
                        {childDetails.map((enrollment, index) => (
                          <div key={index} className={styles.classCard}>
                            <div className={styles.classHeader}>
                              <h5 className={styles.classTitle}>
                                <i className="fas fa-school"></i>
                                {enrollment.classResponse.name}
                              </h5>
                              <span className={`${styles.statusBadge} ${styles[`status${enrollment.status}`]}`}>
                                {enrollment.status}
                              </span>
                            </div>
                            
                            <div className={styles.classBody}>
                              <div className={styles.classInfo}>
                                <div className={styles.classInfoItem}>
                                  <span className={styles.classInfoLabel}>
                                    <i className="fas fa-book"></i> Syllabus
                                  </span>
                                  <span className={styles.classInfoValue}>
                                    {enrollment.classResponse.syllabusName || 'Not specified'}
                                  </span>
                                </div>
                                
                                <div className={styles.classInfoItem}>
                                  <span className={styles.classInfoLabel}>
                                    <i className="fas fa-calendar"></i> Academic year
                                  </span>
                                  <span className={styles.classInfoValue}>
                                    {enrollment.classResponse.academicYear || 'Not specified'}
                                  </span>
                                </div>
                                
                                {enrollment.classResponse.timetable && (
                                  <div className={styles.classInfoItem}>
                                    <span className={styles.classInfoLabel}>
                                      <i className="fas fa-clock"></i> Schedule
                                    </span>
                                    <span className={styles.classInfoValue}>
                                      Days {enrollment.classResponse.timetable}
                                    </span>
                                  </div>
                                )}
                                
                                {enrollment.classResponse.epName && (
                                  <div className={styles.classInfoItem}>
                                    <span className={styles.classInfoLabel}>
                                      <i className="fas fa-star"></i> Program
                                    </span>
                                    <span className={styles.classInfoValue}>
                                      {enrollment.classResponse.epName}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={styles.classInfoItem}>
                                  <span className={styles.classInfoLabel}>
                                    <i className="fas fa-users"></i> Capacity
                                  </span>
                                  <span className={styles.classInfoValue}>
                                    {enrollment.classResponse.quantity}/{enrollment.classResponse.maxChildren} students
                                  </span>
                                </div>
                              </div>
                              
                              <div className={styles.classTeachers}>
                                <h6 className={styles.teachersTitle}>
                                  <i className="fas fa-chalkboard-teacher"></i> Teachers
                                </h6>
                                {enrollment.teachers && enrollment.teachers.length > 0 ? (
                                  <ul className={styles.teachersList}>
                                    {enrollment.teachers.map((teacher, idx) => (
                                      <li key={idx} className={styles.teacherItem}>
                                        <i className="fas fa-user-tie"></i> {teacher.fullName}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className={styles.noAttendance}>No teachers assigned</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noAttendance}>
                        <i className="fas fa-school"></i>
                        <p>No class enrollments found.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                  <div className={styles.staffChildrenInfoSection}>
                    <h4><i className="fas fa-calendar-check"></i> Attendance records</h4>
                    
                    {childDetails && childDetails.some(detail => detail.attendanceResponses?.length > 0) ? (
                      <div className={styles.attendanceSection}>
                        {childDetails.map((enrollment, index) => (
                          enrollment.attendanceResponses && enrollment.attendanceResponses.length > 0 && (
                            <div key={index} className={styles.attendanceSection}>
                              <div className={styles.attendanceHeader}>
                                <h5 className={styles.attendanceTitle}>
                                  <i className="fas fa-school"></i> {enrollment.classResponse.name}
                                </h5>
                              </div>
                              <table className={styles.attendanceTable}>
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {enrollment.attendanceResponses.map((record, idx) => (
                                    <tr key={idx}>
                                      <td className={styles.attendanceDate}>{formatDate(record.date)}</td>
                                      <td>
                                        <span className={`${styles.statusBadge} ${styles[`status${record.status}`]}`}>
                                          {record.status}
                                        </span>
                                      </td>
                                      <td className={styles.attendanceNotes}>{record.notes || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noAttendance}>
                        <i className="fas fa-calendar-times"></i>
                        <p>No attendance records found for this student.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={styles.staffChildrenModalFooter}>
            <button className={`${styles.staffChildrenActionButton} ${styles.secondary}`} onClick={onClose}>
              <i className="fas fa-times"></i> Close
            </button>
            <button className={`${styles.staffChildrenActionButton} ${styles.primary}`}>
              <i className="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      </div>
      
      {/* Full screen image modal */}
      {isImageModalOpen && selectedImage && (
        <div className={styles.staffChildrenFullscreenOverlay} onClick={() => setIsImageModalOpen(false)}>
          <div className={styles.staffChildrenFullscreenActions}>
            <button className={styles.staffChildrenFullscreenClose} onClick={() => setIsImageModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className={styles.staffChildrenFullscreenImageContainer}>
            <img 
              src={selectedImage} 
              alt="View details" 
              className={styles.staffChildrenFullscreenImage} 
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { e.target.src = '/images/no-document.png'; }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChildDetailModal;