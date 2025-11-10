import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import { Icon, divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MUMBAI_MAP_CONFIG, COMPLAINT_STATUS } from '../../utils/constants'

// Fix for default markers
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons for different complaint statuses
const createStatusIcon = (status, count = null) => {
  const colors = {
    PENDING: '#FCD34D',
    IN_PROGRESS: '#3B82F6',
    RESOLVED: '#10B981',
    REJECTED: '#EF4444'
  }
  
  const color = colors[status] || '#6B7280'
  
  return divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${count > 1 ? '32px' : '24px'};
        height: ${count > 1 ? '32px' : '24px'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${count > 1 ? '12px' : '10px'};
      ">
        ${count > 1 ? count : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [count > 1 ? 32 : 24, count > 1 ? 32 : 24],
    iconAnchor: [count > 1 ? 16 : 12, count > 1 ? 32 : 24],
  })
}

// Component to fit map bounds
const FitBounds = ({ bounds }) => {
  const map = useMap()
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [map, bounds])
  
  return null
}

// Ward style function
const wardStyle = (feature) => {
  return {
    fillColor: '#0078D7',
    weight: 2,
    opacity: 1,
    color: '#0078D7',
    dashArray: '3',
    fillOpacity: 0.1
  }
}

// Ward popup content
const onEachWard = (feature, layer) => {
  if (feature.properties && feature.properties.name) {
    layer.bindPopup(`
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 8px 0; color: #0078D7; font-weight: bold;">
          Ward ${feature.properties.name}
        </h3>
        <p style="margin: 0; color: #666; font-size: 12px;">
          ${feature.properties.description || 'Mumbai Municipal Corporation Ward'}
        </p>
      </div>
    `)
  }
}

const MumbaiMap = ({ 
  complaints = [], 
  selectedWard = null,
  onComplaintClick = null,
  showWardBoundaries = true,
  height = '400px',
  center = MUMBAI_MAP_CONFIG.center,
  zoom = MUMBAI_MAP_CONFIG.defaultZoom
}) => {
  const [wardData, setWardData] = useState(null)
  const [mapBounds, setMapBounds] = useState(null)

  // Load Mumbai ward boundaries
  useEffect(() => {
    const loadWardData = async () => {
      try {
        const response = await fetch('/data/mumbai-wards.geojson')
        if (response.ok) {
          const data = await response.json()
          setWardData(data)
          
          // Calculate bounds for all wards
          if (data.features && data.features.length > 0) {
            const bounds = []
            data.features.forEach(feature => {
              if (feature.geometry && feature.geometry.coordinates) {
                // Handle different geometry types
                const coords = feature.geometry.coordinates
                if (feature.geometry.type === 'Polygon') {
                  coords[0].forEach(coord => bounds.push([coord[1], coord[0]]))
                } else if (feature.geometry.type === 'MultiPolygon') {
                  coords.forEach(polygon => {
                    polygon[0].forEach(coord => bounds.push([coord[1], coord[0]]))
                  })
                }
              }
            })
            setMapBounds(bounds)
          }
        }
      } catch (error) {
        console.error('Failed to load ward boundaries:', error)
      }
    }
    
    if (showWardBoundaries) {
      loadWardData()
    }
  }, [showWardBoundaries])

  // Group complaints by location for clustering
  const groupedComplaints = complaints.reduce((acc, complaint) => {
    if (!complaint.latitude || !complaint.longitude) return acc
    
    const key = `${complaint.latitude.toFixed(4)},${complaint.longitude.toFixed(4)}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(complaint)
    return acc
  }, {})

  // Filter ward data if specific ward is selected
  const filteredWardData = wardData && selectedWard ? {
    ...wardData,
    features: wardData.features.filter(feature => 
      feature.properties.name === selectedWard
    )
  } : wardData

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ward Boundaries */}
        {showWardBoundaries && filteredWardData && (
          <GeoJSON
            data={filteredWardData}
            style={wardStyle}
            onEachFeature={onEachWard}
          />
        )}
        
        {/* Complaint Markers */}
        {Object.entries(groupedComplaints).map(([key, clusterComplaints]) => {
          const [lat, lng] = key.split(',').map(Number)
          const mainComplaint = clusterComplaints[0]
          const count = clusterComplaints.length
          
          // Determine cluster status (prioritize pending/in-progress)
          const clusterStatus = clusterComplaints.find(c => c.status === 'PENDING')?.status ||
                              clusterComplaints.find(c => c.status === 'IN_PROGRESS')?.status ||
                              mainComplaint.status
          
          return (
            <Marker
              key={key}
              position={[lat, lng]}
              icon={createStatusIcon(clusterStatus, count)}
              eventHandlers={{
                click: () => {
                  if (onComplaintClick) {
                    onComplaintClick(count === 1 ? mainComplaint : clusterComplaints)
                  }
                }
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px', padding: '8px' }}>
                  {count === 1 ? (
                    // Single complaint
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#0078D7', fontSize: '14px' }}>
                        #{mainComplaint.id} - {mainComplaint.title}
                      </h3>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                        {mainComplaint.description.substring(0, 100)}...
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '10px',
                          backgroundColor: COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.color === 'yellow' ? '#FEF3C7' : 
                                         COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.color === 'blue' ? '#DBEAFE' :
                                         COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.color === 'green' ? '#D1FAE5' : '#FEE2E2',
                          color: COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.color === 'yellow' ? '#92400E' : 
                                COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.color === 'blue' ? '#1E40AF' :
                                COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.color === 'green' ? '#065F46' : '#991B1B'
                        }}>
                          {COMPLAINT_STATUS.find(s => s.value === mainComplaint.status)?.label}
                        </span>
                        <span style={{ fontSize: '10px', color: '#999' }}>
                          Ward {mainComplaint.ward}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Multiple complaints cluster
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#0078D7', fontSize: '14px' }}>
                        {count} Complaints in this area
                      </h3>
                      <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {clusterComplaints.slice(0, 3).map(complaint => (
                          <div key={complaint.id} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                              #{complaint.id} - {complaint.title}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666' }}>
                              {complaint.description.substring(0, 50)}...
                            </div>
                          </div>
                        ))}
                        {clusterComplaints.length > 3 && (
                          <div style={{ padding: '4px 0', fontSize: '10px', color: '#999', textAlign: 'center' }}>
                            +{clusterComplaints.length - 3} more complaints
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        {/* Fit bounds to show all data */}
        {mapBounds && !selectedWard && (
          <FitBounds bounds={mapBounds} />
        )}
      </MapContainer>
    </div>
  )
}

export default MumbaiMap