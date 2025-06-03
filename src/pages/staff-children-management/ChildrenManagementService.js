import api from '../../config/axiosConfig';

/**
 * Lấy danh sách tất cả học sinh
 * @param {Object} params - Tham số tùy chọn cho query
 * @returns {Promise<Array>} Danh sách học sinh
 */
export const getAllChildren = async () => {
  try {
    const response = await api.get('/api/Children');
    return response.data;
  } catch (error) {
    console.error('Error fetching children:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết một học sinh theo ID
 * @param {string} id - ID của học sinh
 * @returns {Promise<Object>} Thông tin chi tiết học sinh
 */
export const getChildById = async (id) => {
  try {
    const response = await api.get(`/api/Children/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin học sinh với ID ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo mới học sinh
 * @param {Object} childData - Dữ liệu học sinh cần tạo
 * @returns {Promise<Object>} Thông tin học sinh đã tạo
 */
export const createChild = async (childData) => {
  try {
    const formData = new FormData();
    
    // Thêm các trường thông thường
    Object.keys(childData).forEach(key => {
      if (key !== 'avatar' && key !== 'birthCertificate') {
        formData.append(key, childData[key]);
      }
    });
    
    // Thêm tệp hình ảnh nếu có
    if (childData.avatar && childData.avatar instanceof File) {
      formData.append('avatar', childData.avatar);
    }
    
    if (childData.birthCertificate && childData.birthCertificate instanceof File) {
      formData.append('birthCertificate', childData.birthCertificate);
    }
    
    const response = await api.post('/api/Children', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo học sinh mới:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin học sinh
 * @param {string} id - ID của học sinh
 * @param {Object} childData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Thông tin học sinh sau khi cập nhật
 */
export const updateChild = async (id, childData) => {
  try {
    const formData = new FormData();
    
    // Thêm các trường thông thường
    Object.keys(childData).forEach(key => {
      if (key !== 'avatar' && key !== 'birthCertificate') {
        formData.append(key, childData[key]);
      }
    });
    
    // Thêm tệp hình ảnh nếu có
    if (childData.avatar && childData.avatar instanceof File) {
      formData.append('avatar', childData.avatar);
    }
    
    if (childData.birthCertificate && childData.birthCertificate instanceof File) {
      formData.append('birthCertificate', childData.birthCertificate);
    }
    
    const response = await api.put(`/api/Children/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật học sinh với ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa học sinh theo ID
 * @param {string} id - ID của học sinh cần xóa
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteChild = async (id) => {
  try {
    const response = await api.delete(`/api/Children/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa học sinh với ID ${id}:`, error);
    throw error;
  }
};