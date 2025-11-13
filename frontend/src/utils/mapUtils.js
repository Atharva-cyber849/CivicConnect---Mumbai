import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.heat'

// Mumbai Map Configuration
export const MUMBAI_CENTER = [19.0760, 72.8777]
export const DEFAULT_ZOOM = 11

// Map Bounds for Mumbai (Updated to match actual boundaries)
export const MUMBAI_BOUNDS = [
  [18.8900, 72.7760], // Southwest
  [19.2700, 72.9800], // Northeast
]

// Ward Boundaries Data - Load from public GeoJSON file
let WARD_BOUNDARIES = null
let BOUNDARIES_LOADING = null

// Initialize ward boundaries from GeoJSON file
const initializeWardBoundaries = async () => {
  if (WARD_BOUNDARIES) return WARD_BOUNDARIES
  if (BOUNDARIES_LOADING) return BOUNDARIES_LOADING
  
  BOUNDARIES_LOADING = (async () => {
    try {
      // Try to load complete ward boundaries first (best coverage)
      let response = await fetch('/data/mumbai-wards-complete.geojson')
      if (!response.ok) {
        console.warn('Complete boundaries not found, trying accurate boundaries')
        response = await fetch('/data/mumbai-wards-accurate.geojson')
      }
      if (!response.ok) {
        console.warn('Accurate boundaries not found, falling back to standard boundaries')
        response = await fetch('/data/mumbai-wards.geojson')
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      WARD_BOUNDARIES = await response.json()
      console.log('Ward boundaries loaded successfully:', WARD_BOUNDARIES.features.length, 'wards')
      return WARD_BOUNDARIES
    } catch (error) {
      console.error('Failed to load ward boundaries:', error)
      // Fallback to empty features if file not found
      WARD_BOUNDARIES = { type: 'FeatureCollection', features: [] }
      return WARD_BOUNDARIES
    } finally {
      BOUNDARIES_LOADING = null
    }
  })()
  
  return BOUNDARIES_LOADING
}

// Initialize on module load
initializeWardBoundaries()

// Export a getter function for WARD_BOUNDARIES
export const getWardBoundaries = () => WARD_BOUNDARIES || { type: 'FeatureCollection', features: [] }

// Export async function to ensure boundaries are loaded
export const ensureWardBoundariesLoaded = async () => {
  if (WARD_BOUNDARIES) return WARD_BOUNDARIES
  return initializeWardBoundaries()
}

// Mumbai Zones Configuration
export const MUMBAI_ZONES = {
  SOUTH: { color: '#FF6B6B', wards: ['A', 'B', 'C', 'D', 'E'] },
  CENTRAL: { color: '#4ECDC4', wards: ['F/N', 'F/S', 'G/N', 'G/S', 'H/E', 'H/W'] },
  WESTERN: { color: '#45B7D1', wards: ['K/E', 'K/W', 'P/N', 'P/S', 'R/C', 'R/N', 'R/S'] },
  EASTERN: { color: '#96CEB4', wards: ['L', 'M/E', 'M/W', 'N', 'S', 'T'] }
}

// Custom marker icons for different complaint categories with enhanced styling
export const createCustomIcon = (category, status, isSelected = false) => {
  const colors = {
    PENDING: '#FCD34D', // Yellow
    IN_PROGRESS: '#3B82F6', // Blue
    RESOLVED: '#10B981', // Green
    REJECTED: '#EF4444', // Red
  }

  const color = colors[status] || colors.PENDING
  const size = isSelected ? 40 : 30
  const borderWidth = isSelected ? 4 : 3

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: ${borderWidth}px solid white;
        box-shadow: 0 ${isSelected ? 4 : 2}px ${isSelected ? 12 : 8}px rgba(0,0,0,${isSelected ? 0.4 : 0.3});
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? 20 : 16}px;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        ${getCategoryEmoji(category)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  })
}

// Enhanced emoji mapping for categories
const getCategoryEmoji = (category) => {
  const emojis = {
    POTHOLE: '🕳️',
    ROAD_DAMAGE: '🛣️',
    GARBAGE: '🗑️',
    WATER_LEAKAGE: '💧',
    STREETLIGHT: '💡',
    SEWAGE_OVERFLOW: '🌊',
    TRAFFIC_SIGNAL: '🚦',
    PARK_DAMAGE: '🌳',
    ENCROACHMENT: '🚧',
    DRAINAGE: '🌪️',
    BUILDING: '🏢',
    NOISE: '🔊',
    AIR_POLLUTION: '😷',
    OTHER: '📍',
  }
  return emojis[category] || '📍'
}

// Enhanced marker cluster with Mumbai-specific styling
export const createMarkerCluster = () => {
  return L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    spiderfyDistanceMultiplier: 1.5,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount()
      let size = 'small'
      let sizeNum = 30
      
      if (count > 10) {
        size = 'medium'
        sizeNum = 40
      }
      if (count > 50) {
        size = 'large'
        sizeNum = 50
      }
      
      return L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #0078D7, #FF9E00);
            color: white;
            border-radius: 50%;
            width: ${sizeNum}px;
            height: ${sizeNum}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${sizeNum/3}px;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">
            ${count}
          </div>
        `,
        className: `marker-cluster marker-cluster-${size}`,
        iconSize: L.point(sizeNum, sizeNum),
      })
    },
  })
}

// Enhanced ward detection using actual polygon data
export const getWardFromCoordinates = (lat, lng) => {
  try {
    const point = [lng, lat] // GeoJSON uses [lng, lat] format
    const boundaries = getWardBoundaries()
    
    if (boundaries && boundaries.features && boundaries.features.length > 0) {
      for (const feature of boundaries.features) {
        if (feature.geometry && feature.geometry.coordinates) {
          if (isPointInPolygon(point, feature.geometry.coordinates[0])) {
            console.log(`✓ Polygon match: (${lat}, ${lng}) -> ${feature.properties.ward_code}`)
            return feature.properties.ward_code
          }
        }
      }
      // If no polygon match, use fallback
      console.log(`✗ No polygon match for (${lat}, ${lng}), using fallback`)
    } else {
      console.log(`⚠ Ward boundaries not loaded, using fallback`)
    }
    
    // Fallback to approximate zones if exact match fails
    const approximateWard = getApproximateWard(lat, lng)
    console.log(`→ Fallback ward: (${lat}, ${lng}) -> ${approximateWard}`)
    return approximateWard
  } catch (error) {
    console.error('Ward detection error:', error)
    const approximateWard = getApproximateWard(lat, lng)
    console.log(`→ Error fallback: (${lat}, ${lng}) -> ${approximateWard}`)
    return approximateWard
  }
}

// Point-in-polygon algorithm for accurate ward detection
const isPointInPolygon = (point, polygon) => {
  const [x, y] = point
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

// Fallback ward detection based on GeoJSON boundaries
const getApproximateWard = (lat, lng) => {
  // South Mumbai (lat < 19.05)
  if (lat < 18.97) {
    if (lng < 72.82) return 'A' // Colaba
    if (lng < 72.84) return 'B' // Dockyard Road
    if (lng < 72.86) return 'C' // Kalbadevi
    return 'D' // Girgaon
  }
  
  if (lat < 19.05) {
    if (lng < 72.82) return 'D' // Girgaon
    if (lng < 72.84) return 'E' // Byculla East
    if (lng < 72.86) return 'F/N' // Parel
    if (lng < 72.88) return 'F/S' // Elphinstone
    return 'M/E' // Chembur
  }
  
  // Central Mumbai (19.05 - 19.13)
  if (lat < 19.13) {
    if (lng < 72.82) return 'F/N' // Parel
    if (lng < 72.84) return 'F/S' // Elphinstone
    if (lng < 72.86) return 'G/N' // Dadar
    if (lng < 72.88) return 'G/S' // Worli
    if (lng < 72.90) return 'H/E' // Bandra East
    if (lng < 72.92) return 'L' // Kurla
    return 'M/E' // Chembur
  }
  
  // Western Mumbai - Malad/Goregaon (19.13 - 19.25)
  if (lat < 19.25) {
    if (lng < 72.82) return 'P/N' // Malad
    if (lng < 72.84) return 'P/N' // Malad
    if (lng < 72.86) return 'P/S' // Goregaon
    if (lng < 72.88) return 'K/W' // Andheri West
    if (lng < 72.90) return 'H/W' // Bandra West
    if (lng < 72.92) return 'M/W' // Ghatkopar
    return 'N' // Ghatkopar East
  }
  
  // Northern Mumbai (19.25 - 19.43)
  if (lat < 19.43) {
    if (lng < 72.82) return 'P/S' // Goregaon
    if (lng < 72.84) return 'R/C' // Borivali Central
    if (lng < 72.86) return 'R/N' // Dahisar
    if (lng < 72.88) return 'R/S' // Kandivali
    if (lng < 72.90) return 'K/E' // Andheri East
    if (lng < 72.92) return 'S' // Bhandup
    return 'T' // Mulund
  }
  
  return 'T' // Default to Mulund for northern areas
}

// Get ward information including boundaries
export const getWardInfo = (wardCode) => {
  const boundaries = getWardBoundaries()
  if (!boundaries || !boundaries.features) return null
  
  const ward = boundaries.features.find(
    feature => feature.properties.ward_code === wardCode
  )
  return ward ? ward.properties : null
}

// Create ward boundary layer with styling
export const createWardBoundaryLayer = (options = {}) => {
  const boundaries = getWardBoundaries()
  if (!boundaries || !boundaries.features) return null
  
  const defaultStyle = {
    color: '#0078D7',
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.1,
    fillColor: '#0078D7'
  }
  
  return L.geoJSON(boundaries, {
    style: (feature) => ({
      ...defaultStyle,
      ...options.style,
      fillColor: options.colorByZone ? getZoneColor(feature.properties.ward_code) : defaultStyle.fillColor
    }),
    onEachFeature: (feature, layer) => {
      if (options.showPopup) {
        const wardName = feature.properties.ward_name || feature.properties.full_name || feature.properties.ward_code
        layer.bindPopup(`
          <div class="ward-popup">
            <h3 class="font-bold text-lg text-blue-600">${wardName}</h3>
            <p><strong>Ward:</strong> ${feature.properties.ward_code}</p>
            <p><strong>Population:</strong> ${feature.properties.population?.toLocaleString() || 'N/A'}</p>
            <p><strong>Area:</strong> ${feature.properties.area_sqkm || 'N/A'} sq km</p>
          </div>
        `)
      }
      
      if (options.onWardClick) {
        layer.on('click', () => options.onWardClick(feature.properties))
      }
    }
  })
}

// Get zone color for ward
const getZoneColor = (wardCode) => {
  for (const [zone, config] of Object.entries(MUMBAI_ZONES)) {
    if (config.wards.includes(wardCode)) {
      return config.color
    }
  }
  return '#0078D7' // Default color
}

// Create heatmap layer for complaint density
export const createHeatmapLayer = (complaints, options = {}) => {
  const heatmapData = complaints
    .filter(c => c.latitude && c.longitude)
    .map(c => [
      c.latitude,
      c.longitude,
      getComplaintWeight(c)
    ])
  
  return L.heatLayer(heatmapData, {
    radius: options.radius || 25,
    blur: options.blur || 15,
    maxZoom: options.maxZoom || 17,
    max: options.max || 1.0,
    gradient: options.gradient || {
      0.4: '#FFD700',
      0.6: '#FF9E00',
      0.8: '#FF6B00',
      1.0: '#FF0000'
    }
  })
}

// Calculate complaint weight for heatmap
const getComplaintWeight = (complaint) => {
  let weight = 0.5 // Base weight
  
  // Increase weight based on priority
  if (complaint.priority === 'URGENT') weight = 1.0
  else if (complaint.priority === 'HIGH') weight = 0.8
  else if (complaint.priority === 'MEDIUM') weight = 0.6
  
  // Increase weight for pending complaints
  if (complaint.status === 'PENDING') weight += 0.2
  
  // Increase weight for recent complaints
  const daysSinceCreated = (Date.now() - new Date(complaint.created_at)) / (1000 * 60 * 60 * 24)
  if (daysSinceCreated < 7) weight += 0.1
  
  return Math.min(weight, 1.0)
}

import { axiosPrivate } from '../api/axiosConfig'

// Enhanced reverse geocoding with ward detection using backend proxy
export const reverseGeocode = async (lat, lng) => {
  try {
    // Ensure ward boundaries are loaded before detecting ward
    await ensureWardBoundariesLoaded()
    
    const response = await axiosPrivate.get('/complaints/geocode/reverse/', {
      params: { lat, lon: lng }
    })
    const data = response.data
    
    const ward = getWardFromCoordinates(lat, lng)
    const wardInfo = getWardInfo(ward)
    
    console.log(`Reverse geocode: (${lat}, ${lng}) -> Ward: ${ward}`)
    
    return {
      address: data.full_address,
      city: data.address_components?.city || 'Mumbai',
      state: data.address_components?.state || 'Maharashtra',
      zip_code: data.address_components?.postcode || '',
      ward: ward,
      ward_name: wardInfo?.full_name || `${ward} Ward`,
      locality: data.address_components?.suburb || '',
      road: data.address_components?.road || '',
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    
    // Ensure ward boundaries are loaded for fallback
    await ensureWardBoundariesLoaded()
    
    const ward = getWardFromCoordinates(lat, lng)
    const wardInfo = getWardInfo(ward)
    
    console.log(`Reverse geocode fallback: (${lat}, ${lng}) -> Ward: ${ward}`)
    
    return {
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: 'Mumbai',
      state: 'Maharashtra',
      zip_code: '',
      ward: ward,
      ward_name: wardInfo?.full_name || `${ward} Ward`,
      locality: '',
      road: '',
    }
  }
}

// Enhanced location detection with accuracy check
export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }
        
        // Check if location is within Mumbai
        if (!isWithinMumbai(location.lat, location.lng)) {
          reject(new Error('Location is outside Mumbai municipal limits'))
          return
        }
        
        resolve(location)
      },
      (error) => {
        let errorMessage = 'Location access denied'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        
        reject(new Error(errorMessage))
      },
      { ...defaultOptions, ...options }
    )
  })
}

// Watch position for real-time tracking
export const watchLocation = (callback, options = {}) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported')
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      }
      
      if (isWithinMumbai(location.lat, location.lng)) {
        callback(location)
      }
    },
    (error) => {
      console.error('Location watch error:', error)
    },
    { ...defaultOptions, ...options }
  )
}

// Enhanced Mumbai bounds checking with buffer
export const isWithinMumbai = (lat, lng, buffer = 0.01) => {
  const [swLat, swLng] = MUMBAI_BOUNDS[0]
  const [neLat, neLng] = MUMBAI_BOUNDS[1]
  
  return lat >= (swLat - buffer) && 
         lat <= (neLat + buffer) && 
         lng >= (swLng - buffer) && 
         lng <= (neLng + buffer)
}

// Enhanced distance calculation with bearing
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate bearing between two points
export const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const dLng = (lng2 - lng1) * Math.PI / 180
  const lat1Rad = lat1 * Math.PI / 180
  const lat2Rad = lat2 * Math.PI / 180
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
  
  const bearing = Math.atan2(y, x) * 180 / Math.PI
  return (bearing + 360) % 360
}

// Find nearest complaints to a location
export const findNearbyComplaints = (targetLat, targetLng, complaints, radius = 1) => {
  return complaints
    .map(complaint => ({
      ...complaint,
      distance: calculateDistance(targetLat, targetLng, complaint.latitude, complaint.longitude)
    }))
    .filter(complaint => complaint.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
}

// Get complaints statistics by ward
export const getWardStatistics = (complaints) => {
  const stats = {}
  const boundaries = getWardBoundaries()
  
  if (!boundaries || !boundaries.features) return stats
  
  boundaries.features.forEach(feature => {
    const wardCode = feature.properties.ward_code
    const wardComplaints = complaints.filter(c => c.ward === wardCode)
    
    stats[wardCode] = {
      ...feature.properties,
      total_complaints: wardComplaints.length,
      pending: wardComplaints.filter(c => c.status === 'PENDING').length,
      in_progress: wardComplaints.filter(c => c.status === 'IN_PROGRESS').length,
      resolved: wardComplaints.filter(c => c.status === 'RESOLVED').length,
      avg_resolution_time: calculateAvgResolutionTime(wardComplaints.filter(c => c.status === 'RESOLVED')),
      hotspots: findHotspots(wardComplaints)
    }
  })
  
  return stats
}

// Calculate average resolution time for resolved complaints
const calculateAvgResolutionTime = (resolvedComplaints) => {
  if (resolvedComplaints.length === 0) return 0
  
  const totalTime = resolvedComplaints.reduce((sum, complaint) => {
    const created = new Date(complaint.created_at)
    const resolved = new Date(complaint.resolved_at || complaint.updated_at)
    return sum + (resolved - created)
  }, 0)
  
  return Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)) // Days
}

// Find complaint hotspots within a ward
const findHotspots = (complaints) => {
  // Simple clustering algorithm to find hotspots
  const hotspots = []
  const clustered = new Set()
  
  complaints.forEach((complaint, index) => {
    if (clustered.has(index)) return
    
    const nearby = complaints.filter((other, otherIndex) => {
      if (otherIndex === index || clustered.has(otherIndex)) return false
      const distance = calculateDistance(
        complaint.latitude, complaint.longitude,
        other.latitude, other.longitude
      )
      return distance <= 0.5 // 500m radius
    })
    
    if (nearby.length >= 3) { // At least 3 complaints in 500m
      hotspots.push({
        center: {
          lat: (complaint.latitude + nearby.reduce((sum, c) => sum + c.latitude, 0)) / (nearby.length + 1),
          lng: (complaint.longitude + nearby.reduce((sum, c) => sum + c.longitude, 0)) / (nearby.length + 1)
        },
        count: nearby.length + 1,
        complaints: [complaint, ...nearby]
      })
      
      clustered.add(index)
      nearby.forEach((_, i) => clustered.add(complaints.indexOf(nearby[i])))
    }
  })
  
  return hotspots
}

// Generate heatmap data for admin dashboard
export const generateHeatmapData = (complaints) => {
  return complaints
    .filter(c => c.latitude && c.longitude)
    .map(c => ({
      lat: c.latitude,
      lng: c.longitude,
      intensity: c.priority === 'URGENT' ? 1 : c.priority === 'HIGH' ? 0.7 : 0.4,
    }))
}

// Group complaints by ward
export const groupByWard = (complaints) => {
  return complaints.reduce((acc, complaint) => {
    const ward = complaint.ward || 'Unknown'
    if (!acc[ward]) {
      acc[ward] = []
    }
    acc[ward].push(complaint)
    return acc
  }, {})
}

// Export complaints to GeoJSON format
export const exportToGeoJSON = (complaints) => {
  return {
    type: 'FeatureCollection',
    features: complaints
      .filter(c => c.latitude && c.longitude)
      .map(c => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [c.longitude, c.latitude],
        },
        properties: {
          id: c.id,
          title: c.title,
          category: c.category,
          status: c.status,
          ward: c.ward,
          created_at: c.created_at,
        },
      })),
  }
}

// Enhanced exports with new functions
export default {
  MUMBAI_CENTER,
  DEFAULT_ZOOM,
  MUMBAI_BOUNDS,
  WARD_BOUNDARIES,
  MUMBAI_ZONES,
  createCustomIcon,
  createMarkerCluster,
  createWardBoundaryLayer,
  createHeatmapLayer,
  getWardFromCoordinates,
  getWardInfo,
  reverseGeocode,
  getCurrentLocation,
  watchLocation,
  isWithinMumbai,
  calculateDistance,
  calculateBearing,
  findNearbyComplaints,
  getWardStatistics,
  generateHeatmapData,
  groupByWard,
  exportToGeoJSON,
}
