import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faTimes, faEye, faCheck, faBan, faFileAlt, 
  faChild, faUser, faClipboardList, faCalendarAlt, faMapMarkerAlt,
  faVenusMars, faFileContract, faFilter, faPhone, faClock, faCheckCircle,
  faBell, faPaperPlane, faMoneyBillWave, faUserGraduate, faChevronUp, faChevronDown,
  faAngleLeft, faAngleRight, faAngleDoubleLeft, faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';
import { getAllApplications, getApplicationDetail, 
  approveApplication, rejectApplication, createNotification } from '../../services/StaffService';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import styles from './EnrollmentApplicationManagement.module.css';

const EnrollmentApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationAction, setNotificationAction] = useState('');
  const [notification, setNotification] = useState({
    title: '',
    content: '',
    accountIDs: []
  });
  
  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();
  
  // Thêm state mới để quản lý trạng thái thu gọn
  const [statsCollapsed, setStatsCollapsed] = useState(false);
  
  // Add these state variables near the top with other useState declarations
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  
  useEffect(() => {
    fetchApplications();
  }, []);
  
  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);
  
  const filterApplications = () => {
    let filtered = [...applications];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => 
        app.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(app => 
        app.childrenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentPhone.includes(searchTerm)
      );
    }
    
    setFilteredApplications(filtered);
  };
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getAllApplications();
      setApplications(data);
      setFilteredApplications(data);
      setError('');
    } catch (err) {
      setError('Cannot load enrollment application list. Please try again later.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetail = async (application) => {
    try {
      showSpinner('Loading application detail...');
      const detail = await getApplicationDetail(application.id);
      setApplicationDetail(detail);
      setSelectedApplication(application);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } catch (err) {
      toast.error('Cannot load application detail. Please try again later.', {
        title: 'Error'
      });
      console.error('Error fetching application detail:', err);
    } finally {
      hideSpinner();
    }
  };
  
  const openNotificationModal = (action, application) => {
    let title = '';
    let content = '';
    
    if (action === 'approve') {
      title = 'Enrollment application approved';
      content = `Dear Parent,\n\nThe enrollment application of ${application.childrenName} has been approved successfully. The school will contact you to complete the next procedures.\n\nSincerely,\nLittle Stars Kindergarten.`;
    } else {
      title = 'Enrollment application not approved';
      content = `Dear Parent,\n\nThe enrollment application of ${application.childrenName} has not been approved yet. Please contact the school for more details.\n\nSincerely,\nLittle Stars Kindergarten.`;
    }
    
    setNotification({
      title,
      content,
      accountIDs: [application.parentID]
    });
    
    setNotificationAction(action);
    setSelectedApplication(application);
    setShowNotificationModal(true);
    document.body.style.overflow = 'hidden';
  };
  
  const handleNotificationChange = (e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      showSpinner('Processing...');
      
      await createNotification(notification);
      
      if (notificationAction === 'approve') {
        await approveApplication(selectedApplication.id);
        toast.success('Enrollment application approved and notification sent successfully!', {
          title: 'Success'
        });
      } else {
        await rejectApplication(selectedApplication.id);
        toast.success('Enrollment application rejected and notification sent successfully!', {
          title: 'Success'
        });
      }
      
      await fetchApplications();
      
      setShowNotificationModal(false);
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      document.body.style.overflow = 'auto';
      
    } catch (err) {
      toast.error('An error occurred. Please try again later.', {
        title: 'Error'
      });
      console.error('Error processing application:', err);
    } finally {
      hideSpinner();
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    setApplicationDetail(null);
    document.body.style.overflow = 'auto';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className={`${styles.statusBadge} ${styles.approved}`}>
          <FontAwesomeIcon icon={faCheckCircle} />
            Approved
        </span>;
      case 'rejected':
      case 'reject':
        return <span className={`${styles.statusBadge} ${styles.rejected}`}>
          <FontAwesomeIcon icon={faBan} />
          Rejected
        </span>;
      case 'paid':
        return <span className={`${styles.statusBadge} ${styles.paid}`}>
          <FontAwesomeIcon icon={faMoneyBillWave} />
          Paid
        </span>;
      case 'enrolled':
        return <span className={`${styles.statusBadge} ${styles.enrolled}`}>
          <FontAwesomeIcon icon={faUserGraduate} />
          Enrolled
        </span>;
      default:
        return <span className={`${styles.statusBadge} ${styles.pending}`}>
          <FontAwesomeIcon icon={faClock} />
          Pending
        </span>;
    }
  };
  
  // Calculate statistics
  const getTotalApplications = () => applications.length;
  
  const getPendingApplications = () => 
    applications.filter(app => app.status.toLowerCase() === 'pending').length;
  
  const getApprovedApplications = () => 
    applications.filter(app => app.status.toLowerCase() === 'approved').length;
  
  const getRejectedApplications = () => 
    applications.filter(app => app.status.toLowerCase() === 'rejected').length;
  
  const getPaidApplications = () => 
    applications.filter(app => app.status.toLowerCase() === 'paid').length;
  
  const getEnrolledApplications = () => 
    applications.filter(app => app.status.toLowerCase() === 'enrolled').length;
  
  // Thêm hàm toggle cho dashboard-stats
  const toggleStats = () => {
    setStatsCollapsed(!statsCollapsed);
  };
  
  // Calculate current applications to display
  const indexOfLastApplication = currentPage * itemsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - itemsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApplication, indexOfLastApplication);
  
  // Add pagination function
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const handleNotificationClose = () => {
    setShowNotificationModal(false);
    document.body.style.overflow = 'auto';
  };
  
  return (
    <div className={styles.enrollmentManagement}>
      <toast.ToastContainer position="top-right" />
      
      <div className={styles.enrollmentManagementHeader}>
        <h1 className={styles.enrollmentManagementTitle}>Enrollment application management</h1>
        <div className={styles.enrollmentManagementSearch}>
          <FontAwesomeIcon icon={faSearch} className={styles.enrollmentManagementSearchIcon} />
          <input
            type="text"
            placeholder="Search by child name, parent name, phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {!loading && !error && (
        <div className={styles.dashboardStatsContainer}>
          <div className={styles.dashboardStatsHeader}>
            <h3 className={styles.dashboardStatsTitle}>Enrollment application statistics</h3>
            <button 
              className={styles.dashboardStatsToggle} 
              onClick={toggleStats}
              title={statsCollapsed ? "Expand" : "Collapse"}
            >
              <FontAwesomeIcon icon={statsCollapsed ? faChevronDown : faChevronUp} />
            </button>
          </div>
          
          <div className={`${styles.dashboardStats} ${statsCollapsed ? styles.collapsed : ''}`}>
            <div className={`${styles.statCard} ${styles.total}`}>
              <div className={styles.statCardHeader}>
                <h3 className={styles.statCardTitle}>Total applications</h3>
                <div className={styles.statCardIcon}>
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
              </div>
              <p className={styles.statCardValue}>{getTotalApplications()}</p>
              <p className={styles.statCardDescription}>Total applications</p>
            </div>
            
            <div className={`${styles.statCard} ${styles.pending}`}>
              <div className={styles.statCardHeader}>
                <h3 className={styles.statCardTitle}>Pending</h3>
                <div className={styles.statCardIcon}>
                  <FontAwesomeIcon icon={faClipboardList} />
                </div>
              </div>
              <p className={styles.statCardValue}>{getPendingApplications()}</p>
              <p className={styles.statCardDescription}>Applications pending</p>
            </div>
            
            <div className={`${styles.statCard} ${styles.approved}`}>
              <div className={styles.statCardHeader}>
                <h3 className={styles.statCardTitle}>Approved</h3>
                <div className={styles.statCardIcon}>
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              </div>
              <p className={styles.statCardValue}>{getApprovedApplications()}</p>
              <p className={styles.statCardDescription}>Applications approved</p>
            </div>
            
            <div className={`${styles.statCard} ${styles.rejected}`}>
              <div className={styles.statCardHeader}>
                <h3 className={styles.statCardTitle}>Rejected</h3>
                <div className={styles.statCardIcon}>
                  <FontAwesomeIcon icon={faBan} />
                </div>
              </div>
              <p className={styles.statCardValue}>{getRejectedApplications()}</p>
              <p className={styles.statCardDescription}>Applications rejected</p>
            </div>
            
            <div className={`${styles.statCard} ${styles.paid}`}>
              <div className={styles.statCardHeader}>
                <h3 className={styles.statCardTitle}>Paid</h3>
                <div className={styles.statCardIcon}>
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
              </div>
              <p className={styles.statCardValue}>{getPaidApplications()}</p>
              <p className={styles.statCardDescription}>Applications paid</p>
            </div>
            
            <div className={`${styles.statCard} ${styles.enrolled}`}>
              <div className={styles.statCardHeader}>
                <h3 className={styles.statCardTitle}>Enrolled</h3>
                <div className={styles.statCardIcon}>
                  <FontAwesomeIcon icon={faUserGraduate} />
                </div>
              </div>
              <p className={styles.statCardValue}>{getEnrolledApplications()}</p>
              <p className={styles.statCardDescription}>Applications enrolled</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className={`${styles.message} ${styles.errorMessage}`}>
          <div className={`${styles.messageIcon} ${styles.errorIcon}`}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
          <span>{error}</span>
        </div>
      )}
      
      {!loading && !error && (
        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>
            <FontAwesomeIcon icon={faFilter} /> Filter by status:
          </div>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
            <option value="enrolled">Enrolled</option>
          </select>
        </div>
      )}
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading enrollment application list...</p>
        </div>
      ) : (
        <>
          {filteredApplications.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faFileAlt} size="4x" />
              <p>No enrollment application found</p>
              {statusFilter !== 'all' && (
                <button 
                  className={`${styles.actionButton} ${styles.view}`}
                  onClick={() => setStatusFilter('all')}
                >
                  View all applications
                </button>
              )}
            </div>
          ) : (
            <div className={styles.tableResponsive}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Child</th>
                    <th>Parent</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApplications.map((application) => (
                    <tr 
                      key={application.id} 
                      className={styles.applicationRow}
                      onClick={() => handleViewDetail(application)}
                    >
                      <td>#{application.id.substring(0, 6)}</td>
                      
                      <td>
                        <div className={styles.childCell}>
                          <img 
                            src={application.avatar} 
                            alt={application.childrenName} 
                            className={styles.childAvatar} 
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + application.childrenName }} 
                          />
                          <div className={styles.childInfoContainer}>
                            <div className={styles.listChildName}>{application.childrenName}</div>
                            <div className={styles.childBirthdate}>
                              <FontAwesomeIcon icon={faCalendarAlt} size="xs" />
                              {formatDate(application.birthday)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className={styles.parentCell}>
                          <div className={styles.parentName}>{application.parentName}</div>
                          <div className={styles.parentPhone}>
                            <FontAwesomeIcon icon={faPhone} size="xs" />
                            {application.parentPhone}
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className={styles.dateCell}>
                          <div className={styles.datePrimary}>{formatDate(application.enrollDate)}</div>
                          <div className={styles.dateSecondary}>
                            {new Date(application.enrollDate).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        {getStatusBadge(application.status)}
                      </td>
                      
                      <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                        {application.status.toLowerCase() === 'pending' && (
                          <>
                            <button 
                              className={`${styles.approve} ${styles.enrollmentActionButton}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                openNotificationModal('approve', application);
                              }}
                            >
                              <FontAwesomeIcon icon={faCheck} /> Approve
                            </button>
                            <button 
                              className={`${styles.reject} ${styles.enrollmentActionButton}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                openNotificationModal('reject', application);
                              }}
                            >
                              <FontAwesomeIcon icon={faBan} /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {filteredApplications.length > 0 && (
        <div className={styles.enrollmentPagination}>
          <button 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
            className={`${styles.enrollmentPaginationButton} ${styles.enrollmentFirstPage}`}
            title="First page"
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className={styles.enrollmentPaginationButton}
            title="Previous page"
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          
          <div className={styles.enrollmentPaginationInfo}>
            <span className={styles.enrollmentCurrentPage}>{currentPage}</span>
            <span className={styles.enrollmentTotalPages}>/ {totalPages}</span>
          </div>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className={styles.enrollmentPaginationButton}
            title="Next page"
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
            className={`${styles.enrollmentPaginationButton} ${styles.enrollmentLastPage}`}
            title="Last page"
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
      )}
      
      {isModalOpen && applicationDetail && (
        <div className={styles.enrollmentDetailModal} onClick={closeModal}>
          <div 
            className={styles.enrollmentDetailContent} 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              willChange: 'transform, opacity', 
              contain: 'content',
              overscrollBehavior: 'contain' 
            }}
          >
            <div className={styles.enrollmentDetailHeader}>
              <h2 className={styles.enrollmentDetailTitle}>
                  <FontAwesomeIcon icon={faFileAlt} /> Enrollment application detail
              </h2>
              <button className={styles.enrollmentDetailClose} onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className={styles.enrollmentDetailBody}>
              <div className={styles.enrollmentDetailSection}>
                <div className={styles.enrollmentDetailSectionHeader}>
                  <div className={styles.enrollmentDetailSectionIcon}>
                    <FontAwesomeIcon icon={faChild} />
                  </div>
                  <h3 className={styles.enrollmentDetailSectionTitle}>Child information</h3>
                </div>
                
                <div className={styles.enrollmentDetailGrid}>
                  <div className={styles.enrollmentChildProfile}>
                    <img 
                      src={applicationDetail.avatar} 
                      alt={applicationDetail.childrenName} 
                      className={styles.enrollmentChildImage}
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + applicationDetail.childrenName }}
                    />
                    <div className={styles.enrollmentChildName}>{applicationDetail.childrenName}</div>
                    <div className={styles.enrollmentChildBio}>
                      <div className={styles.enrollmentChildBioItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(applicationDetail.birthday)}
                      </div>
                      <div className={styles.enrollmentChildBioItem}>
                        <FontAwesomeIcon icon={faVenusMars} />
                        {applicationDetail.gender === 'Male' ? 'Nam' : 'Nữ'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className={styles.enrollmentDetailItem}>
                      <div className={styles.enrollmentDetailLabel}>
                        <FontAwesomeIcon icon={faCalendarAlt} /> Birthday
                      </div>
                      <div className={styles.enrollmentDetailValue}>{formatDate(applicationDetail.birthday)}</div>
                    </div>
                    
                    <div className={styles.enrollmentDetailItem}>
                      <div className={styles.enrollmentDetailLabel}>
                        <FontAwesomeIcon icon={faVenusMars} /> Gender
                      </div>
                      <div className={styles.enrollmentDetailValue}>{applicationDetail.gender === 'Male' ? 'Nam' : 'Nữ'}</div>
                    </div>
                    
                    <div className={styles.enrollmentDetailItem}>
                      <div className={styles.enrollmentDetailLabel}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Place of birth
                      </div>
                      <div className={styles.enrollmentDetailValue}>{applicationDetail.city}</div>
                    </div>
                    
                    <div className={styles.enrollmentDetailItem}>
                      <div className={styles.enrollmentDetailLabel}>
                        <FontAwesomeIcon icon={faFileContract} /> Birth certificate
                      </div>
                      <div className={styles.enrollmentDetailValue}>
                        <a 
                          href={applicationDetail.birthCertificate} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.enrollmentDocumentLink}
                        >
                          <FontAwesomeIcon icon={faFileAlt} /> View birth certificate
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.enrollmentDetailSection}>
                <div className={styles.enrollmentDetailSectionHeader}>
                  <div className={styles.enrollmentDetailSectionIcon}>
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <h3 className={styles.enrollmentDetailSectionTitle}>Parent information</h3>
                </div>
                
                <div className={styles.enrollmentDetailGrid}>
                  <div className={styles.enrollmentDetailItem}>
                    <div className={styles.enrollmentDetailLabel}>
                      <FontAwesomeIcon icon={faUser} /> Full name
                    </div>
                    <div className={styles.enrollmentDetailValue}>{applicationDetail.parentName}</div>
                  </div>
                  
                  <div className={styles.enrollmentDetailItem}>
                    <div className={styles.enrollmentDetailLabel}>
                        <FontAwesomeIcon icon={faPhone} /> Phone
                    </div>
                    <div className={styles.enrollmentDetailValue}>{applicationDetail.parentPhone}</div>
                  </div>
                  
                  <div className={styles.enrollmentDetailItem} style={{ gridColumn: "1 / -1" }}>
                    <div className={styles.enrollmentDetailLabel}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> Address
                    </div>
                    <div className={styles.enrollmentDetailValue}>{applicationDetail.address}</div>
                  </div>
                </div>
              </div>
              
              <div className={styles.enrollmentDetailSection}>
                <div className={styles.enrollmentDetailSectionHeader}>
                  <div className={styles.enrollmentDetailSectionIcon}>
                    <FontAwesomeIcon icon={faClipboardList} />
                  </div>
                  <h3 className={styles.enrollmentDetailSectionTitle}>Enrollment information</h3>
                </div>
                
                <div className={styles.enrollmentDetailGrid}>
                  <div className={styles.enrollmentDetailItem}>
                    <div className={styles.enrollmentDetailLabel}>
                      <FontAwesomeIcon icon={faClipboardList} /> Class
                    </div>
                    <div className={styles.enrollmentDetailValue}>
                      {applicationDetail.gradeLevelName || "Không có dữ liệu"}
                    </div>
                  </div>
                  
                  <div className={styles.enrollmentDetailItem}>
                    <div className={styles.enrollmentDetailLabel}>
                      <FontAwesomeIcon icon={faFileAlt} /> Tuition fee
                    </div>
                    <div className={styles.enrollmentDetailValue}>
                      {applicationDetail.gradeLevelFee ? `${applicationDetail.gradeLevelFee.toLocaleString('vi-VN')} VNĐ` : "0 VNĐ"}
                    </div>
                  </div>
                  
                  <div className={styles.enrollmentDetailItem}>
                    <div className={styles.enrollmentDetailLabel}>
                      <FontAwesomeIcon icon={faCalendarAlt} /> Enrollment date
                    </div>
                    <div className={styles.enrollmentDetailValue}>{formatDate(applicationDetail.enrollDate)}</div>
                  </div>
                  
                  <div className={styles.enrollmentDetailItem}>
                    <div className={styles.enrollmentDetailLabel}>
                      <FontAwesomeIcon icon={faClipboardList} /> Status
                    </div>
                    <div className={styles.enrollmentDetailValue}>
                      {applicationDetail.status.toLowerCase() === 'approved' ? (
                        <span className={`${styles.statusBadge} ${styles.approved}`}>
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Approved
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'rejected' || applicationDetail.status.toLowerCase() === 'reject' ? (
                        <span className={`${styles.statusBadge} ${styles.rejected}`}>
                          <FontAwesomeIcon icon={faBan} />
                          Rejected
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'paid' ? (
                        <span className={`${styles.statusBadge} ${styles.paid}`}>
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          Paid
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'enrolled' ? (
                        <span className={`${styles.statusBadge} ${styles.enrolled}`}>
                          <FontAwesomeIcon icon={faUserGraduate} />
                          Enrolled
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.pending}`}>
                          <FontAwesomeIcon icon={faClock} />
                            Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedApplication && selectedApplication.status.toLowerCase() === 'pending' && (
              <div className={styles.enrollmentModalActions}>
                <button 
                  className={`${styles.reject} ${styles.enrollmentActionButton}`} 
                  onClick={() => openNotificationModal('reject', selectedApplication)}
                >
                  <FontAwesomeIcon icon={faBan} /> Reject
                </button>
                <button 
                  className={`${styles.approve} ${styles.enrollmentActionButton}`} 
                  onClick={() => openNotificationModal('approve', selectedApplication)}
                >
                  <FontAwesomeIcon icon={faCheck} /> Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showNotificationModal && (
        <div className={styles.enrollmentNotificationModal} onClick={handleNotificationClose}>
          <div className={styles.enrollmentNotificationContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.enrollmentNotificationHeader}>
              <h2 className={styles.enrollmentNotificationTitle}>
                <FontAwesomeIcon icon={faBell} /> Send notification to parent
              </h2>
              <button className={styles.enrollmentNotificationClose} onClick={handleNotificationClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleNotificationSubmit} className={styles.enrollmentNotificationForm}>
              <div className={styles.enrollmentNotificationBody}>
                <div className={styles.enrollmentNotificationInfo}>
                  <p>
                    <strong>To:</strong> {selectedApplication.parentName}
                  </p>
                  <p>
                    <strong>Application for:</strong> {selectedApplication.childrenName}
                  </p>
                  <p>
                    <strong>Action:</strong> {notificationAction === 'approve' ? 'Approve' : 'Reject'}
                  </p>
                </div>
                
                <div className={styles.enrollmentNotificationField}>
                  <label htmlFor="title">Notification title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={notification.title}
                    onChange={handleNotificationChange}
                    required
                  />
                </div>
                
                <div className={styles.enrollmentNotificationField}>
                  <label htmlFor="content">Notification content</label>
                  <textarea
                    id="content"
                    name="content"
                    rows="5"
                    value={notification.content}
                    onChange={handleNotificationChange}
                    required
                  ></textarea>
                </div>
              </div>
              
              <div className={styles.enrollmentNotificationActions}>
                <button 
                  type="button" 
                  className={`${styles.reject} ${styles.enrollmentActionButton}`}
                  onClick={handleNotificationClose}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
                <button 
                  type="submit" 
                  className={`${styles.enrollmentActionButton} ${notificationAction === 'approve' ? styles.approve : styles.reject}`}
                >
                  <FontAwesomeIcon icon={faPaperPlane} /> Send and {notificationAction === 'approve' ? 'approve' : 'reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentApplicationManagement;
