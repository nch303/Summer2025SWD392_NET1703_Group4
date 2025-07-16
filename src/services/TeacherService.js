import api from '../config/axiosConfig';

// ==================== TEACHER CLASSES ====================

/**
 * Lấy danh sách lớp học theo ID của giảng viên
 * @param {string} teacherId - ID của giảng viên
 * @returns {Promise<Array>} Danh sách lớp học
 */
export const getClassesByTeacherId = async (teacherId) => {
  try {
    const response = await api.get(`/api/Class/get-classes-by-teacherId/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    throw error;
  }
};

/**
 * Hàm để xử lý trạng thái hiển thị của lớp học
 * @param {string} status - Trạng thái lớp học
 * @returns {string} Màu tương ứng với trạng thái
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'Available':
      return 'success';
    case 'Full':
      return 'error';
    case 'In Progress':
      return 'processing';
    default:
      return 'default';
  }
};

// ==================== ATTENDANCE MANAGEMENT ====================

/**
 * Lấy thông tin điểm danh cho ngày hôm nay
 * @param {string} classId - ID của lớp học
 * @returns {Promise<Array>} Dữ liệu điểm danh
 */
export const getTodayAttendance = async (classId) => {
  try {
    const response = await api.get(`/api/Attendance/${classId}/teacher-today`);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    throw error;
  }
};

/**
 * Cập nhật dữ liệu điểm danh
 * @param {Array} attendanceRecords - Dữ liệu điểm danh cần cập nhật
 * @returns {Promise<Object>} Kết quả cập nhật
 */
export const updateAttendanceRecords = async (attendanceRecords) => {
  try {
    const response = await api.put("/api/Attendance/update", attendanceRecords);
    return response.data;
  } catch (error) {
    console.error("Error updating attendance records:", error);
    throw error;
  }
};

/**
 * Lấy tất cả dữ liệu điểm danh của một lớp
 * @param {string} classId - ID của lớp học
 * @returns {Promise<Array>} Danh sách điểm danh
 */
export const getAllClassAttendance = async (classId) => {
  try {
    const response = await api.get(`/api/Attendance/${classId}/get-all-class-attendance`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all class attendance:", error);
    throw error;
  }
};

// ==================== STUDENT MANAGEMENT ====================

/**
 * Lấy danh sách học sinh của lớp học
 * @param {string} classId - ID của lớp học
 * @returns {Promise<Array>} Danh sách học sinh
 */
export const getStudentsByClassId = async (classId) => {
  try {
    const response = await api.get(`/api/Children/getChildrenByClassId/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Tính tuổi từ ngày sinh
 * @param {string} birthday - Ngày sinh
 * @returns {number} Tuổi
 */
export const calculateAge = (birthday) => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format ngày sinh
 * @param {string} dateString - Chuỗi ngày sinh
 * @returns {string} Ngày sinh đã format
 */
export const formatBirthday = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

/**
 * Lấy thông tin chi tiết của học sinh
 * @param {string} studentId - ID của học sinh
 * @returns {Promise<Object>} Thông tin chi tiết học sinh
 */
export const getStudentDetail = async (studentId) => {
  try {
    const response = await api.get(`/api/Children/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student detail:', error);
    throw error;
  }
};

// ==================== SYLLABUS MANAGEMENT ====================

/**
 * Lấy danh sách tất cả giáo trình
 * @returns {Promise<Array>} Danh sách giáo trình
 */
export const getAllSyllabi = async () => {
  try {
    const response = await api.get('/api/Syllabus/get-all-syllabi');
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabi:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một giáo trình
 * @param {string} syllabusId - ID của giáo trình
 * @returns {Promise<Object>} Thông tin chi tiết giáo trình
 */
export const getSyllabusById = async (syllabusId) => {
  try {
    const response = await api.get(`/api/Syllabus/${syllabusId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabus details:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết các buổi học của giáo trình
 * @param {string} syllabusId - ID của giáo trình
 * @returns {Promise<Array>} Chi tiết các buổi học
 */
export const getSyllabusDetailById = async (syllabusId) => {
  try {
    const response = await api.get(`/api/SyllabusDetail/${syllabusId}/get-all-syllabus-detail`);
    return response.data;
  } catch (error) {
    console.error('Error fetching syllabus slot details:', error);
    throw error;
  }
};
