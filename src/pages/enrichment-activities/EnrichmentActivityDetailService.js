import { getEnrichmentActivities } from './EnrichmentActivityListService';

// TODO: Kết nối API lấy chi tiết hoạt động ngoại khóa
// export const getEnrichmentActivityDetail = async (id) => {
//   // return await api.get(`/api/enrichment-activities/${id}`);
// }; 

export const getEnrichmentActivityDetail = async (id) => {
  // Hiện tại BE chưa có API get detail, tạm thời lấy toàn bộ rồi filter phía FE
  const all = await getEnrichmentActivities();
  return all.find(x => x.id === id || x.ID === id);
}; 