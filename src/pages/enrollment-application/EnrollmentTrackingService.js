import api from '../../config/axiosConfig';

/**
 * Get all enrollment applications with their progress status for the current user
 * @returns {Promise} A promise that resolves to the list of enrollment applications with progress
 */
export const getEnrollmentApplicationsProgress = async () => {
  try {
    const response = await api.get('/api/EnrollmentApplication/view-applications-progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment applications progress:', error);
    throw error;
  }
};

/**
 * Get detailed information for a specific enrollment application
 * @param {string} eAId - The enrollment application ID
 * @returns {Promise} A promise that resolves to the application details
 */
export const getEnrollmentApplicationDetail = async (eAId) => {
  try {
    const response = await api.get(`/api/EnrollmentApplication/view-application-detail/${eAId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment application detail:', error);
    throw error;
  }
};

/**
 * Create payment URL for enrollment application
 * @param {string} childrenID - The ID of the child
 * @returns {Promise} A promise that resolves to the payment URL response
 */
export const createPaymentUrlForEnrollment = async (childrenID) => {
  try {
    console.log('Creating payment with childrenID:', childrenID);
    
    const paymentData = {
      orderType: "Enrollment",
      orderDescription: "ProcessEnrollmentPayment",
      name: "Thanh toan phi nhap hoc",
      childrenID: childrenID
    };
    
    console.log('Payment request payload:', paymentData);
    
    // Add timeout and headers for better debugging
    const response = await api.post('/api/vnpay/create-payment-url-for-enrollment', paymentData, {
      timeout: 30000, // Increase timeout to 30 seconds
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Payment API response:', response.data);
    return response.data;
  } catch (error) {
    // Detailed error logging
    console.error('Error creating payment URL:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
    }
    
    throw error;
  }
};

export default {
  getEnrollmentApplicationsProgress,
  getEnrollmentApplicationDetail,
  createPaymentUrlForEnrollment
};