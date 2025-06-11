import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getChildById, getParentById, submitEnrollmentApplication, getGradeLevels } from './EnrollmentApplicationService';
import './EnrollmentApplicationPage.css';
import { useProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';

const EnrollmentApplicationPage = () => {
  const [child, setChild] = useState(null);
  const [parent, setParent] = useState(null);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const { showSpinner, hideSpinner } = useProcessingSpinner();
  const toast = useCustomToast();
  
  const [formData, setFormData] = useState({
    academicYear: getCurrentAcademicYear(),
    gradeLevelID: '',
    parentName: '',
    parentBirthday: '',
    parentOccupation: '',
    currentAddress: '',
    permanentAddress: '',
    phoneNumber: ''
  });
  
  function getCurrentAcademicYear() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based (0 = January, 8 = September)
    const currentDay = today.getDate();
    
    // If date is before September 1st of current year, use currentYear-nextYear
    // Otherwise use nextYear-yearAfterNext
    if (currentMonth < 8 || (currentMonth === 8 && currentDay < 1)) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear + 1}-${currentYear + 2}`;
    }
  }
  
  const academicYears = [
    getCurrentAcademicYear(),
    `${getCurrentAcademicYear().split('-')[0]*1 + 1}-${getCurrentAcademicYear().split('-')[1]*1 + 1}`
  ];

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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
        
        // Fetch parent data if parentID exists
        if (childData.parentID) {
          const parentData = await getParentById(childData.parentID);
          setParent(parentData);
          
          // Pre-fill form with parent data
          setFormData(prev => ({
            ...prev,
            parentName: parentData.fullName || childData.parentName || '',
            currentAddress: parentData.address || '',
            permanentAddress: parentData.address || '',
            phoneNumber: parentData.phoneNumber || childData.phoneNumber || ''
          }));
        } else if (childData.parentName) {
          // Use parent info from child data if available
          setFormData(prev => ({
            ...prev,
            parentName: childData.parentName || '',
            phoneNumber: childData.phoneNumber || ''
          }));
        }
        
        const levels = await getGradeLevels();
        
        const childAge = calculateAge(childData.birthday);
        const filteredLevels = levels.filter(level => {
          if (childAge <= 3 && level.name.includes("Mầm")) return true;
          if (childAge === 4 && level.name.includes("Chồi")) return true;
          if (childAge === 5 && level.name.includes("Lá")) return true;
          return false;
        });
        
        setGradeLevels(filteredLevels || []);
        
        if (filteredLevels && filteredLevels.length > 0) {
          setFormData(prev => ({
            ...prev,
            gradeLevelID: filteredLevels[0].id
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
      if (err.isDuplicate) {
        setError(err.message);
        toast.error(err.message, {
          title: 'Đăng ký không thành công',
          description: 'Vui lòng kiểm tra lại tình trạng đăng ký trong mục theo dõi đăng ký.'
        });
      } else {
        setError('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại sau.');
        toast.error('Đã xảy ra lỗi trong quá trình đăng ký.', {
          title: 'Lỗi đăng ký'
        });
      }
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

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
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
        {error && (
          <div className="message error-message">
            <div className="message-icon">
              <FontAwesomeIcon icon="times-circle" />
            </div>
            <span>{error}</span>
          </div>
        )}
        
        {child && (
          <div className="paper-enrollment-form">
            <div className="form-header">
              <h1>ĐƠN XIN NHẬP HỌC</h1>
              <h2>NĂM HỌC: {formData.academicYear}</h2>
            </div>
            
            <div className="form-recipient">
              <p><strong>Kính gửi</strong>: BAN GIÁM HIỆU TRƯỜNG MẦM NON LITTLE STARS</p>
            </div>
            
            <form onSubmit={handleSubmit} className="traditional-form">
              <div className="form-section parent-info">
                <div className="form-field">
                  <label htmlFor="parentName">Họ và tên</label>
                  <div className="readonly-value">{formData.parentName}</div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="currentAddress">Chỗ ở hiện nay</label>
                  <div className="readonly-value">{formData.currentAddress}</div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="permanentAddress">Hộ khẩu thường trú</label>
                  <div className="readonly-value">{formData.permanentAddress}</div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="phoneNumber">Điện thoại</label>
                  <div className="readonly-value">{formData.phoneNumber}</div>
                </div>
              </div>
              
              <div className="form-section child-info">
                <div className="form-field">
                  <label>Con tôi tên là</label>
                  <div className="readonly-value">{child.name}</div>
                </div>
                
                <div className="form-field">
                  <label>Sinh ngày</label>
                  <div className="readonly-value">{formatBirthday(child.birthday)}</div>
                </div>
                
                <div className="form-field">
                  <label>Nơi sinh</label>
                  <div className="readonly-value">{child.city || 'Chưa cập nhật'}</div>
                </div>
              </div>
              
              <div className="form-section grade-selection">
                <div className="form-field">
                  <label htmlFor="gradeLevelID">Cấp lớp đăng ký</label>
                  {gradeLevels.length > 0 ? (
                    <select
                      id="gradeLevelID"
                      name="gradeLevelID"
                      value={formData.gradeLevelID}
                      onChange={handleInputChange}
                      required
                      className="grade-select"
                    >
                      {gradeLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="readonly-value error-message">
                      Không có lớp học phù hợp với độ tuổi của trẻ
                    </div>
                  )}
                </div>
                {child && (
                  <div className="grade-info">
                    <FontAwesomeIcon icon="info-circle" className="info-icon" />
                    <span>
                      Trẻ {calculateAge(child.birthday)} tuổi chỉ được đăng ký lớp 
                      {calculateAge(child.birthday) <= 3 ? " Mầm" : 
                       calculateAge(child.birthday) === 4 ? " Chồi" : " Lá"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="application-text">
                <p>
                  Nay tôi làm đơn này kính xin Ban Giám Hiệu cho con tôi ghi tên vào học 
                  tại trường Mầm Non Little Stars.
                </p>
                <p>
                  Tôi xin chấp hành nội quy, quy định của nhà trường.
                </p>
              </div>
              
              <div className="signature-container">
                <div className="signature parent-signature">
                  <div className="date-section">
                    <p>........, ngày ........ tháng ........ năm {new Date().getFullYear()}</p>
                    <p className="signature-label">(Phụ huynh ký và ghi rõ họ tên)</p>
                  </div>
                </div>
                
                <div className="signature principal-signature">
                  <div className="date-section">
                    <p>HIỆU TRƯỞNG</p>
                    
                    <div className="signature-text">
                      TaKKhoan
                      <div className="signature-line"></div>
                    </div>
                    <div>
                      Tạ Khắc Khoan
                    </div>
                    
                    {/* School stamp */}
                    <div className="school-stamp">
                      <div className="stamp-circle"></div>
                      <div className="stamp-inner-circle"></div>
                      <div className="stamp-text-top">TRƯỜNG MẦM NON</div>
                      <div className="stamp-text-bottom">LITTLE STARS</div>
                      <div className="stamp-date">{new Date().getFullYear()}</div>
                      <div className="stamp-approved">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(183, 28, 28, 0.9)">
                          <path d="M12 3L14.94 8.34L21 9.27L16.5 13.33L17.75 19.34L12 16.67L6.25 19.34L7.5 13.33L3 9.27L9.06 8.34L12 3Z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => navigate('/profile/children')}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Quay lại
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
        )}
      </div>
    </div>
  );
};

export default EnrollmentApplicationPage;
