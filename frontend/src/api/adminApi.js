import { axiosPrivate } from './axiosConfig';

// Admin API endpoints
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await axiosPrivate.get('/admin/dashboard/stats/');
    return response.data;
  },

  // Get all departments
  getDepartments: async () => {
    const response = await axiosPrivate.get('/admin/departments/');
    return response.data;
  },

  // Create new department
  createDepartment: async (departmentData) => {
    const response = await axiosPrivate.post('/admin/departments/', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    const response = await axiosPrivate.put(`/admin/departments/${id}/`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id) => {
    const response = await axiosPrivate.delete(`/admin/departments/${id}/`);
    return response.data;
  },

  // Get all officers
  getOfficers: async () => {
    const response = await axiosPrivate.get('/admin/officers/');
    return response.data;
  },

  // Create new officer
  createOfficer: async (officerData) => {
    const response = await axiosPrivate.post('/admin/officers/', officerData);
    return response.data;
  },

  // Register new officer (for super admin)
  registerOfficer: async (officerData) => {
    const response = await axiosPrivate.post('/admin/officers/register/', officerData);
    return response.data;
  },

  // Get officer details
  getOfficerDetails: async (id) => {
    const response = await axiosPrivate.get(`/admin/officers/${id}/`);
    return response.data;
  },

  // Update officer
  updateOfficer: async (id, officerData) => {
    const response = await axiosPrivate.put(`/admin/officers/${id}/`, officerData);
    return response.data;
  },

  // Update officer status (activate/deactivate)
  updateOfficerStatus: async (id, statusData) => {
    const response = await axiosPrivate.patch(`/admin/officers/${id}/status/`, statusData);
    return response.data;
  },

  // Delete officer
  deleteOfficer: async (id) => {
    const response = await axiosPrivate.delete(`/admin/officers/${id}/`);
    return response.data;
  },

  // Reset officer password
  resetOfficerPassword: async (id) => {
    const response = await axiosPrivate.post(`/admin/officers/${id}/reset-password/`);
    return response.data;
  },

  // Send email invitation
  sendOfficerInvitation: async (id) => {
    const response = await axiosPrivate.post(`/admin/officers/${id}/send-invitation/`);
    return response.data;
  },

  // Get user management data
  getUsers: async (filters = {}) => {
    const response = await axiosPrivate.get('/admin/users/', { params: filters });
    return response.data;
  },

  // Update user status
  updateUserStatus: async (id, statusData) => {
    const response = await axiosPrivate.patch(`/admin/users/${id}/status/`, statusData);
    return response.data;
  },

  // Get ward-wise data
  getWardData: async () => {
    const response = await axiosPrivate.get('/admin/wards/');
    return response.data;
  },

  // Bulk operations
  bulkUpdateComplaints: async (complaintIds, updateData) => {
    const response = await axiosPrivate.post('/admin/complaints/bulk-update/', {
      complaint_ids: complaintIds,
      ...updateData
    });
    return response.data;
  }
};