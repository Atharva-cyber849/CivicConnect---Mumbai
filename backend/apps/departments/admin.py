"""
Admin configuration for departments app.
"""
from django.contrib import admin
from .models import Department, DepartmentStaff


class DepartmentStaffInline(admin.TabularInline):
    """Inline admin for department staff."""
    model = DepartmentStaff
    extra = 1


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin interface for Department model."""
    
    list_display = ('id', 'name', 'email', 'head', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [DepartmentStaffInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'email', 'phone')
        }),
        ('Management', {
            'fields': ('head', 'categories', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(DepartmentStaff)
class DepartmentStaffAdmin(admin.ModelAdmin):
    """Admin interface for DepartmentStaff model."""
    
    list_display = ('id', 'department', 'user', 'role', 'can_be_assigned', 'joined_at')
    list_filter = ('can_be_assigned', 'joined_at')
    search_fields = ('department__name', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('joined_at',)
