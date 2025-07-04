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
    console.log('Updating class with ID:', id);
    console.log('Request data:', JSON.stringify(classData));
    
    // Đảm bảo tất cả các trường đều là đúng định dạng
    const sanitizedData = {
      syllabusID: parseInt(classData.syllabusID) || 0, // Đảm bảo syllabusID là số nguyên
      name: classData.name,
      maxChildren: parseInt(classData.maxChildren) || 0
    };
    
    console.log('Sanitized data:', JSON.stringify(sanitizedData));
    // Sử dụng endpoint đúng: update-class
    const response = await api.put(`/api/Class/update-class/${id}`, sanitizedData);
    console.log('Update successful, response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating class with ID ${id}:`, error);
    
    // Log chi tiết lỗi để debug
    if (error.response) {
      // Lỗi từ server
      console.error('Server response:', error.response.status, error.response.data);
    } else if (error.request) {
      // Không nhận được response
      console.error('No response received:', error.request);
    } else {
      // Lỗi khi thiết lập request
      console.error('Request setup error:', error.message);
    }
    
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

// Updated isEnrichmentClass function
const isEnrichmentClass = (classItem) => {
  // Check if the class has an enrichment program ID or name
  return classItem.enrichmentProgramId || classItem.enrichmentProgramID || classItem.epName;
};
