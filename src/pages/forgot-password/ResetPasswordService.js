import api from '../../config/axiosConfig';

/**
 * Reset user password with token and new password
 * @param {string} token - Reset password token
 * @param {string} newPassword - New password
 * @returns {Promise<string>} - Success message
 * @throws {Error} - If request fails
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.put('/api/Auth/reset-password', {
      token,
      newPassword
    });
    
    if (response.data === 'Password reset successfully') {
      return response.data;
    } else {
      throw new Error('Could not reset password. Please try again.');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    
    // Handle specific error messages
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    
    // Handle common error cases
    if (error.response?.status === 400) {
      throw new Error('Token and new password are required');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid or expired token');
    } else if (error.response?.status === 410) {
      throw new Error('The reset password link has expired. Please request a new one.');
    }
    
    throw new Error('Could not reset password. Please try again later.');
  }
};