import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getChildById, getParentById, 
  submitEnrollmentApplication, getGradeLevels } from '../../services/EnrollmentApplicationService';
import styles from './EnrollmentApplicationPage.module.css';
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
        setError('Cannot find the child ID.');
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
        
        setGradeLevels(levels || []);
        
        if (levels && levels.length > 0) {
          // ALWAYS select the recommended grade level by default
          const childAge = calculateAge(childData.birthday);
          const recommendedLevel = levels.find(level => {
            if (childAge <= 3 && level.name.includes("Mầm")) return true;
            if (childAge === 4 && level.name.includes("Chồi")) return true;
            if (childAge === 5 && level.name.includes("Lá")) return true;
            return false;
          });
          
          // Always use recommended level, no fallback to first level
          if (recommendedLevel) {
            setFormData(prev => ({
              ...prev,
              gradeLevelID: recommendedLevel.id.toString()
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              gradeLevelID: levels[0].id.toString()
            }));
          }
        }
        
        setError('');
      } catch (err) {
        setError('Cannot load information. Please try again later.');
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
      setError('Please fill in all information.');
      return;
    }
    
    try {
      showSpinner('Processing enrollment...');
      setError('');
      
      const applicationData = {
        ...formData,
        gradeLevelID: Number(formData.gradeLevelID)
      };
      
      const response = await submitEnrollmentApplication(childId, applicationData);
      
      toast.success('Enrollment successful!', {
        duration: 3000,
        title: 'Complete enrollment'
      });
      
      setTimeout(() => {
        navigate('/enrollment-tracking');
      }, 2000);
      
    } catch (err) {
      if (err.isDuplicate) {
        setError(err.message);
        toast.error(err.message, {
          title: 'Enrollment failed',
          description: 'Please check the enrollment status in the enrollment tracking section.'
        });
      } else {
        setError('An error occurred during enrollment. Please try again later.');
        toast.error('An error occurred during enrollment.', {
          title: 'Enrollment failed'
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
      <div className={styles.enrollmentContainer}>
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.enrollmentContainer}>
      <toast.ToastContainer position="top-right" />
      
      <div className={styles.enrollmentPaper}>
        {error && (
          <div className={`${styles.message} ${styles.errorMessage}`}>
            <div className={styles.messageIcon}>
              <FontAwesomeIcon icon="times-circle" />
            </div>
            <span>{error}</span>
          </div>
        )}
        
        {child && (
          <div className={styles.paperEnrollmentForm}>
            <div className={styles.formHeader}>
              <h1>ENROLLMENT APPLICATION</h1>
              <h2>ACADEMIC YEAR: {formData.academicYear}</h2>
            </div>
            
            <div className={styles.formRecipient}>
              <p><strong>Dear</strong>: PRINCIPAL OF LITTLE STARS PRESCHOOL</p>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.traditionalForm}>
              <div className={`${styles.formSection} ${styles.parentInfo}`}>
                <div className={styles.formField}>
                  <label htmlFor="parentName">Name</label>
                  <div className={styles.readonlyValue}>{formData.parentName}</div>
                </div>
                
                <div className={styles.formField}>
                  <label htmlFor="currentAddress">Current address</label>
                  <div className={styles.readonlyValue}>{formData.currentAddress}</div>
                </div>
                
                <div className={styles.formField}>
                  <label htmlFor="permanentAddress">Permanent address</label>
                  <div className={styles.readonlyValue}>{formData.permanentAddress}</div>
                </div>
                
                <div className={styles.formField}>
                  <label htmlFor="phoneNumber">Phone</label>
                  <div className={styles.readonlyValue}>{formData.phoneNumber}</div>
                </div>
              </div>
              
              <div className={`${styles.formSection} ${styles.childInfo}`}>
                <div className={styles.formField}>
                  <label>My child's name is</label>
                  <div className={styles.readonlyValue}>{child.name}</div>
                </div>
                
                <div className={styles.formField}>
                  <label>Birthday</label>
                  <div className={styles.readonlyValue}>{formatBirthday(child.birthday)}</div>
                </div>
                
                <div className={styles.formField}>
                  <label>Birthplace</label>
                  <div className={styles.readonlyValue}>{child.city || 'Not updated'}</div>
                </div>
              </div>
              
              <div className={`${styles.formSection} ${styles.gradeSelection}`}>
                <div className={`${styles.formField} ${styles.gradeField}`}>
                  <label htmlFor="gradeLevelID">Grade level</label>
                  {gradeLevels.length > 0 ? (
                    <div className={styles.gradeRadioGroup}>
                      {gradeLevels.map((level) => {
                        // Determine if this is the recommended level based on age
                        const childAge = calculateAge(child.birthday);
                        const isRecommended = 
                          (childAge <= 3 && level.name.includes("Mầm")) ||
                          (childAge === 4 && level.name.includes("Chồi")) ||
                          (childAge === 5 && level.name.includes("Lá"));
                        
                        // Determine if level is not allowed (child too young for this level)
                        const isTooAdvanced = 
                          (childAge < 4 && level.name.includes("Chồi")) || 
                          (childAge < 5 && level.name.includes("Lá"));
                        
                        // Determine if we need to show warning (child too old for this level)
                        const isTooBasic = 
                          (childAge > 3 && level.name.includes("Mầm")) ||
                          (childAge > 4 && level.name.includes("Chồi"));
                        
                        return (
                          <label 
                            key={level.id} 
                            className={`${styles.gradeRadioLabel} ${formData.gradeLevelID === level.id.toString() ? styles.active : ''} ${isRecommended ? styles.recommended : ''} ${isTooAdvanced ? styles.disabled : ''} ${isTooBasic ? styles.warning : ''}`}
                          >
                            <input
                              type="radio"
                              name="gradeLevelID"
                              value={level.id}
                              checked={formData.gradeLevelID === level.id.toString()}
                              onChange={handleInputChange}
                              disabled={isTooAdvanced}
                            />
                            <span className={styles.gradeRadioText}>{level.name}</span>
                            {isTooBasic && formData.gradeLevelID === level.id.toString() && (
                              <span className={styles.levelWarningIndicator}>&#9888;</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`${styles.readonlyValue} ${styles.errorMessage}`}>
                      No class suitable for the child's age
                    </div>
                  )}
                </div>
                
                {/* Add warning message when grade level is too low for child's age */}
                {formData.gradeLevelID && gradeLevels.some(level => {
                  const childAge = calculateAge(child.birthday);
                  const isTooBasic = 
                    (childAge > 3 && level.name.includes("Mầm") && formData.gradeLevelID === level.id.toString()) ||
                    (childAge > 4 && level.name.includes("Chồi") && formData.gradeLevelID === level.id.toString());
                  return isTooBasic;
                }) && (
                  <div className={styles.gradeWarning}>
                    <FontAwesomeIcon icon="exclamation-triangle" className={styles.warningIcon} />
                    <span>
                      Child {calculateAge(child.birthday)} years old is registering for a lower grade than the recommended one
                    </span>
                  </div>
                )}
              </div>
              
              <div className={styles.applicationText}>
                <p>
                  I hereby submit this application to the principal of Little Stars Preschool, requesting that my child be enrolled in the school.
                </p>
                <p>
                  I hereby agree to abide by the rules and regulations of the school.
                </p>
              </div>
              
              <div className={styles.signatureContainer}>
                <div className={styles.signatureParentSignature}>
                  <div className={styles.dateSection}>
                    <p>........, day ........ month ........ year {new Date().getFullYear()}</p>
                    <p className={styles.signatureLabel}>(Parent's signature and full name)</p>
                  </div>
                </div>
                
                <div className={`${styles.signature} ${styles.principalSignature}`}>
                  <div className={styles.dateSection}>
                    <p>PRINCIPAL</p>
                    
                    <div className={styles.signatureText}>
                      TaKKhoan
                      <div className={styles.signatureLine}></div>
                    </div>
                    <div>
                      Tạ Khắc Khoan
                    </div>
                    
                    {/* School stamp */}
                    <div className={styles.schoolStamp}>
                      <div className={styles.stampCircle}></div>
                      <div className={styles.stampInnerCircle}></div>
                      <div className={styles.stampTextTop}>PRESCHOOL</div>
                      <div className={styles.stampTextBottom}>LITTLE STARS</div>
                      <div className={styles.stampDate}>{new Date().getFullYear()}</div>
                      <div className={styles.stampApproved}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(183, 28, 28, 0.9)">
                          <path d="M12 3L14.94 8.34L21 9.27L16.5 13.33L17.75 19.34L12 16.67L6.25 19.34L7.5 13.33L3 9.27L9.06 8.34L12 3Z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.enrollmentFormActions}>
                <button 
                  type="button" 
                  className={styles.btnCancel}
                  onClick={() => navigate('/profile/children')}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Back
                </button>
                
                <button 
                  type="submit" 
                  className={styles.btnSubmit}
                  disabled={gradeLevels.length === 0}
                >
                  <FontAwesomeIcon icon="paper-plane" />
                  Complete enrollment
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
