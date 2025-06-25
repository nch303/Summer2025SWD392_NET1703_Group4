import api from '../../config/axiosConfig';

/**

*Get list of news with pagination
*@param {number} page - Current page number
*@param {number} pageSize - Number of items per page
*@returns {Promise} - Promise with news data
*/
export const getNewsList = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get(`/api/News/get-list-of-news`, {
      params: {
        page,
        pageSize
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

/**
*Get news detail by id
*@param {number} id - News id
*@returns {Promise} - Promise with news detail
*/
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/api/News/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with id ${id}:`, error);
    throw error;
  }
};

/**
Get news detail view by id
@param {number} id - News id
@returns {Promise} - Promise with news detail view
*/
export const getNewsDetailView = async (id) => {
  try {
    const response = await api.get(`/api/News/${id}/view-news-detail`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news detail for id ${id}:`, error);
    throw error;
  }
};