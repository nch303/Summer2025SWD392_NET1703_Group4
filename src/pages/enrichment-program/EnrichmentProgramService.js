import api from '../../config/axiosConfig';

/**
 * Get all enrichment programs
 * @returns {Promise<Array>} List of enrichment programs
 */
export const getAllEnrichmentPrograms = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs:', error);
    throw error;
  }
};

/**
 * Get all enrichment programs for parents
 * @returns {Promise<Array>} List of enrichment programs for parents
 */
export const getAllEnrichmentProgramsForParent = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program-for-parent');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs for parent:', error);
    throw error;
  }
};

/**
 * Get children by parent ID
 * @param {string} parentId - The ID of the parent
 * @returns {Promise<Array>} List of children
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
 * Register for an enrichment program
 * @param {string} enrichmentId - The ID of the program to register for
 * @param {Array<string>} childrenIds - Array of child IDs to register
 * @returns {Promise<Object>} Registration result
 */
export const registerForProgram = async (enrichmentId, childrenIds) => {
  try {
    const response = await api.post(`/api/Class/assign-children-to-enrichmentClass/${enrichmentId}`, childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error registering for program:', error);
    throw error;
  }
};
