import api from '../../config/axiosConfig';

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