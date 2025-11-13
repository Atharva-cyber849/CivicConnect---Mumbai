# Security Enhancements Implementation Guide

## Overview
This document outlines the security enhancements implemented across the CivicConnect frontend application to ensure role-based access control, audit logging, session management, and protection against common security vulnerabilities.

## Implemented Security Features

### 1. Role-Based Access Control (RBAC)
**Location:** `frontend/src/utils/roleBasedAccess.js`

#### Three-Tier Role System:
- **Super Admin** (`is_superuser=true`): Full system access
- **Department Admin** (`role=ADMIN`): Department-scoped access
- **Ward Officer** (`role=DEPARTMENT_STAFF`): Ward-scoped access

#### Features:
- Automatic data filtering based on user role
- Component-level access verification
- Action button restrictions
- Access denial screens for unauthorized users

### 2. Audit Logging
**Location:** `frontend/src/utils/securityUtils.js`

#### Tracked Operations:
- User creation/deletion
- Permission modifications
- Status changes
- Password resets
- Super admin account creation
- Unauthorized access attempts

#### Logging Details:
```javascript
{
  timestamp: ISO8601 timestamp,
  action: operation type,
  resource: affected resource,
  resourceId: resource identifier,
  userId: user performing action,
  userEmail: user email,
  details: additional context,
  userAgent: browser info,
  url: page where action occurred
}
```

### 3. Session Management
**Location:** `frontend/src/context/AuthContext.jsx`

#### Features:
- 30-minute session timeout
- 5-minute warning before expiration
- Activity-based timeout reset
- Automatic cleanup of sensitive data on logout

#### Tracked Activities:
- Mouse movement
- Keyboard input
- Scrolling
- Touch events
- Clicks

### 4. CSRF Protection
**Location:** `frontend/src/api/axiosConfig.js`

#### Implementation:
- Automatic CSRF token extraction from cookies
- Token injection in request headers for non-safe methods
- Token validation before sensitive operations
- Automatic page reload on CSRF token expiration

### 5. API Security
**Location:** `frontend/src/api/axiosConfig.js`

#### Features:
- Bearer token authentication
- Request/response interceptors
- Automatic token refresh
- Request queuing during token refresh
- FormData handling
- Security headers injection

#### Security Headers:
```javascript
{
  'X-Requested-With': 'XMLHttpRequest',
  'X-Client-Version': version,
  'X-Timestamp': current timestamp,
  'X-CSRFToken': CSRF token
}
```

### 6. Input Sanitization
**Location:** `frontend/src/utils/securityUtils.js`

#### Protection Against:
- XSS (Cross-Site Scripting)
- HTML injection
- Script injection

#### Implementation:
```javascript
export const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input; // Automatically escapes HTML
  return div.innerHTML;
};
```

### 7. Password Security
**Location:** `frontend/src/utils/securityUtils.js`

#### Requirements for New Passwords:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

#### Validation Function:
```javascript
export const validatePassword = (password) => {
  // Returns { isValid: boolean, errors: string[] }
}
```

## Usage Examples

### Using RBAC in Components

```javascript
import { isSuperAdmin, isAdmin, isOfficer } from '../../utils/roleBasedAccess';
import { useAuth } from '../../context/AuthContext';

const MyComponent = () => {
  const { user } = useAuth();
  const userIsSuperAdmin = isSuperAdmin(user);

  // Show restricted content only to super admin
  {userIsSuperAdmin && (
    <ProtectedAdminPanel />
  )}

  return <div>Content</div>;
};
```

### Logging Sensitive Operations

```javascript
import { useSensitiveOperation } from '../../hooks/useSensitiveOperation';

const UserManagement = () => {
  const { logOperation } = useSensitiveOperation();

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserApi(userId);
      logOperation('DELETE', 'user', userId, {
        reason: 'User inactive',
        department: 'Roads'
      });
    } catch (error) {
      // Handle error
    }
  };

  return <button onClick={() => handleDeleteUser(123)}>Delete</button>;
};
```

### Implementing Access Checks

```javascript
import { canPerformAction, isResourceInUserScope } from '../../utils/securityUtils';

// Check if user can perform action
if (!canPerformAction(user, 'UPDATE_COMPLAINT', complaint)) {
  toast.error('You do not have permission to update this complaint');
  return;
}

// Verify resource is in user's scope
if (!isResourceInUserScope(user, resource)) {
  return <AccessDeniedScreen />;
}
```

## Security Best Practices

### 1. Always Verify Role Before Rendering Protected Content
```javascript
const [canAccess, setCanAccess] = useState(false);

useEffect(() => {
  if (isSuperAdmin(user)) {
    setCanAccess(true);
  }
}, [user]);

if (!canAccess) return <AccessDenied />;
```

### 2. Log All Sensitive Operations
```javascript
// For delete operations
logOperation('DELETE', 'officer', officerId, {
  department: officer.department,
  reason: 'Termination'
});

// For permission changes
logOperation('UPDATE_PERMISSIONS', 'user', userId, {
  newPermissions: [...],
  oldPermissions: [...]
});
```

### 3. Use Sanitized Input for Display
```javascript
import { sanitizeInput } from '../../utils/securityUtils';

// Safe to display user-provided content
<div>{sanitizeInput(userComment)}</div>
```

### 4. Validate Passwords on Client Side
```javascript
import { validatePassword } from '../../utils/securityUtils';

const handlePasswordChange = (newPassword) => {
  const validation = validatePassword(newPassword);
  if (!validation.isValid) {
    validation.errors.forEach(error => toast.error(error));
    return;
  }
  // Proceed with password change
};
```

## File Structure

```
frontend/src/
├── utils/
│   ├── roleBasedAccess.js      # RBAC utilities
│   ├── securityUtils.js         # Security functions
│   └── ...
├── hooks/
│   ├── useSensitiveOperation.js # Audit logging hook
│   └── ...
├── api/
│   ├── axiosConfig.js           # API security (CSRF, auth, headers)
│   ├── adminApi.js              # Admin API endpoints
│   └── ...
├── context/
│   ├── AuthContext.jsx          # Session management
│   └── ...
├── routes/
│   ├── ProtectedRoute.jsx       # Role-based route protection
│   ├── AppRouter.jsx            # Main routing
│   └── ...
└── pages/
    └── admin/
        ├── ComplaintDetails.jsx  # RBAC implementation
        ├── OfficerManagement.jsx # RBAC implementation
        ├── Reports.jsx           # RBAC implementation
        └── ...
```

## Security Checklist

- [x] Role-based access control on all admin pages
- [x] Access denial screens for unauthorized users
- [x] Data filtering based on role (auto-restricted filters)
- [x] Action button restrictions (edit, delete, reset password)
- [x] Audit logging for sensitive operations
- [x] Session timeout with warning (30 minutes)
- [x] CSRF token protection
- [x] API request/response security
- [x] Input sanitization
- [x] Password validation requirements
- [x] Resource scope verification
- [x] Sensitive data cleanup on logout

## Monitoring & Maintenance

### Local Audit Log Storage
Audit logs are stored locally (last 100 entries) in `localStorage.auditLogs` for backup and debugging purposes.

### Development Logging
In development mode, sensitive operations and security events are logged to the browser console with `[AUDIT]` and `[SECURITY]` prefixes.

### Session Timeout
Users are warned 5 minutes before session expiration and automatically logged out after 30 minutes of inactivity.

## Future Enhancements

1. Backend audit log API endpoint integration
2. Two-factor authentication (2FA)
3. IP-based access restrictions
4. Device fingerprinting
5. Advanced threat detection
6. Security event dashboards
7. Rate limiting on sensitive endpoints
8. Encrypted local storage

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Django Security: https://docs.djangoproject.com/en/stable/topics/security/
- React Security Best Practices: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
