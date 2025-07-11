import React, { useState, useEffect } from 'react';
import { getChildrenByParentId, addChild, updateChild, deleteChild } from '../../services/ProfileService';
import ChildCommunicationBook from './ChildCommunicationBook';
import { useUser } from '../../contexts/UserContext';
import styles from './ProfilePage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';

const ChildProfileManagement = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { currentUser } = useUser();
  const navigate = useNavigate();

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

  // Thêm state để quản lý lỗi
  const [formErrors, setFormErrors] = useState({});

  // Add this new state at the top of the component with other state declarations
  const [enrollmentError, setEnrollmentError] = useState({ show: false, childName: '' });

  // Thêm state cho sổ liên lạc
  const [communicationBookOpen, setCommunicationBookOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);

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
      setError('Cannot determine parent information.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await getChildrenByParentId(currentUser.id);
      setChildren(data || []);
      setError('');
    } catch (error) {
      setError('Cannot load child information. Please try again later.');
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
    setFormErrors({});
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
      errors.name = 'Please enter the child\'s name';
    }

    // Kiểm tra ngày sinh
    if (!childFormData.birthday) {
      errors.birthday = 'Please select the child\'s birthday';
    } else {
      const birthDate = new Date(childFormData.birthday);
      const today = new Date();

      // Kiểm tra ngày sinh không được trong tương lai
      if (birthDate > today) {
        errors.birthday = 'The birthday cannot be in the future';
      }

      // Tính tuổi theo năm (chỉ lấy số năm tròn)
      const yearDiff = today.getFullYear() - birthDate.getFullYear();

      // Kiểm tra tuổi phù hợp (từ 3-5 tuổi)
      if (yearDiff < 3) {
        errors.birthday = 'The child must be at least 3 years old';
      } else if (yearDiff > 5) {
        errors.birthday = 'The child must be under 5 years old';
      }
    }

    // Kiểm tra giới tính
    if (!childFormData.gender) {
      errors.gender = 'Please select the child\'s gender';
    }

    // Kiểm tra giấy khai sinh
    if (!childFormData.birthCertificate && !birthCertificateFile) {
      errors.birthCertificate = 'Please upload the child\'s birth certificate';
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
          text: 'The child\'s information has been updated successfully!',
          type: 'success'
        });
      } else {
        // Thêm thông tin trẻ mới
        await addChild(formDataWithFiles);
        setMessage({
          text: 'The child\'s information has been added successfully!',
          type: 'success'
        });
      }

      await fetchChildren();
      closeModal();
    } catch (error) {
      setMessage({
        text: isEditingChild
          ? 'An error occurred while updating the child\'s information.'
          : 'An error occurred while adding the child\'s information.',
        type: 'error'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = (childId, childName) => {
    return window.confirm(`Are you sure you want to delete the information of the child ${childName}?`);
  };

  const handleDeleteChild = async (childId, childName) => {
    if (handleDeleteConfirm(childId, childName)) {
      setFormSubmitting(true);
      try {
        await deleteChild(childId);
        await fetchChildren();
        setMessage({
          text: `The child's information has been deleted successfully!`,
          type: 'success'
        });
      } catch (error) {
        setMessage({
          text: 'An error occurred while deleting the child\'s information.',
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
        setChildFormData(prev => ({ ...prev, avatar: reader.result }));
      } else if (fileType === 'birthCertificate') {
        setChildFormData(prev => ({ ...prev, birthCertificate: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Hàm mở sổ liên lạc
  const openCommunicationBook = (childId) => {
    setSelectedChildId(childId);
    setCommunicationBookOpen(true);
  };

  // Hàm đóng sổ liên lạc
  const closeCommunicationBook = () => {
    setCommunicationBookOpen(false);
    setSelectedChildId(null);
  };

  if (isLoading && !children.length) {
    return (
      <div className={styles.profileLoadingContainer}>
        <div className={styles.profileLoadingSpinner}></div>
        <p>Loading information...</p>
      </div>
    );
  }

  return (
    <div className={styles.childProfileManagement}>
      {/* Status message */}
      {message.text && (
        <div className={`${styles.profileMessage} ${styles[message.type]}`}>
          <div className={styles.messageIcon}>
            {message.type === 'success' ? (
              <FontAwesomeIcon icon="check" />
            ) : (
              <FontAwesomeIcon icon="times" />
            )}
          </div>
          <span>{message.text}</span>
          <button className={styles.messageClose} onClick={() => setMessage({ text: '', type: '' })}>
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
      )}

      {/* Header with add button */}
      <div className={styles.contentHeader}>
        <h2>Child Profile</h2>
        {!formSubmitting && (
          <button
            className={styles.childAddBtn}
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon="plus" />
            Add child profile
          </button>
        )}
      </div>

      {/* List of children */}
      {children.length > 0 && (
        <div className={styles.childrenList}>
          <div className={styles.childrenGrid}>
            {children.map((child) => (
              <div key={child.id} className={`${styles.childCard} ${styles.childCardRow}`}>
                <div className={styles.childAvatar}>
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
                <div className={styles.childInfo}>
                  <h3 className={styles.childName}>{child.name}</h3>
                  <p className={styles.childDob}>
                    {new Date(child.birthday).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className={styles.childDetailsRow}>
                  <p className={styles.childGender}>
                    <FontAwesomeIcon icon={child.gender === 'Male' ? 'mars' : 'venus'} />
                    <span>{child.gender === 'Male' ? 'Male' : 'Female'}</span>
                  </p>
                  <p className={styles.childCity}>
                    <FontAwesomeIcon icon="map-marker-alt" />
                    <span>{child.city || 'Not updated'}</span>
                  </p>
                </div>
                <div className={styles.childActions}>
                  <button
                    className={styles.editChildBtn}
                    onClick={() => openEditModal(child)}
                    title="Edit information"
                    aria-label="Edit information"
                  >
                    <FontAwesomeIcon icon="edit" />
                  </button>

                  {/* Chỉ hiển thị nút sổ liên lạc khi học sinh đang học (Active) */}
                  {child.status === 'Active' && (
                    <button
                      className={styles.communicationBookBtn}
                      onClick={() => openCommunicationBook(child.id)}
                      title="Communication book"
                      aria-label="Communication book"
                    >
                      <FontAwesomeIcon icon="book" />
                    </button>
                  )}

                  {child.status === 'Active' ? (
                    <span
                      className={styles.enrolledBadge}
                      title={`Enrolled in ${child.currentGradeLevelName}`}
                    >
                      <FontAwesomeIcon icon="check-circle" />
                      <span>{child.currentGradeLevelName}</span>
                    </span>
                  ) : (
                    <button
                      className={styles.enrollChildBtn}
                      onClick={() => {
                        if (child.applicationID && child.applicationID !== "00000000-0000-0000-0000-000000000000") {
                          setEnrollmentError({ show: true, childName: child.name });
                        } else {
                          navigate(`/enrollment-application/${child.id}`);
                        }
                      }}
                      title="Enroll"
                      aria-label="Enroll"
                    >
                      <FontAwesomeIcon icon="graduation-cap" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {children.length === 0 && (
        <div className={styles.emptyChildrenState}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon="children" size="3x" />
          </div>
          <h3>No child information</h3>
          <p>Add child information to manage the child's profile at the nursery school.</p>
          <button
            className={styles.addFirstChildBtn}
            onClick={openAddModal}
          >
            <FontAwesomeIcon icon="plus" />
            Add child information
          </button>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modalContent} ${styles.childDetailModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>

              <h3><FontAwesomeIcon icon="child" /> {isEditingChild ? 'Update child information' : 'Add new child profile'}</h3>
              <button className={styles.modalCloseBtn} onClick={closeModal} aria-label="Close">
                <FontAwesomeIcon icon="times" />
              </button>
            </div>

            <div className={styles.modalBody}>

              <form className={styles.profileForm} onSubmit={handleSubmitForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="avatar">
                    <FontAwesomeIcon icon="user-circle" className={styles.inputLabelIcon} /> Avatar
                  </label>
                  <div className={styles.fileUploadContainer}>
                    <input
                      type="file"
                      id="avatar"
                      name="avatar"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      className={styles.fileInput}
                    />
                    <label htmlFor="avatar" className={styles.fileUploadBtn}>
                      <FontAwesomeIcon icon="cloud-upload-alt" /> Select avatar
                    </label>
                    <span className={styles.fileName}>
                      {avatarFile ? avatarFile.name : 'No file selected'}
                    </span>
                  </div>

                  {childFormData.avatar && (
                    <div className={styles.avatarPreview}>
                      <img
                        src={childFormData.avatar}
                        alt="Preview avatar"
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.requiredField}>
                      Child's name *
                    </label>
                    <div className={styles.inputWithIcon}>
                      <FontAwesomeIcon icon="user" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={childFormData.name}
                        onChange={handleInputChange}
                        placeholder="Enter child's name"
                        className={formErrors.name ? styles.inputError : ""}
                      />
                    </div>
                    {formErrors.name && <div className={styles.formErrorMessage}>{formErrors.name}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="birthday" className={styles.requiredField}>
                      Birthday *
                    </label>
                    <div className={styles.inputWithIcon}>
                      <FontAwesomeIcon icon="birthday-cake" />
                      <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={childFormData.birthday}
                        onChange={handleInputChange}
                        className={formErrors.birthday ? styles.inputError : ""}
                      />
                    </div>
                    {formErrors.birthday && <div className={styles.formErrorMessage}>{formErrors.birthday}</div>}
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="gender" className={styles.requiredField}>
                      <FontAwesomeIcon icon="venus-mars" className={styles.inputLabelIcon} /> Gender
                    </label>
                    <div className={styles.radioGroup}>
                      <label className={`${styles.radioLabel} ${childFormData.gender === 'Male' ? styles.active : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={childFormData.gender === 'Male'}
                          onChange={handleInputChange}
                        />
                        <FontAwesomeIcon icon="mars" /> <span>Male</span>
                      </label>
                      <label className={`${styles.radioLabel} ${childFormData.gender === 'Female' ? styles.active : ''}`}>
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={childFormData.gender === 'Female'}
                          onChange={handleInputChange}
                        />
                        <FontAwesomeIcon icon="venus" /> <span>Female</span>
                      </label>
                    </div>
                    {formErrors.gender && <div className={styles.formErrorMessage}>{formErrors.gender}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="city">
                      City
                    </label>
                    <div className={styles.inputWithIcon}>
                      <FontAwesomeIcon icon="map-marker-alt" />
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={childFormData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="birthCertificate" className={styles.requiredField}>
                    <FontAwesomeIcon icon="certificate" className={styles.inputLabelIcon} /> Birth certificate *
                  </label>
                  <div className={styles.fileUploadContainer}>
                    <input
                      type="file"
                      id="birthCertificate"
                      name="birthCertificate"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'birthCertificate')}
                      className={`${styles.fileInput} ${formErrors.birthCertificate ? styles.inputError : ""}`}
                    />
                    <label htmlFor="birthCertificate" className={`${styles.fileUploadBtn} ${formErrors.birthCertificate ? styles.inputErrorBorder : ""}`}>
                      <FontAwesomeIcon icon="file-upload" /> Select birth certificate
                    </label>
                    <span className={styles.fileName}>
                      {birthCertificateFile ? birthCertificateFile.name : 'No file selected'}
                    </span>
                  </div>

                  {childFormData.birthCertificate && (
                    <div className={styles.certificatePreviewSmall}>
                      <img
                        src={childFormData.birthCertificate}
                        alt="Preview birth certificate"
                      />
                      <div className={styles.certificateOverlaySmall}>
                        <FontAwesomeIcon icon="search-plus" /> Click to view details
                      </div>
                    </div>
                  )}

                  {formErrors.birthCertificate && <div className={styles.formErrorMessage}>{formErrors.birthCertificate}</div>}
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelEditBtn}
                    onClick={closeModal}
                    disabled={formSubmitting}
                  >
                    <FontAwesomeIcon icon="times" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.saveProfileBtn}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <span className={styles.btnSpinner}></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon="save" />
                        {isEditingChild ? 'Update information' : 'Save information'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Error Popup */}
      {enrollmentError.show && (
        <div className={styles.modalOverlay} onClick={() => setEnrollmentError({ show: false, childName: '' })}>
          <div className={`${styles.modalContent} ${styles.errorPopup}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><FontAwesomeIcon icon="exclamation-triangle" /> Notification</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setEnrollmentError({ show: false, childName: '' })}
                aria-label="Close"
              >
                <FontAwesomeIcon icon="times" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Currently, the child {enrollmentError.childName} has an application in the registration process.</p>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.confirmBtn}
                onClick={() => setEnrollmentError({ show: false, childName: '' })}
              >
                <FontAwesomeIcon icon="check" /> I understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Communication Book Component */}
      <ChildCommunicationBook
        isOpen={communicationBookOpen}
        onClose={closeCommunicationBook}
        childId={selectedChildId}
      />
    </div>
  );
};

export default ChildProfileManagement; 