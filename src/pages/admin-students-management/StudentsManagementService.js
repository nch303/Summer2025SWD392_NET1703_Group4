import api from '../../config/axiosConfig';

// Get all students
export const fetchAllStudents = async () => {
  return await api.get('/api/Children');
};

// Search students by query
export const searchStudents = async (query) => {
  return await api.get(`/api/Children/search?query=${encodeURIComponent(query)}`);
};

// Update student
export const updateStudent = async (id, studentData) => {
  return await api.put(`/api/Children/${id}`, studentData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
