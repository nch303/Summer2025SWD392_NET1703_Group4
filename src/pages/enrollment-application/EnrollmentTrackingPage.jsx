import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getEnrollmentApplicationsProgress } from './EnrollmentTrackingService';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import './EnrollmentTrackingPage.css';

const EnrollmentTrackingPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();
  
  useEffect(() => {
    fetchApplications();
  }, []);
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      showSpinner('Đang tải thông tin đăng ký...');
      const data = await getEnrollmentApplicationsProgress();
      setApplications(data || []);
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin đăng ký. Vui lòng thử lại sau.');
      toast.error('Không thể tải thông tin đăng ký.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
      hideSpinner();
      setIsRefreshing(false);
    }
  };

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
      case 'Reject': return 'tracking-rejected';
      default: return 'tracking-pending';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'clock';
      case 'Approved': return 'check-circle';
      case 'Paid': return 'money-check-alt';
      case 'Enrolled': return 'user-check';
      case 'Reject': return 'times-circle';
      default: return 'clock';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'Đang xử lý';
      case 'Approved': return 'Đã duyệt';
      case 'Paid': return 'Đã thanh toán';
      case 'Enrolled': return 'Đã nhập học';
      case 'Reject': return 'Đã từ chối';
      default: return 'Đang xử lý';
    }
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
  
  if (loading && applications.length === 0) {
    return (
      <div className="tracking-container">
        <div className="tracking-loading-overlay">
          <div className="tracking-loading-spinner"></div>
          <p>Đang tải thông tin đăng ký...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="tracking-container">
      <toast.ToastContainer position="top-right" />
      
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
          
          {/* Filter tabs */}
          <div className="tracking-status-tabs">
            <button 
              className={`tracking-tab-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <span className="tracking-tab-icon">
                <FontAwesomeIcon icon="list" />
              </span>
              Tất cả
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Pending')}
            >
              <span className="tracking-tab-icon tracking-pending">
                <FontAwesomeIcon icon="clock" />
              </span>
              Đang xử lý
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Approved')}
            >
              <span className="tracking-tab-icon tracking-approved">
                <FontAwesomeIcon icon="check-circle" />
              </span>
              Đã duyệt
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Paid' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Paid')}
            >
              <span className="tracking-tab-icon tracking-paid">
                <FontAwesomeIcon icon="money-check-alt" />
              </span>
              Đã thanh toán
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Enrolled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Enrolled')}
            >
              <span className="tracking-tab-icon tracking-enrolled">
                <FontAwesomeIcon icon="user-check" />
              </span>
              Đã nhập học
            </button>
            <button 
              className={`tracking-tab-btn ${filterStatus === 'Reject' ? 'active' : ''}`}
              onClick={() => setFilterStatus('Reject')}
            >
              <span className="tracking-tab-icon tracking-rejected">
                <FontAwesomeIcon icon="times-circle" />
              </span>
              Đã từ chối
            </button>
          </div>
          
          {/* Applications list */}
          {filteredAndSortedApplications.length > 0 ? (
            <div className="tracking-applications-list">
              {filteredAndSortedApplications.map((app) => (
                <div key={app.eaid} className="tracking-application-card">
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
                      className={`tracking-timeline-step ${app.status !== 'Reject' ? 'active' : ''}`} 
                      data-status="Pending"
                    >
                      <div className="tracking-step-icon">
                        <FontAwesomeIcon icon="clipboard-list" />
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
                      <div className="tracking-step-icon">
                        <FontAwesomeIcon icon="check-circle" />
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
                      <div className="tracking-step-icon">
                        <FontAwesomeIcon icon="money-check-alt" />
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
                      <div className="tracking-step-icon">
                        <FontAwesomeIcon icon="user-check" />
                      </div>
                      <div className="tracking-step-label">Nhập học</div>
                    </div>
                  </div>
                  
                  <div className="tracking-application-actions">
                    {app.status === 'Approved' && (
                      <button className="tracking-action-btn tracking-payment-btn tracking-pulse">
                        <FontAwesomeIcon icon="credit-card" />
                        Thanh toán ngay
                      </button>
                    )}
                    <button className="tracking-action-btn tracking-detail-btn">
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
  );
};

export default EnrollmentTrackingPage;