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

export const getStudentDetail = async (id) => {
  try {
    const response = await api.get(`/api/Children/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    throw error;
  }
};

export const getTeacherDetail = async (id) => {
  try {
    const response = await api.get(`/api/Account/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching teacher with ID ${id}:`, error);
    throw error;
  }
};

export const createClass = async (classData) => {
  try {
    const response = await api.post('/api/Class/create', classData);
    return response.data;
  } catch (error) {
    console.error('Error creating new class:', error);
    throw error;
  }
};

export const getAllSyllabi = async () => {
  try {
    const response = await api.get('/api/Syllabus/get-all-syllabi');
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabi:', error);
    throw error;
  }
};

export const getAllGradeLevels = async () => {
  try {
    const response = await api.get('/api/GradeLevel/get-list-grade-level');
    return response.data;
  } catch (error) {
    console.error('Error fetching grade levels:', error);
    throw error;
  }
};

export const getAllEnrichmentPrograms = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs:', error);
    throw error;
  }
};

export const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/api/Class/delete-class/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting class with ID ${id}:`, error);
    throw error;
  }
};

export const restoreClass = async (id) => {
  try {
    const response = await api.put(`/api/Class/restore-class/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error restoring class with ID ${id}:`, error);
    throw error;
  }
};
