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

// Category-Wise Civic Issues - 8 Main Categories with Subcategories
export const CIVIC_ISSUE_CATEGORIES = {
  ROADS_TRANSPORT: {
    label: 'Roads & Transport',
    icon: '🛣️',
    color: '#8B4513',
    issues: [
      { value: 'POTHOLE', label: 'Potholes', icon: '🕳️', department: 'ROADS_MAINTENANCE', priority: 'HIGH' },
      { value: 'DAMAGED_ROADS', label: 'Damaged roads', icon: '🚧', department: 'ROADS_MAINTENANCE', priority: 'MEDIUM' },
      { value: 'MISSING_MANHOLE', label: 'Missing manhole covers', icon: '⚠️', department: 'ROADS_MAINTENANCE', priority: 'HIGH' },
      { value: 'BROKEN_FOOTPATH', label: 'Broken footpaths', icon: '🚶', department: 'ROADS_MAINTENANCE', priority: 'MEDIUM' },
      { value: 'STREETLIGHT', label: 'Streetlight not working', icon: '💡', department: 'ROADS_MAINTENANCE', priority: 'MEDIUM' },
      { value: 'DAMAGED_SIGNS', label: 'Damaged road signs', icon: '⛔', department: 'ROADS_MAINTENANCE', priority: 'LOW' },
      { value: 'ILLEGAL_PARKING', label: 'Illegal parking', icon: '🚗', department: 'TRAFFIC', priority: 'LOW' },
      { value: 'CONSTRUCTION_DEBRIS', label: 'Construction debris on road', icon: '🚛', department: 'ROADS_MAINTENANCE', priority: 'MEDIUM' },
    ]
  },
  WASTE_MANAGEMENT: {
    label: 'Waste Management',
    icon: '🗑️',
    color: '#228B22',
    issues: [
      { value: 'GARBAGE_NOT_COLLECTED', label: 'Garbage not collected', icon: '🗑️', department: 'SOLID_WASTE', priority: 'HIGH' },
      { value: 'OVERFLOWING_BINS', label: 'Overflowing garbage bins', icon: '🚫', department: 'SOLID_WASTE', priority: 'HIGH' },
      { value: 'ILLEGAL_DUMPING', label: 'Illegal dumping', icon: '⛔', department: 'SOLID_WASTE', priority: 'MEDIUM' },
      { value: 'DEAD_ANIMAL', label: 'Dead animal removal', icon: '🦴', department: 'SOLID_WASTE', priority: 'URGENT' },
      { value: 'DEBRIS_DUMPING', label: 'Debris dumping', icon: '🚛', department: 'DEBRIS_REMOVAL', priority: 'MEDIUM' },
      { value: 'LACK_DUSTBINS', label: 'Lack of community dustbins', icon: '🛠️', department: 'SOLID_WASTE', priority: 'LOW' },
    ]
  },
  WATER_DRAINAGE: {
    label: 'Water Supply & Drainage',
    icon: '💧',
    color: '#4169E1',
    issues: [
      { value: 'WATER_LEAKAGE', label: 'Water leakage', icon: '💧', department: 'WATER_SUPPLY', priority: 'MEDIUM' },
      { value: 'NO_WATER_SUPPLY', label: 'No water supply', icon: '⚠️', department: 'WATER_SUPPLY', priority: 'URGENT' },
      { value: 'CONTAMINATED_WATER', label: 'Contaminated water', icon: '☢️', department: 'WATER_SUPPLY', priority: 'URGENT' },
      { value: 'SEWER_BLOCKAGE', label: 'Sewer blockage', icon: '🌊', department: 'SEWERAGE', priority: 'HIGH' },
      { value: 'STORMWATER_CHOKED', label: 'Stormwater drain choked', icon: '🌊', department: 'STORM_WATER', priority: 'HIGH' },
      { value: 'FLOODING', label: 'Flooding in locality', icon: '🌊', department: 'STORM_WATER', priority: 'URGENT' },
    ]
  },
  PUBLIC_HEALTH: {
    label: 'Public Health & Sanitation',
    icon: '🏥',
    color: '#DC143C',
    issues: [
      { value: 'MOSQUITO_BREEDING', label: 'Mosquito breeding spots', icon: '🦟', department: 'MOSQUITO_CONTROL', priority: 'HIGH' },
      { value: 'OPEN_SEWAGE', label: 'Open sewage', icon: '⚠️', department: 'SEWERAGE', priority: 'URGENT' },
      { value: 'TOILET_ISSUES', label: 'Public toilet issues', icon: '🚽', department: 'PUBLIC_HEALTH', priority: 'HIGH' },
      { value: 'DIRTY_AREA', label: 'Dirty public areas', icon: '😷', department: 'SANITATION', priority: 'MEDIUM' },
      { value: 'STRAY_ANIMALS', label: 'Stray animals', icon: '🐕', department: 'VETERINARY', priority: 'MEDIUM' },
      { value: 'FOOD_SAFETY', label: 'Food safety issues (from shops)', icon: '🍔', department: 'LICENSE', priority: 'HIGH' },
    ]
  },
  ENVIRONMENT_PARKS: {
    label: 'Environment & Parks',
    icon: '🌳',
    color: '#228B22',
    issues: [
      { value: 'TREE_PRUNING', label: 'Tree pruning required', icon: '✂️', department: 'GARDENS', priority: 'MEDIUM' },
      { value: 'FALLEN_TREES', label: 'Fallen trees', icon: '🌳', department: 'GARDENS', priority: 'HIGH' },
      { value: 'ILLEGAL_TREE_CUTTING', label: 'Illegal cutting of trees', icon: '⛔', department: 'ENVIRONMENT', priority: 'HIGH' },
      { value: 'PARK_MAINTENANCE', label: 'Park maintenance', icon: '🎪', department: 'GARDENS', priority: 'MEDIUM' },
      { value: 'POLLUTION', label: 'Pollution complaints', icon: '💨', department: 'POLLUTION_CONTROL', priority: 'MEDIUM' },
    ]
  },
  BUILDING_ENCROACHMENT: {
    label: 'Building & Encroachment',
    icon: '🏗️',
    color: '#A9A9A9',
    issues: [
      { value: 'UNAUTHORIZED_CONSTRUCTION', label: 'Unauthorized construction', icon: '🏗️', department: 'BUILDING_FACTORY', priority: 'HIGH' },
      { value: 'DANGEROUS_BUILDING', label: 'Dangerous/Broken building', icon: '⚠️', department: 'BUILDING_FACTORY', priority: 'URGENT' },
      { value: 'ILLEGAL_ENCROACHMENT', label: 'Illegal encroachment', icon: '🚧', department: 'ENCROACHMENT', priority: 'MEDIUM' },
      { value: 'BLOCKED_ROADS', label: 'Blocked access roads', icon: '🚫', department: 'ENCROACHMENT', priority: 'MEDIUM' },
      { value: 'ILLEGAL_HAWKERS', label: 'Illegal hawkers', icon: '🏪', department: 'ENCROACHMENT', priority: 'LOW' },
    ]
  },
  LICENSING_REGULATION: {
    label: 'Licensing & Regulation',
    icon: '📜',
    color: '#DAA520',
    issues: [
      { value: 'ILLEGAL_SHOPS', label: 'Illegal shops', icon: '🏪', department: 'LICENSE', priority: 'MEDIUM' },
      { value: 'NO_LICENSE_DISPLAY', label: 'No license display', icon: '⛔', department: 'SHOPS_ESTABLISHMENT', priority: 'LOW' },
      { value: 'NOISE_POLLUTION', label: 'Noise complaints', icon: '🔊', department: 'LICENSE', priority: 'MEDIUM' },
      { value: 'UNAUTHORIZED_VENDORS', label: 'Unauthorized street vendors', icon: '🏪', department: 'ENCROACHMENT', priority: 'LOW' },
    ]
  },
  FIRE_EMERGENCY: {
    label: 'Fire & Emergency',
    icon: '🚒',
    color: '#FF4500',
    issues: [
      { value: 'FIRE_HAZARD', label: 'Fire hazards', icon: '🚒', department: 'FIRE_BRIGADE', priority: 'URGENT' },
      { value: 'HAZARDOUS_STORAGE', label: 'Hazardous chemical storage', icon: '⚠️', department: 'FIRE_BRIGADE', priority: 'URGENT' },
      { value: 'BLOCKED_FIRE_EXITS', label: 'Blocked fire exits', icon: '⚠️', department: 'FIRE_BRIGADE', priority: 'URGENT' },
      { value: 'UNSAFE_SITUATION', label: 'Emergency unsafe situations', icon: '🚨', department: 'DISASTER_MANAGEMENT', priority: 'URGENT' },
    ]
  },
}

// Department → Issue Mapping (ML Classification Matrix)
// This matrix is used to automatically assign complaints to the correct department based on issue type
export const DEPARTMENT_ISSUE_MAPPING = {
  ROADS_MAINTENANCE: {
    label: 'Roads & Maintenance Department',
    icon: '🛣️',
    issues: [
      'POTHOLE', 'DAMAGED_ROADS', 'MISSING_MANHOLE', 'BROKEN_FOOTPATH', 
      'DAMAGED_SIGNS', 'CONSTRUCTION_DEBRIS'
    ],
    sla: { response: 4, resolution: 48, priority: 'HIGH' }
  },
  TRAFFIC: {
    label: 'Traffic Department',
    icon: '🚦',
    issues: ['ILLEGAL_PARKING', 'TRAFFIC_SIGNAL_BROKEN'],
    sla: { response: 2, resolution: 24, priority: 'HIGH' }
  },
  SOLID_WASTE: {
    label: 'Solid Waste Management (SWM)',
    icon: '🗑️',
    issues: [
      'GARBAGE_NOT_COLLECTED', 'OVERFLOWING_BINS', 'ILLEGAL_DUMPING',
      'DEAD_ANIMAL', 'LACK_DUSTBINS', 'DIRTY_AREA'
    ],
    sla: { response: 2, resolution: 24, priority: 'HIGH' }
  },
  DEBRIS_REMOVAL: {
    label: 'Debris Removal Unit',
    icon: '🚛',
    issues: ['DEBRIS_DUMPING', 'CONSTRUCTION_DEBRIS'],
    sla: { response: 6, resolution: 72, priority: 'MEDIUM' }
  },
  STORM_WATER: {
    label: 'Storm Water Drains (SWD) Department',
    icon: '🌊',
    issues: [
      'STORMWATER_CHOKED', 'FLOODING'
    ],
    sla: { response: 4, resolution: 48, priority: 'HIGH' }
  },
  WATER_SUPPLY: {
    label: 'Hydraulic Engineer (Water Supply) Department',
    icon: '💧',
    issues: [
      'WATER_LEAKAGE', 'NO_WATER_SUPPLY', 'CONTAMINATED_WATER'
    ],
    sla: { response: 4, resolution: 24, priority: 'URGENT' }
  },
  SEWERAGE: {
    label: 'Sewerage Operations Department',
    icon: '🚰',
    issues: [
      'SEWER_BLOCKAGE', 'OPEN_SEWAGE'
    ],
    sla: { response: 4, resolution: 24, priority: 'URGENT' }
  },
  PUBLIC_HEALTH: {
    label: 'Public Health Department',
    icon: '🏥',
    issues: ['TOILET_ISSUES'],
    sla: { response: 6, resolution: 72, priority: 'MEDIUM' }
  },
  MOSQUITO_CONTROL: {
    label: 'Insecticide Department (Mosquito Control)',
    icon: '🦟',
    issues: ['MOSQUITO_BREEDING'],
    sla: { response: 12, resolution: 72, priority: 'HIGH' }
  },
  SANITATION: {
    label: 'Sanitation Department',
    icon: '🧹',
    issues: ['DIRTY_AREA'],
    sla: { response: 6, resolution: 48, priority: 'MEDIUM' }
  },
  GARDENS: {
    label: 'Tree Authority / Gardens Department',
    icon: '🌳',
    issues: [
      'TREE_PRUNING', 'FALLEN_TREES', 'PARK_MAINTENANCE'
    ],
    sla: { response: 24, resolution: 168, priority: 'MEDIUM' }
  },
  ENVIRONMENT: {
    label: 'Environment Department',
    icon: '🌍',
    issues: [
      'ILLEGAL_TREE_CUTTING'
    ],
    sla: { response: 12, resolution: 96, priority: 'MEDIUM' }
  },
  POLLUTION_CONTROL: {
    label: 'Pollution Control Cell',
    icon: '💨',
    issues: ['POLLUTION'],
    sla: { response: 24, resolution: 168, priority: 'LOW' }
  },
  BUILDING_FACTORY: {
    label: 'Building & Factory Department (B&F)',
    icon: '🏗️',
    issues: [
      'UNAUTHORIZED_CONSTRUCTION', 'DANGEROUS_BUILDING'
    ],
    sla: { response: 12, resolution: 168, priority: 'HIGH' }
  },
  ENCROACHMENT: {
    label: 'Encroachment Removal Department',
    icon: '🚧',
    issues: [
      'ILLEGAL_ENCROACHMENT', 'BLOCKED_ROADS', 'ILLEGAL_HAWKERS',
      'UNAUTHORIZED_VENDORS'
    ],
    sla: { response: 24, resolution: 96, priority: 'MEDIUM' }
  },
  LICENSE: {
    label: 'License Department',
    icon: '📜',
    issues: [
      'ILLEGAL_SHOPS', 'NOISE_POLLUTION', 'FOOD_SAFETY'
    ],
    sla: { response: 24, resolution: 168, priority: 'MEDIUM' }
  },
  SHOPS_ESTABLISHMENT: {
    label: 'Shops & Establishment Department',
    icon: '🏪',
    issues: ['NO_LICENSE_DISPLAY'],
    sla: { response: 24, resolution: 96, priority: 'LOW' }
  },
  FIRE_BRIGADE: {
    label: 'Mumbai Fire Brigade',
    icon: '🚒',
    issues: [
      'FIRE_HAZARD', 'HAZARDOUS_STORAGE', 'BLOCKED_FIRE_EXITS'
    ],
    sla: { response: 1, resolution: 4, priority: 'URGENT' }
  },
  DISASTER_MANAGEMENT: {
    label: 'Disaster Management Department',
    icon: '⚠️',
    issues: ['UNSAFE_SITUATION'],
    sla: { response: 2, resolution: 12, priority: 'URGENT' }
  },
  VETERINARY: {
    label: 'Veterinary Health Department',
    icon: '🐾',
    issues: ['STRAY_ANIMALS'],
    sla: { response: 12, resolution: 72, priority: 'MEDIUM' }
  },
}

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

// ============================================================================
// MODULE STRUCTURE & FEATURES (Non-AI Based for Aavishkar Submission)
// ============================================================================

/**
 * CITIZEN MODULE - Public issue reporting and tracking
 * Target: General public, citizens of Mumbai
 * Key Features: Registration, complaint submission, tracking, feedback
 */
export const CITIZEN_MODULE = {
  id: 'CITIZEN',
  name: 'Citizen Module',
  icon: '👤',
  description: 'Public issue reporting and complaint tracking',
  requiredRole: 'CITIZEN',
  features: {
    REGISTRATION: {
      id: 'registration',
      name: 'User Registration & Login',
      icon: '📝',
      description: 'OTP login via mobile/email with multi-language support',
      subFeatures: [
        { name: 'OTP Login (SMS/Email)', icon: '📱', status: 'completed' },
        { name: 'Profile Creation', icon: '👤', status: 'completed' },
        { name: 'Multi-language Support (EN/HI/MR)', icon: '🌐', status: 'in-progress' },
      ]
    },
    COMPLAINT_SUBMISSION: {
      id: 'complaint_submission',
      name: 'Complaint Submission',
      icon: '📋',
      description: 'Report issues with location, images, and category',
      subFeatures: [
        { name: 'Capture Image', icon: '📷', status: 'completed' },
        { name: 'Auto-fetch Location (GPS)', icon: '🗺️', status: 'completed' },
        { name: 'Auto-detect Ward (Polygon Mapping)', icon: '📍', status: 'completed' },
        { name: 'Select Category & Subcategory', icon: '📂', status: 'completed' },
        { name: 'Add Description', icon: '✍️', status: 'completed' },
        { name: 'Upload Multiple Images', icon: '🖼️', status: 'in-progress' },
      ]
    },
    COMPLAINT_TRACKING: {
      id: 'complaint_tracking',
      name: 'Complaint Tracking',
      icon: '📊',
      description: 'Real-time status updates with timeline visualization',
      subFeatures: [
        { name: 'Real-time Status Updates', icon: '⏱️', status: 'in-progress' },
        { name: 'Timeline Visualization', icon: '📈', status: 'in-progress' },
        { name: 'Officer Assignment View', icon: '👨‍💼', status: 'in-progress' },
        { name: 'Work Completion Proof (Photos)', icon: '✅', status: 'in-progress' },
      ]
    },
    NOTIFICATIONS: {
      id: 'notifications',
      name: 'Notifications',
      icon: '🔔',
      description: 'SMS/Email/Push alerts for complaint status',
      subFeatures: [
        { name: 'SMS / Email / Push Notifications', icon: '📬', status: 'completed' },
        { name: 'Status Change Alerts', icon: '⚡', status: 'in-progress' },
        { name: 'Escalation Alerts', icon: '🚨', status: 'in-progress' },
      ]
    },
    COMPLAINT_HISTORY: {
      id: 'complaint_history',
      name: 'Complaint History',
      icon: '📜',
      description: 'View and download complaint reports',
      subFeatures: [
        { name: 'View Resolved Cases', icon: '✅', status: 'completed' },
        { name: 'View Pending Cases', icon: '⏳', status: 'completed' },
        { name: 'View Escalated Cases', icon: '⬆️', status: 'in-progress' },
        { name: 'Downloadable Report', icon: '📥', status: 'in-progress' },
      ]
    },
    FEEDBACK_SYSTEM: {
      id: 'feedback_system',
      name: 'Feedback System',
      icon: '⭐',
      description: 'Rate resolution and provide comments',
      subFeatures: [
        { name: 'Rate Resolution (1-5 stars)', icon: '⭐', status: 'in-progress' },
        { name: 'Provide Comments', icon: '💬', status: 'in-progress' },
        { name: 'Reopen Issue if Not Fixed', icon: '🔄', status: 'in-progress' },
      ]
    },
    PUBLIC_DASHBOARD: {
      id: 'public_dashboard',
      name: 'Public Transparency Dashboard',
      icon: '📊',
      description: 'Ward-wise analytics and hotspot visualization',
      subFeatures: [
        { name: 'Ward-wise Complaint Stats', icon: '📍', status: 'completed' },
        { name: 'Hotspot Visualization', icon: '🔥', status: 'in-progress' },
        { name: 'Resolution Time Analytics', icon: '⏱️', status: 'in-progress' },
      ]
    },
  }
}

/**
 * WARD ADMIN MODULE - Ward-level complaint management
 * Target: Ward-level municipal officers (Aval Adhikari)
 * Key Features: Complaint assignment, SLA monitoring, officer management, verification
 */
export const WARD_ADMIN_MODULE = {
  id: 'WARD_ADMIN',
  name: 'Ward Admin Module',
  icon: '🏢',
  description: 'Ward-level complaint management and officer coordination',
  requiredRole: 'ADMIN',
  assignedLevel: 'WARD',
  features: {
    COMPLAINT_ASSIGNMENT: {
      id: 'complaint_assignment',
      name: 'Complaint Assignment',
      icon: '📤',
      description: 'Assign complaints to field officers',
      subFeatures: [
        { name: 'View Ward Complaints', icon: '📋', status: 'completed' },
        { name: 'Filter by Category/Urgency/Date', icon: '🔍', status: 'completed' },
        { name: 'Assign to Specific Officer', icon: '👨‍💼', status: 'in-progress' },
        { name: 'Reassign if Necessary', icon: '🔄', status: 'in-progress' },
      ]
    },
    SLA_MONITORING: {
      id: 'sla_monitoring',
      name: 'SLA Monitoring',
      icon: '⏰',
      description: 'Track SLA compliance and escalations',
      subFeatures: [
        { name: 'Highlight Overdue Complaints', icon: '⚠️', status: 'in-progress' },
        { name: 'Auto-escalated Cases List', icon: '🚀', status: 'in-progress' },
        { name: 'Ward Performance Analytics', icon: '📊', status: 'in-progress' },
      ]
    },
    OFFICER_MANAGEMENT: {
      id: 'officer_management',
      name: 'Field Officer Management',
      icon: '👥',
      description: 'Manage ward field officers',
      subFeatures: [
        { name: 'Add/Remove Officers', icon: '➕', status: 'completed' },
        { name: 'Assign Territory/Route', icon: '🗺️', status: 'in-progress' },
        { name: 'Track On-duty Status', icon: '📍', status: 'in-progress' },
      ]
    },
    VERIFICATION_CLOSURE: {
      id: 'verification_closure',
      name: 'Verification & Closure',
      icon: '✅',
      description: 'Review and approve resolution evidence',
      subFeatures: [
        { name: 'Review Officer Evidence', icon: '📸', status: 'in-progress' },
        { name: 'Accept/Reject Closure', icon: '✓/✗', status: 'in-progress' },
        { name: 'Add Remarks', icon: '💬', status: 'in-progress' },
      ]
    },
    WARD_REPORTS: {
      id: 'ward_reports',
      name: 'Reports & Analytics',
      icon: '📈',
      description: 'Daily, weekly, monthly ward performance',
      subFeatures: [
        { name: 'Daily Ward Performance', icon: '📅', status: 'in-progress' },
        { name: 'Weekly/Monthly Reports', icon: '📊', status: 'in-progress' },
        { name: 'Department-wise Metrics', icon: '🏛️', status: 'in-progress' },
        { name: 'Peak Issue Types Analysis', icon: '📈', status: 'in-progress' },
      ]
    },
  }
}

/**
 * DEPARTMENT ADMIN MODULE - Department-level complaint management
 * Target: Department heads (e.g., SWM Commissioner, Water Engineer, Roads Commissioner)
 * Key Features: Department dashboard, resource planning, SLA tracking, analytics
 */
export const DEPARTMENT_ADMIN_MODULE = {
  id: 'DEPARTMENT_ADMIN',
  name: 'Department Admin Module',
  icon: '🏛️',
  description: 'Department-level complaint management and resource planning',
  requiredRole: 'ADMIN',
  assignedLevel: 'DEPARTMENT',
  features: {
    DEPARTMENT_DASHBOARD: {
      id: 'dept_dashboard',
      name: 'Department Dashboard',
      icon: '📊',
      description: 'City-wide department complaint overview',
      subFeatures: [
        { name: 'City-wide Complaints', icon: '🗺️', status: 'completed' },
        { name: 'Category-wise Load Distribution', icon: '📊', status: 'completed' },
        { name: 'Ward-wise Distribution', icon: '📍', status: 'in-progress' },
      ]
    },
    COMPLAINT_CONTROL: {
      id: 'complaint_control',
      name: 'Complaint Control',
      icon: '🎛️',
      description: 'Oversee department complaints citywide',
      subFeatures: [
        { name: 'View All Department Complaints', icon: '📋', status: 'completed' },
        { name: 'Reallocate Officers', icon: '🔄', status: 'in-progress' },
        { name: 'Approve Closure Requests', icon: '✅', status: 'in-progress' },
      ]
    },
    RESOURCE_PLANNING: {
      id: 'resource_planning',
      name: 'Resource Planning',
      icon: '🚚',
      description: 'Allocate and monitor resources',
      subFeatures: [
        { name: 'Allocate Trucks/Staff/Tools', icon: '🛠️', status: 'in-progress' },
        { name: 'Monitor Field Workload', icon: '📊', status: 'in-progress' },
        { name: 'Identify Hotspots', icon: '🔥', status: 'in-progress' },
      ]
    },
    DEPARTMENT_ANALYTICS: {
      id: 'dept_analytics',
      name: 'Reports & Analytics',
      icon: '📈',
      description: 'SLA adherence and performance metrics',
      subFeatures: [
        { name: 'SLA Adherence Tracking', icon: '⏰', status: 'in-progress' },
        { name: 'Monthly Performance Report', icon: '📊', status: 'in-progress' },
        { name: 'Category Breakdown', icon: '📂', status: 'in-progress' },
        { name: 'Ward Patterns & Recurring Issues', icon: '📈', status: 'in-progress' },
      ]
    },
  }
}

/**
 * SUPER ADMIN MODULE - System-wide BMC control
 * Target: BMC Commissioner and top-level administrators
 * Key Features: System control, monitoring, governance, escalation, audit
 */
export const SUPER_ADMIN_MODULE = {
  id: 'SUPER_ADMIN',
  name: 'Super Admin Module',
  icon: '👑',
  description: 'BMC system-wide control and governance',
  requiredRole: 'ADMIN',
  assignedLevel: 'SYSTEM',
  features: {
    SYSTEM_CONTROL: {
      id: 'system_control',
      name: 'Full System Control',
      icon: '⚙️',
      description: 'Manage users, wards, departments, categories',
      subFeatures: [
        { name: 'User Verification & Management', icon: '👤', status: 'completed' },
        { name: 'Add/Edit/Delete Wards', icon: '📍', status: 'in-progress' },
        { name: 'Manage Departments', icon: '🏛️', status: 'completed' },
        { name: 'Manage Categories & Mappings', icon: '📂', status: 'completed' },
      ]
    },
    CITY_MONITORING: {
      id: 'city_monitoring',
      name: 'City-wide Monitoring',
      icon: '🌍',
      description: 'Real-time system monitoring and visualization',
      subFeatures: [
        { name: 'City-wide Complaint Grid', icon: '📊', status: 'completed' },
        { name: 'Real-time Heatmaps', icon: '🔥', status: 'in-progress' },
        { name: 'SLA Violations Summary', icon: '⚠️', status: 'in-progress' },
      ]
    },
    GOVERNANCE_REPORTS: {
      id: 'governance',
      name: 'Governance Reports',
      icon: '📋',
      description: 'Cross-department comparisons and analysis',
      subFeatures: [
        { name: 'Cross-department Comparisons', icon: '🔀', status: 'in-progress' },
        { name: 'Ward Performance Rankings', icon: '🏆', status: 'in-progress' },
        { name: 'Policy-level Overview', icon: '📊', status: 'in-progress' },
      ]
    },
    ESCALATION_HANDLING: {
      id: 'escalation',
      name: 'Escalation Handling',
      icon: '🚨',
      description: 'Intervention in critical cases',
      subFeatures: [
        { name: 'High-Priority Case Intervention', icon: '🆘', status: 'in-progress' },
        { name: 'Override Permissions', icon: '🔓', status: 'in-progress' },
        { name: 'Compliance Tracking', icon: '✓', status: 'in-progress' },
      ]
    },
    AUDIT_LOGS: {
      id: 'audit_logs',
      name: 'Audit & Logs',
      icon: '📝',
      description: 'Transaction logs and security audits',
      subFeatures: [
        { name: 'Transaction Logs', icon: '📋', status: 'in-progress' },
        { name: 'Communication Trails', icon: '💬', status: 'in-progress' },
        { name: 'Security Audits', icon: '🔐', status: 'in-progress' },
      ]
    },
  }
}

/**
 * UI/UX FLOW TEMPLATES
 * Describes the workflow and screen progression for each module
 */
export const MODULE_UI_FLOWS = {
  CITIZEN_HOME: {
    name: 'Citizen Home Screen',
    screens: ['Report Issue', 'Track Complaint', 'My Complaints', 'Language Selector'],
    actions: ['Report', 'Track', 'View History', 'Change Language']
  },
  CITIZEN_REPORTING: {
    name: 'Citizen Complaint Reporting Flow',
    steps: [
      'Open Report Issue',
      'Capture Image',
      'Location Auto-Detected',
      'Select Category/Subcategory',
      'Add Description',
      'Submit'
    ],
    confirmation: 'Your complaint has been registered - Complaint ID: XXXX'
  },
  CITIZEN_TRACKING: {
    name: 'Citizen Complaint Tracking',
    statuses: ['Filed', 'Assigned', 'In Progress', 'Resolved', 'Verified'],
    elements: ['Timeline', 'Status Badges', 'Officer Details', 'Photos']
  },
  WARD_ADMIN_DASHBOARD: {
    name: 'Ward Admin Dashboard',
    widgets: ['Pending Complaints', 'SLA Alerts', 'Officer Availability', 'Daily Workload']
  },
  WARD_ASSIGNMENT: {
    name: 'Ward Admin Assignment Flow',
    steps: [
      'Open Complaint',
      'View Location & Images',
      'Select Officer',
      'Assign Task',
      'Auto-notification to Officer'
    ]
  },
  DEPT_ADMIN_DASHBOARD: {
    name: 'Department Admin Dashboard',
    views: ['City-wide Complaints', 'Ward-wise Distribution', 'Filter by Category & Date']
  },
  SUPER_ADMIN_DASHBOARD: {
    name: 'Super Admin System Dashboard',
    widgets: ['Total Complaints', 'Heatmaps', 'Ward Performance', 'Department Performance']
  }
}

/**
 * MODULE ROADMAP & IMPLEMENTATION STATUS
 */
export const MODULE_IMPLEMENTATION_STATUS = {
  CITIZEN: {
    name: 'Citizen Module',
    completionPercentage: 65,
    completedFeatures: [
      'OTP Login',
      'Profile Creation',
      'Complaint Submission',
      'Location Detection',
      'Ward Auto-detection',
      'Category Selection',
      'Complaint View'
    ],
    inProgressFeatures: [
      'Multi-language Support',
      'Real-time Tracking',
      'Timeline Visualization',
      'Multiple Image Upload',
      'Feedback System',
      'Public Dashboard'
    ],
    nextSteps: [
      'Implement SMS/Email notifications',
      'Add timeline visualization',
      'Enable feedback rating system',
      'Create public transparency dashboard'
    ]
  },
  WARD_ADMIN: {
    name: 'Ward Admin Module',
    completionPercentage: 30,
    completedFeatures: [
      'View Ward Complaints',
      'Filter Complaints',
      'Officer Management',
      'Add/Remove Officers'
    ],
    inProgressFeatures: [
      'Complaint Assignment',
      'SLA Monitoring',
      'Territory Management',
      'Verification & Closure',
      'Ward Reports'
    ],
    nextSteps: [
      'Build assignment workflow',
      'Implement SLA tracking',
      'Create report generation',
      'Add escalation handling'
    ]
  },
  DEPARTMENT_ADMIN: {
    name: 'Department Admin Module',
    completionPercentage: 20,
    completedFeatures: [
      'View Department Complaints',
      'Category-wise Filtering',
      'Department Dashboard'
    ],
    inProgressFeatures: [
      'Complaint Control',
      'Resource Planning',
      'Analytics & Reports'
    ],
    nextSteps: [
      'Build resource allocation tool',
      'Create analytics dashboards',
      'Implement hotspot identification',
      'Add SLA tracking'
    ]
  },
  SUPER_ADMIN: {
    name: 'Super Admin Module',
    completionPercentage: 40,
    completedFeatures: [
      'User Management',
      'Department Management',
      'Category Management',
      'City-wide Dashboard'
    ],
    inProgressFeatures: [
      'Heatmap Visualization',
      'Ward Management',
      'Escalation Handling',
      'Audit Logs'
    ],
    nextSteps: [
      'Build heatmap system',
      'Create ward editor',
      'Implement escalation workflow',
      'Add comprehensive audit logging'
    ]
  }
}

