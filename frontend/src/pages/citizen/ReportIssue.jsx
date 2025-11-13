import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { toast } from 'react-toastify'
import debounce from 'lodash/debounce'
import {
  validateComplaintForm,
  validateImageFile,
  standardizeAddress,
  standardizeWardData,
  FILE_CONSTRAINTS
} from '../../utils/validation'
import { COMPLAINT_CATEGORIES, MUMBAI_WARDS } from '../../utils/constants'
import { MUMBAI_CENTER, DEFAULT_ZOOM, createCustomIcon, reverseGeocode, getCurrentLocation, isWithinMumbai } from '../../utils/mapUtils'
import { MapContainer, TileLayer, Marker, useMapEvents, GeoJSON } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default icon issues with bundlers
import 'leaflet/dist/leaflet.css'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// Lazy load wards GeoJSON from public data
const useWardBoundaries = () => {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/data/mumbai-wards.geojson')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => setData(null))
  }, [])
  return data
}

const LocationMarker = ({ onChange }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng)
    }
  })
  return null
}

const ReportIssue = () => {
  const navigate = useNavigate()
  const wardGeo = useWardBoundaries()
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [autoDetectedWard, setAutoDetectedWard] = useState('')
  const [markerPosition, setMarkerPosition] = useState(null)
  const mapRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ward: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '',
    latitude: '',
    longitude: '',
    image: null,
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [isAddressLoading, setIsAddressLoading] = useState(false)

  // Automatically fetch location on component mount
  useEffect(() => {
    handleUseMyLocation();
  }, []); // Empty dependency array ensures this runs only once on mount

  const createMutation = useMutation({
    mutationFn: complaintsApi.createComplaint,
    onSuccess: () => {
      toast.success('Issue reported successfully!')
      navigate('/dashboard/complaints')
    },
    onError: (error) => {
      console.error('Mutation error:', error)
      console.log('Error response:', error.response?.data)
      
      // Extract error details
      let errorMessage = 'Failed to submit report. Please try again.'
      
      if (error.response?.data) {
        const data = error.response.data
        
        // Handle different error formats
        if (data.detail) {
          errorMessage = data.detail
        } else if (data.message) {
          errorMessage = data.message
        } else if (typeof data === 'object') {
          // Build error message from field errors
          const messages = Object.entries(data)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}: ${value.join(', ')}`
              }
              return `${key}: ${value}`
            })
            .join('\n')
          errorMessage = messages || errorMessage
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.error('Final error message:', errorMessage)
      toast.error(errorMessage)
    }
  })

  const handleChange = async (e) => {
    const { name, value, files } = e.target
    setFormErrors(prev => ({ ...prev, [name]: null }))

    if (name === 'image' && files?.[0]) {
      try {
        await validateImageFile(files[0])
        setFormData({ ...formData, image: files[0] })
      } catch (error) {
        toast.error(error.message)
        setFormErrors(prev => ({ ...prev, image: error.message }))
        e.target.value = '' // Reset file input
      }
    } else if (name === 'address') {
      const standardized = standardizeAddress(value)
      setFormData(prev => ({ ...prev, [name]: standardized }))
      validateAddress(standardized)
    } else if (name === 'ward') {
      const standardized = standardizeWardData(value)
      setFormData(prev => ({ ...prev, [name]: standardized }))
    } else if (name === 'latitude' || name === 'longitude') {
      // Allow manual coordinate entry
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [name]: value }))
        
        // If both coordinates are provided, detect ward automatically
        if (name === 'latitude' && formData.longitude) {
          const lat = numValue
          const lng = parseFloat(formData.longitude)
          if (!isNaN(lng)) {
            handleCoordinateChange(lat, lng)
          }
        } else if (name === 'longitude' && formData.latitude) {
          const lat = parseFloat(formData.latitude)
          const lng = numValue
          if (!isNaN(lat)) {
            handleCoordinateChange(lat, lng)
          }
        }
      } else if (value === '') {
        // Allow clearing the field
        setFormData(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handle coordinate changes - detect ward and address
  const handleCoordinateChange = async (lat, lng) => {
    try {
      // Validate coordinates are within Mumbai
      if (!isWithinMumbai(lat, lng)) {
        setFormErrors(prev => ({
          ...prev,
          latitude: 'Coordinates must be within Mumbai',
          longitude: 'Coordinates must be within Mumbai'
        }))
        return
      }

      // Update marker position on map
      setMarkerPosition({ lat, lng })
      
      // Pan map to new location
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 15)
      }

      // Reverse geocode to get address and ward
      const geo = await reverseGeocode(lat, lng)
      
      setFormData(prev => ({
        ...prev,
        address: geo.address || prev.address,
        ward: geo.ward || prev.ward,
        zip_code: geo.zip_code || prev.zip_code,
      }))
      
      setAutoDetectedWard(geo.ward)
      setFormErrors(prev => ({ ...prev, latitude: null, longitude: null }))
    } catch (error) {
      console.error('Error detecting ward from coordinates:', error)
      // Still allow manual entry even if geocoding fails
    }
  }
  
  // Debounced address validation (removed - using reverseGeocode in handleMapClick instead)
  const validateAddress = useCallback(
    debounce(async (address, lat, lng) => {
      if (!address || !lat || !lng) return
      
      setIsAddressLoading(true)
      try {
        const geo = await reverseGeocode(lat, lng)
        
        if (!geo.ward) {
          setFormErrors(prev => ({
            ...prev,
            address: 'Address must be within Mumbai municipal boundaries'
          }))
          return
        }

        setFormData(prev => ({
          ...prev,
          ward: geo.ward,
          zip_code: geo.zip_code,
        }));
        setAutoDetectedWard(geo.ward)
        setFormErrors(prev => ({ ...prev, address: null, ward: null }))
      } catch (error) {
        setFormErrors(prev => ({
          ...prev,
          address: 'Could not validate address'
        }))
      } finally {
        setIsAddressLoading(false)
      }
    }, 1000),
    []
  )

  const handleMapClick = async (latlng) => {
    setMarkerPosition(latlng)
    
    // Reverse geocode immediately
    try {
      const geo = await reverseGeocode(latlng.lat, latlng.lng)
      
      // Update all form data with reverse geocode results
      setFormData(prev => ({
        ...prev,
        latitude: latlng.lat,
        longitude: latlng.lng,
        address: geo.address || '',
        city: geo.city || 'Mumbai',
        state: geo.state || 'Maharashtra',
        zip_code: geo.zip_code || '',
        ward: geo.ward || prev.ward,
      }))
      
      setAutoDetectedWard(geo.ward)
      setFormErrors(prev => ({ ...prev, address: null, ward: null }))
    } catch (error) {
      console.error('Geocoding failed:', error)
      // Still update coordinates even if geocoding fails
      setFormData(prev => ({
        ...prev,
        latitude: latlng.lat,
        longitude: latlng.lng,
      }))
      toast.error('Could not fetch address details. Please enter manually.')
    }
  };

  const handleUseMyLocation = async () => {
    setLoadingLocation(true)
    try {
      const loc = await getCurrentLocation()
      if (!isWithinMumbai(loc.lat, loc.lng)) {
        toast.error('Selected location appears outside Mumbai bounds.')
      }
      handleMapClick({ lat: loc.lat, lng: loc.lng })
      toast.success('Location detected!')
      if (mapRef.current) {
        mapRef.current.setView([loc.lat, loc.lng], 15)
      }
    } catch (err) {
      toast.error('Failed to get current location.')
    } finally {
      setLoadingLocation(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const { isValid, errors } = validateComplaintForm(formData)
    if (!isValid) {
      console.log('Validation errors:', errors)
      setFormErrors(errors)
      const firstError = Object.values(errors)[0]
      toast.error(firstError)
      return
    }

    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      toast.error('Please select a location on the map')
      return
    }

    // Log form data for debugging
    console.log('Form data before submit:', {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ward: formData.ward,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      latitude: formData.latitude,
      longitude: formData.longitude,
      image: formData.image ? `File: ${formData.image.name}` : 'No image'
    })

    const dataToSubmit = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ward: standardizeWardData(formData.ward),
      address: standardizeAddress(formData.address),
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      image: formData.image,
    };

    console.log('Data to submit:', dataToSubmit)

    try {
      createMutation.mutate(dataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        Object.entries(error.response?.data || {})
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ') ||
        'Failed to submit report. Please try again.';
      toast.error(errorMessage);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Report an Issue</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map & Image Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">📍 Location</h2>
            <div className="h-72 relative rounded-lg overflow-hidden">
              <MapContainer
                center={MUMBAI_CENTER}
                zoom={DEFAULT_ZOOM}
                minZoom={10}
                maxZoom={18}
                className="h-full w-full"
                whenCreated={(map) => (mapRef.current = map)}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {wardGeo && (
                  <GeoJSON
                    data={wardGeo}
                    style={() => ({
                      color: '#0078D7',
                      weight: 1,
                      fillOpacity: 0.05,
                    })}
                    onEachFeature={(feature, layer) => {
                      layer.bindPopup(`${feature.properties.ward_code} - ${feature.properties.ward_name}`)
                    }}
                  />
                )}
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    icon={createCustomIcon(formData.category || 'OTHER', 'PENDING')}
                    draggable
                    eventHandlers={{
                      dragend: (e) => {
                        const latlng = e.target.getLatLng()
                        handleMapClick(latlng)
                      }
                    }}
                  />
                )}
                <LocationMarker onChange={handleMapClick} />
              </MapContainer>
              {!markerPosition && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="bg-white/80 px-4 py-2 rounded text-sm text-gray-700">Click on the map to select location</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={loadingLocation}
                className="btn btn-secondary"
              >
                {loadingLocation ? 'Detecting...' : 'Use My Location'}
              </button>
              {autoDetectedWard && (
                <span className="text-sm text-gray-600">Auto-detected ward: <strong>{autoDetectedWard}</strong></span>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">📷 Photo</h2>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center 
              ${formErrors.image ? 'border-red-500' : 'border-gray-300'}`}
            >
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="hidden"
                accept={FILE_CONSTRAINTS.image.allowedTypes.join(',')}
                id="image-upload"
              />
              <label 
                htmlFor="image-upload" 
                className="cursor-pointer block"
              >
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Click to upload photo</div>
                  <div className="text-xs text-gray-500">
                    {FILE_CONSTRAINTS.image.allowedTypes.map(type => type.split('/')[1]).join('/')}{' '}
                    up to {FILE_CONSTRAINTS.image.maxSize / (1024 * 1024)}MB
                  </div>
                </div>
              </label>
            </div>
            
            {formErrors.image && (
              <p className="mt-2 text-sm text-red-600">{formErrors.image}</p>
            )}

            {formData.image && (
              <div className="mt-4 relative">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="rounded-lg shadow w-full object-cover h-40"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: null }))
                    setFormErrors(prev => ({ ...prev, image: null }))
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Column */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2 card">
          <div>
            <label className="block text-sm font-medium mb-2">Issue Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input ${formErrors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Pothole on Main Street"
              required
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input ${formErrors.category ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select a category</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ward *</label>
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select ward</option>
              {MUMBAI_WARDS.map(w => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
            {autoDetectedWard && formData.ward !== autoDetectedWard && (
              <p className="text-xs text-gray-500 mt-1">Suggested ward: {autoDetectedWard}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="4"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address *</label>
            <div className="relative">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`input ${formErrors.address ? 'border-red-500' : ''}`}
                placeholder="Street address or location name"
                required
              />
              {isAddressLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {formErrors.address && (
              <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Auto-detected from map or enter manually</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                className="input bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                className="input bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">ZIP Code *</label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className={`input ${formErrors.zip_code ? 'border-red-500' : ''}`}
                required
              />
              {formErrors.zip_code && (
                <p className="mt-1 text-sm text-red-600">{formErrors.zip_code}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Latitude *</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className={`input ${formErrors.latitude ? 'border-red-500' : ''}`}
                placeholder="e.g., 19.0760"
                required
              />
              {formErrors.latitude && (
                <p className="mt-1 text-sm text-red-600">{formErrors.latitude}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Click on map or enter manually</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Longitude *</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className={`input ${formErrors.longitude ? 'border-red-500' : ''}`}
                placeholder="e.g., 72.8777"
                required
              />
              {formErrors.longitude && (
                <p className="mt-1 text-sm text-red-600">{formErrors.longitude}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Click on map or enter manually</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportIssue
