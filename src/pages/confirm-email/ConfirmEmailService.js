import api from '../../config/axiosConfig';

/**
 * Confirm email
 * @param {string} token Confirmation token
 * @returns {Promise<Object>} Confirmation result
 */
export const confirmEmail = async (token) => {
    try{
      const response = await api.get(`api/Auth/confirm?token=${token}`);
      return response.data;
    } catch (error) {
        throw new Error(
          error.response?.data?.message ||
           'Email confirmation failed. Please try again or contact support.'
        );
    }
  };