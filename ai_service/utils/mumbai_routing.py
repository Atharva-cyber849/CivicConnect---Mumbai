"""
Mumbai-specific utilities for complaint routing and ward assignment.
Implements BMC (Brihanmumbai Municipal Corporation) business logic.
"""
from typing import Dict, List, Tuple, Optional
import re
from geopy.distance import geodesic


class MumbaiWardRouter:
    """Mumbai ward-based routing system."""
    
    # Mumbai ward boundaries (simplified - in production use proper GeoJSON)
    WARD_COORDINATES = {
        'A': [(18.9067, 72.8147), (18.9289, 72.8364)],  # Colaba
        'B': [(18.9289, 72.8364), (18.9400, 72.8500)],  # Dongri
        'C': [(18.9400, 72.8500), (18.9500, 72.8600)],  # Kalbadevi
        'D': [(18.9500, 72.8600), (18.9700, 72.8700)],  # Girgaon
        'E': [(18.9700, 72.8700), (18.9900, 72.8800)],  # Byculla
        'F/N': [(18.9900, 72.8800), (19.0200, 72.8600)],  # Matunga
        'F/S': [(19.0000, 72.8400), (19.0300, 72.8700)],  # Sewri
        'G/N': [(19.0200, 72.8600), (19.0400, 72.8500)],  # Dadar
        'G/S': [(19.0000, 72.8200), (19.0300, 72.8400)],  # Parel
        'H/E': [(19.0500, 72.8600), (19.0700, 72.8800)],  # Bandra East
        'H/W': [(19.0500, 72.8200), (19.0700, 72.8400)],  # Bandra West
        'K/E': [(19.1000, 72.8500), (19.1300, 72.8900)],  # Andheri East
        'K/W': [(19.1000, 72.8000), (19.1300, 72.8400)],  # Andheri West
        'L': [(19.0700, 72.8700), (19.1000, 72.9000)],   # Kurla
        'M/E': [(19.0500, 72.9000), (19.0800, 72.9200)], # Chembur
        'M/W': [(19.0800, 72.8700), (19.1100, 72.9000)], # Ghatkopar
        'N': [(19.0800, 72.8700), (19.1200, 72.9000)],   # Ghatkopar
        'P/N': [(19.1800, 72.8200), (19.2100, 72.8600)], # Malad
        'P/S': [(19.1500, 72.8300), (19.1800, 72.8600)], # Goregaon
        'R/N': [(19.2100, 72.8300), (19.2600, 72.8700)], # Borivali
        'R/C': [(19.2600, 72.8400), (19.2900, 72.8800)], # Dahisar
        'R/S': [(19.1900, 72.8300), (19.2200, 72.8600)], # Kandivali
        'S': [(19.1000, 72.9000), (19.1300, 72.9300)],   # Vikhroli
        'T': [(19.1300, 72.9300), (19.1800, 72.9700)],   # Mulund
    }
    
    # Department routing based on category
    CATEGORY_DEPARTMENT_MAPPING = {
        'POTHOLE': 'ROADS',
        'ROAD_DAMAGE': 'ROADS',
        'TRAFFIC_SIGNAL': 'ROADS',
        'MANHOLE': 'ROADS',
        'GARBAGE': 'SOLID_WASTE',
        'GARBAGE_BIN': 'SOLID_WASTE',
        'ILLEGAL_DUMPING': 'SOLID_WASTE',
        'WATER_LEAKAGE': 'WATER_SUPPLY',
        'WATER_SUPPLY': 'WATER_SUPPLY',
        'SEWAGE_OVERFLOW': 'SEWAGE',
        'DRAINAGE_BLOCK': 'SEWAGE',
        'STREETLIGHT': 'STREETLIGHTS',
        'PARK_DAMAGE': 'GARDENS',
        'ENCROACHMENT': 'ENCROACHMENT',
        'STRAY_ANIMALS': 'HEALTH',
        'MOSQUITO': 'HEALTH',
        'OTHER': 'OTHER'
    }
    
    # Priority escalation based on keywords
    PRIORITY_KEYWORDS = {
        'URGENT': [
            'emergency', 'urgent', 'danger', 'blocked', 'overflow', 'burst',
            'emergency', 'urgent', 'धोका', 'आपातकाल', 'तातडीची'
        ],
        'HIGH': [
            'major', 'severe', 'big', 'large', 'serious', 'bad',
            'मोठा', 'गंभीर', 'खराब'
        ],
        'MEDIUM': [
            'moderate', 'medium', 'regular', 'normal', 'मध्यम', 'सामान्य'
        ]
    }
    
    @classmethod
    def determine_ward_from_coordinates(cls, latitude: float, longitude: float) -> Optional[str]:
        """
        Determine Mumbai ward based on coordinates.
        In production, this should use proper point-in-polygon algorithms with GeoJSON.
        """
        point = (latitude, longitude)
        min_distance = float('inf')
        closest_ward = None
        
        for ward, (sw, ne) in cls.WARD_COORDINATES.items():
            # Calculate center of ward
            center = ((sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2)
            distance = geodesic(point, center).kilometers
            
            if distance < min_distance:
                min_distance = distance
                closest_ward = ward
        
        return closest_ward
    
    @classmethod
    def determine_ward_from_address(cls, address: str) -> Optional[str]:
        """
        Determine ward from address text using location keywords.
        """
        address_lower = address.lower()
        
        # Ward-specific location mappings
        location_mappings = {
            'A': ['colaba', 'fort', 'navy nagar', 'cuffe parade'],
            'B': ['dongri', 'mazgaon', 'wadi bunder'],
            'C': ['kalbadevi', 'bhuleshwar', 'mumbadevi'],
            'D': ['girgaon', 'tardeo', 'breach candy'],
            'E': ['byculla', 'nagpada', 'agripada'],
            'F/N': ['matunga', 'mahim', 'dharavi'],
            'F/S': ['sewri', 'cotton green'],
            'G/N': ['dadar', 'shivaji park'],
            'G/S': ['parel', 'lower parel', 'worli'],
            'H/E': ['bandra east', 'khar east'],
            'H/W': ['bandra west', 'khar west', 'santa cruz'],
            'K/E': ['andheri east', 'chakala', 'marol'],
            'K/W': ['andheri west', 'juhu', 'versova'],
            'L': ['kurla', 'kalina', 'bkc'],
            'M/E': ['chembur', 'govandi'],
            'M/W': ['ghatkopar west', 'vikhroli west'],
            'N': ['ghatkopar', 'powai'],
            'P/N': ['malad', 'kurar'],
            'P/S': ['goregaon', 'film city'],
            'R/N': ['borivali', 'dahisar'],
            'R/C': ['dahisar', 'mira road'],
            'R/S': ['kandivali', 'charkop'],
            'S': ['vikhroli', 'kanjurmarg'],
            'T': ['mulund', 'nahur'],
        }
        
        for ward, locations in location_mappings.items():
            for location in locations:
                if location in address_lower:
                    return ward
        
        return None
    
    @classmethod
    def get_department_from_category(cls, category: str) -> str:
        """Get BMC department for complaint category."""
        return cls.CATEGORY_DEPARTMENT_MAPPING.get(category, 'OTHER')
    
    @classmethod
    def determine_priority(cls, description: str, category: str) -> str:
        """
        Determine complaint priority based on description and category.
        """
        description_lower = description.lower()
        
        # Check for urgent keywords
        for keyword in cls.PRIORITY_KEYWORDS['URGENT']:
            if keyword in description_lower:
                return 'URGENT'
        
        # Category-based priority rules
        urgent_categories = ['SEWAGE_OVERFLOW', 'WATER_SUPPLY', 'MANHOLE']
        high_categories = ['POTHOLE', 'WATER_LEAKAGE', 'TRAFFIC_SIGNAL']
        
        if category in urgent_categories:
            return 'URGENT'
        elif category in high_categories:
            return 'HIGH'
        
        # Check for high priority keywords
        for keyword in cls.PRIORITY_KEYWORDS['HIGH']:
            if keyword in description_lower:
                return 'HIGH'
        
        # Check for medium priority keywords
        for keyword in cls.PRIORITY_KEYWORDS['MEDIUM']:
            if keyword in description_lower:
                return 'MEDIUM'
        
        return 'LOW'
    
    @classmethod
    def route_complaint(cls, 
                       category: str,
                       description: str,
                       latitude: Optional[float] = None,
                       longitude: Optional[float] = None,
                       address: str = "") -> Dict[str, str]:
        """
        Complete complaint routing for Mumbai BMC.
        
        Returns:
            Dict with ward, department, and priority
        """
        # Determine ward
        ward = None
        if latitude and longitude:
            ward = cls.determine_ward_from_coordinates(latitude, longitude)
        
        if not ward and address:
            ward = cls.determine_ward_from_address(address)
        
        # Fallback ward determination
        if not ward:
            ward = 'A'  # Default to ward A
        
        # Get department
        department = cls.get_department_from_category(category)
        
        # Determine priority
        priority = cls.determine_priority(description, category)
        
        return {
            'ward': ward,
            'department': department,
            'priority': priority
        }
    
    @classmethod
    def get_ward_info(cls, ward: str) -> Dict[str, str]:
        """Get detailed information about a Mumbai ward."""
        ward_info = {
            'A': {
                'name': 'A Ward',
                'area': 'Colaba, Fort, Navy Nagar',
                'zone': 'South Mumbai',
                'population': '~85,000'
            },
            'B': {
                'name': 'B Ward', 
                'area': 'Dongri, Mazgaon, Wadi Bunder',
                'zone': 'South Mumbai',
                'population': '~180,000'
            },
            # Add more ward details as needed...
        }
        
        return ward_info.get(ward, {
            'name': f'{ward} Ward',
            'area': 'Mumbai',
            'zone': 'Mumbai',
            'population': 'Unknown'
        })
    
    @classmethod
    def validate_mumbai_coordinates(cls, latitude: float, longitude: float) -> bool:
        """
        Check if coordinates are within Mumbai boundaries.
        """
        # Mumbai approximate boundaries
        mumbai_bounds = {
            'north': 19.2700,
            'south': 18.8900,
            'east': 72.9800,
            'west': 72.7760
        }
        
        return (mumbai_bounds['south'] <= latitude <= mumbai_bounds['north'] and
                mumbai_bounds['west'] <= longitude <= mumbai_bounds['east'])


def enhance_prediction_with_mumbai_routing(prediction_result: dict, 
                                         complaint_data: dict) -> dict:
    """
    Enhance AI prediction with Mumbai-specific routing information.
    
    Args:
        prediction_result: Result from AI prediction
        complaint_data: Additional complaint information
        
    Returns:
        Enhanced prediction with routing information
    """
    category = prediction_result.get('predicted_category', 'OTHER')
    description = complaint_data.get('description', '')
    latitude = complaint_data.get('latitude')
    longitude = complaint_data.get('longitude')
    address = complaint_data.get('address', '')
    
    # Get Mumbai routing information
    routing_info = MumbaiWardRouter.route_complaint(
        category=category,
        description=description,
        latitude=latitude,
        longitude=longitude,
        address=address
    )
    
    # Add ward information
    ward_info = MumbaiWardRouter.get_ward_info(routing_info['ward'])
    
    # Enhance the prediction result
    enhanced_result = {
        **prediction_result,
        'routing': {
            'ward': routing_info['ward'],
            'department': routing_info['department'],
            'priority': routing_info['priority'],
            'ward_info': ward_info
        },
        'mumbai_specific': True
    }
    
    return enhanced_result