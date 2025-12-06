import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notificationsApi } from '../api/notificationsApi';
import { NOTIFICATION_TYPES } from '../config/constants';

// Notification context
const NotificationContext = createContext();

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        loading: false
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      const deletedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount
      };
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SHOW_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
    case 'HIDE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  toasts: []
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Fetch notifications on mount
  useEffect(() => {
    // Re-enable API calls with authentication check
    const initNotifications = async () => {
      // Only fetch notifications if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!authToken) {
        return;
      }
      
      try {
        console.log('NotificationProvider - Initializing notifications for authenticated user');
        await fetchNotifications();
        await fetchUnreadCount();
      } catch (error) {
        console.log('Notification API error:', error.message);
        // Gracefully handle when backend is not available or user is not authenticated
        if (error.response?.status === 401) {
          console.log('NotificationProvider - User not authenticated, clearing token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    };
    
    initNotifications();
  }, []);

  // Fetch notifications
  const fetchNotifications = async (page = 1, limit = 20) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await notificationsApi.getNotifications(page, limit);
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: response.results || response
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.detail || 'Failed to fetch notifications'
      });
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      dispatch({
        type: 'SET_UNREAD_COUNT',
        payload: response.count || 0
      });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      dispatch({
        type: 'MARK_AS_READ',
        payload: notificationId
      });
    } catch (error) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      showToast('Failed to mark all notifications as read', 'error');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      dispatch({
        type: 'DELETE_NOTIFICATION',
        payload: notificationId
      });
      showToast('Notification deleted', 'success');
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        ...notification,
        id: notification.id || Date.now(),
        created_at: notification.created_at || new Date().toISOString(),
        read: false
      }
    });
  };

  // Show toast notification
  const showToast = (message, type = 'info', duration = 5000) => {
    const toast = {
      id: Date.now(),
      message,
      type,
      duration
    };

    dispatch({
      type: 'SHOW_TOAST',
      payload: toast
    });

    // Auto-hide toast after duration
    setTimeout(() => {
      hideToast(toast.id);
    }, duration);
  };

  // Hide toast notification
  const hideToast = (toastId) => {
    dispatch({
      type: 'HIDE_TOAST',
      payload: toastId
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.COMPLAINT_UPDATE:
        return '📋';
      case NOTIFICATION_TYPES.STATUS_CHANGE:
        return '🔄';
      case NOTIFICATION_TYPES.ASSIGNMENT:
        return '👥';
      case NOTIFICATION_TYPES.COMMENT:
        return '💬';
      case NOTIFICATION_TYPES.SYSTEM:
        return '⚙️';
      default:
        return '📢';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.COMPLAINT_UPDATE:
        return 'bg-blue-100 text-blue-800';
      case NOTIFICATION_TYPES.STATUS_CHANGE:
        return 'bg-green-100 text-green-800';
      case NOTIFICATION_TYPES.ASSIGNMENT:
        return 'bg-purple-100 text-purple-800';
      case NOTIFICATION_TYPES.COMMENT:
        return 'bg-yellow-100 text-yellow-800';
      case NOTIFICATION_TYPES.SYSTEM:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const value = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    showToast,
    hideToast,
    clearError,
    getNotificationIcon,
    getNotificationColor
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};