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
    const response = await api.put('/api/Auth/change-password', {
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    // Kiểm tra phản hồi từ API
    if (response.data === 'Change password successfully') {
      return { success: true, message: 'Đổi mật khẩu thành công!' };
    } else {
      throw new Error('Đổi mật khẩu không thành công');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    
    // Nếu server trả về thông báo cụ thể
    if (error.response && error.response.data) {
      if (error.response.data === 'Change password unsuccessfully') {
        throw new Error('Mật khẩu hiện tại không chính xác.');
      }
    }
    
    throw new Error('Không thể thay đổi mật khẩu. Vui lòng thử lại sau.');
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Object containing profile data to update
 * @param {string} profileData.fullName - User's full name
 * @param {string} profileData.phoneNumber - User's phone number
 * @param {string} profileData.address - User's address
 * @returns {Promise} - Promise resolving to API response
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/api/Account/update-user-profile', {
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber,
      address: profileData.address
    });
    
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Handling specific error responses
    if (error.response) {
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
    
    throw new Error('Không thể cập nhật hồ sơ. Vui lòng thử lại sau.');
  }
};


