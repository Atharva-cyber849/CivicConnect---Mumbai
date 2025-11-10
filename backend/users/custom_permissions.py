from typing import Any, TypeVar, Type, TYPE_CHECKING, Optional
from rest_framework.permissions import BasePermission as DRFBasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

if TYPE_CHECKING:
    from .models import User

T = TypeVar('T')

class BasePermission(DRFBasePermission):
    """
    Base class for custom permissions that allows boolean return types
    """
    def has_permission(self, request: Request, view: APIView) -> bool:
        return True

    def has_object_permission(self, request: Request, view: APIView, obj: Any) -> bool:
        return True