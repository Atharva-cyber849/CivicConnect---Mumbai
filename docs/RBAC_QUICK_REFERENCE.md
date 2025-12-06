# RBAC Quick Reference Card

**Use this for quick lookups during implementation**

---

## Permission Classes Cheat Sheet

### Basic Role Checks
```python
from apps.users.permissions import (
    IsCitizen,          # Only citizens
    IsAdmin,            # Any admin
    IsWardAdmin,        # Ward admin only
    IsDepartmentAdmin,  # Dept admin only
    IsSuperAdmin,       # Super admin only
)

# Usage in ViewSet
permission_classes = [IsAuthenticated, IsCitizen]
```

### Access Control
```python
from apps.users.permissions import (
    HasWardAccess,           # Check ward scope
    HasDepartmentAccess,     # Check department scope
    IsOwnerOrAdmin,          # Owner OR admin
    CanModifyComplaint,      # Permission to modify
    CanAssignComplaint,      # Permission to assign
    CanCloseComplaint,       # Permission to close
    CanCreateUser,           # Permission to create users
    CanManageOfficers,       # Permission to manage officers
)
```

---

## ViewSet Pattern

```python
class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    
    # 1. Filter querysets by role
    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return Complaint.objects.all()
        elif user.is_ward_admin:
            return Complaint.objects.filter(ward=user.ward)
        else:
            return Complaint.objects.filter(filed_by=user)
    
    # 2. Different permissions per action
    def get_permissions(self):
        if self.action == 'create':
            return [IsCitizen()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), CanModifyComplaint()]
        return [IsAuthenticated()]
    
    # 3. Validate before saving
    def perform_update(self, serializer):
        obj = serializer.instance
        if not CanModifyComplaint().has_object_permission(
            self.request, self, obj
        ):
            self.permission_denied(self.request)
        serializer.save()
```

---

## Frontend Hooks

### useRole Hook
```javascript
import { useRole } from '../hooks/useRole';

const MyComponent = () => {
  const role = useRole();
  
  // Check role/tier
  role.isCitizen              // true if citizen
  role.isWardAdmin            // true if ward admin
  role.isDepartmentAdmin      // true if dept admin
  role.isSuperAdmin           // true if super admin
  
  // Check permissions
  role.canAssignComplaints    // true if admin
  role.canCloseComplaints     // true if dept+ admin
  role.canViewAnalytics       // true if not citizen
  
  // Get scope
  role.ward                   // Ward object
  role.department             // Department object
  role.tier                   // 0-3
  
  return (
    {role.canAssignComplaints && <AssignButton />}
  );
};
```

### useRender Hook
```javascript
import { useRender } from '../hooks/useRender';

const MyComponent = () => {
  const render = useRender();
  
  return (
    <div>
      {render.ifAdmin(<AdminPanel />)}
      {render.ifCitizen(<CitizenView />)}
      {render.ifSuperAdmin(<SuperAdminTools />)}
      {render.render(role => 
        role.isSuperAdmin && <SpecialFeature />
      )}
    </div>
  );
};
```

---

## Routing Pattern

```javascript
<Routes>
  {/* Citizen routes */}
  <Route
    path="/citizen/dashboard"
    element={
      <ProtectedRoute
        Component={CitizenDashboard}
        requiredRole="CITIZEN"
      />
    }
  />
  
  {/* Ward admin routes */}
  <Route
    path="/admin/ward/dashboard"
    element={
      <ProtectedRoute
        Component={WardDashboard}
        requiredRole="ADMIN"
        minTier={1}
        requireWard={true}
      />
    }
  />
  
  {/* Super admin routes */}
  <Route
    path="/admin/super/dashboard"
    element={
      <ProtectedRoute
        Component={SuperDashboard}
        requiredRole="ADMIN"
        minTier={3}
      />
    }
  />
</Routes>
```

---

## Testing Quick Commands

```bash
# Get citizen token
export CITIZEN_TOKEN=$(curl -s -X POST \
  http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@test.com","password":"pass"}' | jq -r '.access')

# Get admin token
export ADMIN_TOKEN=$(curl -s -X POST \
  http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"pass"}' | jq -r '.access')

# Test endpoint as citizen
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/

# Test endpoint as admin
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/

# Decode token
python -c "import jwt; print(jwt.decode('$CITIZEN_TOKEN', options={'verify_signature': False}))"
```

---

## Role Tier Values

| Role | is_superuser | is_staff | ward | department | Tier | Name |
|------|-------------|----------|------|-----------|------|------|
| CITIZEN | - | - | - | - | 0 | Citizen |
| ADMIN | False | True | ✓ | - | 1 | Ward Admin |
| ADMIN | False | True | - | ✓ | 2 | Dept Admin |
| ADMIN | True | True | - | - | 3 | Super Admin |

---

## JWT Token Structure

```javascript
{
  "token_type": "access",
  "exp": 1234567890,      // Expiration (15 min)
  "iat": 1234567890,      // Issued at
  "jti": "xxx",
  "user_id": 1,
  "email": "user@example.com",
  "role": "ADMIN",        // CITIZEN, ADMIN, DEPARTMENT_STAFF
  "admin_tier": 2,        // 0-3 (higher = more access)
  "is_superuser": false,
  "ward_id": 1,
  "ward_name": "Ward A",
  "department_id": 5,
  "department_name": "Police"
}
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token expired or invalid | Get fresh token, check SECRET_KEY |
| 403 Forbidden | Permission denied | Check user role/tier/scope, verify permission class |
| 404 Not Found | Queryset filtered it out | Check get_queryset() filtering |
| Null user in hook | Not logged in | Check isAuthenticated before using user |
| Buttons not showing | Permission logic wrong | Log role/tier in component, check useRole |

---

## Implementation Checklist (Quick Version)

```
CRITICAL (Do First)
☐ Step 1: Permission classes (DONE)
☐ Step 2: ComplaintViewSet integration
☐ Step 8: ProtectedRoute component
☐ Step 9: Routes configuration
☐ Step 16: Manual testing

HIGH (Do Second)
☐ Step 3: OfficerViewSet integration
☐ Step 7: useRole hook
☐ Step 11: Component updates

MEDIUM (Do Third)
☐ Step 4: UserManagementViewSet
☐ Step 6: Settings config
☐ Step 14: Backend tests

LOW (Do Last)
☐ Step 5: Audit logging
☐ Step 10: useRender hook
☐ Step 12: Error handling
☐ Step 15: Frontend tests
☐ Steps 17-19: Security hardening
```

**Time: 9-11 hours total**

---

## File Quick Reference

| Document | Purpose | Read Time |
|----------|---------|-----------|
| ROLE_BASED_ACCESS_CONTROL_GUIDE.md | Architecture & concepts | 30 min |
| PERMISSION_CLASSES_IMPLEMENTATION.md | Backend code | 20 min |
| VIEWSET_PERMISSION_INTEGRATION.md | ViewSet patterns | 25 min |
| FRONTEND_RBAC_IMPLEMENTATION.md | Frontend code | 25 min |
| RBAC_TESTING_GUIDE.md | Test cases | 30 min |
| RBAC_IMPLEMENTATION_CHECKLIST.md | Step-by-step guide | 15 min |
| RBAC_TROUBLESHOOTING_FAQ.md | Debugging | 20 min |
| RBAC_IMPLEMENTATION_SUMMARY.md | Overview | 15 min |

---

## Key Files to Edit

```
backend/
  apps/users/
    permissions.py ✅ Enhanced
    admin_views.py → ComplaintViewSet
    admin_views.py → OfficerViewSet
  apps/complaints/
    views.py → ComplaintViewSet
  core/
    settings.py → Review JWT config

frontend/
  src/hooks/
    useRole.js → Create
    useRender.js → Create
  src/routes/
    ProtectedRoute.jsx → Create
    index.jsx → Update
  src/pages/
    All components → Add useRole
```

---

## Permission Hierarchy Decision Tree

```
Is user authenticated?
├─ No → Return 401 Unauthorized
└─ Yes → Check role
   ├─ role == 'CITIZEN'?
   │  └─ Can file complaints, view own, modify own
   │
   └─ role == 'ADMIN'?
      ├─ is_superuser?
      │  └─ Tier 3: Full access to everything
      │
      └─ has department?
      │  └─ Tier 2: Can close, manage dept
      │
      └─ has ward?
         └─ Tier 1: Can assign, manage ward
```

---

## Code Snippets

### Check permission in view
```python
if not user.is_super_admin:
    self.permission_denied(self.request)
```

### Filter queryset
```python
if user.is_ward_admin:
    return qs.filter(ward=user.ward)
```

### Check conditional render
```javascript
{role.canAssignComplaints && <button onClick={assign}>Assign</button>}
```

### Validate before update
```python
perm = CanModifyComplaint()
if not perm.has_object_permission(request, self, obj):
    self.permission_denied(request)
```

---

## API Endpoint Quick Reference

| Endpoint | Role | Method | Permission |
|----------|------|--------|-----------|
| /api/users/login/ | All | POST | AllowAny |
| /api/complaints/ | ALL | GET | IsCitizen/IsAdmin (filtered) |
| /api/complaints/ | Citizen | POST | IsCitizen |
| /api/complaints/{id}/ | ALL | PATCH | CanModifyComplaint |
| /api/complaints/{id}/assign/ | Admin | POST | CanAssignComplaint |
| /api/complaints/{id}/close/ | Dept+ | POST | CanCloseComplaint |
| /api/admin/officers/ | Admin | GET | IsAdmin (filtered) |
| /api/admin/users/ | Super | GET | IsSuperAdmin |

---

## Session Management

```javascript
// Frontend
SESSION_TIMEOUT = 30 * 60 * 1000         // 30 minutes
SESSION_WARNING_TIME = 5 * 60 * 1000     // Warning at 5 min

// Backend JWT
ACCESS_TOKEN_LIFETIME = 15 minutes
REFRESH_TOKEN_LIFETIME = 7 days
```

---

**Print this card or bookmark it for quick reference during implementation! 🚀**
