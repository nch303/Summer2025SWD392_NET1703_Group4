import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCustomToast } from '../../components/toast/CustomToast';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { getPaymentDetails } from './PaymentHistoryService';
import './PaymentFail.css';

const PaymentFail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId } = useParams();
  const toast = useCustomToast();
  
  const [errorDetails, setErrorDetails] = useState({
    transactionId: '',
    errorMessage: 'Transaction failed',
    errorCode: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        if (invoiceId) {
          // Fetch payment details using the invoice ID
          const paymentData = await getPaymentDetails(invoiceId);
          
          setErrorDetails({
            transactionId: paymentData.id || invoiceId,
            errorMessage: paymentData.errorMessage || 'Transaction failed',
            errorCode: paymentData.errorCode || 'Unknown'
          });
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        // If fetch fails, use default error message
        setErrorDetails({
          transactionId: invoiceId || 'Unknown',
          errorMessage: 'Cannot find payment information',
          errorCode: 'Unknown'
        });
      } finally {
        setLoading(false);
        
        // Show toast notification
        toast.error("Transaction failed", { 
          description: "An error occurred during the payment process."
        });
      }
    };

    fetchPaymentDetails();
  }, [invoiceId, toast]);

  const goToHomePage = () => {
    navigate('/');
  };

  const goToPaymentHistory = () => {
    navigate('/payment-history');
  };

  if (loading) {
    return <ProcessingSpinner />;
  }

  return (
    <div className="payment-fail-container">
      <div className="payment-fail-card">
        <div className="payment-fail-icon">
          <i className="fas fa-times-circle"></i>
        </div>
        
        <h1 className="payment-fail-title">Transaction failed</h1>
        
        <div className="payment-fail-details">
          <p className="payment-fail-message">{errorDetails.errorMessage}</p>
          
          <div className="payment-fail-info">
            {errorDetails.transactionId !== 'Unknown' && (
              <div className="payment-fail-info-item">
                <span className="info-label">Transaction ID:</span>
                <span className="info-value">{errorDetails.transactionId}</span>
              </div>
            )}
            
            {errorDetails.errorCode !== 'Unknown' && (
              <div className="payment-fail-info-item">
                <span className="info-label">Error code:</span>
                <span className="info-value">{errorDetails.errorCode}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="payment-fail-help">
          <h3>You can try:</h3>
          <ul>
            <li>Check your payment information</li>
            <li>Check your bank account/card</li>
            <li>Contact the school for support</li>
          </ul>
        </div>
        
        <div className="payment-fail-actions">
          <button 
            className="btn-payment-history" 
            onClick={goToPaymentHistory}
          >
            <i className="fas fa-history"></i> Payment history
          </button>
          
          <button 
            className="btn-home" 
            onClick={goToHomePage}
          >
            <i className="fas fa-home"></i> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
