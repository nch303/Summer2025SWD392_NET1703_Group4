import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { loginUser } from '../../services/AuthService';
import { ROUTES } from '../../constants/routes';
import styles from './LoginPage.module.css';
import { useCustomToast } from '../../components/toast/CustomToast';
import { useUser } from '../../contexts/UserContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useCustomToast();
  const { fetchCurrentUser, setLoggedInUser } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hasShownErrorToast = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset error state when user types in fields
    if (error) {
      setError('');
      // Reset the toast shown flag when user makes changes
      hasShownErrorToast.current = false;
    }
  };

  // Function to determine redirect path based on user role
  const getRedirectPath = (userRole) => {
    // Make sure we're working with a string and trim any whitespace
    const role = userRole?.trim() || '';
    
    // Case-insensitive comparison
    switch (role.toLowerCase()) {
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD || '/admin';
      case 'teacher':
        return ROUTES.TEACHER_DASHBOARD || '/teacher';
      case 'staff':
        return ROUTES.STAFF_DASHBOARD || '/staff';
      default:
        return ROUTES.HOME || '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Reset toast flag on new submission
    hasShownErrorToast.current = false;
    
    try {
      // Đăng nhập để lấy token
      const result = await loginUser(formData.email, formData.password);
      
      if (result && result.token) {
        // Cập nhật trạng thái người dùng ngay lập tức với token mới nhận
        const token = result.token;
        
        // Nếu kết quả đã có thông tin user, cập nhật luôn
        if (result.user) {
          setLoggedInUser(result.user, token);
          
          // Điều hướng người dùng dựa vào role
          const redirectPath = getRedirectPath(result.user.roleName);
          toast.success('Đăng nhập thành công!', {
            duration: 2000
          });
          
          // Chuyển hướng người dùng sau khi hiển thị thông báo
          setTimeout(() => {
            navigate(redirectPath);
          }, 1000);
        } else {
          // Nếu không có thông tin user từ API login, fetch lại
          const userData = await fetchCurrentUser();
          
          if (userData) {
            // Điều hướng người dùng dựa vào role
            const redirectPath = getRedirectPath(userData.roleName);
            toast.success('Đăng nhập thành công!', {
              duration: 2000
            });
            
            // Chuyển hướng người dùng sau khi hiển thị thông báo
            setTimeout(() => {
              navigate(redirectPath);
            }, 1000);
          }
        }
      } else {
        throw new Error('Login failed. No token received.');
      }
    } catch (error) {
      setError(error.message);
      
      // Only show toast if we haven't already shown one for this error
      if (!hasShownErrorToast.current) {
        // Hiển thị thông báo đặc biệt nếu tài khoản chưa kích hoạt
        if (error.message.includes("Account is not activated. Please check your email.")) {
          toast.error(error.message, {
            duration: 5000  // Hiển thị lâu hơn để người dùng có thời gian đọc
          });
        } else {
          toast.error(error.message || 'Login failed. Please try again.');
        }
        
        // Mark that we've shown the toast
        hasShownErrorToast.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Processing Spinner */}
      <ProcessingSpinner isVisible={isLoading} message="Signing in..." />
      
      {/* Day-night gradient separator */}
      <div className={styles.dayNightSeparator}></div>
      
      {/* Top rainbow decoration */}
      <div className={`${styles.loginRainbow} ${styles.topRainbow}`}></div>
      
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
        
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.loginLogo}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
              <h1 className={styles.loginTitle}>Welcome to Little Stars</h1>
            <p className={styles.loginSubtitle}>Sign in to your account</p>
            <div className={styles.colorDots}>
              <div className={`${styles.dot} ${styles.dotRed}`}></div>
              <div className={`${styles.dot} ${styles.dotYellow}`}></div>
              <div className={`${styles.dot} ${styles.dotGreen}`}></div>
              <div className={`${styles.dot} ${styles.dotBlue}`}></div>
              <div className={`${styles.dot} ${styles.dotPurple}`}></div>
            </div>
          </div>
          
          {error && (
            <div className={styles.loginError}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.loginInputGroup}>
              <label className={styles.loginLabel} htmlFor="email">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Email Address
              </label>
              <input
                id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
                className={styles.loginInput}
                placeholder="your-email@example.com"
            required
          />
            </div>
            
            <div className={styles.loginInputGroup}>
              <label className={styles.loginLabel} htmlFor="password">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                Password
              </label>
              <input
                id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
                className={styles.loginInput}
                placeholder="Enter your password"
            required
          />
            </div>
          
            <div className={styles.loginOptions}>
              <div className={styles.loginRemember}>
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                  className={styles.rememberCheckbox}
              />
                  <label htmlFor="rememberMe" className={styles.rememberLabel}>
                Remember me
              </label>
            </div>

              <Link to={ROUTES.FORGOT_PASSWORD} className={styles.forgotLink}>
                Forgot password?
              </Link>
          </div>

            <button
            type="submit"
              className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            
            <div className={styles.loginRegister}>
              <span>New to Little Stars?</span>
              <Link to={ROUTES.REGISTER} className={styles.registerLink}>
                Create an account
              </Link>
            </div>
        </form>
        </div>
      </div>
      
      {/* Bottom rainbow decoration */}
      <div className={`${styles.loginRainbow} ${styles.bottomRainbow}`}></div>
    </div>
  );
};

export default LoginPage;
