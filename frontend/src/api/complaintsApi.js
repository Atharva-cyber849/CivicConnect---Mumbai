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
  // Get all complaints (for map and public view)
  getAllComplaints: async (filters = {}) => {
    const response = await axiosPublic.get('/complaints/map/', { params: filters });
    return response.data;
  },

  // Get user's complaints
  getUserComplaints: async () => {
    try {
      const response = await axiosPrivate.get('/complaints/');
      console.log('getUserComplaints response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getUserComplaints error:', error);
      throw error;
    }
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
      const value = complaintData[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(key, item));
        } else {
          formData.append(key, value.toString());
        }
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
    dashboard: async (days = 30) => {
      const response = await axiosPrivate.get('/complaints/analytics/dashboard-summary/', { params: { days } });
      return response.data;
    },
    wardHeatmap: async (days = 30) => {
      const response = await axiosPrivate.get('/complaints/analytics/ward-heatmap/', { params: { days } });
      return response.data;
    },
    responseTimes: async (days = 30) => {
      const response = await axiosPrivate.get('/complaints/analytics/response-times/', { params: { days } });
      return response.data;
    },
    departmentComparison: async (days = 30) => {
      const response = await axiosPrivate.get('/complaints/analytics/department-comparison/', { params: { days } });
      return response.data;
    },
    complaintTrends: async (days = 30) => {
      const response = await axiosPrivate.get('/complaints/analytics/complaint-trends/', { params: { days } });
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
  },

  // Add internal notes to complaint
  addInternalNotes: async (id, notesData) => {
    const response = await axiosPrivate.post(`/complaints/${id}/internal-notes/`, notesData);
    return response.data;
  },

  // Submit resolution for complaint
  submitResolution: async (id, resolutionData) => {
    const formData = new FormData();
    
    // Handle file uploads for resolution images
    Object.keys(resolutionData).forEach(key => {
      const value = resolutionData[key];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item instanceof File) {
              formData.append(`${key}[${index}]`, item);
            } else if (item.file instanceof File) {
              formData.append(`${key}[${index}]`, item.file);
            }
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await axiosPrivate.patch(`/complaints/${id}/resolution/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Refer complaint to another department
  referToDepartment: async (id, departmentData) => {
    const response = await axiosPrivate.patch(`/complaints/${id}/refer/`, departmentData);
    return response.data;
  },

  // ===== Mumbai BMC Ward-specific API Endpoints =====
  
  // Get complaints for a specific ward (citizen-facing)
  getComplaintsByWard: async (wardCode, filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', {
      params: {
        ward: wardCode,
        limit: 50,
        ...filters
      }
    });
    return response.data.results || response.data;
  },

  // Get ward service statistics
  getWardServiceStats: async (wardCode) => {
    const response = await axiosPrivate.get('/complaints/analytics/', {
      params: { ward: wardCode }
    });
    return response.data;
  },

  // Get complaints by zone
  getComplaintsByZone: async (zone, filters = {}) => {
    const response = await axiosPrivate.get('/complaints/', {
      params: {
        zone,
        limit: 100,
        ...filters
      }
    });
    return response.data.results || response.data;
  },

  // Get ward-wise complaint counts
  getWardComplaintCounts: async () => {
    const response = await axiosPrivate.get('/complaints/analytics/ward-stats/');
    return response.data;
  },

  // Get SLA performance for ward
  getWardSLAPerformance: async (wardCode, period = '30') => {
    const response = await axiosPrivate.get('/complaints/analytics/sla/', {
      params: { ward: wardCode, period }
    });
    return response.data;
  }
};