import api from '../../config/axiosConfig';

export const getCurrentUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await api.get('/api/Account/getCurrentAccount');
    console.log('Profile data fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Handling specific error responses
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      if (error.response.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      if (error.response.status === 403) {
        throw new Error('Bạn không có quyền truy cập tài nguyên này.');
      }
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw error;
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Object containing password data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise} - Promise resolving to API response
 */
export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await api.post('/api/Account/changePassword', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Mật khẩu hiện tại không chính xác.');
      }
      if (error.response.status === 400 && error.response.data) {
        throw new Error(error.response.data.message || 'Vui lòng kiểm tra lại thông tin.');
      }
    }
    
    throw new Error('Không thể thay đổi mật khẩu. Vui lòng thử lại sau.');
  }
};


