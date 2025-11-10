from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Department Admin'),
        ('officer', 'Ward Officer'),
        ('citizen', 'Citizen'),
    ]

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]

    LANGUAGE_CHOICES = [
        ('EN', 'English'),
        ('MR', 'Marathi'),
    ]

    # Personal Information
    full_name = models.CharField(max_length=255)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    # Contact Information
    phone_regex = RegexValidator(
        regex=r'^[6-9]\d{9}$',
        message="Phone number must be a valid 10-digit Indian mobile number"
    )
    phone = models.CharField(validators=[phone_regex], max_length=10, unique=True)
    email = models.EmailField(unique=True)

    # Location Details
    ward = models.CharField(max_length=10, blank=True)
    address = models.TextField(blank=True)
    pincode = models.CharField(max_length=6, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Role and Department
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    department = models.ForeignKey(
        Department, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='staff'
    )
    designation = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, blank=True, unique=True)

    # Preferences and Settings
    language_preference = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default='EN'
    )
    notification_email = models.BooleanField(default=True)
    notification_sms = models.BooleanField(default=True)
    has_accepted_terms = models.BooleanField(default=False)

    # Account Status
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('suspended', 'Suspended'),
        ],
        default='active'
    )
    status_changed_at = models.DateTimeField(null=True, blank=True)
    status_changed_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='status_changes'
    )

    # Audit Fields
    created_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_users'
    )
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    password_changed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_joined']
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        role_display = dict(self.ROLE_CHOICES).get(self.role, self.role)
        return f"{self.full_name} ({role_display})"

    def save(self, *args, **kwargs):
        if not self.username and self.email:
            self.username = self.email
        
        # Auto-generate employee ID for staff
        if self.role != 'citizen' and not self.employee_id:
            # Format: BMC-{WARD}-{DEPT}-{YEAR}-{COUNTER}
            # Example: BMC-HW-SWM-2025-001
            from django.utils import timezone
            year = timezone.now().year
            dept_code = self.department.code if self.department else 'GEN'
            ward_code = self.ward.replace('/', '') if self.ward else 'ALL'
            
            # Get last employee counter for this year
            last_emp = User.objects.filter(
                employee_id__startswith=f'BMC-{ward_code}-{dept_code}-{year}'
            ).order_by('employee_id').last()
            
            if last_emp:
                counter = int(last_emp.employee_id[-3:]) + 1
            else:
                counter = 1
                
            self.employee_id = f'BMC-{ward_code}-{dept_code}-{year}-{counter:03d}'
        
        super().save(*args, **kwargs)

    @property
    def is_staff_member(self):
        """Check if user is any kind of staff member"""
        return self.role in ['super_admin', 'admin', 'officer']

    @property
    def is_admin(self):
        """Check if user is an admin or super admin"""
        return self.role in ['super_admin', 'admin']

    def get_permissions(self):
        """Get user permissions based on role"""
        base_permissions = {
            'can_view_profile': True,
            'can_edit_profile': True,
            'can_submit_complaints': True,
            'can_view_own_complaints': True,
        }
        
        role_permissions = {
            'super_admin': {
                'can_manage_users': True,
                'can_manage_departments': True,
                'can_view_analytics': True,
                'can_manage_settings': True,
                'can_manage_complaints': True,
                'can_assign_complaints': True,
                'can_delete_complaints': True,
                'can_view_all_complaints': True,
            },
            'admin': {
                'can_manage_department_users': True,
                'can_view_department_analytics': True,
                'can_manage_department_complaints': True,
                'can_assign_department_complaints': True,
                'can_view_department_complaints': True,
            },
            'officer': {
                'can_update_assigned_complaints': True,
                'can_view_ward_complaints': True,
                'can_generate_reports': True,
            },
            'citizen': {
                'can_rate_resolution': True,
                'can_comment_on_complaints': True,
            }
        }
        
        return {**base_permissions, **role_permissions.get(self.role, {})}

class UserLoginHistory(models.Model):
    """Track user login attempts and details"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    was_successful = models.BooleanField()
    failure_reason = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = _('login history')
        verbose_name_plural = _('login histories')