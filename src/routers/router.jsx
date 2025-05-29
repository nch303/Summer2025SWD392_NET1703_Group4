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

import { ROUTES } from '../shared/constants/routes';

// Staff feature imports
import StaffDashboard from '../pages/staff-dashboard/StaffDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
      { path: ROUTES.NEWS, element: <NewsPage /> },
      { path: ROUTES.ABOUT_US, element: <AboutUsPage /> },
      { path: ROUTES.CONTACT, element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: ROUTES.STAFF,
    element: <StaffLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.STAFF_DASHBOARD} replace /> },
      { path: 'dashboard', element: <StaffDashboard /> },
    ],
  },
]);
