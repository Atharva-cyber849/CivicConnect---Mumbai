"""
Complaint models for issue reporting and tracking.
"""
from typing import Optional
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()


class Complaint(models.Model):
    """
    Complaint model for civic issue reporting.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    CATEGORY_CHOICES = [
        ('POTHOLE', 'Pothole'),
        ('STREETLIGHT', 'Street Light'),
        ('GARBAGE', 'Garbage/Waste'),
        ('WATER', 'Water Supply'),
        ('SEWAGE', 'Sewage'),
        ('ROAD_DAMAGE', 'Road Damage'),
        ('TRAFFIC_SIGNAL', 'Traffic Signal'),
        ('PARK', 'Park/Recreation'),
        ('NOISE', 'Noise Pollution'),
        ('OTHER', 'Other'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # User & Assignment
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, 
                                    null=True, blank=True, related_name='complaints')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='assigned_complaints')
    
    # Status & Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    
    # AI Classification
    ai_category = models.CharField(max_length=50, blank=True, null=True)
    ai_confidence_score = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # Location
    address = models.TextField()
    ward = models.CharField(max_length=10)  # For Mumbai wards like A, B, C, F/N, etc.
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Media (deprecated - use ComplaintImage model instead)
    image = models.ImageField(upload_to='complaints/', blank=True, null=True)
    
    # Assignment Details
    estimated_resolution_days = models.IntegerField(null=True, blank=True)
    assigned_officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                         related_name='officer_assigned_complaints')
    
    # Public Update
    public_update = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Admin Notes (deprecated - use OfficerNotes model instead)
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'complaints'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
        ]
    
    def get_status_display(self) -> str:
        """
        Get human-readable status.
        Django would normally add this automatically, but we're adding it manually for type checking.
        """
        return dict(self.STATUS_CHOICES).get(self.status, self.status)

    def __str__(self) -> str:
        return f"{self.title} - {self.get_status_display()}"


class ComplaintUpdate(models.Model):
    """
    Track updates/comments on complaints.
    """
    
    complaint = models.ForeignKey(
        Complaint, 
        on_delete=models.CASCADE, 
        related_name='updates'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE
    )
    message = models.TextField()
    
    # Optional status change
    previous_status = models.CharField(
        max_length=20, 
        choices=Complaint.STATUS_CHOICES,
        blank=True, 
        null=True
    )
    new_status = models.CharField(
        max_length=20, 
        choices=Complaint.STATUS_CHOICES,
        blank=True, 
        null=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_updates'
        ordering = ['-created_at']
    
    def get_previous_status_display(self) -> str:
        """Get human-readable previous status"""
        if not self.previous_status:
            return ""
        return dict(Complaint.STATUS_CHOICES).get(self.previous_status, self.previous_status)
        
    def get_new_status_display(self) -> str:
        """Get human-readable new status"""
        if not self.new_status:
            return ""
        return dict(Complaint.STATUS_CHOICES).get(self.new_status, self.new_status)
    
    def __str__(self) -> str:
        try:
            title = getattr(self.complaint, 'title', 'Unknown Complaint')
            email = getattr(self.user, 'email', 'Unknown User')
            return f"Update on {title} by {email}"
        except (AttributeError, Complaint.DoesNotExist, User.DoesNotExist):
            return f"Complaint Update {getattr(self, 'id', 'New')}"


class ComplaintImage(models.Model):
    """
    Store multiple images for a complaint.
    """
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='complaints/images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_images'
        ordering = ['uploaded_at']
    
    def __str__(self) -> str:
        return f"Image for {self.complaint.title}"


class ComplaintAttachment(models.Model):
    """
    Store attachments for a complaint.
    """
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='complaints/attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_attachments'
        ordering = ['uploaded_at']
    
    def __str__(self) -> str:
        return f"{self.file_name} - {self.complaint.title}"


class ComplaintTimeline(models.Model):
    """
    Track all status changes and updates for a complaint.
    """
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='timeline')
    
    # Status Change
    previous_status = models.CharField(max_length=20, choices=Complaint.STATUS_CHOICES)
    new_status = models.CharField(max_length=20, choices=Complaint.STATUS_CHOICES)
    
    # Update Info
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='complaint_timeline_updates')
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_timeline'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['complaint', '-created_at']),
        ]
    
    def __str__(self) -> str:
        return f"{self.complaint.title}: {self.previous_status} → {self.new_status}"


class ComplaintResolution(models.Model):
    """
    Store resolution details and proof for a complaint.
    """
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='resolution')
    
    # Resolution Details
    resolution_notes = models.TextField()
    resolution_date = models.DateTimeField()
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='resolved_complaints')
    
    # Proof
    proof_image = models.ImageField(upload_to='complaints/resolutions/')
    proof_document = models.FileField(upload_to='complaints/resolutions/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'complaint_resolutions'
    
    def __str__(self) -> str:
        return f"Resolution for {self.complaint.title}"


class OfficerNotes(models.Model):
    """
    Store internal notes from officers on complaints.
    """
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='officer_notes')
    officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='complaint_notes')
    
    # Notes
    notes = models.TextField()
    is_internal = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'officer_notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['complaint', '-created_at']),
        ]
    
    def __str__(self) -> str:
        return f"Notes by {self.officer.email if self.officer else 'Unknown'} on {self.complaint.title}"
