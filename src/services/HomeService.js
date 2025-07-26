import api from '../config/axiosConfig';

/**
 * Fetches the list of news for parents
 * @param {number} page - The page number
 * @param {number} pageSize - The number of items per page
 * @returns {Promise<Object>} The news data with pagination info
 */
export const getNewsForParent = async (page = 1, pageSize = 3) => {
  try {
    const response = await api.get('/api/News/get-list-of-news-for-parent', {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news for parents:', error);
    throw error;
  }
};

/**
 * Fetches the detail of a specific news article
 * @param {number} id - The news ID
 * @returns {Promise<Object>} The news detail
 */
export const getNewsDetail = async (id) => {
  try {
    const response = await api.get(`/api/News/${id}/view-news-detail`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news detail for ID ${id}:`, error);
    throw error;
  }
};
