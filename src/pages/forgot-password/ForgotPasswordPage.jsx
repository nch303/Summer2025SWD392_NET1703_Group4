import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { requestPasswordReset } from './ForgotPasswordService';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Gọi API quên mật khẩu
      await requestPasswordReset(email);
      
      // Chuyển sang trạng thái đã gửi thành công
      setIsSubmitted(true);
    } catch (error) {
      setError(error.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
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
          <div className="login-header">
            <div className="login-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.75 9v.704c0 1.245-.982 2.243-2.25 2.243h-1.624l-1.32 4.5H12.75v-1.5h-1.5V18h-3l.459-1.505H7.125c-1.269 0-2.25-.999-2.25-2.246V9A2.25 2.25 0 017.125 6.75h9.5A2.25 2.25 0 0118.75 9zm-10.5 6h1.5v-1.5h-1.5V15zm0-4.5V12h1.5v-1.5h-1.5zm6-1.5h-1.5V12h1.5v-1.5zm-3-3h-1.5V9h1.5V6z" />
              </svg>
            </div>
            <h1 className="login-title">Reset Your Password</h1>
            <p className="login-subtitle">Enter your email to get a reset link</p>
            <div className="color-dots">
              <div className="dot dot-red"></div>
              <div className="dot dot-yellow"></div>
              <div className="dot dot-green"></div>
              <div className="dot dot-blue"></div>
              <div className="dot dot-purple"></div>
            </div>
          </div>
          
          {error && (
            <div className="login-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="reset-success">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="success-icon">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <h3>Check your inbox</h3>
              <p>We've sent a password reset link to {email}</p>
              <div className="login-options">
                <Link to={ROUTES.LOGIN} className="back-to-login">
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-input-group">
                <label className="login-label" htmlFor="email">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  className="login-input"
                  placeholder="your-email@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="login-options forgot-footer">
                <Link to={ROUTES.LOGIN} className="back-to-login">
                  Back to login
                </Link>
                <Link to={ROUTES.REGISTER} className="register-link">
                  Create an account
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

export default ForgotPasswordPage;