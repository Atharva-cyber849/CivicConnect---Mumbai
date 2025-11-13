"""
Celery tasks for complaints processing.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import requests
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def process_complaint_with_ai(complaint_id):
    """
    Process complaint image and description with AI service.
    Updates category and confidence score.
    NOTE: AI service is optional. If not available, task completes gracefully.
    """
    from .models import Complaint
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        
        # Check if AI_SERVICE_URL is configured
        if not hasattr(settings, 'AI_SERVICE_URL') or not settings.AI_SERVICE_URL:
            logger.info(f"AI service not configured, skipping AI processing for complaint {complaint_id}")
            return
        
        # Prepare data for AI service
        ai_service_url = f"{settings.AI_SERVICE_URL}/predict"
        
        data = {
            'description': complaint.description,
            'category': complaint.category,
        }
        
        # Add image if exists
        files = {}
        if complaint.image:
            files['image'] = complaint.image.read()
        
        # Call AI service with timeout
        try:
            response = requests.post(ai_service_url, data=data, files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Update complaint with AI results
                complaint.ai_category = result.get('predicted_category')
                complaint.ai_confidence_score = result.get('confidence_score')
                complaint.save()
                
                logger.info(f"AI processing completed for complaint {complaint_id}")
            else:
                logger.warning(f"AI service returned status {response.status_code} for complaint {complaint_id}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"AI service unavailable for complaint {complaint_id}: {str(e)}")
            # Continue without AI - complaint is still valid
    
    except Exception as e:
        logger.error(f"Error processing complaint {complaint_id} with AI: {str(e)}")


@shared_task
def send_complaint_notification(complaint_id):
    """
    Send email notification to admins when new complaint is created.
    """
    from .models import Complaint
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        
        # Get all admin users
        admin_emails = User.objects.filter(role='ADMIN', is_active=True).values_list('email', flat=True)
        
        if admin_emails:
            subject = f"New Complaint: {complaint.title}"
            message = f"""
A new complaint has been submitted:

Title: {complaint.title}
Category: {complaint.get_category_display()}
Location: {complaint.address}, {complaint.city}
Submitted by: {complaint.user.get_full_name()}

Please review and assign to appropriate department.
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                admin_emails,
                fail_silently=False,
            )
            
            logger.info(f"Notification sent for complaint {complaint_id}")
    
    except Exception as e:
        logger.error(f"Error sending notification for complaint {complaint_id}: {str(e)}")


@shared_task
def send_status_update_notification(complaint_id, old_status, new_status):
    """
    Send email notification to user when complaint status changes.
    """
    from .models import Complaint
    
    try:
        complaint = Complaint.objects.get(id=complaint_id)
        
        subject = f"Complaint Update: {complaint.title}"
        message = f"""
Your complaint status has been updated:

Title: {complaint.title}
Previous Status: {old_status}
New Status: {new_status}

Thank you for reporting this issue.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [complaint.user.email],
            fail_silently=False,
        )
        
        logger.info(f"Status update notification sent for complaint {complaint_id}")
    
    except Exception as e:
        logger.error(f"Error sending status update for complaint {complaint_id}: {str(e)}")
