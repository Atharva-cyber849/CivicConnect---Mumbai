import React, { useEffect, Suspense } from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Context Providers - Re-enabling all features
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Services - Re-enabling PWA with dynamic manifest system
import pwaService from './services/pwaService'
import manifestManager from './services/manifestManager'

// Route Components
import AppRouter from './routes/AppRouter'

// Components - Re-enabling PWA components
import LoadingSpinner from './components/Layout/LoadingSpinner'
import PWAInstallPrompt from './components/Layout/PWAInstallPrompt'
import PWAUpdateNotification from './components/Layout/PWAUpdateNotification'
import OfflineIndicator from './components/Layout/OfflineIndicator'
import BottomNavigation from './components/mobile/BottomNavigation'

// Mobile hooks
import { useIsMobile, useViewportHeight, useSafeAreaInsets } from './hooks/useMobile'

// Styles
import './index.css'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduced from 3 to prevent excessive retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30 * 1000, // 30 seconds - reduced from 5 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data exists
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  const { isMobile } = useIsMobile();
  const viewportHeight = useViewportHeight();
  const safeAreaInsets = useSafeAreaInsets();

  useEffect(() => {
    // Temporarily disable manifest manager and PWA service to debug redirect loop
    console.log('App.jsx loaded - PWA services temporarily disabled for debugging');
    
    // Set mobile-specific CSS variables
    if (isMobile) {
      document.documentElement.style.setProperty('--mobile-vh', `${viewportHeight}px`);
      document.documentElement.style.setProperty('--safe-area-inset-top', `${safeAreaInsets.top}px`);
      document.documentElement.style.setProperty('--safe-area-inset-bottom', `${safeAreaInsets.bottom}px`);
      document.body.classList.add('mobile-layout');
    } else {
      document.body.classList.remove('mobile-layout');
    }
  }, [isMobile, viewportHeight, safeAreaInsets])

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  )

  // Conditionally import React Query DevTools in development
  const DevTools = process.env.NODE_ENV === 'development' ? 
    React.lazy(() => import('@tanstack/react-query-devtools').then(module => ({ 
      default: module.ReactQueryDevtools 
    }))) : null

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <Suspense fallback={<LoadingFallback />}>
                <div className={`app min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${
                  isMobile ? 'mobile-app pb-20' : ''
                }`}>
                  {/* PWA Components - Temporarily disabled for debugging */}
                  {/* <PWAInstallPrompt />
                  <PWAUpdateNotification />
                  <OfflineIndicator /> */}

                  {/* Main App Router */}
                  <AppRouter />

                  {/* Mobile Bottom Navigation - Temporarily disabled */}
                  {/* {isMobile && <BottomNavigation />} */}
                  
                  {/* Toast Notifications */}
                  <Toaster 
                    position={isMobile ? "top-center" : "top-right"}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                        fontSize: isMobile ? '14px' : '16px',
                        maxWidth: isMobile ? '90vw' : '400px',
                      },
                    }}
                  />
                </div>
              </Suspense>
              
              {/* React Query DevTools (only in development) */}
              {DevTools && (
                <Suspense fallback={null}>
                  <DevTools initialIsOpen={false} />
                </Suspense>
              )}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
