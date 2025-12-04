"""
JWT serializers for user authentication.
"""
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from typing import Dict, Any, Union, Optional
from collections import OrderedDict

User = get_user_model()


def get_admin_tier(user) -> str:
    """
    Determine the admin tier based on role and is_superuser flag.
    Returns: 'super_admin', 'department_admin', 'bmc_officer', or 'citizen'
    """
    role = getattr(user, 'role', None)
    is_superuser = getattr(user, 'is_superuser', False)
    
    if role == 'ADMIN' and is_superuser:
        return 'super_admin'
    elif role == 'ADMIN' and not is_superuser:
        return 'department_admin'
    elif role == 'DEPARTMENT_STAFF':
        return 'bmc_officer'
    else:
        return 'citizen'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'] = serializers.EmailField()
        self.fields['password'] = serializers.CharField(write_only=True)
        self.fields.pop('username', None)  # Remove username field

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['role'] = getattr(user, 'role', None)
        token['admin_tier'] = get_admin_tier(user)
        return token

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # Convert email to username for authentication
        attrs['username'] = attrs.get('email')
        
        # Get tokens from parent class
        data = super().validate(attrs)
        
        # Ensure we have a user object
        if not hasattr(self, 'user') or not self.user:
            raise serializers.ValidationError('User not found')
        
        # Get department and ward information from Officer profile if exists
        department = None
        department_name = None
        assigned_ward = None
        designation = None
        try:
            if hasattr(self.user, 'officer_profile') and self.user.officer_profile:
                officer = self.user.officer_profile
                if officer.department:
                    department = str(officer.department.id)
                    department_name = officer.department.name
                assigned_ward = officer.assigned_ward
                designation = officer.designation
        except:
            pass
            
        # Convert OrderedDict to dict and add user data
        result: Dict[str, Any] = dict(data)
        result.update({
            'user': {
                'id': str(getattr(self.user, 'pk', '')),
                'email': getattr(self.user, 'email', ''),
                'first_name': getattr(self.user, 'first_name', ''),
                'last_name': getattr(self.user, 'last_name', ''),
                'role': getattr(self.user, 'role', None),
                'is_superuser': getattr(self.user, 'is_superuser', False),
                'admin_tier': get_admin_tier(self.user),  # Added: super_admin, department_admin, bmc_officer, citizen
                'has_accepted_terms': getattr(self.user, 'has_accepted_terms', False),
                'department': department,
                'department_name': department_name,
                'assigned_ward': assigned_ward,  # Added: for officers
                'designation': designation  # Added: officer designation
            }
        })
        return result