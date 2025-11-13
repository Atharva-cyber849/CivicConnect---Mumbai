# Model Refactoring Plan - CivicConnect

## Overview
This document outlines the complete refactoring of Django models to support proper filtering, submission, and fetching in the frontend.

## Current Issues

1. **Officer Model Missing**: Officers are currently stored in User model with role filtering
2. **Department-Officer Link Missing**: No direct relationship between departments and officers
3. **Missing Fields**: Officers lack department, ward, and designation fields
4. **Incomplete Complaint Model**: Missing fields for resolution, timeline, and attachments
5. **No Timeline Model**: Complaint status changes not tracked properly
6. **No Image/Attachment Models**: Images and attachments not properly stored

## Proposed Models

### 1. Officer Model (NEW)
**Purpose**: Dedicated model for officers/admins with all required fields

```python
class Officer(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('DEPARTMENT_STAFF', 'Department Staff'),
    ]
    
    # User Reference
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='officer_profile')
    
    # Assignment
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='officers')
    assigned_ward = models.CharField(max_length=10, choices=WARD_CHOICES)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    designation = models.CharField(max_length=100)
    
    # Contact
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    
    # Performance Metrics
    complaints_handled = models.IntegerField(default=0)
    average_resolution_time = models.FloatField(default=0.0, help_text="Average days to resolve")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'officers'
        unique_together = [['user', 'department']]
```

### 2. ComplaintImage Model (NEW)
**Purpose**: Store multiple images for a complaint

```python
class ComplaintImage(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='complaints/images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_images'
```

### 3. ComplaintAttachment Model (NEW)
**Purpose**: Store attachments for a complaint

```python
class ComplaintAttachment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='complaints/attachments/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_attachments'
```

### 4. ComplaintTimeline Model (NEW)
**Purpose**: Track all status changes and updates

```python
class ComplaintTimeline(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='timeline')
    
    # Status Change
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    
    # Update Info
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='complaint_updates')
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_timeline'
        ordering = ['-created_at']
```

### 5. ComplaintResolution Model (NEW)
**Purpose**: Store resolution details and proof

```python
class ComplaintResolution(models.Model):
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
```

### 6. OfficerNotes Model (NEW)
**Purpose**: Store internal notes from officers

```python
class OfficerNotes(models.Model):
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
```

### 7. Updated Complaint Model
**Changes**: Remove redundant fields, add relationships

```python
class Complaint(models.Model):
    # ... existing fields ...
    
    # Remove: image (use ComplaintImage instead)
    # Remove: admin_notes (use OfficerNotes instead)
    
    # Add: Relationships
    images = models.ManyToManyField(ComplaintImage, through='ComplaintImage')
    attachments = models.ManyToManyField(ComplaintAttachment, through='ComplaintAttachment')
    
    # Add: Additional fields
    estimated_resolution_days = models.IntegerField(null=True, blank=True)
    assigned_officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints')
    
    # Add: Public update
    public_update = models.TextField(blank=True, null=True)
```

### 8. Updated Department Model
**Changes**: Add missing fields

```python
class Department(models.Model):
    # ... existing fields ...
    
    # Add: Missing fields
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    categories = models.JSONField(default=list, help_text="Categories handled by this department")
```

## Migration Strategy

### Phase 1: Create New Models
1. Create Officer model
2. Create ComplaintImage model
3. Create ComplaintAttachment model
4. Create ComplaintTimeline model
5. Create ComplaintResolution model
6. Create OfficerNotes model

### Phase 2: Migrate Data
1. Create officers from User objects with ADMIN/DEPARTMENT_STAFF role
2. Link officers to departments
3. Migrate existing images to ComplaintImage
4. Create timeline entries from existing complaints

### Phase 3: Update Complaint Model
1. Add new relationships
2. Remove redundant fields
3. Update serializers

### Phase 4: Update Serializers
1. Create OfficerSerializer with all fields
2. Update ComplaintDetailSerializer with relationships
3. Create serializers for new models

## Database Changes

### New Tables
- `officers` - Officer profiles
- `complaint_images` - Complaint images
- `complaint_attachments` - Complaint attachments
- `complaint_timeline` - Status change history
- `complaint_resolutions` - Resolution details
- `officer_notes` - Internal officer notes

### Modified Tables
- `complaints` - Add new fields, remove redundant ones
- `departments` - Add email, phone, head

### Removed Fields
- `complaints.image` → Use ComplaintImage
- `complaints.admin_notes` → Use OfficerNotes

## Frontend Impact

### Benefits
✅ Proper image carousel with multiple images
✅ Complete timeline visualization
✅ Officer details with department and ward
✅ Resolution tracking with proof
✅ Internal notes management
✅ Better filtering and searching
✅ Proper data relationships

### API Changes
- `/api/officers/` - New endpoint with full details
- `/api/complaints/{id}/images/` - Image management
- `/api/complaints/{id}/timeline/` - Timeline data
- `/api/complaints/{id}/resolution/` - Resolution details
- `/api/complaints/{id}/notes/` - Officer notes

## Implementation Steps

1. **Create migrations** for all new models
2. **Write data migration** to populate Officer model from User
3. **Update serializers** for new models
4. **Create viewsets** for new models
5. **Update URLs** for new endpoints
6. **Test API** endpoints
7. **Update frontend** to use new endpoints

## Estimated Impact
- **New Models**: 6
- **Modified Models**: 2
- **New Endpoints**: 5+
- **Migration Files**: 2-3
- **Serializers to Create**: 8+
- **Breaking Changes**: Yes (Officer model structure)

## Rollback Plan
- Keep User model with role field for backward compatibility
- Create Officer model as optional extension
- Gradual migration of frontend to new endpoints

## Notes
- All timestamps use UTC
- All images use S3/media storage
- Relationships use CASCADE/SET_NULL for data integrity
- Unique constraints prevent duplicate entries
