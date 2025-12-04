#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Update admin user to be superuser
try:
    user = User.objects.get(email='admin.roads@test.bmc.gov.in')
    user.is_superuser = True
    user.save()
    print(f"✅ Updated {user.email}")
    print(f"   Role: {user.role}")
    print(f"   is_superuser: {user.is_superuser}")
    print(f"   is_staff: {user.is_staff}")
except User.DoesNotExist:
    print("❌ User not found!")
except Exception as e:
    print(f"❌ Error: {e}")
