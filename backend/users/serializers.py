from typing import Any, Dict, Optional, TYPE_CHECKING
from collections import OrderedDict
from rest_framework import serializers

if TYPE_CHECKING:
    from .models import User, Department, UserLoginHistory
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from .models import Department, UserLoginHistory, User
from .utils import safe_get_attr, ensure_user_type

User = get_user_model()

class SafeModelSerializer(serializers.ModelSerializer):
    """Base serializer that implements safe attribute access"""
    
    def safe_get(self, obj: Any, attr: str, default: Any = None) -> Any:
        return safe_get_attr(obj, attr, default)

class DepartmentSerializer(SafeModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description']
        
    def to_representation(self, instance: Any) -> OrderedDict:
        """Safe conversion of department instance to dictionary"""
        return OrderedDict([
            ('id', self.safe_get(instance, 'id')),
            ('name', self.safe_get(instance, 'name', '')),
            ('code', self.safe_get(instance, 'code', '')),
            ('description', self.safe_get(instance, 'description', ''))
        ])

class UserSerializer(SafeModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'username', 'email', 'phone',
            'role', 'department', 'department_id', 'designation',
            'ward', 'profile_picture', 'language_preference',
            'is_email_verified', 'is_phone_verified', 'status',
            'gender', 'age', 'address', 'pincode',
            'latitude', 'longitude', 'employee_id'
        ]
        read_only_fields = [
            'is_email_verified', 'is_phone_verified',
            'status', 'employee_id'
        ]
        
    def to_representation(self, instance: Any) -> OrderedDict:
        """Safe conversion of user instance to dictionary"""
        data = {
            'id': self.safe_get(instance, 'id'),
            'full_name': self.safe_get(instance, 'full_name', ''),
            'username': self.safe_get(instance, 'username', ''),
            'email': self.safe_get(instance, 'email', ''),
            'phone': self.safe_get(instance, 'phone', ''),
            'role': self.safe_get(instance, 'role', 'citizen'),
            'designation': self.safe_get(instance, 'designation', ''),
            'ward': self.safe_get(instance, 'ward', ''),
            'profile_picture': self.safe_get(instance, 'profile_picture'),
            'language_preference': self.safe_get(instance, 'language_preference', 'EN'),
            'is_email_verified': self.safe_get(instance, 'is_email_verified', False),
            'is_phone_verified': self.safe_get(instance, 'is_phone_verified', False),
            'status': self.safe_get(instance, 'status', 'active'),
            'gender': self.safe_get(instance, 'gender', ''),
            'age': self.safe_get(instance, 'age'),
            'address': self.safe_get(instance, 'address', ''),
            'pincode': self.safe_get(instance, 'pincode', ''),
            'latitude': self.safe_get(instance, 'latitude'),
            'longitude': self.safe_get(instance, 'longitude'),
            'employee_id': self.safe_get(instance, 'employee_id', '')
        }
        
        # Handle department separately since it's a nested serializer
        department = self.safe_get(instance, 'department')
        if department:
            data['department'] = DepartmentSerializer(department).data
        else:
            data['department'] = None
            
        return OrderedDict(data.items())

class AdminRegistrationSerializer(SafeModelSerializer):
    password2 = serializers.CharField(write_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        required=True
    )

    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'phone', 'password', 'password2',
            'role', 'department_id', 'designation', 'ward'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {
                'required': True,
                'validators': [
                    RegexValidator(
                        regex=r'^[a-zA-Z0-9._%+-]+@bmc\.gov\.in$',
                        message='Must use an official BMC email address (@bmc.gov.in)'
                    )
                ]
            }
        }

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # Validate role
        role = attrs.get('role')
        if role not in ['admin', 'officer']:
            raise serializers.ValidationError({
                'role': 'Invalid role. Must be either admin or officer.'
            })

        # Validate passwords
        password = attrs.get('password')
        password2 = attrs.pop('password2', None)
        if password != password2:
            raise serializers.ValidationError({
                'password2': "Passwords don't match."
            })

        if password:
            validate_password(password)

        # Officers must have a ward assigned
        if role == 'officer' and not attrs.get('ward'):
            raise serializers.ValidationError({
                'ward': 'Ward is required for officers.'
            })

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        
        # Only super admins can create other admins/officers
        if not request or not request.user.role == 'super_admin':
            raise serializers.ValidationError({
                'detail': 'Only super admins can create admin/officer accounts.'
            })

        validated_data['created_by'] = request.user
        validated_data['has_accepted_terms'] = True  # Auto-accept for staff
        validated_data['is_staff'] = True

        user = User.objects.create_user(**validated_data)
        return user

class CitizenRegistrationSerializer(SafeModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'phone', 'password', 'password2',
            'gender', 'age', 'ward', 'address', 'pincode',
            'language_preference', 'has_accepted_terms',
            'latitude', 'longitude', 'profile_picture'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'has_accepted_terms': {'required': True},
        }

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # Validate passwords
        password = attrs.get('password')
        password2 = attrs.pop('password2', None)
        if password != password2:
            raise serializers.ValidationError({
                'password2': "Passwords don't match."
            })

        if password:
            validate_password(password)

        # Validate terms acceptance
        if not attrs.get('has_accepted_terms'):
            raise serializers.ValidationError({
                'has_accepted_terms': 'You must accept the terms and conditions.'
            })

        # Set role to citizen
        attrs['role'] = 'citizen'
        return attrs

    def create(self, validated_data):
        validated_data['role'] = 'citizen'
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(SafeModelSerializer):
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone',
            'gender', 'age', 'profile_picture',
            'ward', 'address', 'pincode',
            'language_preference', 'notification_email',
            'notification_sms', 'department', 'designation',
            'role', 'is_email_verified', 'is_phone_verified',
            'latitude', 'longitude'
        ]
        read_only_fields = [
            'role', 'is_email_verified', 'is_phone_verified',
            'department', 'designation'
        ]
        
    def to_representation(self, instance: Any) -> OrderedDict:
        """Safe conversion of user profile to dictionary"""
        data = {
            'id': self.safe_get(instance, 'id'),
            'full_name': self.safe_get(instance, 'full_name', ''),
            'email': self.safe_get(instance, 'email', ''),
            'phone': self.safe_get(instance, 'phone', ''),
            'gender': self.safe_get(instance, 'gender', ''),
            'age': self.safe_get(instance, 'age'),
            'profile_picture': self.safe_get(instance, 'profile_picture'),
            'ward': self.safe_get(instance, 'ward', ''),
            'address': self.safe_get(instance, 'address', ''),
            'pincode': self.safe_get(instance, 'pincode', ''),
            'language_preference': self.safe_get(instance, 'language_preference', 'EN'),
            'notification_email': self.safe_get(instance, 'notification_email', True),
            'notification_sms': self.safe_get(instance, 'notification_sms', True),
            'designation': self.safe_get(instance, 'designation', ''),
            'role': self.safe_get(instance, 'role', 'citizen'),
            'is_email_verified': self.safe_get(instance, 'is_email_verified', False),
            'is_phone_verified': self.safe_get(instance, 'is_phone_verified', False),
            'latitude': self.safe_get(instance, 'latitude'),
            'longitude': self.safe_get(instance, 'longitude')
        }
        
        # Handle department separately since it's a nested serializer
        department = self.safe_get(instance, 'department')
        if department:
            data['department'] = DepartmentSerializer(department).data
        else:
            data['department'] = None
            
        return OrderedDict(data.items())

class AdminUpdateSerializer(SafeModelSerializer):
    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'phone',
            'department', 'designation', 'ward',
            'status'
        ]
        read_only_fields = ['email']  # Email can't be changed once set

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        instance = ensure_user_type(self.instance)
        if instance and self.safe_get(instance, 'role') == 'officer' and not attrs.get('ward'):
            raise serializers.ValidationError({
                'ward': 'Ward is required for officers.'
            })

        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # Extract passwords with safe access
        new_password = attrs.get('new_password')
        new_password2 = attrs.get('new_password2')
        
        if not new_password or not new_password2:
            raise serializers.ValidationError({
                'new_password': "New password is required."
            })
            
        if new_password != new_password2:
            raise serializers.ValidationError({
                'new_password2': "New passwords don't match."
            })

        validate_password(new_password)
        return attrs

class UserLoginHistorySerializer(SafeModelSerializer):
    class Meta:
        model = UserLoginHistory
        fields = ['timestamp', 'ip_address', 'user_agent', 'was_successful', 'failure_reason']
        
    def to_representation(self, instance: Any) -> OrderedDict:
        """Safe conversion of login history to dictionary"""
        return OrderedDict([
            ('timestamp', self.safe_get(instance, 'timestamp')),
            ('ip_address', self.safe_get(instance, 'ip_address', '')),
            ('user_agent', self.safe_get(instance, 'user_agent', '')),
            ('was_successful', self.safe_get(instance, 'was_successful', False)),
            ('failure_reason', self.safe_get(instance, 'failure_reason', ''))
        ])