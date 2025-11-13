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
        return token

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # Convert email to username for authentication
        attrs['username'] = attrs.get('email')
        
        # Get tokens from parent class
        data = super().validate(attrs)
        
        # Ensure we have a user object
        if not hasattr(self, 'user') or not self.user:
            raise serializers.ValidationError('User not found')
            
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
                'has_accepted_terms': getattr(self.user, 'has_accepted_terms', False)
            }
        })
        return result