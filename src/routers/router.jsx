import { createBrowserRouter, Navigate, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StaffLayout from '../layouts/StaffLayout';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/register/RegisterPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NewsPage from '../pages/news/NewsPage';
import NotFoundPage from '../components/error/NotFoundPage';
import ForgotPasswordPage from '../pages/forgot-password/ForgotPasswordPage';
import AboutUsPage from '../pages/about-us/AboutUsPage';
import ContactPage from '../pages/contact/ContactPage';
import AuthRoute from '../components/route-guard/AuthRoute';
import ConfirmEmailPage from '../pages/confirm-email/ConfirmEmailPage';
import ChildProfileManagement from '../pages/profile/ChildProfileManagement';
import PaymentHistoryPage from '../pages/payment/PaymentHistoryPage';
import InvoiceDetailPage from '../pages/payment/InvoiceDetailPage';
import EnrollmentApplicationPage from '../pages/enrollment-application/EnrollmentApplicationPage';
import EnrollmentTrackingPage from '../pages/enrollment-application/EnrollmentTrackingPage';
import { ROUTES } from '../constants/routes';

// Staff feature imports
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';
import ChildrenManagement from '../pages/staff-children-management/ChildrenManagement';
import ProtectedRoute from '../components/route-guard/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: ROUTES.LOGIN, 
        element: <AuthRoute><LoginPage /></AuthRoute> 
      },
      { 
        path: ROUTES.REGISTER, 
        element: <AuthRoute><RegisterPage /></AuthRoute> 
      },
      { 
        path: ROUTES.FORGOT_PASSWORD, 
        element: <AuthRoute><ForgotPasswordPage /></AuthRoute> 
      },
      { 
        path: ROUTES.CONFIRM_EMAIL, 
        element: <AuthRoute><ConfirmEmailPage /></AuthRoute> 
      },
      { 
        path: ROUTES.RESET_PASSWORD, 
        element: <AuthRoute><ResetPasswordPage /></AuthRoute> 
      },
      { 
        path: ROUTES.PROFILE, 
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute> 
      },
      {
        path: ROUTES.CHILD_PROFILE,
        element: <ProtectedRoute><ChildProfileManagement /></ProtectedRoute>
      },
      {
        path: ROUTES.PAYMENT_HISTORY,
        element: <ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>
      },
      {
        path: ROUTES.INVOICE_DETAIL,
        element: <ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>
      },
      {
        path: ROUTES.ENROLLMENT_APPLICATION,
        element: <ProtectedRoute><EnrollmentApplicationPage /></ProtectedRoute>
      },
      {
        path: ROUTES.ENROLLMENT_TRACKING,
        element: <ProtectedRoute><EnrollmentTrackingPage/></ProtectedRoute>
      },
      { path: ROUTES.NEWS, element: <NewsPage /> },
      { path: ROUTES.ABOUT_US, element: <AboutUsPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: ROUTES.STAFF,
    element: <ProtectedRoute><StaffLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to={ROUTES.STAFF_DASHBOARD} replace /> },
      { path: 'dashboard', element: <StaffDashboard /> },
      { path: 'students', element: <ChildrenManagement /> },
    ],
  },
]);
