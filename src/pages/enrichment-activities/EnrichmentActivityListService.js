import api from '../../config/axiosConfig';

// TODO: Kết nối API lấy danh sách hoạt động ngoại khóa, tìm kiếm, sắp xếp
// export const getEnrichmentActivities = async (params) => {
//   // return await api.get('/api/enrichment-activities', { params });
// }; 

export const getEnrichmentActivities = async () => {
  // Lấy danh sách tất cả hoạt động ngoại khóa
  const res = await api.get('/api/EnrichmentProgam/get-all-enrichment-program');
  return res.data;
}; 