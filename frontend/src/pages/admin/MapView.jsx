import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPinIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import L from 'leaflet';

// Import Mumbai ward data
import wardsData from '../../config/wardsData.json';
import { adminApi } from '../../api/adminApi';
import { COMPLAINT_CATEGORIES, DEPARTMENTS } from '../../config/constants';

// Fix for Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different complaint statuses
const createCustomIcon = (status) => {
  const colors = {
    PENDING: '#F59E0B',     // Yellow
    IN_PROGRESS: '#0078D7', // Mumbai Blue  
    RESOLVED: '#10B981',    // Green
    REJECTED: '#EF4444'     // Red
  };
  
  const color = colors[status] || colors.PENDING;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapView = () => {
  // Map state
  const [mapFilters, setMapFilters] = useState({
    status: '',
    category: '',
    department: '',
    ward: '',
    dateRange: '30' // Last 30 days
  });
  
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);
  const [mapCenter] = useState([19.0760, 72.8777]); // Mumbai center
  const [mapZoom] = useState(11);

  // Fetch complaints for map
  const { data: mapComplaints = [], isLoading } = useQuery({
    queryKey: ['map-complaints', mapFilters],
    queryFn: () => adminApi.getComplaintsForMap ? adminApi.getComplaintsForMap(mapFilters) : Promise.resolve([]),
    refetchInterval: 60000 // Refresh every minute
  });

  // Mock data for development
  const mockComplaints = [
    {
      id: 1,
      title: 'Broken street light on SV Road',
      status: 'PENDING',
      category: 'Infrastructure',
      latitude: 19.0596,
      longitude: 72.8295,
      ward: 'H/W',
      department: 'ROADS',
      created_at: '2024-11-10T10:00:00Z',
      image: null
    },
    {
      id: 2,
      title: 'Garbage not collected for 3 days',
      status: 'IN_PROGRESS',
      category: 'Waste Management',
      latitude: 19.0896,
      longitude: 72.8656,
      ward: 'K/E',
      department: 'SWM',
      created_at: '2024-11-09T14:30:00Z',
      image: null
    },
    {
      id: 3,
      title: 'Water leakage near bus stop',
      status: 'RESOLVED',
      category: 'Water Supply',
      latitude: 19.1136,
      longitude: 72.8697,
      ward: 'R/C',
      department: 'HYDRAULIC',
      created_at: '2024-11-08T09:15:00Z',
      image: null
    },
    {
      id: 4,
      title: 'Pothole on main road',
      status: 'PENDING',
      category: 'Roads',
      latitude: 19.0176,
      longitude: 72.8562,
      ward: 'A',
      department: 'ROADS',
      created_at: '2024-11-09T16:45:00Z',
      image: null
    },
    {
      id: 5,
      title: 'Illegal construction',
      status: 'IN_PROGRESS',
      category: 'Building',
      latitude: 19.0560,
      longitude: 72.8365,
      ward: 'D',
      department: 'BUILDING',
      created_at: '2024-11-07T11:20:00Z',
      image: null
    }
  ];

  const complaints = mapComplaints.length > 0 ? mapComplaints : mockComplaints;

  // Filter complaints based on current filters
  const filteredComplaints = complaints.filter(complaint => {
    return (
      (!mapFilters.status || complaint.status === mapFilters.status) &&
      (!mapFilters.category || complaint.category === mapFilters.category) &&
      (!mapFilters.department || complaint.department === mapFilters.department) &&
      (!mapFilters.ward || complaint.ward === mapFilters.ward)
    );
  });

  // Ward boundary style
  const wardStyle = {
    fillColor: '#0078D7',
    weight: 2,
    opacity: 0.8,
    color: '#0078D7',
    fillOpacity: 0.1
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'RESOLVED':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleFilterChange = (filterType, value) => {
    setMapFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setMapFilters({
      status: '',
      category: '',
      department: '',
      ward: '',
      dateRange: '30'
    });
  };

  // Get unique values for filter dropdowns
  const uniqueWards = [...new Set(complaints.map(c => c.ward))].sort();
  const uniqueCategories = [...new Set(complaints.map(c => c.category))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-[#0078D7] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPinIcon className="h-8 w-8 text-[#0078D7] mr-3" />
              Mumbai Complaint Map
            </h1>
            <p className="text-gray-600 mt-1">
              Geographic visualization of complaints across Mumbai wards
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-[#0078D7]">
              {filteredComplaints.length}
            </div>
            <div className="text-sm text-gray-600">Complaints Shown</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Map Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-[#0078D7] hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Status Filter */}
          <select
            value={mapFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={mapFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={mapFilters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={mapFilters.ward}
            onChange={(e) => handleFilterChange('ward', e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
          >
            <option value="">All Wards</option>
            {uniqueWards.map(ward => (
              <option key={ward} value={ward}>{ward} Ward</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={mapFilters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>

          {/* Ward Boundaries Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="wardBoundaries"
              checked={showWardBoundaries}
              onChange={(e) => setShowWardBoundaries(e.target.checked)}
              className="h-4 w-4 text-[#0078D7] focus:ring-[#0078D7] border-gray-300 rounded"
            />
            <label htmlFor="wardBoundaries" className="ml-2 text-sm text-gray-700">
              Ward Boundaries
            </label>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-[600px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0078D7]"></div>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Ward Boundaries */}
              {showWardBoundaries && (
                <GeoJSON
                  data={wardsData}
                  style={wardStyle}
                  onEachFeature={(feature, layer) => {
                    if (feature.properties && feature.properties.name) {
                      layer.bindTooltip(
                        `${feature.properties.ward_code} Ward - ${feature.properties.full_name}`,
                        { sticky: true }
                      );
                    }
                  }}
                />
              )}

              {/* Complaint Markers */}
              {filteredComplaints.map((complaint) => (
                <Marker
                  key={complaint.id}
                  position={[complaint.latitude, complaint.longitude]}
                  icon={createCustomIcon(complaint.status)}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[280px]">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-sm">
                          Complaint #{complaint.id}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Title:</span>
                          <p className="text-gray-900">{complaint.title}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium text-gray-700">Category:</span>
                            <p className="text-gray-900">{complaint.category}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Ward:</span>
                            <p className="text-gray-900">{complaint.ward}</p>
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Department:</span>
                          <p className="text-gray-900">
                            {DEPARTMENTS.find(d => d.id === complaint.department)?.name || complaint.department}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Date:</span>
                          <p className="text-gray-900">
                            {new Date(complaint.created_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => window.open(`/admin/complaints/${complaint.id}`, '_blank')}
                          className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-[#0078D7] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D7]"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 text-[#0078D7] mr-2" />
          Map Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow mr-3"></div>
            <span className="text-sm text-gray-700">Pending Complaints</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#0078D7] border-2 border-white shadow mr-3"></div>
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow mr-3"></div>
            <span className="text-sm text-gray-700">Resolved</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow mr-3"></div>
            <span className="text-sm text-gray-700">Rejected</span>
          </div>
        </div>
        
        {showWardBoundaries && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 flex items-center">
              <BuildingOffice2Icon className="h-4 w-4 mr-2 text-[#0078D7]" />
              Blue boundaries indicate Mumbai ward limits
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;