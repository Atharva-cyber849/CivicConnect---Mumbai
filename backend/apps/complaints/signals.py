"""
Signals for complaints app.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Complaint
from .tasks import send_status_update_notification
from .assignment_service import ComplaintAssignmentService


@receiver(post_save, sender=Complaint)
def auto_assign_complaint(sender, instance, created, **kwargs):
    """
    Automatically assign a newly created complaint to an eligible officer.
    """
    if created and not instance.assigned_to:
        try:
            ComplaintAssignmentService.assign_complaint(instance)
        except Exception as e:
            # Log error but don't fail complaint creation
            print(f"Error auto-assigning complaint {instance.id}: {str(e)}")


@receiver(post_save, sender=Complaint)
def handle_complaint_status_change(sender, instance, created, **kwargs):
    """
    Handle complaint status changes.
    Send notification and update resolved_at timestamp.
    """
    if not created:
        # Check if status changed
        if instance.tracker.has_changed('status'):
            old_status = instance.tracker.previous('status')
            new_status = instance.status
            
            # Send notification
            send_status_update_notification.delay(
                instance.id, 
                old_status, 
                new_status
            )
            
            # Update resolved_at if status is resolved
            if new_status == 'RESOLVED' and not instance.resolved_at:
                instance.resolved_at = timezone.now()
                instance.save(update_fields=['resolved_at'])

