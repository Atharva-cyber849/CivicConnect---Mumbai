"""
Serializers for departments app.
"""
from rest_framework import serializers
from .models import Department, DepartmentStaff


class DepartmentStaffSerializer(serializers.ModelSerializer):
    """Serializer for department staff members."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = DepartmentStaff
        fields = ('id', 'user', 'user_name', 'user_email', 'role', 'can_be_assigned', 'max_assignments', 'joined_at')
        read_only_fields = ('id', 'joined_at')


class DepartmentListSerializer(serializers.ModelSerializer):
    """Serializer for department list view."""
    
    head_name = serializers.CharField(source='head.get_full_name', read_only=True)
    complaint_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ('id', 'name', 'description', 'email', 'phone', 'head_name', 
                  'is_active', 'complaint_count', 'created_at')
    
    def get_complaint_count(self, obj):
        return obj.complaints.count()


class DepartmentDetailSerializer(serializers.ModelSerializer):
    """Serializer for department detail view."""
    
    head_name = serializers.CharField(source='head.get_full_name', read_only=True)
    staff_members = DepartmentStaffSerializer(many=True, read_only=True)
    
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class DepartmentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating departments."""
    
    class Meta:
        model = Department
        fields = ('name', 'description', 'email', 'phone', 'head', 'categories', 'is_active')
