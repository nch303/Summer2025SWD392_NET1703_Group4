import api from '../../config/axiosConfig';

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