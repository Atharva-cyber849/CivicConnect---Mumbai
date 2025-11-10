// Enhanced PWA Service for managing Progressive Web App features
class PWAService {
  constructor() {
    this.deferredPrompt = null
    this.isInstalled = false
    this.isOnline = navigator.onLine
    this.swRegistration = null
    this.updateAvailable = false
    
    this.init()
  }

  async init() {
    try {
      // Register service worker
      await this.registerServiceWorker()
      
      // Setup install prompt
      this.setupInstallPrompt()
      
      // Setup online/offline detection
      this.setupConnectivityDetection()
      
      // Setup update detection
      this.setupUpdateDetection()
      
      // Setup push notifications
      await this.setupPushNotifications()
      
      // Setup periodic sync
      this.setupPeriodicSync()
      
      console.log('PWA Service initialized successfully')
    } catch (error) {
      console.error('PWA Service initialization failed:', error)
    }
  }

  // Service Worker Registration
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // Determine which service worker to use based on current route
        const path = window.location.pathname;
        const swPath = path.startsWith('/admin') ? '/sw-admin.js' : '/sw-citizen.js';
        
        this.swRegistration = await navigator.serviceWorker.register(swPath, {
          scope: '/'
        })
        
        console.log(`Service Worker registered (${swPath}):`, this.swRegistration.scope)
        
        // Listen for service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true
              this.notifyUpdate()
            }
          })
        })
        
        return this.swRegistration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        throw error
      }
    } else {
      throw new Error('Service Worker not supported')
    }
  }

  // App Installation Prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('Install prompt triggered')
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallBanner()
    })

    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully')
      this.isInstalled = true
      this.hideInstallBanner()
      this.showInstallSuccess()
    })

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true
    }
  }

  // Trigger app installation
  async promptInstall() {
    if (!this.deferredPrompt) {
      return false
    }

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    this.deferredPrompt = null
    return outcome === 'accepted'
  }

  // Online/Offline Detection
  setupConnectivityDetection() {
    window.addEventListener('online', () => {
      console.log('App is online')
      this.isOnline = true
      this.hideOfflineIndicator()
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      console.log('App is offline')
      this.isOnline = false
      this.showOfflineIndicator()
    })
  }

  // Update Detection and Management
  setupUpdateDetection() {
    if (this.swRegistration) {
      // Check for updates every 60 seconds when page is visible
      setInterval(() => {
        if (!document.hidden) {
          this.swRegistration.update()
        }
      }, 60000)
    }
  }

  // Force update when available
  async updateApp() {
    if (!this.updateAvailable || !this.swRegistration) {
      return false
    }

    const newWorker = this.swRegistration.waiting
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' })
      
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
      
      return true
    }
    
    return false
  }

  // Push Notifications Setup
  async setupPushNotifications() {
    if (!('Notification' in window) || !('PushManager' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      await this.subscribeToPush()
    }

    return true
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return false
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('Notification permission granted')
      await this.subscribeToPush()
      return true
    } else {
      console.log('Notification permission denied')
      return false
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker not registered')
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.getVapidPublicKey()
      })

      console.log('Push subscription successful:', subscription)
      
      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription)
      
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Get VAPID public key (replace with your actual key)
  getVapidPublicKey() {
    // This should be your VAPID public key from the backend
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9SN4aqD0LFjFDbP4-TkKWS_5c2OdS6-X0A7mK1hR2U0w2aYPOYdk'
  }

  // Send subscription to backend
  async sendSubscriptionToBackend(subscription) {
    try {
      const response = await fetch('/api/push/subscribe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          user_agent: navigator.userAgent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to backend')
      }

      console.log('Subscription sent to backend successfully')
    } catch (error) {
      console.error('Failed to send subscription to backend:', error)
    }
  }

  // Periodic Background Sync
  setupPeriodicSync() {
    if ('serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.periodicSync.register('complaint-status-check', {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        }).then(() => {
          console.log('Periodic sync registered')
        }).catch(error => {
          console.error('Periodic sync registration failed:', error)
        })
      })
    }
  }

  // Background Sync for offline actions
  async syncOfflineData() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('complaint-sync')
        console.log('Background sync registered')
      } catch (error) {
        console.error('Background sync registration failed:', error)
      }
    }
  }

  // Cache Management
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    }
  }

  async getCacheSize() {
    if ('caches' in window && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        usageInMB: Math.round(estimate.usage / 1024 / 1024 * 100) / 100,
        quotaInMB: Math.round(estimate.quota / 1024 / 1024 * 100) / 100
      }
    }
    return null
  }

  // Offline Data Storage
  async storeOfflineData(key, data) {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      return true
    } catch (error) {
      console.error('Failed to store offline data:', error)
      return false
    }
  }

  async getOfflineData(key) {
    try {
      const stored = localStorage.getItem(`offline_${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.data
      }
      return null
    } catch (error) {
      console.error('Failed to get offline data:', error)
      return null
    }
  }

  // UI Helper Methods
  showInstallBanner() {
    const event = new CustomEvent('pwa:install-available')
    window.dispatchEvent(event)
  }

  hideInstallBanner() {
    const event = new CustomEvent('pwa:install-completed')
    window.dispatchEvent(event)
  }

  showInstallSuccess() {
    const event = new CustomEvent('pwa:install-success')
    window.dispatchEvent(event)
  }

  showOfflineIndicator() {
    const event = new CustomEvent('pwa:offline')
    window.dispatchEvent(event)
  }

  hideOfflineIndicator() {
    const event = new CustomEvent('pwa:online')
    window.dispatchEvent(event)
  }

  notifyUpdate() {
    const event = new CustomEvent('pwa:update-available')
    window.dispatchEvent(event)
  }

  // Send local notification
  async showNotification(title, options = {}) {
    if (Notification.permission === 'granted' && this.swRegistration) {
      await this.swRegistration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'civicconnect-local',
        ...options
      })
    }
  }

  // Getters for component use
  get canInstall() {
    return !!this.deferredPrompt
  }

  get isAppInstalled() {
    return this.isInstalled
  }

  get isAppOnline() {
    return this.isOnline
  }

  get hasUpdateAvailable() {
    return this.updateAvailable
  }

  get hasNotificationPermission() {
    return Notification.permission === 'granted'
  }
}

// Create singleton instance
const pwaService = new PWAService()

export default pwaService