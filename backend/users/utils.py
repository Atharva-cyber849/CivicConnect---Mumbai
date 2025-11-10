from typing import Optional, TypeVar, Any, Union, cast, Type, TYPE_CHECKING
from django.contrib.auth import get_user_model
from django.db.models import Model, QuerySet
from rest_framework.request import Request
from django.contrib.auth.models import AnonymousUser

if TYPE_CHECKING:
    from .models import User as CustomUser
    User = CustomUser
else:
    User = get_user_model()

T = TypeVar('T')

def get_authenticated_user(request: Request) -> Optional['CustomUser']:
    """
    Safely get the authenticated user from a request, ensuring it's a User instance.
    Returns None if user is not authenticated or not found.
    """
    if not hasattr(request, 'user') or not request.user.is_authenticated:
        return None
        
    try:
        if isinstance(request.user, User):
            return request.user
        if not isinstance(request.user, AnonymousUser):
            return User.objects.get(id=request.user.id)
    except (User.DoesNotExist, AttributeError):
        pass
    return None

def safe_get_attr(obj: Any, attr: str, default: T = None) -> Union[Any, T]:
    """
    Safely get an attribute from an object.
    Returns default if the attribute doesn't exist or the object is None.
    
    Args:
        obj: The object to get the attribute from
        attr: The name of the attribute to get
        default: The default value to return if attribute doesn't exist
        
    Returns:
        The attribute value if it exists, otherwise the default value
    """
    if obj is None:
        return default
    try:
        return getattr(obj, attr, default)
    except (AttributeError, TypeError):
        return default

def ensure_user_type(user: Any) -> Optional['CustomUser']:
    """
    Ensure a user object is of the correct type.
    
    Args:
        user: Any object that might be a User
        
    Returns:
        User instance if valid, None otherwise
    """
    if isinstance(user, User):
        return user
    if hasattr(user, 'id'):
        try:
            return User.objects.get(id=user.id)
        except User.DoesNotExist:
            pass
    return None

def get_user_queryset(user: Optional['CustomUser'], base_queryset: QuerySet) -> QuerySet:
    """
    Get the appropriate queryset for a user based on their role.
    
    Args:
        user: The user to get the queryset for
        base_queryset: The base queryset to filter
        
    Returns:
        Filtered queryset based on user's role and permissions
    """
    if not user:
        return base_queryset.none()
        
    if safe_get_attr(user, 'is_superuser', False):
        return base_queryset.all()
        
    role = safe_get_attr(user, 'role')
    if role == 'super_admin':
        return base_queryset.all()
    elif role == 'admin':
        department = safe_get_attr(user, 'department')
        if department:
            return base_queryset.filter(department=department)
    elif role == 'officer':
        ward = safe_get_attr(user, 'ward')
        if ward:
            return base_queryset.filter(ward=ward)
            
    user_id = safe_get_attr(user, 'id')
    return base_queryset.filter(id=user_id)