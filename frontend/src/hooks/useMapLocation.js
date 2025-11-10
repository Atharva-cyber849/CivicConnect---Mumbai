import { useState, useEffect, useCallback } from 'react';

// Custom hook for handling map location and geolocation
export const useMapLocation = (initialCenter = [19.0760, 72.8777]) => {
  const [location, setLocation] = useState({
    lat: initialCenter[0],
    lng: initialCenter[1]
  });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  // Get current position using browser geolocation
  const getCurrentPosition = useCallback(() => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setLoading(false);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            setPermissionStatus('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      options
    );
  }, []);

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAddress(data.display_name || 'Address not found');
      } else {
        setAddress('Unable to get address');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress('Unable to get address');
    }
  }, []);

  // Forward geocoding to get coordinates from address
  const geocodeAddress = useCallback(async (searchAddress) => {
    setLoading(true);
    setError(null);

    try {
      // Adding Mumbai bias to search
      const query = searchAddress.includes('Mumbai') ? searchAddress : `${searchAddress}, Mumbai, India`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=in`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const newLocation = { lat: parseFloat(lat), lng: parseFloat(lon) };
          
          setLocation(newLocation);
          setAddress(display_name);
          setLoading(false);
          
          return newLocation;
        } else {
          setError('Address not found');
          setLoading(false);
          return null;
        }
      } else {
        setError('Geocoding service unavailable');
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Unable to search address');
      setLoading(false);
      return null;
    }
  }, []);

  // Set location manually (from map click or selection)
  const setManualLocation = useCallback((lat, lng) => {
    setLocation({ lat, lng });
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  // Check if location is within Mumbai bounds
  const isWithinMumbai = useCallback((lat, lng) => {
    const mumbaiBounds = {
      north: 19.2720,
      south: 18.8920,
      east: 72.9781,
      west: 72.7758
    };

    return (
      lat >= mumbaiBounds.south &&
      lat <= mumbaiBounds.north &&
      lng >= mumbaiBounds.west &&
      lng <= mumbaiBounds.east
    );
  }, []);

  // Get distance between two points (in kilometers)
  const getDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }, []);

  // Check geolocation permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
      });
    }
  }, []);

  return {
    location,
    address,
    loading,
    error,
    permissionStatus,
    getCurrentPosition,
    geocodeAddress,
    setManualLocation,
    reverseGeocode,
    isWithinMumbai,
    getDistance,
    clearError: () => setError(null)
  };
};