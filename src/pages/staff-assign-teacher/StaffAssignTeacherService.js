import api from '../../config/axiosConfig';

// Get all teachers
export const getAllTeachers = async () => {
  try {
    const response = await api.get('/api/Account/get-list-of-teachers');
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

// Assign teacher to class
export const assignTeacher = async (assignData) => {
  try {
    // Revert back to the original endpoint that was in the code
    const response = await api.post('/api/Staff/assign-teacher', assignData);
    
    return response.data;
  } catch (error) {
    console.error('Error assigning teacher:', error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Response error data:', error.response.data);
      
      if (error.response.status === 404) {
        throw new Error('API endpoint not found. The assign teacher API may have changed.');
      }
      
      throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data || {})}`);
    }
    
    throw error;
  }
};

// Get all classes
export const getAllClasses = async () => {
  try {
    const response = await api.get('/api/Class/get-all-classes');
    // Filter out deleted classes
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};
