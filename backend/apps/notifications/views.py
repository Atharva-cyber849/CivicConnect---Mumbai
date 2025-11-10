from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

from .models import Notification
from .serializers import NotificationSerializer
from apps.users.permissions import IsAdminUser

User = get_user_model()


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):  # type: ignore
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        qs = self.get_queryset().filter(is_read=False)
        updated = qs.update(is_read=True)
        return Response({'marked_read': updated})

    @action(detail=True, methods=['post', 'patch'])
    def read(self, request, pk=None):
        """Mark notification as read (supports both POST and PATCH)."""
        notif = get_object_or_404(self.get_queryset(), pk=pk)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Legacy endpoint for marking as read."""
        return self.read(request, pk)
    
    @action(detail=False, methods=['post'])
    def bulk_read(self, request):
        """Mark multiple notifications as read."""
        notification_ids = request.data.get('notification_ids', [])
        if not notification_ids:
            return Response(
                {'error': 'notification_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated = self.get_queryset().filter(
            id__in=notification_ids,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'marked_read': updated,
            'message': f'{updated} notifications marked as read'
        })
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple notifications."""
        notification_ids = request.data.get('notification_ids', [])
        if not notification_ids:
            return Response(
                {'error': 'notification_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count, _ = self.get_queryset().filter(
            id__in=notification_ids
        ).delete()
        
        return Response({
            'deleted': deleted_count,
            'message': f'{deleted_count} notifications deleted'
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def mute_type(self, request):
        """Mute a specific notification type (placeholder for user preferences)."""
        notification_type = request.data.get('notification_type')
        if not notification_type:
            return Response(
                {'error': 'notification_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement user notification preferences model
        return Response({
            'message': f'Notification type {notification_type} muted',
            'muted_type': notification_type
        })
    
    @action(detail=False, methods=['get', 'put'])
    def preferences(self, request):
        """Get or update notification preferences."""
        if request.method == 'GET':
            # TODO: Implement user notification preferences model
            # For now, return default preferences
            return Response({
                'email_notifications': True,
                'push_notifications': True,
                'sms_notifications': False,
                'muted_types': []
            })
        else:
            # TODO: Save preferences to database
            return Response({
                'message': 'Preferences updated successfully',
                'preferences': request.data
            })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def broadcast(self, request):
        """Send broadcast notification to all users (admin only)."""
        message = request.data.get('message')
        notification_type = request.data.get('type', 'info')
        target_role = request.data.get('target_role')  # Optional: target specific role
        
        if not message:
            return Response(
                {'error': 'message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get target users
        users = User.objects.filter(is_active=True)
        if target_role:
            users = users.filter(role=target_role)
        
        # Create notifications for all users
        notifications = [
            Notification(
                user=user,
                message=message,
                type=notification_type
            )
            for user in users
        ]
        
        created = Notification.objects.bulk_create(notifications)
        
        return Response({
            'message': 'Broadcast sent successfully',
            'recipients': len(created)
        })
    
    @action(detail=False, methods=['post'])
    def push_subscribe(self, request):
        """Subscribe to push notifications."""
        subscription = request.data.get('subscription')
        # TODO: Implement push notification subscription storage
        return Response({
            'message': 'Subscribed to push notifications',
            'subscription': subscription
        })
    
    @action(detail=False, methods=['post'])
    def push_unsubscribe(self, request):
        """Unsubscribe from push notifications."""
        # TODO: Implement push notification unsubscription
        return Response({
            'message': 'Unsubscribed from push notifications'
        })