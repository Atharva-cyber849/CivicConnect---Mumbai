"""
Audit Logging Models

Provides comprehensive audit logging for RBAC-related actions.
All user actions are logged for compliance and security monitoring.
"""
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone


class AuditLog(models.Model):
    """
    Comprehensive audit logging for all user actions.
    
    Tracks:
    - Who performed the action (user)
    - What action was performed (action type)
    - What object was affected (object_type, object_id)
    - When it occurred (timestamp)
    - Additional details (JSON field)
    - Client information (ip_address, user_agent)
    """
    
    # Action type choices
    ACTION_CHOICES = [
        # Authentication actions
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('LOGIN_FAILED', 'Failed Login Attempt'),
        ('PASSWORD_CHANGE', 'Password Changed'),
        ('PASSWORD_RESET', 'Password Reset'),
        
        # User management actions
        ('CREATE_USER', 'User Created'),
        ('UPDATE_USER', 'User Updated'),
        ('DELETE_USER', 'User Deleted'),
        ('TOGGLE_USER_STATUS', 'User Status Toggled'),
        ('UPDATE_USER_STATUS', 'User Status Updated'),
        
        # Complaint actions
        ('CREATE_COMPLAINT', 'Complaint Created'),
        ('UPDATE_COMPLAINT', 'Complaint Updated'),
        ('ASSIGN_COMPLAINT', 'Complaint Assigned'),
        ('CLOSE_COMPLAINT', 'Complaint Closed'),
        ('DELETE_COMPLAINT', 'Complaint Deleted'),
        
        # Permission/Role actions
        ('GRANT_PERMISSION', 'Permission Granted'),
        ('REVOKE_PERMISSION', 'Permission Revoked'),
        ('CHANGE_ROLE', 'Role Changed'),
        
        # Bulk actions
        ('BULK_UPDATE', 'Bulk Update'),
        ('BULK_DELETE', 'Bulk Delete'),
        
        # Other
        ('VIEW', 'View Resource'),
        ('EXPORT', 'Data Exported'),
        ('OTHER', 'Other Action'),
    ]
    
    SEVERITY_CHOICES = [
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Critical'),
    ]
    
    # Who performed the action
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text='User who performed the action'
    )
    
    # What action was performed
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        db_index=True,
        help_text='Type of action performed'
    )
    
    # What object was affected
    object_type = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Type of object affected (e.g., User, Complaint)'
    )
    
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='ID of the affected object'
    )
    
    # Optional: GenericForeignKey for direct object reference
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Additional details stored as JSON
    details = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional details about the action (stored as JSON)'
    )
    
    # Severity level
    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_CHOICES,
        default='INFO',
        help_text='Severity level of the action'
    )
    
    # Client information
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of the client'
    )
    
    user_agent = models.TextField(
        blank=True,
        default='',
        help_text='User agent string of the client'
    )
    
    # Timestamps
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text='When the action occurred'
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['object_type', 'object_id']),
        ]
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Anonymous'
        return f"{user_str} - {self.get_action_display()} - {self.timestamp}"
    
    @classmethod
    def log(cls, user, action, object_type='', object_id=None, details=None, 
            severity='INFO', ip_address=None, user_agent='', request=None):
        """
        Convenience method to create an audit log entry.
        
        Args:
            user: User who performed the action
            action: Action type (from ACTION_CHOICES)
            object_type: Type of object affected
            object_id: ID of affected object
            details: Additional details (dict)
            severity: Severity level
            ip_address: Client IP address
            user_agent: Client user agent
            request: Optional Django request to extract IP and user agent
        
        Returns:
            AuditLog instance
        """
        if request:
            # Extract IP address from request
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Extract user agent from request
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        return cls.objects.create(
            user=user,
            action=action,
            object_type=object_type,
            object_id=object_id,
            details=details or {},
            severity=severity,
            ip_address=ip_address,
            user_agent=user_agent
        )


class LoginAttempt(models.Model):
    """
    Track login attempts for security monitoring.
    Used to detect brute force attacks and suspicious activity.
    """
    
    email = models.EmailField(
        help_text='Email address used for login attempt'
    )
    
    success = models.BooleanField(
        default=False,
        help_text='Whether the login attempt was successful'
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of the client'
    )
    
    user_agent = models.TextField(
        blank=True,
        default='',
        help_text='User agent string of the client'
    )
    
    failure_reason = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Reason for failed login attempt'
    )
    
    timestamp = models.DateTimeField(
        default=timezone.now,
        db_index=True
    )
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Login Attempt'
        verbose_name_plural = 'Login Attempts'
        indexes = [
            models.Index(fields=['email', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        status = 'Success' if self.success else 'Failed'
        return f"{self.email} - {status} - {self.timestamp}"
    
    @classmethod
    def record(cls, email, success, ip_address=None, user_agent='', failure_reason='', request=None):
        """
        Convenience method to record a login attempt.
        
        Args:
            email: Email address used
            success: Whether login was successful
            ip_address: Client IP address
            user_agent: Client user agent
            failure_reason: Reason for failure (if applicable)
            request: Optional Django request to extract IP and user agent
        
        Returns:
            LoginAttempt instance
        """
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        return cls.objects.create(
            email=email,
            success=success,
            ip_address=ip_address,
            user_agent=user_agent,
            failure_reason=failure_reason
        )
