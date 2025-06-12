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
    errorMessage: 'Giao dịch không thành công',
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
            errorMessage: paymentData.errorMessage || 'Giao dịch không thành công',
            errorCode: paymentData.errorCode || 'Unknown'
          });
        }
      } catch (error) {
        console.error('Error fetching payment details:', error);
        // If fetch fails, use default error message
        setErrorDetails({
          transactionId: invoiceId || 'Unknown',
          errorMessage: 'Không thể tìm thấy thông tin thanh toán',
          errorCode: 'Unknown'
        });
      } finally {
        setLoading(false);
        
        // Show toast notification
        toast.error("Thanh toán không thành công", { 
          description: "Đã xảy ra lỗi trong quá trình thanh toán."
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
        
        <h1 className="payment-fail-title">Thanh toán không thành công</h1>
        
        <div className="payment-fail-details">
          <p className="payment-fail-message">{errorDetails.errorMessage}</p>
          
          <div className="payment-fail-info">
            {errorDetails.transactionId !== 'Unknown' && (
              <div className="payment-fail-info-item">
                <span className="info-label">Mã giao dịch:</span>
                <span className="info-value">{errorDetails.transactionId}</span>
              </div>
            )}
            
            {errorDetails.errorCode !== 'Unknown' && (
              <div className="payment-fail-info-item">
                <span className="info-label">Mã lỗi:</span>
                <span className="info-value">{errorDetails.errorCode}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="payment-fail-help">
          <h3>Bạn có thể thử:</h3>
          <ul>
            <li>Kiểm tra thông tin thanh toán của bạn</li>
            <li>Kiểm tra tài khoản ngân hàng/thẻ của bạn</li>
            <li>Liên hệ với nhà trường để được hỗ trợ</li>
          </ul>
        </div>
        
        <div className="payment-fail-actions">
          <button 
            className="btn-payment-history" 
            onClick={goToPaymentHistory}
          >
            <i className="fas fa-history"></i> Lịch sử thanh toán
          </button>
          
          <button 
            className="btn-home" 
            onClick={goToHomePage}
          >
            <i className="fas fa-home"></i> Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
