import api from '../../config/axiosConfig';

// Fetch child details by ID
export const getChildById = async (childId) => {
  try {
    const response = await api.get(`/api/Children/${childId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching child details:', error);
    throw error;
  }
};

// Fetch parent details by ID
export const getParentById = async (parentId) => {
  try {
    const response = await api.get(`/api/Account/${parentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching parent details:', error);
    throw error;
  }
};

// Submit enrollment application
export const submitEnrollmentApplication = async (childID, applicationData) => {
  try {
    const response = await api.post(`/api/EnrollmentApplication/submit-application?childID=${childID}`, applicationData);
    return response.data;
  } catch (error) {
    console.error('Error submitting enrollment application:', error);
    throw error;
  }
};

// Get available grade levels
export const getGradeLevels = async () => {
  try {
    const response = await api.get('/api/GradeLevel/get-list-grade-level');
    return response.data;
  } catch (error) {
    console.error('Error fetching grade levels:', error);
    throw error;
  }
};
