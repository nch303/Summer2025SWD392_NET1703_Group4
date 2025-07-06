import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmEmail } from '../../services/AuthService';
import { ROUTES } from '../../constants/routes';
import { useCustomToast } from '../../components/toast/CustomToast';
import styles from './ConfirmEmailPage.module.css';

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
    <div className={styles.confirmEmailPage}>
      {/* Day-night gradient separator */}
      <div className={styles.dayNightSeparator}></div>
      
      {/* Top rainbow decoration */}
      <div className={`${styles.confirmRainbow} ${styles.topRainbow}`}></div>
      
      {/* Sun with rays */}
      <div className={styles.sunElement}>
        <div className={styles.sunRayContainer}>
          <div className={`${styles.sunRay} ${styles.ray1}`}></div>
          <div className={`${styles.sunRay} ${styles.ray2}`}></div>
          <div className={`${styles.sunRay} ${styles.ray3}`}></div>
          <div className={`${styles.sunRay} ${styles.ray4}`}></div>
          <div className={`${styles.sunRay} ${styles.ray5}`}></div>
          <div className={`${styles.sunRay} ${styles.ray6}`}></div>
          <div className={`${styles.sunRay} ${styles.ray7}`}></div>
          <div className={`${styles.sunRay} ${styles.ray8}`}></div>
        </div>
      </div>
      
      {/* Moon with craters */}
      <div className={styles.moonElement}>
        <div className={`${styles.moonCraters} ${styles.crater1}`}></div>
        <div className={`${styles.moonCraters} ${styles.crater2}`}></div>
        <div className={`${styles.moonCraters} ${styles.crater3}`}></div>
      </div>
      
      {/* Stars in the night sky */}
      <div className={styles.starsContainer}>
        <div className={`${styles.star} ${styles.star1}`}></div>
        <div className={`${styles.star} ${styles.star2}`}></div>
        <div className={`${styles.star} ${styles.star3}`}></div>
        <div className={`${styles.star} ${styles.star4}`}></div>
        <div className={`${styles.star} ${styles.star5}`}></div>
        <div className={`${styles.star} ${styles.star6}`}></div>
        <div className={`${styles.star} ${styles.star7}`}></div>
        <div className={`${styles.star} ${styles.star8}`}></div>
      </div>
      
      <div className={styles.confirmContainer}>
        <div className={styles.confirmCard}>
          <div className={styles.confirmHeader}>
            <div className={`${styles.confirmLogo} ${confirmed ? styles.isSuccess : styles.isError}`}>
              {confirmed ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              ) : loading ? (
                <div className={styles.spinner}></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              )}
            </div>
            
            <h1 className={styles.confirmTitle}>
              {loading ? 'Confirming Your Email...' : 
               confirmed ? 'Email Confirmed!' : 'Confirmation Failed'}
            </h1>
            
            <p className={styles.confirmSubtitle}>
              {loading ? 'Please wait while we activate your account.' : 
               confirmed ? 'Your account has been successfully activated.' : 
               'We encountered an issue activating your account.'}
            </p>
            
            <div className={styles.colorDots}>
              <div className={`${styles.dot} ${styles.dotRed}`}></div>
              <div className={`${styles.dot} ${styles.dotYellow}`}></div>
              <div className={`${styles.dot} ${styles.dotGreen}`}></div>
              <div className={`${styles.dot} ${styles.dotBlue}`}></div>
              <div className={`${styles.dot} ${styles.dotPurple}`}></div>
            </div>
          </div>
          
          {error && (
            <div className={styles.confirmError}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {!loading && (
            <div className={styles.confirmActions}>
              {confirmed ? (
                <>
                  <button 
                    onClick={() => navigate(ROUTES.LOGIN)} 
                    className={styles.loginButton}
                  >
                    Back to Login
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigate(ROUTES.LOGIN)} 
                  className={styles.loginButton}
                >
                  Go to Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom rainbow decoration */}
      <div className={`${styles.confirmRainbow} ${styles.bottomRainbow}`}></div>
    </div>
  );
};

export default ConfirmEmailPage;