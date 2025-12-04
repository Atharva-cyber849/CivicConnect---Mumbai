#!/usr/bin/env python
"""Check officer user credentials in database"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Check officer.bandra user
user = User.objects.get(email='officer.bandra@test.bmc.gov.in')
print(f"Email: {user.email}")
print(f"Name: {user.first_name} {user.last_name}")
print(f"Role: {user.role}")
print(f"Is Superuser: {user.is_superuser}")
print(f"Is Staff: {user.is_staff}")
print(f"Is Active: {user.is_active}")
print(f"Phone: {user.phone}")
