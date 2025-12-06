import React from 'react';
import { useRole } from '../../hooks/useRole';
import SuperAdminDashboard from './SuperAdminDashboard';
import DepartmentAdminDashboard from './DepartmentAdminDashboard';
import BMCOfficerDashboard from '../officer/BMCOfficerDashboard';

const Dashboard = () => {
  const role = useRole();

  // Route to appropriate dashboard based on role tier
  if (role.isSuperAdmin) {
    return <SuperAdminDashboard />;
  }
  
  if (role.isDeptAdmin) {
    return <DepartmentAdminDashboard />;
  }
  
  if (role.isWardAdmin) {
    return <BMCOfficerDashboard />;
  }

  // Fallback for citizens or unknown roles
  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Dashboard not available for your role</p>
    </div>
  );
};

export default Dashboard;
