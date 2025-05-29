import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../shared/components/navbar/NavbarService';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setFormData({
          name: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          address: userData?.address || '',
          bio: userData?.bio || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
    setEmailError('');
  };

  const openEmailModal = () => {
    setNewEmail(formData.email);
    setEmailError('');
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(newEmail)) {
      setEmailError('Vui lòng nhập đúng định dạng email.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Trong ứng dụng thực tế, bạn sẽ gọi API để cập nhật email
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Cập nhật email trong state
      setFormData(prev => ({
        ...prev,
        email: newEmail
      }));
      
      setUser(prev => ({
        ...prev,
        email: newEmail
      }));
      
      setMessage({ text: 'Email đã được cập nhật thành công!', type: 'success' });
      closeEmailModal();
    } catch (error) {
      setEmailError('Có lỗi xảy ra khi cập nhật email. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, you would call an API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local user state with form data
      setUser(prev => ({
        ...prev,
        ...formData
      }));
      
      setMessage({ text: 'Hồ sơ đã được cập nhật thành công!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ text: 'Có lỗi xảy ra khi cập nhật hồ sơ!', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Đang tải...</p>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="profile-paper">
        <div className="profile-header">
          <h1 className="profile-title">Hồ Sơ Người Dùng</h1>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            <svg className="message-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              {message.type === 'success' ? (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              )}
            </svg>
            {message.text}
          </div>
        )}

        <div className="profile-content">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-avatar-container">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar">
                      {formData.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="profile-role">
                    {user?.role === 'admin' ? 'Quản Trị Viên' : 'Phụ Huynh'}
                  </div>
                </div>

                <div className="profile-details">
                  <div className="details-section">
                    <h3 className="section-title">Thông Tin Cá Nhân</h3>
                    
                    <div className="details-grid">
                      <div className={`profile-field ${isEditing ? 'editing' : ''}`}>
                        <div className="field-label">
                          <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          Họ Tên
                        </div>
                        <div className="field-value">
                          {isEditing ? (
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="profile-input"
                              required
                            />
                          ) : (
                            <span>{user?.name}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`profile-field ${isEditing ? 'editing' : ''}`}>
                        <div className="field-label">
                          <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                          Email
                        </div>
                        <div className="field-value email-field-value">
                          {isEditing ? (
                            <div className="email-input-container">
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                className="profile-input disabled"
                                disabled
                              />
                              <button 
                                type="button" 
                                className="change-email-button"
                                onClick={openEmailModal}
                              >
                                Thay đổi
                              </button>
                            </div>
                          ) : (
                            <div className="email-display">
                              <span>{user?.email}</span>
                              <button 
                                type="button" 
                                className="change-email-button"
                                onClick={openEmailModal}
                              >
                                Thay đổi
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`profile-field ${isEditing ? 'editing' : ''}`}>
                        <div className="field-label">
                          <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                          </svg>
                          Số Điện Thoại
                        </div>
                        <div className="field-value">
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="profile-input"
                            />
                          ) : (
                            <span>{user?.phone || "-"}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`profile-field ${isEditing ? 'editing' : ''}`}>
                        <div className="field-label">
                          <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          Địa Chỉ
                        </div>
                        <div className="field-value">
                          {isEditing ? (
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              className="profile-input"
                            />
                          ) : (
                            <span>{user?.address || "-"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="details-section">
                    <h3 className="section-title">Thông Tin Bổ Sung</h3>
                    <div className={`bio-field ${isEditing ? 'editing' : ''}`}>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows="4"
                          className="profile-textarea"
                        />
                      ) : (
                        <div className="bio-content">
                          <p>{user?.bio || "Chưa có thông tin bổ sung."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="profile-actions-container">
                    {!isEditing ? (
                      <button 
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="profile-edit-button"
                      >
                        <span className="button-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </span>
                        <span className="button-text">Chỉnh Sửa</span>
                      </button>
                    ) : (
                      <div className="profile-edit-actions">
                        <button 
                          type="submit"
                          className="profile-save-button"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner"></span>
                              <span>Đang Lưu...</span>
                            </>
                          ) : (
                            <>
                              <span className="button-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                              </span>
                              <span className="button-text">Lưu</span>
                            </>
                          )}
                        </button>
                        <button 
                          type="button"
                          className="profile-cancel-button"
                          onClick={() => setIsEditing(false)}
                          disabled={isLoading}
                        >
                          <span className="button-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                            </svg>
                          </span>
                          <span className="button-text">Hủy</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal thay đổi email */}
      {showEmailModal && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <div className="email-modal-header">
              <h3>Thay Đổi Email</h3>
              <button type="button" className="modal-close-button" onClick={closeEmailModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEmailSubmit} className="email-modal-form">
              <div className="email-modal-content">
                <div className="form-group">
                  <label htmlFor="newEmail">Email Mới</label>
                  <input
                    type="email"
                    id="newEmail"
                    name="newEmail"
                    value={newEmail}
                    onChange={handleEmailChange}
                    className={`modal-input ${emailError ? 'input-error' : ''}`}
                    placeholder="Nhập email mới của bạn"
                    required
                  />
                  {emailError && <div className="error-text">{emailError}</div>}
                </div>
                <p className="email-note">
                  <svg className="note-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  Sau khi thay đổi email, bạn sẽ cần xác nhận email mới của mình.
                </p>
              </div>
              <div className="email-modal-actions">
                <button 
                  type="submit" 
                  className="email-save-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang Lưu...</span>
                    </>
                  ) : "Lưu Email Mới"}
                </button>
                <button 
                  type="button" 
                  className="email-cancel-button"
                  onClick={closeEmailModal}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
