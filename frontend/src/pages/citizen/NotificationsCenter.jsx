import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Filter, 
  Search,
  Calendar,
  AlertCircle,
  FileText,
  MessageSquare,
  Settings,
  Trash2
} from 'lucide-react'
import { notificationsApi } from '../../api/notificationsApi'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'

const NotificationsCenter = () => {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all') // all, unread, read
  const [timeFilter, setTimeFilter] = useState('all') // all, today, week, month
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState([])

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', filter, timeFilter],
    queryFn: () => notificationsApi.getNotifications({ 
      status: filter === 'all' ? undefined : filter,
      timeRange: timeFilter === 'all' ? undefined : timeFilter
    }),
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds) => notificationsApi.markAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      setSelectedNotifications([])
    }
  })

  // Delete notifications mutation
  const deleteNotificationsMutation = useMutation({
    mutationFn: (notificationIds) => notificationsApi.deleteNotifications(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      setSelectedNotifications([])
    }
  })

  // Mute notifications mutation
  const muteNotificationsMutation = useMutation({
    mutationFn: (type) => notificationsApi.muteNotificationType(type),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading Notifications...</p>
        </div>
      </div>
    )
  }

  const notificationsList = notifications?.results || []
  
  // Filter notifications based on search
  const filteredNotifications = notificationsList.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group notifications by time
  const groupNotificationsByTime = (notifications) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    }

    notifications.forEach(notification => {
      const date = new Date(notification.created_at)
      if (isToday(date)) {
        groups.today.push(notification)
      } else if (isYesterday(date)) {
        groups.yesterday.push(notification)
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(notification)
      } else {
        groups.older.push(notification)
      }
    })

    return groups
  }

  const groupedNotifications = groupNotificationsByTime(filteredNotifications)

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'complaint_update':
        return <FileText className="h-5 w-5" />
      case 'status_change':
        return <AlertCircle className="h-5 w-5" />
      case 'comment':
        return <MessageSquare className="h-5 w-5" />
      case 'system':
        return <Settings className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type, isRead) => {
    const baseColors = {
      complaint_update: 'blue',
      status_change: 'green', 
      comment: 'purple',
      system: 'gray'
    }
    const color = baseColors[type] || 'blue'
    return isRead ? `text-${color}-400 bg-${color}-50` : `text-${color}-600 bg-${color}-100`
  }

  const renderNotificationGroup = (title, notifications) => {
    if (notifications.length === 0) return null

    return (
      <div key={title} className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          {title}
        </h3>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.is_read 
                  ? 'bg-white border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              } ${
                selectedNotifications.includes(notification.id)
                  ? 'ring-2 ring-blue-500 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                
                <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.is_read)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${
                      notification.is_read ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <span>{format(new Date(notification.created_at), 'h:mm a')}</span>
                    </div>
                  </div>
                  
                  <p className={`mt-1 text-sm ${
                    notification.is_read ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {notification.message}
                  </p>
                  
                  {notification.complaint_id && (
                    <div className="mt-2">
                      <a
                        href={`/dashboard/complaints/${notification.complaint_id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Complaint →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated on your complaints and system announcements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {notifications?.unread_count || 0} unread
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedNotifications.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedNotifications.length === filteredNotifications.length 
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => markAsReadMutation.mutate(selectedNotifications)}
                disabled={markAsReadMutation.isLoading}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                <CheckCheck className="h-3 w-3" />
                <span>Mark Read</span>
              </button>
              
              <button
                onClick={() => deleteNotificationsMutation.mutate(selectedNotifications)}
                disabled={deleteNotificationsMutation.isLoading}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search or filters.' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div>
            {renderNotificationGroup('Today', groupedNotifications.today)}
            {renderNotificationGroup('Yesterday', groupedNotifications.yesterday)}
            {renderNotificationGroup('This Week', groupedNotifications.thisWeek)}
            {renderNotificationGroup('Older', groupedNotifications.older)}
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Complaint Updates</h4>
              <p className="text-sm text-gray-600">Get notified when your complaints are updated</p>
            </div>
            <button
              onClick={() => muteNotificationsMutation.mutate('complaint_update')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Status Changes</h4>
              <p className="text-sm text-gray-600">Get notified when complaint status changes</p>
            </div>
            <button
              onClick={() => muteNotificationsMutation.mutate('status_change')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">System Announcements</h4>
              <p className="text-sm text-gray-600">Important system updates and announcements</p>
            </div>
            <button
              onClick={() => muteNotificationsMutation.mutate('system')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsCenter