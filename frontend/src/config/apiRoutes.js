// Django REST API endpoints configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ROUTES = {
  // Auth endpoints - Updated to match Django backend URLs
  AUTH: {
    LOGIN: `${API_BASE_URL}/users/login/`,
    REGISTER: `${API_BASE_URL}/users/register/`,
    ADMIN_REGISTER: `${API_BASE_URL}/users/admin-register/`,
    LOGOUT: `${API_BASE_URL}/users/logout/`,
    REFRESH: `${API_BASE_URL}/users/token/refresh/`,
    PROFILE: `${API_BASE_URL}/users/profile/`
  },

  // Complaints endpoints
  COMPLAINTS: {
    BASE: `${API_BASE_URL}/complaints/`,
    BY_ID: (id) => `${API_BASE_URL}/complaints/${id}/`,
    USER_COMPLAINTS: (userId) => `${API_BASE_URL}/complaints/user/${userId}/`,
    STATUS_UPDATE: (id) => `${API_BASE_URL}/complaints/${id}/status/`,
    ASSIGN: (id) => `${API_BASE_URL}/complaints/${id}/assign/`,
    COMMENTS: (id) => `${API_BASE_URL}/complaints/${id}/comments/`,
    BY_WARD: (wardId) => `${API_BASE_URL}/complaints/ward/${wardId}/`,
    MAP_VIEW: `${API_BASE_URL}/complaints/map/`,
    TRACK: (trackingNumber) => `${API_BASE_URL}/complaints/track/${trackingNumber}/`,
    BULK_UPDATE: `${API_BASE_URL}/admin/complaints/bulk-update/`
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats/`,
    DEPARTMENTS: `${API_BASE_URL}/admin/departments/`,
    DEPARTMENT_BY_ID: (id) => `${API_BASE_URL}/admin/departments/${id}/`,
    OFFICERS: `${API_BASE_URL}/admin/officers/`,
    OFFICER_BY_ID: (id) => `${API_BASE_URL}/admin/officers/${id}/`,
    USERS: `${API_BASE_URL}/admin/users/`,
    USER_STATUS: (id) => `${API_BASE_URL}/admin/users/${id}/status/`,
    WARDS: `${API_BASE_URL}/admin/wards/`
  },

  // Analytics/Reports endpoints
  REPORTS: {
    DASHBOARD: `${API_BASE_URL}/complaints/analytics/dashboard/`,
    DEPARTMENTS: `${API_BASE_URL}/complaints/analytics/departments/`,
    WARDS: `${API_BASE_URL}/complaints/analytics/wards/`,
    HEATMAP: `${API_BASE_URL}/complaints/analytics/heatmap/`,
    TRENDS: `${API_BASE_URL}/complaints/analytics/trends/`,
    USER_ACTIVITY: `${API_BASE_URL}/complaints/analytics/user/`,
    EXPORT: `${API_BASE_URL}/complaints/analytics/export/`,
    PUBLIC: `${API_BASE_URL}/complaints/analytics/public/`
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications/`,
    BY_ID: (id) => `${API_BASE_URL}/notifications/${id}/`,
    MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read/`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read/`,
    UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count/`,
    PREFERENCES: `${API_BASE_URL}/notifications/preferences/`,
    BROADCAST: `${API_BASE_URL}/notifications/broadcast/`,
    PUSH_SUBSCRIBE: `${API_BASE_URL}/notifications/push/subscribe/`,
    PUSH_UNSUBSCRIBE: `${API_BASE_URL}/notifications/push/unsubscribe/`
  },

  // File upload endpoints
  UPLOADS: {
    COMPLAINT_IMAGES: `${API_BASE_URL}/uploads/complaints/`,
    PROFILE_IMAGES: `${API_BASE_URL}/uploads/profiles/`,
    DOCUMENTS: `${API_BASE_URL}/uploads/documents/`
  }
};

export { API_BASE_URL };