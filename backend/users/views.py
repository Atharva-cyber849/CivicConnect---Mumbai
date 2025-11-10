from typing import Optional, Any, cast, Type, Union
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import Serializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, QuerySet
from .typing import ViewSetQuerySet, as_queryset
from .models import Department, UserLoginHistory, User
from .utils import get_authenticated_user, safe_get_attr
from .serializers import (
    UserSerializer,
    AdminRegistrationSerializer,
    CitizenRegistrationSerializer,
    UserProfileSerializer,
    AdminUpdateSerializer,
    DepartmentSerializer,
    ChangePasswordSerializer,
    UserLoginHistorySerializer
)
from .permissions import (
    IsSuperAdmin,
    IsAdminUser,
    IsOfficerUser,
    CanManageDepartmentUsers
)

User = get_user_model()

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated & (IsSuperAdmin | IsAdminUser)]

    def get_queryset(self):  # type: ignore
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if safe_get_attr(user, 'role') == 'super_admin':
            return self.queryset
        department_id = safe_get_attr(user, 'department_id')
        if department_id:
            return self.queryset.filter(id=department_id)
        return self.queryset.none()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):  # type: ignore
        if self.action == 'create_admin':
            return AdminRegistrationSerializer
        elif self.action == 'create':
            return CitizenRegistrationSerializer
        elif self.action in ['update', 'partial_update'] and self.get_object().is_staff_member:
            return AdminUpdateSerializer
        elif self.action == 'profile':
            return UserProfileSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create_admin':
            self.permission_classes = [permissions.IsAuthenticated & IsSuperAdmin]
        elif self.action == 'create':
            self.permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [
                permissions.IsAuthenticated & 
                (IsSuperAdmin | CanManageDepartmentUsers)
            ]
        return super().get_permissions()

    def get_queryset(self):  # type: ignore
        user = self.request.user
        
        # Super admin can see all users
        if safe_get_attr(user, 'role') == 'super_admin':
            return self.queryset
            
        # Department admin can see users in their department
        elif safe_get_attr(user, 'role') == 'admin':
            user_department = safe_get_attr(user, 'department')
            user_id = safe_get_attr(user, 'id')
            return self.queryset.filter(
                Q(department=user_department) | 
                Q(id=user_id)
            )
            
        # Officers can see citizens in their ward
        elif safe_get_attr(user, 'role') == 'officer':
            user_ward = safe_get_attr(user, 'ward')
            user_id = safe_get_attr(user, 'id')
            return self.queryset.filter(
                Q(ward=user_ward, role='citizen') |
                Q(id=user_id)
            )
            
        # Citizens can only see themselves
        user_id = safe_get_attr(user, 'id')
        return self.queryset.filter(id=user_id)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated & IsSuperAdmin],
        url_path='register/admin'
    )
    def create_admin(self, request):
        """Create a new admin or officer account (Super Admin only)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send welcome email with temporary password
        user.send_welcome_email()
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=['patch'],
        permission_classes=[permissions.IsAuthenticated & IsSuperAdmin]
    )
    def update_status(self, request, pk=None):
        """Update user status (activate/deactivate/suspend)"""
        user = self.get_object()
        status = request.data.get('status')
        
        if status not in ['active', 'inactive', 'suspended']:
            return Response(
                {'status': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.status = status
        user.status_changed_at = timezone.now()
        user.status_changed_by = request.user
        user.save()
        
        return Response(UserSerializer(user).data)

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated & IsSuperAdmin]
    )
    def reset_password(self, request, pk=None):
        """Reset user's password and send email"""
        user = self.get_object()
        temp_password = User.objects.make_random_password()
        
        user.set_password(temp_password)
        user.password_changed_at = None  # Require password change on next login
        user.save()
        
        # Send password reset email
        user.send_password_reset_email(temp_password)
        
        return Response({'detail': 'Password reset email sent'})

    @action(
        detail=False,
        methods=['get', 'patch'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def profile(self, request):
        """Get or update user's own profile"""
        if request.method == 'PATCH':
            serializer = UserProfileSerializer(
                request.user,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        else:
            user = request.user
            
        return Response(UserProfileSerializer(user).data)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def change_password(self, request):
        """Change user's password"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        validated_data = getattr(serializer, 'validated_data', {})
        old_password = validated_data.get('old_password')
        new_password = validated_data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'detail': 'Password fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.check_password(old_password):
            return Response(
                {'old_password': 'Wrong password'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        request.user.set_password(new_password)
        request.user.password_changed_at = timezone.now()
        request.user.save()
        
        return Response({'detail': 'Password changed successfully'})

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated & (IsSuperAdmin | IsAdminUser)]
    )
    def officers(self, request):
        """Get list of officers (filtered by department for admins)"""
        queryset = self.get_queryset().filter(role='officer')
        ward = request.query_params.get('ward')
        
        if ward:
            queryset = queryset.filter(ward=ward)
            
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated & (IsSuperAdmin | IsAdminUser)]
    )
    def statistics(self, request, pk=None):
        """Get officer's statistics"""
        user = self.get_object()
        
        if user.role != 'officer':
            return Response(
                {'detail': 'Statistics only available for officers'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        stats = user.get_officer_statistics()
        return Response(stats)

    @action(
        detail=True,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated & (IsSuperAdmin | IsAdminUser)]
    )
    def login_history(self, request, pk=None):
        """Get user's login history"""
        user = self.get_object()
        history = UserLoginHistory.objects.filter(user=user)
        serializer = UserLoginHistorySerializer(history, many=True)
        return Response(serializer.data)