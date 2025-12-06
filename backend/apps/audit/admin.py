"""
Admin interface for Audit Logging.
"""
from django.contrib import admin
from .models import AuditLog, LoginAttempt


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Admin interface for AuditLog model."""
    
    list_display = [
        'timestamp', 'user', 'action', 'object_type', 
        'object_id', 'severity', 'ip_address'
    ]
    list_filter = ['action', 'severity', 'timestamp', 'object_type']
    search_fields = ['user__email', 'object_type', 'details', 'ip_address']
    readonly_fields = [
        'user', 'action', 'object_type', 'object_id', 
        'details', 'severity', 'ip_address', 'user_agent', 'timestamp'
    ]
    ordering = ['-timestamp']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        # Audit logs should only be created programmatically
        return False
    
    def has_change_permission(self, request, obj=None):
        # Audit logs should be immutable
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Only superusers can delete audit logs
        return request.user.is_superuser


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """Admin interface for LoginAttempt model."""
    
    list_display = [
        'timestamp', 'email', 'success', 'ip_address', 'failure_reason'
    ]
    list_filter = ['success', 'timestamp']
    search_fields = ['email', 'ip_address']
    readonly_fields = [
        'email', 'success', 'ip_address', 'user_agent', 
        'failure_reason', 'timestamp'
    ]
    ordering = ['-timestamp']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
