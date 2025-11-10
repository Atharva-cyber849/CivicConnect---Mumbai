import { useState, useEffect } from 'react'
import { FiBell, FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import api from '../../api'
import { formatDistanceToNow } from '../../utils/helpers'

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await api.get('/notifications/')
      setNotifications(response.data.results || response.data || [])
      
      const unread = response.data.results 
        ? response.data.results.filter(n => !n.is_read).length
        : response.data.filter(n => !n.is_read).length
      
      setUnreadCount(unread)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { is_read: true })
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/')
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      )
      
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/`)
      
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      )
      
      const deletedNotif = notifications.find(n => n.id === notificationId)
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />
      case 'warning':
        return <FiAlertCircle className="text-yellow-500" />
      case 'error':
        return <FiAlertCircle className="text-red-500" />
      default:
        return <FiInfo className="text-blue-500" />
    }
  }

  // Get notification background color
  const getNotificationBg = (type, isRead) => {
    const baseClasses = 'border-l-4 '
    const readOpacity = isRead ? 'bg-gray-50 ' : 'bg-white '
    
    switch (type) {
      case 'success':
        return `${baseClasses}${readOpacity}border-green-500`
      case 'warning':
        return `${baseClasses}${readOpacity}border-yellow-500`
      case 'error':
        return `${baseClasses}${readOpacity}border-red-500`
      default:
        return `${baseClasses}${readOpacity}border-blue-500`
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user])

  if (!user) return null

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-civic-blue-600 focus:outline-none focus:ring-2 focus:ring-civic-blue-500 rounded-full"
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6" />
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-civic-orange-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-civic-blue-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-civic-blue-600 hover:text-civic-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-blue-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FiBell className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    We'll notify you when there are updates
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'font-medium' : ''
                      }`}
                    >
                      <div className={`${getNotificationBg(notification.type, notification.is_read)} p-3 rounded-lg`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 mb-1">
                              {notification.message}
                            </p>
                            
                            {notification.complaint_id && (
                              <a
                                href={`/user/complaints/${notification.complaint_id}`}
                                className="text-xs text-civic-blue-600 hover:text-civic-blue-700 hover:underline"
                              >
                                View Complaint #{notification.complaint_id}
                              </a>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(notification.created_at)}
                            </p>
                          </div>

                          <div className="flex-shrink-0 flex items-center gap-1">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-civic-blue-600 hover:text-civic-blue-700 text-xs"
                                title="Mark as read"
                              >
                                ✓
                              </button>
                            )}
                            
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500 text-xs"
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // Navigate to notifications page (if exists)
                    setIsOpen(false)
                  }}
                  className="w-full text-center text-sm text-civic-blue-600 hover:text-civic-blue-700 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationPanel
