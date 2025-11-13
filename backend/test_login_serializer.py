#!/usr/bin/env python
"""
Test the login endpoint to verify is_superuser is returned
"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.serializers_jwt import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Get superadmin
super_admin = User.objects.get(email='superadmin@test.bmc.gov.in')

print("=" * 80)
print("LOGIN ENDPOINT RESPONSE TEST")
print("=" * 80)

print(f"\n✓ User found:")
print(f"  Email: {super_admin.email}")
print(f"  Role: {super_admin.role}")
print(f"  is_superuser (from DB): {super_admin.is_superuser}")

# Simulate login serializer
print(f"\n✓ Testing serializer...")
serializer_data = {
    'email': 'superadmin@test.bmc.gov.in',
    'password': 'admin123'
}

serializer = CustomTokenObtainPairSerializer(data=serializer_data)

if serializer.is_valid():
    validated_data = serializer.validated_data
    print(f"\n✓ Serializer validation successful!")
    print(f"\nResponse that would be sent to client:")
    print(json.dumps({
        'user': validated_data.get('user'),
        'access': validated_data.get('access')[:50] + '...',
        'refresh': validated_data.get('refresh')[:50] + '...'
    }, indent=2))
    
    # Check if is_superuser is in response
    user_in_response = validated_data.get('user')
    if 'is_superuser' in user_in_response:
        print(f"\n✅ SUCCESS: is_superuser is in the response!")
        print(f"   Value: {user_in_response['is_superuser']}")
    else:
        print(f"\n❌ ERROR: is_superuser is NOT in the response!")
        print(f"   Available fields: {list(user_in_response.keys())}")
else:
    print(f"\n❌ Serializer validation failed!")
    print(f"   Errors: {serializer.errors}")

print("\n" + "=" * 80)
