"""
Mumbai-specific utilities for BMC ward and zone management.
"""

# Mumbai BMC Zone to Ward mapping
MUMBAI_ZONES = {
    'South': ['A', 'B', 'C', 'D', 'E', 'F/S'],
    'Central': ['F/N', 'G/S', 'G/N', 'H/E', 'H/W', 'K/E', 'K/W'],
    'Western': ['P/S', 'P/N', 'R/S', 'R/C', 'R/N'],
    'Eastern': ['L', 'M/E', 'M/W', 'N', 'S', 'T']
}

# Flatten to ward -> zone mapping
WARD_TO_ZONE = {}
for zone, wards in MUMBAI_ZONES.items():
    for ward in wards:
        WARD_TO_ZONE[ward] = zone

# All Mumbai wards
MUMBAI_WARDS = [
    'A', 'B', 'C', 'D', 'E', 'F/S', 'F/N', 'G/S', 'G/N', 
    'H/E', 'H/W', 'K/E', 'K/W', 'L', 'M/E', 'M/W', 
    'N', 'P/S', 'P/N', 'R/S', 'R/C', 'R/N', 'S', 'T'
]


def get_zone_for_ward(ward_code):
    """Get the zone for a given ward code."""
    return WARD_TO_ZONE.get(ward_code, 'Unknown')


def get_wards_for_zone(zone_name):
    """Get all wards in a given zone."""
    return MUMBAI_ZONES.get(zone_name, [])


def get_zone_filter_wards(zone_name):
    """Get list of ward codes for filtering by zone."""
    if zone_name == 'All' or not zone_name:
        return MUMBAI_WARDS
    return MUMBAI_ZONES.get(zone_name, [])


def is_valid_ward(ward_code):
    """Check if a ward code is valid."""
    return ward_code in MUMBAI_WARDS


def is_valid_zone(zone_name):
    """Check if a zone name is valid."""
    return zone_name in MUMBAI_ZONES or zone_name == 'All'
