import api from '../config/axiosConfig';

/**
 * Get notifications for the current user
 * @returns {Promise<Array>} List of notifications
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/api/Notification/GetNotificationsByCurrent');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {number} notificationId ID of the notification to mark as read
 * @returns {Promise} A promise that resolves when the notification is marked as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.post(`/api/Notification/MarkAsRead/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
