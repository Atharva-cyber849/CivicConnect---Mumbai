# Complete RBAC Testing Guide

**Purpose**: Comprehensive test cases to validate role-based access control implementation

---

## 1. Test Credentials Setup

### Create Test Users

```bash
# Backend - Create test users via manage.py shell
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.departments.models import Department
from apps.ward.models import Ward

User = get_user_model()

# Create wards
ward_a, _ = Ward.objects.get_or_create(code='A', defaults={'name': 'Ward A'})
ward_b, _ = Ward.objects.get_or_create(code='B', defaults={'name': 'Ward B'})

# Create departments
dept1, _ = Department.objects.get_or_create(name='Police')
dept2, _ = Department.objects.get_or_create(name='Health')

# 1. CITIZEN USER
citizen = User.objects.create_user(
    email='citizen@example.com',
    password='Citizen@123',
    role='CITIZEN',
    phone='9876543210',
    is_active=True
)
print(f"Created: {citizen.email}")

# 2. WARD ADMIN (Ward A)
ward_admin_a = User.objects.create_user(
    email='ward.admin.a@example.com',
    password='WardAdmin@123',
    role='ADMIN',
    is_superuser=False,
    is_staff=True,
    phone='9876543211',
    ward=ward_a,
    is_active=True
)
print(f"Created: {ward_admin_a.email}")

# 3. WARD ADMIN (Ward B)
ward_admin_b = User.objects.create_user(
    email='ward.admin.b@example.com',
    password='WardAdmin@123',
    role='ADMIN',
    is_superuser=False,
    is_staff=True,
    phone='9876543212',
    ward=ward_b,
    is_active=True
)
print(f"Created: {ward_admin_b.email}")

# 4. DEPARTMENT ADMIN (Police)
dept_admin = User.objects.create_user(
    email='dept.admin@example.com',
    password='DeptAdmin@123',
    role='ADMIN',
    is_superuser=False,
    is_staff=True,
    phone='9876543213',
    department=dept1,
    is_active=True
)
print(f"Created: {dept_admin.email}")

# 5. SUPER ADMIN
super_admin = User.objects.create_user(
    email='super.admin@example.com',
    password='SuperAdmin@123',
    role='ADMIN',
    is_superuser=True,
    is_staff=True,
    phone='9876543214',
    is_active=True
)
print(f"Created: {super_admin.email}")

print("\n✅ All test users created!")
```

---

## 2. Backend Authentication Tests

### Test 1: Login and Token Generation

```bash
# Login as Citizen
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "Citizen@123"
  }'

# Expected Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "citizen@example.com",
    "role": "CITIZEN",
    "admin_tier": 0,
    "is_superuser": false,
    "ward": null,
    "department": null
  }
}
```

Store tokens in variables:
```bash
export CITIZEN_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
export WARD_ADMIN_A_TOKEN="..."
export WARD_ADMIN_B_TOKEN="..."
export DEPT_ADMIN_TOKEN="..."
export SUPER_ADMIN_TOKEN="..."
```

### Test 2: Token Claims Verification

```bash
# Decode JWT token to verify claims
# Use jwt.io or command line

import jwt
token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
payload = jwt.decode(token, options={"verify_signature": False})
print(payload)

# Expected for Ward Admin:
{
  "token_type": "access",
  "exp": 1234567890,
  "iat": 1234567890,
  "jti": "xxx",
  "user_id": 2,
  "email": "ward.admin.a@example.com",
  "role": "ADMIN",
  "admin_tier": 1,
  "is_superuser": false,
  "ward_id": 1,
  "ward_name": "Ward A",
  "department_id": null
}
```

---

## 3. Authorization Tests - View Access

### Test 3: Citizen Can Only Access Own Complaints

```bash
# Citizen lists complaints - should see only their own
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/

# Expected: Only complaints where filed_by=citizen
[
  {
    "id": 1,
    "title": "Pothole on Main Street",
    "filed_by": 1,
    "status": "PENDING"
  }
]

# Citizen tries to see complaint filed by another citizen
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/2/

# Expected: 404 Not Found (hidden from queryset)
```

### Test 4: Ward Admin Can Only Access Their Ward

```bash
# Ward Admin A lists complaints - should see only Ward A
curl -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/

# Expected: Only complaints in Ward A
# Should NOT include Ward B complaints

# Verify by filtering
curl "http://localhost:8000/api/complaints/?ward=A" \
  -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN"

# Expected: 200 OK with Ward A complaints
```

### Test 5: Department Admin Sees Department Complaints

```bash
# Department Admin lists complaints
curl -H "Authorization: Bearer $DEPT_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/

# Expected: Only complaints in their department
# (Both wards if department covers multiple wards)
```

### Test 6: Super Admin Sees All Complaints

```bash
# Super Admin lists all complaints
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/

# Expected: ALL complaints from all wards/departments
```

---

## 4. Authorization Tests - Actions

### Test 7: Only Citizens Can File Complaints

```bash
# Citizen files complaint - should work
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Broken Street Light",
    "description": "Light is broken on Main St",
    "category": "INFRASTRUCTURE",
    "location": "Main Street",
    "latitude": 19.0760,
    "longitude": 72.8777
  }'

# Expected: 201 Created

# Ward Admin tries to file complaint - should fail
curl -X POST -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Issue",
    "description": "Test",
    ...
  }'

# Expected: 403 Forbidden
# Message: "Only citizens can access this endpoint"
```

### Test 8: Only Admins Can Assign Complaints

```bash
# Citizen tries to assign - should fail
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/1/assign_complaint/ \
  -H "Content-Type: application/json" \
  -d '{"officer_id": 5}'

# Expected: 403 Forbidden

# Ward Admin assigns to officer in their ward - should work
curl -X POST -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/1/assign_complaint/ \
  -H "Content-Type: application/json" \
  -d '{"officer_id": 3}'

# Expected: 200 OK

# Ward Admin A tries to assign complaint in Ward B - should fail
# (because complaint is in Ward B, not their scope)
curl -X POST -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/2/assign_complaint/ \
  -H "Content-Type: application/json" \
  -d '{"officer_id": 4}'

# Expected: 403 Forbidden
```

### Test 9: Only Dept Admin Can Close Complaints

```bash
# Citizen tries to close - should fail
curl -X POST -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/1/close_complaint/

# Expected: 403 Forbidden

# Ward Admin tries to close - should fail
curl -X POST -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/1/close_complaint/

# Expected: 403 Forbidden

# Department Admin closes - should work
curl -X POST -H "Authorization: Bearer $DEPT_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/1/close_complaint/

# Expected: 200 OK
```

### Test 10: Only Super Admin Can Create Users

```bash
# Department Admin tries to create user - should fail
curl -X POST -H "Authorization: Bearer $DEPT_ADMIN_TOKEN" \
  http://localhost:8000/api/users/admin-register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.admin@example.com",
    "password": "NewAdmin@123",
    "role": "ADMIN"
  }'

# Expected: 403 Forbidden

# Super Admin creates user - should work
curl -X POST -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:8000/api/users/admin-register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.admin@example.com",
    "password": "NewAdmin@123",
    "role": "ADMIN"
  }'

# Expected: 201 Created
```

---

## 5. Authorization Tests - Modification

### Test 11: Citizens Can Only Modify Own Complaints

```bash
# Citizen modifies own complaint - should work
curl -X PATCH -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/1/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Expected: 200 OK

# Citizen tries to modify another citizen's complaint - should fail
curl -X PATCH -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/2/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked"}'

# Expected: 403 Forbidden
```

### Test 12: Ward Admin Can Only Modify Ward Complaints

```bash
# Ward Admin A modifies complaint in Ward A - should work
curl -X PATCH -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/1/ \
  -H "Content-Type: application/json" \
  -d '{"assigned_to": 3}'

# Expected: 200 OK

# Ward Admin A tries to modify complaint in Ward B - should fail
curl -X PATCH -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/10/ \
  -H "Content-Type: application/json" \
  -d '{"assigned_to": 4}'

# Expected: 403 Forbidden
```

---

## 6. Analytics Access Tests

### Test 13: Only Admins Can View Analytics

```bash
# Citizen tries to view analytics - should fail
curl -H "Authorization: Bearer $CITIZEN_TOKEN" \
  http://localhost:8000/api/complaints/analytics/

# Expected: 403 Forbidden or empty response

# Ward Admin views ward analytics - should work
curl -H "Authorization: Bearer $WARD_ADMIN_A_TOKEN" \
  http://localhost:8000/api/complaints/analytics/

# Expected: 200 OK with Ward A analytics

# Super Admin views city analytics - should work
curl -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  http://localhost:8000/api/complaints/analytics/

# Expected: 200 OK with city-wide analytics
```

---

## 7. Frontend Tests

### Test 14: Protected Routes Redirect

```javascript
// Test in browser console after logging in as citizen
localStorage.setItem('userRole', 'CITIZEN');

// Try accessing admin dashboard
navigate('/admin/super/dashboard');

// Expected: Redirect to /citizen/dashboard or /unauthorized

// Try accessing ward admin dashboard
navigate('/admin/ward/dashboard');

// Expected: Redirect to /citizen/dashboard
```

### Test 15: Conditional Rendering

```javascript
// In component, use useRole hook
const { isSuperAdmin, isWardAdmin, canViewAnalytics } = useRole();

// These should be false for citizen
console.log(isSuperAdmin); // false
console.log(isWardAdmin); // false
console.log(canViewAnalytics); // false

// For ward admin, should be true
console.log(isWardAdmin); // true
console.log(canViewAnalytics); // true
console.log(isSuperAdmin); // false
```

---

## 8. Token Expiration & Refresh Tests

### Test 16: Expired Token Returns 401

```bash
# Wait for access token to expire (15 minutes)
# Try to access protected endpoint with expired token

curl -H "Authorization: Bearer $EXPIRED_TOKEN" \
  http://localhost:8000/api/complaints/

# Expected: 401 Unauthorized
# Message: "Token is invalid or expired"
```

### Test 17: Refresh Token Works

```bash
# Use refresh token to get new access token
curl -X POST http://localhost:8000/api/users/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "'$REFRESH_TOKEN'"}'

# Expected: 200 OK
# Response contains new access token

# Use new token to access protected endpoint
curl -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  http://localhost:8000/api/complaints/

# Expected: 200 OK
```

---

## 9. Automated Test Suite

### Create Test File: `backend/apps/complaints/tests.py`

```python
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.ward.models import Ward
from apps.departments.models import Department
from .models import Complaint

User = get_user_model()


class ComplaintPermissionTests(TestCase):
    """Test RBAC for complaints API"""
    
    def setUp(self):
        """Create test users and complaints"""
        self.client = APIClient()
        
        # Create wards
        self.ward_a = Ward.objects.create(code='A', name='Ward A')
        self.ward_b = Ward.objects.create(code='B', name='Ward B')
        
        # Create department
        self.dept = Department.objects.create(name='Police')
        
        # Create users
        self.citizen = User.objects.create_user(
            email='citizen@test.com', password='pass123',
            role='CITIZEN', is_active=True
        )
        
        self.ward_admin_a = User.objects.create_user(
            email='ward.admin.a@test.com', password='pass123',
            role='ADMIN', is_superuser=False, is_staff=True,
            ward=self.ward_a, is_active=True
        )
        
        self.super_admin = User.objects.create_user(
            email='super@test.com', password='pass123',
            role='ADMIN', is_superuser=True, is_staff=True,
            is_active=True
        )
        
        # Create complaints
        self.complaint_ward_a = Complaint.objects.create(
            title='Issue in Ward A',
            filed_by=self.citizen,
            ward=self.ward_a,
            status='PENDING'
        )
        
        self.complaint_ward_b = Complaint.objects.create(
            title='Issue in Ward B',
            filed_by=self.citizen,
            ward=self.ward_b,
            status='PENDING'
        )
    
    def test_citizen_can_file_complaint(self):
        """Citizen can create complaints"""
        self.client.force_authenticate(user=self.citizen)
        
        response = self.client.post('/api/complaints/', {
            'title': 'New complaint',
            'filed_by': self.citizen.id,
            'ward': self.ward_a.id,
        })
        
        self.assertEqual(response.status_code, 201)
    
    def test_citizen_cannot_assign_complaint(self):
        """Citizen cannot assign complaints"""
        self.client.force_authenticate(user=self.citizen)
        
        response = self.client.post(
            f'/api/complaints/{self.complaint_ward_a.id}/assign_complaint/',
            {'officer_id': 5}
        )
        
        self.assertEqual(response.status_code, 403)
    
    def test_ward_admin_sees_only_own_ward(self):
        """Ward admin only sees complaints in their ward"""
        self.client.force_authenticate(user=self.ward_admin_a)
        
        response = self.client.get('/api/complaints/')
        
        self.assertEqual(response.status_code, 200)
        # Only Ward A complaint in response
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.complaint_ward_a.id)
    
    def test_super_admin_sees_all_complaints(self):
        """Super admin sees all complaints"""
        self.client.force_authenticate(user=self.super_admin)
        
        response = self.client.get('/api/complaints/')
        
        self.assertEqual(response.status_code, 200)
        # Both complaints in response
        self.assertGreaterEqual(len(response.data), 2)
    
    def test_ward_admin_cannot_modify_other_ward(self):
        """Ward admin cannot modify complaints outside their ward"""
        self.client.force_authenticate(user=self.ward_admin_a)
        
        response = self.client.patch(
            f'/api/complaints/{self.complaint_ward_b.id}/',
            {'title': 'Modified'}
        )
        
        self.assertEqual(response.status_code, 403)


# Run tests
# python manage.py test apps.complaints.tests.ComplaintPermissionTests
```

Run tests:
```bash
python manage.py test apps.complaints.tests.ComplaintPermissionTests -v 2
```

---

## 10. Test Checklist

| Test | Expected | Status |
|------|----------|--------|
| Citizen login | 200 OK, token received | ☐ |
| Citizen files complaint | 201 Created | ☐ |
| Citizen assigns complaint | 403 Forbidden | ☐ |
| Citizen views own complaints | 200 OK, filtered | ☐ |
| Citizen accesses admin route | 403 Redirect | ☐ |
| Ward Admin A views Ward A | 200 OK | ☐ |
| Ward Admin A views Ward B | 403 or empty | ☐ |
| Ward Admin modifies own ward | 200 OK | ☐ |
| Ward Admin modifies other ward | 403 Forbidden | ☐ |
| Dept Admin closes complaint | 200 OK | ☐ |
| Ward Admin closes complaint | 403 Forbidden | ☐ |
| Super Admin sees all | 200 OK, all data | ☐ |
| Super Admin creates user | 201 Created | ☐ |
| Token refresh works | 200 OK, new token | ☐ |
| Expired token rejected | 401 Unauthorized | ☐ |

---

**RBAC testing is complete and comprehensive! ✅**
