import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationsApi } from '../api/notificationsApi'
import { toast } from 'react-hot-toast'

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      preferences: {
        email: true,
        sms: false,
        push: true,
        complaint_updates: true,
        system_alerts: true,
        weekly_summary: false
      },

      // Fetch all notifications
      fetchNotifications: async (params = {}) => {
        set({ isLoading: true })
        try {
          const response = await notificationsApi.getAll(params)
          set({ 
            notifications: response.data.results || [],
            isLoading: false 
          })
          return response.data
        } catch (error) {
          set({ isLoading: false })
          toast.error('Failed to fetch notifications')
          throw error
        }
      },

      // Get unread count
      fetchUnreadCount: async () => {
        try {
          const response = await notificationsApi.getUnreadCount()
          set({ unreadCount: response.data.count || 0 })
          return response.data.count
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId) => {
        try {
          await notificationsApi.markAsRead(notificationId)
          
          const { notifications, unreadCount } = get()
          const updatedNotifications = notifications.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: Math.max(0, unreadCount - 1)
          })
          
          return true
        } catch (error) {
          toast.error('Failed to mark notification as read')
          throw error
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          await notificationsApi.markAllAsRead()
          
          const { notifications } = get()
          const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }))
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: 0
          })
          
          toast.success('All notifications marked as read')
          return true
        } catch (error) {
          toast.error('Failed to mark all notifications as read')
          throw error
        }
      },

      // Delete notification
      deleteNotification: async (notificationId) => {
        try {
          await notificationsApi.delete(notificationId)
          
          const { notifications, unreadCount } = get()
          const notification = notifications.find(n => n.id === notificationId)
          const updatedNotifications = notifications.filter(n => n.id !== notificationId)
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: notification && !notification.is_read 
              ? Math.max(0, unreadCount - 1) 
              : unreadCount
          })
          
          toast.success('Notification deleted')
          return true
        } catch (error) {
          toast.error('Failed to delete notification')
          throw error
        }
      },

      // Bulk delete notifications
      bulkDeleteNotifications: async (notificationIds) => {
        try {
          await notificationsApi.bulkDelete(notificationIds)
          
          const { notifications, unreadCount } = get()
          const deletedUnreadCount = notifications
            .filter(n => notificationIds.includes(n.id) && !n.is_read)
            .length
          
          const updatedNotifications = notifications.filter(
            n => !notificationIds.includes(n.id)
          )
          
          set({ 
            notifications: updatedNotifications,
            unreadCount: Math.max(0, unreadCount - deletedUnreadCount)
          })
          
          toast.success(`${notificationIds.length} notifications deleted`)
          return true
        } catch (error) {
          toast.error('Failed to delete notifications')
          throw error
        }
      },

      // Update notification preferences
      updatePreferences: async (newPreferences) => {
        try {
          await notificationsApi.updatePreferences(newPreferences)
          
          set({ preferences: { ...get().preferences, ...newPreferences } })
          toast.success('Notification preferences updated')
          return true
        } catch (error) {
          toast.error('Failed to update preferences')
          throw error
        }
      },

      // Add a new notification (for real-time updates)
      addNotification: (notification) => {
        const { notifications, unreadCount } = get()
        set({ 
          notifications: [notification, ...notifications],
          unreadCount: unreadCount + 1
        })
      },

      // Update notification in store
      updateNotification: (notificationId, updates) => {
        const { notifications } = get()
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, ...updates } : n
        )
        set({ notifications: updatedNotifications })
      },

      // Clear all notifications
      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      // Get notifications by type
      getNotificationsByType: (type) => {
        const { notifications } = get()
        return notifications.filter(n => n.type === type)
      },

      // Get unread notifications
      getUnreadNotifications: () => {
        const { notifications } = get()
        return notifications.filter(n => !n.is_read)
      },

      // Check if user has unread notifications
      hasUnreadNotifications: () => {
        const { unreadCount } = get()
        return unreadCount > 0
      },

      // Initialize notification polling
      startPolling: () => {
        const pollInterval = setInterval(() => {
          get().fetchUnreadCount()
        }, 30000) // Poll every 30 seconds

        return () => clearInterval(pollInterval)
      }
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        unreadCount: state.unreadCount
      }),
    }
  )
)