import api from '../../config/axiosConfig';

/**
 * Get all enrollment applications with their progress status for the current user
 * @returns {Promise} A promise that resolves to the list of enrollment applications with progress
 */
export const getEnrollmentApplicationsProgress = async () => {
  try {
    const response = await api.get('/api/EnrollmentApplication/view-applications-progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment applications progress:', error);
    throw error;
  }
};

/**
 * Get detailed information for a specific enrollment application
 * @param {string} eAId - The enrollment application ID
 * @returns {Promise} A promise that resolves to the application details
 */
export const getEnrollmentApplicationDetail = async (eAId) => {
  try {
    const response = await api.get(`/api/EnrollmentApplication/view-application-detail/${eAId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment application detail:', error);
    throw error;
  }
};

export default {
  getEnrollmentApplicationsProgress,
  getEnrollmentApplicationDetail
};