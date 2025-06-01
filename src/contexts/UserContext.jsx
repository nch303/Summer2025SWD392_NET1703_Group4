import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../components/navbar/NavbarService';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        setIsLoggedIn(false);
        return null;
      }

      const userData = await getCurrentUser();
      console.log("Fetched user data:", userData); // Debug log
      
      if (userData) {
        // Bảo đảm lưu trữ đầy đủ thông tin user
        setCurrentUser(userData);
        setIsLoggedIn(true);
        
        // Lưu thêm thông tin role vào localStorage để đề phòng
        localStorage.setItem('userRole', userData.roleName);
        
        return userData;
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
        return null;
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setCurrentUser(null);
      setIsLoggedIn(false);
      return null;
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('authState');
    setCurrentUser(null);
    setIsLoggedIn(false);
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
      
      // Otherwise fetch user data
      await fetchCurrentUser();
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      isLoading, 
      isLoggedIn, 
      isInitialized,
      fetchCurrentUser,
      handleLogout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
