import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ProfilePage.css';
import { changePassword } from '../../services/ProfileService';

const ChangePasswordForm = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});

  // Password validation states
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordScore, setPasswordScore] = useState(0);

  // Check password strength whenever password changes
  useEffect(() => {
    validatePassword(passwordData.newPassword);
  }, [passwordData.newPassword]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user re-enters
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Please enter the current password';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Please enter the new password';
    } else {
      const score = validatePassword(passwordData.newPassword);
      if (score < 4) {
        newErrors.newPassword = 'Please create a stronger password that meets the requirements';
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'The confirmed password does not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to change password
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      // Show success message
      setMessage({
        text: 'Password changed successfully!',
        type: 'success'
      });

      // Reset form after success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Show failure message
      setMessage({
        text: error.message || 'Password change failed. Please check the current password.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-form">
      {message.text && (
        <div className={`profile-message ${message.type}`}>
          <div className="message-icon">
            {message.type === 'success' ? (
              <FontAwesomeIcon icon="check" />
            ) : (
              <FontAwesomeIcon icon="times" />
            )}
          </div>
          <span>{message.text}</span>
          <button className="message-close" onClick={() => setMessage({ text: '', type: '' })}>
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current password *</label>
          <div className="input-with-icon password-input">
            <FontAwesomeIcon icon="lock" />
            <input
              type={showPassword.currentPassword ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter the current password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => togglePasswordVisibility('currentPassword')}
            >
              <FontAwesomeIcon icon={showPassword.currentPassword ? "eye-slash" : "eye"} />
            </button>
          </div>
          {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New password *</label>
          <div className="input-with-icon password-input">
            <FontAwesomeIcon icon="lock" />
            <input
              type={showPassword.newPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter the new password"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => togglePasswordVisibility('newPassword')}
            >
              <FontAwesomeIcon icon={showPassword.newPassword ? "eye-slash" : "eye"} />
            </button>
          </div>
          {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}

          {/* Password strength meter */}
          {passwordData.newPassword.length > 0 && (
            <div className="password-strength-container">
              <div className="password-strength-meter">
                <div
                  className={`change-password-password-bar ${passwordScore === 0 ? 'strength-none' :
                      passwordScore === 1 ? 'strength-weak' :
                        passwordScore === 2 ? 'strength-fair' :
                          passwordScore === 3 ? 'strength-good' :
                            passwordScore === 4 ? 'strength-strong' :
                              passwordScore === 5 ? 'strength-strong' : ''
                    }`}
                  style={{ width: `${passwordScore * 20}%` }}
                ></div>
              </div>
              <span className="password-strength-text">
                {passwordScore === 0 ? 'Password strength' :
                  passwordScore === 1 ? 'Weak' :
                    passwordScore === 2 ? 'Average' :
                      passwordScore === 3 ? 'Good' :
                        passwordScore === 4 ? 'Strong' :
                          passwordScore === 5 ? 'Very strong' : ''}
              </span>
            </div>
          )}

          <div className="password-requirements">
            <p>Password must have:</p>
            <ul>
              <li className={passwordStrength.length ? 'valid' : ''}>
                At least 8 characters
              </li>
              <li className={passwordStrength.uppercase ? 'valid' : ''}>
                At least one uppercase letter (A-Z)
              </li>
              <li className={passwordStrength.lowercase ? 'valid' : ''}>
                At least one lowercase letter (a-z)
              </li>
              <li className={passwordStrength.number ? 'valid' : ''}>
                At least one number (0-9)
              </li>
              <li className={passwordStrength.special ? 'valid' : ''}>
                At least one special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm new password *</label>
          <div className="input-with-icon password-input">
            <FontAwesomeIcon icon="lock" />
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Enter the new password again"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => togglePasswordVisibility('confirmPassword')}
            >
              <FontAwesomeIcon icon={showPassword.confirmPassword ? "eye-slash" : "eye"} />
            </button>
          </div>
          {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
        </div>

        <div className="profile-form-actions">
          <button
            type="submit"
            className="save-profile-btn"
            disabled={isSubmitting || passwordScore < 4}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="key" />
                Change
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm; 