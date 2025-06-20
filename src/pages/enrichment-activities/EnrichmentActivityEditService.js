import api from '../../config/axiosConfig';

export const getEnrichmentActivityDetail = async (id) => {
  // Hiện tại BE chưa có API get detail, tạm thời lấy toàn bộ rồi filter phía FE
  const all = await getEnrichmentActivities();
  return all.find(x => x.id === id || x.ID === id);
};

export const updateEnrichmentActivity = async (id, data) => {
  // Cập nhật hoạt động ngoại khóa
  const res = await api.put(`/api/EnrichmentProgam/${id}`, data);
  return res.data;
};

import { getEnrichmentActivities } from './EnrichmentActivityListService';

// TODO: Kết nối API lấy chi tiết và cập nhật hoạt động ngoại khóa
// export const getEnrichmentActivityDetail = async (id) => {
//   // return await api.get(`/api/enrichment-activities/${id}`);
// };
// export const updateEnrichmentActivity = async (id, data) => {
//   // return await api.put(`/api/enrichment-activities/${id}`, data);
// }; 