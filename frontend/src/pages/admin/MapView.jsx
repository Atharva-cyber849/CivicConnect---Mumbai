import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
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
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin, isDepartmentAdmin, isOfficer } from '../../utils/roleBasedAccess';

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
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Role-based access control - 3-tier admin hierarchy
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsDepartmentAdmin = isDepartmentAdmin(user);
  const userIsOfficer = isOfficer(user);
  
  // Map state
  const [mapFilters, setMapFilters] = useState({
    status: '',
    category: '',
    department: '',
    ward: '',
    dateRange: '30' // Last 30 days
  });
  
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapCenter] = useState([19.0760, 72.8777]); // Mumbai center
  const [mapZoom] = useState(11);

  // Apply role-based filters automatically
  const roleBasedFilters = useMemo(() => {
    const baseFilters = { ...mapFilters };
    
    // Officers can only see complaints from their ward
    if (userIsOfficer && user?.assigned_ward) {
      baseFilters.ward = user.assigned_ward;
    }
    
    // Department Admins can only see complaints from their department
    if (userIsDepartmentAdmin && user?.department) {
      baseFilters.department = user.department;
    }
    
    return baseFilters;
  }, [mapFilters, userIsOfficer, userIsDepartmentAdmin, user?.assigned_ward, user?.department]);

  // Fetch complaints for map
  const { data: mapComplaints = [], isLoading } = useQuery({
    queryKey: ['map-complaints', roleBasedFilters],
    queryFn: () => adminApi.getComplaintsForMap ? adminApi.getComplaintsForMap(roleBasedFilters) : Promise.resolve([]),
    refetchInterval: 60000, // Refresh every minute
    enabled: userIsSuperAdmin || userIsDepartmentAdmin || userIsOfficer
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
              {userIsOfficer && user?.assigned_ward && ` • Ward: ${user.assigned_ward}`}
              {userIsDepartmentAdmin && user?.department && ` • Department: ${user.department}`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{filteredComplaints.filter(c => c.status === 'PENDING').length}</p>
            </div>
            <div className="text-4xl text-yellow-500 opacity-20">⚠️</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#0078D7]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{filteredComplaints.filter(c => c.status === 'IN_PROGRESS').length}</p>
            </div>
            <div className="text-4xl text-[#0078D7] opacity-20">⚙️</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{filteredComplaints.filter(c => c.status === 'RESOLVED').length}</p>
            </div>
            <div className="text-4xl text-green-500 opacity-20">✅</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shown</p>
              <p className="text-2xl font-bold text-gray-900">{filteredComplaints.length}</p>
            </div>
            <div className="text-4xl text-red-500 opacity-20">📍</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Map Filters & Options</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showHeatmap
                  ? 'bg-[#0078D7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔥 Heatmap View
            </button>
            <button
              onClick={clearFilters}
              className="text-sm text-[#0078D7] hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className={`grid gap-4 ${userIsSuperAdmin ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
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

          {/* Department Filter - Only for Super Admin */}
          {userIsSuperAdmin && (
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
          )}

          {/* Ward Filter - Only for Super Admin */}
          {userIsSuperAdmin && (
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
          )}

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

      {/* Map Container with Sidebar */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
        <div className="flex-1 h-[600px] w-full">
          {!isClient || isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0078D7]"></div>
            </div>
          ) : mapCenter && mapCenter.length === 2 ? (
            <MapContainer
              center={[mapCenter[0], mapCenter[1]]}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Ward Boundaries */}
              {showWardBoundaries && wardsData && wardsData.features && (
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
              {filteredComplaints.map((complaint) => {
                // Validate latitude and longitude exist
                if (!complaint.latitude || !complaint.longitude) {
                  return null;
                }
                return (
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
                        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                          <button
                            onClick={() => window.open(`/admin/complaints/${complaint.id}`, '_blank')}
                            className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-[#0078D7] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D7]"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Full Details
                          </button>
                          
                          {/* Role-based action buttons */}
                          {(userIsSuperAdmin || userIsDepartmentAdmin || userIsOfficer) && complaint.status === 'PENDING' && (
                            <button
                              className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              ✓ Mark In Progress
                            </button>
                          )}
                          
                          {(userIsSuperAdmin || userIsDepartmentAdmin || userIsOfficer) && complaint.status === 'IN_PROGRESS' && (
                            <button
                              className="w-full flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              ✓ Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Map data is loading or unavailable</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Complaint Details */}
        <div className="w-80 border-l border-gray-200 overflow-y-auto bg-gray-50">
          {filteredComplaints.length > 0 ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Complaints List</h3>
                <span className="text-xs bg-[#0078D7] text-white px-2 py-1 rounded-full">{filteredComplaints.length}</span>
              </div>
              
              {filteredComplaints.slice(0, 10).map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedComplaint?.id === complaint.id
                      ? 'border-[#0078D7] bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate flex-1">#{complaint.id}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ml-2 ${
                      complaint.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{complaint.title}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">📍 {complaint.ward}</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">{complaint.category}</span>
                  </div>
                </div>
              ))}
              
              {filteredComplaints.length > 10 && (
                <div className="text-center text-xs text-gray-500 pt-2">
                  +{filteredComplaints.length - 10} more complaints
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <MapPinIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No complaints to display</p>
              </div>
            </div>
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