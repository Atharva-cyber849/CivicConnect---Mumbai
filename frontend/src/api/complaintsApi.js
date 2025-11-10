import { axiosPrivate, axiosPublic } from './axiosConfig';

// Complaints API endpoints
export const complaintsApi = {
  // Geocoding endpoint (no auth required)
  reverseGeocode: async (lat, lon) => {
    const response = await axiosPublic.get(`/complaints/geocode/reverse/`, {
      params: { lat, lon }
    });
    return response.data;
  },
  // Get all complaints (admin view with filtering)
  getAllComplaints: async (filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', { params: filters });
    return response.data;
  },

  // Get user's complaints
  getUserComplaints: async () => {
    const response = await axiosPrivate.get('/complaints/');
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id) => {
    const response = await axiosPrivate.get(`/complaints/${id}/`);
    return response.data;
  },

  // Create new complaint
  createComplaint: async (complaintData) => {
    const formData = new FormData();
    
    // Handle file uploads
    Object.keys(complaintData).forEach(key => {
      if (complaintData[key] instanceof File) {
        formData.append(key, complaintData[key]);
      } else if (Array.isArray(complaintData[key])) {
        complaintData[key].forEach(item => formData.append(key, item));
      } else {
        formData.append(key, complaintData[key]);
      }
    });

    const response = await axiosPrivate.post('/complaints/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update complaint status (admin only)
  updateComplaintStatus: async (id, statusData) => {
    const response = await axiosPrivate.patch(`/complaints/${id}/status/`, statusData);
    return response.data;
  },

  // Assign complaint to department/officer
  assignComplaint: async (id, assignmentData) => {
    const response = await axiosPrivate.patch(`/complaints/${id}/assign/`, assignmentData);
    return response.data;
  },

  // Add comment to complaint
  addComment: async (id, commentData) => {
    const response = await axiosPrivate.post(`/complaints/${id}/comments/`, commentData);
    return response.data;
  },

  // Get complaints by ward
  getComplaintsByWard: async (wardId) => {
    const response = await axiosPrivate.get(`/complaints/ward/${wardId}/`);
    return response.data;
  },

  // Get complaints by location (for map view)
  getComplaintsByLocation: async (bounds) => {
    const response = await axiosPrivate.get('/complaints/map/', { params: bounds });
    return response.data;
  },

  // Track complaint by tracking number (no auth required)
  trackComplaint: async (trackingNumber) => {
    const response = await axiosPublic.get(`/complaints/track/${trackingNumber}/`);
    return response.data;
  },

  // Get public statistics (no auth required)
  getPublicStats: async () => {
    const response = await axiosPublic.get('/complaints/analytics/public/');
    return response.data;
  },

  // Analytics endpoints (admin only)
  getAnalytics: {
    dashboard: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/dashboard/');
      return response.data;
    },
    departments: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/departments/');
      return response.data;
    },
    wards: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/wards/');
      return response.data;
    },
    heatmap: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/heatmap/');
      return response.data;
    },
    trends: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/trends/');
      return response.data;
    },
    userActivity: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/user/');
      return response.data;
    },
    export: async () => {
      const response = await axiosPrivate.get('/complaints/analytics/export/');
      return response.data;
    }
  },

  // Get user-specific statistics  
  getUserStats: async () => {
    const response = await axiosPrivate.get('/complaints/user/stats/');
    return response.data;
  },

  // Get quick stats for admin dashboard
  getQuickStats: async () => {
    const response = await axiosPrivate.get('/complaints/quick-stats/');
    return response.data;
  },

  // Get complaint statistics
  getStatistics: async () => {
    const response = await axiosPrivate.get('/complaints/statistics/');
    return response.data;
  },

  // Get complaints in GeoJSON format
  geoJson: async () => {
    const response = await axiosPrivate.get('/complaints/geo-json/');
    return response.data;
  }
};