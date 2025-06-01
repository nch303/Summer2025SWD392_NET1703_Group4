import axios from 'axios';
import { logoutUser } from '../components/navbar/NavbarService';

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
    // Check if error is due to unauthorized access (token expired or invalid)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Token expired or unauthorized access, logging out...');
      
      // Clear token and logout
      logoutUser();
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;