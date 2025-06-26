import api from '../../config/axiosConfig';

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