import api from '../../config/axiosConfig';

/**
 * Send forgot password request to reset user's password
 * @param {string} email - User's email address
 * @returns {Promise<string>} - Success message from the server
 * @throws {Error} - If request fails
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/Auth/forgot-password', { email });
    
    if (response.data === 'Reset email sent successfully') {
      return response.data;
    } else {
      throw new Error('Could not process your request at this time.');
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    
    if (error.response) {
      // Xử lý các mã lỗi cụ thể
      if (error.response.status === 404) {
        throw new Error('Email không tồn tại trong hệ thống.');
      } else if (error.response.data) {
        throw new Error(error.response.data);
      }
    }
    
    throw new Error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
  }
};
