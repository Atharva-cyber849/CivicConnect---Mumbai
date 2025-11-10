import React, { useState, useEffect, useRef } from 'react';
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const NotificationPanel = ({ onClose }) => {
  const panelRef = useRef(null);
  
  // Mock notifications - in real app, this would come from API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      title: 'New Complaint Assigned',
      message: 'Complaint #BMC-2024-1234 has been assigned to you',
      time: '2 minutes ago',
      read: false,
      icon: ExclamationTriangleIcon,
      color: 'text-orange-500'
    },
    {
      id: 2,
      type: 'resolved',
      title: 'Complaint Resolved',
      message: 'Complaint #BMC-2024-1230 marked as resolved',
      time: '1 hour ago',
      read: false,
      icon: CheckCircleIcon,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'feedback',
      title: 'Citizen Feedback Received',
      message: 'Rating: 5 stars for quick resolution',
      time: '3 hours ago',
      read: true,
      icon: InformationCircleIcon,
      color: 'text-blue-500'
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Pending Complaints',
      message: 'You have 3 complaints pending for more than 24 hours',
      time: '1 day ago',
      read: true,
      icon: ClockIcon,
      color: 'text-yellow-500'
    }
  ]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      ref={panelRef}
      className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-96 flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#FF9E00] text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#0078D7] hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <BellIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-[#0078D7]' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${notification.color}`}>
                    <notification.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 ml-2">
                      <div className="h-2 w-2 bg-[#0078D7] rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button className="w-full text-center text-sm text-[#0078D7] hover:text-blue-800 font-medium">
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;