import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCustomToast } from '../../components/CustomToast';
import { ProcessingSpinner } from '../../components/ProcessingSpinner';
import { getPaymentDetails } from '../../services/PaymentHistoryService';
import styles from './PaymentFail.module.css';

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
    <div className={styles.paymentFailContainer}>
      <div className={styles.paymentFailCard}>
        <div className={styles.paymentFailIcon}>
          <i className="fas fa-times-circle"></i>
        </div>
        
        <h1 className={styles.paymentFailTitle}>Transaction failed</h1>
        
        <div className={styles.paymentFailDetails}>
          <p className={styles.paymentFailMessage}>{errorDetails.errorMessage}</p>
          
          <div className={styles.paymentFailInfo}>
            {errorDetails.transactionId !== 'Unknown' && (
              <div className={styles.paymentFailInfoItem}>
                <span className={styles.infoLabel}>Transaction ID:</span>
                <span className={styles.infoValue}>{errorDetails.transactionId}</span>
              </div>
            )}
            
            {errorDetails.errorCode !== 'Unknown' && (
              <div className={styles.paymentFailInfoItem}>
                <span className={styles.infoLabel}>Error code:</span>
                <span className={styles.infoValue}>{errorDetails.errorCode}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.paymentFailHelp}>
          <h3>You can try:</h3>
          <ul>
            <li>Check your payment information</li>
            <li>Check your bank account/card</li>
            <li>Contact the school for support</li>
          </ul>
        </div>
        
        <div className={styles.paymentFailActions}>
          <button 
            className={styles.btnPaymentHistory} 
            onClick={goToPaymentHistory}
          >
            <i className="fas fa-history"></i> Payment history
          </button>
          
          <button 
            className={styles.btnHome} 
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
