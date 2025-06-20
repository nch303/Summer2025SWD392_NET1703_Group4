import api from '../../config/axiosConfig';

// TODO: Kết nối API xóa hoạt động ngoại khóa
export const deleteEnrichmentActivity = async (id) => {
  // Xóa hoạt động ngoại khóa
  const res = await api.delete(`/api/EnrichmentProgam/${id}`);
  return res.data;
}; 