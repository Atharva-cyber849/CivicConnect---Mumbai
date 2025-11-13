/**
 * Custom hook for logging sensitive operations
 * Use this hook in components that perform sensitive operations like:
 * - Creating/deleting users
 * - Modifying permissions
 * - Resetting passwords
 * - Accessing sensitive data
 */

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logSensitiveOperation, auditLog } from '../utils/securityUtils';

export const useSensitiveOperation = () => {
  const { user } = useAuth();

  /**
   * Log a sensitive operation
   * @param {string} operationType - Type: CREATE, UPDATE, DELETE, VIEW_SENSITIVE, RESET_PASSWORD, etc.
   * @param {string} resource - Resource type: user, complaint, officer, permission, etc.
   * @param {string} resourceId - ID of the resource
   * @param {object} metadata - Additional context
   */
  const logOperation = useCallback((operationType, resource, resourceId, metadata = {}) => {
    if (!user) return;

    const fullMetadata = {
      ...metadata,
      performedBy: user.email,
      userId: user.id,
      userRole: user.role,
      timestamp: new Date().toISOString()
    };

    // Log via both methods for redundancy
    logSensitiveOperation(operationType, resource, resourceId, fullMetadata);
    auditLog(operationType, resource, resourceId, fullMetadata);

    // In development, also log to console
    if (import.meta.env.DEV) {
      console.log('[SENSITIVE OP]', {
        operationType,
        resource,
        resourceId,
        metadata: fullMetadata
      });
    }
  }, [user]);

  return { logOperation };
};

export default useSensitiveOperation;
