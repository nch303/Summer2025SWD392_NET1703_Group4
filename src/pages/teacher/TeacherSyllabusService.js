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

// Lấy thông tin chi tiết của một giáo trình
export const getSyllabusById = async (syllabusId) => {
  try {
    const response = await api.get(`/api/Syllabus/${syllabusId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabus details:', error);
    throw error;
  }
};

// Lấy thông tin chi tiết các buổi học của giáo trình
export const getSyllabusDetailById = async (syllabusId) => {
  try {
    const response = await api.get(`/api/SyllabusDetail/${syllabusId}/get-all-syllabus-detail`);
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabus slot details:', error);
    throw error;
  }
};
