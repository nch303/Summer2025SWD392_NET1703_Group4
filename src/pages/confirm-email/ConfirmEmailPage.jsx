import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmEmail } from './ConfirmEmailService';
import { ROUTES } from '../../shared/constants/routes';
import { useCustomToast } from '../../shared/components/toast/CustomToast';
import './ConfirmEmailPage.css';

const ConfirmEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useCustomToast();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const confirmAttempted = useRef(false);

  useEffect(() => {
    const confirmToken = async () => {
      if (confirmAttempted.current) return;
      
      confirmAttempted.current = true;
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No confirmation token found. Please check your email link and try again.');
        setLoading(false);
        return;
      }
      
      try {
        const result = await confirmEmail(token);
        setConfirmed(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    confirmToken();
  }, [searchParams, navigate, toast]);

  return (
    <div className="confirm-email-page">
      {/* Day-night gradient separator */}
      <div className="day-night-separator"></div>
      
      {/* Top rainbow decoration */}
      <div className="confirm-rainbow top-rainbow"></div>
      
      {/* Sun with rays */}
      <div className="sun-element">
        <div className="sun-ray-container">
          <div className="sun-ray ray-1"></div>
          <div className="sun-ray ray-2"></div>
          <div className="sun-ray ray-3"></div>
          <div className="sun-ray ray-4"></div>
          <div className="sun-ray ray-5"></div>
          <div className="sun-ray ray-6"></div>
          <div className="sun-ray ray-7"></div>
          <div className="sun-ray ray-8"></div>
        </div>
      </div>
      
      {/* Moon with craters */}
      <div className="moon-element">
        <div className="moon-crater crater-1"></div>
        <div className="moon-crater crater-2"></div>
        <div className="moon-crater crater-3"></div>
      </div>
      
      {/* Stars in the night sky */}
      <div className="stars-container">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
        <div className="star star-4"></div>
        <div className="star star-5"></div>
        <div className="star star-6"></div>
        <div className="star star-7"></div>
        <div className="star star-8"></div>
      </div>
      
      <div className="confirm-container">
        <div className="confirm-card">
          <div className="confirm-header">
            <div className="confirm-logo">
              {confirmed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              ) : loading ? (
                <div className="spinner"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              )}
            </div>
            
            <h1 className="confirm-title">
              {loading ? 'Confirming Your Email...' : 
               confirmed ? 'Email Confirmed!' : 'Confirmation Failed'}
            </h1>
            
            <p className="confirm-subtitle">
              {loading ? 'Please wait while we activate your account.' : 
               confirmed ? 'Your account has been successfully activated.' : 
               'We encountered an issue activating your account.'}
            </p>
            
            <div className="color-dots">
              <div className="dot dot-red"></div>
              <div className="dot dot-yellow"></div>
              <div className="dot dot-green"></div>
              <div className="dot dot-blue"></div>
              <div className="dot dot-purple"></div>
            </div>
          </div>
          
          {error && (
            <div className="confirm-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {!loading && (
            <div className="confirm-actions">
              {confirmed ? (
                <>
                  <button 
                    onClick={() => navigate(ROUTES.LOGIN)} 
                    className="login-button"
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigate(ROUTES.LOGIN)} 
                  className="login-button"
                >
                  Go to Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom rainbow decoration */}
      <div className="confirm-rainbow bottom-rainbow"></div>
    </div>
  );
};

export default ConfirmEmailPage;