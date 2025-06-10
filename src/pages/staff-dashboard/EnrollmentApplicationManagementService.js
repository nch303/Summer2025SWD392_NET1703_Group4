import api from '../../config/axiosConfig';

// Get all enrollment applications
export const getAllApplications = async () => {
  try {
    const response = await api.get('/api/EnrollmentApplication/get-all-applications');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

// Get application details by ID
export const getApplicationDetail = async (applicationId) => {
  try {
    const response = await api.get(`/api/EnrollmentApplication/view-application-detail/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

// Approve application
export const approveApplication = async (applicationId) => {
  try {
    const response = await api.put(`/api/EnrollmentApplication/approve-application?eAId=${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving application:', error);
    throw error;
  }
};

// Reject application
export const rejectApplication = async (applicationId) => {
  try {
    const response = await api.put(`/api/EnrollmentApplication/reject-application?eAId=${applicationId}`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }
};

// Send notification to parent
export const createNotification = async (notification) => {
  try {
    const response = await api.post('/api/Notification/CreateNotification', notification);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
