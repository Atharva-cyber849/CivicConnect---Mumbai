// Push Notification Service for real-time updates
class PushNotificationService {
  constructor() {
    this.subscription = null
    this.isSupported = this.checkSupport()
    this.permission = Notification.permission
    this.vapidPublicKey = this.getVapidPublicKey()
    
    this.init()
  }

  // Check if push notifications are supported
  checkSupport() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported')
      return
    }

    // Auto-request permission if granted before
    if (this.permission === 'granted') {
      await this.subscribe()
    }
  }

  // Get VAPID public key - replace with your actual key
  getVapidPublicKey() {
    // In production, this should come from environment variables or API
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9SN4aqD0LFjFDbP4-TkKWS_5c2OdS6-X0A7mK1hR2U0w2aYPOYdk'
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported')
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      
      if (permission === 'granted') {
        console.log('Notification permission granted')
        await this.subscribe()
        return true
      } else if (permission === 'denied') {
        console.log('Notification permission denied')
        throw new Error('Permission denied by user')
      } else {
        console.log('Notification permission dismissed')
        throw new Error('Permission dismissed by user')
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      throw error
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    if (!this.isSupported || this.permission !== 'granted') {
      throw new Error('Cannot subscribe: permission not granted')
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        this.subscription = existingSubscription
        await this.sendSubscriptionToServer(existingSubscription)
        return existingSubscription
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      })

      this.subscription = subscription
      console.log('Push subscription created:', subscription)
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      throw error
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.subscription) {
      return true
    }

    try {
      const unsubscribed = await this.subscription.unsubscribe()
      
      if (unsubscribed) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(this.subscription)
        this.subscription = null
        console.log('Push subscription removed')
      }
      
      return unsubscribed
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      throw error
    }
  }

  // Send subscription to backend server
  async sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.warn('No auth token available for push subscription')
        return
      }

      const response = await fetch('/api/notifications/push/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          user_agent: navigator.userAgent,
          device_type: this.getDeviceType(),
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Subscription sent to server:', result)
      return result
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
      throw error
    }
  }

  // Remove subscription from backend server
  async removeSubscriptionFromServer(subscription) {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        return
      }

      const response = await fetch('/api/notifications/push/unsubscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })

      if (response.ok) {
        console.log('Subscription removed from server')
      }
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }

  // Show local notification
  async showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      throw new Error('Cannot show notification: permission not granted')
    }

    try {
      const registration = await navigator.serviceWorker.ready
      
      const notificationOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'civicconnect-notification',
        renotify: true,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          timestamp: Date.now(),
          url: '/'
        },
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icons/icon-96x96.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ],
        ...options
      }

      await registration.showNotification(title, notificationOptions)
      console.log('Notification shown:', title)
    } catch (error) {
      console.error('Failed to show notification:', error)
      throw error
    }
  }

  // Test notification
  async testNotification() {
    await this.showNotification('Test Notification', {
      body: 'This is a test notification from Snap & Report',
      tag: 'test-notification',
      data: { test: true }
    })
  }

  // Helper function to convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Get device type for analytics
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  // Notification templates for different types
  getNotificationTemplate(type, data) {
    const templates = {
      complaint_status: {
        title: 'Complaint Status Update',
        body: `Your complaint #${data.complaint_id} is now ${data.status.toLowerCase()}`,
        icon: '/icons/complaint-icon.png',
        tag: `complaint-${data.complaint_id}`,
        data: {
          type: 'complaint_status',
          complaint_id: data.complaint_id,
          url: `/complaints/${data.complaint_id}`
        },
        actions: [
          {
            action: 'view',
            title: 'View Complaint',
            icon: '/icons/view-icon.png'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ]
      },
      complaint_assigned: {
        title: 'Complaint Assigned',
        body: `Your complaint #${data.complaint_id} has been assigned to ${data.department}`,
        icon: '/icons/assignment-icon.png',
        tag: `complaint-assigned-${data.complaint_id}`,
        data: {
          type: 'complaint_assigned',
          complaint_id: data.complaint_id,
          url: `/complaints/${data.complaint_id}`
        }
      },
      complaint_resolved: {
        title: 'Complaint Resolved! 🎉',
        body: `Great news! Your complaint #${data.complaint_id} has been resolved`,
        icon: '/icons/resolved-icon.png',
        tag: `complaint-resolved-${data.complaint_id}`,
        requireInteraction: true,
        data: {
          type: 'complaint_resolved',
          complaint_id: data.complaint_id,
          url: `/complaints/${data.complaint_id}`
        },
        actions: [
          {
            action: 'feedback',
            title: 'Give Feedback',
            icon: '/icons/feedback-icon.png'
          },
          {
            action: 'view',
            title: 'View Details'
          }
        ]
      },
      system_maintenance: {
        title: 'System Maintenance',
        body: data.message || 'Scheduled maintenance in progress',
        icon: '/icons/maintenance-icon.png',
        tag: 'system-maintenance',
        requireInteraction: false
      },
      new_feature: {
        title: 'New Feature Available!',
        body: data.message || 'Check out the latest features in Snap & Report',
        icon: '/icons/feature-icon.png',
        tag: 'new-feature',
        data: {
          type: 'new_feature',
          url: data.url || '/'
        }
      }
    }

    return templates[type] || {
      title: data.title || 'Snap & Report',
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png'
    }
  }

  // Send typed notification
  async sendTypedNotification(type, data) {
    const template = this.getNotificationTemplate(type, data)
    await this.showNotification(template.title, template)
  }

  // Getters for component use
  get isSubscribed() {
    return !!this.subscription
  }

  get hasPermission() {
    return this.permission === 'granted'
  }

  get canRequest() {
    return this.permission === 'default'
  }

  get isDenied() {
    return this.permission === 'denied'
  }

  get supportsPush() {
    return this.isSupported
  }
}

// Create singleton instance
const pushNotificationService = new PushNotificationService()

export default pushNotificationService