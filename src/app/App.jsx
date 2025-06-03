import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ScrollToTop from '../components/scroll-button/ScrollToTop';
import LoadingCover from '../components/loading-cover/LoadingCover';
import { ProcessingSpinnerProvider } from '../components/spinner/ProcessingSpinner';
// Layout
import MainLayout from '../layouts/MainLayout';
import StaffLayout from '../layouts/StaffLayout';

// Pages
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/register/RegisterPage';
import ProfilePage from '../pages/profile/ProfilePage';
import ChildProfileManagement from '../pages/profile/ChildProfileManagement';
import NewsPage from '../pages/news/NewsPage';
import NotFoundPage from '../components/error/NotFoundPage';
import ForgotPasswordPage from '../pages/forgot-password/ForgotPasswordPage';
import ConfirmEmailPage from '../pages/confirm-email/ConfirmEmailPage';
import AboutUsPage from '../pages/about-us/AboutUsPage';
import ContactPage from '../pages/contact/ContactPage';
import PaymentHistoryPage from '../pages/payment/PaymentHistoryPage';

// Staff Pages
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';
import ChildrenManagement from '../pages/staff-children-management/ChildrenManagement';

// Route Guards
import ProtectedRoute from '../components/route-guard/ProtectedRoute';
import AuthRoute from '../components/route-guard/AuthRoute';
import { UserProvider } from '../contexts/UserContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ProcessingSpinnerProvider>
      <UserProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes - Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            
            {/* Auth routes - redirect if already logged in */}
            <Route path="/login" element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } />
            
            <Route path="/register" element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            } />
            
            <Route path="/forgot-password" element={
              <AuthRoute>
                <ForgotPasswordPage />
              </AuthRoute>
            } />
            
            <Route path="/confirm" element={
              <AuthRoute>
                <ConfirmEmailPage />
              </AuthRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/children" element={
              <ProtectedRoute>
                <ChildProfileManagement />
              </ProtectedRoute>
            } />
            <Route path="/payment-history" element={
              <ProtectedRoute>
                <PaymentHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
   
          {/* Staff Routes */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['Staff']}>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="students" element={<ChildrenManagement />} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </ProcessingSpinnerProvider>
  );
}

export default App;
