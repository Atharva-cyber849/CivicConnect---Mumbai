#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Check superadmin
try:
    super_admin = User.objects.get(email='superadmin@test.bmc.gov.in')
    print(f"✅ Superadmin found:")
    print(f"   Email: {super_admin.email}")
    print(f"   Role: {super_admin.role}")
    print(f"   is_superuser: {super_admin.is_superuser}")
    print(f"   is_staff: {super_admin.is_staff}")
except User.DoesNotExist:
    print("❌ Superadmin not found! Need to create test users.")
    print("   Run: python manage.py create_test_users --reset")
