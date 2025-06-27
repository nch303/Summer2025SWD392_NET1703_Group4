import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ProfilePage.css';
import { changePassword } from './ProfileService';

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
    
    // Xóa lỗi khi người dùng nhập lại
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
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      const score = validatePassword(passwordData.newPassword);
      if (score < 4) {
        newErrors.newPassword = 'Vui lòng tạo mật khẩu mạnh hơn đáp ứng các yêu cầu';
      }
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      // Gọi API thay đổi mật khẩu
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Hiển thị thông báo thành công
      setMessage({
        text: 'Đổi mật khẩu thành công!',
        type: 'success'
      });
      
      // Reset form sau khi thành công
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Hiển thị thông báo thất bại
      setMessage({
        text: error.message || 'Đổi mật khẩu không thành công. Vui lòng kiểm tra lại mật khẩu hiện tại.',
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
          <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
          <div className="input-with-icon password-input">
            <FontAwesomeIcon icon="lock" />
            <input
              type={showPassword.currentPassword ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu hiện tại"
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
          <label htmlFor="newPassword">Mật khẩu mới *</label>
          <div className="input-with-icon password-input">
            <FontAwesomeIcon icon="lock" />
            <input
              type={showPassword.newPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu mới"
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
                  className={`change-password-password-bar ${
                    passwordScore === 0 ? 'strength-none' :
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
                {passwordScore === 0 ? 'Độ mạnh mật khẩu' :
                 passwordScore === 1 ? 'Yếu' :
                 passwordScore === 2 ? 'Trung bình' :
                 passwordScore === 3 ? 'Khá' :
                 passwordScore === 4 ? 'Mạnh' :
                 passwordScore === 5 ? 'Rất mạnh' : ''}
              </span>
            </div>
          )}
          
          <div className="password-requirements">
            <p>Mật khẩu phải có:</p>
            <ul>
              <li className={passwordStrength.length ? 'valid' : ''}>
                Ít nhất 8 ký tự
              </li>
              <li className={passwordStrength.uppercase ? 'valid' : ''}>
                Ít nhất một chữ hoa (A-Z)
              </li>
              <li className={passwordStrength.lowercase ? 'valid' : ''}>
                Ít nhất một chữ thường (a-z)
              </li>
              <li className={passwordStrength.number ? 'valid' : ''}>
                Ít nhất một chữ số (0-9)
              </li>
              <li className={passwordStrength.special ? 'valid' : ''}>
                Ít nhất một ký tự đặc biệt (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
          <div className="input-with-icon password-input">
            <FontAwesomeIcon icon="lock" />
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu mới"
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
                Đang xử lý...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="key" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm; 