import React, { useEffect, useState } from 'react';

// Hook to detect mobile device and orientation
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    checkOrientation();

    const handleResize = () => {
      checkMobile();
      checkOrientation();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return { isMobile, orientation };
};

// Hook for viewport height (handles mobile browser behavior)
export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateHeight = () => {
      // Use visualViewport API if available, fallback to innerHeight
      const height = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(height);
      
      // Update CSS custom property for consistent height across components
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    };

    updateHeight();

    // Listen for viewport changes (keyboard, orientation)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateHeight);
    } else {
      window.addEventListener('resize', updateHeight);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateHeight);
      } else {
        window.removeEventListener('resize', updateHeight);
      }
    };
  }, []);

  return viewportHeight;
};

// Hook for safe area insets (iOS notch/home indicator support)
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10)
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);

    // Set CSS variables for safe area insets
    if (CSS.supports('padding: max(0px)')) {
      document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
      document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
    }

    return () => {
      window.removeEventListener('resize', updateInsets);
    };
  }, []);

  return insets;
};

// Touch gesture utilities
export const useTouchGestures = (elementRef, options = {}) => {
  const [gesture, setGesture] = useState(null);

  useEffect(() => {
    if (!elementRef.current) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTracking = false;

    const threshold = options.threshold || 50;
    const restraint = options.restraint || 100;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = true;
    };

    const handleTouchMove = (e) => {
      if (!isTracking) return;
      
      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
    };

    const handleTouchEnd = (e) => {
      if (!isTracking) return;
      
      const distanceX = currentX - startX;
      const distanceY = currentY - startY;
      const absDistanceX = Math.abs(distanceX);
      const absDistanceY = Math.abs(distanceY);

      // Determine swipe direction
      if (absDistanceX >= threshold && absDistanceY <= restraint) {
        setGesture(distanceX > 0 ? 'swipe-right' : 'swipe-left');
      } else if (absDistanceY >= threshold && absDistanceX <= restraint) {
        setGesture(distanceY > 0 ? 'swipe-down' : 'swipe-up');
      }

      // Reset gesture after a short delay
      setTimeout(() => setGesture(null), 100);
      
      isTracking = false;
    };

    const element = elementRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, options.threshold, options.restraint]);

  return gesture;
};

// Mobile optimized image handling
export const useOptimizedImages = () => {
  const getOptimizedImageUrl = (url, width = 400, quality = 80) => {
    if (!url) return '';
    
    // If it's already a data URL or external URL, return as-is
    if (url.startsWith('data:') || url.includes('://')) {
      return url;
    }
    
    // Add optimization parameters for our image service
    const params = new URLSearchParams({
      w: width.toString(),
      q: quality.toString(),
      f: 'webp' // Prefer WebP format for better compression
    });
    
    return `${url}?${params}`;
  };

  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  return { getOptimizedImageUrl, preloadImage };
};

// Network status detection
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateConnectionType = () => {
      const connection = navigator.connection || 
                        navigator.mozConnection || 
                        navigator.webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    };

    updateConnectionType();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateConnectionType);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return { isOnline, connectionType };
};

// Haptic feedback utility
export const useHapticFeedback = () => {
  const triggerHaptic = (type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
        success: [10, 50, 10],
        error: [50, 100, 50],
        warning: [30, 30, 30]
      };
      
      navigator.vibrate(patterns[type] || patterns.light);
    }
  };

  return triggerHaptic;
};

// Install prompt for PWA
export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    
    return false;
  };

  return { isInstallable, promptInstall };
};