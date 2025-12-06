"""
Serializers for Audit Logging.
"""
from rest_framework import serializers
from .models import AuditLog, LoginAttempt


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for AuditLog model."""
    
    user_email = serializers.SerializerMethodField()
    action_display = serializers.SerializerMethodField()
    severity_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'action', 'action_display',
            'object_type', 'object_id', 'details', 'severity', 
            'severity_display', 'ip_address', 'user_agent', 'timestamp'
        ]
        read_only_fields = fields
    
    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'Anonymous'
    
    def get_action_display(self, obj):
        return obj.get_action_display()
    
    def get_severity_display(self, obj):
        return obj.get_severity_display()


class LoginAttemptSerializer(serializers.ModelSerializer):
    """Serializer for LoginAttempt model."""
    
    class Meta:
        model = LoginAttempt
        fields = [
            'id', 'email', 'success', 'ip_address', 
            'user_agent', 'failure_reason', 'timestamp'
        ]
        read_only_fields = fields
