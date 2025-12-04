import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { 
  MUMBAI_MAP_CONFIG, 
  COMPLAINT_CATEGORIES, 
  COMPLAINT_STATUS, 
  MUMBAI_WARDS 
} from '../../utils/constants'
import { 
  createCustomIcon, 
  getWardFromCoordinates, 
  ensureWardBoundariesLoaded,
  getWardBoundaries,
  calculateDistance,
  getCurrentLocation,
  isWithinMumbai
} from '../../utils/mapUtils'
import { format } from 'date-fns'
import { FiMapPin, FiZoomIn, FiCrosshair, FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

/**
 * WardMap Component
 * Interactive Leaflet.js map displaying:
 * - All 24 Mumbai wards with boundaries
 * - Ward names and complaint statistics
 * - Complaint pins with status-based coloring
 * - Click to zoom and view ward details
 */
const WardMap = ({ onWardSelect, selectedWardCode, showStats = true, height = '70vh' }) => {
  const [wardGeoJSON, setWardGeoJSON] = useState(null)
  const [selectedWard, setSelectedWard] = useState(selectedWardCode || null)
  const [wardStats, setWardStats] = useState({})
  const [mapCenter, setMapCenter] = useState(MUMBAI_MAP_CONFIG.center)
  const [userLocation, setUserLocation] = useState(null)
  const mapRef = useRef(null)

  // Load ward boundaries on mount
  useEffect(() => {
    const loadBoundaries = async () => {
      try {
        const boundaries = await ensureWardBoundariesLoaded()
        setWardGeoJSON(boundaries)
      } catch (err) {
        console.error('Failed to load ward boundaries:', err)
      }
    }
    loadBoundaries()
  }, [])

  // Get user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then(location => {
        if (isWithinMumbai(location.lat, location.lng)) {
          setUserLocation(location)
        }
      })
      .catch(err => console.warn('Could not get user location:', err))
  }, [])

  // Fetch all complaints
  const { data: response, isLoading } = useQuery({
    queryKey: ['allComplaints'],
    queryFn: () => complaintsApi.getAllComplaints(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Extract complaints from response
  let allComplaints = []
  if (response?.data?.results) {
    allComplaints = response.data.results
  } else if (Array.isArray(response?.data)) {
    allComplaints = response.data
  } else if (Array.isArray(response)) {
    allComplaints = response
  }

  // Calculate ward statistics
  useEffect(() => {
    if (wardGeoJSON && allComplaints.length > 0) {
      const stats = {}
      
      wardGeoJSON.features.forEach(feature => {
        const wardCode = feature.properties.ward_code
        const wardComplaints = allComplaints.filter(c => c.ward === wardCode && c.latitude && c.longitude)
        
        stats[wardCode] = {
          total: wardComplaints.length,
          pending: wardComplaints.filter(c => c.status === 'PENDING').length,
          in_progress: wardComplaints.filter(c => c.status === 'IN_PROGRESS').length,
          resolved: wardComplaints.filter(c => c.status === 'RESOLVED').length,
          rejected: wardComplaints.filter(c => c.status === 'REJECTED').length,
          complaints: wardComplaints,
        }
      })
      
      setWardStats(stats)
    }
  }, [wardGeoJSON, allComplaints])

  // Handle ward selection
  const handleWardClick = (wardCode, feature) => {
    setSelectedWard(wardCode)
    onWardSelect?.(wardCode, wardStats[wardCode])
    
    // Zoom to ward bounds
    if (mapRef.current) {
      const bounds = L.geoJSON(feature).getBounds()
      mapRef.current.fitBounds(bounds, { padding: [50, 50], duration: 0.5 })
    }
  }

  // Navigate to user location
  const handleMyLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15, { duration: 0.5 })
    }
  }

  // Get category label
  const getCategoryLabel = (category) => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'yellow'
      case 'IN_PROGRESS': return 'blue'
      case 'RESOLVED': return 'green'
      case 'REJECTED': return 'red'
      default: return 'gray'
    }
  }

  // Get status badge classes
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleMyLocation}
          className="btn btn-secondary btn-sm flex items-center gap-2"
          disabled={!userLocation}
        >
          <FiCrosshair className="w-4 h-4" />
          My Location
        </button>
      </div>

      {/* Map Container */}
      <div className="card p-0 overflow-hidden rounded-lg" style={{ height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            ref={mapRef}
            center={mapCenter}
            zoom={11}
            minZoom={10}
            maxZoom={18}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Ward Boundaries with Interactive Features */}
            {wardGeoJSON && (
              <GeoJSON
                data={wardGeoJSON}
                style={(feature) => {
                  const wardCode = feature.properties.ward_code
                  const isSelected = wardCode === selectedWard
                  const totalComplaints = wardStats[wardCode]?.total || 0
                  
                  // Dynamic styling based on complaint density
                  let fillOpacity = 0.1
                  let weight = 1.5
                  let color = '#0078D7'
                  
                  if (isSelected) {
                    fillOpacity = 0.25
                    weight = 3
                    color = '#FF6B35'
                  } else if (totalComplaints > 20) {
                    fillOpacity = 0.2
                    color = '#0078D7'
                  } else if (totalComplaints > 10) {
                    fillOpacity = 0.15
                    color = '#0078D7'
                  }
                  
                  return {
                    color,
                    weight,
                    opacity: 0.8,
                    fillOpacity,
                    fillColor: color,
                    cursor: 'pointer',
                  }
                }}
                onEachFeature={(feature, layer) => {
                  const wardCode = feature.properties.ward_code
                  const wardName = feature.properties.full_name || feature.properties.name
                  const stats = wardStats[wardCode] || {}
                  
                  // Create popup content
                  const popupContent = `
                    <div class="ward-popup min-w-max">
                      <h4 class="font-bold text-lg text-blue-600 mb-2">${wardName}</h4>
                      <div class="text-sm space-y-1 text-gray-700">
                        <div><strong>Total Issues:</strong> ${stats.total || 0}</div>
                        <div><strong>Pending:</strong> <span class="text-yellow-600">${stats.pending || 0}</span></div>
                        <div><strong>In Progress:</strong> <span class="text-blue-600">${stats.in_progress || 0}</span></div>
                        <div><strong>Resolved:</strong> <span class="text-green-600">${stats.resolved || 0}</span></div>
                        <div><strong>Rejected:</strong> <span class="text-red-600">${stats.rejected || 0}</span></div>
                      </div>
                      <div class="text-xs text-gray-500 mt-2">Click to zoom and view details</div>
                    </div>
                  `
                  
                  layer.bindPopup(popupContent, {
                    maxWidth: 300,
                    minWidth: 250,
                  })
                  
                  // Add tooltip showing ward code
                  layer.bindTooltip(`${wardCode} Ward`, {
                    permanent: false,
                    direction: 'center',
                    className: 'ward-tooltip text-xs font-semibold',
                  })
                  
                  // Click handler
                  layer.on('click', () => {
                    handleWardClick(wardCode, feature)
                  })
                  
                  // Hover effects
                  layer.on('mouseover', function() {
                    this.setStyle({
                      weight: 3,
                      fillOpacity: 0.2,
                    })
                  })
                  
                  layer.on('mouseout', function() {
                    const isSelected = wardCode === selectedWard
                    this.setStyle({
                      weight: isSelected ? 3 : 1.5,
                      fillOpacity: isSelected ? 0.25 : 0.1,
                    })
                  })
                }}
              />
            )}

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `
                    <div style="
                      background-color: #3B82F6;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      border: 3px solid white;
                      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
                    "></div>
                  `,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12],
                })}
              >
                <Popup>
                  <div className="p-2 text-sm">
                    <h4 className="font-semibold">📍 Your Location</h4>
                    <p className="text-gray-600 text-xs">Current position</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Complaint Markers Clustered by Ward */}
            <MarkerClusterGroup maxClusterRadius={50}>
              {allComplaints
                .filter(c => c.latitude && c.longitude)
                .map((complaint) => (
                  <Marker
                    key={complaint.id}
                    position={[complaint.latitude, complaint.longitude]}
                    icon={createCustomIcon(complaint.category, complaint.status)}
                  >
                    <Popup maxWidth={400} minWidth={320}>
                      <div className="p-3 w-full">
                        {/* Complaint Image */}
                        {complaint.image && (
                          <img
                            src={complaint.image}
                            alt="Issue"
                            className="w-full h-32 rounded-lg object-cover mb-2"
                          />
                        )}
                        
                        {/* Title */}
                        <h4 className="font-bold text-sm mb-2 text-gray-900 line-clamp-2">
                          {complaint.title}
                        </h4>
                        
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Category</div>
                            <div className="text-gray-600 text-xs">{getCategoryLabel(complaint.category)}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Ward</div>
                            <div className="text-gray-600 text-xs font-bold">{complaint.ward || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Status</div>
                            <span className={`text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Priority</div>
                            <div className="text-gray-600 text-xs">{complaint.priority || 'Normal'}</div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {complaint.description && (
                          <div className="mb-2">
                            <div className="font-semibold text-xs text-gray-700 mb-1">Description</div>
                            <p className="text-xs text-gray-600 line-clamp-2">{complaint.description}</p>
                          </div>
                        )}
                        
                        {/* Address */}
                        {complaint.address && (
                          <div className="mb-2">
                            <div className="font-semibold text-xs text-gray-700 mb-1">Location</div>
                            <p className="text-xs text-gray-600 line-clamp-1">{complaint.address}</p>
                          </div>
                        )}
                        
                        {/* Reported Date */}
                        <div className="text-xs text-gray-500 mb-2">
                          Reported: {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link
                            to={`/dashboard/complaints/${complaint.id}`}
                            className="flex-1 btn btn-sm btn-primary flex items-center justify-center gap-1 text-xs"
                          >
                            <FiEye className="w-3 h-3" />
                            Details
                          </Link>
                          <button
                            onClick={() => window.open(
                              `https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`,
                              '_blank'
                            )}
                            className="flex-1 btn btn-sm btn-secondary flex items-center justify-center gap-1 text-xs"
                          >
                            <FiMapPin className="w-3 h-3" />
                            Navigate
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Map Legend</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Status Colors */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">Status</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FCD34D' }}></div>
                <span className="text-xs text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                <span className="text-xs text-gray-700">In Progress</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">&nbsp;</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-xs text-gray-700">Resolved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <span className="text-xs text-gray-700">Rejected</span>
              </div>
            </div>
          </div>
          
          {/* Map Elements */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">Map</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600"></div>
                <span className="text-xs text-gray-700">Ward Boundary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                <span className="text-xs text-gray-700">Your Location</span>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">Tips</p>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Click a ward to zoom</li>
              <li>• Click pins for details</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && selectedWard && wardStats[selectedWard] && (
        <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-indigo-900">
              {selectedWard} Ward - Complaint Summary
            </h3>
            <button
              onClick={() => setSelectedWard(null)}
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              ✕ Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg p-3 text-center border border-indigo-100">
              <div className="text-2xl font-bold text-indigo-600">
                {wardStats[selectedWard].total}
              </div>
              <div className="text-xs font-medium text-gray-600 mt-1">Total Issues</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 text-center border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">
                {wardStats[selectedWard].pending}
              </div>
              <div className="text-xs font-medium text-gray-600 mt-1">Pending</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {wardStats[selectedWard].in_progress}
              </div>
              <div className="text-xs font-medium text-gray-600 mt-1">In Progress</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {wardStats[selectedWard].resolved}
              </div>
              <div className="text-xs font-medium text-gray-600 mt-1">Resolved</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 text-center border border-red-100">
              <div className="text-2xl font-bold text-red-600">
                {wardStats[selectedWard].rejected}
              </div>
              <div className="text-xs font-medium text-gray-600 mt-1">Rejected</div>
            </div>
          </div>
          
          {wardStats[selectedWard].total > 0 && (
            <div className="mt-3">
              <Link
                to={`/dashboard/map?ward=${selectedWard}`}
                className="btn btn-primary btn-sm"
              >
                View All Issues in {selectedWard} Ward
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WardMap
