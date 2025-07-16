import api from '../config/axiosConfig';
import { useUser } from '../contexts/UserContext'; // Import useUser hook nếu chưa có

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

/**
 * Get invoice details by invoice ID
 * @param {string} invoiceId - The invoice ID
 * @param {AbortSignal} signal - The AbortSignal for cancellation
 * @returns {Promise<Array>} List of invoice detail items
 */
export const getInvoiceDetails = async (invoiceId, signal) => {
    try {
      const response = await api.get('/api/InvoiceDetail', {
        params: { invoiceId },
        signal // Giữ signal cho cancelation
      });
      
      // Modify the description to include tuitionFeeName if available
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const firstItem = response.data[0];
        if (firstItem.description && firstItem.tuitionFeeName) {
          // Update the first line of the description to include tuitionFeeName
          const lines = firstItem.description.split('\n');
          if (lines.length > 0) {
            // Find the end of the first item name and insert tuitionFeeName before the price parenthesis
            const firstLine = lines[0];
            const match = firstLine.match(/^- (.+?)(\s*\(.+?\))/);
            if (match) {
              lines[0] = `- ${match[1]} - ${firstItem.tuitionFeeName}${match[2]}`;
              firstItem.description = lines.join('\n');
            }
          }
        }
      }
      
      return response.data;
    } catch (error) {
      // Không log lỗi nếu request bị cancel có chủ đích
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        throw error; // Chỉ throw lỗi mà không log
      }
      console.error(`Error fetching invoice details for ${invoiceId}:`, error);
      throw error;
    }
  };
  
  /**
   * Download invoice PDF by invoice ID
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Blob>} PDF file as blob
   */
  export const downloadInvoicePdf = async (invoiceId) => {
    try {
      const response = await api.get(`/api/Invoice/pdf/${invoiceId}`, {
        responseType: 'blob' // Quan trọng: thiết lập định dạng phản hồi là blob
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading invoice PDF for ${invoiceId}:`, error);
      throw error;
    }
  };
  
  /**
   * Get basic invoice information by ID
   * @param {string} invoiceId - The invoice ID
   * @returns {Promise<Object>} Invoice basic information
   */
  export const getInvoiceInfo = async (id) => {
    try {
      const response = await api.get(`/api/Invoice/${id}`);
      const { paymentLink, ...invoiceData } = response.data;
      return invoiceData;
    } catch (error) {
      console.error(`Error fetching invoice information for ${id}:`, error);
      throw error;
    }
  };