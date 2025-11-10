// Mumbai Municipal Corporation (BMC) Wards (A-T)
export const MUMBAI_WARDS = [
  { value: 'A', label: 'A - Colaba', zone: 'South' },
  { value: 'B', label: 'B - Dockyard Road', zone: 'South' },
  { value: 'C', label: 'C - Kalbadevi', zone: 'South' },
  { value: 'D', label: 'D - Girgaon', zone: 'South' },
  { value: 'E', label: 'E - Byculla', zone: 'South' },
  { value: 'F/N', label: 'F/N - Matunga', zone: 'Central' },
  { value: 'F/S', label: 'F/S - Sewri', zone: 'Central' },
  { value: 'G/N', label: 'G/N - Dadar', zone: 'Central' },
  { value: 'G/S', label: 'G/S - Parel', zone: 'Central' },
  { value: 'H/E', label: 'H/E - Bandra East', zone: 'Western' },
  { value: 'H/W', label: 'H/W - Bandra West', zone: 'Western' },
  { value: 'K/E', label: 'K/E - Andheri East', zone: 'Western' },
  { value: 'K/W', label: 'K/W - Andheri West', zone: 'Western' },
  { value: 'L', label: 'L - Kurla', zone: 'Eastern' },
  { value: 'M/E', label: 'M/E - Chembur', zone: 'Eastern' },
  { value: 'M/W', label: 'M/W - Ghatkopar', zone: 'Eastern' },
  { value: 'N', label: 'N - Ghatkopar', zone: 'Eastern' },
  { value: 'P/N', label: 'P/N - Malad', zone: 'Western' },
  { value: 'P/S', label: 'P/S - Goregaon', zone: 'Western' },
  { value: 'R/N', label: 'R/N - Borivali', zone: 'Western' },
  { value: 'R/C', label: 'R/C - Dahisar', zone: 'Western' },
  { value: 'R/S', label: 'R/S - Kandivali', zone: 'Western' },
  { value: 'S', label: 'S - Vikhroli', zone: 'Eastern' },
  { value: 'T', label: 'T - Mulund', zone: 'Eastern' },
]

// BMC Departments
export const BMC_DEPARTMENTS = [
  { value: 'ROADS', label: 'Roads & Traffic Department', icon: '🛣️' },
  { value: 'SOLID_WASTE', label: 'Solid Waste Management', icon: '🗑️' },
  { value: 'WATER_SUPPLY', label: 'Water Supply', icon: '💧' },
  { value: 'SEWAGE', label: 'Sewage & Drainage', icon: '🚰' },
  { value: 'STREETLIGHTS', label: 'Street Lighting', icon: '💡' },
  { value: 'GARDENS', label: 'Gardens & Parks', icon: '🌳' },
  { value: 'ENCROACHMENT', label: 'Encroachment Removal', icon: '🚧' },
  { value: 'HEALTH', label: 'Public Health', icon: '🏥' },
  { value: 'BUILDING', label: 'Building & Development', icon: '🏗️' },
  { value: 'OTHER', label: 'Other Services', icon: '📋' },
]

// Export as departments for convenience
export const departments = BMC_DEPARTMENTS

// Simple key-value mapping (matches backend exactly)
export const COMPLAINT_CATEGORY_CHOICES = {
  POTHOLE: 'Pothole',
  STREETLIGHT: 'Street Light',
  GARBAGE: 'Garbage/Waste',
  WATER: 'Water Supply',
  SEWAGE: 'Sewage',
  ROAD_DAMAGE: 'Road Damage',
  TRAFFIC_SIGNAL: 'Traffic Signal',
  PARK: 'Park/Recreation',
  NOISE: 'Noise Pollution',
  OTHER: 'Other'
};

// Rich category data for UI components
export const COMPLAINT_CATEGORIES = [
  { value: 'POTHOLE', label: 'Pothole', department: 'ROADS', icon: '🕳️' },
  { value: 'STREETLIGHT', label: 'Street Light', department: 'STREETLIGHTS', icon: '💡' },
  { value: 'GARBAGE', label: 'Garbage/Waste', department: 'SOLID_WASTE', icon: '🗑️' },
  { value: 'WATER', label: 'Water Supply', department: 'WATER_SUPPLY', icon: '💧' },
  { value: 'SEWAGE', label: 'Sewage', department: 'SEWAGE', icon: '🌊' },
  { value: 'ROAD_DAMAGE', label: 'Road Damage', department: 'ROADS', icon: '🚧' },
  { value: 'TRAFFIC_SIGNAL', label: 'Traffic Signal', department: 'ROADS', icon: '🚦' },
  { value: 'PARK', label: 'Park/Recreation', department: 'GARDENS', icon: '🌳' },
  { value: 'NOISE', label: 'Noise Pollution', department: 'OTHER', icon: '🔊' },
  { value: 'OTHER', label: 'Other', department: 'OTHER', icon: '📋' }
]

export const COMPLAINT_STATUS = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { value: 'RESOLVED', label: 'Resolved', color: 'green' },
  { value: 'REJECTED', label: 'Rejected', color: 'red' },
]

export const PRIORITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'gray' },
  { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
  { value: 'HIGH', label: 'High', color: 'orange' },
  { value: 'URGENT', label: 'Urgent', color: 'red' },
]

export const USER_ROLES = [
  { value: 'CITIZEN', label: 'Citizen' },
  { value: 'DEPARTMENT_STAFF', label: 'Department Staff' },
  { value: 'ADMIN', label: 'Administrator' },
]

// Role constants for easier access (matching backend User model)
export const userRoles = {
  ADMIN: 'ADMIN',           // Super Admin and Department Admin
  DEPARTMENT_STAFF: 'DEPARTMENT_STAFF',  // Ward Officers
  CITIZEN: 'CITIZEN'        // Citizens
}

// Mumbai Map Configuration
export const MUMBAI_MAP_CONFIG = {
  center: [19.0760, 72.8777], // Mumbai coordinates
  defaultZoom: 11,
  minZoom: 10,
  maxZoom: 18,
  bounds: {
    min_lat: 18.8928,
    max_lat: 19.2766,
    min_lng: 72.7756,
    max_lng: 72.9919
  }
}

// API Rate Limits
export const API_RATE_LIMITS = {
  POST: { max: 30, window: 300 },   // 30 POST requests per 5 minutes
  GET: { max: 300, window: 300 },   // 300 GET requests per 5 minutes
  PUT: { max: 60, window: 300 },    // 60 PUT requests per 5 minutes
  PATCH: { max: 60, window: 300 },  // 60 PATCH requests per 5 minutes
  DELETE: { max: 30, window: 300 }  // 30 DELETE requests per 5 minutes
}

// File Upload Constraints (matching backend)
export const FILE_UPLOAD_CONSTRAINTS = {
  maxRequestSize: 5 * 1024 * 1024,  // 5MB max request size
  image: {
    maxSize: 2 * 1024 * 1024,      // 2MB max image size
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
}

// Languages
export const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'mr', label: 'मराठी', flag: '🇮🇳' },
]
