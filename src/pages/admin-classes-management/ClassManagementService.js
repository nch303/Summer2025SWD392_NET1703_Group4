import api from '../../config/axiosConfig';

export const getAllClasses = async () => {
  try {
    const response = await api.get('/api/Class/get-all-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

export const getClassById = async (id) => {
  try {
    const response = await api.get(`/api/Class/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class with ID ${id}:`, error);
    throw error;
  }
};

export const getClassDetail = async (id) => {
  try {
    const response = await api.get(`/api/Class/get-class-detail/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class detail with ID ${id}:`, error);
    throw error;
  }
};

export const updateClass = async (id, classData) => {
  try {
    const response = await api.put(`/api/Class/update-class/${id}`, classData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class with ID ${id}:`, error);
    throw error;
  }
};
