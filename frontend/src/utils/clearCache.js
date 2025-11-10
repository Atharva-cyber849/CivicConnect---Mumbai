// Cache clearing utility
export const clearAllCaches = async () => {
  try {
    // Clear all cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
    
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(
        registrations.map(registration => registration.unregister())
      )
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
    
    console.log('All caches cleared successfully')
  } catch (error) {
    console.error('Error clearing caches:', error)
  }
}

// Force refresh without cache
export const forceRefresh = () => {
  window.location.reload(true)
}