import React from 'react';
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
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  console.log("ProtectedRoute - Current user:", currentUser);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);

  if (isLoading) {
    return <ProcessingSpinner />;
  }

  // If no user is logged in, redirect to login
  if (!currentUser) {
    console.log("ProtectedRoute - No user, redirecting to login");
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If role check is required and user doesn't have required role
  if (allowedRoles.length > 0) {
    // Log for debugging
    console.log("ProtectedRoute - User role:", currentUser.roleName);
    console.log("ProtectedRoute - Checking against allowed roles:", allowedRoles);
    
    // More flexible role check: case-insensitive check + trim whitespace
    const hasAllowedRole = allowedRoles.some(role => 
      currentUser.roleName?.toLowerCase().trim() === role.toLowerCase().trim()
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