import api from '../config/axiosConfig';

/**
 * Get tuition fees for the current account
 * @returns {Promise} A promise that resolves to the list of tuition fees
 */
export const getTuitionFeesByCurrentAccount = async () => {
  try {
    const response = await api.get('/api/Tuition/GetTuitionFeeByCurrentAccount');
    return response.data;
  } catch (error) {
    console.error('Error fetching tuition fees:', error);
    throw error;
  }
};

/**
 * Create payment URL for tuition fees
 * @param {string} childrenID - The ID of the child
 * @param {number[]} tuitionFeeIds - Array of tuition fee IDs to pay
 * @param {number} totalAmount - Total payment amount
 * @returns {Promise} A promise that resolves to the payment URL response
 */
export const createPaymentUrlForTuitionFee = async (childrenID, tuitionFeeIds, totalAmount) => {
  try {
    const paymentData = {
      orderType: "TuitionFee",
      amount: totalAmount,
      orderDescription: "ProcessTuitionFee",
      name: "Thanh toan phi hoc hang thang",
      childrenID: childrenID,
      tuitionFeeIds: tuitionFeeIds
    };
    
    const response = await api.post('/api/vnpay/create-payment-url-for-tuitionFee', paymentData, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    throw error;
  }
};

export default {
  getTuitionFeesByCurrentAccount,
  createPaymentUrlForTuitionFee
};
