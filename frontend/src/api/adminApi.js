import { axiosPrivate } from './axiosConfig';

// Admin API endpoints
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (filters = {}) => {
    const response = await axiosPrivate.get('/complaints/quick_stats/', { params: filters });
    return response.data;
  },

  // Get all complaints with filters
  getComplaints: async (filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', { 
      params: {
        limit: filters.limit || 10,
        page: filters.page || 1,
        ordering: filters.ordering || '-created_at',
        ...filters
      } 
    });
    return response.data;
  },

  // Get recent complaints (use the complaints list endpoint with limit)
  getRecentComplaints: async (filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', { 
      params: { 
        limit: filters.limit || 5,
        ordering: '-created_at',
        ...filters
      } 
    });
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

  // Get complaint details by ID
  getComplaintById: async (id) => {
    const response = await axiosPrivate.get(`/complaints/${id}/`);
    return response.data;
  },

  // Update complaint status
  updateComplaintStatus: async (id, statusData) => {
    const response = await axiosPrivate.patch(`/complaints/${id}/`, statusData);
    return response.data;
  },

  // Get complaints for map view
  getComplaintsForMap: async (filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', { 
      params: {
        limit: 1000,
        ...filters
      } 
    });
    return response.data.results || response.data;
  },

  // Get analytics data
  getAnalytics: async (filters = {}) => {
    const response = await axiosPrivate.get('/admin/analytics/', { params: filters });
    return response.data;
  },

  // Bulk operations
  bulkUpdateComplaints: async (complaintIds, updateData) => {
    const response = await axiosPrivate.post('/admin/complaints/bulk-update/', {
      complaint_ids: complaintIds,
      ...updateData
    });
    return response.data;
  },

  // ===== Mumbai BMC Ward-specific API Endpoints =====
  
  // Get complaints by ward
  getComplaintsByWard: async (wardCode, period = '30') => {
    const response = await axiosPrivate.get('/complaints/', {
      params: {
        ward: wardCode,
        period,
        limit: 100
      }
    });
    return response.data.results || response.data;
  },

  // Get ward analytics
  getWardAnalytics: async (wardCode, period = '30') => {
    const response = await axiosPrivate.get('/complaints/analytics/', {
      params: {
        ward: wardCode,
        period
      }
    });
    return response.data;
  },

  // Get officers by ward
  getOfficersByWard: async (wardCode) => {
    const response = await axiosPrivate.get('/admin/officers/', {
      params: { ward: wardCode }
    });
    return response.data.results || response.data;
  },

  // Get complaints by zone
  getComplaintsByZone: async (zone, period = '30') => {
    const response = await axiosPrivate.get('/complaints/', {
      params: {
        zone,
        period,
        limit: 500
      }
    });
    return response.data.results || response.data;
  },

  // Get zone analytics
  getZoneAnalytics: async (zone, period = '30') => {
    const response = await axiosPrivate.get('/complaints/analytics/', {
      params: {
        zone,
        period
      }
    });
    return response.data;
  },

  // Get officers by zone
  getOfficersByZone: async (zone) => {
    const response = await axiosPrivate.get('/admin/officers/', {
      params: { zone }
    });
    return response.data.results || response.data;
  },

  // Get comprehensive Mumbai BMC analytics
  getMumbaiBMCAnalytics: async ({ period = '30', zone = 'All' } = {}) => {
    const response = await axiosPrivate.get('/complaints/analytics/', {
      params: {
        period,
        zone: zone !== 'All' ? zone : undefined,
        include_zones: true,
        include_departments: true,
        include_trends: true
      }
    });
    return response.data;
  },

  // Get ward heatmap data
  getWardHeatmapData: async (period = '30') => {
    const response = await axiosPrivate.get('/complaints/analytics/heatmap/', {
      params: { period }
    });
    return response.data;
  },

  // Get SLA metrics by ward
  getSLAMetricsByWard: async (wardCode, period = '30') => {
    const response = await axiosPrivate.get('/complaints/sla-metrics/', {
      params: {
        ward: wardCode,
        period
      }
    });
    return response.data;
  }
};