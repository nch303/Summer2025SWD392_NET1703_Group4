import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getNotifications, markNotificationAsRead } from './NotificationService';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const modalRef = useRef(null);
  const previousCountRef = useRef(0);
  
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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update the notifications state to mark as read
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Update the unread count reference
      previousCountRef.current = notifications.filter(n => n.id !== notificationId && !n.isRead).length;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.isRead);

  return (
    <div className="notification-bell-container" ref={modalRef}>
      <button 
        className={`notification-bell-button ${hasNewNotifications ? 'new-notification' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-modal">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className={`refresh-button ${refreshing ? 'refreshing' : ''}`} 
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 12h7V5l-2.35 1.35z" />
              </svg>
            </button>
          </div>
          
          <div className="notification-tabs">
            <button 
              className={`notification-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`notification-tab ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          
          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <ul className="notification-list">
                {filteredNotifications.map(notification => (
                  <li 
                    key={notification.id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="notification-item-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.content}</p>
                    </div>
                    {!notification.isRead && <span className="notification-dot"></span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="notification-empty">
                <p>{activeTab === 'all' ? 'No notifications yet' : 'No unread notifications'}</p>
              </div>
            )}
          </div>
          <div className="notification-footer">
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;