import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getEnrollmentApplicationsProgress, getEnrollmentApplicationDetail,
  createPaymentUrlForEnrollment, getInvoiceDetails,
  getApplicationDescription
} from '../../services/EnrollmentApplicationService';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import styles from './EnrollmentTrackingPage.module.css';

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
  const [feeDescription, setFeeDescription] = useState("");

  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      showSpinner('Loading enrollment information...');
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
      setError('Cannot load enrollment information. Please try again later.');
      toast.error('Cannot load enrollment information.');
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
      toast.error('Cannot load enrollment application detail.');
      console.error('Error fetching application detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchFeeDescription = async (childId) => {
    try {
      const data = await getApplicationDescription(childId);
      setFeeDescription(data.description || "");
    } catch (err) {
      console.error("Error fetching fee description:", err);
      setFeeDescription("");
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

    // Only fetch fee description if status is not Pending
    if (application.status !== 'Pending') {
      fetchFeeDescription(application.childrenID);
    } else {
      setFeeDescription(""); // Clear any previous fee description
    }

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
      case 'Pending': return 'trackingPending';
      case 'Approved': return 'trackingApproved';
      case 'Paid': return 'trackingPaid';
      case 'Enrolled': return 'trackingEnrolled';
      case 'Rejected': return 'trackingRejected';
      default: return 'trackingPending';
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
      case 'Pending': return 'Pending';
      case 'Approved': return 'Approved';
      case 'Enrolled': return 'Enrolled';
      case 'Paid': return 'Paid';
      case 'Rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString.includes('0001-01-01')) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
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
      setProcessingPayment(prev => ({ ...prev, [application.eaid]: true }));
      showSpinner('Creating payment link...');

      const response = await createPaymentUrlForEnrollment(application.childrenID);

      if (response && response.url) {
        const paymentWindow = window.open(response.url, '_blank');

        // Start polling for status changes immediately
        let statusCheckInterval;
        let attempts = 0;
        const maxAttempts = 30; // Check for up to 5 minutes (10s * 30)

        statusCheckInterval = setInterval(async () => {
          // Increment attempts counter
          attempts++;

          try {
            // Directly check application status from the server
            const updatedApplication = await getEnrollmentApplicationDetail(application.eaid);

            // If payment status has changed or window is closed
            if ((updatedApplication && updatedApplication.status === 'Paid') ||
              (paymentWindow && paymentWindow.closed)) {

              // Clear the interval and update UI
              clearInterval(statusCheckInterval);
              hideSpinner();
              setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));

              // Refresh all data
              fetchApplications();

              // Check if modal is open and refresh that data too
              if (selectedApplication && selectedApplication.eaid === application.eaid) {
                fetchApplicationDetail(application.eaid);
              }

              // Show success message if paid
              if (updatedApplication && updatedApplication.status === 'Paid') {
                toast.success('Payment successful!');
              }

              return;
            }

            // Stop checking after max attempts
            if (attempts >= maxAttempts) {
              clearInterval(statusCheckInterval);
              hideSpinner();
              setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
              toast.info('Please refresh the page to update the payment status');
            }
          } catch (err) {
            console.error('Error checking payment status:', err);
          }
        }, 10000); // Check every 10 seconds

        // Still monitor window close event for immediate feedback
        const checkWindowClosed = setInterval(() => {
          if (paymentWindow && paymentWindow.closed) {
            clearInterval(checkWindowClosed);
            hideSpinner();

            // Show loading message
            toast.info('Updating payment status...');

            // Immediate check for status update
            getEnrollmentApplicationDetail(application.eaid)
              .then(updatedData => {
                if (updatedData && updatedData.status === 'Paid') {
                  toast.success('Payment successful!');
                }

                // Refresh all data
                fetchApplications();

                // Update modal if open
                if (selectedApplication && selectedApplication.eaid === application.eaid) {
                  fetchApplicationDetail(application.eaid);
                }

                setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
              })
              .catch(err => {
                console.error('Error fetching updated status:', err);
                setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
              });
          }
        }, 200);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Không thể tạo liên kết thanh toán. Định dạng phản hồi không hợp lệ.');
        hideSpinner();
        setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
      }
    } catch (err) {
      let errorMessage = 'An error occurred while creating payment link.';

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      toast.error(errorMessage);
      console.error('Payment error details:', err);
      hideSpinner();
      setProcessingPayment(prev => ({ ...prev, [application.eaid]: false }));
    }
  };

  const renderPaymentButton = (app) => {
    if (app.status === 'Rejected') {
      return null;
    }

    const isProcessing = processingPayment[app.eaid];

    if (app.status === 'Enrolled') {
      // Check if classResponse exists and has a status
      if (app.classResponse && app.classResponse.status === 'Unavailable') {
        return (
          <button
            className={`${styles.trackingActionBtn} ${styles.trackingPaymentBtn}`}
            disabled={true}
          >
            <FontAwesomeIcon icon="clock" />
            Wait for class to open to pay
          </button>
        );
      } else {
        return (
          <button
            className={`${styles.trackingActionBtn} ${styles.trackingPaymentBtn} ${isProcessing ? styles.trackingProcessing : styles.trackingPulse}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!isProcessing) handlePayment(app);
            }}
            disabled={isProcessing}
          >
            <FontAwesomeIcon icon={isProcessing ? "spinner" : "credit-card"} spin={isProcessing} />
            {isProcessing ? 'Processing...' : 'Pay tuition fee'}
          </button>
        );
      }
    }

    return null;
  }

  return (
    <div className={styles.trackingContainer}>
      <toast.ToastContainer position="top-right" />

      <div className={styles.trackingLayout}>
        <div className={styles.trackingSidebar}>
          <div className={styles.trackingSidebarHeader}>
            <FontAwesomeIcon icon="filter" className={styles.trackingSidebarIcon} />
            <h3>Status</h3>
          </div>

          <div className={styles.trackingStatusTabs}>
            <button
              className={`${styles.trackingTabBtn} ${filterStatus === 'all' ? styles.active : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <span className={styles.trackingTabIcon}>
                <FontAwesomeIcon icon="list" />
              </span>
              <span className={styles.trackingTabText}>All</span>
            </button>
            <button
              className={`${styles.trackingTabBtn} ${filterStatus === 'Pending' ? styles.active : ''}`}
              onClick={() => setFilterStatus('Pending')}
            >
              <span className={`${styles.trackingTabIcon} ${styles.trackingPending}`}>
                <FontAwesomeIcon icon="clock" />
              </span>
              <span className={styles.trackingTabText}>Pending</span>
            </button>
            <button
              className={`${styles.trackingTabBtn} ${filterStatus === 'Approved' ? styles.active : ''}`}
              onClick={() => setFilterStatus('Approved')}
            >
              <span className={`${styles.trackingTabIcon} ${styles.trackingApproved}`}>
                <FontAwesomeIcon icon="check-circle" />
              </span>
              <span className={styles.trackingTabText}>Approved</span>
            </button>
            <button
              className={`${styles.trackingTabBtn} ${filterStatus === 'Paid' ? styles.active : ''}`}
              onClick={() => setFilterStatus('Paid')}
            >
              <span className={`${styles.trackingTabIcon} ${styles.trackingPaid}`}>
                <FontAwesomeIcon icon="money-check-alt" />
              </span>
              <span className={styles.trackingTabText}>Paid</span>
            </button>
            <button
              className={`${styles.trackingTabBtn} ${filterStatus === 'Enrolled' ? styles.active : ''}`}
              onClick={() => setFilterStatus('Enrolled')}
            >
              <span className={`${styles.trackingTabIcon} ${styles.trackingEnrolled}`}>
                <FontAwesomeIcon icon="user-check" />
              </span>
              <span className={styles.trackingTabText}>Enrolled</span>
            </button>
            <button
              className={`${styles.trackingTabBtn} ${filterStatus === 'Rejected' ? styles.active : ''}`}
              onClick={() => setFilterStatus('Rejected')}
            >
              <span className={`${styles.trackingTabIcon} ${styles.trackingRejected}`}>
                <FontAwesomeIcon icon="times-circle" />
              </span>
              <span className={styles.trackingTabText}>Rejected</span>
            </button>
          </div>
        </div>

        <div className={styles.trackingContentArea}>
          <div className={styles.trackingPaper}>
            <div className={styles.trackingHeader}>
              <div className={styles.trackingHeaderContent}>
                <FontAwesomeIcon icon="tasks" className={styles.trackingHeaderIcon} />
                <h1>Tracking enrollment progress</h1>
              </div>
            </div>

            {error && (
              <div className={`${styles.trackingMessage} ${styles.trackingErrorMessage}`}>
                <div className={styles.trackingMessageIcon}>
                  <FontAwesomeIcon icon="times-circle" />
                </div>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.trackingContent}>
              {/* Search and filter bar */}
              <div className={styles.trackingSearchAndFilter}>
                <div className={styles.trackingSearchBar}>
                  <FontAwesomeIcon icon="search" className={styles.trackingSearchIcon} />
                  <input
                    type="text"
                    placeholder="Search by child name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.trackingSearchInput}
                  />
                  {searchQuery && (
                    <button
                      className={styles.trackingClearSearch}
                      onClick={() => setSearchQuery('')}
                    >
                      <FontAwesomeIcon icon="times" />
                    </button>
                  )}
                </div>

                <div className={styles.trackingSortDropdown}>
                  <label htmlFor="sortOrder">
                    <FontAwesomeIcon icon="sort" /> Sort by:
                  </label>
                  <select
                    id="sortOrder"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className={styles.trackingSortSelect}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="nameAsc">Name A-Z</option>
                    <option value="nameDesc">Name Z-A</option>
                  </select>
                </div>
              </div>

              {/* Applications list */}
              {filteredAndSortedApplications.length > 0 ? (
                <div className={styles.trackingApplicationsList}>
                  {filteredAndSortedApplications.map((app) => (
                    <div
                      key={app.eaid}
                      className={styles.trackingApplicationCard}
                      data-status={app.status}
                    >
                      <div className={`${styles.trackingApplicationStatus} ${styles[getStatusColor(app.status)]}`}>
                        <div className={styles.trackingStatusIcon}>
                          <FontAwesomeIcon icon={getStatusIcon(app.status)} />
                        </div>
                        <span className={styles.trackingStatusText}>{getStatusText(app.status)}</span>
                      </div>

                      <div className={styles.trackingApplicationInfo}>
                        <h3 className={styles.trackingChildName}>{app.childrenName}</h3>
                        <div className={styles.trackingApplicationDetails}>
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

                      <div className={styles.trackingApplicationTimeline}>
                        <div
                          className={`${styles.trackingTimelineStep} ${app.status !== 'Rejected' ? styles.active : ''}`}
                          data-status="Pending"
                        >
                          <div className={styles.trackingStepNumber}>1</div>
                          <div className={styles.trackingStepIcon}>
                            <FontAwesomeIcon icon={app.status !== 'Rejected' ? "check" : "clipboard-list"} />
                          </div>
                          <div className={styles.trackingStepLabel}>Register</div>
                        </div>

                        <div
                          className={`${styles.trackingTimelineConnector} ${(app.status === 'Approved' || app.status === 'Paid' || app.status === 'Enrolled')
                            ? styles.active
                            : app.status === 'Pending' ? styles.halfActive : ''
                            }`}
                          data-from="Register"
                          data-to="Approved"
                        ></div>

                        <div
                          className={`${styles.trackingTimelineStep} ${(app.status === 'Approved' || app.status === 'Paid' || app.status === 'Enrolled') ? styles.active : ''}`}
                          data-status="Approved"
                        >
                          <div className={styles.trackingStepNumber}>2</div>
                          <div className={styles.trackingStepIcon}>
                            <FontAwesomeIcon icon={(app.status === 'Approved' || app.status === 'Paid' || app.status === 'Enrolled') ? "check" : "check-circle"} />
                          </div>
                          <div className={styles.trackingStepLabel}>Approved</div>
                        </div>

                        <div
                          className={`${styles.trackingTimelineConnector} ${(app.status === 'Paid' || app.status === 'Enrolled')
                            ? styles.active
                            : app.status === 'Approved' ? styles.halfActive : ''
                            }`}
                          data-from="Approved"
                          data-to="Paid"
                        ></div>

                        <div
                          className={`${styles.trackingTimelineStep} ${(app.status === 'Enrolled' || app.status === 'Paid') ? styles.active : ''}`}
                          data-status="Enrolled"
                        >
                          <div className={styles.trackingStepNumber}>3</div>
                          <div className={styles.trackingStepIcon}>
                            <FontAwesomeIcon icon={(app.status === 'Enrolled' || app.status === 'Paid') ? "check" : "user-check"} />
                          </div>
                          <div className={styles.trackingStepLabel}>Enrolled</div>
                        </div>

                        <div
                          className={`${styles.trackingTimelineConnector} ${app.status === 'Paid'
                            ? styles.active
                            : app.status === 'Enrolled' ? styles.halfActive : ''
                            }`}
                          data-from="Enrolled"
                          data-to="Paid"
                        ></div>

                        <div
                          className={`${styles.trackingTimelineStep} ${app.status === 'Paid' ? styles.active : ''}`}
                          data-status="Paid"
                        >
                          <div className={styles.trackingStepNumber}>4</div>
                          <div className={styles.trackingStepIcon}>
                            <FontAwesomeIcon icon={app.status === 'Paid' ? "check" : "money-check-alt"} />
                          </div>
                          <div className={styles.trackingStepLabel}>Payment</div>
                        </div>
                      </div>

                      <div className={styles.trackingApplicationActions}>
                        {renderPaymentButton(app)}
                        <button
                          className={`${styles.trackingActionBtn} ${styles.trackingDetailBtn}`}
                          onClick={() => handleDetailClick(app)}
                        >
                          <FontAwesomeIcon icon="info-circle" />
                          Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.trackingNoApplications}>
                  {searchQuery || filterStatus !== 'all' ? (
                    <>
                      <div className={styles.trackingNoDataIcon}>
                        <FontAwesomeIcon icon="filter" />
                      </div>
                      <h3>No results found</h3>
                      <p>No applications match your search criteria.</p>
                      <button
                        className={styles.trackingBtnSecondary}
                        onClick={() => {
                          setFilterStatus('all');
                          setSearchQuery('');
                        }}
                      >
                        <FontAwesomeIcon icon="undo" />
                        Clear filters
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.trackingNoDataIcon}>
                        <FontAwesomeIcon icon="clipboard" />
                      </div>
                      <h3>No applications found</h3>
                      <p>You don't have any enrollment applications. Register your child now.</p>
                      <Link to="/profile/children" className={styles.trackingBtnPrimary}>
                        <FontAwesomeIcon icon="plus" />
                        Enroll now
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
          className={`${styles.trackingModalOverlay} ${modalVisible ? styles.visible : ''}`}
          onClick={closeDetailModal}
          ref={modalOverlayRef}
        >
          <div
            className={styles.trackingModalContent}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.trackingModalHeader}>
              <h2>Enrollment application details</h2>
              <button className={styles.trackingModalCloseBtn} onClick={closeDetailModal}>
                <FontAwesomeIcon icon="times" />
              </button>
            </div>

            <div className={styles.trackingModalBody}>
              {loadingDetail ? (
                <div className={styles.trackingModalLoading}>
                  <div className={styles.trackingLoadingSpinner}></div>
                  <p>Loading detailed information...</p>
                </div>
              ) : applicationDetail ? (
                <div className={styles.trackingDetailContent}>
                  <div className={styles.trackingDetailHeader}>
                    <div className={styles.trackingDetailAvatar}>
                      {applicationDetail.avatar ? (
                        <img src={applicationDetail.avatar} alt={applicationDetail.childrenName} />
                      ) : (
                        <div className={styles.trackingDetailAvatarPlaceholder}>
                          <FontAwesomeIcon icon="child" />
                        </div>
                      )}
                    </div>

                    <div className={styles.trackingDetailMainInfo}>
                      <h3>{applicationDetail.childrenName}</h3>
                      <div className={`${styles.trackingDetailStatus} ${styles[getStatusColor(applicationDetail.status)]}`}>
                        <FontAwesomeIcon icon={getStatusIcon(applicationDetail.status)} />
                        <span>{getStatusText(applicationDetail.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.trackingDetailSections}>
                    <div className={styles.trackingDetailSection}>
                      <h4>
                        <FontAwesomeIcon icon="info-circle" />
                        Basic information
                      </h4>
                      <div className={styles.trackingDetailGrid}>
                        <div className={styles.trackingDetailItem}>
                          <span className={styles.trackingDetailLabel}>Birthday:</span>
                          <span className={styles.trackingDetailValue}>{formatDate(applicationDetail.birthday)}</span>
                        </div>
                        <div className={styles.trackingDetailItem}>
                          <span className={styles.trackingDetailLabel}>Gender:</span>
                          <span className={styles.trackingDetailValue}>
                            {applicationDetail.gender === 'Male' ? 'Male' : 'Female'}
                          </span>
                        </div>
                        <div className={styles.trackingDetailItem}>
                          <span className={styles.trackingDetailLabel}>Birthplace:</span>
                          <span className={styles.trackingDetailValue}>{applicationDetail.city}</span>
                        </div>
                        <div className={styles.trackingDetailItem}>
                          <span className={styles.trackingDetailLabel}>Class:</span>
                          <span className={styles.trackingDetailValue}>{applicationDetail.gradeLevelName}</span>
                        </div>
                        {applicationDetail.status === 'Enrolled' && (
                          <div className={styles.trackingDetailItem}>
                            <span className={styles.trackingDetailLabel}>Enrollment date:</span>
                            <span className={styles.trackingDetailValue}>{formatDate(applicationDetail.enrollDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.trackingDetailSection}>
                      <h4>
                        <FontAwesomeIcon icon="user" />
                        Parent information
                      </h4>
                      <div className={styles.trackingDetailGrid}>
                        <div className={styles.trackingDetailItem}>
                          <span className={styles.trackingDetailLabel}>Name:</span>
                          <span className={styles.trackingDetailValue}>{applicationDetail.parentName}</span>
                        </div>
                        <div className={styles.trackingDetailItem}>
                          <span className={styles.trackingDetailLabel}>Phone:</span>
                          <span className={styles.trackingDetailValue}>{applicationDetail.parentPhone}</span>
                        </div>
                        <div className={styles.trackingDetailItem} style={{ gridColumn: "1 / -1" }}>
                          <span className={styles.trackingDetailLabel}>Address:</span>
                          <span className={styles.trackingDetailValue}>{applicationDetail.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.trackingDetailSection}>
                      <h4>
                        <FontAwesomeIcon icon="file-alt" />
                        Documents
                      </h4>
                      <div className={styles.trackingDetailDocuments}>
                        <div className={styles.trackingDetailDocument}>
                          <p>Birth certificate</p>
                          {applicationDetail.birthCertificate ? (
                            <div className={styles.trackingDetailDocumentPreview}>
                              <img
                                src={applicationDetail.birthCertificate}
                                alt="Birth certificate"
                                onClick={() => window.open(applicationDetail.birthCertificate, '_blank')}
                                className={styles.documentImage}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className={styles.trackingDetailDocumentOverlay}>
                                <FontAwesomeIcon icon="search-plus" />
                              </div>
                            </div>
                          ) : (
                            <div className={styles.trackingDetailDocumentMissing}>
                              <FontAwesomeIcon icon="file-excel" />
                              <span>Not provided</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Only show fee information if application status is not Pending */}
                  {feeDescription && applicationDetail && applicationDetail.status !== 'Pending' && (
                    <div className={styles.trackingDetailSection}>
                      <h4>
                        <FontAwesomeIcon icon="money-bill-wave" />
                        Tuition fee information
                      </h4>
                      <div className={styles.trackingDetailFeeInfo}>
                        {feeDescription.split('\n').map((line, index) => {
                          // Format the fee line - replace parentheses with colon
                          let formattedLine = line;
                          if (line.includes('(') && line.includes(')') && !line.includes('Tổng cộng:')) {
                            formattedLine = line.replace(/\((.*?)\)/, ': $1').replace(' đồng)', ' đồng');
                            formattedLine = line.replace(/\((.*?)\)/, ': $1').replace(' đồng)', ' đồng');
                          }

                          return (
                            <div
                              key={index}
                              className={`${styles.trackingDetailFeeLine} ${line.includes('Tổng cộng:') ? styles.trackingDetailFeeTotal : ''}`}
                            >
                              {formattedLine}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.trackingDetailError}>
                  <FontAwesomeIcon icon="exclamation-circle" />
                  <p>Cannot load detailed information. Please try again later.</p>
                </div>
              )}
            </div>

            <div className={styles.trackingModalFooter}>
              <button className={styles.trackingBtnSecondary} onClick={closeDetailModal}>
                <FontAwesomeIcon icon="times" />
                Close
              </button>
              {applicationDetail && (applicationDetail.status === 'Enrolled') && (
                selectedApplication && selectedApplication.classResponse && selectedApplication.classResponse.status === 'Unavailable' ? (
                  <button
                    className={`${styles.trackingActionBtn} ${styles.trackingPaymentBtn}`}
                    disabled={true}
                  >
                    <FontAwesomeIcon icon="clock" />
                    Wait for class to open to pay
                  </button>
                ) : (
                  <button
                    className={`${styles.trackingBtnPrimary} ${processingPayment[selectedApplication.eaid] ? styles.trackingProcessing : ''}`}
                    onClick={() => {
                      if (!processingPayment[selectedApplication.eaid]) {
                        handlePayment(selectedApplication);
                      }
                    }}
                    disabled={processingPayment[selectedApplication.eaid]}
                  >
                    <FontAwesomeIcon icon={processingPayment[selectedApplication.eaid] ? "spinner" : "credit-card"}
                      spin={processingPayment[selectedApplication.eaid]} />
                    {processingPayment[selectedApplication.eaid] ? 'Processing...' : 'Pay tuition fee'}
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