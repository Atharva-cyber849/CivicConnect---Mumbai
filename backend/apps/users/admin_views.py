"""
Admin management views for user and officer management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
import logging

from .serializers import UserSerializer, AdminRegistrationSerializer
from .permissions import (
    IsAdminUser, 
    CanCreateUser, 
    CanManageOfficers,
    HasDepartmentAccess,
    HasWardAccess
)

User = get_user_model()
logger = logging.getLogger(__name__)


class OfficerManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing officers and department staff.
    Access controlled by role and scope (super admin, dept admin, ward admin).
    """
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Return action-specific permission classes."""
        if self.action in ['create', 'register']:
            return [IsAuthenticated(), CanCreateUser()]
        elif self.action in ['update', 'partial_update', 'destroy', 'status', 'reset_password']:
            return [IsAuthenticated(), CanManageOfficers()]
        elif self.action in ['list', 'retrieve', 'send_invitation']:
            return [IsAuthenticated(), IsAdminUser()]
        else:
            return [IsAuthenticated(), IsAdminUser()]
    
    def get_queryset(self):
        """
        Get officers and staff filtered by user's scope.
        Super admin: all officers
        Dept admin: officers in their department
        Ward admin: officers in their ward
        """
        user = self.request.user
        
        # Start with all officers and staff
        base_queryset = User.objects.filter(
            Q(role='ADMIN') | Q(role='DEPARTMENT_STAFF')
        ).order_by('-created_at')
        
        if user.is_superuser:
            return base_queryset
        
        # Non-super-admin scope filtering
        try:
            if hasattr(user, 'officer_profile'):
                officer_profile = user.officer_profile
                
                # Department admin: filter by department
                if officer_profile.department:
                    return base_queryset.filter(
                        Q(officer_profile__department=officer_profile.department) |
                        Q(officer_profile__assigned_ward__department=officer_profile.department)
                    )
                
                # Ward admin: filter by ward
                if officer_profile.assigned_ward:
                    return base_queryset.filter(
                        officer_profile__assigned_ward=officer_profile.assigned_ward
                    )
        except Exception as e:
            logger.warning(f"Error in get_queryset scope filtering: {str(e)}")
        
        # No scope access
        return User.objects.none()
    
    def perform_create(self, serializer):
        """
        Create officer with validation that creator has scope access.
        """
        user = self.request.user
        new_user_data = serializer.validated_data
        
        # Super admin can create anyone
        if not user.is_superuser:
            # Dept admin can only create staff in their department
            try:
                if hasattr(user, 'officer_profile') and user.officer_profile.department:
                    new_user_data['department'] = user.officer_profile.department
                elif hasattr(user, 'officer_profile') and user.officer_profile.assigned_ward:
                    new_user_data['ward'] = user.officer_profile.assigned_ward
                else:
                    raise Exception("No department or ward access")
            except Exception as e:
                logger.error(f"Officer creation scope validation failed: {str(e)}")
        
        serializer.save()
    
    def perform_update(self, serializer):
        """
        Update officer with validation of scope access.
        """
        user = self.request.user
        instance = self.get_object()
        
        # Non-super-admins can only update within their scope
        if not user.is_superuser:
            try:
                user_dept = user.officer_profile.department if hasattr(user, 'officer_profile') else None
                instance_dept = instance.officer_profile.department if hasattr(instance, 'officer_profile') else None
                
                if user_dept and instance_dept != user_dept:
                    raise PermissionError("Cannot update officers outside your department")
            except Exception as e:
                logger.error(f"Officer update scope validation failed: {str(e)}")
        
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        """Create a new officer/staff member."""
        serializer = AdminRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user with scope validation
        try:
            user = User.objects.create_user(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', ''),
                phone=serializer.validated_data.get('phone', ''),
                role=serializer.validated_data.get('role', 'DEPARTMENT_STAFF'),
                is_staff=True,
                is_active=True
            )
            
            # Log audit
            try:
                from apps.audit.models import AuditLog
                AuditLog.objects.create(
                    user=request.user,
                    action='CREATE_USER',
                    object_type='User',
                    object_id=user.id,
                    details={'email': user.email, 'role': user.role}
                )
            except Exception as e:
                logger.warning(f"Failed to create audit log: {str(e)}")
            
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new officer (alternative endpoint)."""
        return self.create(request)
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Toggle officer active status."""
        officer = self.get_object()
        new_status = not officer.is_active
        
        officer.is_active = new_status
        officer.save()
        
        # Log audit
        try:
            from apps.audit.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='UPDATE_USER_STATUS',
                object_type='User',
                object_id=officer.id,
                details={'is_active': new_status}
            )
        except Exception as e:
            logger.warning(f"Failed to create audit log: {str(e)}")
        
        return Response({
            'status': 'success',
            'message': f'Officer status updated to {"active" if new_status else "inactive"}',
            'is_active': new_status
        })
    
    @action(detail=True, methods=['get'])
    def performance(self, request, pk=None):
        """Get officer performance metrics."""
        officer = self.get_object()
        
        try:
            from apps.complaints.models import Complaint
            
            # Get officer's complaint statistics
            assigned_complaints = Complaint.objects.filter(assigned_to=officer)
            
            performance_data = {
                'officer_id': officer.id,
                'name': f"{officer.first_name} {officer.last_name}",
                'email': officer.email,
                'metrics': {
                    'total_assigned': assigned_complaints.count(),
                    'resolved': assigned_complaints.filter(status='RESOLVED').count(),
                    'in_progress': assigned_complaints.filter(status='IN_PROGRESS').count(),
                    'pending': assigned_complaints.filter(status='PENDING').count(),
                    'resolution_rate': 0,
                }
            }
            
            # Calculate resolution rate
            if assigned_complaints.count() > 0:
                resolved_count = assigned_complaints.filter(status='RESOLVED').count()
                performance_data['metrics']['resolution_rate'] = (resolved_count / assigned_complaints.count()) * 100
            
            return Response(performance_data)
        except Exception as e:
            logger.error(f"Failed to get officer performance: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve performance metrics'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update officer status (activate/deactivate)."""
        officer = self.get_object()
        is_active = request.data.get('is_active')
        
        if is_active is not None:
            officer.is_active = is_active
            officer.save()
        
        return Response(UserSerializer(officer).data)
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """Reset officer password."""
        officer = self.get_object()
        new_password = request.data.get('new_password', 'TempPassword123!')
        
        officer.set_password(new_password)
        officer.save()
        
        # Log audit
        try:
            from apps.audit.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='RESET_PASSWORD',
                object_type='User',
                object_id=officer.id,
                details={'email': officer.email}
            )
        except Exception as e:
            logger.warning(f"Failed to create audit log: {str(e)}")
        
        return Response({
            'message': 'Password reset successfully',
            'temporary_password': new_password
        })
    
    @action(detail=True, methods=['post'])
    def send_invitation(self, request, pk=None):
        """Send email invitation to officer."""
        officer = self.get_object()
        
        # TODO: Implement email sending logic
        # For now, return success
        
        return Response({
            'message': f'Invitation sent to {officer.email}'
        })


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing all users.
    Access controlled by role and scope.
    """
    serializer_class = UserSerializer
    
    def get_permissions(self):
        """Return action-specific permission classes."""
        if self.action in ['create']:
            return [IsAuthenticated(), CanCreateUser()]
        elif self.action in ['update', 'partial_update', 'destroy', 'toggle_status']:
            return [IsAuthenticated(), CanManageOfficers()]
        else:
            return [IsAuthenticated(), IsAdminUser()]
    
    def get_queryset(self):
        """
        Get users filtered by user's scope.
        Super admin: all users
        Dept admin: users in their department
        Ward admin: users in their ward
        Citizen: cannot access this endpoint
        """
        user = self.request.user
        
        # Handle unauthenticated or swagger schema generation
        if not user or not user.is_authenticated or getattr(self, 'swagger_fake_view', False):
            return User.objects.none()
        
        if user.role == 'CITIZEN':
            return User.objects.none()
        
        # Base queryset: all users
        queryset = User.objects.all().order_by('-created_at')
        
        if user.is_superuser:
            return queryset
        
        # Apply role filter if provided
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Apply status filter if provided
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Non-super-admin scope filtering
        try:
            if hasattr(user, 'officer_profile'):
                officer_profile = user.officer_profile
                
                # Department admin: filter by department
                if officer_profile.department:
                    return queryset.filter(
                        Q(officer_profile__department=officer_profile.department) |
                        Q(officer_profile__assigned_ward__department=officer_profile.department)
                    )
                
                # Ward admin: filter by ward
                if officer_profile.assigned_ward:
                    return queryset.filter(
                        officer_profile__assigned_ward=officer_profile.assigned_ward
                    )
        except Exception as e:
            logger.warning(f"Error in get_queryset scope filtering: {str(e)}")
        
        # No scope access
        return User.objects.none()
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle user active status."""
        user_obj = self.get_object()
        new_status = not user_obj.is_active
        
        user_obj.is_active = new_status
        user_obj.save()
        
        # Log audit
        try:
            from apps.audit.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='TOGGLE_USER_STATUS',
                object_type='User',
                object_id=user_obj.id,
                details={'is_active': new_status, 'email': user_obj.email}
            )
        except Exception as e:
            logger.warning(f"Failed to create audit log: {str(e)}")
        
        return Response({
            'status': 'success',
            'message': f'User status updated to {"active" if new_status else "inactive"}',
            'user_id': user_obj.id,
            'is_active': new_status
        })
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update user status."""
        user_obj = self.get_object()
        is_active = request.data.get('is_active')
        
        if is_active is not None:
            user_obj.is_active = is_active
            user_obj.save()
        
        return Response(UserSerializer(user_obj).data)
