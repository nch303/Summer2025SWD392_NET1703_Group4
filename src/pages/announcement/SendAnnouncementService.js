import api from '../../config/axiosConfig';

// TODO: Kết nối API gửi thông báo
export const sendAnnouncement = async (data) => {
  // Gửi thông báo
  const res = await api.post('/api/Notification/CreateNotification', data);
  return res.data;
}; 