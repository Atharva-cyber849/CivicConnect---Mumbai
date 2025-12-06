# Role-Based Access Control (RBAC) Implementation Guide
## CivicConnect - Enterprise-Grade Authentication & Authorization

**Status**: ✅ IMPLEMENTED  
**Framework**: Django REST Framework + React + JWT  
**Version**: 1.0  
**Date**: December 2025

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Role Definitions](#role-definitions)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Authentication Flow](#authentication-flow)
6. [Authorization Rules](#authorization-rules)
7. [API Endpoint Mapping](#api-endpoint-mapping)
8. [Security Best Practices](#security-best-practices)
9. [Implementation Checklist](#implementation-checklist)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ AuthContext (Global State Management)                    │   │
│  │ - user object (role, ward, department, etc.)             │   │
│  │ - token (JWT with claims)                                │   │
│  │ - isAuthenticated (boolean)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓ (HTTP Request with Authorization Header)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Django REST)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ JWT Authentication Backend                               │   │
│  │ - Verifies token signature                               │   │
│  │ - Extracts user claims (role, ward, dept, etc.)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Permission Classes (Authorization)                       │   │
│  │ - IsWardAdmin, IsDepartmentAdmin, IsSuperAdmin          │   │
│  │ - HasDepartmentAccess, HasWardAccess                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ViewSets/APIViews (Business Logic)                       │   │
│  │ - Only execute if permission classes pass                │   │
│  └──────────────────────────────────────────────────────────┘   │
│         ↓ (Response with 200/403)                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ User Model (with role field)                             │   │
│  │ Officer Model (ward + department assignment)             │   │
│  │ Complaint Model (with data access filters)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role Definitions

### Your 4-Tier Hierarchy

```
SUPER_ADMIN
    ├── Can access everything
    ├── Manage all admins
    ├── Create/delete departments & wards
    └── View all complaints & logs

DEPARTMENT_ADMIN
    ├── Manage their specific department
    ├── Reassign complaints to officers
    ├── Approve complaint closures
    ├── View department analytics
    └── Cannot access other departments

WARD_ADMIN
    ├── Manage complaints in their ward
    ├── Assign officers
    ├── Monitor SLA compliance
    ├── View ward analytics
    └── Cannot access other wards

CITIZEN
    ├── File complaints
    ├── Track own complaints
    ├── Provide feedback
    └── View public ward information
```

### Role-to-Field Mapping

| Role | User.role | is_superuser | has_dept_assigned | has_ward_assigned | Tier |
|------|-----------|-------------|-------------------|-------------------|------|
| Citizen | CITIZEN | False | False | False/Optional | 0 |
| Ward Admin | ADMIN | False | False | **True** | 1 |
| Department Admin | ADMIN | False | **True** | False | 2 |
| Super Admin | ADMIN | **True** | False | False | 3 |

---

## Backend Implementation

### 1. User Model (Already Implemented ✅)

**File**: `backend/apps/users/models.py`

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
    
    # Admin-specific fields
    ward = models.ForeignKey(Ward, null=True, blank=True, on_delete=models.SET_NULL)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    
    # Properties for role checking
    @property
    def is_super_admin(self):
        return self.role == 'ADMIN' and self.is_superuser
    
    @property
    def is_department_admin(self):
        return self.role == 'ADMIN' and not self.is_superuser and self.department
    
    @property
    def is_ward_admin(self):
        return self.role == 'ADMIN' and not self.is_superuser and self.ward
    
    @property
    def is_citizen(self):
        return self.role == 'CITIZEN'
```

✅ **Status**: Fully implemented

---

### 2. Permission Classes (Authorization Layer)

**File**: `backend/apps/users/permissions.py`

Create comprehensive permission classes:

```python
from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()

class IsCitizen(BasePermission):
    """Only citizens can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_citizen

class IsWardAdmin(BasePermission):
    """Only ward admins can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_ward_admin

class IsDepartmentAdmin(BasePermission):
    """Only department admins can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_department_admin

class IsSuperAdmin(BasePermission):
    """Only super admins can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_super_admin

class IsAdmin(BasePermission):
    """Any admin (ward, department, or super) can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

class HasWardAccess(BasePermission):
    """Ward admin can only access their own ward"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_super_admin:
            return True  # Super admin can access anything
        if request.user.is_ward_admin:
            return obj.ward == request.user.ward
        return False

class HasDepartmentAccess(BasePermission):
    """Department admin can only access their own department"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_super_admin:
            return True  # Super admin can access anything
        if request.user.is_department_admin:
            return obj.department == request.user.department
        return False
```

---

### 3. JWT Token Payload (with Role Claims)

**File**: `backend/apps/users/serializers_jwt.py`

```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Include role and access level in JWT token"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        token['is_superuser'] = user.is_superuser
        token['ward_id'] = user.ward.id if user.ward else None
        token['ward_name'] = str(user.ward) if user.ward else None
        token['department_id'] = user.department.id if user.department else None
        token['department_name'] = str(user.department) if user.department else None
        
        # Determine admin tier
        if user.is_super_admin:
            token['admin_tier'] = 'super_admin'
        elif user.is_department_admin:
            token['admin_tier'] = 'department_admin'
        elif user.is_ward_admin:
            token['admin_tier'] = 'ward_admin'
        else:
            token['admin_tier'] = 'citizen'
        
        return token
```

✅ **Status**: Already implemented, add the extra fields shown above

---

### 4. Complaint ViewSet with Authorization

**Example**: `backend/apps/complaints/views.py`

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsWardAdmin, IsDepartmentAdmin, IsSuperAdmin, HasWardAccess
from .models import Complaint

class ComplaintViewSet(viewsets.ModelViewSet):
    """
    Complaint ViewSet with role-based access control.
    - Citizens: View own complaints only
    - Ward Admins: View ward complaints
    - Department Admins: View department complaints
    - Super Admins: View all complaints
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Super Admin sees everything
        if user.is_super_admin:
            return Complaint.objects.all().order_by('-created_at')
        
        # Department Admin sees their department's complaints
        if user.is_department_admin:
            return Complaint.objects.filter(
                department=user.department
            ).order_by('-created_at')
        
        # Ward Admin sees their ward's complaints
        if user.is_ward_admin:
            return Complaint.objects.filter(
                ward=user.ward
            ).order_by('-created_at')
        
        # Citizens see only their own complaints
        return Complaint.objects.filter(
            filed_by=user
        ).order_by('-created_at')
    
    def perform_update(self, serializer):
        """Validate update permissions"""
        complaint = serializer.instance
        user = self.request.user
        
        # Citizens can only update their own complaints
        if user.is_citizen:
            if complaint.filed_by != user:
                self.permission_denied(self.request, 'Cannot update other users\' complaints')
        
        # Ward admin can only update complaints in their ward
        if user.is_ward_admin:
            if complaint.ward != user.ward:
                self.permission_denied(self.request, 'Cannot access complaints outside your ward')
        
        # Department admin can only update complaints in their department
        if user.is_department_admin:
            if complaint.department != user.department:
                self.permission_denied(self.request, 'Cannot access complaints outside your department')
        
        serializer.save()
```

---

### 5. API Endpoint Permission Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENDPOINT PERMISSIONS                         │
├─────────────────────────────────────────────────────────────────┤
│ CITIZEN ENDPOINTS (AllowAny or IsCitizen)                       │
├─────────────────────────────────────────────────────────────────┤
POST   /users/register/              IsCitizen (citizen registration)
POST   /complaints/                  IsCitizen (file complaint)
GET    /complaints/{id}/             IsCitizen + HasComplaintAccess
PATCH  /complaints/{id}/             IsCitizen + IsOwner
GET    /wards/public/                AllowAny (public ward info)

├─────────────────────────────────────────────────────────────────┤
│ WARD ADMIN ENDPOINTS (IsWardAdmin + HasWardAccess)              │
├─────────────────────────────────────────────────────────────────┤
GET    /complaints/?ward=X           IsWardAdmin (see ward complaints)
PATCH  /complaints/{id}/             IsWardAdmin + HasWardAccess
POST   /assignments/                 IsWardAdmin (assign officers)
GET    /analytics/ward/              IsWardAdmin (ward analytics)

├─────────────────────────────────────────────────────────────────┤
│ DEPARTMENT ADMIN ENDPOINTS (IsDepartmentAdmin + HasDeptAccess)   │
├─────────────────────────────────────────────────────────────────┤
GET    /complaints/?dept=X           IsDepartmentAdmin
PATCH  /complaints/{id}/             IsDepartmentAdmin + HasDeptAccess
POST   /officers/                    IsDepartmentAdmin (add officers)
GET    /analytics/department/        IsDepartmentAdmin

├─────────────────────────────────────────────────────────────────┤
│ SUPER ADMIN ENDPOINTS (IsSuperAdmin)                            │
├─────────────────────────────────────────────────────────────────┤
GET    /complaints/                  IsSuperAdmin (all complaints)
POST   /users/admin-register/        IsSuperAdmin (create admins)
POST   /departments/                 IsSuperAdmin (manage depts)
POST   /wards/                       IsSuperAdmin (manage wards)
GET    /analytics/city/              IsSuperAdmin (city analytics)
GET    /audit-logs/                  IsSuperAdmin (access logs)
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Implementation

### 1. AuthContext with Role Information

**File**: `frontend/src/context/AuthContext.jsx` ✅ (Already implemented)

```javascript
const initialState = {
  isAuthenticated: false,
  user: null,  // Contains: { id, email, role, ward, department, admin_tier }
  token: null,
  loading: false,
  error: null
};

// After login, user object contains:
user: {
  id: 1,
  email: 'admin@test.com',
  first_name: 'Amit',
  last_name: 'Joshi',
  role: 'ADMIN',
  is_superuser: true,
  admin_tier: 'super_admin',
  ward: null,
  department: null,
  created_at: '2024-01-15T...'
}
```

---

### 2. Role-Based Routing (Protected Routes)

**File**: `frontend/src/routes/ProtectedRoute.jsx`

```javascript
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedRoute = ({ 
  element, 
  requiredRole, 
  requiredTier, 
  ...props 
}) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check admin tier
  if (requiredTier) {
    const tierLevels = {
      citizen: 0,
      ward_admin: 1,
      department_admin: 2,
      super_admin: 3
    }
    
    if (tierLevels[user.admin_tier] < tierLevels[requiredTier]) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return element
}
```

**Usage**:
```javascript
<Routes>
  {/* Citizen Routes */}
  <Route 
    path="/citizen/*" 
    element={<ProtectedRoute element={<CitizenLayout />} requiredRole="CITIZEN" />}
  />
  
  {/* Ward Admin Routes */}
  <Route 
    path="/admin/ward/*" 
    element={<ProtectedRoute element={<WardAdminLayout />} requiredTier="ward_admin" />}
  />
  
  {/* Department Admin Routes */}
  <Route 
    path="/admin/department/*" 
    element={<ProtectedRoute element={<DeptAdminLayout />} requiredTier="department_admin" />}
  />
  
  {/* Super Admin Routes */}
  <Route 
    path="/admin/super/*" 
    element={<ProtectedRoute element={<SuperAdminLayout />} requiredTier="super_admin" />}
  />
</Routes>
```

---

### 3. Conditional Rendering Based on Role

**Example Component**:

```javascript
import { useAuth } from '../hooks/useAuth'

function AdminPanel() {
  const { user } = useAuth()

  return (
    <div>
      {/* Visible to Ward Admins */}
      {user.admin_tier === 'ward_admin' && (
        <div>
          <h2>Ward {user.ward} Dashboard</h2>
          <button>Assign Officer</button>
          <button>View Ward Complaints</button>
        </div>
      )}

      {/* Visible to Department Admins */}
      {user.admin_tier === 'department_admin' && (
        <div>
          <h2>{user.department} Dashboard</h2>
          <button>Reassign to Officer</button>
          <button>Approve Closure</button>
        </div>
      )}

      {/* Visible to Super Admins ONLY */}
      {user.admin_tier === 'super_admin' && (
        <div>
          <h2>City Governance</h2>
          <button>Manage Users</button>
          <button>Create Department</button>
          <button>View Audit Logs</button>
        </div>
      )}
    </div>
  )
}
```

---

### 4. Hooks for Role Checking

**File**: `frontend/src/hooks/useAuth.js`

```javascript
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const useRole = () => {
  const { user } = useAuth()
  
  return {
    isCitizen: user?.role === 'CITIZEN',
    isWardAdmin: user?.admin_tier === 'ward_admin',
    isDepartmentAdmin: user?.admin_tier === 'department_admin',
    isSuperAdmin: user?.admin_tier === 'super_admin',
    isAdmin: user?.role === 'ADMIN',
    role: user?.role,
    adminTier: user?.admin_tier,
    ward: user?.ward,
    department: user?.department
  }
}
```

**Usage**:
```javascript
function ComplaintList() {
  const { isWardAdmin, ward } = useRole()
  
  return (
    <div>
      {isWardAdmin && <h1>Ward {ward} Complaints</h1>}
      {/* Rest of component */}
    </div>
  )
}
```

---

## Authentication Flow

### Login Process

```
1. USER SUBMITS LOGIN FORM
   └─> { email, password }

2. FRONTEND SENDS TO BACKEND
   └─> POST /users/token/
   └─> POST /users/login/

3. BACKEND VALIDATES CREDENTIALS
   └─> Check email & password
   └─> Verify user is active
   └─> Generate JWT token with claims

4. JWT TOKEN INCLUDES:
   {
     "user_id": 1,
     "email": "admin@test.com",
     "role": "ADMIN",
     "admin_tier": "super_admin",
     "ward_id": null,
     "department_id": null,
     "is_superuser": true,
     "exp": 1234567890
   }

5. FRONTEND STORES TOKEN
   └─> localStorage or sessionStorage
   └─> httpOnly cookie (recommended)

6. FRONTEND STORES USER DATA
   └─> AuthContext state
   └─> localStorage (optional)

7. FRONTEND REDIRECTS TO CORRECT DASHBOARD
   if (role === "CITIZEN") goto /citizen/dashboard
   if (admin_tier === "ward_admin") goto /admin/ward/dashboard
   if (admin_tier === "department_admin") goto /admin/dept/dashboard
   if (admin_tier === "super_admin") goto /admin/super/dashboard

8. SUBSEQUENT API REQUESTS
   └─> Include: Authorization: Bearer <token>
   └─> Backend verifies token & extracts claims
   └─> Backend checks permission classes
   └─> Allow or deny request based on role
```

---

## Authorization Rules

### Data Access Matrix

| Resource | Citizen | Ward Admin | Dept Admin | Super Admin |
|----------|---------|-----------|-----------|-------------|
| Own complaints | ✅ Read/Update | ❌ | ❌ | ✅ |
| Ward complaints | ❌ | ✅ Read/Update | ❌ | ✅ |
| Dept complaints | ❌ | ❌ | ✅ Read/Update | ✅ |
| All complaints | ❌ | ❌ | ❌ | ✅ |
| Create admin | ❌ | ❌ | ❌ | ✅ |
| Manage wards | ❌ | ❌ | ❌ | ✅ |
| Manage depts | ❌ | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |

---

## API Endpoint Mapping

### Complete Endpoint List with Permissions

```
AUTHENTICATION
  POST   /users/register/          [AllowAny]
  POST   /users/login/             [AllowAny]
  POST   /users/token/refresh/     [AllowAny]
  POST   /users/logout/            [IsAuthenticated]

CITIZEN - COMPLAINTS
  POST   /complaints/              [IsCitizen] - File complaint
  GET    /complaints/              [IsCitizen] - List own complaints
  GET    /complaints/{id}/         [IsCitizen + IsOwner]
  PATCH  /complaints/{id}/         [IsCitizen + IsOwner]
  DELETE /complaints/{id}/         [IsCitizen + IsOwner]
  POST   /complaints/{id}/feedback/ [IsCitizen] - Give feedback

CITIZEN - TRACKING
  GET    /wards/public/            [AllowAny] - Ward information
  GET    /complaints/status/       [IsCitizen] - Track own complaint

WARD ADMIN
  GET    /complaints/?ward=X       [IsWardAdmin] - List ward complaints
  PATCH  /complaints/{id}/         [IsWardAdmin + HasWardAccess]
  POST   /assignments/             [IsWardAdmin] - Assign officers
  GET    /officers/?ward=X         [IsWardAdmin] - List ward officers
  GET    /analytics/ward/          [IsWardAdmin] - Ward analytics

DEPARTMENT ADMIN
  GET    /complaints/?dept=X       [IsDepartmentAdmin]
  PATCH  /complaints/{id}/status/  [IsDepartmentAdmin + HasDeptAccess]
  POST   /officers/                [IsDepartmentAdmin] - Create officer
  GET    /officers/?dept=X         [IsDepartmentAdmin]
  GET    /analytics/department/    [IsDepartmentAdmin]

SUPER ADMIN
  GET    /users/                   [IsSuperAdmin] - List all users
  POST   /users/admin-register/    [IsSuperAdmin] - Create admin
  PATCH  /users/{id}/              [IsSuperAdmin] - Edit user
  DELETE /users/{id}/              [IsSuperAdmin] - Deactivate user
  POST   /departments/             [IsSuperAdmin] - Create department
  POST   /wards/                   [IsSuperAdmin] - Create ward
  GET    /analytics/city/          [IsSuperAdmin] - City analytics
  GET    /audit-logs/              [IsSuperAdmin] - Access logs
```

---

## Security Best Practices

### ✅ 1. Backend Permission Checking (MANDATORY)

**Never trust the frontend.** Always enforce permissions on backend:

```python
# ✅ CORRECT - Backend validates
class ComplaintUpdateView(APIView):
    permission_classes = [IsAuthenticated, IsDepartmentAdmin]
    
    def patch(self, request, complaint_id):
        complaint = get_object_or_404(Complaint, id=complaint_id)
        
        # Double-check permission
        if complaint.department != request.user.department:
            return Response(
                {"error": "Unauthorized department access"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # ... perform update
```

### ✅ 2. JWT Token Security

**Use short-lived access tokens + refresh tokens:**

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Short-lived
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### ✅ 3. Protect Sensitive Endpoints

```python
# ✅ CORRECT
class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get(self, request):
        # Only super admins reach here
        return Response(data)
```

### ✅ 4. Implement Audit Logging

```python
from django.contrib.admin.models import LogEntry

class ComplaintUpdateView(APIView):
    def patch(self, request, complaint_id):
        complaint = Complaint.objects.get(id=complaint_id)
        
        # ... update complaint
        
        # Log the action
        LogEntry.objects.create(
            user=request.user,
            content_type=ContentType.objects.get_for_model(Complaint),
            object_id=complaint.id,
            object_repr=str(complaint),
            action_flag=CHANGE,
            change_message=f"Updated status to {complaint.status}"
        )
```

### ✅ 5. Prevent Data Leakage

**Don't return sensitive fields to unauthorized users:**

```python
# ✅ CORRECT - Different serializers per role
class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['id', 'title', 'status', 'created_at']

class AdminComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['id', 'title', 'status', 'assigned_to', 
                  'resolution_time', 'created_at', 'updated_at']
```

### ✅ 6. Rate Limiting

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/hour',
        'user': '100/hour'
    }
}
```

### ✅ 7. CORS Configuration

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## Implementation Checklist

### Backend Setup

- [ ] User model has role field (✅ Done)
- [ ] JWT token includes role claims (✅ Done)
- [ ] Permission classes created for each role
- [ ] All ViewSets have permission_classes assigned
- [ ] get_queryset() filters by role/ward/department
- [ ] Audit logging implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Test all endpoints with different roles

### Frontend Setup

- [ ] AuthContext stores user role info (✅ Done)
- [ ] ProtectedRoute component created
- [ ] Role-based routing configured
- [ ] useRole() hook created
- [ ] Conditional rendering working
- [ ] UI shows only user's accessible features
- [ ] Redirect to correct dashboard after login
- [ ] Error handling for unauthorized access

### Testing

- [ ] Citizens cannot access admin endpoints
- [ ] Ward admin cannot access other ward's data
- [ ] Department admin cannot access other dept's data
- [ ] Super admin can access everything
- [ ] Token expiration works correctly
- [ ] Refresh token works correctly
- [ ] CSRF protection working
- [ ] Audit logs being created

---

## Troubleshooting

### Issue: Getting 403 Forbidden on Authorized Endpoint

**Solution**:
1. Check token is included in request: `Authorization: Bearer <token>`
2. Verify token hasn't expired
3. Check permission classes on ViewSet
4. Log request.user in permission class to debug
5. Verify user.role matches permission requirement

### Issue: Frontend Not Storing Role After Login

**Solution**:
1. Check JWT payload includes role field
2. Verify CustomTokenObtainPairSerializer is being used
3. Log response from login endpoint
4. Ensure AuthContext login() method stores user.role

### Issue: User Can See Other Users' Complaints

**Solution**:
1. Check get_queryset() filters by ward/department
2. Verify permission classes on ViewSet
3. Add detail-level permission check in perform_update()
4. Test with curl:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:8000/complaints/
   # Should only return user's complaints
   ```

### Issue: Redirect Loop After Login

**Solution**:
1. Check ProtectedRoute component logic
2. Verify user role matches required route role
3. Check for conditional rendering blocking whole page
4. Log auth state in useEffect

---

## Summary

### What You Have ✅

- User model with roles
- JWT authentication with custom claims
- AuthContext managing auth state
- Serializers and ViewSets
- Email-based login

### What To Add Next

- [ ] Permission classes for each role
- [ ] QuerySet filtering by role/ward/department
- [ ] Audit logging
- [ ] Role-based routing
- [ ] Conditional UI rendering
- [ ] Data validation on detail updates

### Key Principles

1. **Authenticate early** - Verify user is who they claim
2. **Authorize always** - Check permissions on every endpoint
3. **Validate input** - Prevent invalid data
4. **Log everything** - Track admin actions
5. **Never trust frontend** - Always revalidate on backend
6. **Encrypt sensitive data** - Use HTTPS + JWT
7. **Test thoroughly** - Test each role's access

---

**This guide provides enterprise-grade security for your municipal platform.**

Questions or need clarification on any section? Refer to:
- Django REST Framework docs: https://www.django-rest-framework.org/
- JWT best practices: https://tools.ietf.org/html/rfc7519
- OWASP Authorization: https://owasp.org/www-community/Authorization
