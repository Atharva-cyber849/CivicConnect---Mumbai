"""
Custom permissions for role-based access control.
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Permission for admin users only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsDepartmentStaff(permissions.BasePermission):
    """Permission for department staff only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_department_staff


class IsAdminOrDepartmentStaff(permissions.BasePermission):
    """Permission for admin or department staff."""
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                (request.user.is_admin or request.user.is_department_staff))


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has a `user` attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user
