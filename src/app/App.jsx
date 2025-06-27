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
import TeacherLayout from '../layouts/TeacherLayout';

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
import NewsDetailPage from '../pages/news/NewsDetailPage';
import EnrichmentProgram from '../pages/enrichment-program/EnrichmentProgram';
import AdminEnrichment from '../pages/admin/AdminEnrichment';

// Staff Pages
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';
import ChildrenManagement from '../pages/staff-children-management/ChildrenManagement';
import EnrollmentApplicationManagement from '../pages/staff-dashboard/EnrollmentApplicationManagement';
import StaffClasses from '../pages/staff-dashboard/StaffClassPage';

// Admin Pages
import AccountListPage from '../pages/admin-accounts-management/AccountListPage';
import StudentsManagement from '../pages/admin-students-management/StudentsManagement';
import AdminSyllabus from '../pages/admin/AdminSyllabus';
import TuitionFeeManagement from '../pages/admin/TuitionFeeManagement';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherClass from '../pages/teacher/TeacherClass';
import TeacherStudentClass from '../pages/teacher/TeacherStudentClass';
import TeacherSyllabus from '../pages/teacher/TeacherSyllabus';
import TeacherCheckAttendance from '../pages/teacher/TeacherCheckAttendance';
import TeacherAttendanceAll from '../pages/teacher/TeacherAttendanceAll';

import ClassManagement from '../pages/admin-classes-management/ClassManagement';


// Route Guards
import ProtectedRoute from '../components/route-guard/ProtectedRoute';
import AuthRoute from '../components/route-guard/AuthRoute';
import { UserProvider } from '../contexts/UserContext';

import SendAnnouncementPage from '../pages/announcement/SendAnnouncementPage';
import ReportsPage from '../pages/reports/ReportsPage';
import StaffAssignStudentPage from '../pages/staff-children-management/StaffAssignStudentPage.jsx';
import AdminNews from '../pages/admin/AdminNews';
import StaffAssignTeacherPage from '../pages/staff-assign-teacher/StaffAssignTeacherPage';
import EnrichmentParticipants from '../pages/enrichment-participants/EnrichmentParticipants';

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
            <Route path="/enrichment-program" element={
              <ProtectedRoute>
                <EnrichmentProgram />
              </ProtectedRoute>
            } />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
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
            <Route path="assign-students" element={<StaffAssignStudentPage />} />
            <Route path="assign-teachers" element={<StaffAssignTeacherPage />} />
            <Route path="enrichment-participants" element={<EnrichmentParticipants />} />
            <Route path="classes" element={<StaffClasses />} />

          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminPage />} />
            <Route path="syllabus" element={<AdminSyllabus />} />
            <Route path="teachers" element={<div>Teachers Management</div>} />
            <Route path="courses" element={<div>Courses Management</div>} />
            <Route path="classes/list" element={<ClassManagement />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="send-announcement" element={<SendAnnouncementPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="tuition-fees" element={<TuitionFeeManagement />} />
            <Route path="classes" element={<div>Classes Management</div>} />
            <Route path="settings" element={<div>Settings</div>} />
            <Route path="users/list" element={<AccountListPage />} />
            <Route path="enrichment" element={<AdminEnrichment />} />
            <Route path="students" element={<StudentsManagement />} />
            <Route path="enrichment-participants" element={<EnrichmentParticipants />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['Teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClass />} />
            <Route path="classes/:classId" element={<TeacherStudentClass />} />
            <Route path="syllabus" element={<TeacherSyllabus />} />
            <Route path="classes/:classId/check-attendance" element={<TeacherCheckAttendance />} />
            <Route path="classes/:classId/view-all-attendance" element={<TeacherAttendanceAll />} />
            <Route path="schedule" element={<div>Schedule</div>} />
            <Route path="assignments" element={<div>Assignments</div>} />
            <Route path="messages" element={<div>Messages</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </ProcessingSpinnerProvider>
  );
}

export default App;
