#!/usr/bin/env python
"""
Comprehensive script to check all available data in the CivicConnect database

Usage:
    python check_data.py
    
Or with Django shell:
    python manage.py shell
    >>> exec(open('check_data.py').read())
"""
import os
import sys
import django
import json
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from apps.departments.models import Department

User = get_user_model()

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_subsection(title):
    """Print a formatted subsection header"""
    print("\n" + "-" * 80)
    print(f"  {title}")
    print("-" * 80)

def format_date(date_obj):
    """Format datetime object to readable string"""
    if date_obj:
        return date_obj.strftime('%Y-%m-%d %H:%M:%S')
    return 'N/A'

# ============================================================================
# USERS & AUTHENTICATION
# ============================================================================
print_section("USERS & AUTHENTICATION DATA")

all_users = User.objects.all()
print(f"\n✓ Total Users: {all_users.count()}")

# Count by role
superusers = all_users.filter(is_superuser=True)
staff = all_users.filter(is_staff=True)
active = all_users.filter(is_active=True)

print(f"  - Superusers: {superusers.count()}")
print(f"  - Staff: {staff.count()}")
print(f"  - Active: {active.count()}")

if all_users.exists():
    print_subsection("User Details")
    for user in all_users[:10]:  # Show first 10
        print(f"\n  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.get_full_name()}")
        print(f"  Username: {user.username}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Superuser: {user.is_superuser}")
        print(f"  Is Active: {user.is_active}")
        print(f"  Created: {format_date(user.date_joined)}")
        print(f"  Last Login: {format_date(user.last_login)}")

# ============================================================================
# OFFICERS (Admin & Department Staff Users)
# ============================================================================
print_section("OFFICERS DATA (Admin & Department Staff)")

try:
    # Officers are users with ADMIN or DEPARTMENT_STAFF role
    all_officers = User.objects.filter(role__in=['ADMIN', 'DEPARTMENT_STAFF'])
    print(f"\n✓ Total Officers: {all_officers.count()}")
    
    if all_officers.exists():
        # Count by role
        admins = all_officers.filter(role='ADMIN')
        dept_staff = all_officers.filter(role='DEPARTMENT_STAFF')
        active_officers = all_officers.filter(is_active=True)
        
        print(f"  - Admins: {admins.count()}")
        print(f"  - Department Staff: {dept_staff.count()}")
        print(f"  - Active: {active_officers.count()}")
        
        print_subsection("Officer Details (First 10)")
        for officer in all_officers[:10]:
            print(f"\n  ID: {officer.id}")
            print(f"  Name: {officer.first_name} {officer.last_name}")
            print(f"  Email: {officer.email}")
            print(f"  Username: {officer.username}")
            print(f"  Phone: {officer.phone}")
            print(f"  Role: {officer.role}")
            print(f"  Is Active: {officer.is_active}")
            print(f"  Is Staff: {officer.is_staff}")
            print(f"  Is Superuser: {officer.is_superuser}")
            print(f"  Created: {format_date(officer.created_at)}")
            print(f"  Updated: {format_date(officer.updated_at)}")
except Exception as e:
    print(f"\n✗ Error fetching officers: {str(e)}")

# ============================================================================
# DEPARTMENTS
# ============================================================================
print_section("DEPARTMENTS DATA")

try:
    all_departments = Department.objects.all()
    print(f"\n✓ Total Departments: {all_departments.count()}")
    
    if all_departments.exists():
        print_subsection("Department Details")
        for dept in all_departments:
            print(f"\n  ID: {dept.id}")
            print(f"  Name: {dept.name}")
            print(f"  Code: {dept.code if hasattr(dept, 'code') else 'N/A'}")
            print(f"  Description: {dept.description if hasattr(dept, 'description') else 'N/A'}")
            print(f"  Is Active: {dept.is_active if hasattr(dept, 'is_active') else 'N/A'}")
            print(f"  Created: {format_date(dept.created_at if hasattr(dept, 'created_at') else None)}")
except Exception as e:
    print(f"\n✗ Error fetching departments: {str(e)}")

# ============================================================================
# COMPLAINTS
# ============================================================================
print_section("COMPLAINTS DATA")

all_complaints = Complaint.objects.all()
print(f"\n✓ Total Complaints: {all_complaints.count()}")

if all_complaints.exists():
    # Count by status
    print("\n  By Status:")
    statuses = all_complaints.values('status').distinct()
    for status in statuses:
        status_complaints = all_complaints.filter(status=status['status'])
        print(f"    - {status['status']}: {status_complaints.count()}")
    
    # Count by priority
    print("\n  By Priority:")
    priorities = all_complaints.values('priority').distinct()
    for priority in priorities:
        priority_complaints = all_complaints.filter(priority=priority['priority'])
        print(f"    - {priority['priority']}: {priority_complaints.count()}")
    
    # Count by category
    print("\n  By Category:")
    categories = all_complaints.values('category').distinct()
    for category in categories:
        category_complaints = all_complaints.filter(category=category['category'])
        print(f"    - {category['category']}: {category_complaints.count()}")
    
    # Count by ward
    print("\n  By Ward:")
    wards = all_complaints.values('ward').distinct()
    for ward in wards:
        ward_complaints = all_complaints.filter(ward=ward['ward'])
        print(f"    - {ward['ward']}: {ward_complaints.count()}")
    
    print_subsection("Complaint Details (First 5)")
    for complaint in all_complaints[:5]:
        print(f"\n  ID: {complaint.id}")
        print(f"  Title: {complaint.title}")
        desc = complaint.description[:100] + "..." if len(complaint.description) > 100 else complaint.description
        print(f"  Description: {desc}")
        print(f"  Status: {complaint.status}")
        print(f"  Priority: {complaint.priority}")
        print(f"  Category: {complaint.category}")
        print(f"  Ward: {complaint.ward}")
        print(f"  Address: {complaint.address}")
        print(f"  City: {complaint.city}")
        print(f"  State: {complaint.state}")
        print(f"  Zip Code: {complaint.zip_code}")
        print(f"  Latitude: {complaint.latitude}")
        print(f"  Longitude: {complaint.longitude}")
        print(f"  Citizen: {complaint.user.email if complaint.user else 'N/A'}")
        print(f"  Assigned To: {complaint.assigned_to.email if complaint.assigned_to else 'N/A'}")
        print(f"  Department: {complaint.department.name if complaint.department else 'N/A'}")
        print(f"  Admin Notes: {complaint.admin_notes[:50] + '...' if complaint.admin_notes and len(complaint.admin_notes) > 50 else complaint.admin_notes or 'N/A'}")
        print(f"  Created: {format_date(complaint.created_at)}")
        print(f"  Updated: {format_date(complaint.updated_at)}")
        print(f"  Resolved: {format_date(complaint.resolved_at) if complaint.resolved_at else 'N/A'}")
        
        # Check for image
        if complaint.image:
            print(f"  Image: {complaint.image.name}")

# ============================================================================
# SUMMARY STATISTICS
# ============================================================================
print_section("SUMMARY STATISTICS")

total_users = User.objects.count()
total_officers = User.objects.filter(role__in=['ADMIN', 'DEPARTMENT_STAFF']).count()
total_citizens = User.objects.filter(role='CITIZEN').count()
total_departments = Department.objects.count()
total_complaints = Complaint.objects.count()

print(f"\n✓ Total Users: {total_users}")
print(f"  - Citizens: {total_citizens}")
print(f"  - Officers/Admins: {total_officers}")
print(f"✓ Total Departments: {total_departments}")
print(f"✓ Total Complaints: {total_complaints}")

print("\n" + "=" * 80)
print("  DATA CHECK COMPLETE")
print("=" * 80 + "\n")
