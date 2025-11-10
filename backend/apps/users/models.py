"""
User models for Snap & Report.
Includes custom user model with role-based authentication.
"""
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user."""
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        # Set username to email to satisfy Django's requirements
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    Roles: CITIZEN, ADMIN, DEPARTMENT_STAFF
    """
    
    ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('ADMIN', 'Administrator'),
        ('DEPARTMENT_STAFF', 'Department Staff'),
    ]
    
    # Remove username field from being displayed, but keep it for Django compatibility
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(_('email address'), unique=True)
    
    # Contact Details
    phone = models.CharField(max_length=10, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CITIZEN')
    is_phone_verified = models.BooleanField(default=False)
    
    # Personal Information
    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    age = models.PositiveIntegerField(blank=True, null=True)
    
    # Location Information
    WARD_CHOICES = [
        ('A', 'A Ward - Colaba, Cuffe Parade'),
        ('B', 'B Ward - Dongri, Masjid Bunder'),
        ('C', 'C Ward - Marine Lines, Chandanwadi'),
        ('D', 'D Ward - Grant Road, Tardeo'),
        ('E', 'E Ward - Byculla, Mumbai Central'),
        ('F/N', 'F/North Ward - Matunga, Sion'),
        ('F/S', 'F/South Ward - Parel, Sewri'),
        ('G/N', 'G/North Ward - Dadar, Dharavi'),
        ('G/S', 'G/South Ward - Elphinstone Road'),
        ('H/E', 'H/East Ward - Bandra East, Khar East'),
        ('H/W', 'H/West Ward - Bandra West, Khar West'),
        ('K/E', 'K/East Ward - Andheri East'),
        ('K/W', 'K/West Ward - Andheri West, Versova'),
        ('L', 'L Ward - Kurla'),
        ('M/E', 'M/East Ward - Chembur East'),
        ('M/W', 'M/West Ward - Chembur West'),
        ('N', 'N Ward - Ghatkopar'),
        ('P/N', 'P/North Ward - Malad'),
        ('P/S', 'P/South Ward - Goregaon'),
        ('R/C', 'R/Central Ward - Borivali'),
        ('R/N', 'R/North Ward - Dahisar'),
        ('R/S', 'R/South Ward - Kandivali'),
        ('S', 'S Ward - Bhandup'),
        ('T', 'T Ward - Mulund'),
    ]
    ward = models.CharField(max_length=5, choices=WARD_CHOICES, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    pincode = models.CharField(max_length=6, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    
    # Preferences
    LANGUAGE_CHOICES = [
        ('EN', 'English'),
        ('MR', 'Marathi'),
    ]
    language_preference = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='EN')
    
    # Terms & Verification
    has_accepted_terms = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    # Profile
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    objects = UserManager()  # type: ignore
    
    class Meta:
        db_table = 'users'
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def is_citizen(self):
        return self.role == 'CITIZEN'
    
    @property
    def is_admin(self):
        return self.role == 'ADMIN'
    
    @property
    def is_department_staff(self):
        return self.role == 'DEPARTMENT_STAFF'


class AdminRegistrationRequest(models.Model):
    """
    Model for pending admin registration requests that require approval.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    ROLE_CHOICES = [
        ('ADMIN', 'Administrator'),
        ('DEPARTMENT_STAFF', 'Department Staff'),
    ]
    
    # User information
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    password_hash = models.CharField(max_length=128)  # Store hashed password
    
    # Role requested
    requested_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    # Request status and approval workflow
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_registrations'
    )
    rejection_reason = models.TextField(blank=True)
    
    # Additional information
    justification = models.TextField(
        help_text="Why this person should be granted admin access",
        blank=True
    )
    department = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'admin_registration_requests'
        verbose_name = 'Admin Registration Request'
        verbose_name_plural = 'Admin Registration Requests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.status}"
    
    def approve(self, approved_by_user):
        """Approve the request and create the actual user account."""
        from django.utils import timezone
        from django.contrib.auth.hashers import make_password
        
        if self.status != 'PENDING':
            raise ValueError("Can only approve pending requests")
        
        # Create the actual user
        user = User.objects.create(
            email=self.email,
            first_name=self.full_name.split(' ')[0],
            last_name=' '.join(self.full_name.split(' ')[1:]) if ' ' in self.full_name else '',
            phone=self.phone,
            role=self.requested_role,
            password=self.password_hash,  # Already hashed
            is_staff=True,
            is_active=True,
            has_accepted_terms=True
        )
        
        # Update request status
        self.status = 'APPROVED'
        self.approved_by = approved_by_user
        self.approved_at = timezone.now()
        self.save()
        
        return user
    
    def reject(self, rejected_by_user, reason=""):
        """Reject the request."""
        from django.utils import timezone
        
        if self.status != 'PENDING':
            raise ValueError("Can only reject pending requests")
        
        self.status = 'REJECTED'
        self.approved_by = rejected_by_user
        self.rejection_reason = reason
        self.approved_at = timezone.now()
        self.save()
