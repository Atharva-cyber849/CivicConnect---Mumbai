# CivicConnect API Endpoint Reference

Quick reference guide for all available API endpoints.

---

## Base URL
```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

---

## 🔐 Authentication

### Register Citizen
```http
POST /users/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "9876543210",
  "has_accepted_terms": true
}

Response: 201 Created
{
  "user": {...},
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

### Login
```http
POST /users/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access": "jwt_token",
  "refresh": "refresh_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "CITIZEN",
    ...
  }
}
```

### Refresh Token
```http
POST /users/token/refresh/
Content-Type: application/json

{
  "refresh": "refresh_token"
}

Response: 200 OK
{
  "access": "new_jwt_token"
}
```

### Logout
```http
POST /users/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh": "refresh_token"
}

Response: 200 OK
```

---

## 👤 User Profile

### Get Profile
```http
GET /users/profile/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "CITIZEN",
  ...
}
```

### Update Profile
```http
PUT /users/profile/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "first_name": "Jane",
  "phone": "9876543210",
  "ward": "A"
}

Response: 200 OK
```

---

## 📋 Complaints

### Create Complaint
```http
POST /complaints/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic issues",
  "category": "POTHOLE",
  "address": "123 Main St, Mumbai",
  "ward": "A",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip_code": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "image": <file>
}

Response: 201 Created
```

### Get All Complaints (User's Own)
```http
GET /complaints/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "title": "Pothole on Main Street",
    "status": "PENDING",
    ...
  }
]
```

### Get Complaint Details
```http
GET /complaints/{id}/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": 1,
  "title": "Pothole on Main Street",
  "description": "...",
  "status": "PENDING",
  "updates": [...]
}
```

### Update Complaint Status (Admin/Staff Only)
```http
PATCH /complaints/{id}/update_status/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "update_message": "Working on it"
}

Response: 200 OK
```

### Assign Complaint (Admin/Staff Only)
```http
PATCH /complaints/{id}/assign/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "department": 1,
  "assigned_to": 2
}

Response: 200 OK
```

### Add Comment/Update
```http
POST /complaints/{id}/add_update/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "This is an update"
}

Response: 201 Created
```

### Get User Statistics
```http
GET /complaints/user/stats/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total": 10,
  "pending": 3,
  "in_progress": 2,
  "resolved": 5,
  "by_category": {...},
  "by_priority": {...}
}
```

### Track Complaint (Public)
```http
GET /complaints/track/{tracking_number}/

Response: 200 OK
{
  "id": 1,
  "title": "...",
  "status": "IN_PROGRESS"
}
```

### Get Complaints by Ward
```http
GET /complaints/ward/?ward=A
Authorization: Bearer {access_token}

Response: 200 OK
[...]
```

### Get Map Data
```http
GET /complaints/map/?ne_lat=19.1&ne_lng=72.9&sw_lat=19.0&sw_lng=72.8
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "latitude": 19.076,
    "longitude": 72.877,
    ...
  }
]
```

---

## 📊 Analytics (Admin/Staff Only)

### Dashboard Statistics
```http
GET /complaints/analytics/dashboard/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total_complaints": 100,
  "pending": 20,
  "in_progress": 30,
  "resolved": 45,
  "rejected": 5,
  "by_category": {...},
  "recent_complaints": [...]
}
```

### Department Performance
```http
GET /complaints/analytics/departments/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "department": "Roads & Infrastructure",
    "total": 50,
    "resolved": 30,
    "avg_resolution_time": "3.5 days"
  }
]
```

### Ward Analytics
```http
GET /complaints/analytics/wards/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "ward": "A",
    "total": 25,
    "pending": 5,
    ...
  }
]
```

### Monthly Trends
```http
GET /complaints/analytics/trends/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "months": ["Jan", "Feb", "Mar"],
  "complaints": [10, 15, 20],
  "resolved": [8, 12, 18]
}
```

---

## 🏢 Departments

### Get All Departments
```http
GET /departments/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "name": "Roads & Infrastructure",
    "description": "...",
    "categories": ["POTHOLE", "ROAD_DAMAGE"]
  }
]
```

### Create Department (Admin Only)
```http
POST /departments/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Water Supply",
  "description": "Manages water supply issues",
  "email": "water@civic.gov",
  "categories": ["WATER"]
}

Response: 201 Created
```

### Update Department (Admin Only)
```http
PUT /departments/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Name",
  ...
}

Response: 200 OK
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /notifications/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "message": "Your complaint has been updated",
    "type": "info",
    "is_read": false,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### Get Unread Count
```http
GET /notifications/unread-count/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "unread_count": 5
}
```

### Mark as Read
```http
PATCH /notifications/{id}/read/
Authorization: Bearer {access_token}

Response: 200 OK
```

### Mark All as Read
```http
POST /notifications/mark_all_read/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "marked_read": 5
}
```

### Bulk Mark as Read
```http
POST /notifications/bulk-read/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notification_ids": [1, 2, 3]
}

Response: 200 OK
{
  "marked_read": 3
}
```

### Bulk Delete
```http
POST /notifications/bulk-delete/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notification_ids": [1, 2, 3]
}

Response: 200 OK
{
  "deleted": 3
}
```

### Get Preferences
```http
GET /notifications/preferences/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "email_notifications": true,
  "push_notifications": true,
  "sms_notifications": false
}
```

### Update Preferences
```http
PUT /notifications/preferences/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email_notifications": false,
  "push_notifications": true
}

Response: 200 OK
```

---

## 👨‍💼 Admin Management

### Get All Officers
```http
GET /admin/officers/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": 1,
    "email": "officer@civic.gov",
    "role": "DEPARTMENT_STAFF",
    "is_active": true
  }
]
```

### Create Officer
```http
POST /admin/officers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "newofficer@civic.gov",
  "password": "TempPass123!",
  "first_name": "John",
  "last_name": "Officer",
  "role": "DEPARTMENT_STAFF"
}

Response: 201 Created
```

### Update Officer Status
```http
PATCH /admin/officers/{id}/status/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "is_active": false
}

Response: 200 OK
```

### Reset Officer Password
```http
POST /admin/officers/{id}/reset-password/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "new_password": "NewTemp123!"
}

Response: 200 OK
{
  "message": "Password reset successfully",
  "temporary_password": "NewTemp123!"
}
```

### Get All Users
```http
GET /admin/users/?role=CITIZEN&is_active=true
Authorization: Bearer {access_token}

Response: 200 OK
[...]
```

### Get Ward Data
```http
GET /admin/wards/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "wards": [
    {
      "ward": "A",
      "total_complaints": 25,
      "pending": 5,
      "resolved": 18
    }
  ]
}
```

### Bulk Update Complaints
```http
POST /admin/complaints/bulk-update/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "complaint_ids": [1, 2, 3],
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}

Response: 200 OK
{
  "updated_count": 3
}
```

### Get Dashboard Stats
```http
GET /admin/dashboard/stats/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "total": 100,
  "pending": 20,
  "in_progress": 30,
  "resolved": 45,
  "by_category": {...},
  "by_priority": {...}
}
```

---

## 🔑 Admin Registration

### Request Admin Access
```http
POST /users/admin-register/?role=officer
Content-Type: application/json

{
  "full_name": "John Admin",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "phone": "9876543210",
  "justification": "Need access for department work"
}

Response: 201 Created
{
  "message": "Registration request submitted",
  "request_id": 1,
  "status": "pending_approval"
}
```

### Get Pending Requests (Super Admin Only)
```http
GET /users/admin-requests/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "requests": [
    {
      "id": 1,
      "full_name": "John Admin",
      "email": "admin@example.com",
      "requested_role": "DEPARTMENT_STAFF",
      "status": "PENDING"
    }
  ]
}
```

### Approve/Reject Request (Super Admin Only)
```http
POST /users/admin-requests/{id}/action/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "action": "approve"  // or "reject"
}

Response: 200 OK
```

---

## 🌍 Geocoding

### Reverse Geocode (No Auth Required)
```http
GET /complaints/geocode/reverse/?lat=19.0760&lon=72.8777

Response: 200 OK
{
  "address": "123 Main St, Mumbai, Maharashtra",
  "ward": "A",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip_code": "400001"
}
```

---

## 📱 Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🔒 Authentication Header

All authenticated endpoints require:
```
Authorization: Bearer {access_token}
```

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. File uploads use `multipart/form-data`
3. Other requests use `application/json`
4. Pagination is available on list endpoints (add `?page=1&limit=20`)
5. Filtering is available on most list endpoints

---

**Last Updated:** 2024
