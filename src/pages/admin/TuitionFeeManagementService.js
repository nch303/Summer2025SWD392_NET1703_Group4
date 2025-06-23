import api from '../../config/axiosConfig';

// Fetch all tuition fees
export const getAllTuitionFees = async () => {
  try {
    const response = await api.get('/api/Tuition/GetAllTuitionFees');
    return response.data;
  } catch (error) {
    console.error('Error fetching tuition fees:', error);
    throw error;
  }
};

// Get tuition fee by ID
export const getTuitionFeeById = async (id) => {
  try {
    const response = await api.get(`/api/Tuition/GetTuitionFeeById/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tuition fee with ID ${id}:`, error);
    throw error;
  }
};

// Create new tuition fee
export const createTuitionFee = async (tuitionFeeData) => {
  try {
    console.log('Sending tuition fee data:', JSON.stringify(tuitionFeeData));
    const response = await api.post('/api/Tuition/CreateTuitionFee', tuitionFeeData);
    return response.data;
  } catch (error) {
    console.error('Error creating tuition fee:', error.response?.data || error.message);
    throw error;
  }
};

// Update tuition fee
export const updateTuitionFee = async (id, tuitionFeeData) => {
  try {
    console.log('Updating tuition fee data:', JSON.stringify(tuitionFeeData));
    const response = await api.put(`/api/Tuition/${id}`, tuitionFeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating tuition fee with ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Delete tuition fee
export const deleteTuitionFee = async (id) => {
  try {
    const response = await api.delete(`/api/Tuition/DeleteTuitionFee/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting tuition fee with ID ${id}:`, error);
    throw error;
  }
};

// Get grade levels for drop-down selection
export const getGradeLevels = async () => {
  try {
    const response = await api.get('/api/GradeLevel/get-list-grade-level');
    return response.data;
  } catch (error) {
    console.error('Error fetching grade levels:', error);
    throw error;
  }
};
