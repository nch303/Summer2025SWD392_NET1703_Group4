import api from '../../config/axiosConfig';

// Lấy danh sách tất cả giáo trình
export const getAllSyllabi = async () => {
  try {
    const response = await api.get('/api/Syllabus/get-all-syllabi');
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabi:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết của một giáo trình theo ID
export const getSyllabusById = async (id) => {
  try {
    const response = await api.get(`/api/Syllabus/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching syllabus with ID ${id}:`, error);
    throw error;
  }
};

// Tạo giáo trình mới
export const createSyllabus = async (syllabusData) => {
  try {
    const response = await api.post('/api/Syllabus/create-syllabus', syllabusData);
    return response.data;
  } catch (error) {
    console.error('Error creating syllabus:', error);
    throw error;
  }
};

// Tạo chi tiết giáo trình
export const createSyllabusDetails = async (syllabusId, detailsData) => {
  try {
    const response = await api.post(`/api/SyllabusDetail/${syllabusId}/create-syllabus-detail`, detailsData);
    return response.data;
  } catch (error) {
    console.error('Error creating syllabus details:', error);
    throw error;
  }
};

// Xóa giáo trình
export const deleteSyllabus = async (syllabusId) => {
  try {
    const response = await api.delete(`/api/Syllabus/${syllabusId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting syllabus with ID ${syllabusId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Add this function to AdminSyllabusService.js
export const getSyllabusDetails = async (syllabusId) => {
  try {
    const response = await api.get(`/api/SyllabusDetail/${syllabusId}/get-all-syllabus-detail`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching syllabus details for ID ${syllabusId}:`, error);
    throw error;
  }
};

// Update multiple syllabi
export const updateMultipleSyllabi = async (syllabusDataArray) => {
  try {
    const response = await api.put('/update-syllabus', syllabusDataArray);
    return response.data;
  } catch (error) {
    console.error('Error updating multiple syllabi:', error);
    throw error;
  }
};

// Update syllabus detail - sửa lại đúng API endpoint từ screenshot của bạn
export const updateSyllabusDetail = async (detailId, detailData) => {
  try {
    console.log(`Updating syllabus detail with ID ${detailId}:`, detailData);
    const response = await api.put(`/api/SyllabusDetail/${detailId}/update-syllabus`, detailData);
    return response.data;
  } catch (error) {
    console.error(`Error updating syllabus detail with ID ${detailId}:`, error);
    throw error;
  }
};
