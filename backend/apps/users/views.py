"""
User views for authentication and profile management.
"""
from typing import Type, Any, Union
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

from .serializers import (
    UserRegistrationSerializer,
    AdminRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer
)
from .serializers_jwt import CustomTokenObtainPairSerializer

User = get_user_model()


class CustomLoginView(TokenObtainPairView):
    """Custom login view that returns user data along with tokens."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Return validated data (tokens and user info are provided by the serializer)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class AdminRegisterView(generics.CreateAPIView):
    """Admin registration request endpoint - creates pending requests for approval."""
    permission_classes = (AllowAny,)  # Public endpoint for registration requests
    
    def post(self, request, *args, **kwargs):
        from .models import AdminRegistrationRequest
        from django.contrib.auth.hashers import make_password
        
        # Get the role from query params or request data
        role = request.query_params.get('role') or request.data.get('role', 'officer')
        
        # Prevent super admin self-registration
        if role in ['super_admin']:
            return Response({
                'error': 'Super admin accounts can only be created by existing super administrators.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Map frontend role names to backend role names
        role_mapping = {
            'officer': 'DEPARTMENT_STAFF',
            'admin': 'ADMIN',
        }
        
        # Convert role to backend format
        backend_role = role_mapping.get(role, 'DEPARTMENT_STAFF')
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'password', 'password2']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password match
        if request.data.get('password') != request.data.get('password2'):
            return Response({
                'error': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists in users or pending requests
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'An account with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if AdminRegistrationRequest.objects.filter(email=email, status='PENDING').exists():
            return Response({
                'error': 'A registration request with this email is already pending'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create registration request
        try:
            registration_request = AdminRegistrationRequest.objects.create(
                full_name=request.data.get('full_name'),
                email=email,
                phone=request.data.get('phone', ''),
                password_hash=make_password(request.data.get('password')),
                requested_role=backend_role,
                justification=request.data.get('justification', ''),
                department=request.data.get('department', '')
            )
            
            # TODO: Send notification to super admins about new registration request
            
            return Response({
                'message': 'Registration request submitted successfully. You will be notified once your request is reviewed by an administrator.',
                'request_id': registration_request.pk,  # Use pk instead of id for better type safety
                'status': 'pending_approval'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create registration request: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer  # Default serializer
    
    def get_serializer_class(self):  # type: ignore
        if self.request.method == 'GET':
            return UserSerializer
        return UserUpdateSerializer
    
    def get_object(self):  # type: ignore
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change user password."""
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user by blacklisting refresh token."""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Logout successful."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AdminRegistrationRequestListView(generics.ListAPIView):
    """List pending admin registration requests - only for super admins."""
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self):  # type: ignore
        from .models import AdminRegistrationRequest
        
        # Only super admins (role='ADMIN' and is_superuser=True) can view requests
        user = self.request.user
        if not (hasattr(user, 'role') and getattr(user, 'role', '') == 'ADMIN' and user.is_superuser):
            return AdminRegistrationRequest.objects.none()
        
        return AdminRegistrationRequest.objects.filter(status='PENDING').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        user = request.user
        
        if not queryset.exists() and not (hasattr(user, 'role') and getattr(user, 'role', '') == 'ADMIN' and user.is_superuser):
            return Response({
                'error': 'Only super administrators can view registration requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        requests_data = []
        for req in queryset:
            requests_data.append({
                'id': req.pk,  # Use pk instead of id for better type safety
                'full_name': req.full_name,
                'email': req.email,
                'phone': req.phone,
                'requested_role': req.requested_role,
                'justification': req.justification,
                'department': req.department,
                'created_at': req.created_at.isoformat(),
                'status': req.status
            })
        
        return Response({
            'requests': requests_data,
            'count': len(requests_data)
        })


class AdminRegistrationRequestActionView(generics.UpdateAPIView):
    """Approve or reject admin registration requests - only for super admins."""
    permission_classes = (IsAuthenticated,)
    
    def post(self, request, request_id, *args, **kwargs):
        from .models import AdminRegistrationRequest
        from django.utils import timezone
        
        # Only super admins can approve/reject requests
        user = request.user
        if not (hasattr(user, 'role') and getattr(user, 'role', '') == 'ADMIN' and user.is_superuser):
            return Response({
                'error': 'Only super administrators can approve/reject registration requests'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            registration_request = AdminRegistrationRequest.objects.get(
                id=request_id, 
                status='PENDING'
            )
        except AdminRegistrationRequest.DoesNotExist:
            return Response({
                'error': 'Registration request not found or already processed'
            }, status=status.HTTP_404_NOT_FOUND)
        
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action == 'approve':
            try:
                user = registration_request.approve(request.user)
                return Response({
                    'message': f'Registration approved successfully. User account created for {user.email}',
                    'user_id': user.pk  # Use pk instead of id for better type safety
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': f'Failed to approve registration: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        elif action == 'reject':
            reason = request.data.get('reason', 'No reason provided')
            try:
                registration_request.reject(request.user, reason)
                return Response({
                    'message': 'Registration request rejected successfully'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': f'Failed to reject registration: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        else:
            return Response({
                'error': 'Invalid action. Use "approve" or "reject"'
            }, status=status.HTTP_400_BAD_REQUEST)


class CreateSuperAdminView(generics.CreateAPIView):
    """Create super admin - only accessible by existing super admins."""
    permission_classes = (IsAuthenticated,)
    serializer_class = AdminRegistrationSerializer
    
    def post(self, request, *args, **kwargs):
        # Only super admins can create other super admins
        user = request.user
        if not (hasattr(user, 'role') and getattr(user, 'role', '') == 'ADMIN' and user.is_superuser):
            return Response({
                'error': 'Only super administrators can create super admin accounts'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'password', 'password2']
        missing_fields = [field for field in required_fields if not request.data.get(field)]
        if missing_fields:
            return Response({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password match
        if request.data.get('password') != request.data.get('password2'):
            return Response({
                'error': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if email already exists
        email = request.data.get('email')
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'An account with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create super admin user directly
            full_name = request.data.get('full_name')
            name_parts = full_name.split(' ')
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            user = User.objects.create_user(
                email=email,
                password=request.data.get('password'),
                first_name=first_name,
                last_name=last_name,
                phone=request.data.get('phone', ''),
                role='ADMIN',
                is_staff=True,
                is_superuser=True,
                is_active=True,
                has_accepted_terms=True,
                username=email  # Use email as username since Django expects it
            )
            
            return Response({
                'message': f'Super admin account created successfully for {user.email}',
                'user_id': user.pk,  # Use pk instead of id for better type safety
                'user': {
                    'id': user.pk,  # Use pk instead of id for better type safety
                    'email': user.email,
                    'full_name': user.get_full_name(),
                    'role': getattr(user, 'role', 'ADMIN')
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Failed to create super admin account: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
