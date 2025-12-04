// Application-wide constants

// Re-export Mumbai-specific constants from utils/constants.js
export {
  MUMBAI_WARDS,
  BMC_DEPARTMENTS,
  BMC_WARD_OFFICES,
  BMC_ZONES,
  BMC_SLA_TIMELINES,
  COMPLAINT_CATEGORIES as COMPLAINT_CATEGORIES_RICH,
  COMPLAINT_CATEGORY_CHOICES,
  COMPLAINT_STATUS as COMPLAINT_STATUS_ARRAY,
  PRIORITY_LEVELS as PRIORITY_LEVELS_ARRAY,
  MUMBAI_MAP_CONFIG,
  FILE_UPLOAD_CONSTRAINTS,
  LANGUAGES,
  departments
} from '../utils/constants';

// User roles - Matching backend model exactly
export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  ADMIN: 'ADMIN', 
  DEPARTMENT_STAFF: 'DEPARTMENT_STAFF'
};

// Helper functions for role checking
export const isSuperAdmin = (user) => {
  return user?.role === 'ADMIN' && user?.is_superuser === true;
};

export const isDepartmentStaff = (user) => {
  return user?.role === 'DEPARTMENT_STAFF';
};

export const isAdmin = (user) => {
  return user?.role === 'ADMIN';
};

export const isCitizen = (user) => {
  return user?.role === 'CITIZEN';
};

// Legacy role mapping for backward compatibility
export const LEGACY_USER_ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Gender choices - Matching backend model
export const GENDER_CHOICES = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
];

// Language preferences - Matching backend model  
export const LANGUAGE_CHOICES = [
  { value: 'EN', label: 'English' },
  { value: 'MR', label: 'Marathi' }
];

// Mumbai Ward choices - Matching backend model
export const WARD_CHOICES = [
  { value: 'A', label: 'A Ward - Colaba, Cuffe Parade' },
  { value: 'B', label: 'B Ward - Dongri, Masjid Bunder' },
  { value: 'C', label: 'C Ward - Marine Lines, Chandanwadi' },
  { value: 'D', label: 'D Ward - Grant Road, Tardeo' },
  { value: 'E', label: 'E Ward - Byculla, Mumbai Central' },
  { value: 'F/N', label: 'F/North Ward - Matunga, Sion' },
  { value: 'F/S', label: 'F/South Ward - Parel, Sewri' },
  { value: 'G/N', label: 'G/North Ward - Dadar, Dharavi' },
  { value: 'G/S', label: 'G/South Ward - Elphinstone Road' },
  { value: 'H/E', label: 'H/East Ward - Bandra East, Khar East' },
  { value: 'H/W', label: 'H/West Ward - Bandra West, Khar West' },
  { value: 'K/E', label: 'K/East Ward - Andheri East' },
  { value: 'K/W', label: 'K/West Ward - Andheri West, Versova' },
  { value: 'L', label: 'L Ward - Kurla' },
  { value: 'M/E', label: 'M/East Ward - Chembur East' },
  { value: 'M/W', label: 'M/West Ward - Chembur West' },
  { value: 'N', label: 'N Ward - Ghatkopar' },
  { value: 'P/N', label: 'P/North Ward - Malad' },
  { value: 'P/S', label: 'P/South Ward - Goregaon' },
  { value: 'R/C', label: 'R/Central Ward - Borivali' },
  { value: 'R/N', label: 'R/North Ward - Dahisar' },
  { value: 'R/S', label: 'R/South Ward - Kandivali' },
  { value: 'S', label: 'S Ward - Bhandup' },
  { value: 'T', label: 'T Ward - Mulund' }
];

// BMC Departments
export const DEPARTMENTS = [
  { id: 'roads', name: 'Roads & Traffic', code: 'RTD' },
  { id: 'water', name: 'Water Supply', code: 'WSD' },
  { id: 'solid_waste', name: 'Solid Waste Management', code: 'SWM' },
  { id: 'sewage', name: 'Sewage & Drainage', code: 'SD' },
  { id: 'electricity', name: 'Electricity', code: 'ED' },
  { id: 'building', name: 'Building & Planning', code: 'BP' },
  { id: 'health', name: 'Public Health', code: 'PH' },
  { id: 'education', name: 'Education', code: 'EDU' },
  { id: 'fire', name: 'Fire Brigade', code: 'FB' },
  { id: 'parks', name: 'Parks & Gardens', code: 'PG' }
];

// Officer Designations
export const DESIGNATIONS = [
  'Assistant Engineer',
  'Junior Engineer', 
  'Executive Engineer',
  'Deputy Engineer',
  'Ward Officer',
  'Health Officer',
  'Sanitary Inspector',
  'Sub Engineer',
  'Technical Assistant',
  'Administrative Officer'
];

// Complaint statuses - Updated to match backend model
export const COMPLAINT_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS', 
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED'
};

// Complaint status labels
export const STATUS_LABELS = {
  [COMPLAINT_STATUS.PENDING]: 'Pending',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'In Progress',
  [COMPLAINT_STATUS.RESOLVED]: 'Resolved',
  [COMPLAINT_STATUS.REJECTED]: 'Rejected'
};

// Complaint status colors (Tailwind classes)
export const STATUS_COLORS = {
  [COMPLAINT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [COMPLAINT_STATUS.RESOLVED]: 'bg-green-100 text-green-800',
  [COMPLAINT_STATUS.REJECTED]: 'bg-red-100 text-red-800'
};

// Complaint categories - Updated to match backend model
export const COMPLAINT_CATEGORIES = {
  POTHOLE: 'POTHOLE',
  STREETLIGHT: 'STREETLIGHT',
  GARBAGE: 'GARBAGE',
  WATER: 'WATER',
  SEWAGE: 'SEWAGE',
  ROAD_DAMAGE: 'ROAD_DAMAGE',
  TRAFFIC_SIGNAL: 'TRAFFIC_SIGNAL',
  PARK: 'PARK',
  NOISE: 'NOISE',
  OTHER: 'OTHER'
};

// Category labels
export const CATEGORY_LABELS = {
  [COMPLAINT_CATEGORIES.POTHOLE]: 'Pothole',
  [COMPLAINT_CATEGORIES.STREETLIGHT]: 'Street Light',
  [COMPLAINT_CATEGORIES.GARBAGE]: 'Garbage/Waste',
  [COMPLAINT_CATEGORIES.WATER]: 'Water Supply',
  [COMPLAINT_CATEGORIES.SEWAGE]: 'Sewage',
  [COMPLAINT_CATEGORIES.ROAD_DAMAGE]: 'Road Damage',
  [COMPLAINT_CATEGORIES.TRAFFIC_SIGNAL]: 'Traffic Signal',
  [COMPLAINT_CATEGORIES.PARK]: 'Park/Recreation',
  [COMPLAINT_CATEGORIES.NOISE]: 'Noise Pollution',
  [COMPLAINT_CATEGORIES.OTHER]: 'Other'
};

// Priority levels - Updated to match backend model
export const PRIORITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

// Priority labels
export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'Low',
  [PRIORITY_LEVELS.MEDIUM]: 'Medium',
  [PRIORITY_LEVELS.HIGH]: 'High',
  [PRIORITY_LEVELS.URGENT]: 'Urgent'
};

// Priority colors
export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: 'bg-gray-100 text-gray-800',
  [PRIORITY_LEVELS.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [PRIORITY_LEVELS.HIGH]: 'bg-orange-100 text-orange-800',
  [PRIORITY_LEVELS.URGENT]: 'bg-red-100 text-red-800'
};

// Notification types
export const NOTIFICATION_TYPES = {
  COMPLAINT_UPDATE: 'complaint_update',
  STATUS_CHANGE: 'status_change',
  ASSIGNMENT: 'assignment',
  COMMENT: 'comment',
  SYSTEM: 'system'
};

// Time ranges for reports
export const TIME_RANGES = {
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_3_MONTHS: '3m',
  LAST_6_MONTHS: '6m',
  LAST_YEAR: '1y'
};

// Time range labels
export const TIME_RANGE_LABELS = {
  [TIME_RANGES.LAST_7_DAYS]: 'Last 7 Days',
  [TIME_RANGES.LAST_30_DAYS]: 'Last 30 Days',
  [TIME_RANGES.LAST_3_MONTHS]: 'Last 3 Months',
  [TIME_RANGES.LAST_6_MONTHS]: 'Last 6 Months',
  [TIME_RANGES.LAST_YEAR]: 'Last Year'
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  MAX_FILES: 5
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// API response messages
export const API_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

// App metadata
export const APP_INFO = {
  NAME: 'Snap & Report - Mumbai',
  VERSION: '1.0.0',
  DESCRIPTION: 'Mumbai City Complaint Management System',
  SUPPORT_EMAIL: 'support@snapandreport.mumbai.gov.in',
  HELP_URL: 'https://help.snapandreport.mumbai.gov.in'
};