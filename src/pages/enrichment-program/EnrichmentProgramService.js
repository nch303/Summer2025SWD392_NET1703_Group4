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
 * Register for an enrichment program
 * @param {number} programId - The ID of the program to register for
 * @param {number} childId - The ID of the child to register
 * @returns {Promise<Object>} Registration result
 */
export const registerForProgram = async (programId, childId) => {
  try {
    const response = await api.post('/api/EnrichmentProgam/register', {
      programId,
      childId
    });
    return response.data;
  } catch (error) {
    console.error('Error registering for program:', error);
    throw error;
  }
};
