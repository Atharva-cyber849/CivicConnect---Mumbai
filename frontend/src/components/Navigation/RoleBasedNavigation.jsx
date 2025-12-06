/**
 * Role-Based Navigation Wrapper
 * Dynamically renders the appropriate navigation component based on user role
 */
import React from 'react';
import { useRole } from '../../hooks/useRole';
import CitizenNavigation from './CitizenNavigation';
import WardAdminNavigation from './WardAdminNavigation';
import DepartmentAdminNavigation from './DepartmentAdminNavigation';
import SuperAdminNavigation from './SuperAdminNavigation';

const RoleBasedNavigation = () => {
  const role = useRole();

  // Render appropriate navigation based on role tier
  if (role.isSuperAdmin) {
    return <SuperAdminNavigation />;
  }

  if (role.isDeptAdmin) {
    return <DepartmentAdminNavigation />;
  }

  if (role.isWardAdmin) {
    return <WardAdminNavigation />;
  }

  if (role.isCitizen) {
    return <CitizenNavigation />;
  }

  // Fallback for unauthenticated or unknown roles
  return null;
};

export default RoleBasedNavigation;
