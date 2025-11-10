import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  Settings, 
  Smartphone,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react'
import pushNotificationService from '../../services/pushNotificationService'
import { toast } from 'react-hot-toast'

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    pushEnabled: false,
    complaint_status: true,
    complaint_assigned: true,
    complaint_resolved: true,
    system_maintenance: false,
    new_feature: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState(Notification.permission)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
    }

    // Check current subscription status
    setIsSubscribed(pushNotificationService.isSubscribed)
    setPermission(pushNotificationService.permission)
  }, [])

  const handleEnablePush = async () => {
    setIsLoading(true)
    try {
      await pushNotificationService.requestPermission()
      setPermission('granted')
      setIsSubscribed(true)
      setSettings(prev => ({ ...prev, pushEnabled: true }))
      toast.success('Push notifications enabled successfully!')
    } catch (error) {
      console.error('Failed to enable push notifications:', error)
      if (error.message.includes('denied')) {
        toast.error('Please allow notifications in your browser settings')
      } else {
        toast.error('Failed to enable notifications. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisablePush = async () => {
    setIsLoading(true)
    try {
      await pushNotificationService.unsubscribe()
      setIsSubscribed(false)
      setSettings(prev => ({ ...prev, pushEnabled: false }))
      toast.success('Push notifications disabled')
    } catch (error) {
      console.error('Failed to disable push notifications:', error)
      toast.error('Failed to disable notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      await pushNotificationService.testNotification()
      toast.success('Test notification sent!')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      toast.error('Failed to send test notification')
    }
  }

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('notification-settings', JSON.stringify(newSettings))
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'Notifications allowed',
          color: 'text-green-600'
        }
      case 'denied':
        return {
          icon: <X className="h-5 w-5 text-red-500" />,
          text: 'Notifications blocked',
          color: 'text-red-600'
        }
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          text: 'Permission not requested',
          color: 'text-yellow-600'
        }
    }
  }

  const permissionStatus = getPermissionStatus()

  if (!pushNotificationService.supportsPush) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Push Notifications Not Supported
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications. Please use a modern browser for the best experience.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </h2>
          <p className="text-sm text-gray-600">
            Manage how you receive updates about your complaints
          </p>
        </div>
      </div>

      {/* Permission Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {permissionStatus.icon}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Browser Permissions
              </p>
              <p className={`text-sm ${permissionStatus.color}`}>
                {permissionStatus.text}
              </p>
            </div>
          </div>
          
          {permission === 'denied' && (
            <div className="text-xs text-gray-500 max-w-xs">
              To enable notifications, click the lock icon in your browser's address bar and allow notifications
            </div>
          )}
        </div>
      </div>

      {/* Push Notifications Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Smartphone className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-base font-medium text-gray-900">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600">
                Get real-time updates about your complaints
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isSubscribed && (
              <button
                onClick={handleTestNotification}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Test
              </button>
            )}
            
            {isSubscribed ? (
              <button
                onClick={handleDisablePush}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <BellOff className="h-4 w-4 mr-2" />
                )}
                Disable
              </button>
            ) : (
              <button
                onClick={handleEnablePush}
                disabled={isLoading || permission === 'denied'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <Bell className="h-4 w-4 mr-2" />
                )}
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Benefits */}
        {!isSubscribed && permission !== 'denied' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Benefits of enabling notifications:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Instant updates when your complaint status changes</li>
              <li>• Know immediately when your issue is resolved</li>
              <li>• Stay informed about important system updates</li>
              <li>• Works even when the app is closed</li>
            </ul>
          </div>
        )}

        {/* Notification Types */}
        {isSubscribed && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 border-t pt-4">
              Notification Types
            </h4>
            
            <div className="space-y-3">
              {[
                {
                  key: 'complaint_status',
                  label: 'Complaint Status Updates',
                  description: 'When your complaint status changes'
                },
                {
                  key: 'complaint_assigned',
                  label: 'Complaint Assignments',
                  description: 'When your complaint is assigned to a department'
                },
                {
                  key: 'complaint_resolved',
                  label: 'Complaint Resolutions',
                  description: 'When your complaint is marked as resolved'
                },
                {
                  key: 'system_maintenance',
                  label: 'System Maintenance',
                  description: 'Planned maintenance and downtime notices'
                },
                {
                  key: 'new_feature',
                  label: 'New Features',
                  description: 'Updates about new app features and improvements'
                }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleSettingChange(item.key, !settings[item.key])}
                    className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings[item.key] 
                        ? 'bg-blue-600' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Privacy & Security</p>
            <p>
              Your notification preferences are stored locally and can be changed at any time. 
              We only send notifications related to your complaints and important system updates.
              You can disable notifications entirely by turning them off in your browser settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings