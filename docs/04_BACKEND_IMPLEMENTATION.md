# 4. Backend Implementation

## Models

### 4.1 User Model (`apps/users/models.py`)

The User model extends Django's `AbstractUser` with role-based access control:

```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('ADMIN', 'Administrator'),
        ('DEPARTMENT_STAFF', 'Department Staff'),
    ]
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CITIZEN')
    ward = models.CharField(max_length=5, choices=WARD_CHOICES, blank=True, null=True)
    
    # Admin tier properties
    @property
    def is_super_admin(self):
        return self.role == 'ADMIN' and self.is_superuser
    
    @property
    def is_department_admin(self):
        return self.role == 'ADMIN' and not self.is_superuser
    
    @property
    def is_bmc_officer(self):
        return self.role == 'DEPARTMENT_STAFF'
    
    @property
    def admin_tier(self):
        if self.is_super_admin:
            return 'super_admin'
        elif self.is_department_admin:
            return 'department_admin'
        elif self.is_bmc_officer:
            return 'bmc_officer'
        return 'citizen'
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = UserManager()
```

**Key Fields:**
- `email`: Unique identifier (instead of username)
- `role`: User role (CITIZEN, ADMIN, DEPARTMENT_STAFF)
- `phone`: Contact number
- `ward`: Assigned ward for citizens
- `is_superuser`: Flag for super admin

---

### 4.2 Officer Model

Links users to departments and wards:

```python
class Officer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='officer_profile')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True)
    assigned_ward = models.CharField(max_length=10, choices=WARD_CHOICES)
    designation = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    complaints_handled = models.IntegerField(default=0)
    average_resolution_time = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
```

**Purpose:** Bridge table linking users to their department and ward assignments

---

### 4.3 Complaint Model (`apps/complaints/models.py`)

```python
class Complaint(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('REJECTED', 'Rejected'),
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
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    ward = models.CharField(max_length=10)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=10)
    image = models.ImageField(upload_to='complaints/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
```

**Key Fields:**
- `status`: Current complaint status
- `priority`: Complaint priority level
- `ward`: Mumbai ward code
- `latitude/longitude`: GPS coordinates
- `image`: Complaint photo

---

### 4.4 Department Model

```python
class Department(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True, null=True)
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    categories = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Purpose:** Represents BMC departments (Roads, Water, Waste, etc.)

---

## ViewSets

### 4.5 ComplaintViewSet

```python
class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for complaint CRUD operations.
    Supports 3-tier role-based filtering:
    - Super Admin: All complaints
    - Department Admin: Department complaints only
    - BMC Officer: Ward complaints only
    - Citizen: Own complaints only
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'priority', 'department', 'ward']
    search_fields = ['title', 'description', 'address', 'city']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Filtering logic here
        pass
    
    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        # Update status logic
        pass
```

---

## Permission Classes

### 4.6 Permission Classes (`apps/users/permissions.py`)

```python
class IsSuperAdmin(permissions.BasePermission):
    """Permission for super admin users only."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and 
                request.user.is_superuser)


class IsDepartmentAdmin(permissions.BasePermission):
    """Permission for department admin users only."""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and 
                not request.user.is_superuser)


class IsAdminUser(permissions.BasePermission):
    """Permission for any admin users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsDepartmentStaff(permissions.BasePermission):
    """Permission for BMC officers only."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_department_staff


class HasDepartmentAccess(permissions.BasePermission):
    """Check if user has access based on department."""
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Super admins have access to all
        if user.role == 'ADMIN' and user.is_superuser:
            return True
        
        # Get user's department
        if hasattr(user, 'officer_profile') and user.officer_profile:
            user_department = user.officer_profile.department
            if user_department and hasattr(obj, 'department'):
                return obj.department == user_department
        
        return False
```

---

## Serializers

### Key Serializers

- **UserSerializer**: User profile information
- **ComplaintCreateSerializer**: For creating new complaints
- **ComplaintDetailSerializer**: Full complaint details
- **ComplaintListSerializer**: List view with minimal data
- **OfficerSerializer**: Officer profile information
- **DepartmentSerializer**: Department information

---

## Complaint Filtering by Tier

The most important logic is in `get_queryset()`:

```python
def get_queryset(self):
    user = self.request.user
    queryset = Complaint.objects.select_related('user', 'department', 'assigned_to')
    
    # Super Admin: All complaints
    if user.role == 'ADMIN' and user.is_superuser:
        return queryset.all()
    
    # Department Admin: Department complaints only
    elif user.role == 'ADMIN' and not user.is_superuser:
        if hasattr(user, 'officer_profile') and user.officer_profile.department:
            return queryset.filter(department=user.officer_profile.department)
        return queryset.none()
    
    # BMC Officer: Ward complaints only
    elif user.is_department_staff:
        if hasattr(user, 'officer_profile'):
            ward = user.officer_profile.assigned_ward
            if ward:
                return queryset.filter(ward=ward)
        return queryset.none()
    
    # Citizen: Own complaints only
    return queryset.filter(user=user)
```

---

## URL Routing

### Main URLs (`core/urls.py`)

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),
    path('api/users/', include('apps.users.urls')),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
```

