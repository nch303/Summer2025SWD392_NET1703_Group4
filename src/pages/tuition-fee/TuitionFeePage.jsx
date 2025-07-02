import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getTuitionFeesByCurrentAccount, createPaymentUrlForTuitionFee } from './TuitionFeeService';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import './TuitionFee.css';

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

  // Get current date for comparison
  const currentDate = useMemo(() => new Date(), []);
  currentDate.setHours(0, 0, 0, 0);

  // Categorize fees by due date and payment status
  const categorizedFees = useMemo(() => {
    const past = [];
    const upcoming = [];
    const future = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tuitionFees.forEach(fee => {
      const feeDate = new Date(fee.date);
      feeDate.setHours(0, 0, 0, 0);

      // Compare exact dates - if today is after the fee's due date, it's past due
      if (today > feeDate) {
        past.push({ ...fee, isPastDue: true });
      } else if (today.getMonth() === feeDate.getMonth() && today.getFullYear() === feeDate.getFullYear()) {
        // Same month, but due date is today or in future
        upcoming.push({ ...fee, isCurrentMonth: true });
      } else {
        future.push(fee);
      }
    });

    return { past, upcoming, future };
  }, [tuitionFees]);

  // Update total amount calculation based on single selection
  const totalSelectedAmount = useMemo(() => {
    const selectedFee = tuitionFees.find(fee => fee.id === selectedFeeId);
    return selectedFee ? selectedFee.fee : 0;
  }, [tuitionFees, selectedFeeId]);

  // Check if a fee is selected
  const hasSelectedFee = selectedFeeId !== null;

  // Update the selection handler
  const handleSelectFee = (feeId) => {
    setSelectedFeeId(feeId === selectedFeeId ? null : feeId);
  };

  // Update clear selection
  const handleClearSelection = () => {
    setSelectedFeeId(null);
  };

  // Update the payment info retrieval
  const getPaymentInfo = () => {
    const selectedFee = tuitionFees.find(fee => fee.id === selectedFeeId);
    if (!selectedFee) return { selectedFeeIds: [], childID: null };

    return {
      selectedFeeIds: [selectedFee.id],
      childID: selectedFee.childID
    };
  };

  // Remove category selection functions or modify them to select just one item
  // For example, select the first fee in a category:
  const handleSelectFirstInCategory = (category) => {
    if (category.length > 0) {
      setSelectedFeeId(category[0].id);
    }
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
        // Hide spinner first
        hideSpinner();

        // Create a link element and simulate a click instead of using window.location
        const link = document.createElement('a');
        link.href = response.url;
        link.setAttribute('data-no-prompt', 'true');

        // For most aggressive approach, add these properties
        window.onbeforeunload = null;
        window.removeEventListener('beforeunload', () => { });

        // Prevent any other event listeners from executing
        const clickEvent = new MouseEvent('click', {
          bubbles: false,
          cancelable: false,
          view: window
        });

        // Dispatch click event to navigate without warning
        link.dispatchEvent(clickEvent);

        // As a fallback, also try regular navigation after a short delay
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
  const renderFeeCard = (fee, isPastDue = false) => {
    const isSelected = fee.id === selectedFeeId;

    // Split the description at "+" character to create bullet points
    const descriptionItems = fee.description
      .split('+')
      .map(item => {
        // Format: Remove parentheses and add currency format
        // Match anything like "Text (1234567)" and format as "Text: 1.234.567 ₫"
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
        className={`tuition-fee-card ${isPastDue ? 'past-due' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSelectFee(fee.id)}
      >
        <div className="tuition-fee-checkbox">
          <input
            type="radio"
            checked={isSelected}
            onChange={() => { }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="checkmark"></span>
        </div>

        <div className="tuition-fee-details">
          <div className="tuition-fee-header">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFF' }}>{fee.childName} - {fee.name}</h3>
            <span className={`tuition-fee-badge ${isPastDue ? 'past-due' : 'upcoming'}`}>
              {isPastDue ? 'Owed' : 'Unpaid'}
            </span>
          </div>

          <div className="tuition-fee-description">
            <ul className="tuition-fee-description-list">
              {descriptionItems.map((item, index) => (
                <li key={index} className="tuition-fee-description-item">{item}</li>
              ))}
            </ul>
          </div>

          <div className="tuition-fee-footer">
            <div className="tuition-fee-grade">
              <FontAwesomeIcon icon="graduation-cap" />
              <span>{fee.gradeLevelName}</span>
            </div>
            <div className="tuition-fee-date">
              <FontAwesomeIcon icon="calendar-alt" />
              <span>Due date: {formatDate(fee.date)}</span>
            </div>
            <div className="tuition-fee-amount">
              <FontAwesomeIcon icon="money-bill-wave" />
              <span>{formatCurrency(fee.fee)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tuition-fee-container">
      <toast.ToastContainer position="top-right" />

      <div className="tuition-fee-paper">
        <div className="tuition-fee-header">
          <div className="tuition-fee-header-content">
            <FontAwesomeIcon icon="money-check-alt" className="tuition-fee-header-icon" />
            <h1>Tuition fee management</h1>
          </div>

          <button
            className="tuition-fee-refresh-button"
            onClick={fetchTuitionFees}
          >
            <FontAwesomeIcon icon="sync" />
            <span>Refresh</span>
          </button>
        </div>

        {error && (
          <div className="tuition-fee-message tuition-fee-error-message">
            <div className="tuition-fee-message-icon">
              <FontAwesomeIcon icon="times-circle" />
            </div>
            <span>{error}</span>
          </div>
        )}

        <div className="tuition-fee-content">
          {/* Billing information */}
          <div className="tuition-fee-billing-summary">
            <div className="tuition-fee-billing-card">
              <div className="tuition-fee-billing-left">
                <h3>Total amount to pay</h3>
                <div className="tuition-fee-price">
                  {formatCurrency(totalSelectedAmount)}
                </div>
                <div className="tuition-fee-selection-info">
                  {hasSelectedFee ? (
                    <span>1 fee selected</span>
                  ) : (
                    <span>No fee selected</span>
                  )}
                </div>
              </div>
              <div className="tuition-fee-billing-actions">
                <button
                  className="tuition-fee-clear-btn"
                  onClick={handleClearSelection}
                  disabled={!hasSelectedFee || processingPayment}
                >
                  <FontAwesomeIcon icon="times" />
                  <span>Unselect</span>
                </button>
                <button
                  className={`tuition-fee-payment-btn ${processingPayment ? 'processing' : ''}`}
                  onClick={handlePayment}
                  disabled={!hasSelectedFee || processingPayment}
                >
                  <FontAwesomeIcon icon={processingPayment ? "spinner" : "credit-card"} spin={processingPayment} />
                  {processingPayment ? 'Processing...' : 'Process payment'}
                </button>
              </div>
            </div>
          </div>

          {/* Billing tabs */}
          <div className="tuition-fee-tabs">
            <button
              className={`tuition-fee-tab ${activeBillingTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveBillingTab('upcoming')}
            >
              <FontAwesomeIcon icon="calendar-day" />
              <span>Upcoming ({categorizedFees.upcoming.length})</span>
            </button>
            <button
              className={`tuition-fee-tab ${activeBillingTab === 'overdue' ? 'active' : ''}`}
              onClick={() => setActiveBillingTab('overdue')}
            >
              <FontAwesomeIcon icon="exclamation-circle" />
              <span>Overdue ({categorizedFees.past.length})</span>
            </button>
          </div>

          {/* Billing content based on active tab */}
          <div className="tuition-fee-tab-content">
            {activeBillingTab === 'upcoming' && (
              <>
                {categorizedFees.upcoming.length > 0 ? (
                  <div className="tuition-fee-section">
                    <div className="tuition-fee-section-header">
                      <h2>Tuition fee in this month</h2>
                    </div>
                    <div className="tuition-fee-list">
                      {categorizedFees.upcoming.map(fee => renderFeeCard(fee))}
                      {categorizedFees.future.map(fee => renderFeeCard(fee))}
                    </div>
                  </div>
                ) : (
                  <div className="tuition-fee-empty-state">
                    <FontAwesomeIcon icon="calendar-check" />
                    <h3>No fee in this month</h3>
                    <p>You don't have any tuition fee to pay in this month.</p>
                  </div>
                )}
              </>
            )}

            {activeBillingTab === 'overdue' && (
              <>
                {categorizedFees.past.length > 0 ? (
                  <div className="tuition-fee-section">
                    <div className="tuition-fee-section-header">
                      <h2>Overdue tuition fee</h2>
                    </div>
                    <div className="tuition-fee-list">
                      {categorizedFees.past.map(fee => renderFeeCard(fee, true))}
                    </div>
                  </div>
                ) : (
                  <div className="tuition-fee-empty-state">
                    <FontAwesomeIcon icon="check-circle" />
                    <h3>No overdue tuition fee</h3>
                    <p>You don't have any overdue tuition fee to pay. Good job!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TuitionFeePage;
