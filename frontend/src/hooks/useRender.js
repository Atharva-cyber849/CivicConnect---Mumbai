/**
 * useRender Hook - Conditional Rendering based on RBAC
 * 
 * Provides helper functions for conditionally rendering UI elements
 * based on user roles and permissions.
 */
import { useCallback } from 'react';
import { useRole, ADMIN_TIERS } from './useRole';

/**
 * useRender Hook
 * 
 * @returns {Object} Conditional rendering helper functions
 */
export const useRender = () => {
  const role = useRole();

  /**
   * Render content only if user is a citizen
   */
  const ifCitizen = useCallback((content, fallback = null) => {
    return role.isCitizen ? content : fallback;
  }, [role.isCitizen]);

  /**
   * Render content only if user is any type of admin
   */
  const ifAdmin = useCallback((content, fallback = null) => {
    return role.isAdmin ? content : fallback;
  }, [role.isAdmin]);

  /**
   * Render content only if user is ward admin or higher
   */
  const ifWardAdmin = useCallback((content, fallback = null) => {
    return role.isWardAdmin ? content : fallback;
  }, [role.isWardAdmin]);

  /**
   * Render content only if user is department admin or higher
   */
  const ifDeptAdmin = useCallback((content, fallback = null) => {
    return role.isDeptAdmin ? content : fallback;
  }, [role.isDeptAdmin]);

  /**
   * Render content only if user is super admin
   */
  const ifSuperAdmin = useCallback((content, fallback = null) => {
    return role.isSuperAdmin ? content : fallback;
  }, [role.isSuperAdmin]);

  /**
   * Render content only if user can view analytics
   */
  const ifCanViewAnalytics = useCallback((content, fallback = null) => {
    return role.canViewAnalytics ? content : fallback;
  }, [role.canViewAnalytics]);

  /**
   * Render content only if user can assign complaints
   */
  const ifCanAssign = useCallback((content, fallback = null) => {
    return role.canAssignComplaints ? content : fallback;
  }, [role.canAssignComplaints]);

  /**
   * Render content only if user can close complaints
   */
  const ifCanClose = useCallback((content, fallback = null) => {
    return role.canCloseComplaints ? content : fallback;
  }, [role.canCloseComplaints]);

  /**
   * Render content only if user can manage officers
   */
  const ifCanManageOfficers = useCallback((content, fallback = null) => {
    return role.canManageOfficers ? content : fallback;
  }, [role.canManageOfficers]);

  /**
   * Render content only if user can manage users
   */
  const ifCanManageUsers = useCallback((content, fallback = null) => {
    return role.canManageUsers ? content : fallback;
  }, [role.canManageUsers]);

  /**
   * Render content only if user has minimum tier
   */
  const ifMinTier = useCallback((minTier, content, fallback = null) => {
    return role.tier >= minTier ? content : fallback;
  }, [role.tier]);

  /**
   * Render content only if user has specific role
   */
  const ifRole = useCallback((requiredRole, content, fallback = null) => {
    return role.role === requiredRole ? content : fallback;
  }, [role.role]);

  /**
   * Render content only if user can access specific ward
   */
  const ifCanAccessWard = useCallback((wardId, content, fallback = null) => {
    return role.canAccessWard(wardId) ? content : fallback;
  }, [role]);

  /**
   * Render content only if user can access specific department
   */
  const ifCanAccessDepartment = useCallback((deptId, content, fallback = null) => {
    return role.canAccessDepartment(deptId) ? content : fallback;
  }, [role]);

  /**
   * Generic render function with custom condition
   */
  const render = useCallback((condition, content, fallback = null) => {
    if (typeof condition === 'function') {
      return condition(role) ? content : fallback;
    }
    return condition ? content : fallback;
  }, [role]);

  /**
   * Component wrapper that renders based on condition
   */
  const RenderIf = useCallback(({ condition, children, fallback = null }) => {
    if (typeof condition === 'function') {
      return condition(role) ? children : fallback;
    }
    return condition ? children : fallback;
  }, [role]);

  return {
    // Role-based rendering
    ifCitizen,
    ifAdmin,
    ifWardAdmin,
    ifDeptAdmin,
    ifSuperAdmin,
    
    // Permission-based rendering
    ifCanViewAnalytics,
    ifCanAssign,
    ifCanClose,
    ifCanManageOfficers,
    ifCanManageUsers,
    
    // Generic rendering
    ifMinTier,
    ifRole,
    ifCanAccessWard,
    ifCanAccessDepartment,
    render,
    
    // Component
    RenderIf,
    
    // Direct access to role info
    role,
  };
};

/**
 * RenderIf Component - Declarative conditional rendering
 * 
 * Usage:
 * <RenderIf condition={role => role.canAssignComplaints}>
 *   <AssignButton />
 * </RenderIf>
 */
export const RenderIf = ({ condition, children, fallback = null }) => {
  const role = useRole();
  
  if (typeof condition === 'function') {
    return condition(role) ? children : fallback;
  }
  return condition ? children : fallback;
};

/**
 * Preset render components
 */
export const RenderIfCitizen = ({ children, fallback = null }) => {
  const role = useRole();
  return role.isCitizen ? children : fallback;
};

export const RenderIfAdmin = ({ children, fallback = null }) => {
  const role = useRole();
  return role.isAdmin ? children : fallback;
};

export const RenderIfWardAdmin = ({ children, fallback = null }) => {
  const role = useRole();
  return role.isWardAdmin ? children : fallback;
};

export const RenderIfDeptAdmin = ({ children, fallback = null }) => {
  const role = useRole();
  return role.isDeptAdmin ? children : fallback;
};

export const RenderIfSuperAdmin = ({ children, fallback = null }) => {
  const role = useRole();
  return role.isSuperAdmin ? children : fallback;
};

export const RenderIfCanAssign = ({ children, fallback = null }) => {
  const role = useRole();
  return role.canAssignComplaints ? children : fallback;
};

export const RenderIfCanClose = ({ children, fallback = null }) => {
  const role = useRole();
  return role.canCloseComplaints ? children : fallback;
};

export default useRender;
