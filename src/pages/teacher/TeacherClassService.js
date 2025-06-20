import axios from '../../config/axiosConfig';

// Lấy danh sách lớp học theo ID của giảng viên
export const getClassesByTeacherId = async (teacherId) => {
  try {
    const response = await axios.get(`/api/Class/get-classes-by-teacherId/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    throw error;
  }
};

// Hàm để xử lý trạng thái hiển thị của lớp học
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
