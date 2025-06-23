import api from '../../config/axiosConfig';

// Get all news
export const getAllNews = async () => {
  try {
    const response = await api.get('/api/News/get-all-news');
    return response;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Get news by ID
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/api/News/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching news by id:', error);
    throw error;
  }
};

// Create news
export const createNews = async (newsData) => {
  try {
    const response = await api.post('/api/News/create-news', newsData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

// Update news
export const updateNews = async (id, newsData) => {
  try {
    const response = await api.put(`/api/News/update-news/${id}`, newsData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

// Delete news
export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/api/News/delete-news/${id}`);
    return response;
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};
