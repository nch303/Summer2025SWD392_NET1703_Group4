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
    const response = await api.post('/api/Staff/assign-teacher', assignData);
    return response.data;
  } catch (error) {
    console.error('Error assigning teacher:', error);
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
