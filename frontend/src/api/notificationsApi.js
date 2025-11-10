import { axiosPrivate } from './axiosConfig';

// Notifications API endpoints
export const notificationsApi = {
  // Get user notifications with enhanced filtering
  getNotifications: async (filters = {}) => {
    const response = await axiosPrivate.get('/notifications/', {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        timeRange: filters.timeRange,
        type: filters.type
      }
    });
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationIds) => {
    if (Array.isArray(notificationIds)) {
      // Bulk mark as read
      const response = await axiosPrivate.post('/notifications/bulk-read/', {
        notification_ids: notificationIds
      });
      return response.data;
    } else {
      // Single notification
      const response = await axiosPrivate.patch(`/notifications/${notificationIds}/read/`);
      return response.data;
    }
  },

  // Delete multiple notifications
  deleteNotifications: async (notificationIds) => {
    const response = await axiosPrivate.post('/notifications/bulk-delete/', {
      notification_ids: notificationIds
    });
    return response.data;
  },

  // Mute notification type
  muteNotificationType: async (type) => {
    const response = await axiosPrivate.post('/notifications/mute-type/', {
      notification_type: type
    });
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosPrivate.post('/notifications/mark-all-read/');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axiosPrivate.delete(`/notifications/${notificationId}/`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await axiosPrivate.get('/notifications/unread-count/');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    const response = await axiosPrivate.put('/notifications/preferences/', preferences);
    return response.data;
  },

  // Get notification preferences
  getPreferences: async () => {
    const response = await axiosPrivate.get('/notifications/preferences/');
    return response.data;
  },

  // Send broadcast notification (admin only)
  sendBroadcast: async (notificationData) => {
    const response = await axiosPrivate.post('/notifications/broadcast/', notificationData);
    return response.data;
  },

  // Subscribe to push notifications
  subscribeToPush: async (subscription) => {
    const response = await axiosPrivate.post('/notifications/push/subscribe/', subscription);
    return response.data;
  },

  // Unsubscribe from push notifications
  unsubscribeFromPush: async () => {
    const response = await axiosPrivate.post('/notifications/push/unsubscribe/');
    return response.data;
  }
};