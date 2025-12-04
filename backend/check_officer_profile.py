#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Officer
from apps.departments.models import Department

User = get_user_model()

# Check admin user
try:
    user = User.objects.get(email='admin.roads@test.bmc.gov.in')
    print(f"✅ Admin user found: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   is_superuser: {user.is_superuser}")
    
    # Check if Officer profile exists
    try:
        officer = Officer.objects.get(user=user)
        print(f"✅ Officer profile exists")
        print(f"   Department: {officer.department}")
        print(f"   Assigned Ward: {officer.assigned_ward}")
        print(f"   Designation: {officer.designation}")
    except Officer.DoesNotExist:
        print(f"❌ No Officer profile found for this user")
        print(f"   Creating Officer profile...")
        
        # Get first department or create one
        dept = Department.objects.first()
        if not dept:
            print("   No departments found. Creating default department...")
            dept = Department.objects.create(name="Roads Department")
        
        # Create Officer profile
        officer = Officer.objects.create(
            user=user,
            department=dept,
            assigned_ward='A',
            role='ADMIN',
            designation='Department Administrator',
            phone='9999999999',
            email=user.email
        )
        print(f"✅ Officer profile created")
        print(f"   Department: {officer.department}")
        print(f"   Assigned Ward: {officer.assigned_ward}")
        
except User.DoesNotExist:
    print("❌ User not found!")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
