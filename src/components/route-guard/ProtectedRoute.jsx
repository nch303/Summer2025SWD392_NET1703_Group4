import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import ProcessingSpinner from '../spinner/ProcessingSpinner';

/**
 * A route wrapper that ensures only authenticated users with specific roles can access
 * @param {Object} props
 * @param {Array} props.allowedRoles - Roles that can access this route
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.redirectPath='/login'] - Where to redirect unauthorized users
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectPath = '/login' }) => {
  const { currentUser, isLoading, fetchCurrentUser, isInitialized } = useUser();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedUser, setVerifiedUser] = useState(null);

  // Khi component mount, xác thực lại user nếu cần
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Nếu chưa có currentUser nhưng có token, thử fetch lại
        if (!currentUser && localStorage.getItem('token')) {
          console.log("ProtectedRoute - No user but token exists, fetching user");
          const userData = await fetchCurrentUser();
          setVerifiedUser(userData);
        } else {
          setVerifiedUser(currentUser);
        }
      } catch (error) {
        console.error("ProtectedRoute - Error verifying user:", error);
        setVerifiedUser(null);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUser();
  }, [currentUser, fetchCurrentUser]);

  console.log("ProtectedRoute - Current user:", currentUser);
  console.log("ProtectedRoute - Verified user:", verifiedUser);
  console.log("ProtectedRoute - Is loading:", isLoading);
  console.log("ProtectedRoute - Is verifying:", isVerifying);
  console.log("ProtectedRoute - Is initialized:", isInitialized);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);

  // Hiển thị spinner khi đang tải hoặc đang xác minh
  if (isLoading || isVerifying) {
    return <ProcessingSpinner message="Đang xác thực..." />;
  }

  // Ưu tiên dùng verifiedUser nếu có, không thì dùng currentUser
  const user = verifiedUser || currentUser;

  // Nếu không có user sau khi đã xác minh xong, chuyển hướng đến đăng nhập
  if (!user) {
    console.log("ProtectedRoute - No user after verification, redirecting to login");
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Nếu cần kiểm tra role và user không có quyền yêu cầu
  if (allowedRoles.length > 0) {
    // Log for debugging
    console.log("ProtectedRoute - User role:", user.roleName);
    console.log("ProtectedRoute - Checking against allowed roles:", allowedRoles);
    
    // More flexible role check: case-insensitive check + trim whitespace
    const hasAllowedRole = allowedRoles.some(role => 
      user.roleName?.toLowerCase().trim() === role.toLowerCase().trim()
    );
    
    if (!hasAllowedRole) {
      console.log("ProtectedRoute - Role not allowed, redirecting to home");
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute; 