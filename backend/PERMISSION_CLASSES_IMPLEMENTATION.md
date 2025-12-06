# Backend Permission Classes Implementation Guide

**File**: `backend/apps/users/permissions.py`

This guide provides ready-to-use permission classes for your Django REST Framework API.

---

## 1. Basic Permission Classes

```python
"""
Permission classes for role-based access control.
These classes enforce authorization on API endpoints.
"""

from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()


# ============================================================================
# ROLE-BASED PERMISSION CLASSES
# ============================================================================

class IsCitizen(BasePermission):
    """
    Only authenticated citizens can access.
    """
    message = "Only citizens can access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'CITIZEN'
        )


class IsAdmin(BasePermission):
    """
    Only authenticated admins (any tier) can access.
    """
    message = "Only administrators can access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsWardAdmin(BasePermission):
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


class IsDepartmentAdmin(BasePermission):
    """
    Only department admins can access.
    Dept admin = ADMIN role + has department assigned + is NOT superuser
    """
    message = "Only department administrators can access this endpoint."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        return (
            request.user.role == 'ADMIN' and
            request.user.department is not None and
            not request.user.is_superuser
        )


class IsSuperAdmin(BasePermission):
    """
    Only super admins can access.
    Super admin = ADMIN role + is_superuser flag
    """
    message = "Only super administrators can access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN' and
            request.user.is_superuser
        )


# ============================================================================
# OWNERSHIP / CONTEXT-BASED PERMISSION CLASSES
# ============================================================================

class IsOwnerOrAdmin(BasePermission):
    """
    Only the complaint owner or admin can access/modify.
    """
    message = "You do not have permission to access this complaint."
    
    def has_object_permission(self, request, view, obj):
        # Admins can always access
        if request.user.role == 'ADMIN':
            return True
        
        # Citizens can only access their own complaints
        return obj.filed_by == request.user


class HasWardAccess(BasePermission):
    """
    Ward admin can only access complaints in their assigned ward.
    Super admin can access all.
    """
    message = "You do not have access to complaints outside your ward."
    
    def has_object_permission(self, request, view, obj):
        # Super admin can access anything
        if request.user.is_super_admin:
            return True
        
        # Ward admin can only access their ward
        if request.user.is_ward_admin:
            return obj.ward == request.user.ward
        
        return False


class HasDepartmentAccess(BasePermission):
    """
    Department admin can only access complaints in their department.
    Super admin can access all.
    """
    message = "You do not have access to complaints outside your department."
    
    def has_object_permission(self, request, view, obj):
        # Super admin can access anything
        if request.user.is_super_admin:
            return True
        
        # Department admin can only access their department
        if request.user.is_department_admin:
            return obj.department == request.user.department
        
        return False


class CanModifyComplaint(BasePermission):
    """
    Check if user can modify a complaint based on their role.
    - Citizens can modify their own complaints (if not closed)
    - Ward admin can modify ward complaints
    - Department admin can modify department complaints
    - Super admin can modify any complaint
    """
    message = "You do not have permission to modify this complaint."
    
    def has_object_permission(self, request, view, obj):
        # Only allow for safe methods or POST
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Check if complaint is closed (no modifications allowed)
        if hasattr(obj, 'status') and obj.status == 'RESOLVED':
            # Only super admin can modify resolved complaints
            return request.user.is_super_admin
        
        # Citizens can only modify their own complaints
        if request.user.is_citizen:
            return obj.filed_by == request.user
        
        # Ward admin can modify ward complaints
        if request.user.is_ward_admin:
            return obj.ward == request.user.ward
        
        # Department admin can modify department complaints
        if request.user.is_department_admin:
            return obj.department == request.user.department
        
        # Super admin can modify anything
        if request.user.is_super_admin:
            return True
        
        return False


# ============================================================================
# STAFF-ONLY PERMISSION CLASSES
# ============================================================================

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users (is_staff flag).
    More general than IsAdmin - allows ADMIN and DEPARTMENT_STAFF roles.
    """
    message = "You must be an admin user to access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_staff
        )


class IsOfficer(BasePermission):
    """
    Only officers/staff can access.
    """
    message = "Only officers can access this endpoint."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'DEPARTMENT_STAFF'
        )


# ============================================================================
# COMBINED PERMISSION CLASSES (for complex checks)
# ============================================================================

class IsAdminOrOwner(BasePermission):
    """
    Allow access if:
    1. User is an admin (any tier)
    2. User is the object owner (for complaints: filed_by field)
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


class CanAssignComplaint(BasePermission):
    """
    Only admins can assign complaints.
    Ward admin can assign to officers in their ward.
    Department admin can assign to officers in their department.
    Super admin can assign to anyone.
    """
    message = "You do not have permission to assign complaints."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Only admins can assign
        return request.user.role == 'ADMIN'
    
    def has_object_permission(self, request, view, obj):
        # Ward admin can only assign in their ward
        if request.user.is_ward_admin:
            if hasattr(obj, 'ward'):
                return obj.ward == request.user.ward
            if hasattr(obj, 'assigned_to') and hasattr(obj.assigned_to, 'officer_profile'):
                return obj.assigned_to.officer_profile.assigned_ward == request.user.ward
        
        # Department admin can only assign in their department
        if request.user.is_department_admin:
            if hasattr(obj, 'department'):
                return obj.department == request.user.department
            if hasattr(obj, 'assigned_to') and hasattr(obj.assigned_to, 'officer_profile'):
                return obj.assigned_to.officer_profile.department == request.user.department
        
        # Super admin can assign anything
        if request.user.is_super_admin:
            return True
        
        return False


# ============================================================================
# ACTION-BASED PERMISSION CLASSES
# ============================================================================

class CanCreateUser(BasePermission):
    """
    Only super admin can create users/admins.
    """
    message = "Only super administrators can create users."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_super_admin
        )


class CanManageOfficers(BasePermission):
    """
    Ward/Department admins can manage officers in their area.
    Super admin can manage all officers.
    """
    message = "You do not have permission to manage officers."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # At least admin
        return request.user.role == 'ADMIN'
    
    def has_object_permission(self, request, view, obj):
        # Ward admin can manage officers in their ward
        if request.user.is_ward_admin:
            return obj.assigned_ward == request.user.ward
        
        # Department admin can manage officers in their department
        if request.user.is_department_admin:
            return obj.department == request.user.department
        
        # Super admin can manage all
        if request.user.is_super_admin:
            return True
        
        return False


class CanViewAnalytics(BasePermission):
    """
    Each role can view analytics for their scope:
    - Citizens: No analytics
    - Ward Admin: Their ward analytics
    - Dept Admin: Their department analytics
    - Super Admin: City-wide analytics
    """
    message = "You do not have permission to view analytics."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Citizens cannot view analytics
        if request.user.is_citizen:
            return False
        
        # If checking ward analytics
        if hasattr(obj, 'ward'):
            return obj.ward == request.user.ward or request.user.is_super_admin
        
        # If checking department analytics
        if hasattr(obj, 'department'):
            return obj.department == request.user.department or request.user.is_super_admin
        
        # Super admin can view all
        if request.user.is_super_admin:
            return True
        
        return False


# ============================================================================
# CUSTOM PERMISSION FOR SPECIFIC ACTIONS
# ============================================================================

class CanClosureComplaint(BasePermission):
    """
    Only department/super admin can close (resolve) complaints.
    """
    message = "Only department administrators can close complaints."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_department_admin or request.user.is_super_admin)
        )
    
    def has_object_permission(self, request, view, obj):
        # Check department access
        if request.user.is_department_admin:
            return obj.department == request.user.department
        
        if request.user.is_super_admin:
            return True
        
        return False


class CanApproveClosure(BasePermission):
    """
    Only higher-tier admins can approve complaint closures.
    Department Admin cannot approve their own closures (needs Super Admin).
    """
    message = "You do not have permission to approve this closure."
    
    def has_object_permission(self, request, view, obj):
        # Only Super Admin can approve closures
        return request.user.is_super_admin
```

---

## 2. How to Use These Permission Classes

### In ViewSets

```python
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import (
    IsWardAdmin, IsDepartmentAdmin, IsSuperAdmin,
    HasWardAccess, HasDepartmentAccess, CanModifyComplaint
)
from .models import Complaint
from .serializers import ComplaintSerializer

class ComplaintViewSet(viewsets.ModelViewSet):
    """
    Complaint management with role-based access.
    """
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter complaints based on user role"""
        user = self.request.user
        
        # Super Admin sees all complaints
        if user.is_super_admin:
            return Complaint.objects.all().order_by('-created_at')
        
        # Department Admin sees department complaints
        if user.is_department_admin:
            return Complaint.objects.filter(
                department=user.department
            ).order_by('-created_at')
        
        # Ward Admin sees ward complaints
        if user.is_ward_admin:
            return Complaint.objects.filter(
                ward=user.ward
            ).order_by('-created_at')
        
        # Citizens see only their complaints
        return Complaint.objects.filter(
            filed_by=user
        ).order_by('-created_at')
    
    def get_permissions(self):
        """
        Different permissions for different actions.
        """
        if self.action == 'create':
            # Only citizens can file complaints
            permission_classes = [IsCitizen]
        elif self.action in ['update', 'partial_update']:
            # Need base auth + can modify check
            permission_classes = [IsAuthenticated, CanModifyComplaint]
        elif self.action == 'list':
            # All authenticated users can list (filtered by role)
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_update(self, serializer):
        """
        Additional validation during update.
        """
        obj = serializer.instance
        user = self.request.user
        
        # Citizens can only update their own complaints
        if user.is_citizen and obj.filed_by != user:
            self.permission_denied(self.request)
        
        # Ward admin can only update ward complaints
        if user.is_ward_admin and obj.ward != user.ward:
            self.permission_denied(self.request)
        
        # Department admin can only update department complaints
        if user.is_department_admin and obj.department != user.department:
            self.permission_denied(self.request)
        
        serializer.save(updated_by=user)


class OfficerViewSet(viewsets.ModelViewSet):
    """
    Officer management - only admins.
    """
    from .models import Officer
    from .serializers import OfficerSerializer
    
    queryset = Officer.objects.all()
    serializer_class = OfficerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        # Super Admin sees all officers
        if user.is_super_admin:
            return Officer.objects.all()
        
        # Ward Admin sees ward officers
        if user.is_ward_admin:
            return Officer.objects.filter(assigned_ward=user.ward)
        
        # Department Admin sees department officers
        if user.is_department_admin:
            return Officer.objects.filter(department=user.department)
        
        return Officer.objects.none()
```

### In APIViews

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.users.permissions import IsSuperAdmin

class CreateAdminView(APIView):
    """Only super admin can create admins"""
    permission_classes = [IsSuperAdmin]
    
    def post(self, request):
        # Only super admins reach here
        # Create admin user logic
        return Response({'status': 'admin created'})


class AnalyticsView(APIView):
    """Analytics endpoint with role-based access"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Determine scope based on role
        if user.is_super_admin:
            scope = 'city'
            data = self.get_city_analytics()
        elif user.is_department_admin:
            scope = 'department'
            data = self.get_department_analytics(user.department)
        elif user.is_ward_admin:
            scope = 'ward'
            data = self.get_ward_analytics(user.ward)
        else:
            return Response(
                {'error': 'You do not have access to analytics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({'scope': scope, 'data': data})
```

---

## 3. Best Practices

### ✅ DO:

1. **Use permission_classes** on every ViewSet/APIView
2. **Check get_queryset()** to filter by role
3. **Use detail-level permissions** (has_object_permission)
4. **Combine multiple permission classes**
5. **Log denied access attempts**
6. **Test with different roles**

### ❌ DON'T:

1. **Skip backend validation** - always check on server
2. **Trust frontend role** - verify token claims
3. **Use only list-level permission** - use detail too
4. **Store sensitive info in token** - only ID + role
5. **Forget to filter querysets** - filter by role always

---

## 4. Testing Permissions

```bash
# Test as citizen
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/admin/users/
# Expected: 403 Forbidden

# Test as ward admin - own ward
curl -H "Authorization: Bearer $WARD_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/?ward=A
# Expected: 200 OK with ward A complaints

# Test as ward admin - other ward
curl -H "Authorization: Bearer $WARD_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/?ward=B
# Expected: 200 OK but empty list (filtered by get_queryset)

# Test as super admin
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/
# Expected: 200 OK with all complaints
```

---

**These permission classes provide enterprise-grade access control for your system.**
