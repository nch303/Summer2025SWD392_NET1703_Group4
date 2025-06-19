import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAllEnrichmentPrograms } from './EnrichmentProgramService';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatDate';
import './EnrichmentProgram.css';

const EnrichmentProgram = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { currentUser } = useUser();

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await getAllEnrichmentPrograms();
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

  const handleRegister = (programId) => {
    // In a real application, you would implement the registration logic here
    toast.info(`Chức năng đăng ký sẽ được triển khai sớm! Mã chương trình: ${programId}`);
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

  return (
    <div className="enrichment-program-container" ref={containerRef}>
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

      <div className="enrichment-content-layout">
        {/* Sidebar */}
        <div className="enrichment-sidebar">
          {/* Search section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Tìm kiếm</h3>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm chương trình học..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <FontAwesomeIcon icon="search" className="search-icon" />
            </div>
          </div>

          {/* Filter section */}
          {!loading && !error && programs.length > 0 && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">Phân loại</h3>
              <div className="program-filters">
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
              <div className="sort-container">
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="default">Sắp xếp mặc định</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="dateAsc">Ngày tăng dần</option>
                  <option value="dateDesc">Ngày giảm dần</option>
                </select>
                <FontAwesomeIcon icon="sort" className="sort-icon" />
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
                        <div className="detail-item">
                          <FontAwesomeIcon icon="calendar-alt" className="detail-icon" />
                          <div className="detail-content">
                            <span className="detail-label">Thời gian</span>
                            <span className="detail-value">
                              {formatDisplayDate(program.startDate)} - {formatDisplayDate(program.endDate)}
                            </span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <FontAwesomeIcon icon="users" className="detail-icon" />
                          <div className="detail-content">
                            <span className="detail-label">Sĩ số tối đa</span>
                            <span className="detail-value">{program.maxChildren} học sinh</span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <FontAwesomeIcon icon="money-bill-wave" className="detail-icon" />
                          <div className="detail-content">
                            <span className="detail-label">Học phí</span>
                            <span className="detail-value fee">{formatCurrency(program.fee)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="register-button"
                        onClick={() => handleRegister(program.id)}
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
    </div>
  );
};

export default EnrichmentProgram;
