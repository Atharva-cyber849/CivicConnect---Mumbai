# RBAC Implementation Checklist

**Status**: Step-by-step implementation roadmap for completing role-based access control

---

## Phase 1: Backend Foundation (✅ Already Verified)

- [x] User model with role field
- [x] Custom JWT serializer with role claims
- [x] EmailAuthBackend for email-based authentication
- [x] CustomLoginView using JWT
- [x] AuthContext on frontend with session management
- [x] Permission classes framework (permissions.py exists)

---

## Phase 2: Backend Enhancement (🔄 Ready for Implementation)

### Step 1: Complete Permission Classes ✅ DONE

**File**: `backend/apps/users/permissions.py`

**Status**: Enhanced with additional permission classes
- [x] IsCitizen
- [x] IsWardAdmin
- [x] IsDepartmentAdmin
- [x] IsSuperAdmin
- [x] IsAdmin
- [x] HasWardAccess
- [x] HasDepartmentAccess
- [x] IsOwnerOrAdmin
- [x] CanModifyComplaint
- [x] CanAssignComplaint
- [x] CanCloseComplaint
- [x] CanCreateUser
- [x] CanManageOfficers
- [x] CanViewAnalytics
- [x] CanApproveClosure

**Next Step**: Reference when implementing ViewSets

### Step 2: Update ComplaintViewSet ⏳ TODO

**File**: `backend/apps/complaints/views.py`

**Tasks**:
```
- [ ] Import permission classes from apps.users.permissions
- [ ] Add get_queryset() method to filter by role
- [ ] Add get_permissions() method for action-specific permissions
- [ ] Update perform_create() to set filed_by=request.user
- [ ] Add perform_update() with scope validation
- [ ] Add @action assign_complaint with permission check
- [ ] Add @action close_complaint with permission check
- [ ] Add @action analytics with role filtering
```

**Reference**: See `VIEWSET_PERMISSION_INTEGRATION.md` section 1

**Estimated Time**: 45 minutes

**Validation**:
```bash
# Test citizen can file complaint
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/ \
  -d '{"title":"Test","...":"..."}'
# Expected: 201 Created

# Test citizen cannot assign
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/1/assign_complaint/ \
  -d '{"officer_id":5}'
# Expected: 403 Forbidden
```

### Step 3: Update OfficerViewSet ⏳ TODO

**File**: `backend/apps/users/admin_views.py`

**Tasks**:
```
- [ ] Import CanCreateUser, CanManageOfficers
- [ ] Update get_queryset() to filter officers by scope
- [ ] Add get_permissions() for action-specific permissions
- [ ] Add validation in perform_update() for scope
- [ ] Add @action toggle_active
- [ ] Add @action performance metrics
- [ ] Implement audit logging for officer changes
```

**Reference**: See `VIEWSET_PERMISSION_INTEGRATION.md` section 2

**Estimated Time**: 30 minutes

**Validation**:
```bash
# Test ward admin can see their officers
curl -H "Authorization: Bearer $WARD_ADMIN_TOKEN" \
  http://localhost:8000/api/admin/officers/
# Expected: Only officers in their ward

# Test super admin sees all officers
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:8000/api/admin/officers/
# Expected: All officers
```

### Step 4: Update UserManagementViewSet ⏳ TODO

**File**: `backend/apps/users/admin_views.py`

**Tasks**:
```
- [ ] Import CanCreateUser, IsAdmin
- [ ] Update get_queryset() to filter users by scope
- [ ] Add get_permissions() for read-only enforcement
- [ ] Add @action toggle_status with scope validation
- [ ] Implement audit logging for user status changes
```

**Estimated Time**: 20 minutes

### Step 5: Audit Logging (Optional but Recommended) ⏳ TODO

**File**: Create `backend/apps/audit/models.py`

**Tasks**:
```
- [ ] Create AuditLog model
- [ ] Add fields: user, action, object_type, object_id, timestamp, details
- [ ] Create migration
- [ ] Update ViewSets to log admin actions
- [ ] Create audit log viewer (admin only)
```

**Reference Implementation**:
```python
from django.db import models

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
        ('ASSIGN', 'Assign'),
        ('CLOSE', 'Close'),
        ('APPROVE', 'Approve'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    object_type = models.CharField(max_length=50)  # 'complaint', 'officer', 'user'
    object_id = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField()
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
        ]
```

**Estimated Time**: 45 minutes

### Step 6: Settings Configuration ⏳ TODO

**File**: `backend/core/settings.py`

**Tasks**:
```
- [ ] Configure JWT settings:
    - ACCESS_TOKEN_LIFETIME = 15 minutes
    - REFRESH_TOKEN_LIFETIME = 7 days
    
- [ ] Configure authentication:
    - AUTHENTICATION_BACKENDS = [
        'apps.users.auth.EmailAuthBackend',
        'django.contrib.auth.backends.ModelBackend',
      ]
    
- [ ] Configure DRF:
    - DEFAULT_PERMISSION_CLASSES = [
        'rest_framework.permissions.IsAuthenticated',
      ]
    - DEFAULT_AUTHENTICATION_CLASSES = [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
      ]
```

**Estimated Time**: 15 minutes

---

## Phase 3: Frontend Implementation (🔄 Ready for Implementation)

### Step 7: Create useRole() Hook ⏳ TODO

**File**: `frontend/src/hooks/useRole.js`

**Status**: Documentation provided, ready for coding

**Tasks**:
```
- [ ] Create hook file with complete implementation
- [ ] Export useRole function
- [ ] Test hook returns correct role/tier data
- [ ] Verify admin_tier calculation from JWT
```

**Reference**: See `FRONTEND_RBAC_IMPLEMENTATION.md` section 1

**Estimated Time**: 20 minutes

**Validation**:
```javascript
const role = useRole();
console.log(role.isSuperAdmin); // Should be true/false based on role
console.log(role.tier); // Should be 0-3
console.log(role.getScopeName()); // Should return scope name
```

### Step 8: Create ProtectedRoute Component ⏳ TODO

**File**: `frontend/src/routes/ProtectedRoute.jsx`

**Tasks**:
```
- [ ] Create ProtectedRoute component
- [ ] Implement role checking
- [ ] Implement tier checking
- [ ] Implement ward/department requirement checks
- [ ] Implement redirect logic for unauthorized access
- [ ] Add loading state handling
```

**Reference**: See `FRONTEND_RBAC_IMPLEMENTATION.md` section 2

**Estimated Time**: 25 minutes

**Validation**:
```javascript
// Test citizen cannot access admin route
<ProtectedRoute 
  Component={AdminDashboard}
  requiredRole="ADMIN"
/>
// Should redirect to /unauthorized or login

// Test super admin can access super admin route
<ProtectedRoute 
  Component={SuperAdminDashboard}
  requiredRole="ADMIN"
  minTier={3}
/>
// Should render component
```

### Step 9: Update Route Configuration ⏳ TODO

**File**: `frontend/src/routes/index.jsx`

**Tasks**:
```
- [ ] Import ProtectedRoute component
- [ ] Replace existing routes with ProtectedRoute wrapped routes
- [ ] Configure routes by role:
    - /citizen/* for CITIZEN role
    - /admin/ward/* for ADMIN + tier=1
    - /admin/dept/* for ADMIN + tier=2
    - /admin/super/* for ADMIN + tier=3
- [ ] Add redirect from root to appropriate dashboard
- [ ] Add 404 and unauthorized pages
```

**Reference**: See `FRONTEND_RBAC_IMPLEMENTATION.md` section 3

**Estimated Time**: 30 minutes

**Validation**:
```bash
# Navigate to /admin/super/dashboard as citizen
# Expected: Redirect to login or unauthorized
```

### Step 10: Create useRender() Hook ⏳ TODO

**File**: `frontend/src/hooks/useRender.js`

**Tasks**:
```
- [ ] Create hook for conditional rendering
- [ ] Implement ifCitizen, ifAdmin, ifWardAdmin, ifDeptAdmin, ifSuperAdmin
- [ ] Implement ifCanViewAnalytics, ifCanAssign, ifCanClose
- [ ] Implement render function for custom logic
```

**Reference**: See `FRONTEND_RBAC_IMPLEMENTATION.md` section 4

**Estimated Time**: 15 minutes

### Step 11: Update Components for Conditional Rendering ⏳ TODO

**Files**: All components that have role-specific elements
- `frontend/src/pages/complaints/ComplaintDetail.jsx`
- `frontend/src/pages/admin/Dashboard.jsx`
- Navigation/Menu components
- Action buttons throughout app

**Tasks for Each File**:
```
- [ ] Import useRole or useRender hook
- [ ] Replace hardcoded admin sections with conditional rendering
- [ ] Hide/show buttons based on permissions:
    - Assign button: only for admins
    - Close button: only for dept+ admins
    - Manage users: only for super admin
    - Analytics: only for non-citizens
    - Edit own: citizens only
```

**Example**:
```javascript
import { useRole } from '../hooks/useRole';

const ComplaintDetail = () => {
  const role = useRole();
  
  return (
    <div>
      {role.canAssignComplaints && (
        <button onClick={handleAssign}>Assign</button>
      )}
      
      {role.canCloseComplaints && (
        <button onClick={handleClose}>Close</button>
      )}
    </div>
  );
};
```

**Estimated Time**: 1-2 hours (depends on number of components)

### Step 12: Frontend Error Handling ⏳ TODO

**Tasks**:
```
- [ ] Handle 401 Unauthorized responses (expired token)
- [ ] Handle 403 Forbidden responses (permission denied)
- [ ] Show user-friendly error messages
- [ ] Implement token refresh on 401
- [ ] Redirect to login on repeated 401
```

**Reference Code**:
```javascript
// In axios interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired - refresh or redirect to login
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Permission denied - show error
      showToast('You do not have permission to perform this action');
    }
    return Promise.reject(error);
  }
);
```

**Estimated Time**: 20 minutes

---

## Phase 4: Testing (🔄 Ready for Implementation)

### Step 13: Create Test Users ⏳ TODO

**File**: `backend/apps/users/management/commands/create_test_users.py`

**Tasks**:
```
- [ ] Create management command for test user creation
- [ ] Create 5 test users (citizen, ward admin A, ward admin B, dept admin, super admin)
- [ ] Script output includes login credentials
- [ ] Store credentials in safe place for testing
```

**Reference**: See `RBAC_TESTING_GUIDE.md` section 1

**Estimated Time**: 15 minutes

### Step 14: Backend API Tests ⏳ TODO

**Files**:
- `backend/apps/complaints/tests.py`
- `backend/apps/users/tests.py`

**Tasks**:
```
- [ ] Create TestCase for ComplaintPermissions
- [ ] Test: Citizen can file complaint
- [ ] Test: Citizen cannot assign complaint
- [ ] Test: Ward admin sees only own ward
- [ ] Test: Super admin sees all complaints
- [ ] Test: Ward admin cannot modify other ward
- [ ] Create TestCase for UserPermissions
- [ ] Test: Citizen cannot create users
- [ ] Test: Super admin can create users
```

**Reference**: See `RBAC_TESTING_GUIDE.md` section 9

**Run Tests**:
```bash
python manage.py test apps.complaints.tests.ComplaintPermissionTests -v 2
python manage.py test apps.users.tests.UserPermissionTests -v 2
```

**Estimated Time**: 1 hour

### Step 15: Frontend Component Tests ⏳ TODO

**Files**:
- `frontend/src/hooks/__tests__/useRole.test.js`
- `frontend/src/routes/__tests__/ProtectedRoute.test.jsx`

**Tasks**:
```
- [ ] Test useRole returns correct values for each role
- [ ] Test ProtectedRoute renders for authorized users
- [ ] Test ProtectedRoute redirects for unauthorized users
- [ ] Test conditional rendering in components
```

**Example**:
```javascript
import { render, screen } from '@testing-library/react';
import { useRole } from '../useRole';

test('useRole returns correct tier for super admin', () => {
  // Mock user as super admin
  const { tier, isSuperAdmin } = useRole();
  
  expect(tier).toBe(3);
  expect(isSuperAdmin).toBe(true);
});
```

**Estimated Time**: 1 hour

### Step 16: Manual Testing ⏳ TODO

**Reference**: See `RBAC_TESTING_GUIDE.md` sections 2-8

**Test Matrix**:
```
- [ ] Test 1: Login as each role
- [ ] Test 2: Verify JWT claims for each role
- [ ] Test 3: Citizen lists only own complaints
- [ ] Test 4: Ward admin lists only ward complaints
- [ ] Test 5: Department admin lists department complaints
- [ ] Test 6: Super admin lists all complaints
- [ ] Test 7: Only citizens can file complaints
- [ ] Test 8: Only admins can assign complaints
- [ ] Test 9: Only dept+ admins can close complaints
- [ ] Test 10: Only super admin can create users
- [ ] Test 11: Citizens can only modify own complaints
- [ ] Test 12: Ward admin can only modify ward complaints
- [ ] Test 13: Admins can view analytics, citizens cannot
- [ ] Test 14: Protected routes redirect unauthorized users
- [ ] Test 15: Token expiration and refresh works
```

**Estimated Time**: 2-3 hours

---

## Phase 5: Security Hardening (Optional but Recommended)

### Step 17: Rate Limiting ⏳ TODO

**File**: `backend/core/settings.py`

**Tasks**:
```
- [ ] Install djangorestframework-throttling
- [ ] Configure AnonRateThrottle: 100/hour
- [ ] Configure UserRateThrottle: 1000/hour
- [ ] Apply to login endpoint: more restrictive
- [ ] Test rate limiting with multiple requests
```

**Estimated Time**: 20 minutes

### Step 18: CORS Configuration ⏳ TODO

**File**: `backend/core/settings.py`

**Tasks**:
```
- [ ] Configure CORS_ALLOWED_ORIGINS for production
- [ ] Only allow frontend domain
- [ ] Disallow credentials if not necessary
```

**Estimated Time**: 10 minutes

### Step 19: HTTPS/SSL Configuration ⏳ TODO

**For Production**:
```
- [ ] Enable HTTPS only
- [ ] Set Secure flag on cookies
- [ ] Set SameSite=Strict on cookies
- [ ] Set HSTS headers
```

**Estimated Time**: 30 minutes

---

## Summary

### Time Estimates

| Phase | Task | Time |
|-------|------|------|
| 2 | Step 1: Permission Classes | ✅ 0 (Done) |
| 2 | Step 2: ComplaintViewSet | 45 min |
| 2 | Step 3: OfficerViewSet | 30 min |
| 2 | Step 4: UserManagementViewSet | 20 min |
| 2 | Step 5: Audit Logging | 45 min |
| 2 | Step 6: Settings | 15 min |
| **Backend Total** | | **2.5 hours** |
| 3 | Step 7: useRole Hook | 20 min |
| 3 | Step 8: ProtectedRoute | 25 min |
| 3 | Step 9: Routes | 30 min |
| 3 | Step 10: useRender Hook | 15 min |
| 3 | Step 11: Component Updates | 1-2 hours |
| 3 | Step 12: Error Handling | 20 min |
| **Frontend Total** | | **2.5-3.5 hours** |
| 4 | Step 13: Test Users | 15 min |
| 4 | Step 14: Backend Tests | 1 hour |
| 4 | Step 15: Frontend Tests | 1 hour |
| 4 | Step 16: Manual Testing | 2-3 hours |
| **Testing Total** | | **4-5 hours** |
| **TOTAL** | | **9-11 hours** |

### Priority Ranking

**CRITICAL (Do First)**:
1. Step 1: Permission Classes ✅
2. Step 2: ComplaintViewSet (45 min)
3. Step 8: ProtectedRoute (25 min)
4. Step 9: Routes (30 min)
5. Step 16: Manual Testing (2-3 hours)

**HIGH (Do Second)**:
6. Step 3: OfficerViewSet (30 min)
7. Step 7: useRole Hook (20 min)
8. Step 11: Component Updates (1-2 hours)

**MEDIUM (Do Third)**:
9. Step 4: UserManagementViewSet (20 min)
10. Step 6: Settings (15 min)
11. Step 14: Backend Tests (1 hour)

**LOW (Do Last)**:
12. Step 5: Audit Logging (45 min)
13. Step 10: useRender Hook (15 min)
14. Step 12: Error Handling (20 min)
15. Step 15: Frontend Tests (1 hour)
16. Steps 17-19: Security (1 hour)

---

## Checklist for Team

Copy this checklist to track implementation:

```
RBAC Implementation Progress
============================

PHASE 2 - BACKEND (2.5 hours)
- [ ] Step 2: ComplaintViewSet (45 min)
- [ ] Step 3: OfficerViewSet (30 min)
- [ ] Step 4: UserManagementViewSet (20 min)
- [ ] Step 5: Audit Logging (45 min) - Optional
- [ ] Step 6: Settings (15 min)

PHASE 3 - FRONTEND (2.5-3.5 hours)
- [ ] Step 7: useRole Hook (20 min)
- [ ] Step 8: ProtectedRoute (25 min)
- [ ] Step 9: Routes (30 min)
- [ ] Step 10: useRender Hook (15 min)
- [ ] Step 11: Component Updates (1-2 hours)
- [ ] Step 12: Error Handling (20 min)

PHASE 4 - TESTING (4-5 hours)
- [ ] Step 13: Test Users (15 min)
- [ ] Step 14: Backend Tests (1 hour)
- [ ] Step 15: Frontend Tests (1 hour)
- [ ] Step 16: Manual Testing (2-3 hours)

PHASE 5 - SECURITY (Optional, 1 hour)
- [ ] Step 17: Rate Limiting (20 min)
- [ ] Step 18: CORS (10 min)
- [ ] Step 19: HTTPS/SSL (30 min)

Total Time: 9-11 hours
```

---

**Ready to implement! Start with CRITICAL tasks for immediate security benefits.**
