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


# ============================================================================
# ENHANCED PERMISSION CLASSES FOR COMPLEX OPERATIONS
# ============================================================================

class IsCitizen(permissions.BasePermission):
    """Only authenticated citizens can access."""
    message = "Only citizens can access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'CITIZEN'
        )


class IsWardAdmin(permissions.BasePermission):
    """
    Only ward admins can access.
    Ward admin = ADMIN role + has ward assigned + is NOT superuser
    """
    message = "Only ward administrators can access this endpoint."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        return (
            request.user.role == 'ADMIN' and
            request.user.ward is not None and
            not request.user.is_superuser
        )


class IsAdmin(permissions.BasePermission):
    """Only authenticated admins (any tier) can access."""
    message = "Only administrators can access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allow access if user is an admin OR is the object owner.
    """
    message = "You do not have permission to access this resource."
    
    def has_object_permission(self, request, view, obj):
        # Admin users always have access
        if request.user.role == 'ADMIN':
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'filed_by'):
            return obj.filed_by == request.user
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class CanModifyComplaint(permissions.BasePermission):
    """
    Check if user can modify a complaint based on their role.
    """
    message = "You do not have permission to modify this complaint."
    
    def has_object_permission(self, request, view, obj):
        # Read methods always allowed
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if complaint is closed
        if hasattr(obj, 'status') and obj.status in ['RESOLVED', 'CLOSED']:
            return request.user.is_super_admin
        
        # Citizens can only modify their own complaints
        if request.user.role == 'CITIZEN':
            if hasattr(obj, 'filed_by'):
                return obj.filed_by == request.user
        
        # Department/Ward admin can modify their scope
        if request.user.role == 'ADMIN' and not request.user.is_superuser:
            # Check department access
            if request.user.department and hasattr(obj, 'department'):
                return obj.department == request.user.department
            # Check ward access
            if request.user.ward and hasattr(obj, 'ward'):
                return obj.ward == request.user.ward
        
        # Super admin can modify anything
        if request.user.is_super_admin:
            return True
        
        return False


class CanAssignComplaint(permissions.BasePermission):
    """Only admins can assign complaints to officers."""
    message = "You do not have permission to assign complaints."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role == 'ADMIN'
    
    def has_object_permission(self, request, view, obj):
        # Ward admin can assign in their ward
        if request.user.is_ward_admin:
            if hasattr(obj, 'ward'):
                return obj.ward == request.user.ward
        
        # Department admin can assign in their department
        if request.user.is_department_admin:
            if hasattr(obj, 'department'):
                return obj.department == request.user.department
        
        # Super admin can assign anything
        if request.user.is_super_admin:
            return True
        
        return False


class CanCloseComplaint(permissions.BasePermission):
    """Only department/super admin can close complaints."""
    message = "Only department administrators can close complaints."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_department_admin or request.user.is_super_admin)
        )
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_department_admin:
            if hasattr(obj, 'department'):
                return obj.department == request.user.department
        
        if request.user.is_super_admin:
            return True
        
        return False


class CanCreateUser(permissions.BasePermission):
    """Only super admin can create users/admins."""
    message = "Only super administrators can create users."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_super_admin
        )


class CanManageOfficers(permissions.BasePermission):
    """
    Admins can manage officers in their scope.
    """
    message = "You do not have permission to manage officers."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role == 'ADMIN'
    
    def has_object_permission(self, request, view, obj):
        # Ward admin can manage officers in their ward
        if request.user.is_ward_admin:
            if hasattr(obj, 'assigned_ward'):
                return obj.assigned_ward == request.user.ward.code if request.user.ward else False
        
        # Department admin can manage officers in their department
        if request.user.is_department_admin:
            if hasattr(obj, 'department'):
                return obj.department == request.user.department
        
        # Super admin can manage all
        if request.user.is_super_admin:
            return True
        
        return False


class CanViewAnalytics(permissions.BasePermission):
    """Each role can view analytics for their scope."""
    message = "You do not have permission to view analytics."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Citizens cannot view analytics
        if request.user.role == 'CITIZEN':
            return False
        
        # Ward analytics
        if hasattr(obj, 'ward'):
            return obj.ward == request.user.ward or request.user.is_super_admin
        
        # Department analytics
        if hasattr(obj, 'department'):
            return obj.department == request.user.department or request.user.is_super_admin
        
        # Super admin can view all
        if request.user.is_super_admin:
            return True
        
        return False


class CanApproveClosure(permissions.BasePermission):
    """Only super admin can approve complaint closures."""
    message = "You do not have permission to approve this closure."
    
    def has_object_permission(self, request, view, obj):
        return request.user.is_super_admin


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def check_ward_access(user, ward):
    """Helper to check if user has access to a specific ward."""
    if user.is_super_admin:
        return True
    if user.is_ward_admin and user.ward == ward:
        return True
    return False


def check_department_access(user, department):
    """Helper to check if user has access to a specific department."""
    if user.is_super_admin:
        return True
    if user.is_department_admin and user.department == department:
        return True
    return False
