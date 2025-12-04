# Frontend-Backend Integration Guide

Complete guide to integrating the React frontend with Django REST backend.

---

## Request-Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT (React Frontend)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Action (e.g., Login, Submit Form)                         │
│         ↓                                                         │
│  Event Handler (onClick, onSubmit, etc.)                        │
│         ↓                                                         │
│  API Call via axios (axiosPublic or axiosPrivate)               │
│         ↓                                                         │
│  Request Interceptor: Add JWT token to headers                  │
│         ↓                                                         │
│  Network Request (HTTP method + endpoint + payload)             │
│         ↓                                                         │
└─────────────────────────────────────────────────────────────────┘
                         HTTP
          ┌──────────────────────────────┐
          ↓                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ SERVER (Django REST Framework Backend)                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CORS Middleware: Check allowed origins                          │
│         ↓                                                          │
│  Authentication Middleware: Verify JWT token (if needed)         │
│         ↓                                                          │
│  URL Router: Route to appropriate ViewSet                        │
│         ↓                                                          │
│  ViewSet.get_permissions(): Load permission classes             │
│         ↓                                                          │
│  Permission Classes: Check user role/tier                       │
│    - IsSuperAdmin, IsDepartmentAdmin, HasDepartmentAccess       │
│         ↓                                                          │
│  ViewSet.get_queryset(): Filter data based on user role         │
│    - Super Admin: All data                                       │
│    - Dept Admin: Department data only                            │
│    - Officer: Ward data only                                    │
│    - Citizen: Own data only                                     │
│         ↓                                                          │
│  Serializer: Validate & transform data                          │
│         ↓                                                          │
│  Database Query: Execute filtered query                         │
│         ↓                                                          │
│  Response: Convert model instances to JSON                      │
│         ↓                                                          │
│  Status Code & Headers                                          │
│         ↓                                                          │
└──────────────────────────────────────────────────────────────────┘
                         HTTP
          ┌──────────────────────────────┐
          ↓                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ CLIENT (React Frontend)                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Response Interceptor: Check status code                         │
│    - 2xx: Success                                                │
│    - 401: Token expired → Refresh & retry                        │
│    - 403: Access denied → Redirect to unauthorized              │
│    - 5xx: Server error → Show error message                     │
│         ↓                                                          │
│  State Update: Update context/store with response data          │
│         ↓                                                          │
│  Re-render: React component updates UI                          │
│         ↓                                                          │
│  Display: Show result to user (data, error, loading, etc.)      │
│         ↓                                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### 1. Login Flow

```
FRONTEND                           BACKEND
  │                                  │
  ├─ User enters email/password       │
  │                                  │
  ├─ POST /api/users/login/  ──────> │
  │   {                               │
  │     "email": "user@...",          │
  │     "password": "..."             │
  │   }                               │
  │                                  │
  │                   <────── 200 OK │
  │                   {               │
  │                     "access": "jwt_token...",
  │                     "refresh": "jwt_refresh...",
  │                     "user": {     │
  │                       "id": 1,    │
  │                       "email": "...",
  │                       "role": "CITIZEN",
  │                       "admin_tier": "citizen"
  │                     }             │
  │                   }               │
  │                                  │
  ├─ Store tokens in localStorage    │
  ├─ Store user data in localStorage │
  ├─ Update AuthContext              │
  ├─ Redirect to dashboard           │
  │                                  │
```

### 2. Token Refresh Flow

```
FRONTEND                           BACKEND
  │                                  │
  ├─ Access token expired            │
  ├─ API returns 401 Unauthorized    │
  │                                  │
  ├─ Interceptor catches 401         │
  │                                  │
  ├─ POST /api/users/token/refresh/  │
  │   {                               │
  │     "refresh": "refresh_token"    │
  │   }                               │
  │                                  │
  │                   <────── 200 OK │
  │                   {               │
  │                     "access": "new_jwt_token..."
  │                   }               │
  │                                  │
  ├─ Store new access token          │
  ├─ Retry original request          │
  │                                  │
```

### 3. Logout Flow

```
FRONTEND                           BACKEND
  │                                  │
  ├─ User clicks logout              │
  │                                  │
  ├─ Clear localStorage              │
  │   - auth_token                   │
  │   - refresh_token                │
  │   - user_data                    │
  │                                  │
  ├─ Update AuthContext              │
  │                                  │
  ├─ Redirect to /auth/login         │
  │                                  │
```

---

## Data Flow Examples

### Example 1: Citizen Submitting a Complaint

```
FRONTEND (ReportIssue.jsx)         BACKEND

1. User fills form:
   - title: "Pothole on SV Road"
   - description: "Large pothole..."
   - category: "POTHOLE"
   - latitude: 19.0596
   - longitude: 72.8295
   - image: <file>

2. Create FormData object
   - Attach all fields
   - Attach image file

3. Call API:
   POST /api/complaints/
   Headers: {
     "Authorization": "Bearer {access_token}",
     "Content-Type": "multipart/form-data"
   }
   Body: FormData
                                  ↓
                    4. Receive request
                    5. Verify JWT token
                    6. Extract user from token
                    7. Validate serializer
                    8. Check permissions
                       - User must be authenticated
                    9. Create Complaint model:
                       - user = logged-in user
                       - status = PENDING
                       - department = get from category
                       - assigned_to = null (auto-assign later)
                    10. Save image to storage
                    11. Trigger signal:
                        - Send notification to department
                    12. Start Celery task:
                        - Auto-assign to officer (if available)
                    13. Return response:
                        {
                          "id": 42,
                          "title": "Pothole on SV Road",
                          "status": "PENDING",
                          ...
                        }
                                  ↓
4. Response interceptor: 201 Created
5. Update state with complaint
6. Show success notification
7. Redirect to /dashboard/complaints
```

### Example 2: Department Admin Viewing Complaints

```
FRONTEND (ComplaintsList.jsx)      BACKEND

1. Component mounts
2. Call API:
   GET /api/complaints/?status=PENDING&page=1
   Headers: {
     "Authorization": "Bearer {access_token}"
   }
                                  ↓
                    3. Receive request
                    4. Verify JWT token
                    5. Extract user from token
                    6. Load ViewSet:
                       - ComplaintViewSet
                    7. Check permission:
                       - IsDepartmentAdmin
                       - User.role == ADMIN
                       - User.is_superuser == False
                    8. Apply filtering in get_queryset():
                       queryset = Complaint.objects.filter(
                         department=user.officer_profile.department
                       )
                    9. Apply status filter:
                       queryset = queryset.filter(status='PENDING')
                    10. Apply pagination:
                        - 20 results per page
                    11. Serialize queryset:
                        ComplaintSerializer.many=True
                    12. Return response:
                        {
                          "count": 5,
                          "next": "...",
                          "previous": null,
                          "results": [
                            {
                              "id": 1,
                              "title": "...",
                              "status": "PENDING",
                              ...
                            },
                            ...
                          ]
                        }
                                  ↓
3. Response interceptor: 200 OK
4. Parse response data
5. Update complaints state
6. Re-render table with data
7. Show pagination controls
```

### Example 3: Officer Updating Complaint Status

```
FRONTEND (ComplaintDetail.jsx)     BACKEND

1. Officer selects "Mark as Resolved"
2. Open dialog for notes
3. User enters: "Work completed successfully"
4. Call API:
   PATCH /api/complaints/42/status/
   Headers: {
     "Authorization": "Bearer {access_token}",
     "Content-Type": "application/json"
   }
   Body: {
     "status": "RESOLVED",
     "update_message": "Work completed successfully"
   }
                                  ↓
                    5. Receive request
                    6. Verify JWT token
                    7. Extract user from token
                    8. Get Complaint object (id=42)
                    9. Check permission:
                       - Complaint.assigned_to == user
                       OR user.is_superuser
                    10. Validate status transition:
                        - IN_PROGRESS → RESOLVED (valid)
                    11. Update complaint:
                        - status = RESOLVED
                        - resolved_at = now()
                        - public_update = message
                    12. Create ComplaintUpdate record:
                        - user = officer
                        - message = "Work completed..."
                        - previous_status = IN_PROGRESS
                        - new_status = RESOLVED
                    13. Create ComplaintTimeline record
                    14. Trigger signal:
                        - Send notification to citizen
                        - Send notification to admin
                    15. Update analytics cache
                    16. Return updated complaint:
                        {
                          "id": 42,
                          "status": "RESOLVED",
                          "resolved_at": "2025-12-04T...",
                          ...
                        }
                                  ↓
3. Response interceptor: 200 OK
4. Update complaint state
5. Update UI:
   - Show success message
   - Update status badge to "Resolved"
   - Disable further edits
6. Optionally redirect to next complaint
```

---

## API Contract Examples

### Login Endpoint

**Request**
```http
POST /api/users/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzAyNzE3MjAwLCJpYXQiOjE3MDI3MTYzMDAsImp0aSI6ImFiYzEyMyIsInVzZXJfaWQiOjUsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJDSVRJWkVOIiwiaXNfc3VwZXJ1c2VyIjpmYWxzZSwiYWRtaW5fdGllciI6ImNpdGl6ZW4ifQ.xyz",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcwMzMyMDMwMCwiaWF0IjoxNzAyNzE2MzAwLCJqdGkiOiJ4eXoxMjMiLCJ1c2VyX2lkIjo1fQ.abc",
  "user": {
    "id": 5,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CITIZEN",
    "admin_tier": "citizen",
    "ward": "Bandra",
    "phone": "9876543210"
  }
}
```

**Error Response (400 Bad Request)**
```json
{
  "detail": "Invalid credentials"
}
```

---

### Create Complaint Endpoint

**Request**
```http
POST /api/complaints/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

title=Pothole+on+SV+Road
description=Large+pothole+near+station
category=POTHOLE
ward=Bandra
address=SV+Road%2C+Bandra
latitude=19.0596
longitude=72.8295
image={binary_file}
```

**Response (201 Created)**
```json
{
  "id": 42,
  "title": "Pothole on SV Road",
  "description": "Large pothole near station",
  "category": "POTHOLE",
  "status": "PENDING",
  "priority": "MEDIUM",
  "user": 5,
  "user_name": "John Doe",
  "department": 1,
  "department_name": "Roads & Infrastructure",
  "assigned_to": null,
  "assigned_to_name": null,
  "ward": "Bandra",
  "address": "SV Road, Bandra",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "image": "http://localhost:8000/media/complaints/...",
  "public_update": "",
  "admin_notes": "",
  "created_at": "2025-12-04T10:30:00Z",
  "updated_at": "2025-12-04T10:30:00Z",
  "resolved_at": null
}
```

---

### List Complaints with Filtering

**Request**
```http
GET /api/complaints/?status=IN_PROGRESS&category=POTHOLE&ward=Bandra&page=1&search=road
Authorization: Bearer {access_token}
```

**Response (200 OK)**
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/complaints/?page=2&status=IN_PROGRESS",
  "previous": null,
  "results": [
    {
      "id": 42,
      "title": "Pothole on SV Road",
      "category": "POTHOLE",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "user_name": "John Doe",
      "assigned_to_name": "Vikram Singh",
      "ward": "Bandra",
      "created_at": "2025-12-04T10:30:00Z",
      "latitude": 19.0596,
      "longitude": 72.8295,
      "image": "http://localhost:8000/media/complaints/..."
    }
  ]
}
```

---

## State Management Integration

### Frontend State Flow

```
┌──────────────────────────────────────────────────────┐
│ AuthContext                                          │
├──────────────────────────────────────────────────────┤
│ State:                                               │
│ - user: { id, email, role, admin_tier, ... }       │
│ - token: JWT access token                           │
│ - refreshToken: JWT refresh token                   │
│ - isAuthenticated: boolean                          │
│ - loading: boolean                                  │
│ - error: string | null                              │
│                                                      │
│ Actions:                                            │
│ - login(email, password)                            │
│ - logout()                                          │
│ - updateProfile(userData)                           │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│ UI Components                                        │
├──────────────────────────────────────────────────────┤
│ All components access:                               │
│ - const { user, isAuthenticated } = useAuth()       │
│                                                      │
│ Use to:                                             │
│ - Show/hide UI based on role                        │
│ - Pass token to API requests                        │
│ - Handle permission checks                          │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│ API Layer (axiosPrivate)                            │
├──────────────────────────────────────────────────────┤
│ Interceptor adds:                                    │
│ - Authorization: Bearer {token}                      │
│                                                      │
│ On 401 response:                                    │
│ - Calls refresh endpoint                            │
│ - Stores new token                                  │
│ - Retries original request                          │
└──────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────┐
│ Backend (Django REST)                                │
├──────────────────────────────────────────────────────┤
│ Extracts token & verifies:                          │
│ - Check signature                                    │
│ - Check expiration                                  │
│ - Extract user info                                 │
│                                                      │
│ Uses user info to:                                  │
│ - Filter queryset in get_queryset()                │
│ - Check permissions                                │
│ - Log audit trail                                  │
└──────────────────────────────────────────────────────┘
```

---

## Error Handling

### Frontend Error Handling

```jsx
// Example: API call with error handling
const handleSubmit = async (formData) => {
  try {
    setLoading(true);
    
    // Call API
    const response = await complaintsApi.createComplaint(formData);
    
    // Success
    showNotification('Complaint created successfully!', 'success');
    navigate('/dashboard/complaints');
    
  } catch (error) {
    // Categorize error
    if (error.response?.status === 400) {
      // Validation error
      showNotification(
        Object.values(error.response.data).flat().join(', '),
        'error'
      );
    } else if (error.response?.status === 401) {
      // Unauthorized (shouldn't happen with refresh interceptor)
      logout();
      navigate('/auth/login');
    } else if (error.response?.status === 403) {
      // Forbidden
      showNotification('You do not have permission to do this', 'error');
      navigate('/unauthorized');
    } else if (error.response?.status === 500) {
      // Server error
      showNotification('Server error. Please try again later.', 'error');
    } else {
      // Network error
      showNotification(error.message || 'Something went wrong', 'error');
    }
  } finally {
    setLoading(false);
  }
};
```

### Backend Error Responses

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET/PATCH/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Testing Integration

### Backend API Test Example

```python
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class ComplaintIntegrationTestCase(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='test123',
            role='CITIZEN'
        )
        
        # Create test department
        self.department = Department.objects.create(
            name='Roads',
            email='roads@bmc.gov.in'
        )
    
    def test_citizen_can_create_complaint(self):
        # Login
        response = self.client.post(
            '/api/users/login/',
            {'email': 'test@example.com', 'password': 'test123'}
        )
        token = response.data['access']
        
        # Create complaint
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        response = self.client.post(
            '/api/complaints/',
            {
                'title': 'Test complaint',
                'description': 'Test description',
                'category': 'POTHOLE',
                'ward': 'Bandra',
                'latitude': 19.0596,
                'longitude': 72.8295,
                'address': 'Test address'
            },
            **headers
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'PENDING')
    
    def test_citizen_cannot_see_other_complaints(self):
        # Create other user's complaint
        other_user = User.objects.create_user(
            email='other@example.com',
            password='test123',
            role='CITIZEN'
        )
        complaint = Complaint.objects.create(
            title='Other complaint',
            description='Test',
            category='POTHOLE',
            user=other_user,
            ward='Bandra',
            latitude=19.0596,
            longitude=72.8295,
            address='Test'
        )
        
        # Login as first user
        response = self.client.post(
            '/api/users/login/',
            {'email': 'test@example.com', 'password': 'test123'}
        )
        token = response.data['access']
        
        # Try to access other's complaint
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        response = self.client.get(
            f'/api/complaints/{complaint.id}/',
            **headers
        )
        
        self.assertEqual(response.status_code, 403)
```

### Frontend Integration Test Example

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportIssue } from '../../pages/citizen/ReportIssue';
import * as complaintsApi from '../../api/complaintsApi';

jest.mock('../../api/complaintsApi');

describe('ReportIssue Integration', () => {
  it('should submit complaint form and redirect to dashboard', async () => {
    // Mock API response
    complaintsApi.createComplaint.mockResolvedValue({
      data: {
        id: 42,
        title: 'Test complaint',
        status: 'PENDING'
      }
    });
    
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
    
    // Render component
    render(<ReportIssue />);
    
    // Fill form
    const titleInput = screen.getByPlaceholderText('Brief title');
    const descriptionInput = screen.getByPlaceholderText('Detailed description');
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    await userEvent.type(titleInput, 'Test complaint');
    await userEvent.type(descriptionInput, 'Test description');
    
    // Submit
    fireEvent.click(submitButton);
    
    // Wait for API call and redirect
    await waitFor(() => {
      expect(complaintsApi.createComplaint).toHaveBeenCalled();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/complaints');
  });
});
```

---

## Deployment Synchronization

When deploying, ensure both frontend and backend are synchronized:

### Backend Changes
1. Update models → Create migration
2. Update serializers
3. Update ViewSets/views
4. Update permissions
5. Update URLs
6. Run migrations on production
7. Restart backend server

### Frontend Changes
1. Update API calls (if endpoints changed)
2. Update component logic
3. Update error handling
4. Update tests
5. Rebuild and deploy frontend

### Checklist
- [ ] API URLs match in frontend config
- [ ] API responses match frontend expectations
- [ ] Token format matches (JWT)
- [ ] CORS is configured
- [ ] Error responses are handled
- [ ] Pagination works on both sides
- [ ] Filtering parameters align
- [ ] Serializers match frontend usage
- [ ] All endpoints are documented
- [ ] Both versions are tested

