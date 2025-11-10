"""Notification utility helpers.

This module now provides two layers:
1. Email notification sending (existing helpers preserved for possible future use).
2. Creation of in-app persistent Notification records for real-time UI display.
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth import get_user_model
import logging

from .models import Notification

logger = logging.getLogger(__name__)


def create_notification(user, message, type='info', complaint=None):
    """Create a single in-app notification record.

    Args:
        user: User instance who will receive the notification
        message: Short descriptive message (<=255 chars)
        type: One of Notification.Type values (info/success/warning/error)
        complaint: Optional Complaint instance for contextual linking
    Returns:
        Notification instance
    """
    return Notification.objects.create(user=user, message=message[:255], type=type, complaint=complaint)


def create_admin_notifications(message, type='info', complaint=None):
    """Fan-out a notification to all active admin users."""
    User = get_user_model()
    admins = User.objects.filter(role='ADMIN', is_active=True)
    created = []
    for admin in admins:
        created.append(create_notification(admin, message, type=type, complaint=complaint))
    return created


def send_email_notification(subject, message, recipient_list, html_message=None):
    """Send email (kept for future enhancement)."""
    try:
        if html_message:
            msg = EmailMultiAlternatives(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list
            )
            msg.attach_alternative(html_message, "text/html")
            msg.send()
        else:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )
        logger.info(f"Email sent to {len(recipient_list)} recipients")
        return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False


def notify_complaint_created(complaint):
    """Create admin notifications + optional email when new complaint is submitted."""
    msg = f"New complaint submitted: {complaint.title} (#{complaint.id})"
    create_admin_notifications(msg, type='info', complaint=complaint)
    return True


def notify_status_change(complaint, old_status, new_status):
    """Notify complaint owner of status change."""
    status_msg = f"Status updated from {old_status} to {new_status} for complaint '{complaint.title}'"
    create_notification(complaint.user, status_msg, type='info', complaint=complaint)
    return True


def notify_department_assignment(complaint, department):
    """Notify department (admin style fan-out only if department has staff later)."""
    if not department:
        return False
    msg = f"Complaint '{complaint.title}' assigned to department {department.name}"
    # For now broadcast to admins; later could target department staff list.
    create_admin_notifications(msg, type='info', complaint=complaint)
    return True


def notify_staff_assignment(complaint, staff_user):
    """Notify a specific staff member of assignment."""
    if not staff_user:
        return False
    msg = f"Complaint '{complaint.title}' assigned to you"
    create_notification(staff_user, msg, type='info', complaint=complaint)
    return True
