# 9. Authentication & Authorization

## JWT Token Flow

```
┌─────────────┐
│   User      │
│  Credentials│
└──────┬──────┘
       │
       │ POST /api/users/login/
       │
       ▼
┌──────────────────┐
│ Authentication   │
│ Service          │
└──────┬───────────┘
       │
       │ Verify credentials
       │ Generate tokens
       │
       ▼
┌──────────────────────────────┐
│ JWT Tokens Generated          │
│ - access_token (15 min)       │
│ - refresh_token (7 days)      │
└──────┬───────────────────────┘
       │
       │ Store in localStorage
       │
       ▼
┌──────────────────────────────┐
│ API Requests with Token      │
│ Authorization: Bearer <token>│
└──────┬───────────────────────┘
       │
       │ Sent with each request
       │
       ▼
┌──────────────────────────────┐
│ Token Validation             │
│ - Check signature            │
│ - Check expiration           │
│ - Verify user role/tier      │
└──────┬───────────────────────┘
       │
       ├─ Valid → Process request
       └─ Expired → Return 401
```

---

## Token Structure

### Access Token

JWT containing:
```json
{
  "token_type": "access",
  "exp": 1702717200,
  "iat": 1702716300,
  "jti": "abc123def456",
  "user_id": 5,
  "email": "user@example.com",
  "role": "CITIZEN",
  "is_superuser": false,
  "admin_tier": "citizen"
}
```

**Expiration**: 15 minutes

### Refresh Token

JWT containing:
```json
{
  "token_type": "refresh",
  "exp": 1703320200,
  "iat": 1702716300,
  "jti": "xyz789abc123",
  "user_id": 5
}
```

**Expiration**: 7 days

---

## Frontend Token Management

### Storage Keys

```javascript
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};
```

### Axios Configuration

```javascript
// Request interceptor - add token to headers
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not retry, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const response = await axiosPublic.post('/users/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Backend Authentication

### Middleware

```python
# core/middleware.py
class JWTAuthenticationMiddleware:
    """Custom JWT authentication middleware"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]  # Remove 'Bearer ' prefix
            try:
                # Validate and decode token
                decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                request.user_id = decoded_token.get('user_id')
                request.user_role = decoded_token.get('role')
                request.admin_tier = decoded_token.get('admin_tier')
            except jwt.InvalidTokenError:
                # Invalid token - will be handled by permission classes
                pass
        
        response = self.get_response(request)
        return response
```

---

## Permission Classes

### Overview

```python
# Backend permission enforcement
class IsAuthenticated(permissions.BasePermission):
    """Allow access only to authenticated users"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsSuperAdmin(permissions.BasePermission):
    """Allow access only to super admins"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and 
                request.user.is_superuser)

class IsDepartmentAdmin(permissions.BasePermission):
    """Allow access only to department admins"""
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                request.user.role == 'ADMIN' and 
                not request.user.is_superuser)

class HasDepartmentAccess(permissions.BasePermission):
    """Allow access to department-specific data"""
    def has_object_permission(self, request, view, obj):
        # Implementation checks user's department vs object's department
        pass
```

---

## Session Management

### Timeout Configuration

```javascript
// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Warning: 5 minutes before timeout
const SESSION_WARNING_TIME = 25 * 60 * 1000;

// Monitor user activity
document.addEventListener('click', resetActivityTimer);
document.addEventListener('keypress', resetActivityTimer);

function resetActivityTimer() {
  lastActivity = Date.now();
  
  // Check if session is about to timeout
  const timeSinceLastActivity = Date.now() - lastActivity;
  if (timeSinceLastActivity > SESSION_WARNING_TIME) {
    showSessionWarningModal();
  }
}
```

### Session Warning Modal

```jsx
const SessionTimeoutModal = () => {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };
  
  return (
    <Modal isOpen={showWarning}>
      <h2>Session About to Expire</h2>
      <p>Your session will expire in 5 minutes due to inactivity.</p>
      <button onClick={resetSession}>Continue Session</button>
      <button onClick={handleLogout}>Logout</button>
    </Modal>
  );
};
```

---

## Security Best Practices

### Backend

1. **Token Signing**: Use strong SECRET_KEY
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Expiration**: Short-lived access tokens (15 min)
4. **Refresh Tokens**: Longer-lived, stored securely
5. **CORS Policy**: Restrict to known domains
6. **Rate Limiting**: Prevent brute force attacks
7. **Input Validation**: Sanitize all inputs
8. **SQL Injection**: Use Django ORM (parameterized queries)

### Frontend

1. **localStorage**: Never store sensitive data
2. **Secure Cookies**: Use HttpOnly flags
3. **HTTPS Only**: Never send tokens over HTTP
4. **XSS Protection**: Sanitize all user inputs
5. **CSRF Tokens**: Use Django's CSRF middleware
6. **Logout**: Clear all auth data on logout
7. **Token Refresh**: Automatic refresh before expiry
8. **Error Handling**: Don't expose sensitive info in errors

---

## Login Flow Example

### Request

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Response

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "CITIZEN",
    "admin_tier": "citizen",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Frontend Storage

```javascript
const handleLoginSuccess = (response) => {
  // Store tokens
  localStorage.setItem('auth_token', response.access);
  localStorage.setItem('refresh_token', response.refresh);
  localStorage.setItem('user_data', JSON.stringify(response.user));
  
  // Update auth context
  dispatch({
    type: 'LOGIN_SUCCESS',
    payload: {
      user: response.user,
      token: response.access
    }
  });
  
  // Redirect based on role
  if (response.user.role === 'CITIZEN') {
    navigate('/dashboard');
  } else {
    navigate('/admin/dashboard');
  }
};
```

---

## Logout Flow

### Frontend

```javascript
const handleLogout = () => {
  // Clear storage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
  
  // Update context
  dispatch({ type: 'LOGOUT' });
  
  // Redirect
  navigate('/auth/login');
};
```

### Backend (Optional)

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout endpoint - can be used to blacklist tokens"""
    # Optional: Add token to blacklist
    # This prevents token reuse after logout
    return Response({'detail': 'Successfully logged out'})
```

