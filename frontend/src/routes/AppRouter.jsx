import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import ErrorBoundary from '../components/Common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../config/constants';
import ProtectedRoute from './ProtectedRoute';
import { ADMIN_TIERS } from '../hooks/useRole';

// Layouts
import PublicLayout from '../components/Layout/PublicLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import CitizenLayout from '../components/Layout/CitizenLayout';

// Public Pages
import LandingPage from '../pages/citizen/LandingPage';
import Login from '../pages/citizen/Login';
import Register from '../pages/citizen/Register';
import Sitemap from '../pages/citizen/Sitemap';
import Privacy from '../pages/citizen/Privacy';
import Terms from '../pages/citizen/Terms';

// Citizen Dashboard Pages
import CitizenDashboard from '../pages/citizen/Dashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetail from '../pages/citizen/ComplaintDetail';
import CitizenMapView from '../pages/citizen/MapView';
import NotificationsCenter from '../pages/citizen/NotificationsCenter';
import Profile from '../pages/citizen/Profile';
import Help from '../pages/citizen/Help';
import Emergency from '../pages/citizen/Emergency';
import WardInfo from '../pages/citizen/WardInfo';

// Admin Pages
import AdminPortal from '../pages/admin/AdminPortal';
import AdminLogin from '../pages/admin/Login';
import AdminSelfRegister from '../pages/admin/AdminSelfRegister';
import UserManagement from '../pages/admin/UserManagement';
import AdminDashboard from '../pages/admin/Dashboard';
import ComplaintsList from '../pages/admin/ComplaintsList';
import ComplaintDetails from '../pages/admin/ComplaintDetails';
import AdminMapView from '../pages/admin/MapView';
import OfficerMapPage from '../pages/admin/OfficerMap';
import MumbaiBMCAnalytics from '../pages/admin/MumbaiBMCAnalytics';
import SLADashboard from '../pages/admin/SLADashboard';
import Reports from '../pages/admin/Reports';
import OfficerManagement from '../pages/admin/OfficerManagement';
import OfficerDetails from '../pages/admin/OfficerDetails';
import Settings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/Profile';
import AdminRegister from '../pages/admin/AdminRegister';
import AdminRegistrationRequests from '../components/admin/AdminRegistrationRequests';
import CreateSuperAdmin from '../components/admin/CreateSuperAdmin';
import Departments from '../pages/admin/Departments';
import Documentation from '../pages/admin/Documentation';
import AdminHelp from '../pages/admin/Help';

// Mumbai BMC Specific Pages
import BMCWardDashboard from '../pages/admin/BMCWardDashboard';
import BMCZoneManagement from '../pages/admin/BMCZoneManagement';
import MumbaiWardServices from '../pages/citizen/MumbaiWardServices';
import BMCOfficerDashboard from '../pages/officer/BMCOfficerDashboard';

// Role-based route protection component
const RoleBasedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const loginPath = isAdminRoute ? '/admin/auth/login' : '/auth/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRouter = () => {
  const { isAuthenticated, user, authCheckComplete } = useAuth();
  const location = useLocation();

  // Show loading while auth check is in progress
  if (!authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users away from auth pages (but allow / and /track)
  const authOnlyPaths = ['/auth/login', '/auth/register', '/admin/auth/login', '/admin/auth/register'];
  if (isAuthenticated && authOnlyPaths.includes(location.pathname)) {
    const defaultRoute = (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.DEPARTMENT_STAFF)
      ? '/admin/dashboard'
      : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  // Wrapper component for error boundaries
  const RouteWithErrorBoundary = ({ element, ...rest }) => (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        {element}
      </Suspense>
    </ErrorBoundary>
  );

  // Create a route element with error boundary
  const createRoute = (path, element, requiredRoles = []) => {
    const routeElement = (
      <RoleBasedRoute requiredRoles={requiredRoles}>
        {element}
      </RoleBasedRoute>
    );

    return (
      <Route
        key={path}
        path={path}
        element={
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              {routeElement}
            </Suspense>
          </ErrorBoundary>
        }
      />
    );
  };

  return (
    <ErrorBoundary>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="ward-services" element={<MumbaiWardServices />} />
          <Route path="sitemap" element={<Sitemap />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>

        {/* ===== CITIZEN AUTH ROUTES ===== */}
        <Route path="/auth/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/auth/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* ===== ADMIN PORTAL (NO AUTH REQUIRED) ===== */}
        <Route path="/admin" element={
          <AdminPortal />
        } />
        <Route path="/admin/auth/login" element={
          <AdminLogin />
        } />
        <Route path="/admin/auth/register" element={
          <AdminSelfRegister />
        } />

        {/* ===== PROTECTED ADMIN ROUTES ===== */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
          <Route path="departments" element={<Departments />} />
          <Route path="map" element={<AdminMapView />} />
          <Route path="officer-map" element={<OfficerMapPage />} />
          
          {/* Analytics - requires at least Ward Admin tier */}
          <Route path="analytics" element={
            <ProtectedRoute minTier={ADMIN_TIERS.WARD_ADMIN} showUnauthorized>
              <MumbaiBMCAnalytics />
            </ProtectedRoute>
          } />
          <Route path="sla-dashboard" element={
            <ProtectedRoute minTier={ADMIN_TIERS.WARD_ADMIN} showUnauthorized>
              <SLADashboard />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute minTier={ADMIN_TIERS.WARD_ADMIN} showUnauthorized>
              <Reports />
            </ProtectedRoute>
          } />
          
          {/* Officer Management - requires at least Dept Admin tier */}
          <Route path="officers" element={
            <ProtectedRoute minTier={ADMIN_TIERS.DEPT_ADMIN} showUnauthorized>
              <OfficerManagement />
            </ProtectedRoute>
          } />
          <Route path="officers/:id" element={
            <ProtectedRoute minTier={ADMIN_TIERS.DEPT_ADMIN} showUnauthorized>
              <OfficerDetails />
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="documentation" element={<Documentation />} />
          <Route path="help" element={<AdminHelp />} />
          
          {/* Admin Registration - requires Super Admin tier */}
          <Route path="register" element={
            <ProtectedRoute minTier={ADMIN_TIERS.SUPER_ADMIN} showUnauthorized>
              <AdminRegister />
            </ProtectedRoute>
          } />
          {/* Unified User Management (Super Admin Only) */}
          <Route path="self-register" element={
            <ProtectedRoute minTier={ADMIN_TIERS.SUPER_ADMIN} showUnauthorized>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="registration-requests" element={
            <ProtectedRoute minTier={ADMIN_TIERS.SUPER_ADMIN} showUnauthorized>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          {/* Individual Admin Creation Forms */}
          <Route path="create-admin" element={
            <ProtectedRoute minTier={ADMIN_TIERS.SUPER_ADMIN} showUnauthorized>
              <AdminRegister />
            </ProtectedRoute>
          } />
          <Route path="create-super-admin" element={
            <ProtectedRoute minTier={ADMIN_TIERS.SUPER_ADMIN} showUnauthorized>
              <CreateSuperAdmin />
            </ProtectedRoute>
          } />
          
          {/* Mumbai BMC Specific Routes */}
          <Route path="bmc-ward-dashboard" element={<BMCWardDashboard />} />
          <Route path="bmc-zone-management" element={
            <ProtectedRoute minTier={ADMIN_TIERS.DEPT_ADMIN} showUnauthorized>
              <BMCZoneManagement />
            </ProtectedRoute>
          } />
        </Route>

        {/* ===== PROTECTED OFFICER ROUTES ===== */}
        <Route path="/officer" element={
          <ProtectedRoute requiredRole="ADMIN" minTier={ADMIN_TIERS.WARD_ADMIN}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<BMCOfficerDashboard />} />
        </Route>

        {/* ===== PROTECTED CITIZEN ROUTES ===== */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <CitizenLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          <Route path="map" element={<CitizenMapView />} />
          <Route path="notifications" element={<NotificationsCenter />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<Help />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="ward-info" element={<WardInfo />} />
          
          {/* Mumbai Ward Services for Citizens */}
          <Route path="mumbai-ward-services" element={<MumbaiWardServices />} />
        </Route>

        {/* ===== ERROR PAGES ===== */}
        <Route path="/unauthorized" element={
          <PublicLayout>
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
              <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Return to Home
              </Link>
            </div>
          </PublicLayout>
        } />

        {/* ===== 404 CATCH-ALL ===== */}
        <Route path="*" element={
          <PublicLayout>
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">The page you're looking for doesn't exist.</p>
              <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Go to Home
              </Link>
            </div>
          </PublicLayout>
        } />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouter;