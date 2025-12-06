# Frontend Role-Based Access Control Implementation Guide

**Focus**: Creating ProtectedRoute component, useRole hook, and role-based routing configuration

---

## 1. Create useRole() Custom Hook

**File**: `frontend/src/hooks/useRole.js`

```javascript
/**
 * Custom hook for checking user role and permissions.
 * Provides convenient methods for role-based conditional rendering.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ROLE_TIERS = {
  CITIZEN: 0,
  WARD_ADMIN: 1,
  DEPARTMENT_ADMIN: 2,
  SUPER_ADMIN: 3,
};

export const useRole = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return {
      role: null,
      tier: -1,
      isCitizen: false,
      isWardAdmin: false,
      isDepartmentAdmin: false,
      isSuperAdmin: false,
      isAnyAdmin: false,
      ward: null,
      department: null,
      canViewAnalytics: false,
      canAssignComplaints: false,
      canCloseComplaints: false,
      canManageUsers: false,
      canApprove: (requiredTier) => false,
      hasAccess: (requiredTier) => false,
    };
  }
  
  // Determine admin tier from JWT token claims
  const adminTier = user.admin_tier || 0;
  
  return {
    // Basic role info
    role: user.role,
    tier: adminTier,
    
    // Role checks
    isCitizen: user.role === 'CITIZEN',
    isWardAdmin: user.role === 'ADMIN' && adminTier === 1,
    isDepartmentAdmin: user.role === 'ADMIN' && adminTier === 2,
    isSuperAdmin: user.role === 'ADMIN' && adminTier === 3,
    isAnyAdmin: user.role === 'ADMIN',
    
    // Scope info
    ward: user.ward || null,
    wardName: user.ward_name || null,
    department: user.department || null,
    departmentName: user.department_name || null,
    
    // Permission checks
    canViewAnalytics: user.role !== 'CITIZEN',
    canAssignComplaints: user.role === 'ADMIN',
    canCloseComplaints: user.role === 'ADMIN' && adminTier >= 2,
    canManageUsers: user.role === 'ADMIN',
    canCreateUsers: user.role === 'ADMIN' && adminTier === 3,
    
    // Tier comparison methods
    hasAccessToTier: (requiredTier) => {
      return adminTier >= requiredTier;
    },
    
    canApprove: (requiredTier) => {
      return adminTier >= requiredTier;
    },
    
    // Role name for display
    getRoleName: () => {
      if (user.role === 'CITIZEN') return 'Citizen';
      if (adminTier === 1) return 'Ward Administrator';
      if (adminTier === 2) return 'Department Administrator';
      if (adminTier === 3) return 'Super Administrator';
      return 'User';
    },
    
    // Scope name for display
    getScopeName: () => {
      if (user.role === 'CITIZEN') return 'Personal';
      if (adminTier === 1) return `Ward ${user.ward_name}`;
      if (adminTier === 2) return user.department_name;
      if (adminTier === 3) return 'City-Wide';
      return 'Unknown';
    },
  };
};

export default useRole;
```

---

## 2. Create ProtectedRoute Component

**File**: `frontend/src/routes/ProtectedRoute.jsx`

```javascript
/**
 * Protected Route Component
 * Validates user role and tier before rendering component.
 * Redirects to appropriate page if access denied.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ROLE_TIERS = {
  CITIZEN: 0,
  WARD_ADMIN: 1,
  DEPARTMENT_ADMIN: 2,
  SUPER_ADMIN: 3,
};

/**
 * ProtectedRoute Component
 * 
 * @param {React.Component} Component - The component to render if authorized
 * @param {String} requiredRole - Required role: 'CITIZEN' | 'ADMIN'
 * @param {Number} minTier - Minimum admin tier (0-3)
 * @param {String} redirectPath - Path to redirect if not authorized
 * @param {Boolean} requireWard - Must have ward assigned
 * @param {Boolean} requireDepartment - Must have department assigned
 */
export const ProtectedRoute = ({
  Component,
  requiredRole,
  minTier = 0,
  redirectPath = '/login',
  requireWard = false,
  requireDepartment = false,
  fallback = null,
}) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  
  // Show loading state while checking auth
  if (loading) {
    return fallback || (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner">Loading...</div>
      </div>
    );
  }
  
  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Role check
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to user's dashboard based on their role
    if (user.role === 'CITIZEN') {
      return <Navigate to="/citizen/dashboard" replace />;
    } else if (user.role === 'ADMIN') {
      const tier = user.admin_tier || 0;
      if (tier === 3) {
        return <Navigate to="/admin/super/dashboard" replace />;
      } else if (tier === 2) {
        return <Navigate to="/admin/dept/dashboard" replace />;
      } else if (tier === 1) {
        return <Navigate to="/admin/ward/dashboard" replace />;
      }
    }
    return <Navigate to="/" replace />;
  }
  
  // Tier check (for admins)
  if (requiredRole === 'ADMIN' && minTier > 0) {
    const userTier = user.admin_tier || 0;
    if (userTier < minTier) {
      // Redirect to their own tier dashboard
      if (userTier === 1) {
        return <Navigate to="/admin/ward/dashboard" replace />;
      } else if (userTier === 2) {
        return <Navigate to="/admin/dept/dashboard" replace />;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Ward requirement check
  if (requireWard && !user.ward) {
    return <Navigate to="/unauthorized?reason=no-ward" replace />;
  }
  
  // Department requirement check
  if (requireDepartment && !user.department) {
    return <Navigate to="/unauthorized?reason=no-department" replace />;
  }
  
  // All checks passed - render component
  return <Component />;
};

/**
 * Alternative: HOC version for function components
 */
export const withProtection = (Component, config = {}) => {
  return (props) => (
    <ProtectedRoute
      Component={(compProps) => <Component {...compProps} {...props} />}
      {...config}
    />
  );
};

export default ProtectedRoute;
```

---

## 3. Update Routes Configuration

**File**: `frontend/src/routes/index.jsx`

```javascript
/**
 * Main routes configuration with role-based protection.
 * Organize routes by role and tier.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import LoadingSpinner from '../components/LoadingSpinner';

// Public Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// Lazy load components
const CitizenDashboard = lazy(() => import('../pages/citizen/Dashboard'));
const ViewComplaint = lazy(() => import('../pages/citizen/ViewComplaint'));
const FileComplaint = lazy(() => import('../pages/citizen/FileComplaint'));
const MyComplaints = lazy(() => import('../pages/citizen/MyComplaints'));
const Profile = lazy(() => import('../pages/citizen/Profile'));

const WardAdminDashboard = lazy(() => import('../pages/admin/ward/Dashboard'));
const WardComplaints = lazy(() => import('../pages/admin/ward/Complaints'));
const WardOfficers = lazy(() => import('../pages/admin/ward/Officers'));
const WardAnalytics = lazy(() => import('../pages/admin/ward/Analytics'));

const DepartmentAdminDashboard = lazy(() => import('../pages/admin/dept/Dashboard'));
const DepartmentComplaints = lazy(() => import('../pages/admin/dept/Complaints'));
const DepartmentOfficers = lazy(() => import('../pages/admin/dept/Officers'));
const DepartmentAnalytics = lazy(() => import('../pages/admin/dept/Analytics'));

const SuperAdminDashboard = lazy(() => import('../pages/admin/super/Dashboard'));
const AllComplaints = lazy(() => import('../pages/admin/super/Complaints'));
const AllOfficers = lazy(() => import('../pages/admin/super/Officers'));
const AllUsers = lazy(() => import('../pages/admin/super/Users'));
const CityAnalytics = lazy(() => import('../pages/admin/super/Analytics'));

// Loading fallback
const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

/**
 * Routes structure:
 * /auth/* - Authentication routes (no protection)
 * /citizen/* - Citizen routes (role='CITIZEN')
 * /admin/ward/* - Ward admin routes (role='ADMIN', tier=1)
 * /admin/dept/* - Department admin routes (role='ADMIN', tier=2)
 * /admin/super/* - Super admin routes (role='ADMIN', tier=3)
 * /unauthorized - Access denied
 */

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ============================================================
          PUBLIC ROUTES (No Authentication Required)
          ============================================================ */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      
      {/* ============================================================
          CITIZEN ROUTES (role='CITIZEN')
          ============================================================ */}
      <Route element={<MainLayout />}>
        <Route
          path="/citizen/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={CitizenDashboard}
                requiredRole="CITIZEN"
              />
            </Suspense>
          }
        />
        
        <Route
          path="/citizen/file-complaint"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={FileComplaint}
                requiredRole="CITIZEN"
              />
            </Suspense>
          }
        />
        
        <Route
          path="/citizen/my-complaints"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={MyComplaints}
                requiredRole="CITIZEN"
              />
            </Suspense>
          }
        />
        
        <Route
          path="/citizen/complaint/:id"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={ViewComplaint}
                requiredRole="CITIZEN"
              />
            </Suspense>
          }
        />
        
        <Route
          path="/citizen/profile"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={Profile}
                requiredRole="CITIZEN"
              />
            </Suspense>
          }
        />
      </Route>
      
      {/* ============================================================
          WARD ADMIN ROUTES (role='ADMIN', tier=1)
          ============================================================ */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/ward/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={WardAdminDashboard}
                requiredRole="ADMIN"
                minTier={1}
                requireWard={true}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/ward/complaints"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={WardComplaints}
                requiredRole="ADMIN"
                minTier={1}
                requireWard={true}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/ward/officers"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={WardOfficers}
                requiredRole="ADMIN"
                minTier={1}
                requireWard={true}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/ward/analytics"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={WardAnalytics}
                requiredRole="ADMIN"
                minTier={1}
                requireWard={true}
              />
            </Suspense>
          }
        />
      </Route>
      
      {/* ============================================================
          DEPARTMENT ADMIN ROUTES (role='ADMIN', tier=2)
          ============================================================ */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/dept/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={DepartmentAdminDashboard}
                requiredRole="ADMIN"
                minTier={2}
                requireDepartment={true}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/dept/complaints"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={DepartmentComplaints}
                requiredRole="ADMIN"
                minTier={2}
                requireDepartment={true}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/dept/officers"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={DepartmentOfficers}
                requiredRole="ADMIN"
                minTier={2}
                requireDepartment={true}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/dept/analytics"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={DepartmentAnalytics}
                requiredRole="ADMIN"
                minTier={2}
                requireDepartment={true}
              />
            </Suspense>
          }
        />
      </Route>
      
      {/* ============================================================
          SUPER ADMIN ROUTES (role='ADMIN', tier=3)
          ============================================================ */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin/super/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={SuperAdminDashboard}
                requiredRole="ADMIN"
                minTier={3}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/super/complaints"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={AllComplaints}
                requiredRole="ADMIN"
                minTier={3}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/super/officers"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={AllOfficers}
                requiredRole="ADMIN"
                minTier={3}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/super/users"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={AllUsers}
                requiredRole="ADMIN"
                minTier={3}
              />
            </Suspense>
          }
        />
        
        <Route
          path="/admin/super/analytics"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute
                Component={CityAnalytics}
                requiredRole="ADMIN"
                minTier={3}
              />
            </Suspense>
          }
        />
      </Route>
      
      {/* ============================================================
          FALLBACK ROUTES
          ============================================================ */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
```

---

## 4. Conditional Rendering Hook

**File**: `frontend/src/hooks/useRender.js`

```javascript
/**
 * Hook for conditional rendering based on role and tier.
 * Returns render functions for different role/tier combinations.
 */

import { useRole } from './useRole';

export const useRender = () => {
  const role = useRole();
  
  return {
    // Render if user is citizen
    ifCitizen: (component) => role.isCitizen ? component : null,
    
    // Render if user is any admin
    ifAdmin: (component) => role.isAnyAdmin ? component : null,
    
    // Render if user is ward admin
    ifWardAdmin: (component) => role.isWardAdmin ? component : null,
    
    // Render if user is department admin
    ifDeptAdmin: (component) => role.isDepartmentAdmin ? component : null,
    
    // Render if user is super admin
    ifSuperAdmin: (component) => role.isSuperAdmin ? component : null,
    
    // Render if user can view analytics
    ifCanViewAnalytics: (component) => role.canViewAnalytics ? component : null,
    
    // Render if user can assign complaints
    ifCanAssign: (component) => role.canAssignComplaints ? component : null,
    
    // Render if user can close complaints
    ifCanClose: (component) => role.canCloseComplaints ? component : null,
    
    // Render if user can manage users
    ifCanManageUsers: (component) => role.canManageUsers ? component : null,
    
    // Conditional render with function
    render: (fn) => fn(role),
  };
};

export default useRender;
```

---

## 5. Usage Examples in Components

```javascript
// Example: Conditional button rendering in complaint detail
import { useRole } from '../hooks/useRole';
import { useRender } from '../hooks/useRender';

const ComplaintDetail = () => {
  const role = useRole();
  const render = useRender();
  
  return (
    <div>
      <h1>Complaint Details</h1>
      
      {/* Show edit button only to owners and admins */}
      {role.isCitizen && <button>Edit Complaint</button>}
      
      {/* Show assign button only to admins */}
      {role.canAssignComplaints && (
        <button onClick={handleAssign}>Assign to Officer</button>
      )}
      
      {/* Show close button only to dept+ admins */}
      {role.canCloseComplaints && (
        <button onClick={handleClose}>Close Complaint</button>
      )}
      
      {/* Show analytics only to non-citizens */}
      {render.ifCanViewAnalytics(<AnalyticsSection />)}
      
      {/* Show approval section only to super admin */}
      {render.ifSuperAdmin(<ApprovalSection />)}
      
      {/* Using conditional render function */}
      {render.render((r) => 
        r.isDepartmentAdmin && <DeptSpecificSection />
      )}
    </div>
  );
};
```

---

**Your frontend is now fully secured with role-based access control!**
