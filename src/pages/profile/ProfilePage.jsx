import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useUser } from '../../contexts/UserContext';
import ChildProfileManagement from './ChildProfileManagement';
import ChangePasswordForm from './ChangePasswordForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { currentUser, isLoading: contextLoading, setCurrentUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Xác định activeTab từ thông tin URL
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('profile');
    }
  }, [tab]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser?.fullName || '',
        email: currentUser?.email || '',
        phoneNumber: currentUser?.phoneNumber || '',
        address: currentUser?.address || '',
        bio: currentUser?.bio || '',
      });
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleTabChange = (tabName) => {
    if (tabName === 'profile') {
      navigate('/profile');
    } else {
      navigate(`/profile/${tabName}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // In a real app, you would call an API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update user state in context with form data
      setCurrentUser(prev => ({
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

  // Check if user is a parent
  const isParent = currentUser?.roleName?.toLowerCase() === 'parent';

  if (contextLoading || (isLoading && !currentUser)) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
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

      <div className="profile-header-banner">
        <div className="profile-header-content">
          <h1>Thông tin cá nhân</h1>
          <p>Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {formData.fullName?.charAt(0) || 'U'}
              </div>
              <div className="profile-avatar-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
            <h3 className="profile-name">{currentUser?.fullName}</h3>
            <div className="profile-role-badge">
              {currentUser?.roleName === 'Admin' ? 'Quản Trị Viên' : currentUser?.roleName === 'Staff' ? 'Nhân viên' : currentUser?.roleName === 'Teacher' ? 'Giáo viên' : currentUser?.roleName === 'Parent' ? 'Phụ huynh' : 'Người dùng'}
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="stat-label">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Tình trạng
                </div>
                <div className="stat-value">
                  <span className="status-indicator active"></span>
                  Hoạt động
                </div>
              </div>
              <div className="profile-stat">
                <div className="stat-label">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  Ngày tham gia
                </div>
                <div className="stat-value">01/01/2023</div>
              </div>
            </div>
          </div>
          
          <div className="sidebar-menu">
            <div 
              className={`sidebar-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Hồ sơ cá nhân
            </div>
            
            {/* Show child profiles option only for parents */}
            {isParent && (
              <div 
                className={`sidebar-menu-item ${activeTab === 'children' ? 'active' : ''}`}
                onClick={() => handleTabChange('children')}
              >
                <FontAwesomeIcon icon="children" />
                Hồ sơ của bé
              </div>
            )}
            
            <div 
              className={`sidebar-menu-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
              </svg>
              Bảo mật
            </div>
            <div 
              className={`sidebar-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
              Cài đặt
            </div>
          </div>
        </div>
        
        <div className="profile-content">
          {activeTab === 'profile' && (
            <>
              <div className="content-header">
                <h2>Chi tiết hồ sơ</h2>
                {!isEditing ? (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Chỉnh sửa hồ sơ
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      type="button" 
                      className="cancel-edit-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </svg>
                      Hủy
                    </button>
                    <button 
                      type="button" 
                      className="save-profile-btn"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="btn-spinner"></span>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
                <div className="form-section">
                  <h3 className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Thông tin cơ bản
                  </h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="fullName">Họ và tên</label>
                      {isEditing ? (
                        <div className="input-with-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      ) : (
                        <div className="profile-data">
                          <span>{currentUser?.fullName || "—"}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      {isEditing ? (
                        <div className="input-with-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      ) : (
                        <div className="profile-data">
                          <span>{currentUser?.email || "—"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3 className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    Thông tin liên hệ
                  </h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="phoneNumber">Số điện thoại</label>
                      {isEditing ? (
                        <div className="input-with-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z" />
                          </svg>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                          />
                        </div>
                      ) : (
                        <div className="profile-data">
                          <span>{currentUser?.phoneNumber || "—"}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="address">Địa chỉ</label>
                      {isEditing ? (
                        <div className="input-with-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                          />
                        </div>
                      ) : (
                        <div className="profile-data">
                          <span>{currentUser?.address || "—"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h3 className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                    </svg>
                    Thông tin khác
                  </h3>
                  
                  <div className="form-group">
                    <label htmlFor="bio">Giới thiệu bản thân</label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Viết một vài điều về bạn..."
                      ></textarea>
                    ) : (
                      <div className="profile-data profile-bio">
                        <span>{currentUser?.bio || "—"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </>
          )}
          
          {/* Child Profile Management */}
          {activeTab === 'children' && isParent && <ChildProfileManagement />}
          
          {/* Security Tab - Now includes change password functionality */}
          {activeTab === 'security' && (
            <div className="security-section">
              <div className="content-header">
                <h2>Bảo mật tài khoản</h2>
              </div>
              <div className="security-settings">
                <div className="security-section-header">
                  <h3>
                    <FontAwesomeIcon icon="key" />
                    Thay đổi mật khẩu
                  </h3>
                  <p className="security-description">
                    Đổi mật khẩu thường xuyên để bảo vệ tài khoản của bạn tốt hơn.
                  </p>
                </div>
                <ChangePasswordForm />
              </div>
            </div>
          )}
          
          {/* Settings Tab - Placeholder */}
          {activeTab === 'settings' && (
            <div className="settings-placeholder">
              <div className="content-header">
                <h2>Cài đặt hệ thống</h2>
              </div>
              <div className="placeholder-content">
                <div className="placeholder-icon">
                  <FontAwesomeIcon icon="cog" size="3x" />
                </div>
                <h3>Tính năng đang phát triển</h3>
                <p>
                  Chức năng này sẽ sớm được ra mắt. Tại đây bạn sẽ có thể điều chỉnh ngôn ngữ, 
                  chế độ hiển thị và các thông báo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
