import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAllEnrichmentProgramsForParent, registerForProgram, getChildrenByParentId, getEnrichmentClassRegistrations, createPaymentUrl } from './EnrichmentProgramService';
import { useUser } from '../../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import { formatDate } from '../../utils/formatDate';
import './EnrichmentProgram.css';
import 'react-toastify/dist/ReactToastify.css';

const EnrichmentProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildIds, setSelectedChildIds] = useState([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('programs'); // 'programs' or 'history'

  const containerRef = useRef(null);
  const modalRef = useRef(null);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const ITEMS_PER_PAGE = 8;

  const [childrenFetched, setChildrenFetched] = useState(false);
  const [childrenLastFetched, setChildrenLastFetched] = useState(0);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await getAllEnrichmentProgramsForParent();
        setPrograms(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu chương trình học. Vui lòng thử lại sau.');
        console.error('Error fetching programs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch registration history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history' && currentUser?.id) {
      fetchRegistrationHistory();
    }
  }, [activeTab, currentUser]);

  const fetchRegistrationHistory = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoadingHistory(true);
      const data = await getEnrichmentClassRegistrations(currentUser.id);
      setRegistrations(data || []);
      setHistoryError(null);
    } catch (err) {
      setHistoryError('Không thể tải dữ liệu đăng ký lớp học. Vui lòng thử lại sau.');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePayment = async (registration) => {
    if (processingPayment) return;
    
    try {
      setProcessingPayment(true);
      
      const paymentData = {
        orderType: "Enrichment Program Payment",
        amount: registration.classResponse.enrichmentProgramFee || 0,
        orderDescription: `Thanh toán lớp ${registration.classResponse.epName}`,
        name: registration.childrenResponse.name,
        childrenID: registration.childrenResponse.id,
        enrichmentPrograms: [registration.classResponse.enrichmentProgramId]
      };
      
      const response = await createPaymentUrl(paymentData);
      
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        toast.error('Không thể tạo đường dẫn thanh toán. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại sau.');
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      prefetchChildrenData();
    }
  }, [currentUser]);

  const prefetchChildrenData = async () => {
    try {
      setChildrenLoading(true);
      const data = await getChildrenByParentId(currentUser.id);
      // Filter out children with null gradeLevelName
      const filteredData = data.filter(child => child.status === 'Active');
      setChildren(filteredData);
      setChildrenFetched(true);
      setChildrenLastFetched(Date.now());
      console.log("👶 Prefetched children data");
    } catch (err) {
      console.error('Error prefetching children data:', err);
    } finally {
      setChildrenLoading(false);
    }
  };

  useEffect(() => {
    if (showRegisterModal) {
      const shouldRefresh = !childrenFetched || (Date.now() - childrenLastFetched > 5 * 60 * 1000);
      
      if (currentUser?.id && shouldRefresh) {
        prefetchChildrenData();
      } else {
        setSelectedChildIds([]);
      }
    }
  }, [showRegisterModal, currentUser, childrenFetched, childrenLastFetched]);

  // Dùng useMemo để tính toán danh sách hiển thị theo trang
  const paginatedChildren = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return children.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [children, currentPage]);
  
  const totalPages = Math.ceil(children.length / ITEMS_PER_PAGE);
  
  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Tối ưu học tối ưu việc re-render khi chọn child
  const handleChildSelection = useCallback((childId) => {
    setSelectedChildIds(prevSelected => {
      if (prevSelected.includes(childId)) {
        return prevSelected.filter(id => id !== childId);
      } else {
        return [...prevSelected, childId];
      }
    });
  }, []);

  // Hàm chọn tất cả con
  const handleSelectAllChildren = () => {
    if (selectedChildIds.length === children.length) {
      // Nếu đã chọn tất cả thì bỏ chọn hết
      setSelectedChildIds([]);
    } else {
      // Ngược lại thì chọn tất cả
      setSelectedChildIds(children.map(child => child.id));
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowRegisterModal(false);
      }
    };

    if (showRegisterModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegisterModal]);

  // Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Disable animation during scroll
  useEffect(() => {
    const modalBody = document.querySelector('.enrichment-program-modal-body');
    
    if (!modalBody) return;
    
    let scrollTimer;
    const handleModalScroll = () => {
      if (!modalBody.classList.contains('scrolling')) {
        modalBody.classList.add('scrolling');
      }
      
      clearTimeout(scrollTimer);
      
      scrollTimer = setTimeout(() => {
        modalBody.classList.remove('scrolling');
      }, 150);
    };
    
    modalBody?.addEventListener('scroll', handleModalScroll);
    
    return () => {
      modalBody?.removeEventListener('scroll', handleModalScroll);
    };
  }, [showRegisterModal]);

  // Thêm useEffect này để xử lý scrollbar bên ngoài
  useEffect(() => {
    if (showRegisterModal) {
      // Lưu vị trí scroll hiện tại
      const scrollY = window.scrollY;
      
      // Thêm style để ngăn scroll và giữ vị trí trang
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Lấy vị trí scroll đã lưu
      const scrollY = document.body.style.top;
      
      // Xóa các style đã thêm
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Khôi phục vị trí scroll
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    return () => {
      // Đảm bảo loại bỏ các style khi component unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [showRegisterModal]);

  const handleRegister = (program) => {
    if (!currentUser) {
      toast.info('Vui lòng đăng nhập để đăng ký chương trình học');
      return;
    }
    
    setSelectedProgram(program);
    setShowRegisterModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (selectedChildIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một con để đăng ký');
      return;
    }

    try {
      setRegisterLoading(true);
      const response = await registerForProgram(selectedProgram.id, selectedChildIds);
      
      // Sử dụng thông báo trả về từ API
      const successMessage = response?.message || 'Đăng ký thành công!';
      toast.success(successMessage);
      
      setShowRegisterModal(false);
      setSelectedProgram(null);
      setSelectedChildIds([]);
    } catch (err) {
      console.error('Error registering for program:', err);
      
      // Hiển thị thông báo lỗi cụ thể nếu có
      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err.response.data?.message || err.response.data;
        
        if (typeof errorMessage === 'string') {
          toast.error(`Đăng ký không thành công: ${errorMessage}`);
        } else if (statusCode === 400) {
          toast.error('Dữ liệu đăng ký không hợp lệ. Vui lòng kiểm tra lại.');
        } else if (statusCode === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else if (statusCode === 403) {
          toast.error('Bạn không có quyền đăng ký chương trình này.');
        } else if (statusCode === 404) {
          toast.error('Không tìm thấy chương trình học hoặc thông tin học sinh. Vui lòng thử lại.');
        } else if (statusCode === 409) {
          toast.error('Học sinh đã được đăng ký vào lớp này trước đó.');
        } else {
          toast.error('Đăng ký không thành công. Vui lòng thử lại sau.');
        }
      } else if (err.request) {
        toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getProgramTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'piano':
        return 'music';
      case 'boi':
      case 'swimming':
        return 'swimmer';
      case 'art':
        return 'paint-brush';
      case 'dance':
        return 'music';
      case 'music':
        return 'music';
      case 'sports':
        return 'futbol';
      case 'language':
        return 'language';
      case 'science':
        return 'flask';
      case 'math':
        return 'calculator';
      default:
        return 'star';
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (err) {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Search functionality
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Sort functionality
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Filter, search and sort programs
  let processedPrograms = [...programs];

  // Apply search filter
  if (searchTerm.trim()) {
    processedPrograms = processedPrograms.filter(program =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply type filter
  if (filter !== 'all') {
    processedPrograms = processedPrograms.filter(program =>
      program.type?.toLowerCase() === filter.toLowerCase()
    );
  }

  // Apply sorting
  switch (sortBy) {
    case 'priceAsc':
      processedPrograms.sort((a, b) => a.fee - b.fee);
      break;
    case 'priceDesc':
      processedPrograms.sort((a, b) => b.fee - a.fee);
      break;
    case 'dateAsc':
      processedPrograms.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      break;
    case 'dateDesc':
      processedPrograms.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      break;
    default:
      // Default sorting (could be by ID or name)
      break;
  }

  const programTypes = [...new Set(programs.map(program => program.type))];

  // Tối ưu render với memo và thêm hiệu ứng ripple
  const ChildItem = React.memo(({ child, isSelected, onSelect }) => (
    <div 
      className={`enrichment-child-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(child.id)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(child.id);
        }}
        className="enrichment-child-checkbox"
        aria-label={`Chọn ${child.name}`}
      />
      <div className="enrichment-child-avatar-container">
        <img 
          src={child.avatar || "https://via.placeholder.com/150"}
          alt={child.name}
          className="enrichment-child-avatar"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=Avatar";
          }}
        />
      </div>
      <div className="enrichment-child-name">{child.name}</div>
      <div className="enrichment-child-age">{child.age} tuổi</div>
    </div>
  ));

  const handleRefreshChildren = () => {
    if (currentUser?.id) {
      prefetchChildrenData();
    }
  };

  const renderRegistrationStatus = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="enrichment-registration-status active">
            <FontAwesomeIcon icon="check-circle" /> Đang học
          </span>
        );
      case 'Pending':
        return (
          <span className="enrichment-registration-status pending">
            <FontAwesomeIcon icon="clock" /> Chờ xử lý
          </span>
        );
      default:
        return (
          <span className="enrichment-registration-status">
            <FontAwesomeIcon icon="info-circle" /> {status}
          </span>
        );
    }
  };

  // Tab navigation
  const renderTabNavigation = () => (
    <div className="enrichment-tabs-navigation">
      <button 
        className="enrichment-tab-button active"
        onClick={() => {}} // Already on this page
      >
        <FontAwesomeIcon icon="th-large" />
        Chương Trình Học
      </button>
      <a 
        href="/enrichment-history" 
        className="enrichment-tab-button"
      >
        <FontAwesomeIcon icon="history" />
        Lịch Sử Đăng Ký
      </a>
    </div>
  );

  // Render history tab content
  const renderHistoryContent = () => {
    if (loadingHistory) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      );
    }
    
    if (historyError) {
      return (
        <div className="error-container">
          <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
          <p className="error-message">{historyError}</p>
          <button className="retry-btn" onClick={fetchRegistrationHistory}>
            <FontAwesomeIcon icon="sync" />
            Thử lại
          </button>
        </div>
      );
    }
    
    if (registrations.length === 0) {
      return (
        <div className="empty-container">
          <div className="empty-icon">
            <FontAwesomeIcon icon="book" size="3x" />
          </div>
          <h3 className="empty-message">Chưa có đăng ký khóa học nào</h3>
          <button
            className="retry-btn"
            onClick={() => setActiveTab('programs')}
          >
            <FontAwesomeIcon icon="plus-circle" />
            Đăng ký khóa học mới
          </button>
        </div>
      );
    }
    
    return (
      <div className="enrichment-history-list">
        {registrations.map((registration) => (
          <div key={registration.id} className="enrichment-history-card">
            <div className="enrichment-history-card-header">
              <div className="enrichment-child-info">
                <div className="enrichment-child-avatar-container">
                  <img 
                    src={registration.childrenResponse.avatar || "https://via.placeholder.com/80?text=Avatar"} 
                    alt={registration.childrenResponse.name}
                    className="enrichment-child-avatar"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80?text=Avatar";
                    }}
                  />
                </div>
                <div className="enrichment-child-details">
                  <h3 className="enrichment-child-name">{registration.childrenResponse.name}</h3>
                  <p className="enrichment-child-age">{calculateAge(registration.childrenResponse.birthday)} tuổi</p>
                  <p className="enrichment-child-class">Lớp {registration.childrenResponse.gradeLevelName}</p>
                </div>
              </div>
              <div className="enrichment-registration-status-container">
                {renderRegistrationStatus(registration.status)}
              </div>
            </div>
            
            <div className="enrichment-history-card-body">
              <div className="enrichment-program-details">
                <h4 className="enrichment-program-name">
                  <FontAwesomeIcon icon="star" className="enrichment-program-icon" />
                  {registration.classResponse.epName}
                </h4>
                <div className="enrichment-program-info-grid">
                  <div className="enrichment-info-item">
                    <span className="enrichment-info-label">
                      <FontAwesomeIcon icon="users" /> Lớp:
                    </span>
                    <span className="enrichment-info-value">{registration.classResponse.name}</span>
                  </div>
                  <div className="enrichment-info-item">
                    <span className="enrichment-info-label">
                      <FontAwesomeIcon icon="calendar-alt" /> Năm học:
                    </span>
                    <span className="enrichment-info-value">{registration.classResponse.academicYear}</span>
                  </div>
                  <div className="enrichment-info-item">
                    <span className="enrichment-info-label">
                      <FontAwesomeIcon icon="clock" /> Lịch học:
                    </span>
                    <span className="enrichment-info-value">
                      {registration.classResponse.timetable ? 
                        `Thứ ${registration.classResponse.timetable}` : 
                        'Chưa có lịch'}
                    </span>
                  </div>
                  <div className="enrichment-info-item">
                    <span className="enrichment-info-label">
                      <FontAwesomeIcon icon="check-circle" /> Trạng thái lớp:
                    </span>
                    <span className={`enrichment-info-value status-${registration.classResponse.status?.toLowerCase()}`}>
                      {registration.classResponse.status === "Available" ? "Sẵn sàng" : 
                       registration.classResponse.status === "Unavailable" ? "Chưa mở" : 
                       registration.classResponse.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="enrichment-history-card-footer">
              {registration.classResponse.status === "Available" ? (
                <button 
                  className="enrichment-payment-button"
                  onClick={() => handlePayment(registration)}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="credit-card" />
                      Thanh toán ngay
                    </>
                  )}
                </button>
              ) : (
                <div className="enrichment-payment-notice">
                  <FontAwesomeIcon icon="info-circle" />
                  Đợi mở lớp để thanh toán
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="enrichment-program-container" ref={containerRef}>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Decorative elements */}
      <div className="decoration-star star1"></div>
      <div className="decoration-star star2"></div>
      <div className="decoration-cloud cloud1"></div>
      <div className="decoration-cloud cloud2"></div>

      <div className="enrichment-program-header">
        <h1 className="enrichment-program-title">Chương Trình Học Năng Khiếu</h1>
        <p className="enrichment-program-subtitle">
          Khám phá các khóa học nâng cao kỹ năng và phát triển tài năng cho trẻ
        </p>
      </div>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <div className="enrichment-content-layout">
        {/* Sidebar */}
        <div className="enrichment-sidebar">
          {/* Search section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Tìm kiếm</h3>
            <div className="enrichment-program-search-container">
              <input
                type="text"
                className="enrichment-program-search-input"
                placeholder="Tìm kiếm chương trình học..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FontAwesomeIcon icon="search" className="enrichment-program-search-icon" />
            </div>
          </div>

          {/* Filter section */}
          {!loading && !error && programs.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Phân loại</h3>
              <div className="enrichment-program-filters">
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <FontAwesomeIcon icon="th-large" />
                  <span>Tất cả</span>
                </button>

                {programTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-btn ${filter === type ? 'active' : ''}`}
                    onClick={() => setFilter(type)}
                  >
                    <FontAwesomeIcon icon={getProgramTypeIcon(type)} />
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort section */}
          {!loading && !error && programs.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Sắp xếp</h3>
              <div className="enrichment-program-sort-container">
                <select
                  className="enrichment-program-sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="dateAsc">Ngày tăng dần</option>
                  <option value="dateDesc">Ngày giảm dần</option>
                </select>
                <FontAwesomeIcon icon="sort" className="enrichment-program-sort-icon" />
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="enrichment-main-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
              <p className="error-message">{error}</p>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                <FontAwesomeIcon icon="sync" />
                Thử lại
              </button>
            </div>
          ) : programs.length === 0 ? (
            <div className="empty-search-state">
              <div className="empty-icon">
                <FontAwesomeIcon icon="search" size="3x" />
              </div>
              <h3>Không tìm thấy chương trình học năng khiếu</h3>
            </div>
          ) : processedPrograms.length === 0 ? (
            <div className="empty-search-state">
              <div className="empty-icon">
                <FontAwesomeIcon icon="search" size="3x" />
              </div>
              <h3>Không tìm thấy kết quả phù hợp</h3>
              <p>Vui lòng thử lại với từ khóa khác.</p>
            </div>
          ) : (
            <>
              <div className="results-count">
                Hiển thị <strong>{processedPrograms.length}</strong> trong số <strong>{programs.length}</strong> chương trình
              </div>
              <div className="program-grid">
                {processedPrograms.map((program) => (
                  <div key={program.id} className="program-card">
                    <div className="program-banner">
                      <FontAwesomeIcon
                        icon={getProgramTypeIcon(program.type)}
                        className="program-icon"
                      />
                      <span className={`program-type-badge ${program.type?.toLowerCase()}`}>
                        {program.type}
                      </span>
                    </div>

                    <div className="program-content">
                      <h3 className="program-name">{program.name}</h3>
                      <p className="program-description">{program.description || "Chưa có mô tả chi tiết."}</p>

                      <div className="program-details">
                        <div className="enrichment-program-detail-item">
                          <FontAwesomeIcon icon="calendar-alt" className="enrichment-program-detail-icon" />
                          <div className="enrichment-program-detail-content">
                            <span className="enrichment-program-detail-label">Thời gian</span>
                            <span className="enrichment-program-detail-value">
                              {formatDisplayDate(program.startDate)} - {formatDisplayDate(program.endDate)}
                            </span>
                          </div>
                        </div>

                        <div className="enrichment-program-detail-item">
                          <FontAwesomeIcon icon="users" className="enrichment-program-detail-icon" />
                          <div className="enrichment-program-detail-content">
                            <span className="enrichment-program-detail-label">Sĩ số tối đa</span>
                            <span className="enrichment-program-detail-value">{program.maxChildren} học sinh</span>
                          </div>
                        </div>

                        <div className="enrichment-program-detail-item">
                          <FontAwesomeIcon icon="money-bill-wave" className="enrichment-program-detail-icon" />
                          <div className="enrichment-program-detail-content">
                            <span className="enrichment-program-detail-label">Học phí</span>
                            <span className="enrichment-program-detail-value fee">{formatCurrency(program.fee)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="register-button"
                        onClick={() => handleRegister(program)}
                      >
                        <FontAwesomeIcon icon="plus-circle" />
                        Đăng ký tham gia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && selectedProgram && (
        <div className="enrichment-program-modal-overlay">
          <div className="enrichment-program-modal" ref={modalRef}>
            <div className="enrichment-program-modal-header">
              <h3>
                <FontAwesomeIcon icon="clipboard-list" />
                Đăng Ký Chương Trình Học
              </h3>
              <button 
                className="enrichment-program-modal-close-btn"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Đóng"
              >
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            
            <div className="enrichment-program-modal-body">
              {/* Program Info Section - Enhanced */}
              <div className="enrichment-program-info-section">
                <div className="enrichment-program-info-header">
                  <div className="enrichment-program-icon-wrapper">
                    <FontAwesomeIcon icon={getProgramTypeIcon(selectedProgram.type)} />
                  </div>
                  <div>
                    <h4 className="program-title">{selectedProgram.name}</h4>
                    <span className="program-type">{selectedProgram.type}</span>
                  </div>
                </div>
                
                <div className="enrichment-program-details-container">
                  <div className="enrichment-program-detail-item">
                    <FontAwesomeIcon icon="users" />
                    <div className="enrichment-detail-content">
                      <span className="detail-label">Sĩ số tối đa</span>
                      <span className="detail-value">{selectedProgram.maxChildren} học sinh</span>
                    </div>
                  </div>
                  
                  <div className="enrichment-program-detail-item">
                    <FontAwesomeIcon icon="child" />
                    <div className="enrichment-detail-content">
                      <span className="detail-label">Lứa tuổi phù hợp</span>
                      <span className="detail-value">3 - 6 tuổi</span>
                    </div>
                  </div>
                  
                  <div className="enrichment-program-detail-item">
                    <FontAwesomeIcon icon="calendar-alt" />
                    <div className="enrichment-detail-content">
                      <span className="detail-label">Thời gian</span>
                      <span className="detail-value">
                        {formatDisplayDate(selectedProgram.startDate)} - {formatDisplayDate(selectedProgram.endDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="enrichment-program-detail-item">
                    <FontAwesomeIcon icon="money-bill-wave" />
                    <div className="enrichment-detail-content">
                      <span className="detail-label">Học phí</span>
                      <span className="detail-value fee">{formatCurrency(selectedProgram.fee)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <hr className="enrichment-section-divider" />
              
              {/* Children Selection Section với Header có nút refresh */}
              <div className="enrichment-children-selection-section">
                <div className="enrichment-section-header">
                  <h4 className="enrichment-section-title">
                    <FontAwesomeIcon icon="child" />
                    Chọn con để đăng ký
                  </h4>
                  
                  <button 
                    className="enrichment-refresh-btn"
                    onClick={handleRefreshChildren}
                    disabled={childrenLoading}
                    title="Cập nhật danh sách"
                  >
                    <FontAwesomeIcon icon="sync" spin={childrenLoading} />
                  </button>
                </div>
                
                {childrenLoading ? (
                  <div className="enrichment-children-loading">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Đang tải...</span>
                    </div>
                  </div>
                ) : children.length > 0 ? (
                  <>
                    <div className="enrichment-select-all-wrapper">
                      <label className="enrichment-select-all-option">
                        <input 
                          type="checkbox"
                          checked={selectedChildIds.length === children.length && children.length > 0}
                          onChange={handleSelectAllChildren}
                        />
                        <span>Chọn tất cả ({children.length})</span>
                      </label>
                    </div>
                    
                    <div className="enrichment-children-grid">
                      {paginatedChildren.map(child => (
                        <ChildItem
                          key={child.id}
                          child={{
                            ...child,
                            age: calculateAge(child.birthday)
                          }}
                          isSelected={selectedChildIds.includes(child.id)}
                          onSelect={handleChildSelection}
                        />
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="enrichment-pagination">
                        <button 
                          className="enrichment-pagination-btn" 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          aria-label="Trang trước"
                        >
                          <FontAwesomeIcon icon="chevron-left" />
                        </button>
                        
                        <span className="enrichment-pagination-info">
                          {currentPage}/{totalPages}
                        </span>
                        
                        <button 
                          className="enrichment-pagination-btn"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          aria-label="Trang sau"
                        >
                          <FontAwesomeIcon icon="chevron-right" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="enrichment-no-children-message">
                    <p>Con của bạn chưa đăng ký nhập học hoặc đã có lớp học năng khiếu.</p>
                  </div>
                )}
              </div>

              {/* Fee Summary if children selected */}
              {selectedChildIds.length > 0 && (
                <div className="enrichment-fee-summary">
                  <span className="enrichment-fee-label">Tổng học phí:</span>
                  <span className="enrichment-fee-total">
                    <FontAwesomeIcon icon="receipt" />
                    {selectedChildIds.length > 1 
                      ? formatCurrency(selectedProgram.fee * selectedChildIds.length)
                      : formatCurrency(selectedProgram.fee)
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div className="enrichment-program-modal-footer">
              <button 
                className="enrichment-program-cancel-btn"
                onClick={() => setShowRegisterModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                className="enrichment-program-confirm-btn"
                onClick={handleConfirmRegistration}
                disabled={registerLoading || selectedChildIds.length === 0}
              >
                {registerLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="check-circle" />
                    Xác nhận đăng ký
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program benefits section - only show on programs tab */}
      {activeTab === 'programs' && (
        <div className="program-benefits">
          <h2 className="benefits-title">Lợi ích của chương trình học năng khiếu</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <FontAwesomeIcon icon="brain" />
              </div>
              <h3>Phát triển tư duy</h3>
              <p>Kích thích sự phát triển não bộ và khả năng tư duy logic của trẻ.</p>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <FontAwesomeIcon icon="hands-helping" />
              </div>
              <h3>Kỹ năng xã hội</h3>
              <p>Tăng cường khả năng giao tiếp và làm việc nhóm hiệu quả.</p>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <FontAwesomeIcon icon="lightbulb" />
              </div>
              <h3>Sáng tạo</h3>
              <p>Khơi dậy tiềm năng sáng tạo và tư duy đổi mới ở trẻ.</p>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <FontAwesomeIcon icon="award" />
              </div>
              <h3>Phát triển tài năng</h3>
              <p>Phát hiện và phát triển tài năng tiềm ẩn của trẻ từ sớm.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrichmentProgram;
