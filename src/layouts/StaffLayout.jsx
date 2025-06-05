import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import ScrollToTopButton from '../components/scroll-button/ScrollToTopButton';
import Sidebar from '../components/sidebar/Sidebar';
import PageLoadingScreen from '../components/loading/PageLoadingScreen';
import './staff-layout.css';

const StaffLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`staff-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar />
      <div className="staff-container">
        <Sidebar 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <main className="staff-content">
          <Suspense fallback={<PageLoadingScreen message="Đang tải trang..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default StaffLayout;