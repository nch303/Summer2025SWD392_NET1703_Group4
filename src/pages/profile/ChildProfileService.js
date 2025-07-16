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
 * Add a new child
 * @param {Object} childData - The child's information
 * @returns {Promise<Object>} Created child data
 */
export const addChild = async (childData) => {
  try {
    const response = await api.post('/api/Children', childData);
    return response.data;
  } catch (error) {
    console.error('Error creating child profile:', error);
    throw error;
  }
};

/**
 * Update child information
 * @param {string} childId - The child's ID
 * @param {Object} childData - Updated child information
 * @returns {Promise<Object>} Updated child data
 */
export const updateChild = async (childId, childData) => {
  try {
    const response = await api.put(`/api/Children/${childId}`, childData);
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