import api from '../../config/axiosConfig';

/**
 * Get dashboard data for a specific year
 * @param {number} year - The year for which to fetch dashboard data
 * @returns {Promise<Object>} Dashboard data including statistics and revenue
 */
export const getDashboardData = async (year) => {
  try {
    const response = await api.get(`/api/Dashboard/GetDashboardData?year=${year}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Export dashboard data to Excel
 * @param {number} year - The year for which to export dashboard data
 * @returns {Promise<boolean>} True if export is successful, false otherwise
 */
export const exportDashboardToExcel = async (year) => {
  try {
    const response = await api.get(`/api/Dashboard/ExportToExcel?year=${year}`, {
      responseType: 'blob'
    });
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
      : `Dashboard_${year}.xlsx`;
    
    link.setAttribute('download', filename);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting dashboard to Excel:', error);
    throw error;
  }
};
