import api from '../config/axiosConfig';

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

/**
 * Get all children for a specific parent
 * @param {string} parentId - ID của phụ huynh
 * @returns {Promise<Array>} Danh sách trẻ
 */
export const getChildrenByParentId = async (parentId) => {
    try {
      const response = await api.get(`/api/Children/byParentId/${parentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  };
  
  /**
   * Get a specific child by ID
   * @param {string} childId - The child's ID
   * @returns {Promise<Object>} Child data
   */
  export const getChildById = async (childId) => {
    try {
      const response = await api.get(`/api/Children/${childId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching child ${childId}:`, error);
      throw error;
    }
  };
  
  /**
   * Add a new child with multipart/form-data support
   * @param {Object} childData - The child's information including files
   * @returns {Promise<Object>} Created child data
   */
  export const addChild = async (childData) => {
    try {
      // Tạo FormData object để gửi dữ liệu dạng multipart
      const formData = new FormData();
      
      // Thêm các thông tin cơ bản - chỉ giữ lại các trường cần thiết
      formData.append('Name', childData.name);
      formData.append('Birthday', childData.birthday);
      formData.append('Gender', childData.gender);
      formData.append('City', childData.city || '');
      
      // Nếu có file avatar, thêm vào form data
      if (childData.avatarFile) {
        formData.append('Avatar', childData.avatarFile);
      }
      
      // Nếu có file giấy khai sinh, thêm vào form data
      if (childData.birthCertificateFile) {
        formData.append('BirthCertificate', childData.birthCertificateFile);
      }
      
      // Không có thông tin phụ huynh
      
      // Gửi request với header đúng định dạng
      const response = await api.post('/api/Children', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating child profile:', error);
      throw error;
    }
  };
  
  /**
   * Update child information with multipart/form-data support
   * @param {string} childId - The child's ID
   * @param {Object} childData - Updated child information including files
   * @returns {Promise<Object>} Updated child data
   */
  export const updateChild = async (childId, childData) => {
    try {
      // Tạo FormData object để gửi dữ liệu dạng multipart
      const formData = new FormData();
      
      // Thêm các thông tin cơ bản
      formData.append('Name', childData.name);
      formData.append('Birthday', childData.birthday);
      formData.append('Gender', childData.gender);
      formData.append('City', childData.city || '');
      
      // Nếu có file avatar, thêm vào form data
      if (childData.avatarFile) {
        formData.append('Avatar', childData.avatarFile);
      }
      
      // Nếu có file giấy khai sinh, thêm vào form data
      if (childData.birthCertificateFile) {
        formData.append('BirthCertificate', childData.birthCertificateFile);
      }
      
      // Gửi request với header đúng định dạng
      const response = await api.put(`/api/Children/${childId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating child ${childId}:`, error);
      throw error;
    }
  };
  
  /**
   * Delete a child profile
   * @param {string} childId - The child's ID
   * @returns {Promise<Object>} Result of deletion
   */
  export const deleteChild = async (childId) => {
    try {
      const response = await api.delete(`/api/Children/${childId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting child ${childId}:`, error);
      throw error;
    }
  }; 
  
  /**
   * Get child class information including class details, attendance records, and teachers
   * @param {string} childId - The child's ID
   * @returns {Promise<Array>} Child class information data
   */
  export const getChildClassInfo = async (childId) => {
    try {
      const response = await api.get(`/api/ClassChildren/GetByChildID/${childId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching child class info for ${childId}:`, error);
      throw error;
    }
  }; 

