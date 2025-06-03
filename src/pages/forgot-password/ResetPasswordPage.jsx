import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { resetPassword } from './ResetPasswordService';
import './ResetPasswordPage.css';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useCustomToast();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password validation states
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordScore, setPasswordScore] = useState(0);
  
  // Check token exists on load
  useEffect(() => {
    if (!token) {
      setError('No reset token found. Please request a new password reset link.');
    }
  }, [token]);
  
  // Check password strength when password changes
  useEffect(() => {
    validatePassword(formData.password);
  }, [formData.password]);
  
  // Validate password strength
  const validatePassword = (password) => {
    const strength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordStrength(strength);
    
    // Calculate password score (0-5)
    const score = Object.values(strength).filter(Boolean).length;
    setPasswordScore(score);
    
    return score;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset error state when user types
    if (error) setError('');
  };
  
  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    
    if (passwordScore < 4) {
      setError('Mật khẩu không đủ mạnh. Vui lòng đáp ứng ít nhất 4 tiêu chí');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp');
      return false;
    }
    
    return true;
  };
  
  const getPasswordStrengthClass = () => {
    if (passwordScore === 0) return '';
    if (passwordScore === 1) return 'very-weak';
    if (passwordScore === 2) return 'weak';
    if (passwordScore === 3) return 'medium';
    if (passwordScore === 4) return 'strong';
    return 'very-strong';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, formData.password);
      setIsSuccess(true);
      toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const isFormValid = () => {
    // Kiểm tra các trường bắt buộc có giá trị
    const fieldsNotEmpty = formData.password && formData.confirmPassword;
    
    // Kiểm tra mật khẩu đủ mạnh (score >= 4)
    const isPasswordStrong = passwordScore >= 4;
    
    // Kiểm tra xác nhận mật khẩu khớp
    const passwordsMatch = formData.password === formData.confirmPassword;
    
    return fieldsNotEmpty && isPasswordStrong && passwordsMatch;
  };
  
  return (
    <div className="login-page">
      {/* Day-night gradient separator */}
      <div className="day-night-separator"></div>
      
      {/* Top rainbow decoration */}
      <div className="login-rainbow top-rainbow"></div>
      
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
        
      <div className="login-container">
        <div className="login-card">
          {!isSuccess && (
            <div className="login-header">
              <div className="login-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17a2 2 0 0 0 2-2c0-.28-.05-.54-.16-.78l3.58-3.58A2 2 0 1 0 16 8.22l-3.58 3.58c-.24-.1-.5-.16-.78-.16a2 2 0 1 0 0 4zm6-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM6 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                  <path d="M18 8.83V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2.83l-1 1V18H8.83c-.42 0-.83-.17-1.12-.47l-.71-.7c-.3-.3-.47-.7-.47-1.13V8.3c0-.42.17-.83.47-1.13l.71-.7c.3-.3.7-.47 1.12-.47H16c.55 0 1 .45 1 1v2.17l1-1z" />
                </svg>
              </div>
              <h1 className="login-title">Đặt lại mật khẩu</h1>
              <p className="login-subtitle">Nhập mật khẩu mới của bạn</p>
              <div className="color-dots">
                <div className="dot dot-red"></div>
                <div className="dot dot-yellow"></div>
                <div className="dot dot-green"></div>
                <div className="dot dot-blue"></div>
                <div className="dot dot-purple"></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="login-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="reset-success-animation">
              <div className="success-checkmark">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <h3 className="reset-success-title">Đặt lại mật khẩu thành công!</h3>
              <p className="reset-success-message">Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.</p>
              <Link to={ROUTES.LOGIN} className="login-link-button">
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label className="login-label" htmlFor="password">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                  Mật khẩu mới
                </label>
                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="login-input"
                    placeholder="Nhập mật khẩu mới"
                    minLength="8"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="password-rules">
                  <div className="password-strength-container">
                    <div className="password-strength-meter">
                      <div 
                        className={`password-strength-bar ${getPasswordStrengthClass()}`}
                      ></div>
                    </div>
                    <span className="password-strength-text">
                      {passwordScore === 0 ? 'Độ mạnh mật khẩu' :
                       passwordScore === 1 ? 'Rất yếu' :
                       passwordScore === 2 ? 'Yếu' :
                       passwordScore === 3 ? 'Trung bình' :
                       passwordScore === 4 ? 'Mạnh' :
                       passwordScore === 5 ? 'Rất mạnh' : ''}
                    </span>
                  </div>
                  
                  <div className="password-requirements">
                    <p className="requirements-title">Mật khẩu phải bao gồm:</p>
                    <ul className="requirements-list">
                      <li className={passwordStrength.length ? 'met' : ''}>
                        Ít nhất 8 ký tự
                      </li>
                      <li className={passwordStrength.uppercase ? 'met' : ''}>
                        Ít nhất 1 chữ cái viết hoa (A-Z)
                      </li>
                      <li className={passwordStrength.lowercase ? 'met' : ''}>
                        Ít nhất 1 chữ cái viết thường (a-z)
                      </li>
                      <li className={passwordStrength.number ? 'met' : ''}>
                        Ít nhất 1 số (0-9)
                      </li>
                      <li className={passwordStrength.special ? 'met' : ''}>
                        Ít nhất 1 ký tự đặc biệt (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="login-input-group">
                <label className="login-label" htmlFor="confirmPassword">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-8.9 6c0 .83-.34 1.58-.88 2.12C7.76 16.71 7 17.05 6.17 17.05c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3zm6.9 5H6c-.55 0-1-.45-1-1V10c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z" />
                  </svg>
                  Xác nhận mật khẩu
                </label>
                <div className="password-field">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="login-input"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`login-button ${!isFormValid() ? 'disabled-button' : ''}`}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <ProcessingSpinner size="small" color="#ffffff" />
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
              
              <div className="login-options forgot-footer">
                <Link to={ROUTES.LOGIN} className="back-to-login">
                  Quay lại đăng nhập
                </Link>
                <Link to={ROUTES.FORGOT_PASSWORD} className="register-link">
                  Yêu cầu liên kết mới
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Bottom rainbow decoration */}
      <div className="login-rainbow bottom-rainbow"></div>
    </div>
  );
};

export default ResetPasswordPage;