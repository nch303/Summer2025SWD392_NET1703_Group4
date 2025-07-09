import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTopButton from '../components/ScrollToTopButton';
import Sidebar from '../components/Sidebar';
import PageLoadingScreen from '../components/PageLoadingScreen';
import styles from './StaffLayout.module.css';

const StaffLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`${styles.staffLayout} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      <Navbar />
      <div className={styles.staffContainer}>
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <main className={styles.staffContent}>
          <Suspense fallback={<PageLoadingScreen message="Loading page..." />}>
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