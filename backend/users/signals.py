from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import User
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Send welcome email when a new user is created
    """
    if created:
        try:
            template = (
                'users/email/welcome_staff.html' 
                if instance.is_staff_member else 
                'users/email/welcome_citizen.html'
            )
            
            context = {
                'user': instance,
                'login_url': settings.FRONTEND_URL + '/login'
            }
            
            html_message = render_to_string(template, context)
            
            send_mail(
                subject='Welcome to Snap & Report Mumbai!',
                message='',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.email],
                html_message=html_message
            )
            
        except Exception as e:
            logger.error(f'Failed to send welcome email to {instance.email}: {str(e)}')

@receiver(pre_save, sender=User)
def handle_status_change(sender, instance, **kwargs):
    """
    Send email notification when user status changes
    """
    try:
        if not instance.pk:  # New user
            return
            
        old_instance = User.objects.get(pk=instance.pk)
        
        if old_instance.status != instance.status:
            template = 'users/email/status_change.html'
            context = {
                'user': instance,
                'old_status': old_instance.status,
                'new_status': instance.status,
                'login_url': settings.FRONTEND_URL + '/login'
            }
            
            html_message = render_to_string(template, context)
            
            send_mail(
                subject='Your Account Status Has Changed',
                message='',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.email],
                html_message=html_message
            )
            
    except Exception as e:
        logger.error(f'Failed to handle status change for {instance.email}: {str(e)}')

@receiver(post_save, sender=User)
def create_department_notifications(sender, instance, created, **kwargs):
    """
    Create notifications for department admins when new staff is added
    """
    if created and instance.is_staff_member and instance.department:
        try:
            from notifications.models import Notification
            admins = User.objects.filter(
                department=instance.department,
                role='admin'
            )
            
            notifications = []
            for admin in admins:
                notifications.append(
                    Notification(
                        user=admin,
                        title='New Staff Member Added',
                        message=f'{instance.full_name} has been added as {instance.get_role_display()} in your department.',
                        category='staff',
                        data={
                            'user_id': instance.id,
                            'role': instance.role
                        }
                    )
                )
            
            # Bulk create notifications
            if notifications:
                Notification.objects.bulk_create(notifications)
                
        except Exception as e:
            logger.error(f'Failed to create department notifications: {str(e)}')