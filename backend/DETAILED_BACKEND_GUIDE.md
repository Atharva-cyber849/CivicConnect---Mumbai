# Backend Development Guide

Complete guide to the Django REST Framework backend for Snap & Report system.

---

## Project Structure

```
backend/
├── core/                          # Django project settings
│   ├── settings.py               # Main settings (database, apps, middleware)
│   ├── urls.py                   # Root URL configuration
│   ├── wsgi.py                   # WSGI application
│   ├── asgi.py                   # ASGI application (async support)
│   ├── celery.py                 # Celery configuration
│   └── middleware.py             # Custom middleware
│
├── apps/                          # Django applications
│   ├── users/                    # User management & authentication
│   │   ├── models.py             # User & Officer models
│   │   ├── serializers.py        # User serializers
│   │   ├── serializers_jwt.py   # JWT token serializers
│   │   ├── views.py              # User ViewSets & endpoints
│   │   ├── permissions.py        # Custom permission classes
│   │   ├── auth.py               # JWT token utilities
│   │   ├── urls.py               # User app routes
│   │   ├── admin.py              # Django admin configuration
│   │   └── management/           # Custom management commands
│   │
│   ├── complaints/               # Complaint management system
│   │   ├── models.py             # Complaint models
│   │   ├── serializers.py        # Complaint serializers
│   │   ├── views.py              # Complaint ViewSets
│   │   ├── assignment_views.py   # Assignment endpoints
│   │   ├── analytics_views.py    # Analytics endpoints
│   │   ├── assignment_service.py # Assignment business logic
│   │   ├── analytics_service.py  # Analytics calculations
│   │   ├── mumbai_utils.py       # Mumbai-specific utilities
│   │   ├── geocoding.py          # Geolocation services
│   │   ├── validators.py         # Custom validators
│   │   ├── signals.py            # Django signals for workflows
│   │   ├── tasks.py              # Celery background tasks
│   │   ├── urls.py               # Complaint routes
│   │   └── admin.py              # Django admin
│   │
│   ├── departments/              # Department management
│   │   ├── models.py             # Department models
│   │   ├── serializers.py        # Department serializers
│   │   ├── views.py              # Department ViewSets
│   │   ├── urls.py               # Department routes
│   │   └── admin.py              # Django admin
│   │
│   └── notifications/            # Notification system
│       └── (email/SMS handlers)
│
├── manage.py                      # Django management command
├── requirements.txt               # Python dependencies
├── docker-compose.yml             # Docker configuration
├── Dockerfile                     # Docker image definition
├── .env.example                   # Environment variables template
└── README.md                      # Backend README
```

---

## Core Applications

### 1. Users App

**Purpose**: User management, authentication, and role-based access control.

#### Models

```python
# User Model
class User(AbstractUser):
    ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('ADMIN', 'Administrator'),
        ('DEPARTMENT_STAFF', 'Department Staff'),
    ]
    
    role = CharField(max_length=20, choices=ROLE_CHOICES)
    phone = CharField(max_length=10)
    ward = CharField(max_length=50)  # Mumbai ward
    address = TextField()
    pincode = CharField(max_length=6)
    latitude = FloatField(null=True)
    longitude = FloatField(null=True)
    profile_picture = ImageField(upload_to='profiles/')
    is_email_verified = BooleanField(default=False)
    language_preference = CharField(max_length=2, default='EN')
    
    @property
    def admin_tier(self):
        """Returns admin hierarchy level"""
        if not self.is_staff:
            return 'citizen'
        if self.is_superuser:
            return 'super_admin'
        if self.role == 'ADMIN':
            return 'department_admin'
        return 'officer'
    
    @property
    def is_super_admin(self):
        return self.is_superuser and self.role == 'ADMIN'
    
    @property
    def is_department_admin(self):
        return self.role == 'ADMIN' and not self.is_superuser
    
    @property
    def is_bmc_officer(self):
        return self.role == 'DEPARTMENT_STAFF'

# Officer Profile Model
class Officer(Model):
    user = OneToOneField(User, on_delete=CASCADE)
    department = ForeignKey(Department, on_delete=CASCADE)
    assigned_ward = CharField(max_length=50)
    designation = CharField(max_length=100)
    phone = CharField(max_length=15)
    email = EmailField()
    complaints_handled = IntegerField(default=0)
    average_resolution_time = FloatField(default=0.0)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### Key ViewSets

| ViewSet | Endpoint | Methods | Purpose |
|---------|----------|---------|---------|
| UserViewSet | `/api/users/` | GET, POST | List/create users |
| LoginViewSet | `/api/users/login/` | POST | JWT authentication |
| ProfileViewSet | `/api/users/profile/` | GET, PATCH | User profile |
| OfficerViewSet | `/api/users/officers/` | GET, POST | Officer management |

#### Permission Classes

```python
class IsSuperAdmin(BasePermission):
    """Only super admins can access"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.is_superuser)

class IsDepartmentAdmin(BasePermission):
    """Only department admins"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and
                not request.user.is_superuser)

class HasDepartmentAccess(BasePermission):
    """Access own department only"""
    def has_object_permission(self, request, view, obj):
        user_dept = getattr(request.user, 'officer_profile', None)
        if user_dept:
            return obj.department == user_dept.department
        return False
```

#### Authentication

- **Method**: JWT (JSON Web Tokens)
- **Location**: `SimpleJWT` (django-rest-framework-simplejwt)
- **Token Types**:
  - Access: 15-minute expiration
  - Refresh: 7-day expiration
- **Endpoints**:
  - POST `/api/users/login/` - Get tokens
  - POST `/api/users/token/refresh/` - Refresh access token

---

### 2. Complaints App

**Purpose**: Core complaint management system with workflow, assignments, and analytics.

#### Models

```python
class Complaint(Model):
    CATEGORY_CHOICES = [
        ('POTHOLE', 'Pothole'),
        ('GARBAGE', 'Garbage'),
        ('WATER', 'Water Issue'),
        ('STREETLIGHT', 'Street Light'),
        ('OTHER', 'Other'),
    ]
    
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
    
    title = CharField(max_length=255)
    description = TextField()
    category = CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    user = ForeignKey(User, on_delete=CASCADE)
    department = ForeignKey(Department, on_delete=SET_NULL, null=True)
    assigned_to = ForeignKey(User, on_delete=SET_NULL, null=True, related_name='assigned_complaints')
    
    # Location
    address = TextField()
    ward = CharField(max_length=50)
    latitude = FloatField()
    longitude = FloatField()
    image = ImageField(upload_to='complaints/', null=True)
    
    # Management
    public_update = TextField(blank=True)
    admin_notes = TextField(blank=True)
    estimated_resolution_days = IntegerField(null=True)
    
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    resolved_at = DateTimeField(null=True)

class ComplaintUpdate(Model):
    """Tracks status changes"""
    complaint = ForeignKey(Complaint, on_delete=CASCADE)
    user = ForeignKey(User, on_delete=CASCADE)
    message = TextField()
    previous_status = CharField(max_length=20)
    new_status = CharField(max_length=20)
    created_at = DateTimeField(auto_now_add=True)

class ComplaintImage(Model):
    """Multiple images per complaint"""
    complaint = ForeignKey(Complaint, on_delete=CASCADE)
    image = ImageField(upload_to='complaints/images/')
    uploaded_at = DateTimeField(auto_now_add=True)

class ComplaintTimeline(Model):
    """Complete workflow history"""
    complaint = ForeignKey(Complaint, on_delete=CASCADE)
    previous_status = CharField(max_length=20)
    new_status = CharField(max_length=20)
    updated_by = ForeignKey(User, on_delete=SET_NULL, null=True)
    notes = TextField()
    created_at = DateTimeField(auto_now_add=True)
```

#### ViewSets

| ViewSet | Key Actions | Filtering |
|---------|------------|-----------|
| ComplaintViewSet | CRUD complaints | By status, category, ward, user |
| ComplaintAssignmentViewSet | Assign/reassign | Department-aware |
| ComplaintAnalyticsViewSet | Statistics/metrics | By time period, department |
| OfficerPerformanceViewSet | Officer metrics | By officer, department |

#### Filtering Logic (Critical)

```python
def get_queryset(self):
    user = self.request.user
    queryset = Complaint.objects.select_related('user', 'department', 'assigned_to')
    
    if user.role == 'ADMIN' and user.is_superuser:
        # Super Admin: All complaints
        return queryset.all()
    
    elif user.role == 'ADMIN' and not user.is_superuser:
        # Department Admin: Only department complaints
        if hasattr(user, 'officer_profile'):
            return queryset.filter(department=user.officer_profile.department)
        return queryset.none()
    
    elif user.role == 'DEPARTMENT_STAFF':
        # BMC Officer: Only assigned ward
        if hasattr(user, 'officer_profile'):
            ward = user.officer_profile.assigned_ward
            return queryset.filter(ward=ward)
        return queryset.none()
    
    else:
        # Citizen: Only own complaints
        return queryset.filter(user=user)
```

#### Assignment Service

```python
class AssignmentService:
    """Business logic for complaint assignment"""
    
    @staticmethod
    def auto_assign_complaint(complaint):
        """Automatically assign to appropriate officer"""
        # Find officers in complaint's ward
        officers = Officer.objects.filter(
            assigned_ward=complaint.ward,
            department=complaint.department
        )
        
        if officers.exists():
            # Assign to officer with least complaints
            officer = officers.annotate(
                complaint_count=Count('user__assigned_complaints')
            ).order_by('complaint_count').first()
            
            complaint.assigned_to = officer.user
            complaint.status = 'IN_PROGRESS'
            complaint.save()
            
            # Send notification
            notify_officer(officer, complaint)
    
    @staticmethod
    def reassign_complaint(complaint, new_officer):
        """Reassign complaint to different officer"""
        old_officer = complaint.assigned_to
        complaint.assigned_to = new_officer
        complaint.save()
        
        # Log the change
        ComplaintUpdate.objects.create(
            complaint=complaint,
            user=new_officer,
            message=f"Reassigned from {old_officer}",
            previous_status=complaint.status,
            new_status=complaint.status
        )
```

#### Analytics Service

```python
class AnalyticsService:
    """Calculate complaints metrics and statistics"""
    
    @staticmethod
    def get_dashboard_stats(department=None, days=30):
        """Overall dashboard statistics"""
        queryset = Complaint.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=days)
        )
        
        if department:
            queryset = queryset.filter(department=department)
        
        return {
            'total': queryset.count(),
            'by_status': dict(queryset.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_category': dict(queryset.values('category').annotate(count=Count('id')).values_list('category', 'count')),
            'avg_resolution_time': queryset.filter(resolved_at__isnull=False).aggregate(
                avg=Avg(F('resolved_at') - F('created_at'))
            )['avg']
        }
    
    @staticmethod
    def get_officer_performance(officer, days=30):
        """Officer performance metrics"""
        complaints = Complaint.objects.filter(
            assigned_to=officer.user,
            created_at__gte=timezone.now() - timedelta(days=days)
        )
        
        resolved = complaints.filter(status='RESOLVED')
        
        return {
            'total_assigned': complaints.count(),
            'resolved_count': resolved.count(),
            'resolution_rate': resolved.count() / max(complaints.count(), 1) * 100,
            'avg_resolution_time_hours': calculate_avg_time(resolved)
        }
```

#### Mumbai Utilities

```python
class MumbaiUtils:
    """Mumbai-specific features"""
    
    WARDS = {
        'Bandra': {'code': 'BND', 'area': 'Western Suburbs'},
        'Andheri': {'code': 'AND', 'area': 'Western Suburbs'},
        'Colaba': {'code': 'COL', 'area': 'South'},
        'Dadar': {'code': 'DAD', 'area': 'Central'},
        # ... 24 wards total
    }
    
    @staticmethod
    def validate_ward(ward_name):
        """Validate Mumbai ward"""
        return ward_name in MumbaiUtils.WARDS
    
    @staticmethod
    def get_ward_by_coordinates(latitude, longitude):
        """Find ward from coordinates using geocoding"""
        # Uses reverse geocoding API
        pass
    
    @staticmethod
    def get_department_for_category(category):
        """Return appropriate department for complaint category"""
        mapping = {
            'POTHOLE': 'Roads & Infrastructure',
            'GARBAGE': 'Solid Waste Management',
            'WATER': 'Water Supply',
            'STREETLIGHT': 'Electricity & Street Lighting',
        }
        return mapping.get(category)
```

---

### 3. Departments App

**Purpose**: Department management and organization.

#### Models

```python
class Department(Model):
    name = CharField(max_length=255, unique=True)
    description = TextField()
    email = EmailField()
    phone = CharField(max_length=15)
    head = ForeignKey(User, on_delete=SET_NULL, null=True)
    categories = JSONField(default=list)  # ['POTHOLE', 'GARBAGE', ...]
    is_active = BooleanField(default=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

#### ViewSet

```python
class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsSuperAdmin()]
        return [IsAuthenticated()]
```

---

## Configuration Files

### settings.py

Key configurations:

```python
# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
}

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Celery
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

# AWS/S3 (optional)
if USE_S3:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
```

### URLs Structure

```python
# core/urls.py
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]

# apps/users/urls.py
router = DefaultRouter()
router.register(r'', UserViewSet)
router.register(r'officers', OfficerViewSet)

urlpatterns = [
    path('login/', LoginViewSet.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', UserProfileViewSet.as_view()),
] + router.urls
```

---

## Workflows & Signals

### Complaint Creation Workflow

```
User submits complaint
    ↓
[Validation] - Check required fields
    ↓
[Geocoding] - Get ward from coordinates (or validate provided ward)
    ↓
[Department Assignment] - Assign to appropriate department
    ↓
[Status: PENDING] - Create complaint record
    ↓
[Notification Signal] - Send email to department
    ↓
[Auto Assignment Task] - Assign to officer (if available)
    ↓
[Status: IN_PROGRESS] - Update complaint
    ↓
[Officer Notification] - Email officer with details
```

### Status Transition Workflow

```
PENDING → IN_PROGRESS (Officer accepts)
    ↓
[Work in progress]
    ↓
IN_PROGRESS → RESOLVED (Work complete)
    OR
IN_PROGRESS → REJECTED (Cannot be fixed)
```

---

## Background Tasks (Celery)

### Key Tasks

```python
# tasks.py
@shared_task
def notify_complaint_assignment(complaint_id):
    """Notify officer of new assignment"""
    complaint = Complaint.objects.get(id=complaint_id)
    send_email(
        to=complaint.assigned_to.email,
        subject='New Complaint Assigned',
        template='assignment_notification.html',
        context={'complaint': complaint}
    )

@shared_task
def generate_daily_report():
    """Generate daily analytics report"""
    stats = AnalyticsService.get_dashboard_stats()
    send_report_email(stats)

@shared_task
def auto_assign_pending_complaints():
    """Automatically assign unassigned complaints"""
    pending = Complaint.objects.filter(status='PENDING', assigned_to__isnull=True)
    for complaint in pending:
        AssignmentService.auto_assign_complaint(complaint)
```

---

## Development Workflow

### Adding a New Feature

1. **Create model** in `models.py`
2. **Create migration**: `python manage.py makemigrations`
3. **Run migration**: `python manage.py migrate`
4. **Create serializer** in `serializers.py`
5. **Create ViewSet** in `views.py`
6. **Register route** in `urls.py`
7. **Add permission class** if needed
8. **Create tests** in `tests.py`
9. **Document in API reference**

### Running Management Commands

```bash
# Create test data
python manage.py create_sample_data

# Generate report
python manage.py generate_report

# Clear old data
python manage.py cleanup_old_complaints
```

---

## Testing

### Running Tests

```bash
# All tests
python manage.py test

# Specific app
python manage.py test apps.complaints

# Specific test class
python manage.py test apps.complaints.tests.ComplaintViewSetTestCase

# With coverage
coverage run --source='.' manage.py test
coverage report
```

### Test Structure

```python
class ComplaintViewSetTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(...)
        self.complaint = Complaint.objects.create(...)
    
    def test_list_complaints(self):
        response = self.client.get('/api/complaints/')
        self.assertEqual(response.status_code, 200)
    
    def test_filtering_by_status(self):
        response = self.client.get('/api/complaints/?status=PENDING')
        self.assertEqual(len(response.data), 1)
```

---

## Debugging Tips

### Django Shell

```bash
python manage.py shell

# Inside shell
from apps.complaints.models import Complaint
from apps.users.models import User

# Query complaints
complaints = Complaint.objects.all()
print(complaints.query)  # See SQL

# Check filtering
user = User.objects.get(email='officer@bmc.gov.in')
print(user.admin_tier)
print(user.officer_profile.department)
```

### Debug Queries

```python
from django.db import connection
from django.test.utils import CaptureQueriesContext

with CaptureQueriesContext(connection) as context:
    complaints = Complaint.objects.all()
    list(complaints)  # Force evaluation

print(f"{len(context)} queries executed")
for query in context:
    print(query['sql'])
```

---

## Performance Optimization

### Database Optimization

```python
# Use select_related for ForeignKey
queryset = Complaint.objects.select_related('user', 'department')

# Use prefetch_related for ManyToMany/reverse FK
queryset = Department.objects.prefetch_related('officer_set')

# Use only() to limit fields
queryset = User.objects.only('id', 'email', 'first_name')

# Use values() for aggregation
stats = Complaint.objects.values('status').annotate(count=Count('id'))
```

### Caching

```python
from django.core.cache import cache

@cache_page(60)  # Cache for 60 seconds
def get_analytics(request):
    stats = AnalyticsService.get_dashboard_stats()
    return Response(stats)
```

---

## Deployment Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set strong `SECRET_KEY`
- [ ] Configure database credentials
- [ ] Set up email backend
- [ ] Configure AWS S3 (if using)
- [ ] Run `collectstatic`
- [ ] Run migrations
- [ ] Create superuser
- [ ] Test all endpoints
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy

