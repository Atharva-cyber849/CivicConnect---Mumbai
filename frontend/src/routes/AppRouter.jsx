import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import ErrorBoundary from '../components/Common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../config/constants';

// Layouts
import PublicLayout from '../components/Layout/PublicLayout';
import AuthLayout from '../components/Layout/AuthLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import CitizenLayout from '../components/Layout/CitizenLayout';

// Public Pages
import LandingPage from '../pages/citizen/LandingPage';
import Login from '../pages/citizen/Login';
import Register from '../pages/citizen/Register';

// Citizen Dashboard Pages
import CitizenDashboard from '../pages/citizen/Dashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetail from '../pages/citizen/ComplaintDetail';
import CitizenMapView from '../pages/citizen/MapView';
import NotificationsCenter from '../pages/citizen/NotificationsCenter';
import Profile from '../pages/citizen/Profile';

// Admin Pages
import AdminPortal from '../pages/admin/AdminPortal';
import AdminLogin from '../pages/admin/Login';
import AdminSelfRegister from '../pages/admin/AdminSelfRegister';
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
        </Route>

        {/* ===== PUBLIC WARD SERVICES ===== */}
        <Route path="/ward-services" element={<PublicLayout><MumbaiWardServices /></PublicLayout>} />

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
          <RoleBasedRoute requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.DEPARTMENT_STAFF]}>
            <AdminLayout />
          </RoleBasedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
          <Route path="map" element={<AdminMapView />} />
          <Route path="officer-map" element={<OfficerMapPage />} />
          <Route path="analytics" element={<MumbaiBMCAnalytics />} />
          <Route path="sla-dashboard" element={<SLADashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="officers" element={<OfficerManagement />} />
          <Route path="officers/:id" element={<OfficerDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="register" element={<AdminRegister />} />
          <Route path="create-admin" element={<AdminRegister />} />
          <Route path="self-register" element={<AdminSelfRegister />} />
          <Route path="registration-requests" element={<AdminRegistrationRequests />} />
          <Route path="create-super-admin" element={<CreateSuperAdmin />} />
          
          {/* Mumbai BMC Specific Routes */}
          <Route path="bmc-ward-dashboard" element={<BMCWardDashboard />} />
          <Route path="bmc-zone-management" element={<BMCZoneManagement />} />
        </Route>

        {/* ===== PROTECTED OFFICER ROUTES ===== */}
        <Route path="/officer" element={
          <RoleBasedRoute requiredRoles={[USER_ROLES.DEPARTMENT_STAFF]}>
            <AdminLayout />
          </RoleBasedRoute>
        }>
          <Route path="dashboard" element={<BMCOfficerDashboard />} />
        </Route>

        {/* ===== PROTECTED CITIZEN ROUTES ===== */}
        <Route path="/dashboard" element={
          <CitizenLayout />
        }>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          <Route path="map" element={<CitizenMapView />} />
          <Route path="notifications" element={<NotificationsCenter />} />
          <Route path="profile" element={<Profile />} />
          
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