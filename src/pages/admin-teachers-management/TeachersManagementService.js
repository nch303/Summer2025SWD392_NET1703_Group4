import api from '../../config/axiosConfig';

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
