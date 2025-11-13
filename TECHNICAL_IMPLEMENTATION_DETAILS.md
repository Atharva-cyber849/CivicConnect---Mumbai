# CivicConnect - Technical Implementation Details
**Document Version:** 1.0  
**Last Updated:** November 11, 2024  
**Audience:** Developers, DevOps Engineers

---

## Table of Contents
1. [Architecture Details](#architecture-details)
2. [API Endpoints](#api-endpoints)
3. [Database Schema](#database-schema)
4. [Frontend Components](#frontend-components)
5. [Backend Implementation](#backend-implementation)
6. [Data Flow](#data-flow)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)

---

## Architecture Details

### 3-Tier Architecture

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  React 18 + Vite + Tailwind CSS         │
│  ├─ Citizen Portal                      │
│  ├─ Admin Dashboard                     │
│  └─ Officer Dashboard                   │
└──────────────┬──────────────────────────┘
               │ REST API (JSON)
┌──────────────┴──────────────────────────┐
│         APPLICATION LAYER               │
│  Django REST Framework                  │
│  ├─ Views & Viewsets                    │
│  ├─ Serializers                         │
│  ├─ Permissions                         │
│  └─ Authentication (JWT)                │
└──────────────┬──────────────────────────┘
               │ ORM Queries
┌──────────────┴──────────────────────────┐
│         DATA LAYER                      │
│  PostgreSQL + PostGIS                   │
│  ├─ Relational Data                     │
│  ├─ Geospatial Data                     │
│  └─ Indexes & Optimization              │
└─────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action
    ↓
React Component
    ↓
API Client (axios)
    ↓
Django View/Viewset
    ↓
Serializer Validation
    ↓
Permission Check
    ↓
Database Query (ORM)
    ↓
Response Serialization
    ↓
JSON Response
    ↓
React Query Cache
    ↓
Component Re-render
```

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/users/register/
       Body: { email, password, first_name, last_name, role }
       Response: { user, tokens }

POST   /api/users/login/
       Body: { email, password, is_admin_login }
       Response: { user, tokens }

POST   /api/users/logout/
       Headers: Authorization: Bearer <token>
       Response: { message }

POST   /api/users/refresh-token/
       Body: { refresh }
       Response: { access }
```

### Complaint Endpoints

```
GET    /api/complaints/
       Query: ?status=pending&ward=A&limit=10&page=1
       Response: { count, next, previous, results: [...] }

POST   /api/complaints/
       Body: { title, description, image, latitude, longitude, category }
       Response: { id, created_at, status, ... }

GET    /api/complaints/{id}/
       Response: { id, title, description, status, updates, ... }

PATCH  /api/complaints/{id}/
       Body: { status, assigned_to, department }
       Response: { id, updated_at, ... }

GET    /api/complaints/map/
       Query: ?ward=A&status=pending
       Response: { features: [...] }

GET    /api/complaints/statistics/
       Response: { total, pending, resolved, in_progress, ... }

GET    /api/complaints/quick_stats/
       Response: { today_complaints, pending, resolved, ... }
```

### Admin Endpoints

```
GET    /api/admin/officers/
       Query: ?department=Roads&limit=10
       Response: { count, results: [...] }

POST   /api/admin/officers/
       Body: { first_name, last_name, email, department, assigned_ward }
       Response: { id, user, ... }

GET    /api/admin/dashboard-stats/
       Query: ?days=7&department=Roads
       Response: { complaints_today, total, resolved, pending, ... }

GET    /api/admin/analytics/
       Query: ?days=30&department=Roads
       Response: { daily_data, department_stats, ward_stats, ... }

GET    /api/admin/users/
       Query: ?role=officer&status=active
       Response: { count, results: [...] }
```

### Notification Endpoints

```
GET    /api/notifications/
       Query: ?limit=10&page=1
       Response: { count, results: [...] }

POST   /api/notifications/mark-read/
       Body: { notification_ids: [1, 2, 3] }
       Response: { updated_count }

DELETE /api/notifications/bulk-delete/
       Body: { notification_ids: [1, 2, 3] }
       Response: { deleted_count }

GET    /api/notifications/unread-count/
       Response: { unread_count }
```

### Geocoding Endpoints

```
GET    /api/complaints/geocode/reverse/
       Query: ?lat=19.0760&lon=72.8777
       Response: { 
         full_address, 
         address_components: { road, suburb, city, state, postcode },
         ward,
         latitude,
         longitude
       }
```

---

## Database Schema

### Core Tables

#### users_customuser
```sql
CREATE TABLE users_customuser (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(50),  -- CITIZEN, ADMIN, DEPARTMENT_STAFF
    department VARCHAR(100),
    assigned_ward VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_user_email ON users_customuser(email);
CREATE INDEX idx_user_role ON users_customuser(role);
CREATE INDEX idx_user_department ON users_customuser(department);
```

#### complaints_complaint
```sql
CREATE TABLE complaints_complaint (
    id BIGINT PRIMARY KEY,
    citizen_id BIGINT REFERENCES users_customuser(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    status VARCHAR(50),  -- pending, in_progress, resolved
    category VARCHAR(100),
    priority VARCHAR(50),  -- low, medium, high
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOMETRY(Point, 4326),  -- PostGIS Point
    ward VARCHAR(10),
    department_id BIGINT REFERENCES departments_department(id),
    assigned_to_id BIGINT REFERENCES users_customuser(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_complaint_status ON complaints_complaint(status);
CREATE INDEX idx_complaint_ward ON complaints_complaint(ward);
CREATE INDEX idx_complaint_department ON complaints_complaint(department_id);
CREATE INDEX idx_complaint_citizen ON complaints_complaint(citizen_id);
CREATE INDEX idx_complaint_location ON complaints_complaint USING GIST(location);
```

#### complaints_complaintupdate
```sql
CREATE TABLE complaints_complaintupdate (
    id BIGINT PRIMARY KEY,
    complaint_id BIGINT REFERENCES complaints_complaint(id),
    updated_by_id BIGINT REFERENCES users_customuser(id),
    status VARCHAR(50),
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP
);

CREATE INDEX idx_update_complaint ON complaints_complaintupdate(complaint_id);
```

#### departments_department
```sql
CREATE TABLE departments_department (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### notifications_notification
```sql
CREATE TABLE notifications_notification (
    id BIGINT PRIMARY KEY,
    user_id BIGINT REFERENCES users_customuser(id),
    complaint_id BIGINT REFERENCES complaints_complaint(id),
    title VARCHAR(255),
    message TEXT,
    notification_type VARCHAR(50),  -- status_update, new_complaint, etc
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_notification_user ON notifications_notification(user_id);
CREATE INDEX idx_notification_read ON notifications_notification(is_read);
```

### Geospatial Queries

```sql
-- Find complaints within a ward boundary
SELECT * FROM complaints_complaint c
WHERE ST_Contains(
    (SELECT geom FROM ward_boundaries WHERE ward_code = 'A'),
    c.location
);

-- Find nearest complaints to a point
SELECT * FROM complaints_complaint
ORDER BY location <-> ST_GeomFromText('POINT(19.0760 72.8777)', 4326)
LIMIT 10;

-- Count complaints by ward
SELECT ward, COUNT(*) as count
FROM complaints_complaint
GROUP BY ward
ORDER BY count DESC;
```

---

## Frontend Components

### Dashboard Components

#### SuperAdminDashboard.jsx
```javascript
// Key Features:
- Fetches all complaints (system-wide)
- Calculates system statistics
- Shows department performance
- Displays ward analytics
- Auto-refreshes every 30 seconds

// Data Flow:
useQuery → adminApi.getComplaints() → calculateStatsFromComplaints() 
→ statCards → Charts → Dashboard Display

// Key State:
- dateFilter: '7' | '30' | '90' | '365'
- stats: Dashboard statistics
- complaintsData: All complaints
- dashboardStats: Calculated stats
```

#### DepartmentAdminDashboard.jsx
```javascript
// Key Features:
- Fetches department complaints only
- Shows department-specific metrics
- Officer management
- Department performance tracking
- Real-time updates

// Data Flow:
useQuery(department filter) → adminApi.getComplaints() 
→ calculateStatsFromComplaints() → Display

// Key State:
- user.department: Filter by department
- complaintsData: Department complaints
- dashboardStats: Department stats
```

#### OfficerDashboard.jsx
```javascript
// Key Features:
- Fetches ward-specific complaints
- Shows officer assignments
- Ward performance metrics
- Complaint resolution tracking
- Real-time updates

// Data Flow:
useQuery(ward filter) → adminApi.getComplaints() 
→ calculateStatsFromComplaints() → Display

// Key State:
- user.assigned_ward: Filter by ward
- complaintsData: Ward complaints
- dashboardStats: Ward stats
```

### Sidebar Component

#### AdminSidebar.jsx
```javascript
// Positioning: md:sticky (scrolls with page)
// Features:
- Dynamic navigation based on role
- Minimize/expand functionality
- Quick stats display
- Mobile responsive

// Navigation Items:
- Dashboard (all roles)
- Complaints (all roles)
- Map View (all roles)
- Reports (all roles)
- Officers (admin only)
- Self Registrations (super admin)
- Registration Requests (super admin)
- Create Super Admin (super admin)
- Settings (admin+)
```

---

## Backend Implementation

### Views & Viewsets

#### ComplaintViewSet
```python
class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Filter by role
        if self.request.user.role == 'CITIZEN':
            return Complaint.objects.filter(citizen=self.request.user)
        elif self.request.user.role == 'DEPARTMENT_STAFF':
            return Complaint.objects.filter(ward=self.request.user.assigned_ward)
        elif self.request.user.role == 'ADMIN':
            return Complaint.objects.filter(
                department=self.request.user.department
            )
        return Complaint.objects.all()  # Super admin
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        # Return aggregated statistics
        pass
    
    @action(detail=False, methods=['get'])
    def map(self, request):
        # Return GeoJSON for map visualization
        pass
```

#### AdminViewSet
```python
class AdminOfficerViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role='DEPARTMENT_STAFF')
    serializer_class = OfficerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def create(self, request):
        # Create new officer
        pass
    
    def update(self, request, pk=None):
        # Update officer details
        pass
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        # Reset officer password
        pass
```

### Serializers

#### ComplaintSerializer
```python
class ComplaintSerializer(serializers.ModelSerializer):
    citizen_name = serializers.CharField(
        source='citizen.get_full_name', 
        read_only=True
    )
    assigned_to_name = serializers.CharField(
        source='assigned_to.get_full_name', 
        read_only=True
    )
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'description', 'image',
            'status', 'category', 'priority',
            'latitude', 'longitude', 'ward',
            'citizen', 'citizen_name',
            'department', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

### Permissions

#### IsOwnerOrAdmin
```python
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow owner to view/edit their own complaint
        if obj.citizen == request.user:
            return True
        # Allow admin/officer to view/edit
        if request.user.role in ['ADMIN', 'DEPARTMENT_STAFF']:
            return True
        return False
```

---

## Data Flow

### Complaint Creation Flow

```
1. Citizen fills form
   ↓
2. Frontend validates input
   ↓
3. POST /api/complaints/
   ├─ Image upload to S3
   ├─ Geolocation reverse geocoding
   ├─ Ward detection
   └─ AI category classification
   ↓
4. Backend creates Complaint object
   ├─ Saves to database
   ├─ Creates notification
   └─ Triggers email task
   ↓
5. Response: Complaint created successfully
   ↓
6. Frontend redirects to complaint detail
   ↓
7. Citizen sees confirmation
```

### Real-Time Dashboard Update Flow

```
1. Dashboard component mounts
   ↓
2. useQuery triggers API call
   ├─ GET /api/complaints/?department=Roads
   └─ Fetches complaints data
   ↓
3. calculateStatsFromComplaints()
   ├─ Counts today's complaints
   ├─ Calculates resolution rate
   ├─ Computes pending issues
   └─ Aggregates statistics
   ↓
4. React Query caches data
   ↓
5. Component renders with stats
   ├─ Stat cards display
   ├─ Charts render
   └─ Summary updates
   ↓
6. 30-second interval triggers refetch
   ↓
7. New data fetched and cached
   ↓
8. Component updates with new stats
```

### Officer Assignment Flow

```
1. Admin selects complaint
   ↓
2. Clicks "Assign Officer"
   ↓
3. Frontend shows officer list
   ↓
4. Admin selects officer
   ↓
5. PATCH /api/complaints/{id}/
   ├─ assigned_to: officer_id
   └─ status: in_progress
   ↓
6. Backend updates complaint
   ├─ Updates database
   ├─ Creates notification
   └─ Sends email to officer
   ↓
7. Officer receives notification
   ↓
8. Officer dashboard updates
   ↓
9. Officer sees new assignment
```

---

## Error Handling

### Frontend Error Handling

```javascript
// API Error Handling
try {
  const response = await adminApi.getComplaints();
  setData(response);
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    navigate('/auth/login');
  } else if (error.response?.status === 403) {
    // Forbidden - show access denied
    showError('You do not have permission to access this');
  } else if (error.response?.status === 404) {
    // Not found
    showError('Resource not found');
  } else {
    // Generic error
    showError('An error occurred. Please try again.');
  }
}

// React Query Error Handling
const { data, error, isLoading } = useQuery({
  queryKey: ['complaints'],
  queryFn: () => adminApi.getComplaints(),
  onError: (error) => {
    console.error('Query failed:', error);
    showError(error.message);
  }
});
```

### Backend Error Handling

```python
# View Error Handling
class ComplaintViewSet(viewsets.ModelViewSet):
    def create(self, request):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f'Error creating complaint: {str(e)}')
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
```

---

## Performance Optimization

### Frontend Optimization

#### React Query Configuration
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,        // 10 seconds
      gcTime: 5 * 60 * 1000,   // 5 minutes
      retry: 1,
      refetchInterval: 30000,  // 30 seconds
    },
  },
});
```

#### Component Memoization
```javascript
const statCards = useMemo(() => {
  return [
    {
      title: 'Total Complaints',
      value: dashboardStats?.total_complaints || 0,
      // ...
    },
    // ...
  ];
}, [dashboardStats]);
```

### Backend Optimization

#### Database Query Optimization
```python
# Use select_related for foreign keys
complaints = Complaint.objects.select_related(
    'citizen', 'assigned_to', 'department'
).all()

# Use prefetch_related for reverse relations
complaints = Complaint.objects.prefetch_related(
    'updates', 'notifications'
).all()

# Add indexes
class Meta:
    indexes = [
        models.Index(fields=['status']),
        models.Index(fields=['ward']),
        models.Index(fields=['department']),
    ]
```

#### Pagination
```python
class ComplaintViewSet(viewsets.ModelViewSet):
    pagination_class = PageNumberPagination
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
```

### Caching Strategy

#### Redis Caching (Recommended)
```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def get_dashboard_stats(request):
    # Expensive calculation
    stats = calculate_stats()
    return Response(stats)
```

---

## Deployment Considerations

### Environment Variables

```bash
# Backend
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=CivicConnect
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

---

## Monitoring & Logging

### Backend Logging

```python
import logging

logger = logging.getLogger(__name__)

def create_complaint(request):
    try:
        logger.info(f'Creating complaint for user {request.user.id}')
        # Create complaint
        logger.info(f'Complaint {complaint.id} created successfully')
    except Exception as e:
        logger.error(f'Error creating complaint: {str(e)}', exc_info=True)
```

### Frontend Error Tracking

```javascript
// Sentry Integration (Recommended)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

---

## Conclusion

CivicConnect is built with modern best practices for:
- ✅ Scalability
- ✅ Performance
- ✅ Security
- ✅ Maintainability
- ✅ User Experience

The technical implementation supports growth from thousands to millions of complaints while maintaining system reliability and performance.

---

**Document Version:** 1.0  
**Last Updated:** November 11, 2024  
**Status:** Complete ✅

