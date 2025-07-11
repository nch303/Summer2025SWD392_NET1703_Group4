import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAllEnrichmentProgramsForParent, registerForProgram, 
  getChildrenByParentId, getEnrichmentClassRegistrations, 
  createPaymentUrl } from '../../services/EnrichmentProgramService';
import { useUser } from '../../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import { formatDate } from '../../utils/formatDate';
import styles from './EnrichmentProgram.module.css';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

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
        setError('Cannot load enrichment program data. Please try again later.');
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
      setHistoryError('Cannot load registration data. Please try again later.');
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
        toast.error('Cannot create payment link. Please try again later.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An error occurred while processing payment. Please try again later.');
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
      toast.info('Please login to register for enrichment programs');
      return;
    }
    
    setSelectedProgram(program);
    setShowRegisterModal(true);
  };

  const handleConfirmRegistration = async () => {
    if (selectedChildIds.length === 0) {
      toast.error('Please select at least one child to register');
      return;
    }

    try {
      setRegisterLoading(true);
      const response = await registerForProgram(selectedProgram.id, selectedChildIds);
      
      // Sử dụng thông báo trả về từ API
      const successMessage = response?.message || 'Registration successful!';
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
          toast.error(`Registration failed: ${errorMessage}`);
        } else if (statusCode === 400) {
          toast.error('Invalid registration data. Please check again.');
        } else if (statusCode === 401) {
          toast.error('Session expired. Please login again.');
        } else if (statusCode === 403) {
          toast.error('You do not have permission to register for this program.');
        } else if (statusCode === 404) {
          toast.error('Enrichment program or student information not found. Please try again.');
        } else if (statusCode === 409) {
          toast.error('Student has already been registered for this class.');
        } else {
          toast.error('Registration failed. Please try again later.');
        }
      } else if (err.request) {
        toast.error('Cannot connect to server. Please check your network connection.');
      } else {
        toast.error('An error occurred. Please try again later.');
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
    if (!dateString) return 'Not specified';
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
      className={`${styles.enrichmentChildCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(child.id)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(child.id);
        }}
        className={styles.enrichmentChildCheckbox}
        aria-label={`Chọn ${child.name}`}
      />
      <div className={styles.enrichmentChildAvatarContainer}>
        <img 
          src={child.avatar || "https://via.placeholder.com/150"}
          alt={child.name}
          className={styles.enrichmentChildAvatar}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150?text=Avatar";
          }}
        />
      </div>
      <div className={styles.enrichmentChildName}>{child.name}</div>
      <div className={styles.enrichmentChildAge}>{child.age} age</div>
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
          <span className={styles.enrichmentRegistrationStatusActive}>
            <FontAwesomeIcon icon="check-circle" /> Studying
          </span>
        );
      case 'Pending':
        return (
          <span className={`${styles.enrichmentRegistrationStatus} ${styles.pending}`}>
            <FontAwesomeIcon icon="clock" /> Pending
          </span>
        );
      default:
        return (
          <span className={styles.enrichmentRegistrationStatus}>
            <FontAwesomeIcon icon="info-circle" /> {status}
          </span>
        );
    }
  };

  // Tab navigation
  const renderTabNavigation = () => (
    <div className={styles.enrichmentTabsNavigation}>
      <Link 
        to="/enrichment-program" 
        className={`${styles.enrichmentTabButton} ${styles.active}`}
      >
        <FontAwesomeIcon icon="th-large" />
        Enrichment Program
      </Link>
      <Link 
        to="/enrichment-history" 
        className={styles.enrichmentTabButton}
      >
        <FontAwesomeIcon icon="history" />
        Registration History
      </Link>
    </div>
  );

  // Render history tab content
  const renderHistoryContent = () => {
    if (loadingHistory) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading data...</p>
        </div>
      );
    }
    
    if (historyError) {
      return (
        <div className={styles.errorContainer}>
          <FontAwesomeIcon icon="exclamation-circle" className={styles.errorIcon} />
          <p className={styles.errorMessage}>{historyError}</p>
          <button className={styles.retryBtn} onClick={fetchRegistrationHistory}>
            <FontAwesomeIcon icon="sync" />
            Try again
          </button>
        </div>
      );
    }
    
    if (registrations.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon="book" size="3x" />
          </div>
          <h3 className="empty-message">No registration history</h3>
          <button
            className={styles.retryBtn}
            onClick={() => setActiveTab('programs')}
          >
            <FontAwesomeIcon icon="plus-circle" />
            Register new class
          </button>
        </div>
      );
    }
    
    return (
      <div className={styles.enrichmentHistoryList}>
        {registrations.map((registration) => (
          <div key={registration.id} className={styles.enrichmentHistoryCard}>
            <div className={styles.enrichmentHistoryCardHeader}>
              <div className={styles.enrichmentChildInfo}>
                <div className={styles.enrichmentChildAvatarContainer}>
                  <img 
                    src={registration.childrenResponse.avatar || "https://via.placeholder.com/80?text=Avatar"} 
                    alt={registration.childrenResponse.name}
                    className={styles.enrichmentChildAvatar}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80?text=Avatar";
                    }}
                  />
                </div>
                <div className={styles.enrichmentChildDetails}>
                  <h3 className={styles.enrichmentChildName}>{registration.childrenResponse.name}</h3>
                  <p className={styles.enrichmentChildAge}>{calculateAge(registration.childrenResponse.birthday)} years old</p>
                  <p className={styles.enrichmentChildClass}>Class {registration.childrenResponse.gradeLevelName}</p>
                </div>
              </div>
              <div className={styles.enrichmentRegistrationStatusContainer}>
                {renderRegistrationStatus(registration.status)}
              </div>
            </div>
            
            <div className={styles.enrichmentHistoryCardBody}>
              <div className={styles.enrichmentProgramDetails}>
                <h4 className={styles.enrichmentProgramName}>
                  <FontAwesomeIcon icon="star" className={styles.enrichmentProgramIcon} />
                  {registration.classResponse.epName}
                </h4>
                <div className={styles.enrichmentProgramInfoGrid}>
                  <div className={styles.enrichmentInfoItem}>
                    <span className={styles.enrichmentInfoLabel}>
                      <FontAwesomeIcon icon="users" /> Class:
                    </span>
                    <span className={styles.enrichmentInfoValue}>{registration.classResponse.name}</span>
                  </div>
                  <div className={styles.enrichmentInfoItem}>
                    <span className={styles.enrichmentInfoLabel}>
                      <FontAwesomeIcon icon="calendar-alt" /> Academic year:
                    </span>
                    <span className={styles.enrichmentInfoValue}>{registration.classResponse.academicYear}</span>
                  </div>
                  <div className={styles.enrichmentInfoItem}>
                    <span className={styles.enrichmentInfoLabel}>
                      <FontAwesomeIcon icon="clock" /> Schedule:
                    </span>
                    <span className={styles.enrichmentInfoValue}>
                      {registration.classResponse.timetable ? 
                        `Week ${registration.classResponse.timetable}` : 
                        'No schedule'}
                    </span>
                  </div>
                  <div className={styles.enrichmentInfoItem}>
                    <span className={styles.enrichmentInfoLabel}>
                      <FontAwesomeIcon icon="check-circle" /> Class status:
                    </span>
                    <span className={`${styles.enrichmentInfoValue} ${styles[`status${registration.classResponse.status}`]}`}>
                      {registration.classResponse.status === "Available" ? "Ready" : 
                       registration.classResponse.status === "Unavailable" ? "Not ready" : 
                       registration.classResponse.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.enrichmentHistoryCardFooter}>
              {registration.classResponse.status === "Available" ? (
                <button 
                  className={styles.enrichmentPaymentButton}
                  onClick={() => handlePayment(registration)}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <>
                      <FontAwesomeIcon icon="spinner" spin />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon="credit-card" />
                      Process payment
                    </>
                  )}
                </button>
              ) : (
                <div className={styles.enrichmentPaymentNotice}>
                  <FontAwesomeIcon icon="info-circle" />
                  Wait for class to be opened to process payment
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'available': return styles.statusAvailable;
      case 'unavailable': return styles.statusUnavailable;
      default: return '';
    }
  };

  return (
    <div className={styles.enrichmentProgramContainer} ref={containerRef}>
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
      <div className={`${styles.decorationStar} ${styles.star1}`}></div>
      <div className={`${styles.decorationStar} ${styles.star2}`}></div>
      <div className={`${styles.decorationCloud} ${styles.cloud1}`}></div>
      <div className={`${styles.decorationCloud} ${styles.cloud2}`}></div>

      <div className={styles.enrichmentProgramHeader}>
        <h1 className={styles.enrichmentProgramTitle}>Enrichment Program</h1>
        <p className={styles.enrichmentProgramSubtitle}>
          Discover courses that enhance skills and develop talents for children
        </p>
      </div>

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <div className={styles.enrichmentContentLayout}>
        {/* Sidebar */}
        <div className={styles.enrichmentSidebar}>
          {/* Search section */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Search</h3>
            <div className={styles.enrichmentProgramSearchContainer}>
              <input
                type="text"
                className={styles.enrichmentProgramSearchInput}
                placeholder="Search programs..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FontAwesomeIcon icon="search" className={styles.enrichmentProgramSearchIcon} />
            </div>
          </div>

          {/* Filter section */}
          {!loading && !error && programs.length > 0 && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Classification</h3>
              <div className={styles.enrichmentProgramFilters}>
                <button
                  className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                  onClick={() => setFilter('all')}
                >
                  <FontAwesomeIcon icon="th-large" />
                  <span>All</span>
                </button>

                {programTypes.map(type => (
                  <button
                    key={type}
                    className={`${styles.filterBtn} ${filter === type ? styles.active : ''}`}
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
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Sort</h3>
              <div className={styles.enrichmentProgramSortContainer}>
                <select
                  className={styles.enrichmentProgramSortSelect}
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="default">Default sorting</option>
                  <option value="priceAsc">Price ascending</option>
                  <option value="priceDesc">Price descending</option>
                  <option value="dateAsc">Date ascending</option>
                  <option value="dateDesc">Date descending</option>
                </select>
                <FontAwesomeIcon icon="sort" className={styles.enrichmentProgramSortIcon} />
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className={styles.enrichmentMainContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading data...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FontAwesomeIcon icon="exclamation-circle" className={styles.errorIcon} />
              <p className={styles.errorMessage}>{error}</p>
              <button
                className={styles.retryBtn}
                onClick={() => window.location.reload()}
              >
                <FontAwesomeIcon icon="sync" />
                Try again
              </button>
            </div>
          ) : programs.length === 0 ? (
            <div className={styles.emptySearchState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon="search" size="3x" />
              </div>
              <h3>No enrichment programs found</h3>
            </div>
          ) : processedPrograms.length === 0 ? (
            <div className={styles.emptySearchState}>
              <div className={styles.emptyIcon}>
                <FontAwesomeIcon icon="search" size="3x" />
              </div>
              <h3>No matching results found</h3>
              <p>Please try again with different keywords.</p>
            </div>
          ) : (
            <>
              <div className={styles.resultsCount}>
                Displaying <strong>{processedPrograms.length}</strong> out of <strong>{programs.length}</strong> programs
              </div>
              <div className={styles.programGrid}>
                {processedPrograms.map((program) => (
                  <div key={program.id} className={styles.programCard}>
                    <div className={styles.programBanner}>
                      <FontAwesomeIcon
                        icon={getProgramTypeIcon(program.type)}
                        className={styles.programIcon}
                      />
                      <span className={`${styles.programTypeBadge} ${program.type?.toLowerCase()}`}>
                        {program.type}
                      </span>
                    </div>

                    <div className={styles.programContent}>
                      <h3 className={styles.programName}>{program.name}</h3>
                      <p className={styles.programDescription}>{program.description || "No detailed description."}</p>

                      <div className={styles.programDetails}>
                        <div className={styles.enrichmentProgramDetailItem}>
                          <FontAwesomeIcon icon="calendar-alt" className={styles.enrichmentProgramDetailIcon} />
                          <div className={styles.enrichmentProgramDetailContent}>
                            <span className={styles.enrichmentProgramDetailLabel}>Time</span>
                            <span className={styles.enrichmentProgramDetailValue}>
                              {formatDisplayDate(program.startDate)} - {formatDisplayDate(program.endDate)}
                            </span>
                          </div>
                        </div>

                        <div className={styles.enrichmentProgramDetailItem}>
                          <FontAwesomeIcon icon="users" className={styles.enrichmentProgramDetailIcon} />
                          <div className={styles.enrichmentProgramDetailContent}>
                            <span className={styles.enrichmentProgramDetailLabel}>Maximum number of students</span>
                            <span className={styles.enrichmentProgramDetailValue}>{program.maxChildren} students</span>
                          </div>
                        </div>

                        <div className={styles.enrichmentProgramDetailItem}>
                          <FontAwesomeIcon icon="money-bill-wave" className={styles.enrichmentProgramDetailIcon} />
                          <div className={styles.enrichmentProgramDetailContent}>
                            <span className={styles.enrichmentProgramDetailLabel}>Tuition fee</span>
                            <span className={`${styles.enrichmentProgramDetailValue} ${styles.fee}`}>{formatCurrency(program.fee)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className={styles.registerButton}
                        onClick={() => handleRegister(program)}
                      >
                        <FontAwesomeIcon icon="plus-circle" />
                        Register
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
        <div className={styles.enrichmentProgramModalOverlay}>
          <div className={styles.enrichmentProgramModal} ref={modalRef}>
            <div className={styles.enrichmentProgramModalHeader}>
              <h3>
                <FontAwesomeIcon icon="clipboard-list" />
                Register Enrichment Program
              </h3>
              <button 
                className={styles.enrichmentProgramModalCloseBtn}
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close"
              >
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            
            <div className={styles.enrichmentProgramModalBody}>
              {/* Program Info Section - Enhanced */}
              <div className={styles.enrichmentProgramInfoSection}>
                <div className={styles.enrichmentProgramInfoHeader}>
                  <div className={styles.enrichmentProgramIconWrapper}>
                    <FontAwesomeIcon icon={getProgramTypeIcon(selectedProgram.type)} />
                  </div>
                  <div>
                    <h4 className={styles.programTitle}>{selectedProgram.name}</h4>
                    <span className={styles.programType}>{selectedProgram.type}</span>
                  </div>
                </div>
                
                <div className={styles.enrichmentProgramDetailsContainer}>
                  <div className={styles.enrichmentProgramDetailItem}>
                    <FontAwesomeIcon icon="users" />
                    <div className={styles.enrichmentDetailContent}>
                      <span className={styles.detailLabel}>Maximum number of students</span>
                      <span className={styles.detailValue}>{selectedProgram.maxChildren} students</span>
                    </div>
                  </div>
                  
                  <div className={styles.enrichmentProgramDetailItem}>
                    <FontAwesomeIcon icon="child" />
                    <div className={styles.enrichmentDetailContent}>
                      <span className={styles.detailLabel}>Age range</span>
                      <span className={styles.detailValue}>3 - 6 years old</span>
                    </div>
                  </div>
                  
                  <div className={styles.enrichmentProgramDetailItem}>
                    <FontAwesomeIcon icon="calendar-alt" />
                    <div className={styles.enrichmentDetailContent}>
                      <span className={styles.detailLabel}>Time</span>
                      <span className={styles.detailValue}>
                        {formatDisplayDate(selectedProgram.startDate)} - {formatDisplayDate(selectedProgram.endDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.enrichmentProgramDetailItem}>
                    <FontAwesomeIcon icon="money-bill-wave" />
                    <div className={styles.enrichmentDetailContent}>
                      <span className={styles.detailLabel}>Tuition fee</span>
                      <span className={`${styles.detailValue} ${styles.fee}`}>{formatCurrency(selectedProgram.fee)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <hr className={styles.enrichmentSectionDivider} />
              
              {/* Children Selection Section với Header có nút refresh */}
              <div className={styles.enrichmentChildrenSelectionSection}>
                <div className={styles.enrichmentSectionHeader}>
                  <h4 className={styles.enrichmentSectionTitle}>
                    <FontAwesomeIcon icon="child" />
                    Select child to register
                  </h4>
                  
                  <button 
                    className={styles.enrichmentRefreshBtn}
                    onClick={handleRefreshChildren}
                    disabled={childrenLoading}
                    title="Update list"
                  >
                    <FontAwesomeIcon icon="sync" spin={childrenLoading} />
                  </button>
                </div>
                
                {childrenLoading ? (
                  <div className={styles.enrichmentChildrenLoading}>
                    <div className={styles.spinnerBorder} role="status">
                      <span className={styles.srOnly}>Loading...</span>
                    </div>
                  </div>
                ) : children.length > 0 ? (
                  <>
                    <div className={styles.enrichmentSelectAllWrapper}>
                      <label className={styles.enrichmentSelectAllOption}>
                        <input 
                          type="checkbox"
                          checked={selectedChildIds.length === children.length && children.length > 0}
                          onChange={handleSelectAllChildren}
                        />
                        <span>Select all ({children.length})</span>
                      </label>
                    </div>
                    
                    <div className={styles.enrichmentChildrenGrid}>
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
                      <div className={styles.enrichmentPagination}>
                        <button 
                          className={styles.enrichmentPaginationBtn} 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          aria-label="Previous page"
                        >
                          <FontAwesomeIcon icon="chevron-left" />
                        </button>
                        
                        <span className={styles.enrichmentPaginationInfo}>
                          {currentPage}/{totalPages}
                        </span>
                        
                        <button 
                          className={styles.enrichmentPaginationBtn}
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          aria-label="Next page"
                        >
                          <FontAwesomeIcon icon="chevron-right" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.enrichmentNoChildrenMessage}>
                    <p>Your child has not registered for enrichment classes or already has an enrichment class.</p>
                  </div>
                )}
              </div>

              {/* Fee Summary if children selected */}
              {selectedChildIds.length > 0 && (
                <div className={styles.enrichmentFeeSummary}>
                  <span className={styles.enrichmentFeeLabel}>Total tuition fee:</span>
                  <span className={styles.enrichmentFeeTotal}>
                    <FontAwesomeIcon icon="receipt" />
                    {selectedChildIds.length > 1 
                      ? formatCurrency(selectedProgram.fee * selectedChildIds.length)
                      : formatCurrency(selectedProgram.fee)
                    }
                  </span>
                </div>
              )}
            </div>
            
            <div className={styles.enrichmentProgramModalFooter}>
              <button 
                className={styles.enrichmentProgramCancelBtn}
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.enrichmentProgramConfirmBtn}
                onClick={handleConfirmRegistration}
                disabled={registerLoading || selectedChildIds.length === 0}
              >
                {registerLoading ? (
                  <>
                    <span className={`${styles.spinnerBorder} ${styles.spinnerBorderSm}`} role="status" aria-hidden="true"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon="check-circle" />
                    Confirm registration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program benefits section - only show on programs tab */}
      {activeTab === 'programs' && (
        <div className={styles.programBenefits}>
          <h2 className={styles.benefitsTitle}>Benefits of enrichment programs</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <FontAwesomeIcon icon="brain" />
              </div>
              <h3>Developing thinking</h3>
              <p>Stimulate brain development and logical thinking in children.</p>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <FontAwesomeIcon icon="hands-helping" />
              </div>
              <h3>Social skills</h3>
              <p>Enhance communication and teamwork skills.</p>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <FontAwesomeIcon icon="lightbulb" />
              </div>
              <h3>Creativity</h3>
              <p>Foster creativity and innovative thinking in children.</p>
            </div>

            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}>
                <FontAwesomeIcon icon="award" />
              </div>
              <h3>Developing talents</h3>
              <p>Discover and develop hidden talents in children from an early age.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrichmentProgram;
