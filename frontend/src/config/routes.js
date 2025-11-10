// Application routes configuration
export const ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    TRACK: '/track',
    REPORT: '/report'
  },

  // Citizen routes
  CITIZEN: {
    DASHBOARD: '/dashboard',
    MY_COMPLAINTS: '/dashboard/complaints',
    COMPLAINT_DETAILS: '/dashboard/complaints/:id',
    MAP_VIEW: '/dashboard/map',
    NOTIFICATIONS: '/dashboard/notifications',
    PROFILE: '/dashboard/profile',
    REPORT_ISSUE: '/dashboard/report',
    TRACK_COMPLAINT: '/dashboard/track'
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    COMPLAINTS_LIST: '/admin/complaints',
    COMPLAINT_DETAILS: '/admin/complaints/:id',
    MAP_VIEW: '/admin/map',
    REPORTS: '/admin/reports',
    OFFICERS_MANAGEMENT: '/admin/officers',
    DEPARTMENTS: '/admin/departments',
    USER_MANAGEMENT: '/admin/users',
    SETTINGS: '/admin/settings'
  }
};

// Route metadata for navigation and breadcrumbs
export const ROUTE_META = {
  [ROUTES.CITIZEN.DASHBOARD]: {
    title: 'Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'dashboard'
  },
  [ROUTES.CITIZEN.MY_COMPLAINTS]: {
    title: 'My Complaints',
    breadcrumb: 'My Complaints',
    icon: 'complaints'
  },
  [ROUTES.CITIZEN.MAP_VIEW]: {
    title: 'Map View',
    breadcrumb: 'Map',
    icon: 'map'
  },
  [ROUTES.CITIZEN.PROFILE]: {
    title: 'Profile',
    breadcrumb: 'Profile',
    icon: 'user'
  },
  [ROUTES.ADMIN.DASHBOARD]: {
    title: 'Admin Dashboard',
    breadcrumb: 'Dashboard',
    icon: 'dashboard'
  },
  [ROUTES.ADMIN.COMPLAINTS_LIST]: {
    title: 'All Complaints',
    breadcrumb: 'Complaints',
    icon: 'complaints'
  },
  [ROUTES.ADMIN.REPORTS]: {
    title: 'Reports & Analytics',
    breadcrumb: 'Reports',
    icon: 'analytics'
  }
};