# 6. 3-Tier Admin Hierarchy

## Overview

CivicConnect Mumbai implements a sophisticated 3-tier administrative hierarchy to ensure proper delegation and access control:

1. **Super Admin** - System-wide control
2. **Department Admin** - Department-level control
3. **BMC Officer** - Ward-level control
4. **Citizen** - Personal access

---

## Role Definitions

### Super Admin

| Property | Value |
|----------|-------|
| **Database** | `role='ADMIN'` + `is_superuser=True` |
| **Access Level** | Full system access |
| **Scope** | All departments, all wards |
| **Permissions** | Can manage everything |

**Responsibilities:**
- Create and manage departments
- Manage all users (department admins, officers)
- View all complaints across the system
- System configuration and settings
- Analytics and reporting for entire system

---

### Department Admin

| Property | Value |
|----------|-------|
| **Database** | `role='ADMIN'` + `is_superuser=False` + Officer profile with department |
| **Access Level** | Department-level access |
| **Scope** | Single department, all wards in that dept |
| **Permissions** | Limited to department |

**Responsibilities:**
- Manage officers within their department
- View all complaints in their department
- Update complaint status for department
- Department-specific analytics
- Cannot modify other departments or system settings

---

### BMC Officer

| Property | Value |
|----------|-------|
| **Database** | `role='DEPARTMENT_STAFF'` + Officer profile with ward |
| **Access Level** | Ward-level access |
| **Scope** | Single ward, specific department |
| **Permissions** | Limited to assigned ward |

**Responsibilities:**
- Manage complaints in assigned ward
- Update complaint status
- Add resolution notes and photos
- Track SLA compliance
- Cannot create other officers or change assignments

---

### Citizen

| Property | Value |
|----------|-------|
| **Database** | `role='CITIZEN'` |
| **Access Level** | Personal access only |
| **Scope** | Own complaints |
| **Permissions** | Submit and view own |

**Responsibilities:**
- Submit new complaints
- Track own complaints
- View complaint status and updates
- Cannot view others' complaints

---

## Access Matrix

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
| Submit Complaints | ✅ | ✅ | ✅ | ✅ |
| Add Officer Notes | ✅ | ✅ | ✅ | ❌ |
| Change Priority | ✅ | ✅ | ✅ | ❌ |

---

## Database Implementation

### User Model Properties

```python
@property
def admin_tier(self):
    """Returns the admin tier for the user"""
    if self.role == 'ADMIN' and self.is_superuser:
        return 'super_admin'
    elif self.role == 'ADMIN' and not self.is_superuser:
        return 'department_admin'
    elif self.role == 'DEPARTMENT_STAFF':
        return 'bmc_officer'
    return 'citizen'

@property
def is_super_admin(self):
    return self.role == 'ADMIN' and self.is_superuser

@property
def is_department_admin(self):
    return self.role == 'ADMIN' and not self.is_superuser

@property
def is_bmc_officer(self):
    return self.role == 'DEPARTMENT_STAFF'
```

---

## Permission Classes

### Backend Permissions

```python
class IsSuperAdmin(permissions.BasePermission):
    """Only Super Admins (ADMIN + is_superuser) can access"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and 
                request.user.is_superuser)

class IsDepartmentAdmin(permissions.BasePermission):
    """Only Department Admins can access"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and 
                not request.user.is_superuser)

class HasDepartmentAccess(permissions.BasePermission):
    """Check if user has access based on department"""
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Super admins: all access
        if user.role == 'ADMIN' and user.is_superuser:
            return True
        
        # Department admins: department access
        if hasattr(user, 'officer_profile') and user.officer_profile.department:
            return obj.department == user.officer_profile.department
        
        return False
```

---

### Frontend Role Checks

```javascript
import { isSuperAdmin, isDepartmentAdmin, isOfficer } from '../utils/roleBasedAccess';

// In components:
{isSuperAdmin(user) && <SuperAdminFeature />}
{isDepartmentAdmin(user) && <DeptAdminFeature />}
{isOfficer(user) && <OfficerFeature />}
```

---

## Complaint Filtering Logic

The most critical part - how complaints are filtered by role:

```python
def get_queryset(self):
    user = self.request.user
    queryset = Complaint.objects.select_related('user', 'department', 'assigned_to')
    
    # Super Admin: sees ALL complaints
    if user.role == 'ADMIN' and user.is_superuser:
        return queryset.all()
    
    # Department Admin: sees only their department's complaints
    elif user.role == 'ADMIN' and not user.is_superuser:
        if hasattr(user, 'officer_profile') and user.officer_profile.department:
            department = user.officer_profile.department
            return queryset.filter(department=department)
        return queryset.none()
    
    # BMC Officer: sees only their assigned ward
    elif user.role == 'DEPARTMENT_STAFF':
        if hasattr(user, 'officer_profile'):
            ward = user.officer_profile.assigned_ward or user.ward
            if ward:
                return queryset.filter(ward__iexact=ward)
        return queryset.none()
    
    # Citizen: sees only their own complaints
    return queryset.filter(user=user)
```

---

## Dashboard Views

### Super Admin Dashboard
- System overview
- All departments view
- All complaints across system
- System-wide analytics
- User management

### Department Admin Dashboard
- Department overview
- Department complaints
- Department officers
- Department analytics
- Officer performance

### BMC Officer Dashboard
- Ward overview
- Ward complaints
- Personal performance
- SLA tracking
- Resolution notes

### Citizen Dashboard
- My complaints
- Complaint status
- Create new complaint
- Track progress

---

## Role Transitions

### Creation Flow

1. **Super Admin** creates Department Admin
   - Creates User with `role='ADMIN'`, `is_superuser=False`
   - Creates Officer profile with department
   - Cannot have both is_superuser=True and is_superuser=False

2. **Department Admin** creates BMC Officer
   - Creates User with `role='DEPARTMENT_STAFF'`
   - Creates Officer profile with ward
   - Assigned to same department as creator

3. **System** creates Citizen
   - Creates User with `role='CITIZEN'`
   - No Officer profile needed
   - Can submit complaints

---

## Security Considerations

1. **No Privilege Escalation**: Department Admins cannot create other Department Admins
2. **Data Isolation**: Each tier only sees their own data
3. **Edit Restrictions**: Can only edit own tier data
4. **Audit Trail**: All changes are logged
5. **JWT Validation**: Admin tier is validated on every request

