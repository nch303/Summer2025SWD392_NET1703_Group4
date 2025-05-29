import api from '../../config/axiosConfig';

/**
 * Register a new user
 * @param {Object} userData User registration data
 * @returns {Promise<Object>} Registration result message
 */
export const registerUser = async (userData) => {
    try {
      const response = await api.post('/api/Auth/register', {
        fullName: userData.name,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phone
      });
      
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        'Đăng ký thất bại. Vui lòng thử lại sau.'
      );
    }
  };