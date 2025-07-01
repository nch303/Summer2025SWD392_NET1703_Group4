import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  getEnrichmentClassRegistrations, 
  createPaymentUrl,
  getEnrichmentInvoiceDetails
} from './EnrichmentProgramService';
import { useUser } from '../../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import './EnrichmentProgram.css';
import 'react-toastify/dist/ReactToastify.css';

const EnrichmentHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const { currentUser } = useUser();

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        const data = await getEnrichmentClassRegistrations(currentUser.id);
        setRegistrations(data || []);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu đăng ký lớp học. Vui lòng thử lại sau.');
        console.error('Error fetching registrations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [currentUser]);

  useEffect(() => {
    const fetchPaymentStatuses = async () => {
      if (registrations.length === 0) return;

      const statuses = {};
      
      for (const reg of registrations) {
        if (reg.childrenResponse && reg.enrichmentProgramResponse) {
          try {
            const invoices = await getEnrichmentInvoiceDetails(
              reg.childrenResponse.id, 
              reg.enrichmentProgramResponse.id
            );
            
            const hasSuccessfulPayment = invoices.some(invoice => invoice.status === 'Success');
            statuses[`${reg.childrenResponse.id}-${reg.enrichmentProgramResponse.id}`] = {
              paid: hasSuccessfulPayment,
              invoices
            };
          } catch (err) {
            console.error('Error fetching payment status:', err);
            statuses[`${reg.childrenResponse.id}-${reg.enrichmentProgramResponse.id}`] = {
              paid: false,
              invoices: []
            };
          }
        }
      }
      
      setPaymentStatuses(statuses);
    };

    fetchPaymentStatuses();
  }, [registrations]);

  const handlePayment = async (registration) => {
    if (processingPayment) return;
    
    try {
      setProcessingPayment(true);
      
      const paymentData = {
        orderType: "Enrichment Program Payment",
        amount: registration.enrichmentProgramResponse?.fee || 0,
        orderDescription: `Thanh toán lớp ${registration.classResponse.epName}`,
        name: `Thanh toán lớp ${registration.classResponse.epName}`,
        childrenID: registration.childrenResponse.id,
        enrichmentPrograms: [registration.enrichmentProgramResponse?.id]
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

  const isRegistrationPaid = (registration) => {
    if (!registration.childrenResponse || !registration.enrichmentProgramResponse) return false;
    
    const key = `${registration.childrenResponse.id}-${registration.enrichmentProgramResponse.id}`;
    return paymentStatuses[key]?.paid || false;
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
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

  const renderTabNavigation = () => (
    <div className="enrichment-tabs-navigation">
      <a
        href="/enrichment-program" 
        className="enrichment-tab-button"
      >
        <FontAwesomeIcon icon="th-large" />
        Chương Trình Học
      </a>
      <button 
        className="enrichment-tab-button active"
        onClick={() => {}} // Already on this page
      >
        <FontAwesomeIcon icon="history" />
        Lịch Sử Đăng Ký
      </button>
    </div>
  );

  return (
    <div className="enrichment-program-container">
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
        <h1 className="enrichment-program-title">Lịch Sử Đăng Ký Khóa Học Năng Khiếu</h1>
        <p className="enrichment-program-subtitle">
          Xem và quản lý các khóa học năng khiếu đã đăng ký cho con
        </p>
      </div>

      {/* Tab Navigation */}
      {renderTabNavigation()}

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
      ) : registrations.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon">
            <FontAwesomeIcon icon="book" size="3x" />
          </div>
          <h3 className="empty-message">Chưa có đăng ký khóa học nào</h3>
          <button
            className="retry-btn"
            onClick={() => window.location.href = '/enrichment-program'}
          >
            <FontAwesomeIcon icon="plus-circle" />
            Đăng ký khóa học mới
          </button>
        </div>
      ) : (
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
                  
                  {/* Program description */}
                  {registration.enrichmentProgramResponse?.description && (
                    <p className="enrichment-program-description">
                      {registration.enrichmentProgramResponse.description}
                    </p>
                  )}
                  
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
                    
                    {/* Display program fee */}
                    <div className="enrichment-info-item">
                      <span className="enrichment-info-label">
                        <FontAwesomeIcon icon="money-bill-wave" /> Học phí:
                      </span>
                      <span className="enrichment-info-value fee">
                        {formatCurrency(registration.enrichmentProgramResponse?.fee || 0)}
                      </span>
                    </div>
                    
                    {/* Display program duration */}
                    <div className="enrichment-info-item">
                      <span className="enrichment-info-label">
                        <FontAwesomeIcon icon="calendar-day" /> Thời gian:
                      </span>
                      <span className="enrichment-info-value">
                        {formatDisplayDate(registration.enrichmentProgramResponse?.startDate)} - {formatDisplayDate(registration.enrichmentProgramResponse?.endDate)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Teacher information */}
                  {registration.teachers && registration.teachers.length > 0 && (
                    <div className="enrichment-teacher-section">
                      <h5 className="enrichment-section-subtitle">
                        <FontAwesomeIcon icon="chalkboard-teacher" /> Giáo viên
                      </h5>
                      <div className="enrichment-teacher-list">
                        {registration.teachers.map((teacher, index) => (
                          <div key={index} className="enrichment-teacher-item">
                            <div className="enrichment-teacher-name">
                              {teacher.fullName}
                            </div>
                            <div className="enrichment-teacher-contact">
                              <span>
                                <FontAwesomeIcon icon="envelope" /> {teacher.email || 'Chưa cập nhật'}
                              </span>
                              <span>
                                <FontAwesomeIcon icon="phone" /> {teacher.phoneNumber || 'Chưa cập nhật'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="enrichment-history-card-footer">
                {registration.classResponse.status === "Available" ? (
                  isRegistrationPaid(registration) ? (
                    <div className="enrichment-payment-success">
                      <FontAwesomeIcon icon="check-circle" />
                      Đã thanh toán
                    </div>
                  ) : (
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
                  )
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
      )}
    </div>
  );
};

export default EnrichmentHistory;
