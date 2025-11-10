import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { useAuthStore } from '../../store/authStore'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { 
  MUMBAI_MAP_CONFIG, COMPLAINT_CATEGORIES, COMPLAINT_STATUS, MUMBAI_WARDS 
} from '../../utils/constants'
import { createCustomIcon, getCurrentLocation, isWithinMumbai } from '../../utils/mapUtils'
import { format } from 'date-fns'
import { FiFilter, FiMapPin, FiCrosshair, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

const CitizenMapView = () => {
  const { user } = useAuthStore()
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    ward: user?.ward || '',
    distance: '5', // km radius
  })
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState(MUMBAI_MAP_CONFIG.center)
  const [wardGeoJSON, setWardGeoJSON] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Load ward boundaries
  useEffect(() => {
    fetch('/data/mumbai-wards.geojson')
      .then(res => res.json())
      .then(data => setWardGeoJSON(data))
      .catch(err => console.error('Failed to load ward boundaries:', err))
  }, [])

  // Get user's location on component mount
  useEffect(() => {
    getCurrentLocation()
      .then(location => {
        if (isWithinMumbai(location.lat, location.lng)) {
          setUserLocation(location)
          setMapCenter([location.lat, location.lng])
        }
      })
      .catch(err => console.warn('Could not get user location:', err))
  }, [])

  // Fetch nearby complaints
  const { data: response, isLoading } = useQuery({
    queryKey: ['citizenMapComplaints', filters, userLocation],
    queryFn: () => {
      const params = {
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
        include_coordinates: true,
        public_view: true, // Only show public complaints
      }
      
      // Add location-based filtering if user location is available
      if (userLocation && filters.distance) {
        params.lat = userLocation.lat
        params.lng = userLocation.lng
        params.radius = filters.distance
      }
      
      return complaintAPI.getAll(params)
    },
  })

  const complaints = response?.data?.results || []
  const complaintsWithCoords = complaints.filter(c => c.latitude && c.longitude)

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: '', status: '', ward: user?.ward || '', distance: '5'
    })
  }

  // Get category label
  const getCategoryLabel = (category) => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Go to user location
  const goToMyLocation = async () => {
    try {
      const location = await getCurrentLocation()
      if (isWithinMumbai(location.lat, location.lng)) {
        setUserLocation(location)
        setMapCenter([location.lat, location.lng])
      } else {
        alert('Location appears to be outside Mumbai')
      }
    } catch (error) {
      alert('Could not get your location. Please enable location services.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nearby Issues</h1>
          <p className="text-gray-600 mt-1">
            See civic issues reported in your area and across Mumbai
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={goToMyLocation}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiCrosshair className="w-4 h-4" />
            My Location
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Filter Issues</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {COMPLAINT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="input w-full"
              >
                <option value="">All Status</option>
                {COMPLAINT_STATUS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ward</label>
              <select
                value={filters.ward}
                onChange={(e) => setFilters({...filters, ward: e.target.value})}
                className="input w-full"
              >
                <option value="">All Wards</option>
                {MUMBAI_WARDS.map(ward => (
                  <option key={ward.value} value={ward.value}>
                    {ward.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distance</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                className="input w-full"
              >
                <option value="">All Mumbai</option>
                <option value="1">Within 1 km</option>
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 text-center">
          <h3 className="text-2xl font-bold text-blue-600">
            {complaintsWithCoords.length}
          </h3>
          <p className="text-blue-800">Issues Found</p>
        </div>
        <div className="card bg-yellow-50 text-center">
          <h3 className="text-2xl font-bold text-yellow-600">
            {complaintsWithCoords.filter(c => c.status === 'PENDING').length}
          </h3>
          <p className="text-yellow-800">Pending</p>
        </div>
        <div className="card bg-orange-50 text-center">
          <h3 className="text-2xl font-bold text-orange-600">
            {complaintsWithCoords.filter(c => c.status === 'IN_PROGRESS').length}
          </h3>
          <p className="text-orange-800">In Progress</p>
        </div>
        <div className="card bg-green-50 text-center">
          <h3 className="text-2xl font-bold text-green-600">
            {complaintsWithCoords.filter(c => c.status === 'RESOLVED').length}
          </h3>
          <p className="text-green-800">Resolved</p>
        </div>
      </div>

      {/* Map */}
      <div className="card p-0 overflow-hidden" style={{ height: '70vh' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-blue-600"></div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            minZoom={10}
            maxZoom={18}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Ward Boundaries (subtle) */}
            {wardGeoJSON && (
              <GeoJSON
                data={wardGeoJSON}
                style={() => ({
                  color: '#0078D7',
                  weight: 1,
                  fillOpacity: 0.02,
                  fillColor: '#0078D7'
                })}
                onEachFeature={(feature, layer) => {
                  if (feature.properties) {
                    const wardCode = feature.properties.ward_code || feature.properties.name
                    layer.bindTooltip(`Ward ${wardCode}`, {
                      permanent: false,
                      direction: 'center'
                    })
                  }
                }}
              />
            )}

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createUserLocationIcon()}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold">📍 Your Location</h4>
                    <p className="text-sm text-gray-600">Current position</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Complaint Markers */}
            <MarkerClusterGroup>
              {complaintsWithCoords.map((complaint) => (
                <Marker
                  key={complaint.id}
                  position={[complaint.latitude, complaint.longitude]}
                  icon={createCustomIcon(complaint.category, complaint.status)}
                >
                  <Popup maxWidth={300}>
                    <div className="p-2 max-w-sm">
                      <div className="flex items-start gap-3">
                        {complaint.image && (
                          <img
                            src={complaint.image}
                            alt="Issue"
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">
                            {complaint.title}
                          </h4>
                          <div className="text-xs text-gray-600 space-y-1 mb-2">
                            <div>
                              <strong>Category:</strong> {getCategoryLabel(complaint.category)}
                            </div>
                            <div>
                              <strong>Status:</strong> 
                              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(complaint.status)}`}>
                                {complaint.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div>
                              <strong>Ward:</strong> {complaint.ward}
                            </div>
                            <div>
                              <strong>Reported:</strong> {format(new Date(complaint.created_at), 'MMM dd')}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/track?id=${complaint.id}`}
                              className="btn btn-sm btn-primary flex items-center gap-1 text-xs"
                            >
                              <FiEye className="w-3 h-3" />
                              Track
                            </Link>
                            <button
                              onClick={() => window.open(`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`, '_blank')}
                              className="btn btn-sm btn-secondary flex items-center gap-1 text-xs"
                            >
                              <FiMapPin className="w-3 h-3" />
                              Navigate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      {/* Help Text */}
      <div className="card bg-civic-blue-50 border border-civic-blue-200">
        <div className="flex items-start gap-4">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-civic-blue-900 mb-2">How to use this map</h3>
            <ul className="text-civic-blue-800 text-sm space-y-1">
              <li>• Click on markers to see issue details</li>
              <li>• Use filters to find specific types of issues</li>
              <li>• Enable location to see issues near you</li>
              <li>• Click "Track" to see detailed status information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom icon for user location
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default CitizenMapView