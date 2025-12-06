# RBAC Troubleshooting & FAQ

**Purpose**: Common issues and solutions during RBAC implementation

---

## Backend Issues

### Issue 1: "Token Invalid or Expired" on Valid Token

**Symptom**: 
```
POST /api/complaints/
401 Unauthorized
{"detail": "Token is invalid or expired"}
```

**Possible Causes**:
1. Token has actually expired (default: 15 minutes)
2. Token secret key changed in settings
3. Token signed with different algorithm
4. Request is missing Authorization header

**Solutions**:

```bash
# 1. Decode token to check expiration
import jwt
token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
payload = jwt.decode(token, options={"verify_signature": False})
print(payload['exp'])  # Check if past current time

# 2. Verify token format
# Header should be: "Authorization: Bearer <token>"
# NOT: "Authorization: <token>"

# 3. Get fresh token
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 4. Check settings.py has correct SECRET_KEY
# SIMPLE_JWT = {
#     'SECRET_KEY': settings.SECRET_KEY,  # Should match Django SECRET_KEY
#     'ALGORITHM': 'HS256',
# }
```

---

### Issue 2: Permission Denied (403) on Allowed Action

**Symptom**:
```
POST /api/complaints/1/assign_complaint/
403 Forbidden
{"detail": "You do not have permission to assign complaints."}
```

**Possible Causes**:
1. User role doesn't match permission class
2. User doesn't have required scope (ward/department)
3. Permission class order in list is wrong
4. get_permissions() returning wrong classes

**Solutions**:

```python
# 1. Check user role in shell
python manage.py shell
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='user@example.com')
print(f"Role: {user.role}")
print(f"Is Admin: {user.is_admin}")
print(f"Is Super Admin: {user.is_super_admin}")
print(f"Ward: {user.ward}")
print(f"Department: {user.department}")

# 2. Check token claims
import jwt
token = "..."
payload = jwt.decode(token, options={"verify_signature": False})
print(f"Email: {payload.get('email')}")
print(f"Role: {payload.get('role')}")
print(f"Admin Tier: {payload.get('admin_tier')}")

# 3. Verify permission class is applied
# ViewSet should have:
# permission_classes = [IsAuthenticated, CanAssignComplaint]
# NOT:
# permission_classes = [CanAssignComplaint, IsAuthenticated]
# (order matters - more general before more specific)

# 4. Debug permission check
# Add print statements in permission class
class CanAssignComplaint(BasePermission):
    def has_permission(self, request, view):
        print(f"User: {request.user}")
        print(f"User role: {request.user.role}")
        print(f"Is admin: {request.user.role == 'ADMIN'}")
        return request.user.role == 'ADMIN'
```

---

### Issue 3: Queryset Returns All Items Instead of Filtered

**Symptom**:
```
GET /api/complaints/ (as Ward Admin A)
Returns: All complaints from all wards
Expected: Only complaints from Ward A
```

**Possible Causes**:
1. get_queryset() not implemented in ViewSet
2. get_queryset() not filtering by role
3. filter() call is missing

**Solution**:

```python
# WRONG - returns all
class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all()  # ❌ This is the problem
    serializer_class = ComplaintSerializer

# RIGHT - override get_queryset()
class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    
    def get_queryset(self):  # ✅ Always override this
        user = self.request.user
        
        if user.is_super_admin:
            return Complaint.objects.all()
        elif user.is_ward_admin:
            return Complaint.objects.filter(ward=user.ward)
        elif user.is_citizen:
            return Complaint.objects.filter(filed_by=user)
        else:
            return Complaint.objects.none()
```

---

### Issue 4: "User Does Not Have Attribute 'ward'" Error

**Symptom**:
```
AttributeError: 'User' object has no attribute 'ward'
```

**Possible Causes**:
1. Migration not applied - ward field doesn't exist in database
2. User model not modified to include ward FK
3. Using wrong User model

**Solution**:

```bash
# 1. Check User model has ward field
python manage.py shell
from django.contrib.auth import get_user_model
User = get_user_model()
print(User._meta.fields)  # Should include 'ward'

# 2. If missing, add field to User model
# In apps/users/models.py:
class User(AbstractUser):
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)

# 3. Create and run migration
python manage.py makemigrations users
python manage.py migrate

# 4. Verify field exists
python manage.py shell
User = get_user_model()
user = User.objects.first()
print(user.ward)  # Should not raise error
```

---

### Issue 5: Admin Tier Not in JWT Token

**Symptom**:
```
{
  "access": "...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ADMIN",
    "admin_tier": null  // ❌ Should have value
  }
}
```

**Possible Causes**:
1. get_admin_tier() function doesn't exist
2. CustomTokenObtainPairSerializer not adding admin_tier
3. get_token() method not being called

**Solution**:

```python
# 1. Verify get_admin_tier function exists in serializers_jwt.py
from apps.users.serializers_jwt import get_admin_tier

def get_admin_tier(user):
    """
    Determine admin tier:
    0 = Citizen
    1 = Ward Admin (has ward, is_superuser=False)
    2 = Department Admin (has department, is_superuser=False)
    3 = Super Admin (is_superuser=True)
    """
    if user.role != 'ADMIN':
        return 0
    
    if user.is_superuser:
        return 3
    
    if user.department and not user.ward:
        return 2
    
    if user.ward and not user.department:
        return 1
    
    return 0

# 2. Verify it's used in CustomTokenObtainPairSerializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['admin_tier'] = get_admin_tier(user)  # ✅ Add this line
        return token

# 3. Test it
python manage.py shell
from apps.users.serializers_jwt import get_admin_tier, CustomTokenObtainPairSerializer
user = User.objects.get(email='user@example.com')
tier = get_admin_tier(user)
print(f"Tier: {tier}")  # Should be 0-3
```

---

## Frontend Issues

### Issue 6: useRole Hook Returns Null

**Symptom**:
```javascript
const role = useRole();
console.log(role.isSuperAdmin);  // Always false
console.log(role.tier);  // Always -1
```

**Possible Causes**:
1. AuthContext not initialized
2. User not logged in
3. useRole hook not using AuthContext correctly

**Solution**:

```javascript
// 1. Check AuthContext is providing user
import { AuthContext } from '../context/AuthContext';

const App = () => {
  return (
    <AuthProvider>  {/* ✅ Make sure provider wraps app */}
      <Routes>
        ...
      </Routes>
    </AuthProvider>
  );
};

// 2. Check useRole hook accesses correct context
export const useRole = () => {
  const { user } = useContext(AuthContext);  // ✅ Use useContext
  
  if (!user) {
    return { role: null, tier: -1, ... };
  }
  
  return { ... };
};

// 3. Verify user object has admin_tier
console.log(localStorage.getItem('user_data'));
// Should have: {"admin_tier": 1, "role": "ADMIN", ...}
```

---

### Issue 7: ProtectedRoute Always Redirects

**Symptom**:
```
Navigate to /admin/super/dashboard as super admin
Redirects to /login or /unauthorized instead of rendering
```

**Possible Causes**:
1. isAuthenticated is false
2. User object is null or incomplete
3. JWT not being decoded correctly
4. Token expired

**Solution**:

```javascript
// 1. Check authentication state
const { isAuthenticated, user, loading } = useContext(AuthContext);
console.log('Authenticated:', isAuthenticated);
console.log('User:', user);
console.log('Loading:', loading);

// 2. Verify token in localStorage
const token = localStorage.getItem('access_token');
console.log('Token exists:', !!token);

// 3. Check token hasn't expired
import jwtDecode from 'jwt-decode';
const decoded = jwtDecode(token);
console.log('Exp:', decoded.exp);
console.log('Now:', Math.floor(Date.now() / 1000));
console.log('Expired:', decoded.exp < Math.floor(Date.now() / 1000));

// 4. Add loading check to ProtectedRoute
if (loading) {
  return <div>Loading...</div>;  // Wait for auth check
}

// 5. Debug ProtectedRoute logic
<ProtectedRoute
  Component={Dashboard}
  requiredRole="ADMIN"
  minTier={3}
/>

// In ProtectedRoute:
console.log('Checking auth:', { isAuthenticated, user, requiredRole, minTier });
if (!isAuthenticated) console.log('Not authenticated');
if (user?.role !== 'ADMIN') console.log('Wrong role');
if ((user?.admin_tier || 0) < 3) console.log('Insufficient tier');
```

---

### Issue 8: Token Refresh Not Working

**Symptom**:
```
After 15 minutes, API returns 401
Token refresh fails
User is logged out
```

**Possible Causes**:
1. Refresh token not stored
2. Refresh endpoint not called properly
3. New token not saved to localStorage

**Solution**:

```javascript
// 1. Verify refresh token in localStorage
console.log(localStorage.getItem('refresh_token'));
// Should contain refresh token

// 2. Verify refresh endpoint exists
curl -X POST http://localhost:8000/api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'

# Expected: {"access": "<new_token>"}

// 3. Implement interceptor to auto-refresh
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const { response, config } = error;
    
    if (response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      
      try {
        const { data } = await axios.post(
          'http://localhost:8000/api/users/token/refresh/',
          { refresh: refreshToken }
        );
        
        localStorage.setItem('access_token', data.access);
        config.headers.Authorization = `Bearer ${data.access}`;
        
        return axiosInstance(config);  // Retry original request
      } catch {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

### Issue 9: Admin Buttons Not Showing

**Symptom**:
```javascript
// User is ward admin, but buttons don't show
{role.canAssignComplaints && <button>Assign</button>}
// Button not visible
```

**Possible Causes**:
1. admin_tier not in user object
2. useRole hook not calculating permissions correctly
3. User logged out and logged back in without reload

**Solution**:

```javascript
// 1. Check user object structure
console.log('User:', user);
// Should include: role, admin_tier, ward, department, is_superuser

// 2. Verify canAssignComplaints logic
const { canAssignComplaints } = useRole();
console.log('Can assign:', canAssignComplaints);
// Should be true if user.role === 'ADMIN'

// 3. Add debugging to useRole hook
export const useRole = () => {
  const { user } = useContext(AuthContext);
  
  console.log('useRole called, user:', user);
  
  const canAssignComplaints = user?.role === 'ADMIN';
  console.log('canAssignComplaints:', canAssignComplaints);
  
  return { canAssignComplaints, ... };
};

// 4. Manual override for testing
{true && <button>Assign</button>}  // Test if button renders
// If yes, issue is in permission logic
```

---

## Common Configuration Issues

### Issue 10: CORS Errors

**Symptom**:
```
Access to XMLHttpRequest at 'http://localhost:8000/api/complaints/' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**:

```python
# In backend/core/settings.py

from corsheaders.defaults import default_headers

INSTALLED_APPS = [
    'corsheaders',  # Add this
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at top
    'django.middleware.common.CommonMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Frontend dev server
    'http://localhost:5173',  # Vite dev server
    'https://yourdomain.com',  # Production
]

# Install if not present
pip install django-cors-headers
```

---

### Issue 11: Session Timeout Not Working

**Symptom**:
```
User doesn't get logged out after 30 minutes
```

**Solution**:

```javascript
// In frontend/src/context/AuthContext.jsx

const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000;  // 5 min warning

useEffect(() => {
  if (!isAuthenticated) return;
  
  let timeoutId;
  
  const resetTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      dispatch({ type: 'LOGOUT' });
    }, SESSION_TIMEOUT);
  };
  
  // Reset timer on user activity
  window.addEventListener('click', resetTimer);
  window.addEventListener('keypress', resetTimer);
  window.addEventListener('mousemove', resetTimer);
  
  resetTimer();  // Start timer
  
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('click', resetTimer);
    window.removeEventListener('keypress', resetTimer);
    window.removeEventListener('mousemove', resetTimer);
  };
}, [isAuthenticated]);
```

---

## Testing & Validation

### Quick Test Checklist

```bash
# 1. Test citizen login
curl -X POST http://localhost:8000/api/users/login/ \
  -d '{"email":"citizen@test.com","password":"pass"}'
# Should return token with role="CITIZEN", admin_tier=0

# 2. Test admin login
curl -X POST http://localhost:8000/api/users/login/ \
  -d '{"email":"admin@test.com","password":"pass"}'
# Should return token with role="ADMIN", admin_tier=1-3

# 3. Test protected endpoint as citizen
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/
# Should return only citizen's complaints

# 4. Test protected endpoint as admin
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/
# Should return admin's scope complaints

# 5. Test assignment endpoint as citizen
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/1/assign_complaint/ \
  -d '{"officer_id":5}'
# Should return 403 Forbidden

# 6. Test frontend role hook
# In browser console:
localStorage.getItem('user_data')
# Should show complete user object with admin_tier
```

---

## FAQ

**Q: Can I change a user's tier without recreating them?**

A: Yes, modify the role/is_superuser/ward/department fields:
```python
user = User.objects.get(email='user@example.com')
user.role = 'ADMIN'
user.is_superuser = True  # Makes them super admin
user.save()
```

---

**Q: How do I debug which permission is failing?**

A: Add print statements in permission class:
```python
class CanAssignComplaint(BasePermission):
    def has_permission(self, request, view):
        print(f"User: {request.user.email}, Role: {request.user.role}")
        result = request.user.role == 'ADMIN'
        print(f"Result: {result}")
        return result
```

---

**Q: Token expires too often. Can I extend it?**

A: Change in settings.py:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),  # Longer
}
```

---

**Q: How do I test as different users?**

A: Create test users, get tokens, use them:
```bash
export CITIZEN_TOKEN=$(curl -s -X POST ... | jq -r '.access')
export ADMIN_TOKEN=$(curl -s -X POST ... | jq -r '.access')

curl -H "Authorization: Bearer $CITIZEN_TOKEN" ...
curl -H "Authorization: Bearer $ADMIN_TOKEN" ...
```

---

**Your RBAC implementation should now be working perfectly! 🎉**
