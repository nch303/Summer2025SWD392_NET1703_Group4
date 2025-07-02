import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faTimes, faEye, faCheck, faBan, faFileAlt, 
  faChild, faUser, faClipboardList, faCalendarAlt, faMapMarkerAlt,
  faVenusMars, faFileContract, faFilter, faPhone, faClock, faCheckCircle,
  faBell, faPaperPlane, faMoneyBillWave, faUserGraduate, faChevronUp, faChevronDown,
  faAngleLeft, faAngleRight, faAngleDoubleLeft, faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';
import { getAllApplications, getApplicationDetail, approveApplication, rejectApplication, createNotification } from './EnrollmentApplicationManagementService';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import './EnrollmentApplicationManagement.css';

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
        return <span className="status-badge approved">
          <FontAwesomeIcon icon={faCheckCircle} />
            Approved
        </span>;
      case 'rejected':
      case 'reject':
        return <span className="status-badge rejected">
          <FontAwesomeIcon icon={faBan} />
          Rejected
        </span>;
      case 'paid':
        return <span className="status-badge paid">
          <FontAwesomeIcon icon={faMoneyBillWave} />
          Paid
        </span>;
      case 'enrolled':
        return <span className="status-badge enrolled">
          <FontAwesomeIcon icon={faUserGraduate} />
          Enrolled
        </span>;
      default:
        return <span className="status-badge pending">
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
    <div className="enrollment-management">
      <toast.ToastContainer position="top-right" />
      
      <div className="enrollment-management__header">
        <h1 className="enrollment-management__title">Enrollment application management</h1>
        <div className="enrollment-management__search">
          <FontAwesomeIcon icon={faSearch} className="enrollment-management__search-icon" />
          <input
            type="text"
            placeholder="Search by child name, parent name, phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {!loading && !error && (
        <div className="dashboard-stats-container">
          <div className="dashboard-stats-header">
            <h3 className="dashboard-stats-title">Enrollment application statistics</h3>
            <button 
              className="dashboard-stats-toggle" 
              onClick={toggleStats}
              title={statsCollapsed ? "Expand" : "Collapse"}
            >
              <FontAwesomeIcon icon={statsCollapsed ? faChevronDown : faChevronUp} />
            </button>
          </div>
          
          <div className={`dashboard-stats ${statsCollapsed ? 'collapsed' : ''}`}>
            <div className="stat-card total">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Total applications</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
              </div>
              <p className="stat-card__value">{getTotalApplications()}</p>
              <p className="stat-card__description">Total applications</p>
            </div>
            
            <div className="stat-card pending">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Pending</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faClipboardList} />
                </div>
              </div>
              <p className="stat-card__value">{getPendingApplications()}</p>
              <p className="stat-card__description">Applications pending</p>
            </div>
            
            <div className="stat-card approved">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Approved</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              </div>
              <p className="stat-card__value">{getApprovedApplications()}</p>
              <p className="stat-card__description">Applications approved</p>
            </div>
            
            <div className="stat-card rejected">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Rejected</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faBan} />
                </div>
              </div>
              <p className="stat-card__value">{getRejectedApplications()}</p>
              <p className="stat-card__description">Applications rejected</p>
            </div>
            
            <div className="stat-card paid">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Paid</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
              </div>
              <p className="stat-card__value">{getPaidApplications()}</p>
              <p className="stat-card__description">Applications paid</p>
            </div>
            
            <div className="stat-card enrolled">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Enrolled</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faUserGraduate} />
                </div>
              </div>
              <p className="stat-card__value">{getEnrolledApplications()}</p>
              <p className="stat-card__description">Applications enrolled</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="message error-message">
          <div className="message-icon">
            <FontAwesomeIcon icon={faTimes} />
          </div>
          <span>{error}</span>
        </div>
      )}
      
      {!loading && !error && (
        <div className="filter-section">
          <div className="filter-label">
            <FontAwesomeIcon icon={faFilter} /> Filter by status:
          </div>
          <select 
            className="filter-select"
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading enrollment application list...</p>
        </div>
      ) : (
        <>
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faFileAlt} size="4x" />
              <p>No enrollment application found</p>
              {statusFilter !== 'all' && (
                <button 
                  className="action-button view"
                  onClick={() => setStatusFilter('all')}
                >
                  View all applications
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
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
                      className="application-row"
                      onClick={() => handleViewDetail(application)}
                    >
                      <td>#{application.id.substring(0, 6)}</td>
                      
                      <td>
                        <div className="child-cell">
                          <img 
                            src={application.avatar} 
                            alt={application.childrenName} 
                            className="child-avatar" 
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + application.childrenName }} 
                          />
                          <div className="child-info-container">
                            <div className="list-child-name">{application.childrenName}</div>
                            <div className="child-birthdate">
                              <FontAwesomeIcon icon={faCalendarAlt} size="xs" />
                              {formatDate(application.birthday)}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className="parent-cell">
                          <div className="parent-name">{application.parentName}</div>
                          <div className="parent-phone">
                            <FontAwesomeIcon icon={faPhone} size="xs" />
                            {application.parentPhone}
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div className="date-cell">
                          <div className="date-primary">{formatDate(application.enrollDate)}</div>
                          <div className="date-secondary">
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
                      
                      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                        {application.status.toLowerCase() === 'pending' && (
                          <>
                            <button 
                              className="approve enrollment-action-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openNotificationModal('approve', application);
                              }}
                            >
                              <FontAwesomeIcon icon={faCheck} /> Approve
                            </button>
                            <button 
                              className="reject enrollment-action-button" 
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
        <div className="enrollment-pagination">
          <button 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
            className="enrollment-pagination-button enrollment-first-page"
            title="First page"
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="enrollment-pagination-button"
            title="Previous page"
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          
          <div className="enrollment-pagination-info">
            <span className="enrollment-current-page">{currentPage}</span>
            <span className="enrollment-total-pages">/ {totalPages}</span>
          </div>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="enrollment-pagination-button"
            title="Next page"
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
            className="enrollment-pagination-button enrollment-last-page"
            title="Last page"
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
      )}
      
      {isModalOpen && applicationDetail && (
        <div className="enrollment-detail-modal" onClick={closeModal}>
          <div 
            className="enrollment-detail-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              willChange: 'transform, opacity', 
              contain: 'content',
              overscrollBehavior: 'contain' 
            }}
          >
            <div className="enrollment-detail-header">
              <h2 className="enrollment-detail-title">
                  <FontAwesomeIcon icon={faFileAlt} /> Enrollment application detail
              </h2>
              <button className="enrollment-detail-close" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="enrollment-detail-body">
              <div className="enrollment-detail-section">
                <div className="enrollment-detail-section-header">
                  <div className="enrollment-detail-section-icon child-info-icon">
                    <FontAwesomeIcon icon={faChild} />
                  </div>
                  <h3 className="enrollment-detail-section-title">Child information</h3>
                </div>
                
                <div className="enrollment-detail-grid">
                  <div className="enrollment-child-profile">
                    <img 
                      src={applicationDetail.avatar} 
                      alt={applicationDetail.childrenName} 
                      className="enrollment-child-image"
                      onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + applicationDetail.childrenName }}
                    />
                    <div className="enrollment-child-name">{applicationDetail.childrenName}</div>
                    <div className="enrollment-child-bio">
                      <div className="enrollment-child-bio-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {formatDate(applicationDetail.birthday)}
                      </div>
                      <div className="enrollment-child-bio-item">
                        <FontAwesomeIcon icon={faVenusMars} />
                        {applicationDetail.gender === 'Male' ? 'Nam' : 'Nữ'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faCalendarAlt} /> Birthday
                      </div>
                      <div className="enrollment-detail-value">{formatDate(applicationDetail.birthday)}</div>
                    </div>
                    
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faVenusMars} /> Gender
                      </div>
                      <div className="enrollment-detail-value">{applicationDetail.gender === 'Male' ? 'Nam' : 'Nữ'}</div>
                    </div>
                    
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Place of birth
                      </div>
                      <div className="enrollment-detail-value">{applicationDetail.city}</div>
                    </div>
                    
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faFileContract} /> Birth certificate
                      </div>
                      <div className="enrollment-detail-value">
                        <a 
                          href={applicationDetail.birthCertificate} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="enrollment-document-link"
                        >
                          <FontAwesomeIcon icon={faFileAlt} /> View birth certificate
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="enrollment-detail-section">
                <div className="enrollment-detail-section-header">
                  <div className="enrollment-detail-section-icon parent-info-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <h3 className="enrollment-detail-section-title">Parent information</h3>
                </div>
                
                <div className="enrollment-detail-grid">
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faUser} /> Full name
                    </div>
                    <div className="enrollment-detail-value">{applicationDetail.parentName}</div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faPhone} /> Phone
                    </div>
                    <div className="enrollment-detail-value">{applicationDetail.parentPhone}</div>
                  </div>
                  
                  <div className="enrollment-detail-item" style={{ gridColumn: "1 / -1" }}>
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> Address
                    </div>
                    <div className="enrollment-detail-value">{applicationDetail.address}</div>
                  </div>
                </div>
              </div>
              
              <div className="enrollment-detail-section">
                <div className="enrollment-detail-section-header">
                  <div className="enrollment-detail-section-icon registration-info-icon">
                    <FontAwesomeIcon icon={faClipboardList} />
                  </div>
                  <h3 className="enrollment-detail-section-title">Enrollment information</h3>
                </div>
                
                <div className="enrollment-detail-grid">
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faClipboardList} /> Class
                    </div>
                    <div className="enrollment-detail-value">
                      {applicationDetail.gradeLevelName || "Không có dữ liệu"}
                    </div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faFileAlt} /> Tuition fee
                    </div>
                    <div className="enrollment-detail-value">
                      {applicationDetail.gradeLevelFee ? `${applicationDetail.gradeLevelFee.toLocaleString('vi-VN')} VNĐ` : "0 VNĐ"}
                    </div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faCalendarAlt} /> Enrollment date
                    </div>
                    <div className="enrollment-detail-value">{formatDate(applicationDetail.enrollDate)}</div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faClipboardList} /> Status
                    </div>
                    <div className="enrollment-detail-value">
                      {applicationDetail.status.toLowerCase() === 'approved' ? (
                        <span className="status-badge approved">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Approved
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'rejected' || applicationDetail.status.toLowerCase() === 'reject' ? (
                        <span className="status-badge rejected">
                          <FontAwesomeIcon icon={faBan} />
                          Rejected
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'paid' ? (
                        <span className="status-badge paid">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          Paid
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'enrolled' ? (
                        <span className="status-badge enrolled">
                          <FontAwesomeIcon icon={faUserGraduate} />
                          Enrolled
                        </span>
                      ) : (
                        <span className="status-badge pending">
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
              <div className="enrollment-modal-actions">
                <button 
                  className="reject enrollment-action-button" 
                  onClick={() => openNotificationModal('reject', selectedApplication)}
                >
                  <FontAwesomeIcon icon={faBan} /> Reject
                </button>
                <button 
                  className="approve enrollment-action-button" 
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
        <div className="enrollment-notification-modal" onClick={handleNotificationClose}>
          <div className="enrollment-notification-content" onClick={(e) => e.stopPropagation()}>
            <div className="enrollment-notification-header">
              <h2 className="enrollment-notification-title">
                <FontAwesomeIcon icon={faBell} /> Send notification to parent
              </h2>
              <button className="enrollment-notification-close" onClick={handleNotificationClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleNotificationSubmit} className="enrollment-notification-form">
              <div className="enrollment-notification-body">
                <div className="enrollment-notification-info">
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
                
                <div className="enrollment-notification-field">
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
                
                <div className="enrollment-notification-field">
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
              
              <div className="enrollment-notification-actions">
                <button 
                  type="button" 
                  className="enrollment-action-button reject"
                  onClick={handleNotificationClose}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
                <button 
                  type="submit" 
                  className={`enrollment-action-button ${notificationAction === 'approve' ? 'approve' : 'reject'}`}
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
