from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # type: ignore
        """Only return notifications for the current user"""
        from django.db.models import QuerySet
        qs = Notification.objects.filter(user=self.request.user)
        return qs  # type: ignore

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        now = timezone.now()
        self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=now
        )
        return Response({'status': 'all notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (last 7 days)"""
        seven_days_ago = timezone.now() - timezone.timedelta(days=7)
        notifications = self.get_queryset().filter(
            created_at__gte=seven_days_ago
        )[:10]
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)