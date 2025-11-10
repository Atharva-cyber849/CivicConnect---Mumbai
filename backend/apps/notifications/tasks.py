"""
Celery tasks for notifications.
"""
from celery import shared_task
from .utils import (
    notify_complaint_created,
    notify_status_change,
    notify_department_assignment,
    notify_staff_assignment
)
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_complaint_created_notification(complaint_id):
    """Async task to send notification when complaint is created."""
    from apps.complaints.models import Complaint
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        notify_complaint_created(complaint)
        logger.info(f"Sent complaint created notification for #{complaint_id}")
    except Exception as e:
        logger.error(f"Error sending complaint created notification: {str(e)}")


@shared_task
def send_status_change_notification(complaint_id, old_status, new_status):
    """Async task to send notification when status changes."""
    from apps.complaints.models import Complaint
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        notify_status_change(complaint, old_status, new_status)
        logger.info(f"Sent status change notification for #{complaint_id}")
    except Exception as e:
        logger.error(f"Error sending status change notification: {str(e)}")


@shared_task
def send_department_assignment_notification(complaint_id, department_id):
    """Async task to send notification when assigned to department."""
    from apps.complaints.models import Complaint
    from apps.departments.models import Department
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        department = Department.objects.get(id=department_id)
        notify_department_assignment(complaint, department)
        logger.info(f"Sent department assignment notification for #{complaint_id}")
    except Exception as e:
        logger.error(f"Error sending department assignment notification: {str(e)}")


@shared_task
def send_staff_assignment_notification(complaint_id, staff_user_id):
    """Async task to send notification when assigned to staff member."""
    from apps.complaints.models import Complaint
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        staff_user = User.objects.get(id=staff_user_id)
        notify_staff_assignment(complaint, staff_user)
        logger.info(f"Sent staff assignment notification for #{complaint_id}")
    except Exception as e:
        logger.error(f"Error sending staff assignment notification: {str(e)}")
