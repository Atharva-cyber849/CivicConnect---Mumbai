# 7. API Reference

## Base URL

- **Development**: `http://localhost:8000/api/`
- **Production**: `https://your-domain.com/api/`

---

## Authentication Endpoints

### Login

**POST** `/users/login/`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "CITIZEN",
    "admin_tier": "citizen",
    "ward": "Bandra"
  }
}
```

---

### Register

**POST** `/users/register/`

Request:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "9876543210",
  "ward": "Andheri"
}
```

Response (201 Created):
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "CITIZEN"
}
```

---

### Refresh Token

**POST** `/users/token/refresh/`

Request:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Response (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Complaints Endpoints

### List Complaints

**GET** `/complaints/`

**Query Parameters:**
- `status`: Filter by status (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- `category`: Filter by category
- `priority`: Filter by priority
- `ward`: Filter by ward
- `search`: Search in title/description
- `ordering`: Order by field (-created_at, created_at, priority, etc.)
- `page`: Pagination (default 20 per page)

**Response (200 OK):**
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/complaints/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Large pothole on SV Road",
      "category": "POTHOLE",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "user_name": "John Doe",
      "ward": "Bandra",
      "created_at": "2025-12-04T10:30:00Z",
      "latitude": 19.0596,
      "longitude": 72.8295
    }
  ]
}
```

---

### Create Complaint

**POST** `/complaints/`

**Content-Type**: `multipart/form-data`

Request:
```
title: "Pothole causing traffic jam"
description: "Large pothole on SV Road near station"
category: "POTHOLE"
priority: "HIGH"
ward: "Bandra"
address: "SV Road, Bandra, Mumbai"
city: "Mumbai"
state: "Maharashtra"
zip_code: "400050"
latitude: 19.0596
longitude: 72.8295
image: <binary file>
```

Response (201 Created):
```json
{
  "id": 42,
  "title": "Pothole causing traffic jam",
  "description": "Large pothole on SV Road near station",
  "category": "POTHOLE",
  "status": "PENDING",
  "ward": "Bandra",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "created_at": "2025-12-04T11:00:00Z"
}
```

---

### Get Complaint Details

**GET** `/complaints/{id}/`

Response (200 OK):
```json
{
  "id": 42,
  "title": "Pothole causing traffic jam",
  "description": "Large pothole on SV Road near station",
  "category": "POTHOLE",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "user": 1,
  "user_name": "John Doe",
  "department_name": "Roads & Infrastructure",
  "assigned_to_name": "Vikram Singh",
  "ward": "Bandra",
  "address": "SV Road, Bandra, Mumbai",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "image": "http://localhost:8000/media/complaints/...",
  "created_at": "2025-12-04T10:30:00Z",
  "updated_at": "2025-12-04T11:00:00Z",
  "updates": [
    {
      "id": 1,
      "message": "Assigned to officer",
      "previous_status": "PENDING",
      "new_status": "IN_PROGRESS",
      "created_at": "2025-12-04T11:00:00Z"
    }
  ]
}
```

---

### Update Complaint Status

**PATCH** `/complaints/{id}/status/`

Request:
```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "update_message": "Work started on the pothole repair"
}
```

Response (200 OK):
```json
{
  "id": 42,
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "updated_at": "2025-12-04T12:00:00Z"
}
```

---

### Get Map View Complaints

**GET** `/complaints/map/`

**Query Parameters:**
- `bounds`: Optional bounding box
- `status`: Filter by status

Response (200 OK):
```json
[
  {
    "id": 42,
    "title": "Pothole on SV Road",
    "category": "POTHOLE",
    "status": "IN_PROGRESS",
    "ward": "Bandra",
    "latitude": 19.0596,
    "longitude": 72.8295,
    "image": "http://localhost:8000/media/complaints/..."
  }
]
```

---

## Departments Endpoints

### List Departments

**GET** `/departments/`

Response (200 OK):
```json
[
  {
    "id": 1,
    "name": "Roads & Infrastructure",
    "description": "Manages road-related complaints",
    "email": "roads@bmc.gov.in",
    "phone": "022-2200001",
    "is_active": true
  }
]
```

---

### Create Department (Super Admin Only)

**POST** `/departments/`

Request:
```json
{
  "name": "Water Supply",
  "description": "Manages water supply issues",
  "email": "water@bmc.gov.in",
  "phone": "022-2200003"
}
```

Response (201 Created):
```json
{
  "id": 3,
  "name": "Water Supply",
  "description": "Manages water supply issues",
  "email": "water@bmc.gov.in"
}
```

---

## Officers Endpoints

### List Officers

**GET** `/users/officers/`

Response (200 OK):
```json
[
  {
    "id": 1,
    "user": {
      "id": 5,
      "email": "officer.bandra@bmc.gov.in",
      "first_name": "Vikram",
      "last_name": "Singh"
    },
    "department": "Roads & Infrastructure",
    "assigned_ward": "Bandra",
    "designation": "Ward Officer",
    "complaints_handled": 42,
    "average_resolution_time": 5.2
  }
]
```

---

### Create Officer (Admin Only)

**POST** `/users/officers/`

Request:
```json
{
  "email": "newofficer@bmc.gov.in",
  "first_name": "Neha",
  "last_name": "Gupta",
  "phone": "9876543210",
  "password": "SecurePassword123",
  "department": 1,
  "assigned_ward": "Andheri",
  "designation": "Ward Officer"
}
```

Response (201 Created):
```json
{
  "user": {
    "id": 10,
    "email": "newofficer@bmc.gov.in",
    "role": "DEPARTMENT_STAFF"
  },
  "officer_profile": {
    "id": 5,
    "department": 1,
    "assigned_ward": "Andheri",
    "designation": "Ward Officer"
  }
}
```

---

## Analytics Endpoints

### Get Analytics Dashboard

**GET** `/complaints/analytics/`

**Query Parameters:**
- `days`: Number of days (default 30)
- `department`: Filter by department
- `ward`: Filter by ward

Response (200 OK):
```json
{
  "total_complaints": 150,
  "resolved": 120,
  "pending": 20,
  "in_progress": 10,
  "by_status": {
    "PENDING": 20,
    "IN_PROGRESS": 10,
    "RESOLVED": 120,
    "REJECTED": 0
  },
  "by_category": {
    "POTHOLE": 45,
    "GARBAGE": 30,
    "WATER": 20,
    "STREETLIGHT": 25,
    "OTHER": 30
  },
  "by_priority": {
    "LOW": 30,
    "MEDIUM": 80,
    "HIGH": 30,
    "URGENT": 10
  },
  "resolution_time_avg": 5.2,
  "open_rate": 0.20
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"],
  "another_field": ["Another error"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

- **Authenticated Requests**: 1000 per hour
- **Unauthenticated Requests**: 100 per hour

Rate limit info is returned in headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1702714800
```

---

## Headers

### Required Headers

All API requests should include:
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

### Response Headers

All responses include:
```
Content-Type: application/json
X-Request-ID: unique-request-id
```

