import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import ProcessingSpinner from '../spinner/ProcessingSpinner';
import { ROUTES } from '../../constants/routes';

/**
 * A route wrapper that redirects authenticated users away from login-related pages
 */
const AuthRoute = ({ children }) => {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  // Function to determine redirect path based on user role
  const getRedirectPath = (userRole) => {
    // Make sure we're working with a string and trim any whitespace
    const role = userRole?.trim() || '';
    
    // Case-insensitive comparison
    switch (role.toLowerCase()) {
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD || '/admin';
      case 'teacher':
        return ROUTES.TEACHER_DASHBOARD || '/teacher';
      case 'staff':
        return ROUTES.STAFF_DASHBOARD || '/staff';
      default:
        return ROUTES.HOME || '/';
    }
  };

  if (isLoading) {
    return <ProcessingSpinner />;
  }

  // If user is authenticated, redirect to appropriate dashboard based on role
  if (currentUser) {
    const redirectPath = getRedirectPath(currentUser.roleName);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Otherwise, show the login/register page
  return children;
};

export default AuthRoute;