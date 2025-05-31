import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/navbar/Navbar';
import Footer from '../../components/footer/Footer';
import ScrollToTopButton from '../../components/scroll-button/ScrollToTopButton';
import Sidebar from '../../components/sidebar/Sidebar';
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