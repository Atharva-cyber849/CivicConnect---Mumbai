// Export all API modules
export { authApi } from './authApi';
export { complaintsApi } from './complaintsApi';
export { adminApi } from './adminApi';
export { reportsApi } from './reportsApi';
export { notificationsApi } from './notificationsApi';

// Export axios configuration
export { default as axiosPrivate } from './axiosConfig';

// Legacy exports for backward compatibility
export { authApi as authAPI };
export { complaintsApi as complaintAPI };
export { notificationsApi as notificationAPI };
export { adminApi as departmentAPI };
export { reportsApi as analyticsAPI };

export default {
  auth: authApi,
  complaints: complaintsApi,
  admin: adminApi,
  reports: reportsApi,
  notifications: notificationsApi,
}
