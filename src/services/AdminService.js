import api from '../config/axiosConfig';

// ==================== TUITION FEE SERVICES ====================

export const getAllTuitionFees = async () => {
  try {
    const response = await api.get('/api/Tuition/GetAllTuitionFees');
    return response.data;
  } catch (error) {
    console.error('Error fetching tuition fees:', error);
    throw error;
  }
};

export const getTuitionFeeById = async (id) => {
  try {
    const response = await api.get(`/api/Tuition/GetTuitionFeeById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tuition fee with ID ${id}:`, error);
    throw error;
  }
};

export const createTuitionFee = async (tuitionFeeData) => {
  try {
    console.log('Sending tuition fee data:', JSON.stringify(tuitionFeeData));
    const response = await api.post('/api/Tuition/CreateTuitionFee', tuitionFeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating tuition fee:', error.response?.data || error.message);
    throw error;
  }
};

export const updateTuitionFee = async (id, tuitionFeeData) => {
  try {
    console.log('Updating tuition fee data:', JSON.stringify(tuitionFeeData));
    const response = await api.put(`/api/Tuition/${id}`, tuitionFeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating tuition fee with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteTuitionFee = async (id) => {
  try {
    const response = await api.delete(`/api/Tuition/DeleteTuitionFee/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting tuition fee with ID ${id}:`, error);
    throw error;
  }
};

export const getGradeLevels = async () => {
  try {
    const response = await api.get('/api/GradeLevel/get-list-grade-level');
    return response.data;
  } catch (error) {
    console.error('Error fetching grade levels:', error);
    throw error;
  }
};

// ==================== ENRICHMENT PROGRAM SERVICES ====================

export const getAllEnrichmentPrograms = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs:', error);
    throw error;
  }
};

export const getEnrichmentProgramById = async (id) => {
  try {
    const response = await api.get(`/api/EnrichmentProgam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching enrichment program with ID ${id}:`, error);
    throw error;
  }
};

export const createEnrichmentProgram = async (programData) => {
  try {
    const response = await api.post('/api/EnrichmentProgam/create-enrichment-program', programData);
    return response.data;
  } catch (error) {
    console.error('Error creating enrichment program:', error);
    throw error;
  }
};

export const updateEnrichmentProgram = async (id, programData) => {
  try {
    const response = await api.put(`/api/EnrichmentProgam/${id}`, programData);
    return response.data;
  } catch (error) {
    console.error(`Error updating enrichment program with ID ${id}:`, error);
    throw error;
  }
};

export const deleteEnrichmentProgram = async (id) => {
  try {
    const response = await api.delete(`/api/EnrichmentProgam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting enrichment program with ID ${id}:`, error);
    throw error;
  }
};

export const restoreEnrichmentProgram = async (program) => {
  try {
    const updatedProgram = {
      ...program,
      isDelete: false
    };
    
    const response = await api.put(`/api/EnrichmentProgam/${program.id}`, updatedProgram);
    return response.data;
  } catch (error) {
    console.error(`Error restoring enrichment program with ID ${program.id}:`, error);
    throw error;
  }
};

export const getAllProgramTypes = async () => {
  try {
    const response = await api.get('/api/TypeProgram/GetAllTypes');
    return response.data;
  } catch (error) {
    console.error('Error fetching program types:', error);
    throw error;
  }
};

// ==================== ACCOUNT SERVICES ====================

export const fetchPaginatedAccounts = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get('/api/Account/AllAccounts', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await api.get('/api/Account/AllAccount');
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const changeAccountStatus = async (accountId, newStatus) => {
  try {
    const response = await api.put(`/api/Account/ChangeStatus/${accountId}`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error('Error changing account status:', error);
    throw error;
  }
};

export const createAccount = async (accountData) => {
  try {
    const response = await api.post('/api/Account/byAdmin', accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const fetchRoles = async () => {
  try {
    const response = await api.get('/api/Role');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const updateAccount = async (accountId, accountData) => {
  try {
    const response = await api.put(`/api/Account/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const fetchRoleById = async (roleId) => {
  try {
    const response = await api.get(`/api/Role/${roleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with ID ${roleId}:`, error);
    throw error;
  }
};

export const banAccount = async (accountId) => {
  try {
    const response = await api.delete(`/api/Account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error banning account:', error);
    throw error;
  }
};

export const restoreAccount = async (accountId) => {
  try {
    const response = await api.put(`/api/Account/restore-account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error restoring account:', error);
    throw error;
  }
};

export const searchAccounts = async (keyword, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get('/api/Account/Search', {
      params: { keyword, pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching accounts:', error);
    throw error;
  }
};

// ==================== STUDENTS SERVICES ====================

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

// ==================== SYLLABUS SERVICES ====================

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

// ==================== TEACHERS SERVICES ====================

/**
 * Fetches the list of teachers from the API
 * @param {number} pageNumber - The page number for pagination
 * @param {number} pageSize - The number of items per page
 * @returns {Promise} - The API response containing teachers data
 */
export const fetchTeachers = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get('/api/Account/get-list-of-teachers');
    
    // Ensure response.data is an array
    const teacherArray = Array.isArray(response.data) ? response.data : [];
    
    return {
      data: teacherArray,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalCount: teacherArray.length
    };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

/**
 * Updates a teacher account
 * @param {string} teacherId - The ID of the teacher account to update
 * @param {Object} teacherData - The updated teacher data
 * @returns {Promise} - The API response
 */
export const updateTeacher = async (teacherId, teacherData) => {
  try {
    const response = await api.put(`/api/Account/${teacherId}`, {
      fullName: teacherData.fullName,
      email: teacherData.email,
      password: teacherData.password || "",
      phoneNumber: teacherData.phoneNumber,
      address: teacherData.address || "",
      roleId: 3 // Assuming 3 is Teacher role ID
    });
    return response.data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
};

/**
 * Deletes/bans a teacher account
 * @param {string} teacherId - The ID of the teacher to delete/ban
 * @returns {Promise} - The API response
 */
export const deleteTeacher = async (teacherId) => {
  try {
    const response = await api.delete(`/api/Account/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw error;
  }
};

/**
 * Restores a previously deleted/banned teacher account
 * @param {string} teacherId - The ID of the teacher to restore
 * @returns {Promise} - The API response
 */
export const restoreTeacher = async (teacherId) => {
  try {
    const response = await api.put(`/api/Account/restore-account/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Error restoring teacher:', error);
    throw error;
  }
};

/**
 * Searches for teachers by keyword
 * @param {string} keyword - The search keyword
 * @param {number} pageNumber - The page number for pagination
 * @param {number} pageSize - The number of items per page
 * @returns {Promise} - The API response containing filtered teachers data
 */
export const searchTeachers = async (keyword, pageNumber = 1, pageSize = 10) => {
  try {
    // Sử dụng cả role và roleId để đảm bảo API chỉ trả về teacher
    const response = await api.get('/api/Account/Search', {
      params: { 
        keyword, 
        pageNumber, 
        pageSize, 
        role: 'Teacher',
        roleId: 3 // Thêm roleId để đảm bảo chỉ lấy giáo viên
      }
    });
    
    // Lọc lại kết quả trả về để chỉ lấy teacher (phòng trường hợp API không lọc đúng)
    let teacherData = response.data;
    
    // Nếu API trả về data không đúng định dạng, xử lý dữ liệu
    if (teacherData && teacherData.data) {
      // Lọc lại chỉ lấy giáo viên từ kết quả trả về
      const filteredTeachers = teacherData.data.filter(
        account => account.roleName === 'Teacher' || account.roleId === 3
      );
      
      return {
        ...teacherData,
        data: filteredTeachers,
        totalCount: filteredTeachers.length
      };
    }
    
    return teacherData;
  } catch (error) {
    console.error('Error searching teachers:', error);
    throw error;
  }
};

// ==================== CLASS SERVICES ====================

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

export const getAllGradeLevels = async () => {
  try {
    const response = await api.get('/api/GradeLevel/get-list-grade-level');
    return response.data;
  } catch (error) {
    console.error('Error fetching grade levels:', error);
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

// ==================== ANNOUNCEMENT SERVICES ====================

/**
 * Get all accounts from the system
 * @returns {Promise} Promise representing the API response with all accounts
 */
export const getAllAccounts = async () => {
  const res = await api.get('/api/Account/AllAccount');
  return res.data;
};

/**
 * Send announcement to selected accounts
 * @param {Object} data Object containing title, content, and accountIDs
 * @returns {Promise} Promise representing the API response
 */
export const sendAnnouncement = async (data) => {
  // Gửi thông báo
  const res = await api.post('/api/Notification/CreateNotification', data);
  return res.data;
}; 

// ==================== DASHBOARD SERVICES ====================

/**
 * Get dashboard data for a specific year
 * @param {number} year - The year for which to fetch dashboard data
 * @returns {Promise<Object>} Dashboard data including statistics and revenue
 */
export const getDashboardData = async (year) => {
  try {
    const response = await api.get(`/api/Dashboard/GetDashboardData?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Export dashboard data to Excel
 * @param {number} year - The year for which to export dashboard data
 * @returns {Promise<boolean>} True if export is successful, false otherwise
 */
export const exportDashboardToExcel = async (year) => {
  try {
    const response = await api.get(`/api/Dashboard/ExportToExcel?year=${year}`, {
      responseType: 'blob'
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
      : `Dashboard_${year}.xlsx`;
    
    link.setAttribute('download', filename);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting dashboard to Excel:', error);
    throw error;
  }
};

// ==================== NEWS SERVICES ====================

export const getAllNews = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/api/News/get-list-of-news?page=${page}&pageSize=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/api/News/${id}/view-news-detail`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news by id:', error);
    throw error;
  }
};

export const createNews = async (newsData) => {
  try {
    const response = await api.post('/api/News/create-news', newsData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

export const updateNews = async (id, newsData) => {
  try {
    const response = await api.put(`/api/News/update-news/${id}`, newsData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/api/News/delete-news/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

export const searchNews = async (keyword) => {
  try {
    const response = await api.get(`/api/News/search-news?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
};

export const updateNewsStatus = async (id, status) => {
  try {
    const newsData = new FormData();
    newsData.append('Id', id);
    newsData.append('Status', status);
    
    const response = await api.put(`/api/News/update-news/${id}`, newsData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating news status:', error);
    throw error;
  }
}; 