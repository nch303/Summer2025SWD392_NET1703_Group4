import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getChildById, submitEnrollmentApplication, getGradeLevels } from './EnrollmentApplicationService';
import './EnrollmentApplicationPage.css';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';

const EnrollmentApplicationPage = () => {
  const [child, setChild] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();
  
  const [formData, setFormData] = useState({
    academicYear: getCurrentAcademicYear(),
    gradeLevelID: ''
  });
  
  function getCurrentAcademicYear() {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  }
  
  const academicYears = [
    getCurrentAcademicYear(),
    `${new Date().getFullYear() + 1}-${new Date().getFullYear() + 2}`
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!childId) {
        setError('Không tìm thấy ID của trẻ.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const childData = await getChildById(childId);
        setChild(childData);
        
        const levels = await getGradeLevels();
        setGradeLevels(levels || []);
        
        if (levels && levels.length > 0) {
          setFormData(prev => ({
            ...prev,
            gradeLevelID: levels[0].id
          }));
        }
        
        setError('');
      } catch (err) {
        setError('Không thể tải thông tin. Vui lòng thử lại sau.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [childId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.academicYear || !formData.gradeLevelID) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    
    try {
      showSpinner('Đang xử lý đăng ký...');
      setError('');
      
      const applicationData = {
        ...formData,
        gradeLevelID: Number(formData.gradeLevelID)
      };
      
      const response = await submitEnrollmentApplication(childId, applicationData);
      
      toast.success('Đăng ký nhập học thành công!', {
        duration: 3000,
        title: 'Hoàn tất đăng ký'
      });
      
      setTimeout(() => {
        navigate('/enrollment-tracking');
      }, 2000);
      
    } catch (err) {
      setError('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau.');
      toast.error('Đã xảy ra lỗi trong quá trình đăng ký.', {
        title: 'Lỗi đăng ký'
      });
      console.error('Error submitting application:', err);
    } finally {
      hideSpinner();
    }
  };
  
  const formatBirthday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const nextStep = () => {
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };
  
  if (loading) {
    return (
      <div className="enrollment-container">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-container">
      <toast.ToastContainer position="top-right" />
      
      <div className="enrollment-paper">
        <div className="enrollment-header">
          <div className="header-content">
            <FontAwesomeIcon icon="user-plus" className="header-icon" />
            <h1>Đăng ký nhập học</h1>
          </div>
          <div className="steps-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Thông tin cá nhân</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Đăng ký</div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="message error-message">
            <div className="message-icon">
              <FontAwesomeIcon icon="times-circle" />
            </div>
            <span>{error}</span>
          </div>
        )}
        
        {child && (
          <>
            {currentStep === 1 && (
              <div className="enrollment-step">
                <h2 className="step-title">
                  <FontAwesomeIcon icon="info-circle" />
                  Thông tin học sinh
                </h2>
                
                <div className="child-profile">
                  <div className="child-profile-header">
                    <div className="child-avatar">
                      {child.avatar ? (
                        <img src={child.avatar} alt={`Avatar của ${child.name}`} />
                      ) : (
                        <FontAwesomeIcon icon="child" className="avatar-icon" />
                      )}
                    </div>
                    <div className="child-name">
                      <h3>{child.name}</h3>
                    </div>
                  </div>
                  
                  <div className="child-details-grid">
                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon="birthday-cake" />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Ngày sinh</div>
                        <div className="detail-value">{formatBirthday(child.birthday)}</div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon={child.gender === 'Male' ? 'mars' : 'venus'} />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Giới tính</div>
                        <div className="detail-value">{child.gender === 'Male' ? 'Nam' : 'Nữ'}</div>
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-icon">
                        <FontAwesomeIcon icon="map-marker-alt" />
                      </div>
                      <div className="detail-content">
                        <div className="detail-label">Thành phố</div>
                        <div className="detail-value">{child.city || 'Chưa cập nhật'}</div>
                      </div>
                    </div>
                    
                    {child.birthCertificate && (
                      <div className="detail-item birth-cert-item">
                        <div className="detail-icon">
                          <FontAwesomeIcon icon="file-pdf" />
                        </div>
                        <div className="detail-content">
                          <div className="detail-label">Giấy khai sinh</div>
                          <div className="detail-value">
                            <a href={child.birthCertificate} target="_blank" rel="noopener noreferrer" className="certificate-link">
                              <FontAwesomeIcon icon="eye" /> Xem giấy tờ
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {child.birthCertificate && (
                    <div className="certificate-section">
                      <div className="certificate-preview">
                        <div className="certificate-image">
                          <img src={child.birthCertificate} alt="Giấy khai sinh" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="child-step-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => navigate('/profile/children')}
                    >
                      <FontAwesomeIcon icon="arrow-left" /> Quay lại
                    </button>
                    <button
                      type="button"
                      className="btn-next"
                      onClick={nextStep}
                    >
                      Tiếp tục <FontAwesomeIcon icon="arrow-right" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="enrollment-step">
                <h2 className="step-title">
                  <FontAwesomeIcon icon="school" />
                  Đăng ký nhập học
                </h2>
                
                <div className="enrollment-form">
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="academicYear">
                          <FontAwesomeIcon icon="calendar-days" /> Năm học
                        </label>
                        <select
                          id="academicYear"
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleInputChange}
                          required
                        >
                          {academicYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="gradeLevelID">
                          <FontAwesomeIcon icon="graduation-cap" /> Cấp lớp
                        </label>
                        <select
                          id="gradeLevelID"
                          name="gradeLevelID"
                          value={formData.gradeLevelID}
                          onChange={handleInputChange}
                          required
                        >
                          {gradeLevels.length > 0 ? (
                            gradeLevels.map((level) => (
                              <option key={level.id} value={level.id}>
                                {level.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Không có lớp học khả dụng</option>
                          )}
                        </select>
                      </div>
                    </div>
                    
                    <div className="enrollment-summary">
                      <h3>Thông tin đăng ký</h3>
                      <div className="summary-details">
                        <div className="summary-row">
                          <div className="summary-label">Học sinh:</div>
                          <div className="summary-value">{child.name}</div>
                        </div>
                        <div className="summary-row">
                          <div className="summary-label">Năm học:</div>
                          <div className="summary-value">{formData.academicYear}</div>
                        </div>
                        <div className="summary-row">
                          <div className="summary-label">Cấp lớp:</div>
                          <div className="summary-value">
                            {gradeLevels.find(level => level.id == formData.gradeLevelID)?.name || ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn-back"
                        onClick={prevStep}
                      >
                        <FontAwesomeIcon icon="arrow-left" />
                        Quay lại
                      </button>
                      
                      <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={gradeLevels.length === 0}
                      >
                        <FontAwesomeIcon icon="paper-plane" />
                        Hoàn tất đăng ký
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnrollmentApplicationPage;
