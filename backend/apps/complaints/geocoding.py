import requests
import json
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# Mumbai ward mapping based on common area names
WARD_MAPPING = {
    'colaba': 'A', 'fort': 'A', 'navy nagar': 'A',
    'dongri': 'B', 'mazgaon': 'B', 'wadi bunder': 'B',
    'masjid': 'C', 'victoria dock': 'C',
    'tardeo': 'D', 'haj house': 'D', 'nagpada': 'D',
    'byculla': 'E',
    'matunga': 'F/N', 'mahim': 'F/N',
    'parel': 'F/S', 'sewri': 'F/S',
    'dadar': 'G/N',
    'worli': 'G/S', 'lower parel': 'G/S',
    'bandra east': 'H/E',
    'bandra west': 'H/W', 'bandra': 'H/W',
    'andheri east': 'K/E',
    'andheri west': 'K/W', 'andheri': 'K/W',
    'kurla': 'L',
    'chembur': 'M/E', 'chembur east': 'M/E',
    'chembur west': 'M/W',
    'ghatkopar': 'N',
    'malad': 'P/N',
    'goregaon': 'P/S',
    'borivali': 'R/C',
    'dahisar': 'R/N',
    'kandivali': 'R/S',
    'bhandup': 'S',
    'mulund': 'T',
}

def extract_ward_from_address(address):
    """Extract ward from address string."""
    if not address:
        return None
    
    address_lower = address.lower()
    
    # Check for ward mentions in address
    for area, ward in WARD_MAPPING.items():
        if area in address_lower:
            return ward
    
    # Try to extract ward code directly (e.g., "M/E Ward", "K/W Ward")
    ward_match = re.search(r'([A-Z]/[A-Z]|[A-Z])\s*(?:ward|ward zone)', address_lower)
    if ward_match:
        return ward_match.group(1)
    
    return None

@api_view(['GET'])
@permission_classes([AllowAny])
def reverse_geocode(request):
    """
    Enhanced reverse geocoding using Nominatim + Mumbai ward detection
    """
    try:
        lat = request.GET.get('lat')
        lon = request.GET.get('lon')
        
        if not lat or not lon:
            return Response({'error': 'Latitude and longitude are required'}, status=400)
        
        # Get address details from Nominatim
        url = 'https://nominatim.openstreetmap.org/reverse'
        params = {
            'format': 'json',
            'lat': lat,
            'lon': lon,
            'zoom': 18,
            'addressdetails': 1
        }
        
        headers = {
            'User-Agent': 'CivicConnect/1.0',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        osm_data = response.json()
        
        # Extract address components
        address = osm_data.get('address', {})
        full_address = osm_data.get('display_name', '')
        
        # Extract ward from address
        ward = extract_ward_from_address(full_address)
        
        result = {
            'full_address': full_address,
            'address_components': {
                'road': address.get('road', ''),
                'suburb': address.get('suburb', ''),
                'city': address.get('city', 'Mumbai'),
                'state': address.get('state', 'Maharashtra'),
                'postcode': address.get('postcode', ''),
                'country': address.get('country', 'India')
            },
            'ward': ward,
            'latitude': float(lat),
            'longitude': float(lon)
        }
        
        return Response(result)
        
    except requests.exceptions.Timeout:
        return Response({'error': 'Geocoding service timeout'}, status=504)
    except requests.exceptions.RequestException as e:
        return Response({'error': f'Geocoding service error: {str(e)}'}, status=502)
    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=500)