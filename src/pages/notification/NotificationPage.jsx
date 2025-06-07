import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from './NotificationService';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update the notifications state
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <h1>Notifications</h1>
      </div>

      <div className="notification-page-content">
        {loading ? (
          <div className="notification-page-loading">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="notification-card-container">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="notification-card-header">
                  <h3>{notification.title}</h3>
                  {!notification.isRead && <span className="notification-status">New</span>}
                </div>
                <div className="notification-card-body">
                  <p>{notification.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="notification-page-empty">
            <div className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
              </svg>
            </div>
            <h2>No notifications yet</h2>
            <p>You don't have any notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage; 