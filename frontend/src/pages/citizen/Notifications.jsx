import { useState, useEffect } from 'react'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { 
  FiBell, FiCheck, FiCheckSquare, FiFilter, FiEye, FiX,
  FiClock, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Notifications = () => {
  const { user } = useAuthStore()
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications
  } = useNotificationStore()
  
  const [filter, setFilter] = useState('all') // all, read, unread
  const [selectedNotifications, setSelectedNotifications] = useState([])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read') return notification.is_read
    if (filter === 'unread') return !notification.is_read
    return true
  })

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      setSelectedNotifications(prev => prev.filter(nId => nId !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return
    
    try {
      await bulkDeleteNotifications(selectedNotifications)
      setSelectedNotifications([])
    } catch (error) {
      console.error('Failed to bulk delete:', error)
    }
  }

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    setSelectedNotifications(
      selectedNotifications.length === unreadIds.length ? [] : unreadIds
    )
  }

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markAsReadMutation.mutate(selectedNotifications)
    }
  }

  const getNotificationIcon = (type, status) => {
    switch (type) {
      case 'status_update':
        if (status === 'IN_PROGRESS') return <FiClock className="w-5 h-5 text-blue-600" />
        if (status === 'RESOLVED') return <FiCheckCircle className="w-5 h-5 text-green-600" />
        return <FiAlertCircle className="w-5 h-5 text-orange-600" />
      case 'resolved':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'feedback_request':
        return <FiBell className="w-5 h-5 text-purple-600" />
      case 'system':
        return <FiBell className="w-5 h-5 text-civic-blue-600" />
      default:
        return <FiBell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'bg-white border-gray-200'
    
    switch (type) {
      case 'resolved':
        return 'bg-green-50 border-green-200'
      case 'status_update':
        return 'bg-blue-50 border-blue-200'
      case 'feedback_request':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated on your complaints and important announcements
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FiCheckSquare className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-civic-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={handleMarkSelectedAsRead}
                disabled={markAsReadMutation.isPending}
                className="btn btn-sm btn-primary"
              >
                Mark as Read
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="btn btn-sm btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions for Unread */}
        {filter === 'unread' && notifications.filter(n => !n.is_read).length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg mb-4">
            <input
              type="checkbox"
              checked={selectedNotifications.length === notifications.filter(n => !n.is_read).length}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-blue-800">
              Select all unread notifications
            </span>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'unread' 
                ? 'All caught up! Check back later for updates on your complaints.'
                : 'When you report issues, you\'ll receive updates here.'
              }
            </p>
            {filter !== 'unread' && (
              <Link to="/dashboard/report" className="btn btn-primary">
                Report Your First Issue
              </Link>
            )}
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getNotificationBgColor(notification.type, notification.is_read)}`}
            >
              <div className="flex items-start gap-4">
                {filter === 'unread' && !notification.is_read && (
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="rounded mt-1"
                  />
                )}
                
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type, notification.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 w-2 h-2 bg-civic-blue-600 rounded-full inline-block"></span>
                        )}
                      </h3>
                      <p className={`mt-1 ${!notification.is_read ? 'text-gray-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{format(notification.created_at, 'MMM dd, yyyy HH:mm')}</span>
                        {notification.complaint_id && (
                          <span>Complaint #{notification.complaint_id}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {notification.complaint_id && (
                        <Link
                          to={`/dashboard/complaints/${notification.complaint_id}`}
                          className="btn btn-sm btn-secondary flex items-center gap-1"
                        >
                          <FiEye className="w-3 h-3" />
                          View
                        </Link>
                      )}
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsReadMutation.mutate([notification.id])}
                          className="btn btn-sm btn-secondary flex items-center gap-1"
                          title="Mark as read"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {notifications.length > 0 && notifications.length % 20 === 0 && (
        <div className="text-center">
          <button className="btn btn-secondary">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  )
}

export default Notifications