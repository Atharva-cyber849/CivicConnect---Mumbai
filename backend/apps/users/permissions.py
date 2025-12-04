"""
Custom permissions for role-based access control.
Supports 3-tier admin hierarchy:
- Super Admin: ADMIN role + is_superuser=True (full system access)
- Department Admin: ADMIN role + is_superuser=False (department-only access)
- BMC Officer: DEPARTMENT_STAFF role (ward-level access)
"""
from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """Permission for super admin users only (ADMIN + is_superuser)."""
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role == 'ADMIN' and request.user.is_superuser)


class IsDepartmentAdmin(permissions.BasePermission):
    """Permission for department admin users only (ADMIN + not is_superuser)."""
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                request.user.role == 'ADMIN' and not request.user.is_superuser)


class IsAdminUser(permissions.BasePermission):
    """Permission for any admin users (Super Admin or Department Admin)."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsDepartmentStaff(permissions.BasePermission):
    """Permission for BMC officers (department staff) only."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_department_staff


class IsAdminOrDepartmentStaff(permissions.BasePermission):
    """Permission for any admin tier (Super Admin, Department Admin, or BMC Officer)."""
    
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


class IsOfficerOrAdmin(permissions.BasePermission):
    """Permission for officers and admins (all admin tiers)."""
    
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                (request.user.is_admin or request.user.is_department_staff))


class HasDepartmentAccess(permissions.BasePermission):
    """
    Permission to check if user has access based on department.
    - Super Admin: Access to all departments
    - Department Admin: Access only to their department
    - BMC Officer: Access only to their department
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Super admins have access to all departments
        if user.role == 'ADMIN' and user.is_superuser:
            return True
        
        # Get user's department from officer profile
        user_department = None
        try:
            if hasattr(user, 'officer_profile') and user.officer_profile:
                user_department = user.officer_profile.department
        except:
            pass
        
        # Department Admin and Officers can only see their department's data
        if user_department and hasattr(obj, 'department'):
            return obj.department == user_department
        
        return False


class HasWardAccess(permissions.BasePermission):
    """
    Permission to check if officer has access to complaints in their ward.
    - Super Admin: Access to all wards
    - Department Admin: Access to all wards in their department
    - BMC Officer: Access only to their assigned ward
    """
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Super admins have access to all wards
        if user.role == 'ADMIN' and user.is_superuser:
            return True
        
        # Get user's ward from officer profile
        user_ward = None
        user_department = None
        try:
            if hasattr(user, 'officer_profile') and user.officer_profile:
                user_ward = user.officer_profile.assigned_ward
                user_department = user.officer_profile.department
        except:
            pass
        
        # Department Admin can access all complaints in their department
        if user.role == 'ADMIN' and not user.is_superuser:
            if user_department and hasattr(obj, 'department'):
                return obj.department == user_department
            return False
        
        # BMC Officers can only see complaints in their assigned ward
        if user.is_department_staff:
            if not user_ward:
                return False
            return obj.ward == user_ward
        
        # Other users (citizens) can only see their own complaints
        return hasattr(obj, 'user') and obj.user == user
