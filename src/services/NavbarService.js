import api from '../config/axiosConfig';

/**
 * Get the current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    const response = await api.get('/api/Account/getCurrentAccount');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
};
