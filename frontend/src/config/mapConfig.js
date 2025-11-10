// Mumbai map configuration
export const MUMBAI_MAP = {
  center: [19.0760, 72.8777], // Mumbai coordinates
  zoom: 12,
  maxZoom: 18,
  minZoom: 10,
  bounds: [
    [18.8920, 72.7758], // Southwest bounds
    [19.2720, 72.9781]  // Northeast bounds
  ]
};

// Map tile configuration
export const MAP_TILES = {
  OSM: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  SATELLITE: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

// Complaint category markers configuration
export const COMPLAINT_MARKERS = {
  'water-supply': {
    color: '#3B82F6', // Blue
    icon: '💧',
    size: 30
  },
  'road-maintenance': {
    color: '#EF4444', // Red
    icon: '🛣️',
    size: 30
  },
  'garbage-collection': {
    color: '#10B981', // Green
    icon: '🗑️',
    size: 30
  },
  'streetlight': {
    color: '#F59E0B', // Yellow
    icon: '💡',
    size: 30
  },
  'sewage': {
    color: '#8B5CF6', // Purple
    icon: '🚽',
    size: 30
  },
  'traffic': {
    color: '#EC4899', // Pink
    icon: '🚦',
    size: 30
  },
  'others': {
    color: '#6B7280', // Gray
    icon: '📝',
    size: 30
  }
};

// Status-based marker colors
export const STATUS_COLORS = {
  'pending': '#F59E0B',     // Yellow
  'in-progress': '#3B82F6',  // Blue
  'resolved': '#10B981',     // Green
  'rejected': '#EF4444',     // Red
  'under-review': '#8B5CF6'  // Purple
};

// Ward boundaries configuration
export const WARD_CONFIG = {
  strokeColor: '#4B5563',
  strokeWeight: 2,
  strokeOpacity: 0.8,
  fillColor: '#E5E7EB',
  fillOpacity: 0.1,
  hoverFillOpacity: 0.3
};

// Map control positions
export const MAP_CONTROLS = {
  zoomControl: 'topright',
  fullscreenControl: 'topleft',
  layerControl: 'topright',
  scaleControl: 'bottomleft'
};

// Mumbai ward list for reference
export const MUMBAI_WARDS = [
  'A Ward (Colaba, Fort, Marine Lines)',
  'B Ward (Dongri, Mazgaon)',
  'C Ward (JJ Hospital, Byculla)',
  'D Ward (Tardeo, Nana Chowk)',
  'E Ward (Byculla East)',
  'F/N Ward (Parel, Matunga)',
  'F/S Ward (Parel, Elphinstone)',
  'G/N Ward (Dadar, Mahim)',
  'G/S Ward (Worli, Lower Parel)',
  'H/E Ward (Bandra East)',
  'H/W Ward (Bandra West)',
  'K/E Ward (Andheri East)',
  'K/W Ward (Andheri West)',
  'L Ward (Kurla)',
  'M/E Ward (Chembur)',
  'M/W Ward (Chembur West)',
  'N Ward (Ghatkopar)',
  'P/N Ward (Malad)',
  'P/S Ward (Goregaon)',
  'R/C Ward (Borivali)',
  'R/N Ward (Dahisar)',
  'R/S Ward (Kandivali)',
  'S Ward (Bhandup)',
  'T Ward (Mulund)'
];