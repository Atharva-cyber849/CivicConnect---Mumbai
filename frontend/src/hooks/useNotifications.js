import { useNotifications as useNotificationContext } from '../context/NotificationContext';
import { useEffect, useRef } from 'react';

// Custom hook for notifications with real-time updates
export const useNotifications = () => {
  const notificationContext = useNotificationContext();
  const wsRef = useRef(null);

  // Setup WebSocket connection for real-time notifications
  useEffect(() => {
    const setupWebSocket = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/notifications/`;
      
      try {
        wsRef.current = new WebSocket(`${wsUrl}?token=${token}`);

        wsRef.current.onopen = () => {
          console.log('Notification WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification') {
              // Add new notification to context
              notificationContext.addNotification(data.notification);
              
              // Show toast notification
              notificationContext.showToast(
                data.notification.message,
                'info',
                5000
              );
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('Notification WebSocket disconnected');
          // Attempt to reconnect after 5 seconds
          setTimeout(setupWebSocket, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error('Notification WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
      }
    };

    setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [notificationContext]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  // Show browser notification
  const showBrowserNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      notificationContext.markAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type
    const { type, data } = notification;
    
    switch (type) {
      case 'complaint_update':
      case 'status_change':
        if (data?.complaint_id) {
          window.location.href = `/dashboard/complaints/${data.complaint_id}`;
        }
        break;
      case 'assignment':
        if (data?.complaint_id) {
          window.location.href = `/admin/complaints/${data.complaint_id}`;
        }
        break;
      default:
        // Default action
        break;
    }
  };

  // Get formatted time for notification
  const getFormattedTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString();
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(notification);
    });

    return groups;
  };

  // Filter notifications by type
  const filterNotificationsByType = (type) => {
    return notificationContext.notifications.filter(
      notification => notification.type === type
    );
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notificationContext.notifications.filter(
      notification => !notification.read
    );
  };

  return {
    ...notificationContext,
    requestNotificationPermission,
    showBrowserNotification,
    handleNotificationClick,
    getFormattedTime,
    groupNotificationsByDate,
    filterNotificationsByType,
    getUnreadNotifications
  };
};