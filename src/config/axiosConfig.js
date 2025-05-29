import axios from 'axios';

// Tạo instance của axios
const api = axios.create({
  baseURL: 'https://localhost:7216',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - thêm token nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi toàn cục, ví dụ: lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Chuyển hướng đến trang đăng nhập nếu cần
    }
    return Promise.reject(error);
  }
);

export default api;