import axios from '../../config/axiosConfig';

// Lấy danh sách học sinh của lớp học
export const getStudentsByClassId = async (classId) => {
  try {
    const response = await axios.get(`/api/Children/getChildrenByClassId/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Tính tuổi từ ngày sinh
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

// Format ngày sinh
export const formatBirthday = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// Lấy thông tin chi tiết của học sinh
export const getStudentDetail = async (studentId) => {
  try {
    const response = await axios.get(`/api/Children/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student detail:', error);
    throw error;
  }
};
