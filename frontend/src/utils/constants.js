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

// BMC Departments - Comprehensive List
export const BMC_DEPARTMENTS = [
  // 1. Roads & Traffic
  { value: 'ROADS_MAINTENANCE', label: 'Roads & Maintenance Department', icon: '🛣️', category: 'Roads & Traffic' },
  { value: 'BRIDGES', label: 'Bridges Department', icon: '🌉', category: 'Roads & Traffic' },
  { value: 'TRAFFIC', label: 'Traffic Department', icon: '🚦', category: 'Roads & Traffic' },
  
  // 2. Solid Waste & Sanitation
  { value: 'SOLID_WASTE', label: 'Solid Waste Management (SWM)', icon: '🗑️', category: 'Solid Waste & Sanitation' },
  { value: 'SANITATION', label: 'Sanitation Department', icon: '🧹', category: 'Solid Waste & Sanitation' },
  { value: 'DEBRIS_REMOVAL', label: 'Debris Removal Unit', icon: '🚛', category: 'Solid Waste & Sanitation' },
  
  // 3. Water & Sewerage
  { value: 'WATER_SUPPLY', label: 'Hydraulic Engineer (Water Supply) Department', icon: '💧', category: 'Water & Sewerage' },
  { value: 'SEWERAGE', label: 'Sewerage Operations Department', icon: '🚰', category: 'Water & Sewerage' },
  { value: 'STORM_WATER', label: 'Storm Water Drains (SWD) Department', icon: '🌊', category: 'Water & Sewerage' },
  
  // 4. Public Health
  { value: 'PUBLIC_HEALTH', label: 'Public Health Department', icon: '🏥', category: 'Public Health' },
  { value: 'MEDICAL_OFFICER', label: 'Medical Officer of Health (MOH)', icon: '⚕️', category: 'Public Health' },
  { value: 'MOSQUITO_CONTROL', label: 'Insecticide Department (Mosquito Control)', icon: '🦟', category: 'Public Health' },
  { value: 'HOSPITALS', label: 'Hospitals & Dispensaries Department', icon: '🏨', category: 'Public Health' },
  
  // 5. Building & Infrastructure
  { value: 'BUILDING_FACTORY', label: 'Building & Factory Department (B&F)', icon: '🏗️', category: 'Building & Infrastructure' },
  { value: 'DEVELOPMENT_PLAN', label: 'Development Plan (DP) Department', icon: '📐', category: 'Building & Infrastructure' },
  { value: 'ESTATE', label: 'Estate Department', icon: '🏢', category: 'Building & Infrastructure' },
  { value: 'ARCHITECTURE', label: 'Architecture Department', icon: '🏛️', category: 'Building & Infrastructure' },
  
  // 6. Licenses & Regulation
  { value: 'LICENSE', label: 'License Department', icon: '📜', category: 'Licenses & Regulation' },
  { value: 'SHOPS_ESTABLISHMENT', label: 'Shops & Establishment Department', icon: '🏪', category: 'Licenses & Regulation' },
  { value: 'ENCROACHMENT', label: 'Encroachment Removal Department', icon: '🚧', category: 'Licenses & Regulation' },
  
  // 7. Environment & Sustainability
  { value: 'ENVIRONMENT', label: 'Environment Department', icon: '🌍', category: 'Environment & Sustainability' },
  { value: 'POLLUTION_CONTROL', label: 'Pollution Control Cell', icon: '💨', category: 'Environment & Sustainability' },
  { value: 'GARDENS', label: 'Tree Authority / Gardens Department', icon: '🌳', category: 'Environment & Sustainability' },
  
  // 8. Fire & Emergency Services
  { value: 'FIRE_BRIGADE', label: 'Mumbai Fire Brigade', icon: '🚒', category: 'Fire & Emergency Services' },
  { value: 'DISASTER_MANAGEMENT', label: 'Disaster Management Department', icon: '⚠️', category: 'Fire & Emergency Services' },
  
  // 9. Education & Social Development
  { value: 'EDUCATION', label: 'Education Department (Municipal Schools)', icon: '🎓', category: 'Education & Social Development' },
  { value: 'SOCIAL_WELFARE', label: 'Social Welfare Department', icon: '🤝', category: 'Education & Social Development' },
  
  // 10. Finance & Administration
  { value: 'ACCOUNTS_FINANCE', label: 'Accounts & Finance Department', icon: '💰', category: 'Finance & Administration' },
  { value: 'AUDIT', label: 'Audit Department', icon: '📊', category: 'Finance & Administration' },
  { value: 'GENERAL_ADMINISTRATION', label: 'General Administration Department', icon: '📋', category: 'Finance & Administration' },
  { value: 'IT_DEPARTMENT', label: 'Information Technology (IT) Department', icon: '💻', category: 'Finance & Administration' },
  { value: 'LEGAL', label: 'Legal Department', icon: '⚖️', category: 'Finance & Administration' },
  { value: 'HUMAN_RESOURCES', label: 'Human Resources (Personnel Department)', icon: '👥', category: 'Finance & Administration' },
  
  // 11. Additional Key Departments
  { value: 'MARKET', label: 'Market Department', icon: '🛒', category: 'Additional Services' },
  { value: 'VETERINARY', label: 'Veterinary Health Department', icon: '🐾', category: 'Additional Services' },
  { value: 'SECURITY', label: 'Security Department', icon: '🔒', category: 'Additional Services' },
  { value: 'ESTATE_SURVEY', label: 'Estate Survey Department', icon: '📍', category: 'Additional Services' },
  { value: 'BEST_TRANSPORT', label: 'BEST (Transport)', icon: '🚌', category: 'Additional Services' },
  { value: 'PUBLIC_RELATIONS', label: 'Public Relations Department', icon: '📢', category: 'Additional Services' },
  { value: 'ELECTIONS', label: 'Election Department', icon: '🗳️', category: 'Additional Services' },
  
  // Legacy support
  { value: 'STREETLIGHTS', label: 'Street Lighting', icon: '💡', category: 'Roads & Traffic' },
  { value: 'HEALTH', label: 'Public Health', icon: '🏥', category: 'Public Health' },
  { value: 'BUILDING', label: 'Building & Development', icon: '🏗️', category: 'Building & Infrastructure' },
  { value: 'OTHER', label: 'Other Services', icon: '📋', category: 'Additional Services' },
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

// User roles as array for dropdown menus
export const USER_ROLES_OPTIONS = [
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

// BMC Ward Office Details (Mumbai-specific)
export const BMC_WARD_OFFICES = {
  'A': {
    name: 'A Ward Office (Colaba)',
    address: 'Shahid Bhagat Singh Road, Colaba, Mumbai - 400001',
    phone: '022-22694725',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Gateway of India', 'Taj Hotel', 'Regal Cinema', 'NCPA'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-22694730' }
  },
  'B': {
    name: 'B Ward Office (Dockyard Road)',
    address: 'P. D\'Mello Road, Mumbai - 400001',
    phone: '022-22615678',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Victoria Dock', 'GPO', 'St. George Hospital'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-22615680' }
  },
  'C': {
    name: 'C Ward Office (Kalbadevi)',
    address: 'Lokmanya Tilak Marg, Kalbadevi, Mumbai - 400002',
    phone: '022-22016789',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Crawford Market', 'Jama Masjid', 'Mumbadevi Temple'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-22016790' }
  },
  'D': {
    name: 'D Ward Office (Girgaon)',
    address: 'B.J. Road, Girgaon, Mumbai - 400004',
    phone: '022-23801234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Chowpatty Beach', 'Wilson College', 'Khotachi Wadi'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-23801235' }
  },
  'E': {
    name: 'E Ward Office (Byculla)',
    address: 'Dr. Babasaheb Ambedkar Road, Byculla, Mumbai - 400027',
    phone: '022-23712345',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Byculla Zoo', 'Bhau Daji Lad Museum', 'Gloria Church'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-23712346' }
  },
  'F/N': {
    name: 'F/N Ward Office (Matunga)',
    address: 'Dr. Babasaheb Ambedkar Road, Matunga, Mumbai - 400019',
    phone: '022-24141234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Matunga Market', 'Ruia College', 'Five Gardens'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-24141235' }
  },
  'F/S': {
    name: 'F/S Ward Office (Sewri)',
    address: 'Sewri Road, Mumbai - 400015',
    phone: '022-24141567',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Sewri Fort', 'Flamingo Point', 'Cotton Green'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-24141568' }
  },
  'G/N': {
    name: 'G/N Ward Office (Dadar)',
    address: 'Shivaji Park, Dadar, Mumbai - 400028',
    phone: '022-24221234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Shivaji Park', 'Siddhivinayak Temple', 'Plaza Cinema'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-24221235' }
  },
  'G/S': {
    name: 'G/S Ward Office (Parel)',
    address: 'Dr. E. Moses Road, Parel, Mumbai - 400012',
    phone: '022-24221567',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['KEM Hospital', 'Lower Parel', 'Phoenix Mills'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-24221568' }
  },
  'H/E': {
    name: 'H/E Ward Office (Bandra East)',
    address: 'Bandra-Kurla Complex Road, Mumbai - 400051',
    phone: '022-26591234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['BKC', 'MMRDA Grounds', 'Kalanagar'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-26591235' }
  },
  'H/W': {
    name: 'H/W Ward Office (Bandra West)',
    address: 'Hill Road, Bandra West, Mumbai - 400050',
    phone: '022-26401234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Bandstand', 'Mount Mary Church', 'Carter Road'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-26401235' }
  },
  'K/E': {
    name: 'K/E Ward Office (Andheri East)',
    address: 'J.B. Nagar, Andheri East, Mumbai - 400059',
    phone: '022-26851234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['MIDC', 'SEEPZ', 'Andheri Railway Station'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-26851235' }
  },
  'K/W': {
    name: 'K/W Ward Office (Andheri West)',
    address: 'Juhu Lane, Andheri West, Mumbai - 400058',
    phone: '022-26701234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Juhu Beach', 'Film City Road', 'DN Nagar Metro'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-26701235' }
  },
  'L': {
    name: 'L Ward Office (Kurla)',
    address: 'LBS Marg, Kurla, Mumbai - 400070',
    phone: '022-25221234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Phoenix Market City', 'Kurla Terminus', 'Nehru Nagar'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-25221235' }
  },
  'M/E': {
    name: 'M/E Ward Office (Chembur)',
    address: 'RCF Road, Chembur, Mumbai - 400074',
    phone: '022-25241234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['RCF Colony', 'Diamond Garden', 'Chembur Station'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-25241235' }
  },
  'M/W': {
    name: 'M/W Ward Office (Ghatkopar)',
    address: 'Ghatkopar West, Mumbai - 400086',
    phone: '022-25121234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['R-City Mall', 'Ghatkopar Station', 'LBS Marg'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-25121235' }
  },
  'N': {
    name: 'N Ward Office (Ghatkopar North)',
    address: 'Tilak Road, Ghatkopar, Mumbai - 400077',
    phone: '022-25011234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Ghatkopar Railway Station', 'Vikhroli Link Road'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-25011235' }
  },
  'P/N': {
    name: 'P/N Ward Office (Malad)',
    address: 'S.V. Road, Malad West, Mumbai - 400064',
    phone: '022-28811234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Inorbit Mall', 'Malad Station', 'Link Road'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-28811235' }
  },
  'P/S': {
    name: 'P/S Ward Office (Goregaon)',
    address: 'S.V. Road, Goregaon West, Mumbai - 400062',
    phone: '022-28721234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Film City', 'Oberoi Mall', 'Aarey Colony'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-28721235' }
  },
  'R/N': {
    name: 'R/N Ward Office (Borivali)',
    address: 'S.V. Road, Borivali West, Mumbai - 400092',
    phone: '022-28931234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Sanjay Gandhi National Park', 'Borivali Station', 'IC Colony'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-28931235' }
  },
  'R/C': {
    name: 'R/C Ward Office (Dahisar)',
    address: 'S.V. Road, Dahisar West, Mumbai - 400068',
    phone: '022-28971234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Dahisar Check Naka', 'Dahisar Station', 'Gorai'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-28971235' }
  },
  'R/S': {
    name: 'R/S Ward Office (Kandivali)',
    address: 'S.V. Road, Kandivali West, Mumbai - 400067',
    phone: '022-28051234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Raghuleela Mall', 'Kandivali Station', 'Mahavir Nagar'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-28051235' }
  },
  'S': {
    name: 'S Ward Office (Vikhroli)',
    address: 'LBS Marg, Vikhroli West, Mumbai - 400083',
    phone: '022-25781234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Godrej Complex', 'Kanjurmarg Station', 'Powai'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-25781235' }
  },
  'T': {
    name: 'T Ward Office (Mulund)',
    address: 'LBS Marg, Mulund West, Mumbai - 400080',
    phone: '022-25921234',
    timing: '9:00 AM - 6:00 PM (Mon-Sat)',
    officer: 'Ward Administrative Officer',
    landmarks: ['Mulund Station', 'R-Mall', 'Mulund Check Naka'],
    emergencyContacts: { fire: '101', police: '100', ambulance: '108', disaster: '022-25921235' }
  }
};

// BMC Zone Details
export const BMC_ZONES = [
  { 
    name: 'South', 
    wards: ['A', 'B', 'C', 'D', 'E'],
    color: '#EF4444',
    description: 'Historic Mumbai - Colaba to Byculla',
    headquarters: 'Municipal Corporation Building, Fort',
    population: '~500,000'
  },
  { 
    name: 'Central', 
    wards: ['F/N', 'F/S', 'G/N', 'G/S'],
    color: '#F59E0B', 
    description: 'Central Business District - Matunga to Parel',
    headquarters: 'Dadar Municipal Office',
    population: '~750,000'
  },
  { 
    name: 'Western', 
    wards: ['H/E', 'H/W', 'K/E', 'K/W', 'P/N', 'P/S', 'R/N', 'R/C', 'R/S'],
    color: '#10B981',
    description: 'Western Suburbs - Bandra to Dahisar',
    headquarters: 'Andheri Municipal Office',
    population: '~3,500,000'
  },
  { 
    name: 'Eastern', 
    wards: ['L', 'M/E', 'M/W', 'N', 'S', 'T'],
    color: '#3B82F6',
    description: 'Eastern Suburbs - Kurla to Mulund',
    headquarters: 'Ghatkopar Municipal Office',
    population: '~2,500,000'
  }
];

// BMC SLA Timelines (in hours)
export const BMC_SLA_TIMELINES = {
  POTHOLE: { response: 4, resolution: 48, priority: 'HIGH' },
  STREETLIGHT: { response: 6, resolution: 72, priority: 'MEDIUM' },
  GARBAGE: { response: 2, resolution: 24, priority: 'HIGH' },
  WATER: { response: 4, resolution: 24, priority: 'URGENT' },
  SEWAGE: { response: 4, resolution: 24, priority: 'URGENT' },
  ROAD_DAMAGE: { response: 6, resolution: 168, priority: 'MEDIUM' },
  TRAFFIC_SIGNAL: { response: 2, resolution: 24, priority: 'HIGH' },
  PARK: { response: 24, resolution: 168, priority: 'LOW' },
  NOISE: { response: 12, resolution: 72, priority: 'MEDIUM' },
  OTHER: { response: 24, resolution: 168, priority: 'LOW' }
};

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
