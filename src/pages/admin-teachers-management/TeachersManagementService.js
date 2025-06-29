import api from '../../config/axiosConfig';

/**
 * Fetches the list of teachers from the API
 * @param {number} pageNumber - The page number for pagination
 * @param {number} pageSize - The number of items per page
 * @returns {Promise} - The API response containing teachers data
 */
export const fetchTeachers = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get('/api/Account/get-list-of-teachers', {
      params: { pageNumber, pageSize }
    });
    return response.data;
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
    const response = await api.put(`/api/Account/${teacherId}`, teacherData);
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
    const response = await api.get('/api/Account/Search', {
      params: { keyword, pageNumber, pageSize, role: 'Teacher' }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching teachers:', error);
    throw error;
  }
};
