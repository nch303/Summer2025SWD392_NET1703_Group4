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
      setError('Không thể tải danh sách đơn nhập học. Vui lòng thử lại sau.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetail = async (application) => {
    try {
      showSpinner('Đang tải thông tin chi tiết...');
      const detail = await getApplicationDetail(application.id);
      setApplicationDetail(detail);
      setSelectedApplication(application);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.', {
        title: 'Lỗi'
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
      title = 'Đơn nhập học đã được phê duyệt';
      content = `Kính gửi Phụ huynh,\n\nĐơn nhập học của bé ${application.childrenName} đã được phê duyệt thành công. Nhà trường sẽ liên hệ với quý phụ huynh để hoàn tất các thủ tục tiếp theo.\n\nTrân trọng,\nTrường mầm non Little Stars.`;
    } else {
      title = 'Đơn nhập học chưa được phê duyệt';
      content = `Kính gửi Phụ huynh,\n\nĐơn nhập học của bé ${application.childrenName} hiện chưa được phê duyệt. Vui lòng liên hệ với nhà trường để biết thêm chi tiết.\n\nTrân trọng,\nTrường mầm non Little Stars.`;
    }
    
    setNotification({
      title,
      content,
      accountIDs: [application.parentID]
    });
    
    setNotificationAction(action);
    setSelectedApplication(application);
    setShowNotificationModal(true);
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
      showSpinner('Đang xử lý...');
      
      await createNotification(notification);
      
      if (notificationAction === 'approve') {
        await approveApplication(selectedApplication.id);
        toast.success('Đã phê duyệt đơn nhập học và gửi thông báo thành công!', {
          title: 'Thành công'
        });
      } else {
        await rejectApplication(selectedApplication.id);
        toast.success('Đã từ chối đơn nhập học và gửi thông báo thành công!', {
          title: 'Thành công'
        });
      }
      
      await fetchApplications();
      
      setShowNotificationModal(false);
      if (isModalOpen) {
        setIsModalOpen(false);
      }
      
    } catch (err) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.', {
        title: 'Lỗi'
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
          Đã duyệt
        </span>;
      case 'rejected':
      case 'reject':
        return <span className="status-badge rejected">
          <FontAwesomeIcon icon={faBan} />
          Từ chối
        </span>;
      case 'paid':
        return <span className="status-badge paid">
          <FontAwesomeIcon icon={faMoneyBillWave} />
          Đã thanh toán
        </span>;
      case 'enrolled':
        return <span className="status-badge enrolled">
          <FontAwesomeIcon icon={faUserGraduate} />
          Đã nhập học
        </span>;
      default:
        return <span className="status-badge pending">
          <FontAwesomeIcon icon={faClock} />
          Chờ duyệt
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
  
  return (
    <div className="enrollment-management">
      <toast.ToastContainer position="top-right" />
      
      <div className="enrollment-management__header">
        <h1 className="enrollment-management__title">Quản lý đơn nhập học</h1>
        <div className="enrollment-management__search">
          <FontAwesomeIcon icon={faSearch} className="enrollment-management__search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên trẻ, phụ huynh, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {!loading && !error && (
        <div className="dashboard-stats-container">
          <div className="dashboard-stats-header">
            <h3 className="dashboard-stats-title">Thống kê đơn nhập học</h3>
            <button 
              className="dashboard-stats-toggle" 
              onClick={toggleStats}
              title={statsCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              <FontAwesomeIcon icon={statsCollapsed ? faChevronDown : faChevronUp} />
            </button>
          </div>
          
          <div className={`dashboard-stats ${statsCollapsed ? 'collapsed' : ''}`}>
            <div className="stat-card total">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Tổng đơn</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faFileAlt} />
                </div>
              </div>
              <p className="stat-card__value">{getTotalApplications()}</p>
              <p className="stat-card__description">Tổng số đơn nhập học</p>
            </div>
            
            <div className="stat-card pending">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Chờ duyệt</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faClipboardList} />
                </div>
              </div>
              <p className="stat-card__value">{getPendingApplications()}</p>
              <p className="stat-card__description">Đơn đang chờ xử lý</p>
            </div>
            
            <div className="stat-card approved">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Đã duyệt</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              </div>
              <p className="stat-card__value">{getApprovedApplications()}</p>
              <p className="stat-card__description">Đơn đã được phê duyệt</p>
            </div>
            
            <div className="stat-card rejected">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Từ chối</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faBan} />
                </div>
              </div>
              <p className="stat-card__value">{getRejectedApplications()}</p>
              <p className="stat-card__description">Đơn đã bị từ chối</p>
            </div>
            
            <div className="stat-card paid">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Đã thanh toán</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
              </div>
              <p className="stat-card__value">{getPaidApplications()}</p>
              <p className="stat-card__description">Đơn đã thanh toán học phí</p>
            </div>
            
            <div className="stat-card enrolled">
              <div className="stat-card__header">
                <h3 className="stat-card__title">Đã nhập học</h3>
                <div className="stat-card__icon">
                  <FontAwesomeIcon icon={faUserGraduate} />
                </div>
              </div>
              <p className="stat-card__value">{getEnrolledApplications()}</p>
              <p className="stat-card__description">Đơn đã hoàn tất nhập học</p>
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
            <FontAwesomeIcon icon={faFilter} /> Lọc theo trạng thái:
          </div>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả đơn</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="paid">Đã thanh toán</option>
            <option value="enrolled">Đã nhập học</option>
          </select>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách đơn nhập học...</p>
        </div>
      ) : (
        <>
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faFileAlt} size="4x" />
              <p>Không có đơn nhập học nào</p>
              {statusFilter !== 'all' && (
                <button 
                  className="action-button view"
                  onClick={() => setStatusFilter('all')}
                >
                  Xem tất cả đơn
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Trẻ</th>
                    <th>Phụ huynh</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
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
                              <FontAwesomeIcon icon={faCheck} /> Duyệt
                            </button>
                            <button 
                              className="reject enrollment-action-button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                openNotificationModal('reject', application);
                              }}
                            >
                              <FontAwesomeIcon icon={faBan} /> Từ chối
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
            title="Trang đầu"
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="enrollment-pagination-button"
            title="Trang trước"
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
            title="Trang sau"
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
            className="enrollment-pagination-button enrollment-last-page"
            title="Trang cuối"
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>
      )}
      
      {isModalOpen && applicationDetail && (
        <div className="enrollment-detail-modal" onClick={closeModal}>
          <div className="enrollment-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="enrollment-detail-header">
              <h2 className="enrollment-detail-title">
                <FontAwesomeIcon icon={faFileAlt} /> Chi tiết đơn nhập học
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
                  <h3 className="enrollment-detail-section-title">Thông tin trẻ</h3>
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
                        <FontAwesomeIcon icon={faCalendarAlt} /> Ngày sinh
                      </div>
                      <div className="enrollment-detail-value">{formatDate(applicationDetail.birthday)}</div>
                    </div>
                    
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faVenusMars} /> Giới tính
                      </div>
                      <div className="enrollment-detail-value">{applicationDetail.gender === 'Male' ? 'Nam' : 'Nữ'}</div>
                    </div>
                    
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faMapMarkerAlt} /> Nơi sinh
                      </div>
                      <div className="enrollment-detail-value">{applicationDetail.city}</div>
                    </div>
                    
                    <div className="enrollment-detail-item">
                      <div className="enrollment-detail-label">
                        <FontAwesomeIcon icon={faFileContract} /> Giấy khai sinh
                      </div>
                      <div className="enrollment-detail-value">
                        <a 
                          href={applicationDetail.birthCertificate} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="enrollment-document-link"
                        >
                          <FontAwesomeIcon icon={faFileAlt} /> Xem giấy khai sinh
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
                  <h3 className="enrollment-detail-section-title">Thông tin phụ huynh</h3>
                </div>
                
                <div className="enrollment-detail-grid">
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faUser} /> Họ và tên
                    </div>
                    <div className="enrollment-detail-value">{applicationDetail.parentName}</div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faPhone} /> Số điện thoại
                    </div>
                    <div className="enrollment-detail-value">{applicationDetail.parentPhone}</div>
                  </div>
                  
                  <div className="enrollment-detail-item" style={{ gridColumn: "1 / -1" }}>
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faMapMarkerAlt} /> Địa chỉ
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
                  <h3 className="enrollment-detail-section-title">Thông tin đăng ký</h3>
                </div>
                
                <div className="enrollment-detail-grid">
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faClipboardList} /> Lớp đăng ký
                    </div>
                    <div className="enrollment-detail-value">
                      {applicationDetail.gradeLevelName || "Không có dữ liệu"}
                    </div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faFileAlt} /> Học phí
                    </div>
                    <div className="enrollment-detail-value">
                      {applicationDetail.gradeLevelFee ? `${applicationDetail.gradeLevelFee.toLocaleString('vi-VN')} VNĐ` : "0 VNĐ"}
                    </div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faCalendarAlt} /> Ngày đăng ký
                    </div>
                    <div className="enrollment-detail-value">{formatDate(applicationDetail.enrollDate)}</div>
                  </div>
                  
                  <div className="enrollment-detail-item">
                    <div className="enrollment-detail-label">
                      <FontAwesomeIcon icon={faClipboardList} /> Trạng thái
                    </div>
                    <div className="enrollment-detail-value">
                      {applicationDetail.status.toLowerCase() === 'approved' ? (
                        <span className="status-badge approved">
                          <FontAwesomeIcon icon={faCheckCircle} />
                          Đã duyệt
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'rejected' || applicationDetail.status.toLowerCase() === 'reject' ? (
                        <span className="status-badge rejected">
                          <FontAwesomeIcon icon={faBan} />
                          Từ chối
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'paid' ? (
                        <span className="status-badge paid">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          Đã thanh toán
                        </span>
                      ) : applicationDetail.status.toLowerCase() === 'enrolled' ? (
                        <span className="status-badge enrolled">
                          <FontAwesomeIcon icon={faUserGraduate} />
                          Đã nhập học
                        </span>
                      ) : (
                        <span className="status-badge pending">
                          <FontAwesomeIcon icon={faClock} />
                          Chờ duyệt
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
                  <FontAwesomeIcon icon={faBan} /> Từ chối đơn
                </button>
                <button 
                  className="approve enrollment-action-button" 
                  onClick={() => openNotificationModal('approve', selectedApplication)}
                >
                  <FontAwesomeIcon icon={faCheck} /> Phê duyệt đơn
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showNotificationModal && (
        <div className="enrollment-notification-modal" onClick={() => setShowNotificationModal(false)}>
          <div className="enrollment-notification-content" onClick={(e) => e.stopPropagation()}>
            <div className="enrollment-notification-header">
              <h2 className="enrollment-notification-title">
                <FontAwesomeIcon icon={faBell} /> Gửi thông báo đến phụ huynh
              </h2>
              <button className="enrollment-notification-close" onClick={() => setShowNotificationModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleNotificationSubmit} className="enrollment-notification-form">
              <div className="enrollment-notification-body">
                <div className="enrollment-notification-info">
                  <p>
                    <strong>Gửi đến:</strong> {selectedApplication.parentName}
                  </p>
                  <p>
                    <strong>Đơn cho bé:</strong> {selectedApplication.childrenName}
                  </p>
                  <p>
                    <strong>Hành động:</strong> {notificationAction === 'approve' ? 'Phê duyệt đơn' : 'Từ chối đơn'}
                  </p>
                </div>
                
                <div className="enrollment-notification-field">
                  <label htmlFor="title">Tiêu đề thông báo</label>
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
                  <label htmlFor="content">Nội dung thông báo</label>
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
                  onClick={() => setShowNotificationModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} /> Hủy
                </button>
                <button 
                  type="submit" 
                  className={`enrollment-action-button ${notificationAction === 'approve' ? 'approve' : 'reject'}`}
                >
                  <FontAwesomeIcon icon={faPaperPlane} /> Gửi và {notificationAction === 'approve' ? 'phê duyệt' : 'từ chối'}
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
