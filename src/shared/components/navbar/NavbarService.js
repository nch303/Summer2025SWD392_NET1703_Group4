import { jwtDecode } from 'jwt-decode';

/**
 * Get the current authenticated user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }
  
  // Giải mã token để lấy thông tin người dùng
  const decodedToken = jwtDecode(token);
  
  if (!decodedToken) {
    // Token không hợp lệ, xóa khỏi localStorage
    localStorage.removeItem('token');
    return null;
  }
  
  // Sử dụng đúng tên claims từ token
  return {
    id: decodedToken.nameid,
    name: decodedToken.unique_name,
    role: decodedToken.role,
  };
};

/**
 * Logout the current user
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
};
