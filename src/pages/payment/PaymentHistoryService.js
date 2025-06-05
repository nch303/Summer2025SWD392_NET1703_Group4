import api from '../../config/axiosConfig';
import { useUser } from '../../contexts/UserContext'; // Import useUser hook nếu chưa có

/**
 * Get payment history for the current user
 * @returns {Promise<Array>} List of payment transactions
 */
export const getUserPaymentHistory = async (userId) => {
  try {
    const response = await api.get('/api/Invoice/byAccountId', {
      params: {
        accountId: userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Get payment details by ID
 * @param {string} paymentId - The payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/api/Payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment details for ${paymentId}:`, error);
    throw error;
  }
};

/**
 * Get payment history for a specific child
 * @param {string} childId - The child's ID
 * @returns {Promise<Array>} List of payment transactions for the child
 */
export const getChildPaymentHistory = async (childId) => {
  try {
    const response = await api.get(`/api/Payments/child/${childId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment history for child ${childId}:`, error);
    throw error;
  }
};
