from django.db import models
from django.conf import settings
from apps.complaints.models import Complaint


class Notification(models.Model):
    class Type(models.TextChoices):
        INFO = 'info', 'Info'
        SUCCESS = 'success', 'Success'
        WARNING = 'warning', 'Warning'
        ERROR = 'error', 'Error'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.INFO)
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"Notification({self.user_id}): {self.message[:30]}"