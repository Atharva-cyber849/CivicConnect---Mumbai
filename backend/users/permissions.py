from typing import Any, cast, TypeVar, TYPE_CHECKING
from django.http import HttpRequest
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.request import Request
from .custom_permissions import BasePermission
from .utils import safe_get_attr

if TYPE_CHECKING:
    from .models import User

class IsSuperAdmin(BasePermission):
    """
    Allow access only to super admin users.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and safe_get_attr(request.user, 'role') == 'super_admin')

class IsAdminUser(BasePermission):
    """
    Allow access only to admin users.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and safe_get_attr(request.user, 'role') == 'admin')

class IsOfficerUser(BasePermission):
    """
    Allow access only to officer users.
    """
    def has_permission(self, request, view) -> bool:
        return bool(request.user and safe_get_attr(request.user, 'role') == 'officer')

class IsCitizenUser(BasePermission):
    """
    Allow access only to citizen users.
    """
    def has_permission(self, request, view):
        return bool(request.user and safe_get_attr(request.user, 'role') == 'citizen')

class CanManageDepartmentUsers(BasePermission):
    """
    Allow department admins to manage users in their department
    """
    def has_object_permission(self, request, view, obj):
        # Allow access if user is admin and target user is in their department
        if safe_get_attr(request.user, 'role') == 'admin':
            return safe_get_attr(obj, 'department') == safe_get_attr(request.user, 'department')
        return False

class CanManageWardUsers(BasePermission):
    """
    Allow ward officers to manage citizens in their ward
    """
    def has_object_permission(self, request, view, obj):
        # Allow access if user is officer and target user is citizen in their ward
        if safe_get_attr(request.user, 'role') == 'officer':
            return safe_get_attr(obj, 'role') == 'citizen' and safe_get_attr(obj, 'ward') == safe_get_attr(request.user, 'ward')
        return False

class IsOwnerOrAdmin(BasePermission):
    """
    Allow owners of an object to edit it, or admins.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admin/super_admin can edit any object
        if safe_get_attr(request.user, 'is_admin', False):
            return True

        # Instance must have an attribute named `user`
        return safe_get_attr(obj, 'user') == request.user

class CanViewWardData(BasePermission):
    """
    Allow users to view data from their assigned ward
    """
    def has_permission(self, request, view):
        # Super admin can view all wards
        if safe_get_attr(request.user, 'role') == 'super_admin':
            return True

        # Check if ward parameter matches user's ward
        ward = request.query_params.get('ward')
        if not ward:
            return True
            
        return ward == safe_get_attr(request.user, 'ward')

class CanViewDepartmentData(BasePermission):
    """
    Allow users to view data from their department
    """
    def has_permission(self, request, view):
        # Super admin can view all departments
        if safe_get_attr(request.user, 'role') == 'super_admin':
            return True

        # Check if department parameter matches user's department
        department_id = request.query_params.get('department')
        if not department_id:
            return True
            
        return str(safe_get_attr(request.user, 'department_id')) == department_id