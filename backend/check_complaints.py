#!/usr/bin/env python
"""
Script to check complaints in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from apps.complaints.serializers import ComplaintListSerializer
import json

User = get_user_model()

print("=" * 80)
print("DATABASE COMPLAINT CHECK")
print("=" * 80)

# Check total complaints
total = Complaint.objects.count()
print(f"\n✓ Total Complaints in DB: {total}")

if total > 0:
    print("\n" + "-" * 80)
    print("COMPLAINT DETAILS:")
    print("-" * 80)
    
    for complaint in Complaint.objects.all():
        print(f"\nID: {complaint.id}")
        print(f"Title: {complaint.title}")
        print(f"Status: {complaint.status}")
        print(f"Category: {complaint.category}")
        print(f"User: {complaint.user.email}")
        print(f"Address: {complaint.address}")
        print(f"Ward: {complaint.ward}")
        print(f"Created: {complaint.created_at}")
        
        # Check serializer output
        serializer = ComplaintListSerializer(complaint)
        print(f"\nSerialized Data:")
        print(json.dumps(serializer.data, indent=2, default=str))

# Check user-specific complaints
print("\n" + "=" * 80)
print("USER COMPLAINTS CHECK:")
print("=" * 80)

all_users = User.objects.filter(is_active=True)
for user in all_users:
    user_complaints = Complaint.objects.filter(user=user)
    if user_complaints.exists():
        print(f"\n✓ User: {user.email} ({user.get_full_name()})")
        print(f"  Complaints: {user_complaints.count()}")
        for complaint in user_complaints:
            print(f"    - [{complaint.id}] {complaint.title} ({complaint.status})")

print("\n" + "=" * 80)
