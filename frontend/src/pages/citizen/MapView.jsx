import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { useAuth } from '../../context/AuthContext'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import {
  MUMBAI_MAP_CONFIG, COMPLAINT_CATEGORIES, COMPLAINT_STATUS, MUMBAI_WARDS
} from '../../utils/constants'
import { createCustomIcon, getCurrentLocation, isWithinMumbai, calculateDistance } from '../../utils/mapUtils'
import { format } from 'date-fns'
import { FiFilter, FiMapPin, FiCrosshair, FiEye, FiRefreshCw, FiInfo } from 'react-icons/fi'
import { Map, MapPin, Navigation, Filter, Eye, RefreshCw, Info, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

/**
 * CitizenMapView
 * Interactive map view for exploring civic complaints across Mumbai
 * Features:
 * - Interactive map of all 24 Mumbai wards with selection
 * - User location tracking and navigation
 * - Comprehensive filtering (category, status, ward, distance)
 * - Ward boundaries overlay
 * - Detailed complaint markers with rich popups
 * - Ward statistics and complaint lists
 * - Real-time filtering and statistics
 */
const CitizenMapView = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  // Map and location state
  const [selectedWard, setSelectedWard] = useState(searchParams.get('ward') || null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState(MUMBAI_MAP_CONFIG.center)
  const [mapZoom, setMapZoom] = useState(12)
  const [wardGeoJSON, setWardGeoJSON] = useState(null)

  // Filtering state
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    ward: user?.ward || '',
    distance: '', // km radius
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [wardStats, setWardStats] = useState(null)

  // UI state
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'

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
          if (!selectedWard) {
            setMapCenter([location.lat, location.lng])
          }
        }
      })
      .catch(err => console.warn('Could not get user location:', err))
  }, [])

  // Fetch all complaints
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['allComplaints'],
    queryFn: () => complaintsApi.getAllComplaints(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })

  // Extract complaints from response - memoized to prevent infinite loops
  const allComplaints = useMemo(() => {
    if (response?.data?.results) {
      return response.data.results
    } else if (Array.isArray(response?.data)) {
      return response.data
    } else if (Array.isArray(response)) {
      return response
    }
    return []
  }, [response])

  // Apply comprehensive filtering
  useEffect(() => {
    let filtered = allComplaints.filter(c => c.latitude && c.longitude)

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(c => c.category === filters.category)
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status)
    }

    // Filter by ward
    if (filters.ward || selectedWard) {
      const wardFilter = filters.ward || selectedWard
      filtered = filtered.filter(c => c.ward === wardFilter)
    }

    // Filter by distance from user location
    if (userLocation && filters.distance && filters.distance !== '') {
      const maxDistance = parseFloat(filters.distance)
      filtered = filtered.filter(c => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          c.latitude,
          c.longitude
        )
        return distance <= maxDistance
      })
    }

    setFilteredComplaints(filtered)

    // Calculate ward statistics if ward is selected
    if (selectedWard) {
      const wardComplaints = allComplaints.filter(c => c.ward === selectedWard)
      const stats = {
        total: wardComplaints.length,
        pending: wardComplaints.filter(c => c.status === 'PENDING').length,
        in_progress: wardComplaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: wardComplaints.filter(c => c.status === 'RESOLVED').length,
        rejected: wardComplaints.filter(c => c.status === 'REJECTED').length,
      }
      setWardStats(stats)
    } else {
      setWardStats(null)
    }
  }, [filters, selectedWard, allComplaints, userLocation])

  // Handle ward selection from map
  const handleWardSelect = (wardCode) => {
    setSelectedWard(wardCode)
    setFilters(prev => ({ ...prev, ward: wardCode }))

    // Find ward center and zoom to it
    if (wardGeoJSON) {
      const wardFeature = wardGeoJSON.features.find(f =>
        f.properties.ward_code === wardCode || f.properties.name === wardCode
      )
      if (wardFeature) {
        // Calculate centroid of ward
        const coords = wardFeature.geometry.coordinates[0][0]
        const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
        const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
        setMapCenter([centerLat, centerLng])
        setMapZoom(14)
      }
    }
  }

  // Clear ward selection
  const clearWardSelection = () => {
    setSelectedWard(null)
    setFilters(prev => ({ ...prev, ward: user?.ward || '' }))
    setMapCenter(MUMBAI_MAP_CONFIG.center)
    setMapZoom(12)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      ward: user?.ward || '',
      distance: '',
    })
    setSelectedWard(null)
    setMapCenter(userLocation ? [userLocation.lat, userLocation.lng] : MUMBAI_MAP_CONFIG.center)
    setMapZoom(12)
  }

  // Go to user location
  const goToMyLocation = async () => {
    try {
      const location = await getCurrentLocation()
      if (isWithinMumbai(location.lat, location.lng)) {
        setUserLocation(location)
        setMapCenter([location.lat, location.lng])
        setMapZoom(15)
      } else {
        alert('Your location appears to be outside Mumbai')
      }
    } catch (error) {
      alert('Could not get your location. Please enable location services.')
    }
  }

  // Get category label
  const getCategoryLabel = (category) => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  // Get ward name
  const getWardName = (code) => {
    const ward = MUMBAI_WARDS.find(w => w.value === code)
    return ward ? ward.label : code
  }

  // Get status badge classes
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Calculate overall statistics
  const overallStats = {
    total: filteredComplaints.length,
    pending: filteredComplaints.filter(c => c.status === 'PENDING').length,
    inProgress: filteredComplaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: filteredComplaints.filter(c => c.status === 'RESOLVED').length,
    rejected: filteredComplaints.filter(c => c.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedWard ? `${getWardName(selectedWard)} Issues` : 'Interactive Mumbai Map'}
          </h1>
          <p className="text-gray-600 mt-1">
            {selectedWard
              ? `Explore civic issues in ${getWardName(selectedWard)} ward`
              : 'Discover and track civic issues across all Mumbai wards'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToMyLocation}
            className="btn btn-secondary flex items-center gap-2"
            title="Go to my location"
          >
            <FiCrosshair className="w-4 h-4" />
            My Location
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn flex items-center gap-2 ${
              showFilters ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {(filters.category || filters.status || filters.ward || filters.distance) && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] h-4 flex items-center justify-center">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            className="btn btn-secondary flex items-center gap-2"
          >
            {viewMode === 'map' ? <FiInfo className="w-4 h-4" /> : <FiMapPin className="w-4 h-4" />}
            {viewMode === 'map' ? 'List View' : 'Map View'}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filter Issues</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
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
                value={filters.ward || selectedWard || ''}
                onChange={(e) => {
                  const ward = e.target.value
                  setFilters({...filters, ward: ward})
                  if (ward) {
                    handleWardSelect(ward)
                  } else {
                    clearWardSelection()
                  }
                }}
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
              <label className="block text-sm font-medium mb-2">Distance from Me</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                className="input w-full"
                disabled={!userLocation}
              >
                <option value="">All Mumbai</option>
                <option value="1">Within 1 km</option>
                <option value="2">Within 2 km</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Total Issues</h3>
          <p className="text-2xl font-bold text-blue-600">{overallStats.total}</p>
          <p className="text-xs text-blue-700">In selected area</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{overallStats.pending}</p>
          <p className="text-xs text-yellow-700">Awaiting action</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{overallStats.inProgress}</p>
          <p className="text-xs text-blue-700">Being resolved</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <h3 className="text-sm font-semibold text-green-900 mb-1">Resolved</h3>
          <p className="text-2xl font-bold text-green-600">{overallStats.resolved}</p>
          <p className="text-xs text-green-700">Successfully closed</p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-pink-50 border border-red-200">
          <h3 className="text-sm font-semibold text-red-900 mb-1">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">{overallStats.rejected}</p>
          <p className="text-xs text-red-700">Not actionable</p>
        </div>
      </div>

      {/* Ward Selection Info */}
      {selectedWard && wardStats && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">
                Ward {getWardName(selectedWard)} Overview
              </h3>
              <p className="text-indigo-700 text-sm mt-1">
                {wardStats.total} total issues • {wardStats.pending} pending • {wardStats.in_progress} in progress
              </p>
            </div>
            <button
              onClick={clearWardSelection}
              className="btn btn-secondary"
            >
              View All Wards
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Complaints</h3>
              <p className="text-red-700 text-sm mt-1">
                {error.message || 'Failed to load complaints. Please try refreshing the page.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="card p-0 overflow-hidden" style={{ height: '70vh' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading complaints...</p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              minZoom={10}
              maxZoom={18}
              className="h-full w-full"
              whenReady={() => {
                // Map is ready
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* Ward Boundaries */}
              {wardGeoJSON && (
                <GeoJSON
                  data={wardGeoJSON}
                  style={(feature) => ({
                    color: selectedWard && (feature.properties.ward_code === selectedWard || feature.properties.name === selectedWard)
                      ? '#EF4444' // Red for selected ward
                      : '#0078D7', // Blue for others
                    weight: selectedWard && (feature.properties.ward_code === selectedWard || feature.properties.name === selectedWard)
                      ? 3
                      : 1,
                    fillOpacity: selectedWard && (feature.properties.ward_code === selectedWard || feature.properties.name === selectedWard)
                      ? 0.1
                      : 0.02,
                    fillColor: selectedWard && (feature.properties.ward_code === selectedWard || feature.properties.name === selectedWard)
                      ? '#EF4444'
                      : '#0078D7'
                  })}
                  onEachFeature={(feature, layer) => {
                    if (feature.properties) {
                      const wardCode = feature.properties.ward_code || feature.properties.name
                      const wardName = getWardName(wardCode)
                      layer.bindTooltip(`${wardName} (Ward ${wardCode})`, {
                        permanent: false,
                        direction: 'center'
                      })
                      layer.on('click', () => handleWardSelect(wardCode))
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
                      <h4 className="font-semibold flex items-center gap-2">
                        <FiCrosshair className="w-4 h-4 text-blue-600" />
                        Your Location
                      </h4>
                      <p className="text-sm text-gray-600">Current position</p>
                      {filters.distance && (
                        <p className="text-xs text-blue-600 mt-1">
                          Showing issues within {filters.distance}km
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Complaint Markers */}
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={50}
              >
                {filteredComplaints.map((complaint) => (
                  <Marker
                    key={complaint.id}
                    position={[complaint.latitude, complaint.longitude]}
                    icon={createCustomIcon(complaint.category, complaint.status)}
                    eventHandlers={{
                      click: () => setSelectedComplaint(complaint)
                    }}
                  >
                    <Popup maxWidth={400} minWidth={350}>
                      <div className="p-3 w-full">
                        {/* Image */}
                        {complaint.image && (
                          <img
                            src={complaint.image}
                            alt="Issue"
                            className="w-full h-32 rounded-lg object-cover mb-3"
                          />
                        )}

                        {/* Title */}
                        <h4 className="font-bold text-base mb-2 text-gray-900">
                          {complaint.title}
                        </h4>

                        {/* Status Badge */}
                        <div className="mb-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Category</div>
                            <div className="text-gray-600">{getCategoryLabel(complaint.category)}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Ward</div>
                            <div className="text-gray-600">{getWardName(complaint.ward) || complaint.ward}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Priority</div>
                            <div className="text-gray-600">{complaint.priority || 'Normal'}</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="font-semibold text-gray-700">Reported</div>
                            <div className="text-gray-600">{format(new Date(complaint.created_at), 'MMM dd')}</div>
                          </div>
                        </div>

                        {/* Description */}
                        {complaint.description && (
                          <div className="mb-3">
                            <div className="font-semibold text-xs text-gray-700 mb-1">Description</div>
                            <p className="text-xs text-gray-600 line-clamp-3">{complaint.description}</p>
                          </div>
                        )}

                        {/* Address */}
                        {complaint.address && (
                          <div className="mb-3">
                            <div className="font-semibold text-xs text-gray-700 mb-1">Location</div>
                            <p className="text-xs text-gray-600 line-clamp-2">{complaint.address}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link
                            to={`/dashboard/complaints/${complaint.id}`}
                            className="flex-1 btn btn-sm btn-primary flex items-center justify-center gap-1 text-xs"
                          >
                            <FiEye className="w-3 h-3" />
                            View Details
                          </Link>
                          <button
                            onClick={() => window.open(`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`, '_blank')}
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
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {selectedWard ? `Issues in ${getWardName(selectedWard)}` : 'All Issues'}
            </h3>
            <span className="text-sm text-gray-600">
              {filteredComplaints.length} issues found
            </span>
          </div>

          {filteredComplaints.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {complaint.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded border font-medium ${getStatusBadgeClass(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {getCategoryLabel(complaint.category)}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Ward {getWardName(complaint.ward) || complaint.ward}
                        </span>
                        {complaint.priority && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {complaint.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/complaints/${complaint.id}`}
                      className="btn btn-sm btn-primary whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600 mb-4">
                {selectedWard
                  ? `No issues match your filters in ${getWardName(selectedWard)}`
                  : 'No issues match your current filters'
                }
              </p>
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Issue Details</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Image */}
              {selectedComplaint.image && (
                <img
                  src={selectedComplaint.image}
                  alt="Issue"
                  className="w-full h-48 rounded-lg object-cover mb-4"
                />
              )}

              {/* Title and Status */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedComplaint.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeClass(selectedComplaint.status)}`}>
                  {selectedComplaint.status.replace('_', ' ')}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Category</span>
                  <p className="text-gray-900">{getCategoryLabel(selectedComplaint.category)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Ward</span>
                  <p className="text-gray-900">{getWardName(selectedComplaint.ward) || selectedComplaint.ward}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Priority</span>
                  <p className="text-gray-900">{selectedComplaint.priority || 'Normal'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Reported</span>
                  <p className="text-gray-900">{format(new Date(selectedComplaint.created_at), 'PPP')}</p>
                </div>
              </div>

              {/* Description */}
              {selectedComplaint.description && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600">Description</span>
                  <p className="text-gray-900 mt-1">{selectedComplaint.description}</p>
                </div>
              )}

              {/* Address */}
              {selectedComplaint.address && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600">Location</span>
                  <p className="text-gray-900 mt-1">{selectedComplaint.address}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Link
                  to={`/dashboard/complaints/${selectedComplaint.id}`}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <FiEye className="w-4 h-4" />
                  View Full Details
                </Link>
                <button
                  onClick={() => window.open(`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}`, '_blank')}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <FiMapPin className="w-4 h-4" />
                  Navigate Here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
        <div className="flex items-start gap-4">
          <FiInfo className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-indigo-900 mb-2">How to Use This Interactive Map</h3>
            <div className="grid md:grid-cols-2 gap-4 text-indigo-800 text-sm">
              <div>
                <h4 className="font-medium mb-2">Map Features:</h4>
                <ul className="space-y-1">
                  <li>• Click ward boundaries to zoom and filter</li>
                  <li>• Markers show issues colored by status</li>
                  <li>• Click markers for detailed information</li>
                  <li>• Use "My Location" to center on you</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Filtering & Views:</h4>
                <ul className="space-y-1">
                  <li>• Filter by category, status, ward, or distance</li>
                  <li>• Switch between Map and List views</li>
                  <li>• View statistics for selected areas</li>
                  <li>• Navigate directly to issue locations</li>
                </ul>
              </div>
            </div>
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
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

export default CitizenMapView