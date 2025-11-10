"""
Admin configuration for complaints app.
"""
from django.contrib import admin
from .models import Complaint, ComplaintUpdate


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    """Admin interface for Complaint model."""
    
    list_display = ('id', 'title', 'category', 'status', 'priority', 'user', 'department', 'created_at')
    list_filter = ('status', 'category', 'priority', 'department', 'created_at')
    search_fields = ('title', 'description', 'address', 'user__email')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at', 'ai_category', 'ai_confidence_score')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'image')
        }),
        ('User & Assignment', {
            'fields': ('user', 'department', 'assigned_to')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'admin_notes')
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'zip_code', 'latitude', 'longitude')
        }),
        ('AI Classification', {
            'fields': ('ai_category', 'ai_confidence_score')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )


@admin.register(ComplaintUpdate)
class ComplaintUpdateAdmin(admin.ModelAdmin):
    """Admin interface for ComplaintUpdate model."""
    
    list_display = ('id', 'complaint', 'user', 'previous_status', 'new_status', 'created_at')
    list_filter = ('created_at', 'previous_status', 'new_status')
    search_fields = ('complaint__title', 'user__email', 'message')
    readonly_fields = ('created_at',)
