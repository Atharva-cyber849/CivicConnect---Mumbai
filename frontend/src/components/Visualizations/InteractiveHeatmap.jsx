import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { MUMBAI_MAP_CONFIG, HEATMAP_CONFIG } from '../../utils/constants'
import {
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'

/**
 * InteractiveHeatmap Component
 * Visualizes complaint density across Mumbai using heatmap layer
 * Features: Real-time data, filters, legend, customizable settings
 */
const InteractiveHeatmap = ({
  complaints = [],
  title = 'Complaint Heatmap',
  filters = {},
  onFilterChange = () => {},
  height = '600px',
  showLegend = true,
  showFilters = true,
}) => {
  const mapRef = useRef(null)
  const heatmapRef = useRef(null)
  const [selectedFilters, setSelectedFilters] = useState(filters)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [wardBoundaries, setWardBoundaries] = useState(null)

  // Load ward boundaries GeoJSON
  useEffect(() => {
    fetch('/data/mumbai-wards.geojson')
      .then(res => res.json())
      .then(data => setWardBoundaries(data))
      .catch(() => setWardBoundaries(null))
  }, [])

  // Process complaints into heatmap data points
  const getHeatmapData = () => {
    return complaints
      .filter(complaint => {
        // Apply filters
        if (selectedFilters.category && complaint.category !== selectedFilters.category) {
          return false
        }
        if (selectedFilters.status && complaint.status !== selectedFilters.status) {
          return false
        }
        if (selectedFilters.department && complaint.department !== selectedFilters.department) {
          return false
        }
        if (selectedFilters.ward && complaint.ward !== selectedFilters.ward) {
          return false
        }
        return true
      })
      .map(complaint => [
        complaint.latitude,
        complaint.longitude,
        complaint.priority === 'URGENT' ? 1 : complaint.priority === 'HIGH' ? 0.75 : 0.5,
      ])
  }

  // Update heatmap when data changes
  useEffect(() => {
    if (!mapRef.current || !showHeatmap) return

    // Remove old heatmap layer
    if (heatmapRef.current) {
      mapRef.current.removeLayer(heatmapRef.current)
    }

    // Add new heatmap layer
    const heatData = getHeatmapData()
    if (heatData.length > 0) {
      heatmapRef.current = L.heatLayer(heatData, HEATMAP_CONFIG).addTo(
        mapRef.current
      )
    }
  }, [complaints, selectedFilters, showHeatmap])

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...selectedFilters, [filterKey]: value }
    setSelectedFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-lg transition-colors ${
              showHeatmap
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}
            title={showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          >
            {showHeatmap ? (
              <EyeIcon className="h-5 w-5" />
            ) : (
              <EyeSlashIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FunnelIcon className="h-4 w-4" />
            Filters
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                value={selectedFilters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="POTHOLE">Pothole</option>
                <option value="GARBAGE">Garbage</option>
                <option value="WATER">Water</option>
                <option value="STREETLIGHT">Street Light</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={selectedFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Priority
              </label>
              <select
                value={selectedFilters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedFilters({})
                  onFilterChange({})
                }}
                className="w-full px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative rounded-lg overflow-hidden border border-gray-200 shadow-md"
        style={{ height }}
      >
        <MapContainer
          center={MUMBAI_MAP_CONFIG.center}
          zoom={MUMBAI_MAP_CONFIG.defaultZoom}
          minZoom={MUMBAI_MAP_CONFIG.minZoom}
          maxZoom={MUMBAI_MAP_CONFIG.maxZoom}
          className="h-full w-full"
          ref={mapRef}
        >
          {/* Base Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Ward Boundaries */}
          {wardBoundaries && (
            <GeoJSON
              data={wardBoundaries}
              style={() => ({
                color: '#0078D7',
                weight: 1.5,
                opacity: 0.3,
                fillOpacity: 0.02,
              })}
            />
          )}
        </MapContainer>

        {/* Loading Indicator */}
        {complaints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading heatmap data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600 rounded"></div>
              <span className="text-sm text-gray-700">High Density</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Medium Density</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-lime-500 rounded"></div>
              <span className="text-sm text-gray-700">Low Density</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-700">Minimal Density</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Heatmap based on {getHeatmapData().length} complaints with applied filters
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-600">Total Complaints</div>
          <div className="text-2xl font-bold text-blue-900">{complaints.length}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="text-xs font-medium text-yellow-600">Hotspot Areas</div>
          <div className="text-2xl font-bold text-yellow-900">
            {getHeatmapData().length > 100 ? '🔥' : 'Low'}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="text-xs font-medium text-red-600">High Priority</div>
          <div className="text-2xl font-bold text-red-900">
            {complaints.filter(c => c.priority === 'URGENT').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-xs font-medium text-green-600">Resolved</div>
          <div className="text-2xl font-bold text-green-900">
            {complaints.filter(c => c.status === 'RESOLVED').length}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveHeatmap
