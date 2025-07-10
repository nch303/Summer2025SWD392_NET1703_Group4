import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getTuitionFeesByCurrentAccount, createPaymentUrlForTuitionFee } from '../../services/TuitionFeeService';
import { useProcessingSpinner } from '../../components/ProcessingSpinner';
import { useCustomToast } from '../../components/CustomToast';
import styles from './TuitionFee.module.css';

const TuitionFeePage = () => {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [error, setError] = useState('');
  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeBillingTab, setActiveBillingTab] = useState('upcoming');

  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();

  useEffect(() => {
    fetchTuitionFees();
  }, []);

  const fetchTuitionFees = async () => {
    try {
      showSpinner('Loading tuition fee information...');
      const data = await getTuitionFeesByCurrentAccount();
      setTuitionFees(data || []);
      setError('');
    } catch (err) {
      setError('Cannot load tuition fee information. Please try again later.');
      toast.error('Cannot load tuition fee information.');
      console.error('Error fetching tuition fees:', err);
    } finally {
      hideSpinner();
    }
  };

  // Format currency (VND)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Simple check if fee is overdue (past due date)
  const isOverdue = (fee) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const feeDate = new Date(fee.date);
    feeDate.setHours(0, 0, 0, 0);
    return currentDate > feeDate;
  };

  // Filter fees based on active tab
  const filteredFees = tuitionFees.filter(fee => {
    if (activeBillingTab === 'overdue') {
      return isOverdue(fee);
    } else {
      return !isOverdue(fee);
    }
  });

  // Calculate total selected amount
  const totalSelectedAmount = selectedFeeId ? 
    tuitionFees.find(fee => fee.id === selectedFeeId)?.fee || 0 : 0;

  // Handle select fee
  const handleSelectFee = (feeId) => {
    setSelectedFeeId(feeId === selectedFeeId ? null : feeId);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedFeeId(null);
  };

  // Get payment info
  const getPaymentInfo = () => {
    const selectedFee = tuitionFees.find(fee => fee.id === selectedFeeId);
    if (!selectedFee) return { selectedFeeIds: [], childID: null };

    return {
      selectedFeeIds: [selectedFee.id],
      childID: selectedFee.childID
    };
  };

  // Handle payment process
  const handlePayment = async () => {
    try {
      const { selectedFeeIds, childID } = getPaymentInfo();

      if (!selectedFeeIds.length || !childID) {
        toast.error('Please select at least one tuition fee to pay.');
        return;
      }

      setProcessingPayment(true);
      showSpinner('Creating payment link...');

      const response = await createPaymentUrlForTuitionFee(
        childID,
        selectedFeeIds,
        totalSelectedAmount
      );

      if (response && response.url) {
        hideSpinner();
        const link = document.createElement('a');
        link.href = response.url;
        link.setAttribute('data-no-prompt', 'true');
        window.onbeforeunload = null;
        window.removeEventListener('beforeunload', () => { });

        const clickEvent = new MouseEvent('click', {
          bubbles: false,
          cancelable: false,
          view: window
        });

        link.dispatchEvent(clickEvent);

        setTimeout(() => {
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, 100);
      } else {
        console.error('Invalid response format:', response);
        toast.error('Cannot create payment link.');
        hideSpinner();
        setProcessingPayment(false);
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
      setProcessingPayment(false);
    }
  };

  // Render fee card
  const renderFeeCard = (fee) => {
    const isSelected = fee.id === selectedFeeId;
    const isPastDue = isOverdue(fee);

    // Split the description at "+" character to create bullet points
    const descriptionItems = fee.description
      .split('+')
      .map(item => {
        const trimmedItem = item.trim();
        const match = trimmedItem.match(/^(.*?)\s*\((\d+)\)$/);

        if (match) {
          const [, text, amount] = match;
          const formattedAmount = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(parseInt(amount, 10));
          return `${text}: ${formattedAmount}`;
        }

        return trimmedItem;
      })
      .filter(item => item.length > 0);

    return (
      <div
        key={fee.id}
        className={`${styles.tuitionFeeCard} ${isPastDue ? styles.pastDue : ''} ${isSelected ? styles.selected : ''}`}
        onClick={() => handleSelectFee(fee.id)}
      >
        <div className={styles.tuitionFeeCheckbox}>
          <input
            type="radio"
            checked={isSelected}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
          <span className={styles.checkmark}></span>
        </div>

        <div className={styles.tuitionFeeDetails}>
          <div className={styles.tuitionFeeHeader}>
            <h3>{fee.childName} - {fee.name}</h3>
            <span className={`${styles.tuitionFeeBadge} ${isPastDue ? styles.pastDue : styles.upcoming}`}>
              {isPastDue ? 'Overdue' : 'Unpaid'}
            </span>
          </div>

          <div className={styles.tuitionFeeDescription}>
            <ul className={styles.tuitionFeeDescriptionList}>
              {descriptionItems.map((item, index) => (
                <li key={index} className={styles.tuitionFeeDescriptionItem}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.tuitionFeeFooter}>
            <div className={styles.tuitionFeeGrade}>
              <FontAwesomeIcon icon="graduation-cap" />
              <span>{fee.gradeLevelName}</span>
            </div>
            <div className={styles.tuitionFeeDate}>
              <FontAwesomeIcon icon="calendar-alt" />
              <span>Due date: {formatDate(fee.date)}</span>
            </div>
            <div className={styles.tuitionFeeAmount}>
              <FontAwesomeIcon icon="money-bill-wave" />
              <span>{formatCurrency(fee.fee)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Count overdue and upcoming fees
  const overdueCount = tuitionFees.filter(fee => isOverdue(fee)).length;
  const upcomingCount = tuitionFees.length - overdueCount;

  return (
    <div className={styles.tuitionFeeContainer}>
      <toast.ToastContainer position="top-right" />

      <div className={styles.tuitionFeePaper}>
        <div className={styles.tuitionFeeHeader}>
          <div className={styles.tuitionFeeHeaderContent}>
            <FontAwesomeIcon icon="money-check-alt" className={styles.tuitionFeeHeaderIcon} />
            <h1>Tuition fee management</h1>
          </div>

          <button
            className={styles.tuitionFeeRefreshButton}
            onClick={fetchTuitionFees}
          >
            <FontAwesomeIcon icon="sync" />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className={`${styles.tuitionFeeMessage} ${styles.tuitionFeeErrorMessage}`}>
            <div className={styles.tuitionFeeMessageIcon}>
              <FontAwesomeIcon icon="times-circle" />
            </div>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.tuitionFeeContent}>
          {/* Billing information */}
          <div className={styles.tuitionFeeBillingSummary}>
            <div className={styles.tuitionFeeBillingCard}>
              <div className={styles.tuitionFeeBillingLeft}>
                <h3>Total amount to pay</h3>
                <div className={styles.tuitionFeePrice}>
                  {formatCurrency(totalSelectedAmount)}
                </div>
                <div className={styles.tuitionFeeSelectionInfo}>
                  {selectedFeeId ? (
                    <span>1 fee selected</span>
                  ) : (
                    <span>No fee selected</span>
                  )}
                </div>
              </div>
              <div className={styles.tuitionFeeBillingActions}>
                <button
                  className={styles.tuitionFeeClearBtn}
                  onClick={handleClearSelection}
                  disabled={!selectedFeeId || processingPayment}
                >
                  <FontAwesomeIcon icon="times" />
                  <span>Unselect</span>
                </button>
                <button
                  className={`${styles.tuitionFeePaymentBtn} ${processingPayment ? styles.processing : ''}`}
                  onClick={handlePayment}
                  disabled={!selectedFeeId || processingPayment}
                >
                  <FontAwesomeIcon icon={processingPayment ? "spinner" : "credit-card"} spin={processingPayment} />
                  {processingPayment ? 'Processing...' : 'Process payment'}
                </button>
              </div>
            </div>
          </div>

          {/* Billing tabs */}
          <div className={styles.tuitionFeeTabs}>
            <button
              className={`${styles.tuitionFeeTab} ${activeBillingTab === 'upcoming' ? styles.active : ''}`}
              onClick={() => setActiveBillingTab('upcoming')}
            >
              <FontAwesomeIcon icon="calendar-day" />
              <span>Upcoming ({upcomingCount})</span>
            </button>
            <button
              className={`${styles.tuitionFeeTab} ${activeBillingTab === 'overdue' ? styles.active : ''}`}
              onClick={() => setActiveBillingTab('overdue')}
            >
              <FontAwesomeIcon icon="exclamation-circle" />
              <span>Overdue ({overdueCount})</span>
            </button>
          </div>

          {/* Billing content based on active tab */}
          <div className={styles.tuitionFeeTabContent}>
            {filteredFees.length > 0 ? (
              <div className={styles.tuitionFeeSection}>
                <div className={styles.tuitionFeeSectionHeader}>
                  <h2>{activeBillingTab === 'overdue' ? 'Overdue tuition fee' : 'Upcoming tuition fee'}</h2>
                </div>
                <div className={styles.tuitionFeeList}>
                  {filteredFees.map(fee => renderFeeCard(fee))}
                </div>
              </div>
            ) : (
              <div className={styles.tuitionFeeEmptyState}>
                <FontAwesomeIcon icon={activeBillingTab === 'overdue' ? "check-circle" : "calendar-check"} />
                <h3>{activeBillingTab === 'overdue' ? 'No overdue tuition fee' : 'No upcoming tuition fee'}</h3>
                <p>
                  {activeBillingTab === 'overdue' 
                    ? 'You don\'t have any overdue tuition fee to pay. Good job!' 
                    : 'You don\'t have any tuition fee to pay at this moment.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TuitionFeePage;
