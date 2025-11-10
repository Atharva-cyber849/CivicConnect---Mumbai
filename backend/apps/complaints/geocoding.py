import requests
import json
from pathlib import Path
from shapely.geometry import Point, Polygon
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes

def load_wards_data():
    """Load Mumbai wards GeoJSON data."""
    try:
        frontend_path = Path(__file__).parent.parent.parent.parent / 'frontend'
        wards_path = frontend_path / 'src' / 'config' / 'wardsData.json'
        
        with open(wards_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading wards data: {e}")
        return None

def find_ward(lat, lon, wards_data):
    """Find which ward a point belongs to."""
    if not wards_data:
        return None
        
    point = Point(float(lon), float(lat))
    
    for feature in wards_data['features']:
        try:
            coords = feature['geometry']['coordinates'][0]
            polygon = Polygon(coords)
            if polygon.contains(point):
                return feature['properties']
        except Exception as e:
            print(f"Error processing ward: {e}")
            continue
            
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
        url = f'https://nominatim.openstreetmap.org/reverse'
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
        
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        osm_data = response.json()
        
        # Find ward information
        wards_data = load_wards_data()
        ward_info = find_ward(float(lat), float(lon), wards_data) if wards_data else None
        
        # Extract address components
        address = osm_data.get('address', {})
        
        result = {
            'full_address': osm_data.get('display_name', ''),
            'address_components': {
                'road': address.get('road', ''),
                'suburb': address.get('suburb', ''),
                'city': 'Mumbai',  # Default to Mumbai
                'state': 'Maharashtra',  # Default to Maharashtra
                'postcode': address.get('postcode', ''),
                'country': 'India'
            },
            'ward': ward_info['ward_code'] if ward_info else None,
            'ward_name': ward_info['full_name'] if ward_info else None,
            'coordinates': {
                'latitude': float(lat),
                'longitude': float(lon)
            }
        }
        
        return Response(result)
        
    except requests.RequestException as e:
        return Response({'error': str(e)}, status=500)
    except Exception as e:
        return Response({'error': 'Internal server error'}, status=500)