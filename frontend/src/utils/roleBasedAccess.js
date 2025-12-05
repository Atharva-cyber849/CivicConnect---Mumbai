// Role-based access control utilities
import { USER_ROLES } from '../config/constants';
import { 
  CITIZEN_MODULE, 
  WARD_ADMIN_MODULE, 
  DEPARTMENT_ADMIN_MODULE, 
  SUPER_ADMIN_MODULE 
} from './constants';

/**
 * Check if user is a super admin (ADMIN role + is_superuser flag)
 */
export const isSuperAdmin = (user) => {
  return (user?.role === USER_ROLES.ADMIN && user?.is_superuser === true) || 
         user?.role === 'SUPER_ADMIN';
};

/**
 * Check if user is a department admin (ADMIN role without is_superuser)
 */
export const isDepartmentAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN && !user?.is_superuser;
};

/**
 * Check if user is any type of admin (Super Admin or Department Admin)
 */
export const isAdmin = (user) => {
  return user?.role === USER_ROLES.ADMIN || user?.role === 'ADMIN';
};

/**
 * Check if user is an officer/department staff (BMC Officer)
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
 * Get user role label for display
 */
export const getRoleLabel = (user) => {
  if (isSuperAdmin(user)) return 'Super Admin';
  if (isDepartmentAdmin(user)) return 'Department Admin';
  if (isOfficer(user)) return 'BMC Officer';
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
      userManagement: true,
      zoneManagement: true,      // Super Admin: city-wide zone access
      wardDashboard: true,       // Super Admin: all wards
      createAdmin: true,         // Super Admin: can create admins
      systemSettings: true       // Super Admin: system configuration
    };
  }

  if (isDepartmentAdmin(user)) {
    return {
      ...baseAccess,
      officers: true,            // Department Admin: manage department officers only
      departments: false,        // Cannot access other departments
      settings: false,           // No system settings
      userManagement: false,     // Cannot manage users system-wide
      zoneManagement: false,     // No zone management (city-wide)
      wardDashboard: false,      // No ward dashboard (see all wards)
      createAdmin: false,        // Cannot create admins
      systemSettings: false,     // No system settings
      profile: true              // Can access own profile
    };
  }

  if (isOfficer(user)) {
    return {
      ...baseAccess,
      officers: false,
      departments: false,
      settings: false,
      userManagement: false,
      zoneManagement: false,
      wardDashboard: false,
      createAdmin: false,
      systemSettings: false,
      profile: true              // Can access own profile
    };
  }

  return baseAccess;
};

// ============================================================================
// MODULE ACCESS CONTROL
// ============================================================================

/**
 * Get available modules for a user based on their role and assignment level
 * @param {Object} user - User object with role, is_superuser, assigned_ward, department, etc.
 * @returns {Array} - Array of module objects available to the user
 */
export const getAvailableModules = (user) => {
  if (!user) return [];

  const modules = [];

  // All authenticated users have access to citizen features
  if (user?.role === USER_ROLES.CITIZEN || user?.role === 'CITIZEN') {
    modules.push(CITIZEN_MODULE);
  }

  // Ward-level admin (ADMIN role with assigned_ward)
  if (isAdmin(user) && user?.assigned_ward && !isSuperAdmin(user)) {
    modules.push(WARD_ADMIN_MODULE);
  }

  // Department-level admin (ADMIN role with department)
  if (isDepartmentAdmin(user) && user?.department) {
    modules.push(DEPARTMENT_ADMIN_MODULE);
  }

  // Super admin gets all modules
  if (isSuperAdmin(user)) {
    modules.push(CITIZEN_MODULE, WARD_ADMIN_MODULE, DEPARTMENT_ADMIN_MODULE, SUPER_ADMIN_MODULE);
  }

  return modules;
};

/**
 * Check if user has access to a specific module
 * @param {Object} user - User object
 * @param {String} moduleId - Module ID to check (e.g., 'CITIZEN', 'WARD_ADMIN')
 * @returns {Boolean} - True if user has access to the module
 */
export const hasModuleAccess = (user, moduleId) => {
  const availableModules = getAvailableModules(user);
  return availableModules.some(module => module.id === moduleId);
};

/**
 * Get user's primary module (main dashboard module)
 * Priority: SUPER_ADMIN > DEPARTMENT_ADMIN > WARD_ADMIN > CITIZEN
 * @param {Object} user - User object
 * @returns {Object|null} - Primary module object or null
 */
export const getPrimaryModule = (user) => {
  if (isSuperAdmin(user)) return SUPER_ADMIN_MODULE;
  if (isDepartmentAdmin(user)) return DEPARTMENT_ADMIN_MODULE;
  if (isAdmin(user) && user?.assigned_ward) return WARD_ADMIN_MODULE;
  if (isCitizen(user)) return CITIZEN_MODULE;
  return null;
};

/**
 * Get all features of a module
 * @param {String} moduleId - Module ID
 * @returns {Array} - Array of feature objects
 */
export const getModuleFeatures = (moduleId) => {
  const moduleMap = {
    CITIZEN: CITIZEN_MODULE,
    WARD_ADMIN: WARD_ADMIN_MODULE,
    DEPARTMENT_ADMIN: DEPARTMENT_ADMIN_MODULE,
    SUPER_ADMIN: SUPER_ADMIN_MODULE
  };

  const module = moduleMap[moduleId];
  if (!module) return [];

  return Object.values(module.features || {});
};

/**
 * Get all subfeatures of a specific feature
 * @param {String} moduleId - Module ID
 * @param {String} featureId - Feature ID
 * @returns {Array} - Array of subfeature objects
 */
export const getFeatureSubfeatures = (moduleId, featureId) => {
  const features = getModuleFeatures(moduleId);
  const feature = features.find(f => f.id === featureId);
  return feature?.subFeatures || [];
};

/**
 * Get feature completion percentage for a module
 * @param {String} moduleId - Module ID
 * @returns {Number} - Percentage (0-100)
 */
export const getModuleCompletionPercentage = (moduleId) => {
  const moduleMap = {
    CITIZEN: CITIZEN_MODULE,
    WARD_ADMIN: WARD_ADMIN_MODULE,
    DEPARTMENT_ADMIN: DEPARTMENT_ADMIN_MODULE,
    SUPER_ADMIN: SUPER_ADMIN_MODULE
  };

  const module = moduleMap[moduleId];
  if (!module) return 0;

  const features = Object.values(module.features || {});
  if (features.length === 0) return 0;

  const completedCount = features.reduce((count, feature) => {
    const subfeatures = feature.subFeatures || [];
    const completedSubfeatures = subfeatures.filter(sf => sf.status === 'completed').length;
    return count + (completedSubfeatures > 0 ? 1 : 0);
  }, 0);

  return Math.round((completedCount / features.length) * 100);
};

/**
 * Get all features with their completion status for a module
 * @param {String} moduleId - Module ID
 * @returns {Array} - Array of features with completion metrics
 */
export const getModuleFeatureStatus = (moduleId) => {
  const features = getModuleFeatures(moduleId);
  
  return features.map(feature => {
    const subfeatures = feature.subFeatures || [];
    const completed = subfeatures.filter(sf => sf.status === 'completed').length;
    const total = subfeatures.length;
    
    return {
      ...feature,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      completedCount: completed,
      totalCount: total
    };
  });
};

/**
 * Check if user can access a specific feature
 * @param {Object} user - User object
 * @param {String} moduleId - Module ID
 * @param {String} featureId - Feature ID
 * @returns {Boolean} - True if user has access to the feature
 */
export const hasFeatureAccess = (user, moduleId, featureId) => {
  const hasAccess = hasModuleAccess(user, moduleId);
  if (!hasAccess) return false;

  const features = getModuleFeatures(moduleId);
  const featureExists = features.some(f => f.id === featureId);
  
  return featureExists;
};

