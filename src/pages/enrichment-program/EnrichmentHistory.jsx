import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  getEnrichmentClassRegistrations, 
  createPaymentUrl,
  getEnrichmentInvoiceDetails
} from '../../services/EnrichmentProgramService';
import { useUser } from '../../contexts/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import styles from './EnrichmentProgram.module.css';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

const EnrichmentHistory = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const { currentUser } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!currentUser?.id) return;
      
      try {
        setLoading(true);
        const data = await getEnrichmentClassRegistrations(currentUser.id);
        setRegistrations(data || []);
        setError(null);
      } catch (err) {
        setError('Cannot load registration data. Please try again later.');
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
        toast.error('Cannot create payment link. Please try again later.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An error occurred while processing payment. Please try again later.');
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
          <span className={`${styles.enrichmentRegistrationStatus} ${styles.active}`}>
            <FontAwesomeIcon icon="check-circle" /> Studying
          </span>
        );
      case 'Pending':
        return (
          <span className={`${styles.enrichmentRegistrationStatus} ${styles.pending}`}>
            <FontAwesomeIcon icon="clock" /> Pending
          </span>
        );
      case 'Completed':
        return (
          <span className={`${styles.enrichmentRegistrationStatus} ${styles.completed}`}>
            <FontAwesomeIcon icon="history" /> Completed
          </span>
        );
      default:
        return (
          <span className={`${styles.enrichmentRegistrationStatus}`}>
            <FontAwesomeIcon icon="info-circle" /> {status}
          </span>
        );
    }
  };

  const renderTabNavigation = () => (
    <div className={styles.enrichmentTabsNavigation}>
      <Link
        to="/enrichment-program" 
        className={styles.enrichmentTabButton}
      >
        <FontAwesomeIcon icon="th-large" />
        Enrichment Program
      </Link>
      <button 
        className={`${styles.enrichmentTabButton} ${styles.active}`}
        onClick={() => {}} // Already on this page
      >
        <FontAwesomeIcon icon="history" />
        Registration History
      </button>
    </div>
  );

  const getStatusClass = (status) => {
    if (!status) return '';
    
    switch (status) {
      case 'Available': 
        return styles.statusAvailable;
      case 'Unavailable': 
        return styles.statusUnavailable;
      case 'Finished':
        return styles.statusFinished;
      default:
        return '';
    }
  };

  return (
    <div className={styles.enrichmentProgramContainer}>
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
        <h1 className={styles.enrichmentProgramTitle}>Enrichment Program Registration History</h1>
        <p className={styles.enrichmentProgramSubtitle}>
          View and manage the enrichment programs your child has registered for
        </p>
      </div>

      {/* Tab Navigation */}
      {renderTabNavigation()}

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
      ) : registrations.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon="book" size="3x" />
          </div>
          <h3 className={styles.emptyMessage}>No registration yet</h3>
          <button
            className={styles.retryBtn}
            onClick={() => navigate('/enrichment-program')}
          >
            <FontAwesomeIcon icon="plus-circle" />
            Register new class
          </button>
        </div>
      ) : (
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
                  
                  {/* Program description */}
                  {registration.enrichmentProgramResponse?.description && (
                    <p className={styles.enrichmentProgramDescription}>
                      {registration.enrichmentProgramResponse.description}
                    </p>
                  )}
                  
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
                          `Thứ ${registration.classResponse.timetable}` : 
                          'No schedule'}
                      </span>
                    </div>
                    
                    <div className={styles.enrichmentInfoItem}>
                      <span className={styles.enrichmentInfoLabel}>
                        <FontAwesomeIcon icon="check-circle" /> Class status:
                      </span>
                      <span className={`${styles.enrichmentInfoValue} ${getStatusClass(registration.classResponse.status)}`}>
                        {registration.classResponse.status === "Available" ? "Ready" : 
                         registration.classResponse.status === "Unavailable" ? "Not opened" : 
                         registration.classResponse.status}
                      </span>
                    </div>
                    
                    {/* Display program fee */}
                    <div className={styles.enrichmentInfoItem}>
                      <span className={styles.enrichmentInfoLabel}>
                        <FontAwesomeIcon icon="money-bill-wave" /> Tuition fee:
                      </span>
                      <span className={`${styles.enrichmentInfoValue} ${styles.fee}`}>
                        {formatCurrency(registration.enrichmentProgramResponse?.fee || 0)}
                      </span>
                    </div>
                    
                    {/* Display program duration */}
                    <div className={styles.enrichmentInfoItem}>
                      <span className={styles.enrichmentInfoLabel}>
                        <FontAwesomeIcon icon="calendar-day" /> Time:
                      </span>
                      <span className={styles.enrichmentInfoValue}>
                        {formatDisplayDate(registration.enrichmentProgramResponse?.startDate)} - {formatDisplayDate(registration.enrichmentProgramResponse?.endDate)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Teacher information */}
                  {registration.teachers && registration.teachers.length > 0 && (
                    <div className={styles.enrichmentTeacherSection}>
                      <h5 className={styles.enrichmentSectionSubtitle}>
                        <FontAwesomeIcon icon="chalkboard-teacher" /> Teacher
                      </h5>
                      <div className={styles.enrichmentTeacherList}>
                        {registration.teachers.map((teacher, index) => (
                          <div key={index} className={styles.enrichmentTeacherItem}>
                            <div className={styles.enrichmentTeacherName}>
                              {teacher.fullName}
                            </div>
                            <div className={styles.enrichmentTeacherContact}>
                              <span>
                                <FontAwesomeIcon icon="envelope" /> {teacher.email || 'Not updated'}
                              </span>
                              <span>
                                <FontAwesomeIcon icon="phone" /> {teacher.phoneNumber || 'Not updated'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.enrichmentHistoryCardFooter}>
                {registration.classResponse.status === "Available" ? (
                  isRegistrationPaid(registration) ? (
                    <div className={styles.enrichmentPaymentSuccess}>
                      <FontAwesomeIcon icon="check-circle" />
                        Paid
                    </div>
                  ) : (
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
                  )
                ) : (registration.classResponse.status === "Finished" ? (
                  <div className={styles.enrichmentClassFinished}>
                    <FontAwesomeIcon icon="history" />
                    Class is finished.
                  </div>
                ) : (
                  <div className={styles.enrichmentPaymentNotice}>
                    <FontAwesomeIcon icon="info-circle" />
                    Wait for class to open to process payment
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrichmentHistory;
