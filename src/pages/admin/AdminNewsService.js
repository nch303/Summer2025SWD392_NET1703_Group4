import api from '../../config/axiosConfig';

// Get all news with pagination
export const getAllNews = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/api/News/get-list-of-news?page=${page}&pageSize=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Get news by ID
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/api/News/${id}/view-news-detail`);
    return response.data;
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
    return response.data;
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
    return response.data;
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

// Delete news
export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/api/News/delete-news/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

// Search news - Fixed: Using keyword parameter instead of searchTerm
export const searchNews = async (keyword) => {
  try {
    const response = await api.get(`/api/News/search-news?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
};

// Update news status
export const updateNewsStatus = async (id, status) => {
  try {
    const response = await api.put(`/api/News/update-news-status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating news status:', error);
    throw error;
  }
};
