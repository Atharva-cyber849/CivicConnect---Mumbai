/**
 * ProtectedRoute Component - RBAC Route Protection
 * 
 * Wraps routes with role-based access control.
 * Redirects unauthorized users to login or unauthorized page.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole, ADMIN_TIERS } from '../hooks/useRole';

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Unauthorized page component
 */
const UnauthorizedPage = ({ message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        {message || "You don't have permission to access this page."}
      </p>
      <div className="space-x-4">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Go Back
        </button>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Home
        </a>
      </div>
    </div>
  </div>
);

/**
 * ProtectedRoute Component
 * 
 * @param {Object} props
 * @param {React.Component} props.Component - Component to render if authorized
 * @param {React.ReactNode} props.children - Children to render if authorized (alternative to Component)
 * @param {string} props.requiredRole - Required role (CITIZEN, ADMIN, DEPARTMENT_STAFF)
 * @param {number} props.minTier - Minimum admin tier required (0-3)
 * @param {string} props.requiredWard - Required ward access
 * @param {string} props.requiredDepartment - Required department access
 * @param {string} props.redirectTo - Custom redirect path for unauthorized users
 * @param {boolean} props.showUnauthorized - Show unauthorized page instead of redirect
 */
const ProtectedRoute = ({
  Component,
  children,
  requiredRole,
  minTier = 0,
  requiredWard,
  requiredDepartment,
  redirectTo,
  showUnauthorized = false,
}) => {
  const { isAuthenticated, loading, authCheckComplete } = useAuth();
  const role = useRole();
  const location = useLocation();

  // Show loading while checking auth
  if (loading || !authCheckComplete) {
    return <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const loginPath = redirectTo || (isAdminRoute ? '/admin/auth/login' : '/auth/login');
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && role.role !== requiredRole) {
    // Special case: ADMIN role includes both ADMIN and DEPARTMENT_STAFF
    const isAdminRequired = requiredRole === 'ADMIN';
    const userIsAdmin = role.role === 'ADMIN' || role.role === 'DEPARTMENT_STAFF';
    
    if (!(isAdminRequired && userIsAdmin)) {
      if (showUnauthorized) {
        return <UnauthorizedPage message="Your role does not have access to this page." />;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check tier requirement
  if (minTier > 0 && role.tier < minTier) {
    if (showUnauthorized) {
      const tierNames = ['Citizen', 'Ward Officer', 'Department Admin', 'Super Admin'];
      return (
        <UnauthorizedPage 
          message={`This page requires ${tierNames[minTier]} access or higher.`} 
        />
      );
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Check ward access
  if (requiredWard && !role.canAccessWard(requiredWard)) {
    if (showUnauthorized) {
      return <UnauthorizedPage message="You don't have access to this ward." />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Check department access
  if (requiredDepartment && !role.canAccessDepartment(requiredDepartment)) {
    if (showUnauthorized) {
      return <UnauthorizedPage message="You don't have access to this department." />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized - render component or children
  if (Component) {
    return <Component />;
  }
  
  return children;
};

/**
 * Higher-order component for protecting routes
 */
export const withProtectedRoute = (WrappedComponent, options = {}) => {
  return (props) => (
    <ProtectedRoute Component={() => <WrappedComponent {...props} />} {...options} />
  );
};

/**
 * Preset protected routes for common access patterns
 */
export const CitizenRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="CITIZEN" {...props}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="ADMIN" {...props}>
    {children}
  </ProtectedRoute>
);

export const WardAdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="ADMIN" minTier={ADMIN_TIERS.WARD_ADMIN} {...props}>
    {children}
  </ProtectedRoute>
);

export const DeptAdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="ADMIN" minTier={ADMIN_TIERS.DEPT_ADMIN} {...props}>
    {children}
  </ProtectedRoute>
);

export const SuperAdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="ADMIN" minTier={ADMIN_TIERS.SUPER_ADMIN} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
