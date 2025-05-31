import api from '../../config/axiosConfig';

export const getCurrentUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await api.get('/api/Account/getCurrentAccount');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};


