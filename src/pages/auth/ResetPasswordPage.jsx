import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { resetPassword } from '../../services/AuthService';
import styles from './ResetPasswordPage.module.css';
import { ProcessingSpinner } from '../../components/ProcessingSpinner';
import { useCustomToast } from '../../components/CustomToast';

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
      setError('Password must be at least 8 characters');
      return false;
    }

    if (passwordScore < 4) {
      setError('Password is not strong enough. Please meet at least 4 criteria');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Confirm password does not match');
      return false;
    }

    return true;
  };

  const getPasswordStrengthClass = () => {
    if (passwordScore === 0) return '';
    if (passwordScore === 1) return styles.veryWeak;
    if (passwordScore === 2) return styles.weak;
    if (passwordScore === 3) return styles.medium;
    if (passwordScore === 4) return styles.strong;
    return styles.veryStrong;
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
      toast.success('Reset password successfully! You can login with the new password.');
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
    <div className={styles.loginPage}>
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
        <div className={`${styles.moonCrater} ${styles.crater1}`}></div>
        <div className={`${styles.moonCrater} ${styles.crater2}`}></div>
        <div className={`${styles.moonCrater} ${styles.crater3}`}></div>
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
          {!isSuccess && (
            <div className={styles.loginHeader}>
              <div className={styles.loginLogo}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17a2 2 0 0 0 2-2c0-.28-.05-.54-.16-.78l3.58-3.58A2 2 0 1 0 16 8.22l-3.58 3.58c-.24-.1-.5-.16-.78-.16a2 2 0 1 0 0 4zm6-11a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM6 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                  <path d="M18 8.83V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2.83l-1 1V18H8.83c-.42 0-.83-.17-1.12-.47l-.71-.7c-.3-.3-.47-.7-.47-1.13V8.3c0-.42.17-.83.47-1.13l.71-.7c.3-.3.7-.47 1.12-.47H16c.55 0 1 .45 1 1v2.17l1-1z" />
                </svg>
              </div>
              <h1 className={styles.loginTitle}>Reset Password</h1>
              <p className={styles.loginSubtitle}>Enter your new password</p>
              <div className={styles.colorDots}>
                <div className={`${styles.dot} ${styles.dotRed}`}></div>
                <div className={`${styles.dot} ${styles.dotYellow}`}></div>
                <div className={`${styles.dot} ${styles.dotGreen}`}></div>
                <div className={`${styles.dot} ${styles.dotBlue}`}></div>
                <div className={`${styles.dot} ${styles.dotPurple}`}></div>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.loginError}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {isSuccess ? (
            <div className={styles.resetSuccessAnimation}>
              <div className={styles.successCheckmark}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <h3 className={styles.resetSuccessTitle}>Reset password successfully!</h3>
              <p className={styles.resetSuccessMessage}>Your password has been updated. You can login with the new password.</p>
              <Link to={ROUTES.LOGIN} className={styles.loginLinkButton}>
                Login now
              </Link>
            </div>
          ) : (
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.loginInputGroup}>
                <label className={styles.loginLabel} htmlFor="password">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                  </svg>
                  New password
                </label>
                <div className={styles.passwordField}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.loginInput}
                    placeholder="Enter new password"
                    minLength="8"
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className={styles.passwordRules}>
                  <div className={styles.passwordStrengthContainer}>
                    <div className={styles.passwordStrengthMeter}>
                      <div
                        className={`${styles.passwordStrengthBar} ${styles.strengthFill} ${getPasswordStrengthClass()}`}
                      ></div>
                    </div>
                    <span className={styles.passwordStrengthText}>
                      {passwordScore === 0 ? 'Password strength' :
                        passwordScore === 1 ? 'Very weak' :
                          passwordScore === 2 ? 'Weak' :
                            passwordScore === 3 ? 'Medium' :
                              passwordScore === 4 ? 'Strong' :
                                passwordScore === 5 ? 'Very strong' : ''}
                    </span>
                  </div>

                  <div className={styles.passwordRequirements}>
                    <p className={styles.requirementsTitle}>Password must include:</p>
                    <ul className={styles.requirementsList}>
                      <li className={passwordStrength.length ? styles.met : ''}>
                        At least 8 characters
                      </li>
                      <li className={passwordStrength.uppercase ? styles.met : ''}>
                        At least 1 uppercase letter (A-Z)
                      </li>
                      <li className={passwordStrength.lowercase ? styles.met : ''}>
                        At least 1 lowercase letter (a-z)
                      </li>
                      <li className={passwordStrength.number ? styles.met : ''}>
                        At least 1 number (0-9)
                      </li>
                      <li className={passwordStrength.special ? styles.met : ''}>
                        At least 1 special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.loginInputGroup}>
                <label className={styles.loginLabel} htmlFor="confirmPassword">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-8.9 6c0 .83-.34 1.58-.88 2.12C7.76 16.71 7 17.05 6.17 17.05c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3zm6.9 5H6c-.55 0-1-.45-1-1V10c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z" />
                  </svg>
                  Confirm password
                </label>
                <div className={styles.passwordField}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.loginInput}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`${styles.loginButton} ${!isFormValid() ? styles.disabledButton : ''}`}
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <ProcessingSpinner size="small" color="#ffffff" />
                ) : (
                  'Reset password'
                )}
              </button>

              <div className={`${styles.loginOptions} ${styles.forgotFooter}`}>
                <Link to={ROUTES.LOGIN} className={styles.backToLogin}>
                  Back to login
                </Link>
                <Link to={ROUTES.FORGOT_PASSWORD} className={styles.registerLink}>
                  Request new link
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom rainbow decoration */}
      <div className={`${styles.loginRainbow} ${styles.bottomRainbow}`}></div>
    </div>
  );
};

export default ResetPasswordPage;