"""
Complaint models for issue reporting and tracking.
"""
from typing import Optional
from django.db import models
from django.contrib.auth import get_user_model
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


class ComplaintAssignment(models.Model):
    """
    Track complaint assignments to officers with SLA tracking.
    """
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='assignment')
    assigned_to = models.ForeignKey(User, on_delete=models.PROTECT, related_name='complaint_assignments')
    department = models.ForeignKey('departments.Department', on_delete=models.PROTECT, related_name='complaint_assignments')
    
    # Assignment Details
    assigned_at = models.DateTimeField(auto_now_add=True)
    sla_target_days = models.IntegerField(default=7)
    
    class Meta:
        db_table = 'complaint_assignments'
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['assigned_to', '-assigned_at']),
            models.Index(fields=['complaint', 'assigned_at']),
        ]
    
    @property
    def sla_deadline(self):
        """Calculate SLA deadline based on assignment time and target days."""
        from datetime import timedelta
        return self.assigned_at + timedelta(days=self.sla_target_days)
    
    def __str__(self) -> str:
        return f"Assignment: {self.complaint.title} → {self.assigned_to.email}"


class ComplaintReassignment(models.Model):
    """
    Track complaint reassignments for audit trail.
    """
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='reassignments')
    previously_assigned_to = models.ForeignKey(User, on_delete=models.PROTECT, related_name='reassigned_from')
    reason = models.CharField(max_length=255)
    reassigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_reassignments'
        ordering = ['-reassigned_at']
        indexes = [
            models.Index(fields=['complaint', '-reassigned_at']),
        ]
    
    def __str__(self) -> str:
        return f"Reassignment of {self.complaint.title} from {self.previously_assigned_to.email}"


class OfficerRating(models.Model):
    """
    Store citizen ratings for officers after complaint resolution.
    """
    RATING_CHOICES = [
        (1, '1 Star - Very Poor'),
        (2, '2 Stars - Poor'),
        (3, '3 Stars - Average'),
        (4, '4 Stars - Good'),
        (5, '5 Stars - Excellent'),
    ]
    
    complaint = models.OneToOneField(Complaint, on_delete=models.CASCADE, related_name='officer_rating')
    officer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_ratings')
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_ratings')
    
    # Rating
    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True, help_text="Optional feedback from citizen")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'officer_ratings'
        ordering = ['-created_at']
        unique_together = ('complaint', 'officer', 'citizen')
        indexes = [
            models.Index(fields=['officer', '-created_at']),
            models.Index(fields=['complaint']),
        ]
    
    def __str__(self) -> str:
        return f"{self.get_rating_display()} for {self.officer.email} on {self.complaint.title}"


class OfficerPerformance(models.Model):
    """
    Aggregated performance metrics for officers.
    Updated daily or on-demand.
    """
    officer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='performance_metrics')
    
    # Complaint Statistics
    total_assigned = models.IntegerField(default=0)
    total_resolved = models.IntegerField(default=0)
    total_pending = models.IntegerField(default=0)
    total_rejected = models.IntegerField(default=0)
    
    # SLA Performance
    sla_compliant_count = models.IntegerField(default=0)
    sla_breached_count = models.IntegerField(default=0)
    sla_compliance_rate = models.FloatField(default=0.0)  # Percentage
    
    # Time Metrics
    avg_resolution_time_hours = models.FloatField(default=0.0)
    avg_resolution_time_days = models.FloatField(default=0.0)
    
    # Rating Metrics
    total_ratings = models.IntegerField(default=0)
    avg_rating = models.FloatField(default=0.0)  # 1.0 to 5.0
    five_star_count = models.IntegerField(default=0)
    four_star_count = models.IntegerField(default=0)
    three_star_count = models.IntegerField(default=0)
    two_star_count = models.IntegerField(default=0)
    one_star_count = models.IntegerField(default=0)
    
    # Department Comparison
    department_avg_rating = models.FloatField(default=0.0)
    department_avg_resolution_time = models.FloatField(default=0.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_calculated = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'officer_performance'
        verbose_name_plural = 'Officer Performance'
    
    def __str__(self) -> str:
        return f"Performance: {self.officer.email} - ⭐ {self.avg_rating}/5.0"


class PerformanceAuditLog(models.Model):
    """
    Track performance metric changes for audit trail.
    """
    officer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_audit_logs')
    
    # Metrics at time of log
    total_assigned = models.IntegerField()
    total_resolved = models.IntegerField()
    sla_compliance_rate = models.FloatField()
    avg_resolution_time_hours = models.FloatField()
    avg_rating = models.FloatField()
    
    # Change details
    reason = models.CharField(max_length=255, help_text="Why these metrics were calculated")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'performance_audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['officer', '-created_at']),
        ]
    
    def __str__(self) -> str:
        return f"Performance audit for {self.officer.email} on {self.created_at.date()}"

