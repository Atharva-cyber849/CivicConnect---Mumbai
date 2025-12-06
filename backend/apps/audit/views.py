"""
API views for Audit Logging.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .models import AuditLog, LoginAttempt
from .serializers import AuditLogSerializer, LoginAttemptSerializer
from apps.users.permissions import IsSuperAdmin


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing audit logs.
    Only super admins can access audit logs.
    """
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        """Get audit logs with optional filtering."""
        queryset = AuditLog.objects.all()
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by object type
        object_type = self.request.query_params.get('object_type')
        if object_type:
            queryset = queryset.filter(object_type=object_type)
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent audit logs (last 24 hours)."""
        since = timezone.now() - timedelta(hours=24)
        logs = self.get_queryset().filter(timestamp__gte=since)[:100]
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def security_events(self, request):
        """Get security-related audit events."""
        security_actions = [
            'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE',
            'PASSWORD_RESET', 'GRANT_PERMISSION', 'REVOKE_PERMISSION', 'CHANGE_ROLE'
        ]
        logs = self.get_queryset().filter(action__in=security_actions)[:100]
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get audit log summary statistics."""
        queryset = self.get_queryset()
        
        # Last 24 hours
        since_24h = timezone.now() - timedelta(hours=24)
        since_7d = timezone.now() - timedelta(days=7)
        
        summary = {
            'total_logs': queryset.count(),
            'last_24_hours': queryset.filter(timestamp__gte=since_24h).count(),
            'last_7_days': queryset.filter(timestamp__gte=since_7d).count(),
            'by_action': {},
            'by_severity': {},
        }
        
        # Count by action
        for action, _ in AuditLog.ACTION_CHOICES:
            count = queryset.filter(action=action).count()
            if count > 0:
                summary['by_action'][action] = count
        
        # Count by severity
        for severity, _ in AuditLog.SEVERITY_CHOICES:
            count = queryset.filter(severity=severity).count()
            if count > 0:
                summary['by_severity'][severity] = count
        
        return Response(summary)


class LoginAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing login attempts.
    Only super admins can access login attempt records.
    """
    serializer_class = LoginAttemptSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        """Get login attempts with optional filtering."""
        queryset = LoginAttempt.objects.all()
        
        # Filter by email
        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email=email)
        
        # Filter by success
        success = self.request.query_params.get('success')
        if success is not None:
            queryset = queryset.filter(success=success.lower() == 'true')
        
        # Filter by IP address
        ip_address = self.request.query_params.get('ip_address')
        if ip_address:
            queryset = queryset.filter(ip_address=ip_address)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def failed_attempts(self, request):
        """Get recent failed login attempts."""
        since = timezone.now() - timedelta(hours=24)
        attempts = self.get_queryset().filter(
            success=False,
            timestamp__gte=since
        ).order_by('-timestamp')[:100]
        serializer = self.get_serializer(attempts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def suspicious(self, request):
        """Get suspicious login attempts (many failed attempts from same IP)."""
        since = timezone.now() - timedelta(hours=1)
        
        # Get IPs with more than 5 failed attempts in the last hour
        from django.db.models import Count
        suspicious_ips = LoginAttempt.objects.filter(
            success=False,
            timestamp__gte=since
        ).values('ip_address').annotate(
            count=Count('id')
        ).filter(count__gte=5)
        
        return Response({
            'suspicious_ips': list(suspicious_ips),
            'threshold': 5,
            'time_window_hours': 1
        })
