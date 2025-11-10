import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout
import AdminLayout from '../components/Layout/AdminLayout';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import ComplaintsList from '../pages/admin/ComplaintsList';
import ComplaintDetails from '../pages/admin/ComplaintDetails';
import AdminRegister from '../pages/admin/AdminRegister';
import OfficerManagement from '../pages/admin/OfficerManagement';

// Additional Admin Pages (to be created)
import MapView from '../pages/admin/MapView';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

// Admin Management Components
import AdminRegistrationRequests from '../components/admin/AdminRegistrationRequests';
import CreateSuperAdmin from '../components/admin/CreateSuperAdmin';

// Route Protection for Super Admin only
import ProtectedRoute from './ProtectedRoute';
import { USER_ROLES } from '../config/constants';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        {/* Main Admin Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Complaints Management */}
        <Route path="complaints" element={<ComplaintsList />} />
        <Route path="complaints/:id" element={<ComplaintDetails />} />
        
        {/* Map View */}
        <Route path="map" element={<MapView />} />
        
        {/* Reports & Analytics */}
        <Route path="reports" element={<Reports />} />
        
        {/* Officers Management */}
        <Route path="officers" element={<OfficerManagement />} />
        <Route path="officers/:id" element={<div>Officer Details - Coming Soon</div>} />
        <Route path="officers/:id/edit" element={<div>Edit Officer - Coming Soon</div>} />
        
        {/* Settings */}
        <Route path="settings" element={<Settings />} />
        
        {/* Super Admin Only Routes */}
        <Route 
          path="register" 
          element={
            <ProtectedRoute 
              allowedRoles={[USER_ROLES.ADMIN]}
              requireSuperAdmin={true}
            >
              <AdminRegister />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="registration-requests" 
          element={
            <ProtectedRoute 
              allowedRoles={[USER_ROLES.ADMIN]}
              requireSuperAdmin={true}
            >
              <AdminRegistrationRequests />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="create-super-admin" 
          element={
            <ProtectedRoute 
              allowedRoles={[USER_ROLES.ADMIN]}
              requireSuperAdmin={true}
            >
              <CreateSuperAdmin />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy routes for backward compatibility */}
        <Route path="users" element={<OfficerManagement />} />
        <Route path="departments" element={<OfficerManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;