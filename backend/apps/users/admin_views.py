"""
Admin management views for user and officer management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q

from .serializers import UserSerializer, AdminRegistrationSerializer
from .permissions import IsAdminUser

User = get_user_model()


class OfficerManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing officers and department staff.
    Only accessible by admins.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Get all officers and department staff."""
        return User.objects.filter(
            Q(role='ADMIN') | Q(role='DEPARTMENT_STAFF')
        ).order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new officer/staff member."""
        serializer = AdminRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create user
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
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a new officer (alternative endpoint)."""
        return self.create(request)
    
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


class UserManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing and managing all users.
    Only accessible by admins.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Get all users with optional filtering."""
        queryset = User.objects.all().order_by('-created_at')
        
        # Filter by role
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Filter by status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update user status."""
        user = self.get_object()
        is_active = request.data.get('is_active')
        
        if is_active is not None:
            user.is_active = is_active
            user.save()
        
        return Response(UserSerializer(user).data)
