import api from '../../config/axiosConfig';

/**
 * Login user with email and password
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise<Object>} User data with token
 */
export const loginUser = async (email, password) => {
    try {
      const response = await api.post('/api/Auth/login', {
        email,
        password
      });
      
      // Store token in localStorage - token now comes with "Bearer " prefix included
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Check for the specific account activation error message
      if (error.response?.status === 400 && 
          error.response?.data?.message === "Account is not activated. Please check your email.") {
        throw new Error("Account is not activated. Please check your email.");
      }
      
      throw new Error(
        error.response?.data?.message || 
        'Failed to login. Please check your credentials and try again.'
      );
    }
  };