import api from '../../config/axiosConfig';

export const getAwaitingRefundInvoices = async () => {
  try {
    const response = await api.get('/api/Staff/GetAwaitingInvoices');
    return response.data;
  } catch (error) {
    console.error('Error fetching refund invoices:', error);
    throw error;
  }
};

export const processRefund = async (invoiceId) => {
  try {
    const response = await api.put(`/api/Staff/ProcessRefund/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};
