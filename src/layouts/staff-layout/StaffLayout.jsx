import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../shared/components/navbar/Navbar';
import Footer from '../../shared/components/footer/Footer';
import ScrollToTopButton from '../../shared/components/scroll-button/ScrollToTopButton';
import Sidebar from '../../shared/components/sidebar/Sidebar';
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
          <Outlet />
        </main>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default StaffLayout;