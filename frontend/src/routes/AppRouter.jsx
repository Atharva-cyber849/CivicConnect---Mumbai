import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Re-enabled

// Route Components
import ProtectedRoute from './ProtectedRoute';
import CitizenRoutes from './CitizenRoutes';
import AdminRoutes from './AdminRoutes';

// Layouts
import PublicLayout from '../components/Layout/PublicLayout';
import AuthLayout from '../components/Layout/AuthLayout';

// Public Pages
import LandingPage from '../pages/citizen/LandingPage';
import Login from '../pages/citizen/Login';
import Register from '../pages/citizen/Register';
import TrackComplaint from '../pages/citizen/TrackComplaint';

// Citizen Dashboard Pages
import Dashboard from '../pages/citizen/Dashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetail from '../pages/citizen/ComplaintDetail';
import MapView from '../pages/citizen/MapView';
import NotificationsCenter from '../pages/citizen/NotificationsCenter';
import Profile from '../pages/citizen/Profile';

// Admin Pages
import AdminPortal from '../pages/admin/AdminPortal';
import AdminLogin from '../pages/admin/Login';
import AdminSelfRegister from '../pages/admin/AdminSelfRegister';

// Constants
import { USER_ROLES } from '../config/constants';

const AppRouter = () => {
  // Re-enable authentication context properly
  const authContext = useAuth();
  const { isAuthenticated = false, user = null, loading = false, authCheckComplete = false } = authContext || {};
  
  // Add debugging
  console.log('AppRouter - Auth State:', { 
    isAuthenticated, 
    user: user?.email, 
    userRole: user?.role,
    loading,
    authCheckComplete,
    authContext: !!authContext,
    pathname: window.location.pathname
  });

  // Show loading spinner while checking auth - only if auth check is not complete
  if (!authCheckComplete && loading) {
    console.log('Showing loading spinner - auth check in progress');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-civic-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only redirect from auth pages when already authenticated
  const publicPaths = ['/', '/track', '/auth/login', '/auth/register', '/admin/auth/login', '/admin/auth/register', '/admin'];
  const protectedPaths = ['/dashboard', '/admin/dashboard'];
  const currentPath = window.location.pathname;
  
  // Don't redirect if already on a protected path
  const isOnProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
  const shouldRedirectToDefault = isAuthenticated && 
    !loading && 
    !isOnProtectedPath &&
    !publicPaths.some(path => currentPath === path);
  
  if (shouldRedirectToDefault) {
    const defaultRoute = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.DEPARTMENT_STAFF
      ? '/admin/dashboard'
      : '/dashboard';
    console.log('Redirecting to default route:', defaultRoute);
    return <Navigate to={defaultRoute} replace />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route 
          index 
          element={<LandingPage />} 
        />
        <Route path="track" element={<TrackComplaint />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        {/* Admin Authentication Routes */}
        <Route path="auth">
          <Route 
            path="login" 
            element={<AdminLogin />}
          />
          <Route 
            path="register" 
            element={<AdminSelfRegister />}
          />
        </Route>

        {/* Protected Admin Dashboard Routes */}
        <Route
          path="dashboard/*"
          element={
            <ProtectedRoute 
              allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.DEPARTMENT_STAFF]}
              redirectTo="/admin/auth/login"
            >
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Redirect /admin to dashboard if authenticated */}
        <Route 
          index 
          element={
            isAuthenticated && (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.DEPARTMENT_STAFF) 
              ? <Navigate to="/admin/dashboard" replace />
              : <AdminPortal />
          }
        />
      </Route>

      {/* Citizen Authentication Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route 
          path="login" 
          element={<Login />}
        />
        <Route 
          path="register" 
          element={<Register />}
        />
      </Route>

      {/* Protected Citizen Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CITIZEN]} redirectTo="/auth/login">
            <CitizenRoutes />
          </ProtectedRoute>
        }
      >
        {/* Nested routes under /dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="report" element={<ReportIssue />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route path="map" element={<MapView />} />
        <Route path="notifications" element={<NotificationsCenter />} />
        <Route path="profile" element={<Profile />} />
        <Route path="my-complaints" element={<MyComplaints />} />
      </Route>
  
      {/* Fallback for any other routes */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

// Helper function to get default route based on user role
const getDefaultRoute = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.OFFICER:
      return '/admin/dashboard';
    case USER_ROLES.CITIZEN:
    default:
      return '/dashboard';
  }
};

export default AppRouter;