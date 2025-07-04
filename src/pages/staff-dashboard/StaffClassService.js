import api from '../../config/axiosConfig';

// Get all classes
export const getAllClasses = async () => {
  try {
    const response = await api.get('/api/Class/get-all-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

// Get attendance for a specific class
export const getClassAttendance = async (classId) => {
  try {
    const response = await api.get(`/api/Attendance/${classId}/get-all-class-attendance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    throw error;
  }
};

// Get students by class ID
export const getStudentsByClassId = async (classId) => {
  try {
    const response = await api.get(`/api/Children/getChildrenByClassId/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class ID:', error);
    throw error;
  }
};

// Kick a student from a regular class
export const kickStudentFromClass = async (childId, classId) => {
  try {
    const response = await api.delete(`/api/Staff/KickClassChildren/${childId}/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error kicking student from class:', error);
    throw error;
  }
};

// Kick a student from an enrichment class
export const kickStudentFromEnrichmentClass = async (childId, classId) => {
  try {
    const response = await api.delete(`/api/Staff/KickEnrichmentClassChildren/${childId}/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error kicking student from enrichment class:', error);
    throw error;
  }
};

// Open a class (change status to Available)
export const openClass = async (classId) => {
  try {
    const response = await api.post(`/api/Staff/openClass/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error opening class:', error);
    throw error;
  }
};

// Finish a class (change status to Finished)
export const finishClass = async (classIds) => {
  try {
    const response = await api.put('/api/Staff/finish-class', classIds);
    return response.data;
  } catch (error) {
    console.error('Error finishing class:', error);
    throw error;
  }
};

// Upgrade students
export const upgradeStudents = async (childrenIds) => {
  try {
    const response = await api.put('/api/Staff/UpgradeForChildren', childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error upgrading students:', error);
    throw error;
  }
};

// Upgrade enrichment students
export const upgradeEnrichmentStudents = async (classId, childrenIds) => {
  try {
    const response = await api.put(`/api/Staff/UpgradeEnrichmentChildren?classId=${classId}`, childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error upgrading enrichment students:', error);
    throw error;
  }
};
