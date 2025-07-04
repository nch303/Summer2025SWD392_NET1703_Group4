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

/**
 * Get invoice details for a child's enrollment in an enrichment program
 * @param {string} childId - Child's UUID
 * @param {number} enrichmentProgramId - Enrichment program ID
 * @returns {Promise<Array>} List of invoice details
 */
export const getEnrichmentInvoiceDetails = async (childId, enrichmentProgramId) => {
  try {
    const response = await api.get(`/api/Invoice/details/${childId}/${enrichmentProgramId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    throw error;
  }
};

/**
 * Kick a child from a class
 * @param {string} childId - Child's UUID
 * @param {number} classId - Class ID
 * @returns {Promise<Object>} Response from the API
 */
export const kickChildFromEnrichmentClass = async (childId, classId) => {
  try {
    const response = await api.delete(`/api/Staff/KickEnrichmentClassChildren/${childId}/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error kicking child from class:', error);
    throw error;
  }
};