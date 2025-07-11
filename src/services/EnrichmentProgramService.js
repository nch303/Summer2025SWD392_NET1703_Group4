import api from '../config/axiosConfig';

/**
 * Get all enrichment programs
 * @returns {Promise<Array>} List of enrichment programs
 */
export const getAllEnrichmentPrograms = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs:', error);
    throw error;
  }
};

/**
 * Get all enrichment programs for parents
 * @returns {Promise<Array>} List of enrichment programs for parents
 */
export const getAllEnrichmentProgramsForParent = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program-for-parent');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs for parent:', error);
    throw error;
  }
};

/**
 * Get eligible children by parent ID for enrichment program registration
 * @param {string} parentId - The ID of the parent
 * @returns {Promise<Array>} List of eligible children
 */
export const getChildrenByParentId = async (parentId) => {
  try {
    // Get all class-children data using the API
    const response = await api.get(`/api/ClassChildren/GetByParentID/${parentId}`);
    
    // Group data by child ID
    const childrenGroups = new Map();
    
    // Group all class records by child ID
    response.data.forEach(item => {
      const childId = item.childrenResponse.id;
      
      if (!childrenGroups.has(childId)) {
        childrenGroups.set(childId, {
          childData: item.childrenResponse,
          classes: []
        });
      }
      
      childrenGroups.get(childId).classes.push({
        status: item.status,
        isEnrichment: item.classResponse.epName !== null,
        epName: item.classResponse.epName
      });
    });
    
    // Filter eligible children
    const eligibleChildren = [];
    
    childrenGroups.forEach((data, childId) => {
      // Check if child is in any active enrichment class
      const hasActiveEnrichment = data.classes.some(
        cls => cls.isEnrichment && cls.status === "Active"
      );
      
      // Check if child is in a regular class
      const hasRegularClass = data.classes.some(cls => !cls.isEnrichment);
      
      // Child is eligible if they are in a regular class AND not in any active enrichment class
      if (hasRegularClass && !hasActiveEnrichment) {
        eligibleChildren.push(data.childData);
      }
    });
    
    return eligibleChildren;
  } catch (error) {
    console.error('Error fetching eligible children:', error);
    throw error;
  }
};

/**
 * Register for an enrichment program
 * @param {string} enrichmentId - The ID of the program to register for
 * @param {Array<string>} childrenIds - Array of child IDs to register
 * @returns {Promise<Object>} Registration result
 */
export const registerForProgram = async (enrichmentId, childrenIds) => {
  try {
    const response = await api.post(`/api/Class/assign-children-to-enrichmentClass/${enrichmentId}`, childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error registering for program:', error);
    throw error;
  }
};

/**
 * Get enrichment class registrations for a parent
 * @param {string} parentId - The ID of the parent
 * @returns {Promise<Array>} List of enrichment class registrations
 */
export const getEnrichmentClassRegistrations = async (parentId) => {
  try {
    const response = await api.get(`/api/ClassChildren/GetEnrichmentClassChildren/${parentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment class registrations:', error);
    throw error;
  }
};

/**
 * Create payment for enrichment program
 * @param {Object} paymentData - Payment data including amount, childrenID, and enrichment program IDs
 * @returns {Promise<Object>} Payment URL response
 */
export const createPaymentUrl = async (paymentData) => {
  try {
    const response = await api.post('/api/vnpay/create-payment-url', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    throw error;
  }
};

/**
 * Get invoice details for a child's enrollment in an enrichment program
 * @param {string} childrenId - The ID of the child
 * @param {number} enrichmentProgramId - The ID of the enrichment program
 * @returns {Promise<Array>} List of invoice details
 */
export const getEnrichmentInvoiceDetails = async (childrenId, enrichmentProgramId) => {
  try {
    const response = await api.get(`/api/Invoice/details/${childrenId}/${enrichmentProgramId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    throw error;
  }
};
