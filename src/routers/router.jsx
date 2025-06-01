import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/main-layout/MainLayout';
import StaffLayout from '../layouts/staff-layout/StaffLayout';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/login/LoginPage';
import RegisterPage from '../pages/register/RegisterPage';
import ProfilePage from '../pages/profile/ProfilePage';
import NewsPage from '../pages/news/NewsPage';
import NotFoundPage from '../shared/components/error/NotFoundPage';
import ForgotPasswordPage from '../pages/forgot-password/ForgotPasswordPage';
import AboutUsPage from '../pages/about-us/AboutUsPage';
import ContactPage from '../pages/contact/ContactPage';
import AuthRoute from '../components/route-guard/AuthRoute';
import ConfirmEmailPage from '../pages/confirm-email/ConfirmEmailPage';

import { ROUTES } from '../shared/constants/routes';

// Staff feature imports
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';

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
        path: ROUTES.PROFILE, 
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute> 
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
    ],
  },
]);
