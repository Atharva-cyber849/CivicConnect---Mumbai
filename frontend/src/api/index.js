// Import all API modules first
import { authApi } from './authApi';
import { complaintsApi } from './complaintsApi';
import { complaintDetailsApi } from './complaintDetailsApi';
import { adminApi } from './adminApi';
import { officersApi } from './officersApi';
import { reportsApi } from './reportsApi';
import { notificationsApi } from './notificationsApi';
import { departmentsApi } from './departmentsApi';
import { axiosPrivate, axiosPublic } from './axiosConfig';

// Export all API modules
export { authApi, complaintsApi, complaintDetailsApi, adminApi, officersApi, reportsApi, notificationsApi, departmentsApi };

// Export axios configuration
export { axiosPrivate, axiosPublic };

// Legacy exports for backward compatibility
export { authApi as authAPI, complaintsApi as complaintAPI, complaintDetailsApi as complaintDetailsAPI, notificationsApi as notificationAPI, adminApi as departmentAPI, officersApi as officerAPI, reportsApi as analyticsAPI };
