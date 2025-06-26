import api from '../../config/axiosConfig';

// Get all enrichment programs
export const getAllEnrichmentPrograms = async () => {
  try {
    const response = await api.get('/api/EnrichmentProgam/get-all-enrichment-program');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrichment programs:', error);
    throw error;
  }
};

// Get enrichment program by ID
export const getEnrichmentProgramById = async (id) => {
  try {
    const response = await api.get(`/api/EnrichmentProgam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching enrichment program with ID ${id}:`, error);
    throw error;
  }
};

// Create enrichment program
export const createEnrichmentProgram = async (programData) => {
  try {
    const response = await api.post('/api/EnrichmentProgam/create-enrichment-program', programData);
    return response.data;
  } catch (error) {
    console.error('Error creating enrichment program:', error);
    throw error;
  }
};

// Update enrichment program
export const updateEnrichmentProgram = async (id, programData) => {
  try {
    const response = await api.put(`/api/EnrichmentProgam/${id}`, programData);
    return response.data;
  } catch (error) {
    console.error(`Error updating enrichment program with ID ${id}:`, error);
    throw error;
  }
};

// Delete enrichment program
export const deleteEnrichmentProgram = async (id) => {
  try {
    const response = await api.delete(`/api/EnrichmentProgam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting enrichment program with ID ${id}:`, error);
    throw error;
  }
};

// Restore enrichment program
export const restoreEnrichmentProgram = async (program) => {
  try {
    // Update isDelete to false
    const updatedProgram = {
      ...program,
      isDelete: false
    };
    
    // Send the complete updated program back to the server
    const response = await api.put(`/api/EnrichmentProgam/${program.id}`, updatedProgram);
    return response.data;
  } catch (error) {
    console.error(`Error restoring enrichment program with ID ${program.id}:`, error);
    throw error;
  }
};
