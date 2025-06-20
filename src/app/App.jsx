import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ScrollToTop from '../components/scroll-button/ScrollToTop';
import LoadingCover from '../components/loading-cover/LoadingCover';
import { ProcessingSpinnerProvider } from '../components/spinner/ProcessingSpinner';
// Layout
import MainLayout from '../layouts/MainLayout';
import StaffLayout from '../layouts/StaffLayout';
import AdminLayout from '../layouts/AdminLayout';

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
import AdminPage from '../pages/admin/AdminPage';

import PaymentHistoryPage from '../pages/payment/PaymentHistoryPage';
import InvoiceDetailPage from '../pages/payment/InvoiceDetailPage';
import PaymentFailPage from '../pages/payment/PaymentFail';
import ResetPasswordPage from '../pages/forgot-password/ResetPasswordPage';
import EnrollmentApplicationPage from '../pages/enrollment-application/EnrollmentApplicationPage';
import EnrollmentTrackingPage from '../pages/enrollment-application/EnrollmentTrackingPage';
import NotificationPage from '../pages/notification/NotificationPage';
import TuitionFeePage from '../pages/tuition-fee/TuitionFeePage';

// Staff Pages
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';
import ChildrenManagement from '../pages/staff-children-management/ChildrenManagement';
import EnrollmentApplicationManagement from '../pages/staff-dashboard/EnrollmentApplicationManagement';

// Admin Pages
import AccountListPage from '../pages/admin-accounts-management/AccountListPage';
import ClassManagement from '../pages/admin-classes-management/ClassManagement';

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

            <Route path="/reset-password/:token" element={
              <AuthRoute>
                <ResetPasswordPage />
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
            <Route path="/profile/:tab" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>

            } />
            <Route path="/payment-history" element={
              <ProtectedRoute>
                <PaymentHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/invoice-detail/:invoiceId" element={
              <ProtectedRoute>
                <InvoiceDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/enrollment-application/:childId" element={
              <ProtectedRoute>
                <EnrollmentApplicationPage />
              </ProtectedRoute>
            } />
            <Route path="/enrollment-tracking" element={
              <ProtectedRoute>
                <EnrollmentTrackingPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationPage />
              </ProtectedRoute>
            } />
            <Route path="/payment-fail/:invoiceId" element={
              <ProtectedRoute>
                <PaymentFailPage />
              </ProtectedRoute>
            } />
            <Route path="/tuition-fee" element={
              <ProtectedRoute>
                <TuitionFeePage />
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
            <Route path="enrollment-applications" element={<EnrollmentApplicationManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminPage />} />
            <Route path="students" element={<div>Students Management</div>} />
            <Route path="teachers" element={<div>Teachers Management</div>} />
            <Route path="courses" element={<div>Courses Management</div>} />
            <Route path="classes/list" element={<ClassManagement />} />
            <Route path="settings" element={<div>Settings</div>} />
            <Route path="users/list" element={<AccountListPage />} />
          </Route>
          

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </ProcessingSpinnerProvider>
  );
}

export default App;
