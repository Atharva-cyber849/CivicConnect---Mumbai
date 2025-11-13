#!/usr/bin/env python
"""
Simulate what the frontend API call will receive
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from apps.complaints.serializers import ComplaintListSerializer

User = get_user_model()

print("=" * 80)
print("SIMULATING API RESPONSE FOR FRONTEND")
print("=" * 80)

# Get the test user
user = User.objects.filter(email='neha.kulkarni@citizen.test').first()

if not user:
    print("\n❌ User not found!")
else:
    print(f"\n✓ User: {user.email} ({user.get_full_name()})")
    print(f"  Authenticated: {user.is_active}")
    is_admin = getattr(user, 'is_admin', False)
    print(f"  Admin: {is_admin}")
    
    # Get user's complaints
    complaints = Complaint.objects.filter(user=user)
    print(f"\n✓ User's Complaints: {complaints.count()}")
    
    # Serialize them
    serializer = ComplaintListSerializer(complaints, many=True)
    
    # Format as API response
    api_response = {
        "data": {
            "results": serializer.data
        }
    }
    
    print("\n" + "-" * 80)
    print("API RESPONSE FORMAT (what backend returns):")
    print("-" * 80)
    print(json.dumps(api_response, indent=2, default=str))
    
    print("\n" + "-" * 80)
    print("COMPLAINT OBJECTS STRUCTURE:")
    print("-" * 80)
    for complaint in complaints:
        print(f"\nComplaint ID: {complaint.id}")
        print(f"  - title: {complaint.title}")
        print(f"  - category: {complaint.category}")
        print(f"  - status: {complaint.status}")
        print(f"  - address: {complaint.address}")
        print(f"  - ward: {complaint.ward}")
        print(f"  - created_at: {complaint.created_at}")
        print(f"  - image: {complaint.image}")

print("\n" + "=" * 80)
