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

  // ============================================================================
  // OFFICER SELF-SERVICE (BMC Officer Dashboard)
  // ============================================================================

  /**
   * Get officer profile (current logged-in officer)
   * @returns {Promise} Officer profile object
   */
  getProfile: async () => {
    const response = await axiosPrivate.get('/users/officers/profile/');
    return response.data;
  },

  /**
   * Get assigned complaints for officer
   * @param {Object} filters - Optional filters
   * @param {string} filters.period - Time period (7, 30, 90 days)
   * @param {string} filters.ward - Filter by ward
   * @param {string} filters.status - Filter by status
   * @returns {Promise} Array of assigned complaints
   */
  getAssignedComplaints: async (filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', {
      params: {
        assigned_to_me: true,
        ...filters
      }
    });
    return response.data;
  },

  /**
   * Get performance metrics for officer
   * @param {string} period - Time period (7, 30, 90 days)
   * @returns {Promise} Performance metrics object
   */
  getPerformanceMetrics: async (period = '30') => {
    const response = await axiosPrivate.get('/users/officers/performance/', {
      params: { period }
    });
    return response.data;
  },

  /**
   * Update complaint status (officer action)
   * @param {number} complaintId - The complaint ID
   * @param {Object} statusData - Status update data
   * @returns {Promise} Updated complaint object
   */
  updateComplaintStatus: async (complaintId, statusData) => {
    const response = await axiosPrivate.patch(`/complaints/${complaintId}/status/`, statusData);
    return response.data;
  },

  /**
   * Add resolution to complaint
   * @param {number} complaintId - The complaint ID
   * @param {Object} resolutionData - Resolution data with optional images
   * @returns {Promise} Updated complaint object
   */
  addResolution: async (complaintId, resolutionData) => {
    const formData = new FormData();
    Object.keys(resolutionData).forEach(key => {
      const value = resolutionData[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (item instanceof File) {
              formData.append(key, item);
            }
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await axiosPrivate.patch(`/complaints/${complaintId}/resolution/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Get officer workload summary
   * @returns {Promise} Workload summary object
   */
  getWorkloadSummary: async () => {
    const response = await axiosPrivate.get('/users/officers/workload/');
    return response.data;
  }
};