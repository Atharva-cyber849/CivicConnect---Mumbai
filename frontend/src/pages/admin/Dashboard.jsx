import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../config/constants';
import SuperAdminDashboard from './SuperAdminDashboard';
import DepartmentAdminDashboard from './DepartmentAdminDashboard';
import OfficerDashboard from './OfficerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on role
  // Super admins have role ADMIN with is_superuser flag
  if (user?.role === USER_ROLES.ADMIN && user?.is_superuser) {
    return <SuperAdminDashboard />;
  }
  
  if (user?.role === USER_ROLES.ADMIN) {
    return <DepartmentAdminDashboard />;
  }
  
  if (user?.role === USER_ROLES.DEPARTMENT_STAFF) {
    return <OfficerDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Dashboard not available for your role</p>
    </div>
  );
};

export default Dashboard;
