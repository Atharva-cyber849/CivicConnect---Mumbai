"""
User serializers for authentication and user management.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(required=True, write_only=True)
    has_accepted_terms = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = (
            'full_name', 'email', 'phone', 'password', 'password2',
            'gender', 'age', 'ward', 'address', 'pincode',
            'language_preference', 'profile_picture', 'has_accepted_terms'
        )
    
    def validate_full_name(self, value):
        """Validate full name."""
        if not value.strip() or len(value.strip()) < 2:
            raise serializers.ValidationError("Please enter a valid name (minimum 2 characters).")
        if not all(part.isalpha() or part.isspace() for part in value):
            raise serializers.ValidationError("Name should only contain letters.")
        if len(value) > 50:
            raise serializers.ValidationError("Name is too long (maximum 50 characters).")
        return value.strip()
    
    def validate_phone(self, value):
        """Validate phone number."""
        if value:
            if not value.isdigit() or len(value) != 10 or not value[0] in '6789':
                raise serializers.ValidationError("Please enter a valid 10-digit Indian mobile number.")
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError("This mobile number is already registered.")
        return value
    
    def validate_age(self, value):
        """Validate age."""
        if value and (value < 18 or value > 120):
            raise serializers.ValidationError("Age must be between 18 and 120 years.")
        return value
    
    def validate_pincode(self, value):
        """Validate Mumbai pincode."""
        if value:
            if not value.isdigit() or len(value) != 6:
                raise serializers.ValidationError("Please enter a valid 6-digit pincode.")
            # Mumbai pincodes range from 400001 to 400107
            if not (400001 <= int(value) <= 400107):
                raise serializers.ValidationError("Please enter a valid Mumbai pincode.")
        return value
    
    def validate(self, attrs):
        """Validate the entire payload."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if not attrs.get('has_accepted_terms'):
            raise serializers.ValidationError({"has_accepted_terms": "You must accept the terms and conditions."})
        
        # Split full name into first_name and last_name
        full_name_parts = attrs.pop('full_name').split(maxsplit=1)
        attrs['first_name'] = full_name_parts[0]
        attrs['last_name'] = full_name_parts[1] if len(full_name_parts) > 1 else ''
        
        return attrs
    
    def create(self, validated_data):
        """Create a new user."""
        validated_data.pop('password2')
        validated_data.pop('has_accepted_terms')  # Already validated
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Send verification email (async task)
        # send_verification_email.delay(user.id)
        
        return user


class AdminRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for admin/officer registration."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(required=True, write_only=True)
    role = serializers.CharField(required=False)  # Will be set from URL/request
    
    class Meta:
        model = User
        fields = (
            'full_name', 'email', 'phone', 'password', 'password2', 'role'
        )
    
    def validate_full_name(self, value):
        """Validate full name."""
        if not value.strip() or len(value.strip()) < 2:
            raise serializers.ValidationError("Please enter a valid name (minimum 2 characters).")
        if not all(part.isalpha() or part.isspace() for part in value):
            raise serializers.ValidationError("Name should only contain letters.")
        if len(value) > 50:
            raise serializers.ValidationError("Name is too long (maximum 50 characters).")
        return value.strip()
    
    def validate_phone(self, value):
        """Validate phone number."""
        if value:
            if not value.isdigit() or len(value) != 10 or not value[0] in '6789':
                raise serializers.ValidationError("Please enter a valid 10-digit Indian mobile number.")
            if User.objects.filter(phone=value).exists():
                raise serializers.ValidationError("This mobile number is already registered.")
        return value
    
    def validate(self, attrs):
        """Validate the entire payload."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Split full name into first_name and last_name
        full_name_parts = attrs.pop('full_name').split(maxsplit=1)
        attrs['first_name'] = full_name_parts[0]
        attrs['last_name'] = full_name_parts[1] if len(full_name_parts) > 1 else ''
        
        return attrs
    
    def create(self, validated_data):
        """Create a new admin/officer user."""
        validated_data.pop('password2')
        role = validated_data.get('role', 'DEPARTMENT_STAFF')
        
        # Set staff privileges for admin users
        validated_data['is_staff'] = True
        if role == 'ADMIN':
            validated_data['is_superuser'] = True
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'role', 
                  'gender', 'age', 'ward', 'address', 'pincode', 'latitude', 'longitude',
                  'language_preference', 'profile_picture', 'created_at', 'updated_at')
        read_only_fields = ('id', 'email', 'role', 'created_at', 'updated_at')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone', 'gender', 'age', 'ward', 
                  'address', 'pincode', 'language_preference', 'profile_picture')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
