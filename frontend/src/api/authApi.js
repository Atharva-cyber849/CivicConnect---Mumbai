import { axiosPrivate } from './axiosConfig';

// Auth API endpoints - Updated to match Django backend
export const authApi = {
  // Login user
  login: async (credentials) => {
    const response = await axiosPrivate.post('/users/login/', credentials);
    return response.data;
  },

  // Register citizen
  register: async (userData) => {
    const response = await axiosPrivate.post('/users/register/', userData);
    return response.data;
  },

  // Register admin
  adminRegister: async (adminData, role) => {
    const response = await axiosPrivate.post(`/users/admin-register/?role=${role}`, adminData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await axiosPrivate.post('/users/logout/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axiosPrivate.post('/users/token/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await axiosPrivate.get('/users/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axiosPrivate.put('/users/profile/', profileData);
    return response.data;
  },

  // Admin management APIs (super admin only)
  getAdminRequests: async () => {
    const response = await axiosPrivate.get('/users/admin-requests/');
    return response.data;
  },

  approveAdminRequest: async (requestId) => {
    const response = await axiosPrivate.post(`/users/admin-requests/${requestId}/action/`, {
      action: 'approve'
    });
    return response.data;
  },

  rejectAdminRequest: async (requestId, reason) => {
    const response = await axiosPrivate.post(`/users/admin-requests/${requestId}/action/`, {
      action: 'reject',
      reason
    });
    return response.data;
  },

  createSuperAdmin: async (adminData) => {
    const response = await axiosPrivate.post('/users/create-super-admin/', adminData);
    return response.data;
  }
};