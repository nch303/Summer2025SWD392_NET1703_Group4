import axios from 'axios';
import { logoutUser } from '../services/NavbarService';
import { API_CONFIG } from './appConfig';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: parseInt(API_CONFIG.TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use token as-is since it already includes "Bearer " prefix
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
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

// Export configuration values for use in other files
export const apiConfig = API_CONFIG;

export default api;