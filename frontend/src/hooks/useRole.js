/**
 * useRole Hook - RBAC Role Management
 * 
 * Provides role checking, tier calculation, and permission helpers
 * for role-based access control throughout the application.
 */
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// Role constants
export const ROLES = {
  CITIZEN: 'CITIZEN',
  DEPARTMENT_STAFF: 'DEPARTMENT_STAFF',
  ADMIN: 'ADMIN',
};

// Admin tier levels
export const ADMIN_TIERS = {
  CITIZEN: 0,
  WARD_ADMIN: 1,      // BMC Officer / Ward-level admin
  DEPT_ADMIN: 2,      // Department Admin
  SUPER_ADMIN: 3,     // Super Admin
};

// Map admin_tier string to numeric tier
const TIER_MAP = {
  'citizen': ADMIN_TIERS.CITIZEN,
  'bmc_officer': ADMIN_TIERS.WARD_ADMIN,
  'department_admin': ADMIN_TIERS.DEPT_ADMIN,
  'super_admin': ADMIN_TIERS.SUPER_ADMIN,
};

/**
 * Calculate numeric tier from user data
 */
const calculateTier = (user) => {
  if (!user) return ADMIN_TIERS.CITIZEN;
  
  // Use admin_tier from JWT if available
  if (user.admin_tier) {
    return TIER_MAP[user.admin_tier] ?? ADMIN_TIERS.CITIZEN;
  }
  
  // Fallback calculation based on role and is_superuser
  if (user.role === ROLES.ADMIN && user.is_superuser) {
    return ADMIN_TIERS.SUPER_ADMIN;
  }
  if (user.role === ROLES.ADMIN) {
    return ADMIN_TIERS.DEPT_ADMIN;
  }
  if (user.role === ROLES.DEPARTMENT_STAFF) {
    return ADMIN_TIERS.WARD_ADMIN;
  }
  
  return ADMIN_TIERS.CITIZEN;
};

/**
 * useRole Hook
 * 
 * @returns {Object} Role information and permission helpers
 */
export const useRole = () => {
  const { user, isAuthenticated } = useAuth();
  
  return useMemo(() => {
    const role = user?.role || ROLES.CITIZEN;
    const tier = calculateTier(user);
    const isAdmin = role === ROLES.ADMIN || role === ROLES.DEPARTMENT_STAFF;
    
    return {
      // Basic info
      role,
      tier,
      isAuthenticated,
      user,
      
      // Role checks
      isCitizen: role === ROLES.CITIZEN,
      isAdmin,
      isWardAdmin: tier >= ADMIN_TIERS.WARD_ADMIN,
      isDeptAdmin: tier >= ADMIN_TIERS.DEPT_ADMIN,
      isSuperAdmin: tier >= ADMIN_TIERS.SUPER_ADMIN,
      
      // Exact tier checks (not "at least")
      isExactlyWardAdmin: tier === ADMIN_TIERS.WARD_ADMIN,
      isExactlyDeptAdmin: tier === ADMIN_TIERS.DEPT_ADMIN,
      isExactlySuperAdmin: tier === ADMIN_TIERS.SUPER_ADMIN,
      
      // Permission checks
      canViewComplaints: isAuthenticated,
      canCreateComplaints: role === ROLES.CITIZEN,
      canModifyOwnComplaints: role === ROLES.CITIZEN,
      canAssignComplaints: tier >= ADMIN_TIERS.WARD_ADMIN,
      canCloseComplaints: tier >= ADMIN_TIERS.DEPT_ADMIN,
      canViewAnalytics: tier >= ADMIN_TIERS.WARD_ADMIN,
      canManageOfficers: tier >= ADMIN_TIERS.DEPT_ADMIN,
      canManageUsers: tier >= ADMIN_TIERS.SUPER_ADMIN,
      canAccessAuditLogs: tier >= ADMIN_TIERS.SUPER_ADMIN,
      canManageDepartments: tier >= ADMIN_TIERS.SUPER_ADMIN,
      
      // Scope information
      wardId: user?.assigned_ward || null,
      departmentId: user?.department || null,
      departmentName: user?.department_name || null,
      
      // Helper methods
      hasMinTier: (minTier) => tier >= minTier,
      hasRole: (requiredRole) => role === requiredRole,
      hasAnyRole: (roles) => roles.includes(role),
      
      /**
       * Check if user can access a specific ward
       */
      canAccessWard: (wardId) => {
        if (tier >= ADMIN_TIERS.SUPER_ADMIN) return true;
        if (tier >= ADMIN_TIERS.DEPT_ADMIN) return true; // Dept admins can access all wards in dept
        return user?.assigned_ward === wardId;
      },
      
      /**
       * Check if user can access a specific department
       */
      canAccessDepartment: (deptId) => {
        if (tier >= ADMIN_TIERS.SUPER_ADMIN) return true;
        return user?.department === deptId;
      },
      
      /**
       * Get human-readable scope name
       */
      getScopeName: () => {
        if (tier >= ADMIN_TIERS.SUPER_ADMIN) return 'All Wards';
        if (tier >= ADMIN_TIERS.DEPT_ADMIN) return user?.department_name || 'Department';
        if (tier >= ADMIN_TIERS.WARD_ADMIN) return `Ward ${user?.assigned_ward || 'Unknown'}`;
        return 'Personal';
      },
      
      /**
       * Get tier display name
       */
      getTierName: () => {
        switch (tier) {
          case ADMIN_TIERS.SUPER_ADMIN: return 'Super Admin';
          case ADMIN_TIERS.DEPT_ADMIN: return 'Department Admin';
          case ADMIN_TIERS.WARD_ADMIN: return 'Ward Officer';
          default: return 'Citizen';
        }
      },
    };
  }, [user, isAuthenticated]);
};

export default useRole;
