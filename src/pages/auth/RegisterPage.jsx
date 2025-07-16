import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProcessingSpinner } from '../../components/ProcessingSpinner';
import styles from './RegisterPage.module.css';
import { registerUser } from '../../services/AuthService';
import { useCustomToast } from '../../components/CustomToast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useCustomToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Password validation states
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordScore, setPasswordScore] = useState(0);

  // Add these state variables at the top of your component with other state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check password strength whenever password changes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check password strength before submission
    const score = validatePassword(formData.password);
    if (score < 4) {
      setError('Please create a stronger password');
      toast.error('Please create a stronger password that meets all requirements');
      return;
    }
    
    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      toast.error('Passwords do not match!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the registration service
      await registerUser(formData);
      
      // Show success message with toast
      toast.success("Registration successful! Please check your email and verify your account.", {
        position: 'top-right',
        duration: 3000
      });
      
      // Delay navigation to allow user to see the toast
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // First let's create a function to check if the form is valid
  const isFormValid = () => {
    // Check if all required fields are filled
    const requiredFieldsFilled = formData.name && 
                                 formData.email && 
                                 formData.phone && 
                                 formData.password && 
                                 formData.confirmPassword;
    
    // Check if password is strong enough (score >= 4)
    const isPasswordStrong = passwordScore >=5
    
    // Only check required fields and password strength, not matching
    return requiredFieldsFilled && isPasswordStrong;
  };

  return (
    <div className={styles.registerPage}>
      {/* Processing Spinner */}
      <ProcessingSpinner isVisible={isLoading} message="Signing up..." />
      
      <toast.ToastContainer position="top-right" />
      
      {/* Day-night gradient separator */}
      <div className={styles.dayNightSeparator}></div>
      
      {/* Top rainbow decoration */}
      <div className={`${styles.registerRainbow} ${styles.topRainbow}`}></div>
      
      {/* Sun with rotating rays */}
      <div className={styles.sunElement}>
        <div className={styles.sunRaysContainer}>
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
      
      {/* Birds in corners */}
      <div className={`${styles.registerBird} ${styles.bird1}`}></div>
      <div className={`${styles.registerBird} ${styles.bird2}`}></div>
      
      <div className={styles.registerContainer}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <div className={styles.registerLogo}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
            </div>
            <h1 className={styles.registerTitle}>Join Little Stars</h1>
            <p className={styles.registerSubtitle}>Create your account to get started!</p>
            <div className={styles.colorDots}>
              <div className={`${styles.dot} ${styles.dotRed}`}></div>
              <div className={`${styles.dot} ${styles.dotYellow}`}></div>
              <div className={`${styles.dot} ${styles.dotGreen}`}></div>
              <div className={`${styles.dot} ${styles.dotBlue}`}></div>
              <div className={`${styles.dot} ${styles.dotPurple}`}></div>
            </div>
          </div>
          
          {error && (
            <div className={styles.registerError}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form className={styles.registerForm} onSubmit={handleSubmit}>
            <div className={styles.formInputGroup}>
              <label className={styles.formLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                Full Name <span className={styles.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className={styles.formInputGroup}>
              <label className={styles.formLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Email Address <span className={styles.requiredStar}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="your-email@example.com"
                required
              />
            </div>
            
            <div className={styles.formInputGroup}>
              <label className={styles.formLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                Phone Number <span className={styles.requiredStar}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div className={styles.formInputGroup}>
              <label className={styles.formLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
                Password <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Create a password"
                  required
                />
                <button 
                  type="button"
                  className={styles.passwordToggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password.length > 0 && (
                <>
                  <div className={styles.passwordStrengthContainer}>
                    <div className={styles.registerPasswordStrengthMeter}>
                      <div 
                        className={`${styles.registerPasswordStrengthBar} ${
                          passwordScore === 0 ? styles.strengthNone :
                          passwordScore === 1 ? styles.strengthWeak :
                          passwordScore === 2 ? styles.strengthFair :
                          passwordScore === 3 ? styles.strengthGood :
                          passwordScore >= 4 ? styles.strengthStrong : ''
                        }`}
                        style={{ width: `${passwordScore * 20}%` }}
                      ></div>
                    </div>
                    <span className={styles.passwordStrengthText}>
                      {passwordScore === 0 ? 'Password strength' :
                       passwordScore === 1 ? 'Weak' :
                       passwordScore === 2 ? 'Fair' :
                       passwordScore === 3 ? 'Good' :
                       passwordScore === 4 ? 'Strong' :
                       passwordScore === 5 ? 'Very Strong' : ''}
                    </span>
                  </div>
                  
                  {/* Password requirements */}
                  <div className={styles.passwordRequirements}>
                    <p className={styles.requirementsTitle}>Password must include:</p>
                    <ul className={styles.requirementsList}>
                      <li className={passwordStrength.length ? styles.met : ''}>
                        At least 8 characters
                      </li>
                      <li className={passwordStrength.uppercase ? styles.met : ''}>
                        At least one uppercase letter (A-Z)
                      </li>
                      <li className={passwordStrength.lowercase ? styles.met : ''}>
                        At least one lowercase letter (a-z)
                      </li>
                      <li className={passwordStrength.number ? styles.met : ''}>
                        At least one number (0-9)
                      </li>
                      <li className={passwordStrength.special ? styles.met : ''}>
                        At least one special character (e.g. !@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            <div className={styles.formInputGroup}>
              <label className={styles.formLabel}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
                Confirm Password <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.passwordInputContainer}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Confirm your password"
                  required
                />
                <button 
                  type="button"
                  className={styles.passwordToggleBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className={`${styles.registerButton} ${!isFormValid() ? styles.disabledButton : ''}`}
              disabled={!isFormValid()}
            >
              <span>Join The Adventure!</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </button>
          </form>
          
          <div className={styles.registerFooter}>
            <p>Already have an account?</p>
            <Link to="/login" className={styles.loginLink}>
              Sign In
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom rainbow decoration */}
      <div className={`${styles.registerRainbow} ${styles.bottomRainbow}`}></div>
    </div>
  );
};

export default RegisterPage;
