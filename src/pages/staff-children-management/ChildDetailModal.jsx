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
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
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
              Thông tin chi tiết học sinh
            </h2>
            <button className="staff-children-close-modal" onClick={onClose} aria-label="Đóng">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="staff-children-modal-content">
            <div className="staff-children-child-profile">
              <div className="staff-children-avatar-container">
                {child.avatar ? (
                  <img 
                    src={child.avatar} 
                    alt={`Ảnh đại diện của ${child.name}`} 
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
                      <span className="staff-children-badge-label">Ngày sinh</span>
                      <span className="staff-children-badge-value">{formatDate(child.birthday)}</span>
                    </div>
                  </div>
                  <div className="staff-children-info-badge">
                    <i className="fas fa-child"></i>
                    <div className="staff-children-info-badge-text">
                      <span className="staff-children-badge-label">Tuổi</span>
                      <span className="staff-children-badge-value">{calculateAge(child.birthday)} tuổi</span>
                    </div>
                  </div>
                  <div className="staff-children-info-badge">
                    <i className="fas fa-map-marker-alt"></i>
                    <div className="staff-children-info-badge-text">
                      <span className="staff-children-badge-label">Thành phố</span>
                      <span className="staff-children-badge-value">{child.city || 'Chưa cập nhật'}</span>
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
                <span>Thông tin chi tiết</span>
              </div>
            </div>
            
            <div className="staff-children-info-section">
              <h4><i className="fas fa-user-friends"></i> Thông tin phụ huynh</h4>
              <div className="staff-children-info-cards">
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Họ và tên</div>
                    <div className="staff-children-info-card-value">{child.parentName || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Số điện thoại</div>
                    <div className="staff-children-info-card-value">{child.phoneNumber || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">ID Phụ huynh</div>
                    <div className="staff-children-info-card-value">{child.parentID || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div className="staff-children-info-card">
                  <div className="staff-children-info-card-icon">
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                  <div className="staff-children-info-card-content">
                    <div className="staff-children-info-card-label">Địa chỉ</div>
                    <div className="staff-children-info-card-value">{child.city || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="staff-children-info-section">
              <h4><i className="fas fa-id-card"></i> Giấy khai sinh</h4>
              <div className="staff-children-document-container">
                {child.birthCertificate ? (
                  <div className="staff-children-document-preview" onClick={() => openImageModal(child.birthCertificate)}>
                    <img 
                      src={child.birthCertificate} 
                      alt="Giấy khai sinh" 
                      className="staff-children-certificate"
                      onError={(e) => { e.target.src = '/images/no-document.png'; }}
                    />
                    <div className="staff-children-document-overlay">
                      <div className="staff-children-document-overlay-content">
                        <i className="fas fa-search-plus"></i>
                        <span>Nhấn để xem</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="staff-children-no-document">
                    <i className="fas fa-file-alt"></i>
                    <p>Chưa có giấy khai sinh</p>
                    <button className="staff-children-upload-btn">
                      <i className="fas fa-upload"></i> Tải lên
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="staff-children-modal-footer">
            <button className="staff-children-action-button secondary" onClick={onClose}>
              <i className="fas fa-times"></i> Đóng
            </button>
            <button className="staff-children-action-button primary">
              <i className="fas fa-edit"></i> Chỉnh sửa
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
              alt="Xem chi tiết" 
              className="staff-children-fullscreen-image" 
              onClick={(e) => e.stopPropagation()}
              onError={(e) => { e.target.src = '/images/no-document.png'; }}
            />
          </div>
          <div className="staff-children-image-caption">
            Nhấn bên ngoài ảnh để đóng
          </div>
        </div>
      )}
    </>
  );
};

export default ChildDetailModal;