import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/NotificationService';
import { useUser } from '../contexts/UserContext';
import styles from './NotificationBell.module.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const modalRef = useRef(null);
  const previousCountRef = useRef(0);
  const { currentUser } = useUser();
  
  // Check if user is staff
  const isStaff = currentUser?.roleName === 'Staff';
  const isTeacher = currentUser?.roleName === 'Teacher';
  const isAdmin = currentUser?.roleName === 'Admin';
  
  // Fetch notifications - made into a callback so it can be referenced in effects
  const fetchNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getNotifications();
      
      // Check if we have new unread notifications
      const newUnreadCount = data.filter(n => !n.isRead).length;
      const oldUnreadCount = previousCountRef.current;
      
      if (newUnreadCount > oldUnreadCount && oldUnreadCount > 0) {
        setHasNewNotifications(true);
        
        // Visual feedback with animation
        setTimeout(() => setHasNewNotifications(false), 3000);
      }
      
      // Update the previous count reference
      previousCountRef.current = newUnreadCount;
      
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Manual refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  // Initialize notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up interval to refresh notifications every 30 seconds
    const intervalId = setInterval(() => fetchNotifications(false), 30000);
    
    // Add visibility change event listener to refresh when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedNotification(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Immediately show notification details
    setSelectedNotification(notification);
    
    // Mark as read in the background
    markNotificationAsRead(notification.id)
      .then(() => {
        // Update state after successful API call
        setNotifications(
          notifications.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        
        // Update unread count reference
        previousCountRef.current = notifications.filter(n => n.id !== notification.id && !n.isRead).length;
      })
      .catch(error => {
        console.error('Failed to mark notification as read:', error);
      });
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);

  return (
    <div className={`${styles.notificationBellContainer} ${isStaff ? styles.staffUser : isTeacher ? styles.teacherUser : isAdmin ? styles.adminUser : ''}`} ref={modalRef}>
      <button 
        className={`${styles.notificationBellButton} ${hasNewNotifications ? styles.newNotification : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>
        {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.notificationModal}>
          <div className={styles.notificationHeader}>
            <h3>Notifications</h3>
            <button 
              className={`${styles.bellRefreshButton} ${refreshing ? styles.refreshing : ''}`} 
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 12h7V5l-2.35 1.35z" />
              </svg>
            </button>
          </div>
          
          <div className={styles.notificationTabs}>
            <button 
              className={`${styles.notificationTab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`${styles.notificationTab} ${activeTab === 'unread' ? styles.active : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          
          {selectedNotification ? (
            <div className={styles.notificationDetail}>
              <div className={styles.notificationDetailHeader}>
                <button 
                  className={styles.notificationBackButton}
                  onClick={() => setSelectedNotification(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                </button>
                <h4>{selectedNotification.title}</h4>
              </div>
              <div className={styles.notificationDetailContent}>
                <p>{selectedNotification.content}</p>
                {selectedNotification.dateCreated && (
                  <div className={styles.notificationDate}>
                    {new Date(selectedNotification.dateCreated).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.notificationContent}>
              {loading ? (
                <div className={styles.notificationLoading}>
                  <div className={styles.spinner}></div>
                  <p>Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <ul className={styles.notificationList}>
                  {filteredNotifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={styles.notificationItemContent}>
                        <h4>{notification.title}</h4>
                        <p>{notification.content}</p>
                      </div>
                      {!notification.isRead && <span className={styles.notificationDot}></span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.notificationEmpty}>
                  <p>{activeTab === 'all' ? 'No notifications yet' : 'No unread notifications'}</p>
                </div>
              )}
            </div>
          )}
          
          <div className={styles.notificationFooter}>
            <button onClick={() => {
              setIsOpen(false);
              setSelectedNotification(null);
            }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;