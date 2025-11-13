/**
 * Security Utilities for Frontend
 * Handles sensitive operations logging, session management, and security features
 */

import { toast } from 'react-hot-toast';

/**
 * Session timeout configuration (in milliseconds)
 */
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // Show warning at 5 minutes

let sessionTimeout = null;
let warningTimeout = null;
let sessionWarningShown = false;

/**
 * Audit log entry for sensitive operations
 * @param {string} action - The action performed (e.g., 'CREATE_USER', 'DELETE_COMPLAINT')
 * @param {string} resource - The resource affected (e.g., 'user', 'complaint')
 * @param {string} resourceId - The ID of the affected resource
 * @param {object} details - Additional details about the action
 */
export const auditLog = async (action, resource, resourceId, details = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem('user_data') || '{}');
    
    const logEntry = {
      timestamp,
      action,
      resource,
      resourceId,
      userId: user.id,
      userEmail: user.email,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', logEntry);
    }

    // TODO: Send to backend audit log API endpoint
    // await axiosPrivate.post('/audit-logs/', logEntry);
    
    // Store locally as backup
    const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    auditLogs.push(logEntry);
    // Keep only last 100 logs locally
    if (auditLogs.length > 100) {
      auditLogs.shift();
    }
    localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
};

/**
 * Initialize session timeout tracking
 * Resets timeout on user activity
 * @param {function} onSessionExpire - Callback when session expires
 */
export const initializeSessionTimeout = (onSessionExpire) => {
  const resetTimeout = () => {
    clearTimeout(sessionTimeout);
    clearTimeout(warningTimeout);
    sessionWarningShown = false;

    // Set warning timeout
    warningTimeout = setTimeout(() => {
      if (!sessionWarningShown) {
        sessionWarningShown = true;
        toast.warning('Your session will expire in 5 minutes due to inactivity');
      }
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set actual timeout
    sessionTimeout = setTimeout(() => {
      sessionWarningShown = false;
      if (onSessionExpire) {
        onSessionExpire();
      }
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      toast.error('Session expired due to inactivity');
      window.location.href = '/auth/login';
    }, SESSION_TIMEOUT);
  };

  // Track user activity
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, resetTimeout, true);
  });

  // Initial timeout
  resetTimeout();

  // Return cleanup function
  return () => {
    clearTimeout(sessionTimeout);
    clearTimeout(warningTimeout);
    activityEvents.forEach(event => {
      document.removeEventListener(event, resetTimeout, true);
    });
  };
};

/**
 * Log sensitive operations
 * @param {string} operationType - Type of operation (CREATE, UPDATE, DELETE, VIEW_SENSITIVE)
 * @param {string} resource - Resource type
 * @param {string} resourceId - Resource ID
 * @param {object} metadata - Additional metadata
 */
export const logSensitiveOperation = (operationType, resource, resourceId, metadata = {}) => {
  const sensitiveOps = {
    'DELETE': 'User or system resource was deleted',
    'UPDATE_PERMISSIONS': 'User permissions were modified',
    'UPDATE_STATUS': 'User or resource status was changed',
    'RESET_PASSWORD': 'Password was reset',
    'CREATE_SUPER_ADMIN': 'New super admin account was created',
    'ACCESS_DENIED': 'Unauthorized access was attempted'
  };

  const isAuditRequired = Object.keys(sensitiveOps).includes(operationType);
  
  if (isAuditRequired) {
    auditLog(operationType, resource, resourceId, {
      ...metadata,
      timestamp: new Date().toISOString(),
      description: sensitiveOps[operationType]
    });
  }
};

/**
 * Validate if user can perform action on resource
 * @param {object} user - Current user object
 * @param {string} action - Action to perform
 * @param {object} resource - Resource to act on
 * @returns {boolean} Whether user can perform action
 */
export const canPerformAction = (user, action, resource) => {
  if (!user) return false;

  const isSuperAdmin = user.is_superuser === true;
  const isAdmin = user.role === 'ADMIN';
  const isOfficer = user.role === 'DEPARTMENT_STAFF';

  switch (action) {
    // Super admin can do everything
    case 'DELETE_ANY':
    case 'UPDATE_ANY':
    case 'VIEW_ANY':
    case 'MANAGE_USERS':
    case 'MANAGE_PERMISSIONS':
      return isSuperAdmin;

    // Admin can manage department resources
    case 'DELETE_DEPARTMENT':
    case 'UPDATE_DEPARTMENT':
      return isSuperAdmin || (isAdmin && resource?.department === user?.department);

    // Officer can view ward data
    case 'VIEW_WARD':
      return isSuperAdmin || (isOfficer && resource?.ward === user?.assigned_ward);

    // Any admin staff can view/update complaints in scope
    case 'UPDATE_COMPLAINT':
      return isSuperAdmin || 
             (isAdmin && resource?.department === user?.department) ||
             (isOfficer && resource?.assigned_ward === user?.assigned_ward);

    default:
      return false;
  }
};

/**
 * Get security headers for API calls
 * @returns {object} Security headers
 */
export const getSecurityHeaders = () => {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': import.meta.env.VITE_APP_VERSION || '1.0.0',
    'X-Timestamp': new Date().toISOString()
  };
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate sensitive password requirements
 * @param {string} password - Password to validate
 * @returns {object} Validation result with errors
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special characters (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if resource access is within user's scope
 * @param {object} user - Current user
 * @param {object} resource - Resource to check
 * @returns {boolean} Whether user can access resource
 */
export const isResourceInUserScope = (user, resource) => {
  if (!user || !resource) return false;

  const isSuperAdmin = user.is_superuser === true;
  
  // Super admin can access anything
  if (isSuperAdmin) return true;

  // Department admin scope
  if (user.role === 'ADMIN' && user.department) {
    return resource.department === user.department;
  }

  // Officer ward scope
  if (user.role === 'DEPARTMENT_STAFF' && user.assigned_ward) {
    return resource.assigned_ward === user.assigned_ward;
  }

  return false;
};

/**
 * Clear sensitive data on logout
 */
export const clearSensitiveData = () => {
  // Clear auth tokens
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  
  // Clear any session storage
  sessionStorage.clear();
  
  // Clear audit logs
  localStorage.removeItem('auditLogs');
  
  // Stop session timeout
  clearTimeout(sessionTimeout);
  clearTimeout(warningTimeout);
};

/**
 * Log security event (suspicious activity)
 * @param {string} eventType - Type of security event
 * @param {object} details - Event details
 */
export const logSecurityEvent = (eventType, details = {}) => {
  const securityEvents = {
    'UNAUTHORIZED_ACCESS': 'Attempt to access unauthorized resource',
    'INVALID_ROLE': 'User role mismatch detected',
    'TOKEN_TAMPERING': 'Authentication token appears tampered',
    'SUSPICIOUS_ACTIVITY': 'Suspicious activity detected',
    'PERMISSION_DENIED': 'Permission denied for operation'
  };

  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    description: securityEvents[eventType] || eventType,
    details,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Log to console
  console.warn('[SECURITY]', event);

  // TODO: Send to security logging endpoint
  // await axiosPrivate.post('/security-events/', event);
};

/**
 * Verify CSRF token before sensitive operations
 * @returns {boolean} Whether CSRF token is valid
 */
export const verifyCsrfToken = () => {
  const getCsrfToken = () => {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let c = cookieArray[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length);
      }
    }
    return null;
  };

  const token = getCsrfToken();
  if (!token) {
    logSecurityEvent('TOKEN_TAMPERING', { 
      message: 'CSRF token missing from cookies' 
    });
    return false;
  }
  return true;
};

export default {
  auditLog,
  initializeSessionTimeout,
  logSensitiveOperation,
  canPerformAction,
  getSecurityHeaders,
  sanitizeInput,
  validatePassword,
  isResourceInUserScope,
  clearSensitiveData,
  logSecurityEvent,
  verifyCsrfToken
};
