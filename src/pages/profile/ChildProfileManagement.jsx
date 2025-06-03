import React, { useState, useEffect } from 'react';
import { getChildrenByParentId, addChild, updateChild, deleteChild } from './ChildProfileService';
import { useUser } from '../../contexts/UserContext';
import './ProfilePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ChildProfileManagement = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { currentUser } = useUser();
  
  const [childFormData, setChildFormData] = useState({
    name: '',
    birthday: '',
    gender: 'Male',
    avatar: '',
    city: '',
    birthCertificate: '',
    parentName: '',
    phoneNumber: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [birthCertificateFile, setBirthCertificateFile] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, [currentUser?.id]);
  
  // Control body scroll when modal is open/closed
  useEffect(() => {
    if (isModalOpen) {
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to ensure scroll is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const fetchChildren = async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      setError('Không thể xác định thông tin phụ huynh.');
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await getChildrenByParentId(currentUser.id);
      setChildren(data || []);
      setError('');
    } catch (error) {
      setError('Không thể tải thông tin của các bé. Vui lòng thử lại sau.');
      console.error('Error fetching children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChildFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setChildFormData({
      name: '',
      birthday: '',
      gender: 'Male',
      avatar: '',
      city: '',
      birthCertificate: '',
      parentName: '',
      phoneNumber: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsEditingChild(null);
    setIsModalOpen(true);
  };

  const openEditModal = (child) => {
    setIsEditingChild(child.id);
    
    let birthdayFormatted = '';
    if (child.birthday) {
      // Xử lý đúng ngày sinh bằng cách sử dụng chuỗi trực tiếp
      const rawDate = new Date(child.birthday);
      const year = rawDate.getFullYear();
      // Tháng bắt đầu từ 0 nên cộng thêm 1
      let month = rawDate.getMonth() + 1;
      // Đảm bảo định dạng 2 chữ số
      month = month < 10 ? `0${month}` : month;
      let day = rawDate.getDate();
      day = day < 10 ? `0${day}` : day;
      birthdayFormatted = `${year}-${month}-${day}`;
    }
    
    setChildFormData({
      name: child.name || '',
      birthday: birthdayFormatted,
      gender: child.gender || 'Male',
      avatar: child.avatar || '',
      city: child.city || '',
      birthCertificate: child.birthCertificate || '',
      parentName: child.parentName || '',
      phoneNumber: child.phoneNumber || ''
    });
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      resetForm();
      setIsEditingChild(null);
    }, 300); // Wait for animation to complete
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      if (isEditingChild) {
        await updateChild(isEditingChild, childFormData);
        setMessage({
          text: 'Đã cập nhật thông tin của bé thành công!',
          type: 'success'
        });
      } else {
        await addChild(childFormData);
        setMessage({
          text: 'Đã thêm thông tin của bé thành công!',
          type: 'success'
        });
      }
      
      await fetchChildren();
      closeModal();
    } catch (error) {
      setMessage({
        text: isEditingChild 
          ? 'Có lỗi xảy ra khi cập nhật thông tin của bé.' 
          : 'Có lỗi xảy ra khi thêm thông tin của bé.',
        type: 'error'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = (childId, childName) => {
    return window.confirm(`Bạn có chắc chắn muốn xóa thông tin của bé ${childName} không?`);
  };

  const handleDeleteChild = async (childId, childName) => {
    if (handleDeleteConfirm(childId, childName)) {
      setFormSubmitting(true);
      try {
        await deleteChild(childId);
        await fetchChildren();
        setMessage({
          text: `Đã xóa thông tin của bé ${childName} thành công!`,
          type: 'success'
        });
      } catch (error) {
        setMessage({
          text: 'Có lỗi xảy ra khi xóa thông tin của bé.',
          type: 'error'
        });
      } finally {
        setFormSubmitting(false);
      }
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (fileType === 'avatar') {
        setChildFormData(prev => ({...prev, avatar: reader.result}));
        setAvatarFile(file);
      } else if (fileType === 'birthCertificate') {
        setChildFormData(prev => ({...prev, birthCertificate: reader.result}));
        setBirthCertificateFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading && !children.length) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="child-profile-management">
      {/* Status message */}
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

      {/* Header with add button */}
      <div className="content-header">
        <h2>Hồ sơ của bé</h2>
        {!formSubmitting && (
          <button 
            className="child-add-btn"
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon="plus" />
            Thêm hồ sơ bé
          </button>
        )}
      </div>

      {/* List of children */}
      {children.length > 0 && (
        <div className="children-list">
          <div className="children-grid">
            {children.map((child) => (
              <div key={child.id} className="child-card child-card-row">
                <div className="child-avatar">
                  {child.avatar ? (
                    <img 
                      src={child.avatar} 
                      alt={`Ảnh của ${child.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <FontAwesomeIcon icon="children" size="2x" />
                  )}
                </div>
                <div className="child-info">
                  <h3 className="child-name">{child.name}</h3>
                  <p className="child-dob">
                    {new Date(child.birthday).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="child-details-row">
                  <p className="child-gender">
                    <FontAwesomeIcon icon={child.gender === 'Male' ? 'mars' : 'venus'} />
                    <span>{child.gender === 'Male' ? 'Nam' : 'Nữ'}</span>
                  </p>
                  <p className="child-city">
                    <FontAwesomeIcon icon="map-marker-alt" />
                    <span>{child.city || 'Chưa cập nhật'}</span>
                  </p>
                </div>
                <div className="child-actions">
                  <button
                    className="edit-child-btn"
                    onClick={() => openEditModal(child)}
                    title="Sửa thông tin"
                    aria-label="Sửa thông tin"
                  >
                    <FontAwesomeIcon icon="edit" />
                  </button>
                  <button
                    className="delete-child-btn"
                    onClick={() => handleDeleteChild(child.id, child.name)}
                    title="Xóa thông tin"
                    aria-label="Xóa thông tin"
                  >
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {children.length === 0 && (
        <div className="empty-children-state">
          <div className="empty-icon">
            <FontAwesomeIcon icon="children" size="3x" />
          </div>
          <h3>Chưa có thông tin của bé nào</h3>
          <p>Thêm thông tin của các bé để quản lý hồ sơ của các bé tại trường mầm non.</p>
          <button 
            className="add-first-child-btn"
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon="plus" />
            Thêm thông tin bé
          </button>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content child-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditingChild ? 'Cập nhật thông tin của bé' : 'Thêm hồ sơ mới của bé'}</h3>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Đóng">
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            
            <div className="modal-body">
              
              <form className="profile-form" onSubmit={handleSubmitForm}>
                <h4 className="form-section-title">
                  <FontAwesomeIcon icon="child" />
                  {isEditingChild ? 'Cập nhật thông tin trẻ' : 'Thông tin cơ bản của trẻ'}
                </h4>
                
                <div className="form-group">
                  <label htmlFor="avatar">
                    <FontAwesomeIcon icon="user-circle" className="input-label-icon" /> Ảnh đại diện
                  </label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      className="file-input"
                    />
                    <label htmlFor="avatar" className="file-upload-btn">
                      <FontAwesomeIcon icon="cloud-upload-alt" /> Chọn ảnh đại diện
                    </label>
                    <span className="file-name">
                      {avatarFile ? avatarFile.name : 'Chưa chọn file'}
                    </span>
                  </div>
                  
                  {childFormData.avatar && (
                    <div className="avatar-preview">
                      <img 
                        src={childFormData.avatar} 
                        alt="Xem trước ảnh đại diện" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">
                       Họ và tên của bé *
                    </label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="user" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={childFormData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập họ và tên của bé"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthday">
                      Ngày sinh *
                    </label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="birthday-cake" />
                      <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={childFormData.birthday}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="gender">
                      <FontAwesomeIcon icon="venus-mars" className="input-label-icon" /> Giới tính
                    </label>
                    <div className="radio-group">
                      <label className={`radio-label ${childFormData.gender === 'Male' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={childFormData.gender === 'Male'}
                          onChange={handleInputChange}
                        />
                        <FontAwesomeIcon icon="mars" /> <span>Nam</span>
                      </label>
                      <label className={`radio-label ${childFormData.gender === 'Female' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={childFormData.gender === 'Female'}
                          onChange={handleInputChange}
                        />
                        <FontAwesomeIcon icon="venus" /> <span>Nữ</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">
                      Thành phố
                    </label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="map-marker-alt" />
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={childFormData.city}
                        onChange={handleInputChange}
                        placeholder="Nhập thành phố"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="birthCertificate">
                    <FontAwesomeIcon icon="file-certificate" className="input-label-icon" /> Giấy khai sinh
                  </label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="birthCertificate"
                      name="birthCertificate"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'birthCertificate')}
                      className="file-input"
                    />
                    <label htmlFor="birthCertificate" className="file-upload-btn">
                      <FontAwesomeIcon icon="file-upload" /> Chọn ảnh giấy khai sinh
                    </label>
                    <span className="file-name">
                      {birthCertificateFile ? birthCertificateFile.name : 'Chưa chọn file'}
                    </span>
                  </div>
                  
                  {childFormData.birthCertificate && (
                    <div className="certificate-preview-small">
                      <img 
                        src={childFormData.birthCertificate} 
                        alt="Xem trước giấy khai sinh" 
                      />
                      <div className="certificate-overlay-small">
                        <FontAwesomeIcon icon="search-plus" /> Nhấn để xem chi tiết
                      </div>
                    </div>
                  )}
                </div>

                <div className="section-divider"></div>

                <h4 className="form-section-title">
                  <FontAwesomeIcon icon="user-friends" />
                  Thông tin phụ huynh
                </h4>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="parentName">
                       Họ tên phụ huynh *
                    </label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="user-tie" />
                      <input
                        type="text"
                        id="parentName"
                        name="parentName"
                        value={childFormData.parentName}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập họ tên phụ huynh"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber">
                      <FontAwesomeIcon icon="phone-alt" className="input-label-icon" /> Số điện thoại *
                    </label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="phone" />
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={childFormData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập số điện thoại liên hệ"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={closeModal}
                    disabled={formSubmitting}
                  >
                    <FontAwesomeIcon icon="times" />
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="save-profile-btn"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <span className="btn-spinner"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon="save" />
                        {isEditingChild ? 'Cập nhật thông tin' : 'Lưu thông tin'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildProfileManagement; 