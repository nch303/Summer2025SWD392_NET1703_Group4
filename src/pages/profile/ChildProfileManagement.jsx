import React, { useState, useEffect } from 'react';
import { getParentChildren, addChild, updateChild, deleteChild } from './ChildProfileService';
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
  
  const [childFormData, setChildFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    allergies: '',
    medicalConditions: '',
    emergencyContact: '',
    notes: '',
  });

  useEffect(() => {
    fetchChildren();
  }, []);
  
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
    try {
      setIsLoading(true);
      const data = await getParentChildren();
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
      fullName: '',
      dateOfBirth: '',
      gender: 'male',
      allergies: '',
      medicalConditions: '',
      emergencyContact: '',
      notes: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsEditingChild(null);
    setIsModalOpen(true);
  };

  const openEditModal = (child) => {
    setIsEditingChild(child.id);
    setChildFormData({
      fullName: child.fullName || '',
      dateOfBirth: child.dateOfBirth ? new Date(child.dateOfBirth).toISOString().split('T')[0] : '',
      gender: child.gender || 'male',
      allergies: child.allergies || '',
      medicalConditions: child.medicalConditions || '',
      emergencyContact: child.emergencyContact || '',
      notes: child.notes || '',
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
              <div key={child.id} className="child-card">
                <div className="child-avatar">
                  <FontAwesomeIcon icon="children" size="2x" />
                </div>
                <div className="child-info">
                  <h3 className="child-name">{child.fullName}</h3>
                  <p className="child-dob">
                    {new Date(child.dateOfBirth).toLocaleDateString('vi-VN')}
                  </p>
                  <div className="child-details">
                    {child.allergies && (
                      <p className="child-allergies">
                        <strong>Dị ứng:</strong> {child.allergies}
                      </p>
                    )}
                    {child.medicalConditions && (
                      <p className="child-medical">
                        <strong>Tình trạng y tế:</strong> {child.medicalConditions}
                      </p>
                    )}
                    {child.emergencyContact && (
                      <p className="child-contact">
                        <strong>Liên hệ KCấp:</strong> {child.emergencyContact}
                      </p>
                    )}
                  </div>
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
                    onClick={() => handleDeleteChild(child.id, child.fullName)}
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
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditingChild ? 'Cập nhật thông tin của bé' : 'Thêm hồ sơ mới của bé'}</h3>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Đóng">
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            
            <div className="modal-body">
              <form className="profile-form" onSubmit={handleSubmitForm}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">Họ và tên của bé *</label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="user" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={childFormData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập họ và tên của bé"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Ngày sinh *</label>
                    <div className="input-with-icon">
                      <FontAwesomeIcon icon="calendar-days" />
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={childFormData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <div className="radio-group">
                    <label className={`radio-label ${childFormData.gender === 'male' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={childFormData.gender === 'male'}
                        onChange={handleInputChange}
                      />
                      <span>Nam</span>
                    </label>
                    <label className={`radio-label ${childFormData.gender === 'female' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={childFormData.gender === 'female'}
                        onChange={handleInputChange}
                      />
                      <span>Nữ</span>
                    </label>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="allergies">Dị ứng (nếu có)</label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      value={childFormData.allergies}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Mô tả các dị ứng của bé (nếu có)"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label htmlFor="medicalConditions">Tình trạng y tế (nếu có)</label>
                    <textarea
                      id="medicalConditions"
                      name="medicalConditions"
                      value={childFormData.medicalConditions}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Ghi chú về tình trạng sức khỏe đặc biệt"
                    ></textarea>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact">Liên hệ khẩn cấp *</label>
                  <div className="input-with-icon">
                    <FontAwesomeIcon icon="phone" />
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      placeholder="Tên & số điện thoại"
                      value={childFormData.emergencyContact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Ghi chú</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={childFormData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Thông tin thêm về bé (sở thích, đặc điểm đặc biệt, v.v.)"
                  ></textarea>
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
                        <FontAwesomeIcon icon="check" />
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