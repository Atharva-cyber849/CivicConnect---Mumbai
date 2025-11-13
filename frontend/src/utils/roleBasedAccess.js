// Role-based access control utilities
import { USER_ROLES } from '../config/constants';

/**
 * Check if user is a super admin
 */
export const isSuperAdmin = (user) => {
  return user?.is_superuser === true || user?.role === 'SUPER_ADMIN';
};

/**
 * Check if user is an admin
 */
export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN || user?.role === 'ADMIN';
};

/**
 * Check if user is an officer/department staff
 */
export const isOfficer = (user) => {
  return user?.role === USER_ROLES.DEPARTMENT_STAFF || user?.role === 'OFFICER' || user?.role === 'DEPARTMENT_STAFF';
};

/**
 * Check if user is a citizen
 */
export const isCitizen = (user) => {
  return user?.role === USER_ROLES.CITIZEN || user?.role === 'CITIZEN';
};

/**
 * Get user role label
 */
export const getRoleLabel = (user) => {
  if (isSuperAdmin(user)) return 'Super Admin';
  if (isAdmin(user)) return 'Admin';
  if (isOfficer(user)) return 'Officer';
  if (isCitizen(user)) return 'Citizen';
  return 'Unknown';
};

/**
 * Check if user can access admin pages
 */
export const canAccessAdminPages = (user) => {
  return isSuperAdmin(user) || isAdmin(user) || isOfficer(user);
};

/**
 * Check if user can view all data
 */
export const canViewAllData = (user) => {
  return isSuperAdmin(user);
};

/**
 * Check if user can view department data
 */
export const canViewDepartmentData = (user) => {
  return isSuperAdmin(user) || isAdmin(user);
};

/**
 * Check if user can view ward data
 */
export const canViewWardData = (user) => {
  return isSuperAdmin(user) || isOfficer(user);
};

/**
 * Check if user can manage officers
 */
export const canManageOfficers = (user) => {
  return isSuperAdmin(user) || isAdmin(user);
};

/**
 * Check if user can manage departments
 */
export const canManageDepartments = (user) => {
  return isSuperAdmin(user);
};

/**
 * Check if user can export reports
 */
export const canExportReports = (user) => {
  return isSuperAdmin(user) || isAdmin(user) || isOfficer(user);
};

/**
 * Get filtered data based on user role
 */
export const getFilteredData = (data, user) => {
  if (!data) return data;
  
  if (isSuperAdmin(user)) {
    return data; // Super admin sees all data
  }
  
  if (isAdmin(user)) {
    // Admin sees only their department data
    return data.filter(item => item.department === user?.department);
  }
  
  if (isOfficer(user)) {
    // Officer sees only their ward data
    return data.filter(item => item.ward === user?.assigned_ward);
  }
  
  return [];
};

/**
 * Get role-based page access
 */
export const getPageAccess = (user) => {
  const baseAccess = {
    dashboard: canAccessAdminPages(user),
    reports: canAccessAdminPages(user),
    complaints: canAccessAdminPages(user),
    map: canAccessAdminPages(user)
  };

  if (isSuperAdmin(user)) {
    return {
      ...baseAccess,
      officers: true,
      departments: true,
      settings: true,
      userManagement: true
    };
  }

  if (isAdmin(user)) {
    return {
      ...baseAccess,
      officers: true,
      departments: false,
      settings: false,
      userManagement: false
    };
  }

  if (isOfficer(user)) {
    return {
      ...baseAccess,
      officers: false,
      departments: false,
      settings: false,
      userManagement: false
    };
  }

  return baseAccess;
};
