# ViewSet Integration Guide for Permission Classes

**Location**: Update your ViewSet files to use the permission classes defined in `backend/apps/users/permissions.py`

---

## 1. ComplaintViewSet with Role-Based Access

**File**: `backend/apps/complaints/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import (
    HasWardAccess, HasDepartmentAccess, CanModifyComplaint,
    CanAssignComplaint, CanCloseComplaint, IsOwnerOrAdmin, CanViewAnalytics
)
from .models import Complaint
from .serializers import ComplaintSerializer, ComplaintDetailSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    Complaint management with comprehensive role-based access control.
    """
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter complaints based on user role and scope"""
        user = self.request.user
        
        # Super Admin sees all complaints
        if user.is_super_admin:
            return Complaint.objects.all().order_by('-created_at')
        
        # Department Admin sees their department complaints
        if user.is_department_admin:
            return Complaint.objects.filter(
                department=user.department
            ).order_by('-created_at')
        
        # Ward Admin sees their ward complaints
        if user.is_ward_admin:
            return Complaint.objects.filter(
                ward=user.ward
            ).order_by('-created_at')
        
        # Officers see complaints assigned to them or in their ward
        if user.is_department_staff:
            try:
                ward = user.officer_profile.assigned_ward
                return Complaint.objects.filter(
                    ward=ward
                ).order_by('-created_at')
            except:
                return Complaint.objects.none()
        
        # Citizens see only their own complaints
        if user.role == 'CITIZEN':
            return Complaint.objects.filter(
                filed_by=user
            ).order_by('-created_at')
        
        return Complaint.objects.none()
    
    def get_serializer_class(self):
        """Use detail serializer for retrieve actions"""
        if self.action == 'retrieve':
            return ComplaintDetailSerializer
        return ComplaintSerializer
    
    def get_permissions(self):
        """Different permissions for different actions"""
        if self.action == 'create':
            # Only citizens can file complaints
            permission_classes = [IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, CanModifyComplaint]
        elif self.action == 'assign_complaint':
            permission_classes = [IsAuthenticated, CanAssignComplaint]
        elif self.action == 'close_complaint':
            permission_classes = [IsAuthenticated, CanCloseComplaint]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Set filed_by to current user when creating complaint"""
        serializer.save(filed_by=self.request.user)
    
    def perform_update(self, serializer):
        """Validate access before updating complaint"""
        obj = serializer.instance
        user = self.request.user
        
        # Double-check permission before update
        # Citizens can only update their own complaints
        if user.role == 'CITIZEN' and obj.filed_by != user:
            self.permission_denied(self.request)
        
        # Ward admin can only update ward complaints
        if user.is_ward_admin and obj.ward != user.ward:
            self.permission_denied(self.request)
        
        # Department admin can only update department complaints
        if user.is_department_admin and obj.department != user.department:
            self.permission_denied(self.request)
        
        serializer.save(
            updated_by=user,
            updated_at=timezone.now()
        )
    
    @action(detail=True, methods=['post'])
    def assign_complaint(self, request, pk=None):
        """
        Assign complaint to an officer.
        POST /complaints/{id}/assign_complaint/
        """
        complaint = self.get_object()
        
        # Check permission
        perm = CanAssignComplaint()
        if not perm.has_object_permission(request, self, complaint):
            return Response(
                {'error': 'You cannot assign complaints outside your scope'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        officer_id = request.data.get('officer_id')
        if not officer_id:
            return Response(
                {'error': 'officer_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            officer = User.objects.get(id=officer_id)
            
            # Validate officer is in correct scope
            if request.user.is_ward_admin:
                if not hasattr(officer, 'officer_profile') or \
                   officer.officer_profile.assigned_ward != request.user.ward:
                    return Response(
                        {'error': 'Officer not in your ward'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            complaint.assigned_to = officer
            complaint.status = 'ASSIGNED'
            complaint.save()
            
            return Response(
                {'status': 'Complaint assigned successfully'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Officer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def close_complaint(self, request, pk=None):
        """
        Close/resolve a complaint.
        POST /complaints/{id}/close_complaint/
        """
        complaint = self.get_object()
        
        # Check permission
        perm = CanCloseComplaint()
        if not perm.has_permission(request, self):
            return Response(
                {'error': 'Only department admins can close complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not perm.has_object_permission(request, self, complaint):
            return Response(
                {'error': 'You cannot close complaints outside your scope'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        complaint.status = 'RESOLVED'
        complaint.resolved_at = timezone.now()
        complaint.resolved_by = request.user
        complaint.save()
        
        return Response(
            {'status': 'Complaint resolved successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        Get complaint analytics for user's scope.
        GET /complaints/analytics/
        """
        user = request.user
        
        if user.role == 'CITIZEN':
            return Response(
                {'error': 'Citizens cannot view analytics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get scope
        if user.is_super_admin:
            complaints = Complaint.objects.all()
            scope = 'city'
        elif user.is_department_admin:
            complaints = Complaint.objects.filter(department=user.department)
            scope = 'department'
        elif user.is_ward_admin:
            complaints = Complaint.objects.filter(ward=user.ward)
            scope = 'ward'
        else:
            return Response(
                {'error': 'No analytics access'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Calculate analytics
        analytics = {
            'scope': scope,
            'total_complaints': complaints.count(),
            'status_breakdown': {
                'pending': complaints.filter(status='PENDING').count(),
                'assigned': complaints.filter(status='ASSIGNED').count(),
                'in_progress': complaints.filter(status='IN_PROGRESS').count(),
                'resolved': complaints.filter(status='RESOLVED').count(),
            },
            'average_resolution_time': self._get_avg_resolution_time(complaints),
        }
        
        return Response(analytics)
    
    def _get_avg_resolution_time(self, complaints):
        """Calculate average resolution time in days"""
        resolved = complaints.filter(
            status='RESOLVED',
            resolved_at__isnull=False
        )
        if not resolved.exists():
            return 0
        
        total_time = sum([
            (c.resolved_at - c.created_at).days 
            for c in resolved
        ])
        return round(total_time / resolved.count(), 2)
```

---

## 2. OfficerViewSet with Permission Checks

**File**: `backend/apps/users/admin_views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.permissions import (
    IsAdmin, IsSuperAdmin, IsDepartmentAdmin, IsWardAdmin,
    CanManageOfficers, CanCreateUser
)
from .models import Officer, User
from .serializers import OfficerSerializer, OfficerDetailSerializer


class OfficerManagementViewSet(viewsets.ModelViewSet):
    """
    Officer/staff management with role-based access.
    Admins can only manage officers in their scope.
    """
    serializer_class = OfficerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        """Filter officers based on admin scope"""
        user = self.request.user
        
        # Super Admin sees all officers
        if user.is_super_admin:
            return Officer.objects.all()
        
        # Ward Admin sees only their ward officers
        if user.is_ward_admin:
            return Officer.objects.filter(assigned_ward=user.ward.code)
        
        # Department Admin sees only their department officers
        if user.is_department_admin:
            return Officer.objects.filter(department=user.department)
        
        return Officer.objects.none()
    
    def get_permissions(self):
        """Permission checks for different actions"""
        if self.action == 'create':
            permission_classes = [IsAuthenticated, CanCreateUser]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, CanManageOfficers]
        else:
            permission_classes = [IsAuthenticated, IsAdmin]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Create officer and associated user"""
        officer = serializer.save()
        
        # Log creation
        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE_OFFICER',
            object_id=officer.id,
            details=f'Created officer: {officer.id}'
        )
    
    def perform_update(self, serializer):
        """Update officer with validation"""
        officer = serializer.instance
        user = self.request.user
        
        # Validate scope
        if user.is_ward_admin:
            if officer.assigned_ward != user.ward.code:
                self.permission_denied(self.request)
        elif user.is_department_admin:
            if officer.department != user.department:
                self.permission_denied(self.request)
        
        serializer.save()
        
        # Log update
        AuditLog.objects.create(
            user=user,
            action='UPDATE_OFFICER',
            object_id=officer.id,
            details=f'Updated officer: {officer.id}'
        )
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """
        Toggle officer active status.
        PATCH /officers/{id}/toggle_active/
        """
        officer = self.get_object()
        officer.is_active = not officer.is_active
        officer.save()
        
        return Response({
            'id': officer.id,
            'is_active': officer.is_active
        })
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """
        Get officer performance metrics.
        GET /officers/{id}/performance/
        """
        officer = self.get_object()
        
        complaints = Complaint.objects.filter(assigned_to=officer.user)
        
        metrics = {
            'officer_id': officer.id,
            'total_assigned': complaints.count(),
            'resolved': complaints.filter(status='RESOLVED').count(),
            'pending': complaints.filter(status='PENDING').count(),
            'average_resolution_time': self._get_avg_time(complaints),
            'rating': getattr(officer, 'average_rating', 0),
        }
        
        return Response(metrics)
    
    def _get_avg_time(self, complaints):
        """Calculate average resolution time"""
        resolved = complaints.filter(
            status='RESOLVED',
            resolved_at__isnull=False
        )
        if not resolved.exists():
            return 0
        
        total = sum([(c.resolved_at - c.created_at).days for c in resolved])
        return round(total / resolved.count(), 2)


class UserManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    User management - admins can view and manage users in their scope.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        """Filter users based on admin scope"""
        user = self.request.user
        
        # Super admin sees all users
        if user.is_super_admin:
            return User.objects.all()
        
        # Department admin sees department users
        if user.is_department_admin:
            return User.objects.filter(department=user.department)
        
        # Ward admin sees ward users
        if user.is_ward_admin:
            return User.objects.filter(ward=user.ward)
        
        return User.objects.none()
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """
        Toggle user active status.
        Only admins can toggle users in their scope.
        """
        user_obj = self.get_object()
        admin_user = request.user
        
        # Validate scope
        if admin_user.is_department_admin:
            if user_obj.department != admin_user.department:
                return Response(
                    {'error': 'Cannot manage users outside your department'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif admin_user.is_ward_admin:
            if user_obj.ward != admin_user.ward:
                return Response(
                    {'error': 'Cannot manage users outside your ward'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        user_obj.is_active = not user_obj.is_active
        user_obj.save()
        
        return Response({'is_active': user_obj.is_active})
```

---

## 3. Best Practices for ViewSet Integration

### ✅ ALWAYS DO:

1. **Override get_queryset()** - Filter by role
2. **Override get_permissions()** - Use different permissions per action
3. **Use perform_create/update()** - Add extra validation
4. **Check in has_object_permission()** - Detail-level security
5. **Log admin actions** - Create audit records
6. **Return 403 on denied access** - Don't silently fail

### ❌ NEVER DO:

1. **Skip queryset filtering** - Always filter by scope
2. **Trust frontend authorization** - Always verify backend
3. **Use same permissions for all actions** - Tailor per action
4. **Return 404 for permission denied** - Return 403 explicitly
5. **Update without validation** - Check scope before save

---

## 4. Testing Permissions

```bash
# Test as citizen - should get their complaints only
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/
# Returns: Their own complaints

# Test as ward admin - should get ward complaints
curl -H "Authorization: Bearer $WARD_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/
# Returns: All complaints in their ward

# Test as citizen creating complaint - should work
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/ \
  -d '{"title":"...", "description":"..."}'
# Returns: 201 Created

# Test as citizen assigning complaint - should fail
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/1/assign_complaint/ \
  -d '{"officer_id": 5}'
# Returns: 403 Forbidden

# Test as ward admin assigning to officer - should work
curl -X POST -H "Authorization: Bearer $WARD_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/1/assign_complaint/ \
  -d '{"officer_id": 5}'
# Returns: 200 OK (if officer in their ward)
```

---

**Your ViewSets are now fully protected with role-based access control!**
