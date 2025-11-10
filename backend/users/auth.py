from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from .utils import safe_get_attr

User = get_user_model()

class EmailPhoneBackend:
    """
    Authenticate using email or phone number
    """
    def authenticate(self, request, username=None, password=None):
        try:
            # Try to fetch the user by email or phone
            user = User.objects.get(
                Q(email=username) | Q(phone=username)
            )
            
            # Check password and account status
            if password and user.check_password(password):
                if safe_get_attr(user, 'status') != 'active':
                    return None
                
                # Update login tracking
                user.last_login = timezone.now()
                if request:
                    last_login_ip = self.get_client_ip(request)
                    if hasattr(user, 'last_login_ip'):
                        setattr(user, 'last_login_ip', last_login_ip)
                    
                    # Record login history if available
                    login_history = safe_get_attr(user, 'login_history')
                    if login_history:
                        login_history.create(
                            ip_address=last_login_ip,
                            user_agent=request.META.get('HTTP_USER_AGENT', ''),
                            was_successful=True
                        )
                
                if hasattr(user, 'failed_login_attempts'):
                    setattr(user, 'failed_login_attempts', 0)
                user.save()
                
                return user
                
            # Record failed attempt
            failed_attempts = safe_get_attr(user, 'failed_login_attempts', 0)
            if hasattr(user, 'failed_login_attempts'):
                setattr(user, 'failed_login_attempts', failed_attempts + 1)
            
            # Auto-suspend account after 5 failed attempts
            if failed_attempts >= 5:
                if hasattr(user, 'status'):
                    setattr(user, 'status', 'suspended')
                
            user.save()
            
            if request:
                login_history = safe_get_attr(user, 'login_history')
                if login_history:
                    login_history.create(
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        was_successful=False,
                        failure_reason='Invalid password'
                    )
                
        except User.DoesNotExist:
            return None
            
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
            
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip