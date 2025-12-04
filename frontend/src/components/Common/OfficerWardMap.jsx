import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { useAuth } from '../../context/AuthContext'
import { COMPLAINT_CATEGORIES } from '../../utils/constants'
import {
  createCustomIcon,
  ensureWardBoundariesLoaded,
  getWardBoundaries,
  createHeatmapLayer,
  calculateDistance,
} from '../../utils/mapUtils'
import { format, differenceInDays } from 'date-fns'
import { FiMapPin, FiEye, FiTrendingUp, FiZoomIn } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

/**
 * OfficerWardMap Component
 * Officer-specific map showing only complaints from their assigned ward
 * Features:
 * - Displays only officer's ward boundaries and complaints
 * - Complaint density visualization with clustering
 * - Complaint hotspot identification
 * - Category distribution analysis
 * - Response time metrics
 */
const OfficerWardMap = ({ height = '70vh' }) => {
  const { user } = useAuth()
  const [wardGeoJSON, setWardGeoJSON] = useState(null)
  const [heatmapLayer, setHeatmapLayer] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [wardStats, setWardStats] = useState(null)
  const [hotspots, setHotspots] = useState([])
  const mapRef = useRef(null)

  // Officer's assigned ward
  const officerWard = user?.ward

  // Load ward boundaries
  useEffect(() => {
    const loadBoundaries = async () => {
      try {
        const boundaries = await ensureWardBoundariesLoaded()
        // Filter to only officer's ward
        if (boundaries && officerWard) {
          const filtered = {
            ...boundaries,
            features: boundaries.features.filter(f => f.properties.ward_code === officerWard),
          }
          setWardGeoJSON(filtered)
        }
      } catch (err) {
        console.error('Failed to load ward boundaries:', err)
      }
    }
    loadBoundaries()
  }, [officerWard])

  // Fetch complaints for officer's ward
  const { data: response, isLoading } = useQuery({
    queryKey: ['officerWardComplaints', officerWard],
    queryFn: () => complaintsApi.getAllComplaints(),
    staleTime: 5 * 60 * 1000,
    enabled: !!officerWard,
  })

  // Extract and filter complaints for officer's ward
  let allComplaints = []
  if (response?.data?.results) {
    allComplaints = response.data.results
  } else if (Array.isArray(response?.data)) {
    allComplaints = response.data
  } else if (Array.isArray(response)) {
    allComplaints = response
  }

  const wardComplaints = allComplaints.filter(
    c => c.ward === officerWard && c.latitude && c.longitude
  )

  // Calculate ward statistics
  useEffect(() => {
    if (wardComplaints.length > 0) {
      const stats = {
        total: wardComplaints.length,
        pending: wardComplaints.filter(c => c.status === 'PENDING').length,
        in_progress: wardComplaints.filter(c => c.status === 'IN_PROGRESS').length,
        resolved: wardComplaints.filter(c => c.status === 'RESOLVED').length,
        rejected: wardComplaints.filter(c => c.status === 'REJECTED').length,
      }

      // Calculate average response time
      const resolved = wardComplaints.filter(c => c.status === 'RESOLVED')
      const avgResponseDays =
        resolved.length > 0
          ? resolved.reduce((sum, c) => {
              const created = new Date(c.created_at)
              const resolved = new Date(c.resolved_at || c.updated_at)
              return sum + differenceInDays(resolved, created)
            }, 0) / resolved.length
          : 0

      stats.avgResponseTime = Math.round(avgResponseDays)

      // Calculate average pending time
      const pending = wardComplaints.filter(c => c.status === 'PENDING')
      const avgPendingDays =
        pending.length > 0
          ? pending.reduce((sum, c) => {
              const created = new Date(c.created_at)
              return sum + differenceInDays(new Date(), created)
            }, 0) / pending.length
          : 0

      stats.avgPendingTime = Math.round(avgPendingDays)

      setWardStats(stats)

      // Generate heatmap layer
      const heatmapData = wardComplaints
        .filter(c => c.latitude && c.longitude)
        .map(c => [
          c.latitude,
          c.longitude,
          c.status === 'PENDING' ? 1.0 : c.status === 'IN_PROGRESS' ? 0.8 : 0.4,
        ])

      if (heatmapData.length > 0) {
        const layer = L.heatLayer(heatmapData, {
          radius: 30,
          blur: 20,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.4: '#FCD34D', // Yellow - Low density
            0.6: '#FF9E00', // Orange
            0.8: '#FF6B00', // Red-orange
            1.0: '#DC2626', // Red - High density
          },
        })
        setHeatmapLayer(layer)
      }

      // Identify hotspots (clusters of 3+ complaints within 500m)
      const spots = identifyHotspots(wardComplaints)
      setHotspots(spots)
    }
  }, [wardComplaints])

  // Identify complaint hotspots
  const identifyHotspots = (complaints) => {
    const hotspots = []
    const clustered = new Set()

    complaints.forEach((complaint, index) => {
      if (clustered.has(index)) return

      const nearby = complaints.filter((other, otherIndex) => {
        if (otherIndex === index || clustered.has(otherIndex)) return false
        const distance = calculateDistance(
          complaint.latitude,
          complaint.longitude,
          other.latitude,
          other.longitude
        )
        return distance <= 0.5 // 500m radius
      })

      if (nearby.length >= 3) {
        const center = {
          lat:
            (complaint.latitude +
              nearby.reduce((sum, c) => sum + c.latitude, 0)) /
            (nearby.length + 1),
          lng:
            (complaint.longitude +
              nearby.reduce((sum, c) => sum + c.longitude, 0)) /
            (nearby.length + 1),
        }

        hotspots.push({
          center,
          count: nearby.length + 1,
          complaints: [complaint, ...nearby],
        })

        clustered.add(index)
        nearby.forEach((_, i) => clustered.add(complaints.indexOf(nearby[i])))
      }
    })

    return hotspots
  }

  // Add heatmap to map
  useEffect(() => {
    if (mapRef.current && heatmapLayer && showHeatmap) {
      heatmapLayer.addTo(mapRef.current)
    } else if (mapRef.current && heatmapLayer && !showHeatmap) {
      mapRef.current.removeLayer(heatmapLayer)
    }
  }, [showHeatmap, heatmapLayer])

  // Get category label
  const getCategoryLabel = (category) => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!officerWard) {
    return (
      <div className="card p-8 text-center bg-red-50 border border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Ward Assignment Required</h3>
        <p className="text-red-800">
          Your account doesn't have a ward assignment. Contact an administrator to assign your ward.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`btn btn-sm ${
            showHeatmap
              ? 'btn-primary'
              : 'btn-secondary'
          } flex items-center gap-2`}
        >
          <FiTrendingUp className="w-4 h-4" />
          {showHeatmap ? 'Hide' : 'Show'} Density Heatmap
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
            center={MUMBAI_MAP_CONFIG.center}
            zoom={13}
            minZoom={10}
            maxZoom={18}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Ward Boundary (Officer's Ward) */}
            {wardGeoJSON && (
              <GeoJSON
                data={wardGeoJSON}
                style={{
                  color: '#0078D7',
                  weight: 3,
                  opacity: 0.8,
                  fillOpacity: 0.1,
                  fillColor: '#0078D7',
                }}
                onEachFeature={(feature, layer) => {
                  const wardName = feature.properties.full_name || feature.properties.name
                  const wardCode = feature.properties.ward_code

                  const popupContent = `
                    <div class="ward-popup">
                      <h4 class="font-bold text-lg text-blue-600 mb-2">${wardName}</h4>
                      <div class="text-sm space-y-1 text-gray-700">
                        <div><strong>Total Issues:</strong> ${wardStats?.total || 0}</div>
                        <div><strong>Pending:</strong> <span class="text-yellow-600">${wardStats?.pending || 0}</span></div>
                        <div><strong>In Progress:</strong> <span class="text-blue-600">${wardStats?.in_progress || 0}</span></div>
                        <div><strong>Resolved:</strong> <span class="text-green-600">${wardStats?.resolved || 0}</span></div>
                      </div>
                    </div>
                  `

                  layer.bindPopup(popupContent)
                  layer.bindTooltip(`${wardCode} Ward - Your Ward`, {
                    permanent: false,
                    direction: 'center',
                    className: 'ward-tooltip text-xs font-semibold',
                  })
                }}
              />
            )}

            {/* Hotspot Markers */}
            {hotspots.map((hotspot, idx) => (
              <Marker
                key={`hotspot-${idx}`}
                position={[hotspot.center.lat, hotspot.center.lng]}
                icon={L.divIcon({
                  className: 'hotspot-marker',
                  html: `
                    <div style="
                      background: linear-gradient(135deg, #DC2626, #991B1B);
                      width: 50px;
                      height: 50px;
                      border-radius: 50%;
                      border: 3px solid white;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 20px;
                      font-weight: bold;
                      color: white;
                      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.6);
                    ">
                      ${hotspot.count}
                    </div>
                  `,
                  iconSize: [50, 50],
                  iconAnchor: [25, 25],
                  popupAnchor: [0, -25],
                })}
              >
                <Popup maxWidth={400}>
                  <div className="p-3 w-full">
                    <h4 className="font-bold text-sm mb-2 text-gray-900">Complaint Hotspot</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {hotspot.count} complaints within 500m radius
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {hotspot.complaints.slice(0, 5).map(complaint => (
                        <div key={complaint.id} className="text-xs bg-gray-50 p-2 rounded">
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {complaint.title}
                          </p>
                          <p className="text-gray-600">{getCategoryLabel(complaint.category)}</p>
                          <p className={`text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                          </p>
                        </div>
                      ))}
                      {hotspot.complaints.length > 5 && (
                        <p className="text-xs text-gray-500 font-semibold">
                          +{hotspot.complaints.length - 5} more...
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Complaint Markers */}
            <MarkerClusterGroup maxClusterRadius={50}>
              {wardComplaints.map(complaint => (
                <Marker
                  key={complaint.id}
                  position={[complaint.latitude, complaint.longitude]}
                  icon={createCustomIcon(complaint.category, complaint.status)}
                >
                  <Popup maxWidth={400} minWidth={320}>
                    <div className="p-3 w-full">
                      {complaint.image && (
                        <img
                          src={complaint.image}
                          alt="Issue"
                          className="w-full h-32 rounded-lg object-cover mb-2"
                        />
                      )}

                      <h4 className="font-bold text-sm mb-2 text-gray-900 line-clamp-2">
                        {complaint.title}
                      </h4>

                      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-semibold text-gray-700">Category</div>
                          <div className="text-gray-600 text-xs">
                            {getCategoryLabel(complaint.category)}
                          </div>
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
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="font-semibold text-gray-700">Days</div>
                          <div className="text-gray-600 text-xs">
                            {differenceInDays(new Date(), new Date(complaint.created_at))} days
                          </div>
                        </div>
                      </div>

                      {complaint.description && (
                        <div className="mb-2">
                          <div className="font-semibold text-xs text-gray-700 mb-1">Description</div>
                          <p className="text-xs text-gray-600 line-clamp-2">{complaint.description}</p>
                        </div>
                      )}

                      {complaint.address && (
                        <div className="mb-2">
                          <div className="font-semibold text-xs text-gray-700 mb-1">Location</div>
                          <p className="text-xs text-gray-600 line-clamp-1">{complaint.address}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mb-2">
                        Reported: {format(new Date(complaint.created_at), 'MMM dd, yyyy')}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/admin/complaints/${complaint.id}`}
                          className="flex-1 btn btn-sm btn-primary flex items-center justify-center gap-1 text-xs"
                        >
                          <FiEye className="w-3 h-3" />
                          Details
                        </Link>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`,
                              '_blank'
                            )
                          }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">Status Colors</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FCD34D' }}></div>
                <span className="text-xs text-gray-700">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                <span className="text-xs text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-xs text-gray-700">Resolved</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">Special Markers</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  3
                </div>
                <span className="text-xs text-gray-700">Hotspot (3+ nearby)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-600"></div>
                <span className="text-xs text-gray-700">Ward Boundary</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-blue-900">Heatmap</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-700">Shows complaint density:</p>
              <div className="flex gap-1">
                {['#FCD34D', '#FF9E00', '#FF6B00', '#DC2626'].map((color, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
              <p className="text-gray-600 text-xs">Low → High density</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {wardStats && (
        <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">Ward Statistics</h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg p-3 text-center border border-indigo-100">
              <div className="text-2xl font-bold text-indigo-600">{wardStats.total}</div>
              <div className="text-xs font-medium text-gray-600 mt-1">Total Issues</div>
            </div>

            <div className="bg-white rounded-lg p-3 text-center border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">{wardStats.pending}</div>
              <div className="text-xs font-medium text-gray-600 mt-1">Pending</div>
            </div>

            <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{wardStats.in_progress}</div>
              <div className="text-xs font-medium text-gray-600 mt-1">In Progress</div>
            </div>

            <div className="bg-white rounded-lg p-3 text-center border border-green-100">
              <div className="text-2xl font-bold text-green-600">{wardStats.resolved}</div>
              <div className="text-xs font-medium text-gray-600 mt-1">Resolved</div>
            </div>

            <div className="bg-white rounded-lg p-3 text-center border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">{wardStats.avgResponseTime}d</div>
              <div className="text-xs font-medium text-gray-600 mt-1">Avg Response</div>
            </div>
          </div>

          {wardStats.avgPendingTime > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Average Pending Time:</strong> {wardStats.avgPendingTime} days
              </p>
              {wardStats.pending > 0 && (
                <p className="text-xs text-amber-800 mt-1">
                  {wardStats.pending} complaint(s) currently awaiting action
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Import map config
const MUMBAI_MAP_CONFIG = {
  center: [19.0760, 72.8777],
}

export default OfficerWardMap
