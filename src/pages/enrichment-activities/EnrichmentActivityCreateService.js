import api from '../../config/axiosConfig';

// TODO: Kết nối API tạo hoạt động ngoại khóa
export const createEnrichmentActivity = async (data) => {
  // Tạo mới hoạt động ngoại khóa
  const res = await api.post('/api/EnrichmentProgam/create-enrichment-program', data);
  return res.data;
}; 