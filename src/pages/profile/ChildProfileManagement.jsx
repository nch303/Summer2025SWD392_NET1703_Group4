import React, { useState, useEffect } from 'react';
import { getChildrenByParentId, addChild, updateChild, deleteChild } from './ChildProfileService';
import { useUser } from '../../contexts/UserContext';
import './ProfilePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

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
    birthCertificate: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [birthCertificateFile, setBirthCertificateFile] = useState(null);

  // Thêm state để quản lý lỗi form
  const [formErrors, setFormErrors] = useState({});

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
    
    // Xóa lỗi cho trường đang được nhập
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const resetForm = () => {
    setChildFormData({
      name: '',
      birthday: '',
      gender: 'Male',
      avatar: '',
      city: '',
      birthCertificate: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsEditingChild(null);
    setAvatarFile(null);
    setBirthCertificateFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (child) => {
    setIsEditingChild(child.id);
    
    // Reset file state
    setAvatarFile(null);
    setBirthCertificateFile(null);
    
    // Format ngày sinh
    let birthdayFormatted = '';
    if (child.birthday) {
      const rawDate = new Date(child.birthday);
      const year = rawDate.getFullYear();
      let month = rawDate.getMonth() + 1;
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
      birthCertificate: child.birthCertificate || ''
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

  // Thêm hàm validateForm trước khi submit
  const validateForm = () => {
    const errors = {};
    
    // Kiểm tra tên trẻ
    if (!childFormData.name || childFormData.name.trim() === '') {
      errors.name = 'Vui lòng nhập họ và tên của bé';
    }
    
    // Kiểm tra ngày sinh
    if (!childFormData.birthday) {
      errors.birthday = 'Vui lòng chọn ngày sinh của bé';
    } else {
      const birthDate = new Date(childFormData.birthday);
      const today = new Date();
      
      // Kiểm tra ngày sinh không được trong tương lai
      if (birthDate > today) {
        errors.birthday = 'Ngày sinh không thể là ngày trong tương lai';
      }
      
      // Kiểm tra tuổi phù hợp (ví dụ: từ 2-6 tuổi)
      const ageInYears = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
      if (ageInYears > 5) {
        errors.birthday = 'Độ tuổi của bé phải nhỏ hơn hoặc bằng 5 tuổi';
      }
    }
    
    // Kiểm tra giới tính
    if (!childFormData.gender) {
      errors.gender = 'Vui lòng chọn giới tính của bé';
    }
    
    // Kiểm tra giấy khai sinh
    if (!childFormData.birthCertificate && !birthCertificateFile) {
      errors.birthCertificate = 'Vui lòng tải lên ảnh giấy khai sinh';
    }
    
    return errors;
  };

  // Cập nhật hàm handleSubmitForm để kiểm tra form trước khi submit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    // Kiểm tra form trước khi submit
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Ngăn form submit nếu có lỗi
    }
    
    setFormSubmitting(true);
    
    try {
      // Thêm file vào childFormData để truyền vào API
      const formDataWithFiles = {
        ...childFormData,
        avatarFile: avatarFile,
        birthCertificateFile: birthCertificateFile
      };
      
      if (isEditingChild) {
        // Cập nhật thông tin trẻ
        await updateChild(isEditingChild, formDataWithFiles);
        setMessage({
          text: 'Đã cập nhật thông tin của bé thành công!',
          type: 'success'
        });
      } else {
        // Thêm thông tin trẻ mới
        await addChild(formDataWithFiles);
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
    
    // Lưu file để gửi đến API
    if (fileType === 'avatar') {
      setAvatarFile(file);
    } else if (fileType === 'birthCertificate') {
      setBirthCertificateFile(file);
    }
    
    // Tạo URL để hiển thị preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (fileType === 'avatar') {
        setChildFormData(prev => ({...prev, avatar: reader.result}));
      } else if (fileType === 'birthCertificate') {
        setChildFormData(prev => ({...prev, birthCertificate: reader.result}));
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
                  <Link
                    to={`/enrollment-application/${child.id}`}
                    className="enroll-child-btn"
                    title="Nhập học"
                    aria-label="Nhập học"
                  >
                    <FontAwesomeIcon icon="graduation-cap" />
                  </Link>
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
                    <label htmlFor="name" className="required-field">
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
                        placeholder="Nhập họ và tên của bé"
                        className={formErrors.name ? "input-error" : ""}
                      />
                    </div>
                    {formErrors.name && <div className="form-error-message">{formErrors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthday" className="required-field">
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
                        className={formErrors.birthday ? "input-error" : ""}
                      />
                    </div>
                    {formErrors.birthday && <div className="form-error-message">{formErrors.birthday}</div>}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="gender" className="required-field">
                      <FontAwesomeIcon icon="venus-mars" className="input-label-icon" /> Giới tính *
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
                    {formErrors.gender && <div className="form-error-message">{formErrors.gender}</div>}
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
                  <label htmlFor="birthCertificate" className="required-field">
                    <FontAwesomeIcon icon="file-certificate" className="input-label-icon" /> Giấy khai sinh *
                  </label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="birthCertificate"
                      name="birthCertificate"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'birthCertificate')}
                      className={`file-input ${formErrors.birthCertificate ? "input-error" : ""}`}
                    />
                    <label htmlFor="birthCertificate" className={`file-upload-btn ${formErrors.birthCertificate ? "input-error-border" : ""}`}>
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
                  
                  {formErrors.birthCertificate && <div className="form-error-message">{formErrors.birthCertificate}</div>}
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