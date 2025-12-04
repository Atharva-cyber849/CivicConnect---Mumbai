# CivicConnect Mumbai - Technical Documentation

## Mumbai BMC Civic Complaint Management System

**Version:** 1.0.0  
**Last Updated:** December 4, 2025  
**Repository:** [github.com/Atharva-cyber849/CivicConnect---Mumbai](https://github.com/Atharva-cyber849/CivicConnect---Mumbai)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [3-Tier Admin Hierarchy](#6-3-tier-admin-hierarchy)
7. [API Reference](#7-api-reference)
8. [Database Schema](#8-database-schema)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Mumbai-Specific Features](#10-mumbai-specific-features)
11. [Test Credentials](#11-test-credentials)
12. [Deployment](#12-deployment)

---

## 1. System Overview

CivicConnect Mumbai is a comprehensive civic complaint management system designed specifically for Mumbai's Brihanmumbai Municipal Corporation (BMC). The system enables:

- **Citizens** to report civic issues with location-based tracking
- **BMC Officers** to manage complaints in their assigned wards
- **Department Admins** to oversee complaints within their department
- **Super Admins** to manage the entire system across all departments and wards

### Key Features

| Feature | Description |
|---------|-------------|
| **Issue Reporting** | Citizens can report civic issues with photos, location, and category |
| **Interactive Map** | Leaflet-based map with Mumbai ward boundaries and issue markers |
| **3-Tier Hierarchy** | Role-based access control for officers, department admins, and super admins |
| **Ward-Based Routing** | Automatic complaint routing based on Mumbai's 24 administrative wards |
| **Real-time Tracking** | Citizens can track complaint status from submission to resolution |
| **Analytics Dashboard** | Comprehensive analytics for performance monitoring |
| **SLA Management** | Service Level Agreement tracking for complaint resolution |
| **Mobile Responsive** | Fully responsive design with mobile-specific features |

---

## 2. Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Core language |
| Django | 4.2+ | Web framework |
| Django REST Framework | 3.14+ | API development |
| SQLite | 3.x | Development database |
| PostgreSQL | 14+ | Production database |
| JWT (SimpleJWT) | 5.x | Authentication |
| Celery | 5.x | Async task processing |
| Redis | 7.x | Caching & message broker |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| React Router | 6.x | Routing |
| TanStack Query | 5.x | Data fetching |
| Leaflet | 1.9.x | Interactive maps |
| Axios | 1.x | HTTP client |
| Recharts | 2.x | Charts & analytics |
| Lucide React | - | Icons |

### DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Reverse proxy & static files |

---

## 3. Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                     React + Vite (Port 5173)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Citizen   │  │ BMC Officer │  │  Dept Admin │  │Super Admin │ │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │ Dashboard  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                         API Layer (Axios)                            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                    │
│                   Django REST Framework (Port 8000)                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │    Users    │  │ Complaints  │  │ Departments │  │Notifications││
│  │     App     │  │     App     │  │     App     │  │    App     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Permissions Layer                        │   │
│  │   IsSuperAdmin │ IsDepartmentAdmin │ HasDepartmentAccess    │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        Database (SQLite/PostgreSQL)                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
Snap & Report/
├── backend/
│   ├── apps/
│   │   ├── users/              # User management & authentication
│   │   │   ├── models.py       # User, Officer models
│   │   │   ├── views.py        # User API views
│   │   │   ├── serializers.py  # User serializers
│   │   │   ├── permissions.py  # Custom permission classes
│   │   │   └── urls.py         # User routes
│   │   ├── complaints/         # Complaint management
│   │   │   ├── models.py       # Complaint, Timeline, etc.
│   │   │   ├── views.py        # Complaint CRUD views
│   │   │   ├── serializers.py  # Complaint serializers
│   │   │   ├── analytics_views.py
│   │   │   └── mumbai_utils.py # Mumbai-specific utilities
│   │   ├── departments/        # Department management
│   │   └── notifications/      # Notification system
│   ├── core/
│   │   ├── settings.py         # Django settings
│   │   ├── urls.py             # Root URL configuration
│   │   └── middleware.py       # Custom middleware
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/                # API integration layer
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── citizen/        # Citizen pages
│   │   │   └── officer/        # Officer pages
│   │   ├── routes/             # Routing configuration
│   │   ├── utils/              # Utility functions
│   │   └── config/             # Configuration constants
│   ├── public/
│   └── package.json
└── docs/                       # Documentation
```

---

## 4. Backend Implementation

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
```

### 4.2 Officer Model

Links users to departments and wards:

```python
class Officer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='officer_profile')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True)
    assigned_ward = models.CharField(max_length=10, choices=WARD_CHOICES)
    designation = models.CharField(max_length=100)
    complaints_handled = models.IntegerField(default=0)
    average_resolution_time = models.FloatField(default=0.0)
```

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
        # ... more categories
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    ward = models.CharField(max_length=10)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    image = models.ImageField(upload_to='complaints/', blank=True, null=True)
```

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
```

### 4.5 Permission Classes (`apps/users/permissions.py`)

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

### 4.6 Complaint Filtering by Tier (`apps/complaints/views.py`)

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

## 5. Frontend Implementation

### 5.1 Application Entry (`App.jsx`)

```jsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <LanguageProvider>
                <AppRouter />
              </LanguageProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### 5.2 Role-Based Access (`utils/roleBasedAccess.js`)

```javascript
export const isSuperAdmin = (user) => {
  return user?.role === 'ADMIN' && user?.is_superuser === true;
};

export const isDepartmentAdmin = (user) => {
  return user?.role === 'ADMIN' && !user?.is_superuser;
};

export const isOfficer = (user) => {
  return user?.role === 'DEPARTMENT_STAFF';
};

export const getPageAccess = (user) => {
  const superAdmin = isSuperAdmin(user);
  const deptAdmin = isDepartmentAdmin(user);
  
  return {
    dashboard: true,
    complaints: true,
    analytics: superAdmin || deptAdmin,
    departmentManagement: superAdmin,
    officerManagement: superAdmin || deptAdmin,
    zoneManagement: superAdmin,
    settings: superAdmin,
    createAdmin: superAdmin,
  };
};
```

### 5.3 API Layer (`api/complaintsApi.js`)

```javascript
export const complaintsApi = {
  // Get user's complaints
  getUserComplaints: async () => {
    const response = await axiosPrivate.get('/complaints/');
    return response.data;
  },

  // Create new complaint
  createComplaint: async (complaintData) => {
    const formData = new FormData();
    Object.keys(complaintData).forEach(key => {
      if (complaintData[key] !== null) {
        formData.append(key, complaintData[key]);
      }
    });
    return await axiosPrivate.post('/complaints/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update complaint status
  updateComplaintStatus: async (id, statusData) => {
    return await axiosPrivate.patch(`/complaints/${id}/status/`, statusData);
  },
};
```

### 5.4 Auth Context (`context/AuthContext.jsx`)

```javascript
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(credentials);
      const { user, access, refresh } = response;
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: access } });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };
  
  // ... logout, updateProfile, etc.
};
```

### 5.5 Page Components

| Page | Path | Role | Description |
|------|------|------|-------------|
| `LandingPage` | `/` | Public | Home page with system overview |
| `Login` | `/auth/login` | Public | Citizen login |
| `Register` | `/auth/register` | Public | Citizen registration |
| `ReportIssue` | `/dashboard/report` | Citizen | Submit new complaint |
| `MyComplaints` | `/dashboard/complaints` | Citizen | View own complaints |
| `AdminDashboard` | `/admin/dashboard` | Admin | Admin overview |
| `ComplaintsList` | `/admin/complaints` | Admin | Manage all complaints |
| `MumbaiBMCAnalytics` | `/admin/analytics` | Admin | Analytics dashboard |
| `OfficerManagement` | `/admin/officers` | Admin | Manage officers |
| `BMCZoneManagement` | `/admin/zones` | Super Admin | Manage zones/wards |

---

## 6. 3-Tier Admin Hierarchy

### Access Matrix

| Feature | Super Admin | Dept Admin | BMC Officer | Citizen |
|---------|:-----------:|:----------:|:-----------:|:-------:|
| View All Complaints | ✅ | ❌ | ❌ | ❌ |
| View Dept Complaints | ✅ | ✅ | ❌ | ❌ |
| View Ward Complaints | ✅ | ✅ | ✅ | ❌ |
| View Own Complaints | ✅ | ✅ | ✅ | ✅ |
| Update Any Status | ✅ | ❌ | ❌ | ❌ |
| Update Dept Status | ✅ | ✅ | ❌ | ❌ |
| Update Ward Status | ✅ | ✅ | ✅ | ❌ |
| Manage Departments | ✅ | ❌ | ❌ | ❌ |
| Manage All Officers | ✅ | ❌ | ❌ | ❌ |
| Manage Dept Officers | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Create New Admins | ✅ | ❌ | ❌ | ❌ |

### Role Definitions

| Role | Database Values | Description |
|------|-----------------|-------------|
| **Super Admin** | `role='ADMIN'` + `is_superuser=True` | Full system access across all departments and wards |
| **Department Admin** | `role='ADMIN'` + `is_superuser=False` + Officer profile with department | Manages a specific department |
| **BMC Officer** | `role='DEPARTMENT_STAFF'` + Officer profile with ward | Handles complaints in assigned ward |
| **Citizen** | `role='CITIZEN'` | Can submit and track own complaints |

---

## 7. API Reference

### Base URL
- Development: `http://localhost:8000/api/`
- Production: `https://your-domain.com/api/`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/login/` | User login (returns JWT) |
| POST | `/users/register/` | User registration |
| POST | `/users/token/refresh/` | Refresh JWT token |
| POST | `/users/logout/` | User logout |

### Complaints Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/complaints/` | List complaints (filtered by role) | Required |
| POST | `/complaints/` | Create new complaint | Required |
| GET | `/complaints/{id}/` | Get complaint details | Required |
| PATCH | `/complaints/{id}/` | Update complaint | Required |
| PATCH | `/complaints/{id}/status/` | Update status | Admin/Staff |
| GET | `/complaints/map/` | Get complaints for map view | Optional |
| GET | `/complaints/analytics/` | Get analytics data | Admin |

### Departments Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/departments/` | List departments | Required |
| POST | `/departments/` | Create department | Super Admin |
| GET | `/departments/{id}/` | Get department details | Required |
| PATCH | `/departments/{id}/` | Update department | Super Admin |

### Officers Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/officers/` | List officers | Admin |
| POST | `/users/officers/` | Create officer | Admin |
| GET | `/users/officers/{id}/` | Get officer details | Admin |
| PATCH | `/users/officers/{id}/` | Update officer | Admin |

---

## 8. Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      User        │       │    Department    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ email            │       │ name             │
│ role             │       │ description      │
│ is_superuser     │       │ email            │
│ ward             │       │ categories       │
│ phone            │       │ head_id (FK)     │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         │ 1:1                      │ 1:N
         ▼                          ▼
┌──────────────────┐       ┌──────────────────┐
│     Officer      │──────▶│    Complaint     │
├──────────────────┤  N:1  ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ user_id (FK)     │       │ title            │
│ department_id(FK)│       │ description      │
│ assigned_ward    │       │ category         │
│ designation      │       │ status           │
└──────────────────┘       │ user_id (FK)     │
                           │ department_id(FK)│
                           │ ward             │
                           │ latitude         │
                           │ longitude        │
                           └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
           ┌────────────┐  ┌────────────┐  ┌────────────┐
           │ Timeline   │  │   Image    │  │   Notes    │
           └────────────┘  └────────────┘  └────────────┘
```

---

## 9. Authentication & Authorization

### JWT Token Flow

```
1. User Login
   POST /api/users/login/
   Request: { email, password }
   Response: { access, refresh, user }

2. API Request with Token
   GET /api/complaints/
   Header: Authorization: Bearer <access_token>

3. Token Refresh (when access token expires)
   POST /api/users/token/refresh/
   Request: { refresh }
   Response: { access }
```

### Token Storage (Frontend)

```javascript
// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Axios interceptor for token
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

---

## 10. Mumbai-Specific Features

### 10.1 Ward System

Mumbai is divided into 24 administrative wards:

| Code | Ward Name | Areas Covered |
|------|-----------|---------------|
| A | A Ward | Colaba, Cuffe Parade |
| B | B Ward | Dongri, Masjid Bunder |
| C | C Ward | Marine Lines, Chandanwadi |
| D | D Ward | Grant Road, Tardeo |
| E | E Ward | Byculla, Mumbai Central |
| F/N | F/North Ward | Matunga, Sion |
| F/S | F/South Ward | Parel, Sewri |
| G/N | G/North Ward | Dadar, Dharavi |
| H/E | H/East Ward | Bandra East, Khar East |
| H/W | H/West Ward | Bandra West, Khar West |
| K/E | K/East Ward | Andheri East |
| K/W | K/West Ward | Andheri West, Versova |
| P/N | P/North Ward | Malad |
| ... | ... | ... |

### 10.2 Geo-Location Features

```javascript
// Mumbai bounds validation
export const MUMBAI_BOUNDS = {
  north: 19.2800,
  south: 18.8900,
  east: 72.9900,
  west: 72.7700
};

export const isWithinMumbai = (lat, lng) => {
  return (
    lat >= MUMBAI_BOUNDS.south &&
    lat <= MUMBAI_BOUNDS.north &&
    lng >= MUMBAI_BOUNDS.west &&
    lng <= MUMBAI_BOUNDS.east
  );
};
```

### 10.3 Department Categories

| Department | Categories Handled |
|------------|-------------------|
| Roads & Infrastructure | Potholes, Road damage, Footpath issues |
| Solid Waste Management | Garbage, Illegal dumping, Street cleaning |
| Water Supply | Water leakage, Pipeline issues, Water quality |
| Street Lighting | Street lights, Traffic signals |
| Drainage | Sewage, Waterlogging |

---

## 11. Test Credentials

### Super Admin
| Email | Password | Access |
|-------|----------|--------|
| `superadmin@bmc.gov.in` | `SuperAdmin@123` | Full system access |

### Department Admins
| Email | Password | Department |
|-------|----------|------------|
| `deptadmin.roads@bmc.gov.in` | `DeptAdmin@123` | Roads & Infrastructure |
| `deptadmin.waste@bmc.gov.in` | `DeptAdmin@123` | Solid Waste Management |
| `deptadmin.water@bmc.gov.in` | `DeptAdmin@123` | Water Supply |

### BMC Officers
| Email | Password | Department | Ward |
|-------|----------|------------|------|
| `officer.bandra@bmc.gov.in` | `Officer@123` | Roads | Bandra |
| `officer.andheri@bmc.gov.in` | `Officer@123` | Roads | Andheri |
| `officer.colaba@bmc.gov.in` | `Officer@123` | Roads | Colaba |
| `officer.dadar@bmc.gov.in` | `Officer@123` | Waste | Dadar |
| `officer.malad@bmc.gov.in` | `Officer@123` | Waste | Malad |

### Citizens
| Email | Password | Ward |
|-------|----------|------|
| `citizen1@gmail.com` | `Citizen@123` | Bandra |
| `citizen2@gmail.com` | `Citizen@123` | Andheri |
| `citizen3@gmail.com` | `Citizen@123` | Dadar |

---

## 12. Deployment

### Development Setup

```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Services:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/api/docs/
```

### Environment Variables

```env
# Backend (.env)
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:8000/api
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## License

```
CivicConnect Mumbai - Civic Complaint Management System
Copyright © 2025 Atharva-cyber849

All rights reserved.
```

---

*Documentation generated: December 4, 2025*
