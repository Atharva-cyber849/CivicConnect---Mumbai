import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, isSuperAdmin } from '../config/constants';
import LoadingSpinner from '../components/Layout/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireSuperAdmin = false,
  redirectTo = null 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const loginPath = isAdminRoute ? '/admin/auth/login' : '/auth/login';
    
    return (
      <Navigate 
        to={`${loginPath}?redirect=${location.pathname}`}
        replace 
      />
    );
  }

  // Check if super admin access is required  
  if (requireSuperAdmin && !isSuperAdmin(user)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    const defaultRoute = getDefaultRouteForRole(user?.role);
    return <Navigate to={redirectTo || defaultRoute} replace />;
  }

  // All checks passed - render protected content
  return children;
};

// Helper function to get default route based on user role
const getDefaultRouteForRole = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.DEPARTMENT_STAFF:
      return '/admin/dashboard';
    case USER_ROLES.CITIZEN:
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;