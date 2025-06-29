import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../components/navbar/NavbarService';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setAuthError('No token found');
        return null;
      }

      // Kiểm tra xem token có còn hạn không (basic check)
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        if (payload.exp * 1000 < Date.now()) {
          console.log("Token is expired");
          localStorage.removeItem('token');
          setCurrentUser(null);
          setIsLoggedIn(false);
          setAuthError('Token expired');
          return null;
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }

      const userData = await getCurrentUser();
      console.log("Fetched user data:", userData); // Debug log
      
      if (userData) {
        // Bảo đảm lưu trữ đầy đủ thông tin user
        setCurrentUser(userData);
        setIsLoggedIn(true);
        setAuthError(null);
        
        // Lưu thêm thông tin user vào localStorage để truy cập nhanh sau này
        localStorage.setItem('userRole', userData.roleName);
        localStorage.setItem('user', JSON.stringify({
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          roleName: userData.roleName
        }));
        
        return userData;
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setAuthError('Failed to get user data');
        return null;
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setCurrentUser(null);
      setIsLoggedIn(false);
      setAuthError(error.message || 'Authentication error');
      return null;
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };
  
  // Helper function to manually set logged in state
  const setLoggedInUser = (userData, token) => {
    if (!userData || !token) return false;
    
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userData.roleName);
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      roleName: userData.roleName
    }));
    
    setCurrentUser(userData);
    setIsLoggedIn(true);
    setAuthError(null);
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('authState');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setAuthError(null);
  };

  // Try to restore user from localStorage if available
  const tryRestoreUser = () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setIsLoggedIn(true);
        return true;
      } catch (e) {
        console.error("Error restoring user from localStorage:", e);
      }
    }
    return false;
  };

  // Check auth status at initialization without blocking rendering
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      // If no token, mark as initialized immediately
      if (!token) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // First try to restore from localStorage for immediate UI update
      const restored = tryRestoreUser();
      
      // Then verify with backend
      if (restored) {
        setIsLoading(true);
        await fetchCurrentUser();
      } else {
        // If restore failed, try fetching from scratch
        await fetchCurrentUser();
      }
    };

    checkAuth();
  }, []);

  // Create a user object that matches what components expect
  const user = currentUser ? {
    ...currentUser,
    // Ensure critical fields exist
    id: currentUser.id || currentUser.userId || null,
    role: currentUser.roleName || currentUser.role || null,
    email: currentUser.email || null,
    fullName: currentUser.fullName || currentUser.name || null
  } : null;

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      user, // Add user as an alias to currentUser with standardized properties
      setCurrentUser, 
      isLoading, 
      isLoggedIn, 
      isInitialized,
      authError,
      fetchCurrentUser,
      handleLogout,
      setLoggedInUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };
