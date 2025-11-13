/**
 * Officers API
 * Handles all officer management operations
 */
import { axiosPrivate } from './axiosConfig';

export const officersApi = {
  /**
   * Get all officers
   * @param {Object} filters - Optional filters
   * @param {number} filters.department_id - Filter by department
   * @param {string} filters.assigned_ward - Filter by ward
   * @param {boolean} filters.is_active - Filter by active status
   * @returns {Promise} Array of officers
   */
  getAll: async (filters = {}) => {
    const response = await axiosPrivate.get('/users/officers/', { params: filters });
    return response.data;
  },

  /**
   * Get officer by ID
   * @param {number} id - The officer ID
   * @returns {Promise} Officer object
   */
  getById: async (id) => {
    const response = await axiosPrivate.get(`/users/officers/${id}/`);
    return response.data;
  },

  /**
   * Create a new officer
   * @param {Object} officerData - Officer data
   * @param {number} officerData.user - User ID
   * @param {number} officerData.department - Department ID
   * @param {string} officerData.assigned_ward - Ward code
   * @param {string} officerData.role - Role (ADMIN or DEPARTMENT_STAFF)
   * @param {string} officerData.designation - Officer designation
   * @param {string} officerData.phone - Phone number
   * @param {string} officerData.email - Email address
   * @param {boolean} officerData.is_active - Active status
   * @returns {Promise} Created officer object
   */
  create: async (officerData) => {
    const response = await axiosPrivate.post('/users/officers/', officerData);
    return response.data;
  },

  /**
   * Update an officer
   * @param {number} id - The officer ID
   * @param {Object} officerData - Updated officer data
   * @returns {Promise} Updated officer object
   */
  update: async (id, officerData) => {
    const response = await axiosPrivate.put(`/users/officers/${id}/`, officerData);
    return response.data;
  },

  /**
   * Partially update an officer
   * @param {number} id - The officer ID
   * @param {Object} officerData - Partial officer data
   * @returns {Promise} Updated officer object
   */
  partialUpdate: async (id, officerData) => {
    const response = await axiosPrivate.patch(`/users/officers/${id}/`, officerData);
    return response.data;
  },

  /**
   * Delete an officer
   * @param {number} id - The officer ID
   * @returns {Promise} Response
   */
  delete: async (id) => {
    const response = await axiosPrivate.delete(`/users/officers/${id}/`);
    return response.data;
  },

  // ============================================================================
  // CUSTOM ACTIONS
  // ============================================================================

  /**
   * Toggle officer status (activate/deactivate)
   * @param {number} id - The officer ID
   * @param {boolean} isActive - New active status
   * @returns {Promise} Updated officer object
   */
  toggleStatus: async (id, isActive) => {
    const response = await axiosPrivate.patch(`/users/officers/${id}/status/`, {
      is_active: isActive,
    });
    return response.data;
  },

  /**
   * Reset officer password
   * @param {number} id - The officer ID
   * @param {string} newPassword - Optional new password (if not provided, temporary password is generated)
   * @returns {Promise} Response with temporary password
   */
  resetPassword: async (id, newPassword = null) => {
    const data = {};
    if (newPassword) {
      data.new_password = newPassword;
    }
    const response = await axiosPrivate.post(`/users/officers/${id}/reset_password/`, data);
    return response.data;
  },

  /**
   * Send invitation email to officer
   * @param {number} id - The officer ID
   * @returns {Promise} Response
   */
  sendInvitation: async (id) => {
    const response = await axiosPrivate.post(`/users/officers/${id}/send_invitation/`);
    return response.data;
  },

  // ============================================================================
  // FILTERING
  // ============================================================================

  /**
   * Get officers by department
   * @param {number} departmentId - The department ID
   * @returns {Promise} Array of officers
   */
  getByDepartment: async (departmentId) => {
    const response = await axiosPrivate.get('/users/officers/by_department/', {
      params: { department_id: departmentId },
    });
    return response.data;
  },

  /**
   * Get officers by ward
   * @param {string} ward - The ward code
   * @returns {Promise} Array of officers
   */
  getByWard: async (ward) => {
    const response = await axiosPrivate.get('/users/officers/by_ward/', {
      params: { ward },
    });
    return response.data;
  },

  /**
   * Get active officers only
   * @returns {Promise} Array of active officers
   */
  getActive: async () => {
    const response = await axiosPrivate.get('/users/officers/', {
      params: { is_active: true },
    });
    return response.data;
  },
};
