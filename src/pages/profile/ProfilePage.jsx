import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfilePage.module.css';
import { useUser } from '../../contexts/UserContext';
import ChildProfileManagement from './ChildProfileManagement';
import ChangePasswordForm from './ChangePasswordForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../services/ProfileService';

const Toast = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for exit animation to complete
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <div className={`${styles.toastMessage} ${type} ${isExiting ? 'exiting' : ''}`}>
      <div className={`${styles.toastIcon} ${type}`}>
        {type === 'success' ? (
          <FontAwesomeIcon icon="check-circle" size="lg" />
        ) : (
          <FontAwesomeIcon icon="exclamation-circle" size="lg" />
        )}
      </div>
      <div className={styles.toastContent}>
        <h4 className={styles.toastTitle}>
          {type === 'success' ? 'Success!' : 'Error!'}
        </h4>
        <p>{message}</p>
      </div>
      <button className={styles.toastClose} onClick={handleClose}>
        <FontAwesomeIcon icon="times" />
      </button>
    </div>
  );
};

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
  const [updatedFields, setUpdatedFields] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const messageRef = useRef(null);
  const [communicationBookOpen, setCommunicationBookOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);

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
      // Compare what's changed to track updated fields
      const changedFields = [];
      if (formData.fullName !== currentUser?.fullName) changedFields.push('fullName');
      if (formData.phoneNumber !== currentUser?.phoneNumber) changedFields.push('phoneNumber');
      if (formData.address !== currentUser?.address) changedFields.push('address');

      // Call the API to update the user profile with address included
      await updateUserProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });

      // Update user state in context with form data
      setCurrentUser(prev => ({
        ...prev,
        ...formData
      }));

      // Set message and highlight updated fields
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      // Show toast notification
      setToast({
        show: true,
        message: 'Profile updated successfully!',
        type: 'success'
      });
      setUpdatedFields(changedFields);
      setIsEditing(false);

      // Scroll to message if it exists
      setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Clear updated fields highlight after animation completes
      setTimeout(() => {
        setUpdatedFields([]);
      }, 2000);

    } catch (error) {
      setMessage({ text: error.message || 'An error occurred while updating the profile!', type: 'error' });
      // Show toast notification for error
      setToast({
        show: true,
        message: error.message || 'An error occurred while updating the profile!',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is a parent
  const isParent = currentUser?.roleName?.toLowerCase() === 'parent';

  const openCommunicationBook = (childId) => {
    setSelectedChildId(childId);
    setCommunicationBookOpen(true);
  };

  if (contextLoading || (isLoading && !currentUser)) {
    return (
      <div className={styles.profileLoadingContainer}>
        <div className={styles.profileLoadingSpinner}></div>
        <p>Loading information...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={styles.toastContainer}>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: '' })}
          />
        </div>
      )}

      <div className={styles.profileContainer}>
        {message.text && (
          <div className={`${styles.profileMessage} ${message.type}`} ref={messageRef}>
            <div className={styles.messageIcon}>
              {message.type === 'success' ? (
                <FontAwesomeIcon icon="check-circle" size="lg" />
              ) : (
                <FontAwesomeIcon icon="exclamation-circle" size="lg" />
              )}
            </div>
            <span>{message.text}</span>
            <button className={styles.messageClose} onClick={() => setMessage({ text: '', type: '' })}>
              <FontAwesomeIcon icon="times" />
            </button>
          </div>
        )}

        <div className={styles.profileHeaderBanner}>
          <div className={styles.profileHeaderContent}>
            <h1>Personal information</h1>
            <p>Manage your personal information</p>
          </div>
        </div>

        <div className={styles.profileLayout}>
          <div className={styles.profileSidebar}>
            <div className={styles.profileAvatarSection}>
              <div className={styles.profileAvatarContainer}>
                <div className={styles.profileAvatar}>
                  {formData.fullName?.charAt(0) || 'U'}
                </div>
                <div className={styles.profileAvatarOverlay}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <h3 className={styles.profileName}>{currentUser?.fullName}</h3>
              <div className={styles.profileRoleBadge}>
                {currentUser?.roleName === 'Admin' ? 'Admin' : currentUser?.roleName === 'Staff' ? 'Staff' : currentUser?.roleName === 'Teacher' ? 'Teacher' : currentUser?.roleName === 'Parent' ? 'Parent' : 'User'}
              </div>
              <div className={styles.profileStats}>
                <div className={styles.profileStat}>
                  <div className={styles.statLabel}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Status
                  </div>
                  <div className={styles.statValue}>
                    <span className={`${styles.statusIndicator} ${styles.active}`}></span>
                    Active
                  </div>
                </div>
                <div className={styles.profileStat}>
                  <div className={styles.statLabel}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    Join date
                  </div>
                  <div className={styles.statValue}>01/01/2023</div>
                </div>
              </div>
            </div>

            <div className={styles.sidebarMenu}>
              <div
                className={`${styles.sidebarMenuItem} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                Personal profile
              </div>

              {/* Show child profiles option only for parents */}
              {isParent && (
                <div
                  className={`${styles.sidebarMenuItem} ${activeTab === 'children' ? styles.active : ''}`}
                  onClick={() => handleTabChange('children')}
                >
                  <FontAwesomeIcon icon="children" />
                  Child profile
                </div>
              )}

              <div
                className={`${styles.sidebarMenuItem} ${activeTab === 'security' ? styles.active : ''}`}
                onClick={() => handleTabChange('security')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
                Security
              </div>
            </div>
          </div>

          <div className={styles.profileContent}>
            {activeTab === 'profile' && (
              <>
                <div className={styles.contentHeader}>
                  <h2>Personal profile details</h2>
                  {!isEditing ? (
                    <button className={styles.editProfileBtn} onClick={() => setIsEditing(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                      Edit profile
                    </button>
                  ) : (
                    <div className={styles.editActions}>
                      <button
                        type="button"
                        className={styles.cancelEditBtn}
                        onClick={() => setIsEditing(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.saveProfileBtn}
                        onClick={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className={styles.btnSpinner}></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            Save changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <form className={styles.profileForm} onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
                  <div className={styles.formSection}>
                    <h3 className={styles.profileSectionTitle}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Basic information
                    </h3>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="fullName">Full name</label>
                        {isEditing ? (
                          <div className={styles.inputWithIcon}>
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
                          <div className={styles.profileData}>
                            <span className={updatedFields.includes('fullName') ? styles.fieldUpdated : ''}>
                              {currentUser?.fullName || "—"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <div className={styles.inputWithIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled
                            className={styles.readonlyField}
                            title="Email cannot be changed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <h3 className={styles.profileSectionTitle}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      Contact information
                    </h3>

                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor="phoneNumber">Phone number</label>
                        {isEditing ? (
                          <div className={styles.inputWithIcon}>
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
                          <div className={styles.profileData}>
                            <span className={updatedFields.includes('phoneNumber') ? styles.fieldUpdated : ''}>
                              {currentUser?.phoneNumber || "—"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="address">Address</label>
                        {isEditing ? (
                          <div className={styles.inputWithIcon}>
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
                          <div className={styles.profileData}>
                            <span className={updatedFields.includes('address') ? styles.fieldUpdated : ''}>
                              {currentUser?.address || "—"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}

            {/* Child Profile Management */}
            {activeTab === 'children' && isParent && <ChildProfileManagement openCommunicationBook={openCommunicationBook} />}

            {/* Security Tab - Now includes change password functionality */}
            {activeTab === 'security' && (
              <div className={styles.securitySection}>
                <div className={styles.contentHeader}>
                  <h2>Account security</h2>
                </div>
                <div className={styles.securitySettings}>
                  <ChangePasswordForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Communication Book Modal */}
      {communicationBookOpen && (
        <ChildCommunicationBook
          isOpen={communicationBookOpen}
          onClose={() => setCommunicationBookOpen(false)}
          childId={selectedChildId}
        />
      )}
    </>
  );
};

export default ProfilePage;
