"""
Department models for complaint routing and management.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Department(models.Model):
    """
    Department model for organizing complaint handling.
    """
    
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True, null=True)
    
    # Department head
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                              related_name='headed_departments')
    
    # Categories this department handles
    categories = models.JSONField(default=list, help_text="List of complaint categories this department handles")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'departments'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DepartmentStaff(models.Model):
    """
    Many-to-many relationship between departments and staff members.
    """
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='staff_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='department_memberships')
    role = models.CharField(max_length=100, default='Staff')
    
    # Assignment preferences
    can_be_assigned = models.BooleanField(default=True)
    max_assignments = models.IntegerField(default=10, help_text="Maximum number of concurrent assignments")
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'department_staff'
        unique_together = [['department', 'user']]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.department.name}"
