import api from '../config/axiosConfig';

// ==================== CHILDREN MANAGEMENT ====================

/**
 * Lấy danh sách tất cả học sinh
 * @returns {Promise<Array>} Danh sách học sinh
 */
export const getAllChildren = async () => {
  try {
    const response = await api.get('/api/Children');
    return response.data;
  } catch (error) {
    console.error('Error fetching children:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết một học sinh theo ID
 * @param {string} id - ID của học sinh
 * @returns {Promise<Object>} Thông tin chi tiết học sinh
 */
export const getChildById = async (id) => {
  try {
    const response = await api.get(`/api/Children/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin học sinh với ID ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo mới học sinh
 * @param {Object} childData - Dữ liệu học sinh cần tạo
 * @returns {Promise<Object>} Thông tin học sinh đã tạo
 */
export const createChild = async (childData) => {
  try {
    const formData = new FormData();
    
    // Thêm các trường thông thường
    Object.keys(childData).forEach(key => {
      if (key !== 'avatar' && key !== 'birthCertificate') {
        formData.append(key, childData[key]);
      }
    });
    
    // Thêm tệp hình ảnh nếu có
    if (childData.avatar && childData.avatar instanceof File) {
      formData.append('avatar', childData.avatar);
    }
    
    if (childData.birthCertificate && childData.birthCertificate instanceof File) {
      formData.append('birthCertificate', childData.birthCertificate);
    }
    
    const response = await api.post('/api/Children', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo học sinh mới:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin học sinh
 * @param {string} id - ID của học sinh
 * @param {Object} childData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Thông tin học sinh sau khi cập nhật
 */
export const updateChild = async (id, childData) => {
  try {
    const formData = new FormData();
    
    // Thêm các trường thông thường
    Object.keys(childData).forEach(key => {
      if (key !== 'avatar' && key !== 'birthCertificate') {
        formData.append(key, childData[key]);
      }
    });
    
    // Thêm tệp hình ảnh nếu có
    if (childData.avatar && childData.avatar instanceof File) {
      formData.append('avatar', childData.avatar);
    }
    
    if (childData.birthCertificate && childData.birthCertificate instanceof File) {
      formData.append('birthCertificate', childData.birthCertificate);
    }
    
    const response = await api.put(`/api/Children/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật học sinh với ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa học sinh theo ID
 * @param {string} id - ID của học sinh cần xóa
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteChild = async (id) => {
  try {
    const response = await api.delete(`/api/Children/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa học sinh với ID ${id}:`, error);
    throw error;
  }
};

// ==================== ENROLLMENT APPLICATIONS ====================

/**
 * Lấy tất cả đơn đăng ký
 * @returns {Promise<Array>} Danh sách đơn đăng ký
 */
export const getAllApplications = async () => {
  try {
    const response = await api.get('/api/EnrollmentApplication/get-all-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết đơn đăng ký theo ID
 * @param {string} applicationId - ID của đơn đăng ký
 * @returns {Promise<Object>} Chi tiết đơn đăng ký
 */
export const getApplicationDetail = async (applicationId) => {
  try {
    const response = await api.get(`/api/EnrollmentApplication/view-application-detail/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

/**
 * Phê duyệt đơn đăng ký
 * @param {string} applicationId - ID của đơn đăng ký
 * @returns {Promise<Object>} Kết quả phê duyệt
 */
export const approveApplication = async (applicationId) => {
  try {
    const response = await api.put(`/api/EnrollmentApplication/approve-application?eAId=${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving application:', error);
    throw error;
  }
};

/**
 * Từ chối đơn đăng ký
 * @param {string} applicationId - ID của đơn đăng ký
 * @returns {Promise<Object>} Kết quả từ chối
 */
export const rejectApplication = async (applicationId) => {
  try {
    const response = await api.put(`/api/EnrollmentApplication/reject-application?eAId=${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }
};

/**
 * Tạo thông báo cho phụ huynh
 * @param {Object} notification - Dữ liệu thông báo
 * @returns {Promise<Object>} Kết quả tạo thông báo
 */
export const createNotification = async (notification) => {
  try {
    const response = await api.post('/api/Notification/CreateNotification', notification);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// ==================== CLASSES MANAGEMENT ====================

/**
 * Lấy tất cả các lớp học
 * @returns {Promise<Array>} Danh sách lớp học
 */
export const getAllClasses = async () => {
  try {
    const response = await api.get('/api/Class/get-all-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

/**
 * Lấy thông tin điểm danh của một lớp cụ thể
 * @param {string} classId - ID của lớp
 * @returns {Promise<Array>} Dữ liệu điểm danh
 */
export const getClassAttendance = async (classId) => {
  try {
    const response = await api.get(`/api/Attendance/${classId}/get-all-class-attendance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    throw error;
  }
};

/**
 * Lấy danh sách học sinh theo ID lớp
 * @param {string} classId - ID của lớp
 * @returns {Promise<Array>} Danh sách học sinh
 */
export const getStudentsByClassId = async (classId) => {
  try {
    const response = await api.get(`/api/Children/getChildrenByClassId/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class ID:', error);
    throw error;
  }
};

/**
 * Loại học sinh khỏi lớp học thông thường
 * @param {string} childId - ID của học sinh
 * @param {string} classId - ID của lớp
 * @returns {Promise<Object>} Kết quả
 */
export const kickStudentFromClass = async (childId, classId) => {
  try {
    const response = await api.delete(`/api/Staff/KickClassChildren/${childId}/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error kicking student from class:', error);
    throw error;
  }
};

/**
 * Loại học sinh khỏi lớp học bổ trợ
 * @param {string} childId - ID của học sinh
 * @param {string} classId - ID của lớp
 * @returns {Promise<Object>} Kết quả
 */
export const kickStudentFromEnrichmentClass = async (childId, classId) => {
  try {
    const response = await api.delete(`/api/Staff/KickEnrichmentClassChildren/${childId}/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error kicking student from enrichment class:', error);
    throw error;
  }
};

/**
 * Mở lớp học (chuyển trạng thái sang Available)
 * @param {string} classId - ID của lớp
 * @returns {Promise<Object>} Kết quả
 */
export const openClass = async (classId) => {
  try {
    const response = await api.post(`/api/Staff/openClass/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error opening class:', error);
    throw error;
  }
};

/**
 * Kết thúc lớp học (chuyển trạng thái sang Finished)
 * @param {Array} classIds - Danh sách ID lớp
 * @returns {Promise<Object>} Kết quả
 */
export const finishClass = async (classIds) => {
  try {
    const response = await api.put('/api/Staff/finish-class', classIds);
    return response.data;
  } catch (error) {
    console.error('Error finishing class:', error);
    throw error;
  }
};

/**
 * Nâng cấp học sinh
 * @param {Array} childrenIds - Danh sách ID học sinh
 * @returns {Promise<Object>} Kết quả
 */
export const upgradeStudents = async (childrenIds) => {
  try {
    const response = await api.put('/api/Staff/UpgradeForChildren', childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error upgrading students:', error);
    throw error;
  }
};

/**
 * Nâng cấp học sinh lớp bổ trợ
 * @param {string} classId - ID lớp
 * @param {Array} childrenIds - Danh sách ID học sinh
 * @returns {Promise<Object>} Kết quả
 */
export const upgradeEnrichmentStudents = async (classId, childrenIds) => {
  try {
    const response = await api.put(`/api/Staff/UpgradeEnrichmentChildren?classId=${classId}`, childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error upgrading enrichment students:', error);
    throw error;
  }
};

// ==================== STUDENT ASSIGNMENT ====================

/**
 * Lấy danh sách học sinh đã thanh toán học phí
 * @returns {Promise<Array>} Danh sách học sinh
 */
export const getPaidChildren = async () => {
  try {
    const response = await api.get('/api/Staff/GetInActiveChildrenGrades');
    return response.data;
  } catch (error) {
    console.error('Error fetching children:', error);
    throw new Error('Failed to fetch children list');
  }
};

/**
 * Phân công học sinh vào lớp
 * @param {string} classId - ID lớp
 * @param {Array} childrenIds - Danh sách ID học sinh
 * @returns {Promise<Object>} Kết quả
 */
export const assignChildrenToClass = async (classId, childrenIds) => {
  try {
    const response = await api.post(`/api/Staff/AssignChildrenToClass/${classId}`, childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error assigning children to class:', error);
    throw new Error('Failed to assign students to class');
  }
};

// ==================== TEACHER ASSIGNMENT ====================

/**
 * Lấy danh sách giáo viên chưa được phân công lớp
 * @returns {Promise<Array>} Danh sách giáo viên
 */
export const getAllTeachers = async () => {
  try {
    const response = await api.get('/api/Staff/GetTeachersNoClass');
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

/**
 * Phân công giáo viên cho lớp
 * @param {Object} assignData - Dữ liệu phân công
 * @returns {Promise<Object>} Kết quả
 */
export const assignTeacher = async (assignData) => {
  try {
    // Log the data being sent for debugging
    console.log('Sending assignment data:', assignData);
    
    // Extract the IDs and ensure correct types
    const classId = parseInt(assignData.classId); // Ensure it's an integer
    const teacherId = String(assignData.teacherId); // Ensure it's a string
    
    // Use query parameters instead of request body
    const response = await api.post(`/api/Staff/assign-teacher?classId=${classId}&teacherId=${teacherId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error assigning teacher:', error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Response error data:', error.response.data);
      
      if (error.response.status === 404) {
        throw new Error('API endpoint not found. The assign teacher API may have changed.');
      }
      
      throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data || {})}`);
    }
    
    throw error;
  }
};

// ==================== REFUND MANAGEMENT ====================

export const getAwaitingRefundInvoices = async () => {
  try {
    const response = await api.get('/api/Staff/GetAwaitingInvoices');
    return response.data;
  } catch (error) {
    console.error('Error fetching refund invoices:', error);
    throw error;
  }
};

export const processRefund = async (invoiceId) => {
  try {
    const response = await api.put(`/api/Staff/ProcessRefund/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};
