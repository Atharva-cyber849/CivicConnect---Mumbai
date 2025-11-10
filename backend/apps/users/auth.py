"""
Custom authentication backend for email-based login.
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

class EmailAuthBackend(ModelBackend):
    """
    Custom authentication backend that allows login with email.
    """
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        if not password:
            return None
            
        try:
            # Try to fetch the user by email
            user = User.objects.get(
                Q(email=email) if email else Q(email=username)
            )
            
            # Check the password
            if user.check_password(str(password)):
                return user
            return None
            
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None