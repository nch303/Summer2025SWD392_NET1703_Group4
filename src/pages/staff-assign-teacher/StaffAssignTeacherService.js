import api from '../../config/axiosConfig';

// Get all teachers
export const getAllTeachers = async () => {
  try {
    const response = await api.get('/api/Staff/GetTeachersNoClass');
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

// Assign teacher to class
export const assignTeacher = async (assignData) => {
  try {
    // Log the data being sent for debugging
    console.log('Sending assignment data:', assignData);
    
    // Extract the IDs and ensure correct types
    const classId = parseInt(assignData.classId); // Ensure it's an integer
    const teacherId = String(assignData.teacherId); // Ensure it's a string
    
    // Use query parameters instead of request body
    const response = await api.post(`/api/Staff/assign-teacher?classId=${classId}&teacherId=${teacherId}`);
    
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
