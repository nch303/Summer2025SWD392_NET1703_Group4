import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ScrollToTop from '../shared/components/scroll-button/ScrollToTop';
import LoadingCover from '../shared/components/loading-cover/LoadingCover';
import { ProcessingSpinnerProvider } from '../shared/components/spinner/ProcessingSpinner';
// Layout
import MainLayout from '../layouts/main-layout/MainLayout';
import StaffLayout from '../layouts/staff-layout/StaffLayout';

// Pages
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/register/RegisterPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NewsPage from '../pages/news/NewsPage';
import NotFoundPage from '../shared/components/error/NotFoundPage';
import ForgotPasswordPage from '../pages/forgot-password/ForgotPasswordPage';
import ConfirmEmailPage from '../pages/confirm-email/ConfirmEmailPage';
// Staff Pages
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';
// import StaffList from '../features/staff/pages/StaffList';
// import AddStaff from '../features/staff/pages/AddStaff';
// import StaffAttendance from '../features/staff/pages/StaffAttendance';
// import StaffSchedule from '../features/staff/pages/StaffSchedule';
// import StaffPayroll from '../features/staff/pages/StaffPayroll';
// import StaffPerformance from '../features/staff/pages/StaffPerformance';
// import StaffTraining from '../features/staff/pages/StaffTraining';

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
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirm" element={<ConfirmEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/news" element={<NewsPage />} />
        </Route>
        
        {/* Staff Management Routes */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          {/* <Route path="list" element={<StaffList />} />
          <Route path="add" element={<AddStaff />} />
          <Route path="attendance" element={<StaffAttendance />} />
          <Route path="schedule" element={<StaffSchedule />} />
          <Route path="payroll" element={<StaffPayroll />} />
          <Route path="performance" element={<StaffPerformance />} />
          <Route path="training" element={<StaffTraining />} /> */}
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ProcessingSpinnerProvider>
  );
}

export default App;
