import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEnrollmentApplicationsProgress, getEnrollmentApplicationDetail, createPaymentUrlForEnrollment, getInvoiceDetails } from './EnrollmentTrackingService';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import './EnrollmentTrackingPage.css';

const EnrollmentTrackingPage = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDetail, setApplicationDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const modalOverlayRef = useRef(null);
  const [invoices, setInvoices] = useState({});
  const [processingPayment, setProcessingPayment] = useState({});
  
  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();
  
  useEffect(() => {
    fetchApplications();
  }, []);
  
  const fetchApplications = async () => {
    try {
      showSpinner('Đang tải thông tin đăng ký...');
      const data = await getEnrollmentApplicationsProgress();
      setApplications(data || []);
      
      // Fetch invoice details for applications with invoiceID
      const invoicePromises = data
        .filter(app => app.invoiceID)
        .map(app => getInvoiceDetails(app.invoiceID)
          .then(invoiceData => ({ id: app.invoiceID, data: invoiceData }))
          .catch(err => {
            console.error(`Error fetching invoice ${app.invoiceID}:`, err);
            return { id: app.invoiceID, error: true };
          })
        );
      
      if (invoicePromises.length > 0) {
        const invoiceResults = await Promise.all(invoicePromises);
        const invoiceMap = {};
        invoiceResults.forEach(result => {
          if (!result.error) {
            invoiceMap[result.id] = result.data;
          }
        });
        setInvoices(invoiceMap);
      }
      
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin đăng ký. Vui lòng thử lại sau.');
      toast.error('Không thể tải thông tin đăng ký.');
      console.error('Error fetching applications:', err);
    } finally {
      hideSpinner();
      setIsRefreshing(false);
    }
  };

  const fetchApplicationDetail = async (eAId) => {
    try {
      setLoadingDetail(true);
      const data = await getEnrollmentApplicationDetail(eAId);
      setApplicationDetail(data);
    } catch (err) {
      toast.error('Không thể tải thông tin chi tiết đơn đăng ký.');
      console.error('Error fetching application detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDetailClick = (application) => {
    // Store the current scroll position
    const scrollY = window.scrollY;
    
    // Add styles directly to prevent scrolling and maintain page position
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.classList.add('no-scroll');
    
    setSelectedApplication(application);
    fetchApplicationDetail(application.eaid);
    setShowDetailModal(true);
    
    setTimeout(() => {
      setModalVisible(true);
    }, 10);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    
    setTimeout(() => {
      // Restore the scroll position when modal closes
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('no-scroll');
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      
      setShowDetailModal(false);
      setSelectedApplication(null);
      setApplicationDetail(null);
    }, 250);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showDetailModal) {
        closeDetailModal();
      }
    };

    if (showDetailModal) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [showDetailModal]);

  useEffect(() => {
    if (applicationDetail && applicationDetail.avatar) {
      const img = new Image();
      img.src = applicationDetail.avatar;
    }
    
    if (applicationDetail && applicationDetail.birthCertificate) {
      const img = new Image();
      img.src = applicationDetail.birthCertificate;
    }
  }, [applicationDetail]);

  const refreshData = () => {
    setIsRefreshing(true);
    fetchApplications();
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'tracking-pending';
      case 'Approved': return 'tracking-approved';
      case 'Paid': return 'tracking-paid';
      case 'Enrolled': return 'tracking-enrolled';
      case 'Rejected': return 'tracking-rejected';
      default: return 'tracking-pending';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'clock';
      case 'Approved': return 'check-circle';
      case 'Paid': return 'money-check-alt';
      case 'Enrolled': return 'user-check';
      case 'Rejected': return 'times-circle';
      default: return 'clock';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'Đang xử lý';
      case 'Approved': return 'Đã duyệt';
      case 'Paid': return 'Đã thanh toán';
      case 'Enrolled': return 'Đã nhập học';
      case 'Rejected': return 'Đã từ chối';
      default: return 'Đang xử lý';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString || dateString.includes('0001-01-01')) return 'Chưa có';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const filteredAndSortedApplications = useMemo(() => {
    // Filter by status
    let result = filterStatus === 'all' 
      ? applications 
      : applications.filter(app => app.status === filterStatus);
    
    // Search by child name
    if (searchQuery.trim() !== '') {
      const lowerCaseQuery = searchQuery.toLowerCase().trim();
      result = result.filter(app => 
        app.childrenName.toLowerCase().includes(lowerCaseQuery) ||
        app.gradeLevelName.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Sort by selected order
    return [...result].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortOrder === 'nameAsc') {
        return a.childrenName.localeCompare(b.childrenName);
      } else if (sortOrder === 'nameDesc') {
        return b.childrenName.localeCompare(a.childrenName);
      }
      return 0;
    });
  }, [applications, filterStatus, searchQuery, sortOrder]);
  
  const handlePayment = async (application) => {
    try {
      // Set this application's payment as processing
      setProcessingPayment(prev => ({ ...prev, [application.eaid]: true }));
      
      let paymentWindow = null;
      
      // Check if we already have an invoice with a payment link
      if (application.invoiceID && invoices[application.invoiceID]) {
        const invoice = invoices[application.invoiceID];
        if (invoice.paymentLink) {
          // Use existing payment link
          showSpinner('Đang chuyển đến trang thanh toán...');
          paymentWindow = window.open(invoice.paymentLink, '_blank');
          
          // Set up window close monitoring with faster checking (300ms interval)
          const checkWindowClosed = setInterval(() => {
            if (paymentWindow && paymentWindow.closed) {
              clearInterval(checkWindowClosed);
              hideSpinner();
              setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
              
              // Refresh data immediately after payment window closes
              fetchApplications();
              toast.info('Đang cập nhật trạng thái thanh toán...');
            }
          }, 300);
          
          // Safety timeout to reset state after 5 minutes
          setTimeout(() => {
            if (!paymentWindow.closed) {
              hideSpinner();
              setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
            }
            clearInterval(checkWindowClosed);
          }, 300000);
          
          return;
        }
      }
      
      // Otherwise, create a new payment URL
      showSpinner('Đang tạo liên kết thanh toán...');
      const response = await createPaymentUrlForEnrollment(application.childrenID);
      
      if (response && response.url) {
        paymentWindow = window.open(response.url, '_blank');
        
        // Set up window close monitoring with faster checking (300ms interval)
        const checkWindowClosed = setInterval(() => {
          if (paymentWindow && paymentWindow.closed) {
            clearInterval(checkWindowClosed);
            hideSpinner();
            setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
            
            // Refresh data immediately after payment window closes
            fetchApplications();
            toast.info('Đang cập nhật trạng thái thanh toán...');
          }
        }, 300);
        
        // Safety timeout to reset state after 5 minutes
        setTimeout(() => {
          if (paymentWindow && !paymentWindow.closed) {
            hideSpinner();
            setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
          }
          clearInterval(checkWindowClosed);
        }, 300000);
        
      } else {
        console.error('Invalid response format:', response);
        toast.error('Không thể tạo liên kết thanh toán. Định dạng phản hồi không hợp lệ.');
        hideSpinner();
        setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
      }
    } catch (err) {
      let errorMessage = 'Đã xảy ra lỗi khi tạo liên kết thanh toán.';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = `Lỗi: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Lỗi: ${err.message}`;
      }
      
      toast.error(errorMessage);
      console.error('Payment error details:', err);
      hideSpinner();
      setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
    }
  };
  
  const renderPaymentButton = (app) => {
    // Nếu đơn bị từ chối, không hiển thị nút thanh toán
    if (app.status === 'Rejected') {
      return null;
    }
    
    // Check if payment is processing for this application
    const isProcessing = processingPayment[app.eaid];
    
    // Nếu có invoice, kiểm tra trạng thái và hiển thị nút phù hợp
    if (app.invoiceID && invoices[app.invoiceID]) {
      const invoice = invoices[app.invoiceID];
      
      if (invoice.status === 'Failed') {
        return (
          <button 
            className={`tracking-action-btn tracking-payment-btn ${isProcessing ? 'tracking-processing' : 'tracking-pulse'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isProcessing) handlePayment(app);
            }}
            disabled={isProcessing}
          >
            <FontAwesomeIcon icon={isProcessing ? "spinner" : "sync"} spin={isProcessing} />
            {isProcessing ? 'Đang xử lý...' : 'Thử thanh toán lại'}
          </button>
        );
      } else if (invoice.status === 'Pending') {
        return (
          <button 
            className={`tracking-action-btn tracking-payment-btn ${isProcessing ? 'tracking-processing' : 'tracking-pulse'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isProcessing) handlePayment(app);
            }}
            disabled={isProcessing}
          >
            <FontAwesomeIcon icon={isProcessing ? "spinner" : "credit-card"} spin={isProcessing} />
            {isProcessing ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
          </button>
        );
      }
    }
    
    // Trường hợp chưa có invoice hoặc cần tạo mới
    if (app.status === 'Approved') {
      return (
        <button 
          className={`tracking-action-btn tracking-payment-btn ${isProcessing ? 'tracking-processing' : 'tracking-pulse'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isProcessing) handlePayment(app);
          }}
          disabled={isProcessing}
        >
          <FontAwesomeIcon icon={isProcessing ? "spinner" : "credit-card"} spin={isProcessing} />
          {isProcessing ? 'Đang xử lý...' : 'Thanh toán học phí'}
        </button>
      );
    }
    
    return null;
  }
  
  return (
    <div className="tracking-container">
      <toast.ToastContainer position="top-right" />
      
      <div className="tracking-layout">
        <div className="tracking-sidebar">
          <div className="tracking-sidebar-header">
            <FontAwesomeIcon icon="filter" className="tracking-sidebar-icon" />
            <h3>Trạng thái</h3>
          </div>
          
          <div className="tracking-status-tabs">
            <button 
              className={`tracking-tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <span className="tracking-tab-icon">
                <FontAwesomeIcon icon="list" />
              </span>
              <span className="tracking-tab-text">Tất cả</span>
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Pending')}
            >
              <span className="tracking-tab-icon tracking-pending">
                <FontAwesomeIcon icon="clock" />
              </span>
              <span className="tracking-tab-text">Đang xử lý</span>
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Approved')}
            >
              <span className="tracking-tab-icon tracking-approved">
                <FontAwesomeIcon icon="check-circle" />
              </span>
              <span className="tracking-tab-text">Đã duyệt</span>
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Paid' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Paid')}
            >
              <span className="tracking-tab-icon tracking-paid">
                <FontAwesomeIcon icon="money-check-alt" />
              </span>
              <span className="tracking-tab-text">Đã thanh toán</span>
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Enrolled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Enrolled')}
            >
              <span className="tracking-tab-icon tracking-enrolled">
                <FontAwesomeIcon icon="user-check" />
              </span>
              <span className="tracking-tab-text">Đã nhập học</span>
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Rejected')}
            >
              <span className="tracking-tab-icon tracking-rejected">
                <FontAwesomeIcon icon="times-circle" />
              </span>
              <span className="tracking-tab-text">Đã từ chối</span>
            </button>
          </div>
        </div>
        
        <div className="tracking-content-area">
          <div className="tracking-paper">
            <div className="tracking-header">
              <div className="tracking-header-content">
                <FontAwesomeIcon icon="tasks" className="tracking-header-icon" />
                <h1>Theo dõi tiến trình đăng ký</h1>
              </div>
            </div>
            
            {error && (
              <div className="tracking-message tracking-error-message">
                <div className="tracking-message-icon">
                  <FontAwesomeIcon icon="times-circle" />
                </div>
                <span>{error}</span>
              </div>
            )}
            
            <div className="tracking-content">
              {/* Search and filter bar */}
              <div className="tracking-search-and-filter">
                <div className="tracking-search-bar">
                  <FontAwesomeIcon icon="search" className="tracking-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên trẻ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="tracking-search-input"
                  />
                  {searchQuery && (
                    <button 
                      className="tracking-clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  )}
                </div>
                
                <div className="tracking-sort-dropdown">
                  <label htmlFor="sortOrder">
                    <FontAwesomeIcon icon="sort" /> Sắp xếp:
                  </label>
                  <select 
                    id="sortOrder" 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="tracking-sort-select"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="nameAsc">Tên A-Z</option>
                    <option value="nameDesc">Tên Z-A</option>
                  </select>
                </div>
              </div>
              
              {/* Applications list */}
              {filteredAndSortedApplications.length > 0 ? (
                <div className="tracking-applications-list">
                  {filteredAndSortedApplications.map((app) => (
                    <div 
                      key={app.eaid} 
                      className="tracking-application-card" 
                      data-status={app.status}
                    >
                      <div className={`tracking-application-status ${getStatusColor(app.status)}`}>
                        <div className="tracking-status-icon">
                          <FontAwesomeIcon icon={getStatusIcon(app.status)} />
                        </div>
                        <span className="tracking-status-text">{getStatusText(app.status)}</span>
                      </div>
                      
                      <div className="tracking-application-info">
                        <h3 className="tracking-child-name">{app.childrenName}</h3>
                        <div className="tracking-application-details">
                          <p>
                            <FontAwesomeIcon icon="calendar-alt" />
                            <span>Năm học: {app.academicYear}</span>
                          </p>
                          <p>
                            <FontAwesomeIcon icon="graduation-cap" />
                            <span>Cấp lớp: {app.gradeLevelName}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="tracking-application-timeline">
                        <div 
                          className={`tracking-timeline-step ${app.status !== 'Rejected' ? 'active' : ''}`} 
                          data-status="Pending"
                        >
                          <div className="tracking-step-number">1</div>
                          <div className="tracking-step-icon">
                            <FontAwesomeIcon icon={app.status !== 'Rejected' ? "check" : "clipboard-list"} />
                          </div>
                          <div className="tracking-step-label">Đăng ký</div>
                        </div>
                        
                        <div 
                          className={`tracking-timeline-connector ${
                            (app.status === 'Approved' || app.status === 'Paid' || app.status === 'Enrolled') 
                              ? 'active' 
                              : app.status === 'Pending' ? 'half-active' : ''
                          }`}
                          data-from="Register" 
                          data-to="Approved"
                        ></div>
                        
                        <div 
                          className={`tracking-timeline-step ${(app.status === 'Approved' || app.status === 'Paid' || app.status === 'Enrolled') ? 'active' : ''}`}
                          data-status="Approved"
                        >
                          <div className="tracking-step-number">2</div>
                          <div className="tracking-step-icon">
                            <FontAwesomeIcon icon={(app.status === 'Approved' || app.status === 'Paid' || app.status === 'Enrolled') ? "check" : "check-circle"} />
                          </div>
                          <div className="tracking-step-label">Phê duyệt</div>
                        </div>
                        
                        <div 
                          className={`tracking-timeline-connector ${
                            (app.status === 'Paid' || app.status === 'Enrolled') 
                              ? 'active' 
                              : app.status === 'Approved' ? 'half-active' : ''
                          }`}
                          data-from="Approved" 
                          data-to="Paid"
                        ></div>
                        
                        <div 
                          className={`tracking-timeline-step ${(app.status === 'Paid' || app.status === 'Enrolled') ? 'active' : ''}`}
                          data-status="Paid"
                        >
                          <div className="tracking-step-number">3</div>
                          <div className="tracking-step-icon">
                            <FontAwesomeIcon icon={(app.status === 'Paid' || app.status === 'Enrolled') ? "check" : "money-check-alt"} />
                          </div>
                          <div className="tracking-step-label">Thanh toán</div>
                        </div>
                        
                        <div 
                          className={`tracking-timeline-connector ${
                            app.status === 'Enrolled' 
                              ? 'active' 
                              : app.status === 'Paid' ? 'half-active' : ''
                          }`}
                          data-from="Paid" 
                          data-to="Enrolled"
                        ></div>
                        
                        <div 
                          className={`tracking-timeline-step ${app.status === 'Enrolled' ? 'active' : ''}`}
                          data-status="Enrolled"
                        >
                          <div className="tracking-step-number">4</div>
                          <div className="tracking-step-icon">
                            <FontAwesomeIcon icon={app.status === 'Enrolled' ? "check" : "user-check"} />
                          </div>
                          <div className="tracking-step-label">Nhập học</div>
                        </div>
                      </div>
                      
                      <div className="tracking-application-actions">
                        {renderPaymentButton(app)}
                        <button 
                          className="tracking-action-btn tracking-detail-btn"
                          onClick={() => handleDetailClick(app)}
                        >
                          <FontAwesomeIcon icon="info-circle" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tracking-no-applications">
                  {searchQuery || filterStatus !== 'all' ? (
                    <>
                      <div className="tracking-no-data-icon">
                        <FontAwesomeIcon icon="filter" />
                      </div>
                      <h3>Không tìm thấy kết quả</h3>
                      <p>Không tìm thấy đơn đăng ký phù hợp với điều kiện tìm kiếm.</p>
                      <button 
                        className="tracking-btn-secondary"
                        onClick={() => {
                          setFilterStatus('all');
                          setSearchQuery('');
                        }}
                      >
                        <FontAwesomeIcon icon="undo" />
                        Xóa bộ lọc
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="tracking-no-data-icon">
                        <FontAwesomeIcon icon="clipboard" />
                      </div>
                      <h3>Không có đơn đăng ký nào</h3>
                      <p>Bạn chưa có đơn đăng ký nhập học nào. Đăng ký nhập học cho con bạn ngay.</p>
                      <Link to="/profile/children" className="tracking-btn-primary">
                        <FontAwesomeIcon icon="plus" />
                        Đăng ký nhập học
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showDetailModal && (
        <div 
          className={`tracking-modal-overlay ${modalVisible ? 'visible' : ''}`}
          onClick={closeDetailModal}
          ref={modalOverlayRef}
        >
          <div 
            className="tracking-modal-content" 
            onClick={e => e.stopPropagation()}
          >
            <div className="tracking-modal-header">
              <h2>Thông tin chi tiết đơn đăng ký</h2>
              <button className="tracking-modal-close-btn" onClick={closeDetailModal}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            
            <div className="tracking-modal-body">
              {loadingDetail ? (
                <div className="tracking-modal-loading">
                  <div className="tracking-loading-spinner"></div>
                  <p>Đang tải thông tin chi tiết...</p>
                </div>
              ) : applicationDetail ? (
                <div className="tracking-detail-content">
                  <div className="tracking-detail-header">
                    <div className="tracking-detail-avatar">
                      {applicationDetail.avatar ? (
                        <img src={applicationDetail.avatar} alt={applicationDetail.childrenName} />
                      ) : (
                        <div className="tracking-detail-avatar-placeholder">
                          <FontAwesomeIcon icon="child" />
                        </div>
                      )}
                    </div>
                    
                    <div className="tracking-detail-main-info">
                      <h3>{applicationDetail.childrenName}</h3>
                      <div className={`tracking-detail-status ${getStatusColor(applicationDetail.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(applicationDetail.status)} />
                        <span>{getStatusText(applicationDetail.status)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tracking-detail-sections">
                    <div className="tracking-detail-section">
                      <h4>
                        <FontAwesomeIcon icon="info-circle" />
                        Thông tin cơ bản
                      </h4>
                      <div className="tracking-detail-grid">
                        <div className="tracking-detail-item">
                          <span className="tracking-detail-label">Ngày sinh:</span>
                          <span className="tracking-detail-value">{formatDate(applicationDetail.birthday)}</span>
                        </div>
                        <div className="tracking-detail-item">
                          <span className="tracking-detail-label">Giới tính:</span>
                          <span className="tracking-detail-value">
                            {applicationDetail.gender === 'Male' ? 'Nam' : 'Nữ'}
                          </span>
                        </div>
                        <div className="tracking-detail-item">
                          <span className="tracking-detail-label">Nơi sinh:</span>
                          <span className="tracking-detail-value">{applicationDetail.city}</span>
                        </div>
                        <div className="tracking-detail-item">
                          <span className="tracking-detail-label">Lớp đăng ký:</span>
                          <span className="tracking-detail-value">{applicationDetail.gradeLevelName}</span>
                        </div>
                        {applicationDetail.status === 'Enrolled' && (
                          <div className="tracking-detail-item">
                            <span className="tracking-detail-label">Ngày nhập học:</span>
                            <span className="tracking-detail-value">{formatDate(applicationDetail.enrollDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="tracking-detail-section">
                      <h4>
                        <FontAwesomeIcon icon="user" />
                        Thông tin phụ huynh
                      </h4>
                      <div className="tracking-detail-grid">
                        <div className="tracking-detail-item">
                          <span className="tracking-detail-label">Họ và tên:</span>
                          <span className="tracking-detail-value">{applicationDetail.parentName}</span>
                        </div>
                        <div className="tracking-detail-item">
                          <span className="tracking-detail-label">Số điện thoại:</span>
                          <span className="tracking-detail-value">{applicationDetail.parentPhone}</span>
                        </div>
                        <div className="tracking-detail-item" style={{ gridColumn: "1 / -1" }}>
                          <span className="tracking-detail-label">Địa chỉ:</span>
                          <span className="tracking-detail-value">{applicationDetail.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="tracking-detail-section">
                      <h4>
                        <FontAwesomeIcon icon="file-alt" />
                        Giấy tờ
                      </h4>
                      <div className="tracking-detail-documents">
                        <div className="tracking-detail-document">
                          <p>Giấy khai sinh</p>
                          {applicationDetail.birthCertificate ? (
                            <div className="tracking-detail-document-preview">
                              <img 
                                src={applicationDetail.birthCertificate} 
                                alt="Giấy khai sinh"
                                onClick={() => window.open(applicationDetail.birthCertificate, '_blank')}
                                className="document-image"
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="tracking-detail-document-overlay">
                                <FontAwesomeIcon icon="search-plus" />
                              </div>
                            </div>
                          ) : (
                            <div className="tracking-detail-document-missing">
                              <FontAwesomeIcon icon="file-excel" />
                              <span>Chưa cung cấp</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tracking-detail-error">
                  <FontAwesomeIcon icon="exclamation-circle" />
                  <p>Không thể tải thông tin chi tiết. Vui lòng thử lại sau.</p>
                </div>
              )}
            </div>
            
            <div className="tracking-modal-footer">
              <button className="tracking-btn-secondary" onClick={closeDetailModal}>
                <FontAwesomeIcon icon="times" />
                Đóng
              </button>
              {applicationDetail && applicationDetail.status === 'Approved' && (
                selectedApplication && selectedApplication.invoiceID && invoices[selectedApplication.invoiceID] ? (
                  <button 
                    className={`tracking-btn-primary ${processingPayment[selectedApplication.eaid] ? 'tracking-processing' : ''}`}
                    onClick={() => {
                      if (!processingPayment[selectedApplication.eaid]) {
                        handlePayment(selectedApplication);
                      }
                    }}
                    disabled={processingPayment[selectedApplication.eaid]}
                  >
                    <FontAwesomeIcon icon={processingPayment[selectedApplication.eaid] ? "spinner" : "credit-card"} 
                                     spin={processingPayment[selectedApplication.eaid]} />
                    {processingPayment[selectedApplication.eaid] 
                      ? 'Đang xử lý...' 
                      : (invoices[selectedApplication.invoiceID].status === 'Failed' 
                          ? 'Thử thanh toán lại' 
                          : 'Tiếp tục thanh toán')}
                  </button>
                ) : (
                  <button 
                    className={`tracking-btn-primary ${processingPayment[selectedApplication.eaid] ? 'tracking-processing' : ''}`}
                    onClick={() => {
                      if (!processingPayment[selectedApplication.eaid]) {
                      handlePayment(selectedApplication);
                      }
                    }}
                    disabled={processingPayment[selectedApplication.eaid]}
                  >
                    <FontAwesomeIcon icon={processingPayment[selectedApplication.eaid] ? "spinner" : "credit-card"} 
                                     spin={processingPayment[selectedApplication.eaid]} />
                    {processingPayment[selectedApplication.eaid] ? 'Đang xử lý...' : 'Thanh toán'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentTrackingPage;