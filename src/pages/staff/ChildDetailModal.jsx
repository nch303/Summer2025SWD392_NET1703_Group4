import React, { useState } from 'react';
import './ChildDetailModal.css';

const ChildDetailModal = ({ isOpen, onClose, child }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!isOpen || !child) return null;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate age
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get gender display
  const getGenderDisplay = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      default: return 'Other';
    }
  };
  
  // Open image in fullscreen modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  return (
    <>
      <div className="staff-children-modal-overlay" onClick={onClose}>
        <div className="staff-children-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="staff-children-modal-header">
            <h2>
              <i className="fas fa-user-circle"></i>
              Student details
            </h2>
            <button className="staff-children-close-modal" onClick={onClose} aria-label="Close">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="staff-children-modal-content">
            <div className="staff-children-child-profile">
              <div className="staff-children-avatar-container">
                {child.avatar ? (
                  <img 
                    src={child.avatar} 
                    alt={`Avatar of ${child.name}`} 
                    className="staff-children-avatar-large"
                    onClick={() => openImageModal(child.avatar)}
                    onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                  />
                ) : (
                  <div className="staff-children-avatar-placeholder-large">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {child.avatar && (
                  <div className="staff-children-zoom-hint">
                    <i className="fas fa-search-plus"></i>
                  </div>
                )}
              </div>
              
              <div className="staff-children-child-info">
                <div className="staff-children-name-badge">
                  <h3>{child.name}</h3>
                  <span className={`staff-children-gender-tag ${child.gender?.toLowerCase()}`}>
                    {getGenderDisplay(child.gender)}
                  </span>
                </div>
                
                <div className="staff-children-info-badges">
                  <div className="staff-children-info-badge">
                    <i className="fas fa-birthday-cake"></i>
                    <div className="staff-children-info-badge-text">
                      <span className="staff-children-badge-label">Birthday</span>
                      <span className="staff-children-badge-value">{formatDate(child.birthday)}</span>
                    </div>
                  </div>
                  <div className="staff-children-info-badge">
                    <i className="fas fa-child"></i>
                    <div className="staff-children-info-badge-text">
                      <span className="staff-children-badge-label">Age</span>
                      <span className="staff-children-badge-value">{calculateAge(child.birthday)} years</span>
                    </div>
                  </div>
                  <div className="staff-children-info-badge">
                    <i className="fas fa-map-marker-alt"></i>
                    <div className="staff-children-info-badge-text">
                      <span className="staff-children-badge-label">City</span>
                      <span className="staff-children-badge-value">{child.city || 'Not specified'}</span>
                    </div>
                  </div>
                  <div className="staff-children-info-badge">
                    <i className="fas fa-id-badge"></i>
                    <div className="staff-children-info-badge-text">
                      <span className="staff-children-badge-label">ID</span>
                      <span className="staff-children-badge-value staff-children-id-value">{child.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="staff-children-tabs">
              <div className="staff-children-tab active">
                <i className="fas fa-info-circle"></i>
                <span>Detail</span>
              </div>
            </div>
            
            <div className="staff-children-info-section">
              <h4><i className="fas fa-user-friends"></i> Parent information</h4>
              <div className="staff-children-info-cards">
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Name</div>
                    <div className="staff-children-info-card-value">{child.parentName || 'Not specified'}</div>
                  </div>
                </div>
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Phone number</div>
                    <div className="staff-children-info-card-value">{child.phoneNumber || 'Not specified'}</div>
                  </div>
                </div>
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Parent ID</div>
                    <div className="staff-children-info-card-value">{child.parentID || 'Not specified'}</div>
                  </div>
                </div>
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Address</div>
                    <div className="staff-children-info-card-value">{child.address || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="staff-children-info-section">
              <h4><i className="fas fa-id-card"></i> Birth certificate</h4>
              <div className="staff-children-document-container">
                {child.birthCertificate ? (
                  <div className="staff-children-document-preview" onClick={() => openImageModal(child.birthCertificate)}>
                    <img 
                      src={child.birthCertificate} 
                      alt="Birth certificate" 
                      className="staff-children-certificate"
                      onError={(e) => { e.target.src = '/images/no-document.png'; }}
                    />
                    <div className="staff-children-document-overlay">
                      <div className="staff-children-document-overlay-content">
                        <i className="fas fa-search-plus"></i>
                        <span>Click to view</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="staff-children-no-document">
                    <i className="fas fa-file-alt"></i>
                    <p>No birth certificate</p>
                    <button className="staff-children-upload-btn">
                      <i className="fas fa-upload"></i> Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="staff-children-modal-footer">
            <button className="staff-children-action-button secondary" onClick={onClose}>
              <i className="fas fa-times"></i> Close
            </button>
            <button className="staff-children-action-button primary">
              <i className="fas fa-edit"></i> Edit
            </button>
          </div>
        </div>
      </div>
      
      {/* Full screen image modal */}
      {isImageModalOpen && selectedImage && (
        <div className="staff-children-fullscreen-overlay" onClick={() => setIsImageModalOpen(false)}>
          <div className="staff-children-fullscreen-actions">
            <button className="staff-children-fullscreen-close" onClick={() => setIsImageModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="staff-children-fullscreen-image-container">
            <img 
              src={selectedImage} 
              alt="View details" 
              className="staff-children-fullscreen-image" 
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { e.target.src = '/images/no-document.png'; }}
            />
          </div>
          <div className="staff-children-image-caption">
            Click
          </div>
        </div>
      )}
    </>
  );
};

export default ChildDetailModal;