/**
 * Legacy Sidebar Component - Deprecated
 * 
 * This component has been replaced by the new role-based navigation system:
 * - CitizenNavigation.jsx
 * - WardAdminNavigation.jsx
 * - DepartmentAdminNavigation.jsx
 * - SuperAdminNavigation.jsx
 * - RoleBasedNavigation.jsx (smart wrapper)
 * 
 * Please use the RoleBasedNavigation component instead:
 * import { RoleBasedNavigation } from '../components/Navigation';
 * 
 * This file is kept for backward compatibility only.
 */

import React from 'react';
import { useRole } from '../../hooks/useRole';
import { RoleBasedNavigation } from '../Navigation';

const Sidebar = ({ userType }) => {
  // Redirect to new navigation system
  // Note: This component is deprecated. Please use RoleBasedNavigation instead.
  // See docs/NAVIGATION_MIGRATION_GUIDE.md for migration instructions.

  // Return the new role-based navigation
  return <RoleBasedNavigation />;
};

export default Sidebar;
