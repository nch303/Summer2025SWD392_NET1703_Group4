import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/navbar/Navbar';
import Footer from '../../shared/components/footer/Footer';
import ScrollToTopButton from '../../shared/components/scroll-button/ScrollToTopButton';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default MainLayout;
