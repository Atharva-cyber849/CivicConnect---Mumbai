import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ListBulletIcon,
  MapIcon,
  MapPinIcon,
  XMarkIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';
import { complaintsApi } from '../../api/complaintsApi';
import { COMPLAINT_CATEGORIES } from '../../utils/constants';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map icons for different complaint statuses
const createCustomIcon = (status) => {
  const colors = {
    'PENDING': '#f59e0b',
    'IN_PROGRESS': '#3b82f6',
    'RESOLVED': '#10b981',
    'REJECTED': '#ef4444'
  };

  return L.divIcon({
    html: `
      <div style="
        width: 20px; 
        height: 20px; 
        border-radius: 50%; 
        background-color: ${colors[status] || '#6b7280'};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapLiteView = () => {
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Mumbai default
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    radius: 2000, // 2km
    priority: 'all'
  });

  const mapRef = useRef(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Location access denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Fetch nearby complaints
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['nearby-complaints', mapCenter, filters],
    queryFn: () => complaintsApi.getNearbyComplaints({
      latitude: mapCenter[0],
      longitude: mapCenter[1],
      radius: filters.radius,
      status: filters.status !== 'all' ? filters.status : undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined
    }),
    enabled: !!mapCenter
  });

  const MapEvents = () => {
    useMapEvents({
      moveend: (e) => {
        const center = e.target.getCenter();
        setMapCenter([center.lat, center.lng]);
      }
    });
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredComplaints = complaints?.results || [];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-gray-900">
            Nearby Issues
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <AdjustmentsVerticalIcon className="h-5 w-5" />
            </button>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {filteredComplaints.length}
            </div>
            <div className="text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {filteredComplaints.filter(c => c.status === 'PENDING').length}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {filteredComplaints.filter(c => c.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {filteredComplaints.filter(c => c.status === 'RESOLVED').length}
            </div>
            <div className="text-gray-600">Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Categories</option>
                {COMPLAINT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Radius: {filters.radius / 1000}km
              </label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={filters.radius}
                onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="all">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <div className="h-full">
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <MapEvents />
              
              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        width: 16px; 
                        height: 16px; 
                        border-radius: 50%; 
                        background-color: #3b82f6;
                        border: 3px solid white;
                        box-shadow: 0 0 0 2px #3b82f6;
                      "></div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>Your Location</strong>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Complaint markers */}
              {filteredComplaints.map((complaint) => (
                <Marker
                  key={complaint.id}
                  position={[complaint.latitude, complaint.longitude]}
                  icon={createCustomIcon(complaint.status)}
                  eventHandlers={{
                    click: () => setSelectedComplaint(complaint),
                  }}
                >
                  <Popup>
                    <div className="w-64 max-w-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {complaint.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {complaint.address?.split(',')[0]}
                        </span>
                        {userLocation && (
                          <span className="text-xs text-gray-500">
                            {getDistance(
                              userLocation[0],
                              userLocation[1],
                              complaint.latitude,
                              complaint.longitude
                            ).toFixed(1)}km away
                          </span>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Floating controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                onClick={() => {
                  if (userLocation && mapRef.current) {
                    mapRef.current.setView(userLocation, 15);
                  }
                }}
                className="bg-white p-3 rounded-full shadow-lg border border-gray-200"
              >
                <MapPinIcon className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="h-full overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <MapPinIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No issues found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters or location</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">
                          {complaint.title}
                        </h3>
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                          {complaint.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(complaint.priority)}`}></div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {complaint.address?.split(',').slice(0, 2).join(', ')}
                      </span>
                      {userLocation && (
                        <span>
                          {getDistance(
                            userLocation[0],
                            userLocation[1],
                            complaint.latitude,
                            complaint.longitude
                          ).toFixed(1)}km away
                        </span>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Complaint Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full max-h-2/3 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedComplaint.title}
                </h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedComplaint.priority)}`}></div>
                  <span className="text-sm text-gray-600">{selectedComplaint.priority} Priority</span>
                </div>
                
                <p className="text-gray-700">{selectedComplaint.description}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Location</h4>
                  <p className="text-gray-600 text-sm">{selectedComplaint.address}</p>
                  {userLocation && (
                    <p className="text-gray-500 text-xs mt-1">
                      {getDistance(
                        userLocation[0],
                        userLocation[1],
                        selectedComplaint.latitude,
                        selectedComplaint.longitude
                      ).toFixed(2)}km from your location
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-500">
                    Reported {new Date(selectedComplaint.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => {
                      // Navigate to complaint details
                      setSelectedComplaint(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapLiteView;