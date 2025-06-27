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
 * Get students enrolled in an enrichment program by program ID
 * @param {number} programId - The ID of the enrichment program
 * @returns {Promise<Array>} List of students enrolled in the program
 */
export const getStudentsByEnrichmentId = async (programId) => {
  try {
    const response = await api.get(`/api/Children/getChildrenByEnrichmentId/${programId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching students for program ID ${programId}:`, error);
    throw error;
  }
};

/**
 * Get classes information
 * @returns {Promise<Array>} List of classes
 */
export const getAllClasses = async () => {
  try {
    const response = await api.get('/api/Class/get-all-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};