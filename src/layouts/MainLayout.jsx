import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTopButton from '../components/scroll-button/ScrollToTopButton';
import PageLoadingScreen from '../components/loading/PageLoadingScreen';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<PageLoadingScreen message="Đang tải trang..." />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout;
