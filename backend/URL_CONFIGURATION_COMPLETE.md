# URL Configuration - COMPLETE

## Summary
Successfully configured all URL routes for the new ViewSets with nested routing for complaint sub-resources.

## Files Modified

### 1. `/backend/apps/complaints/urls.py`

**Changes Made**:
- Added imports for 5 new ViewSets
- Created nested routers for complaint sub-resources
- Added nested URL patterns

**New Routes**:
```python
# Complaint Images
GET    /api/complaints/{id}/images/
POST   /api/complaints/{id}/images/
GET    /api/complaints/{id}/images/{image_id}/
PUT    /api/complaints/{id}/images/{image_id}/
PATCH  /api/complaints/{id}/images/{image_id}/
DELETE /api/complaints/{id}/images/{image_id}/

# Complaint Attachments
GET    /api/complaints/{id}/attachments/
POST   /api/complaints/{id}/attachments/
GET    /api/complaints/{id}/attachments/{attachment_id}/
PUT    /api/complaints/{id}/attachments/{attachment_id}/
PATCH  /api/complaints/{id}/attachments/{attachment_id}/
DELETE /api/complaints/{id}/attachments/{attachment_id}/

# Complaint Timeline
GET    /api/complaints/{id}/timeline/
GET    /api/complaints/{id}/timeline/{timeline_id}/

# Complaint Resolution
GET    /api/complaints/{id}/resolution/
POST   /api/complaints/{id}/resolution/
GET    /api/complaints/{id}/resolution/{resolution_id}/
PUT    /api/complaints/{id}/resolution/{resolution_id}/
PATCH  /api/complaints/{id}/resolution/{resolution_id}/
DELETE /api/complaints/{id}/resolution/{resolution_id}/

# Officer Notes
GET    /api/complaints/{id}/notes/
POST   /api/complaints/{id}/notes/
GET    /api/complaints/{id}/notes/{note_id}/
PUT    /api/complaints/{id}/notes/{note_id}/
PATCH  /api/complaints/{id}/notes/{note_id}/
DELETE /api/complaints/{id}/notes/{note_id}/
```

### 2. `/backend/apps/users/urls.py`

**Changes Made**:
- Added DefaultRouter import
- Added OfficerViewSet import
- Created router for officers
- Added router to urlpatterns

**New Routes**:
```python
# Officer Management
GET    /api/users/officers/
POST   /api/users/officers/
GET    /api/users/officers/{id}/
PUT    /api/users/officers/{id}/
PATCH  /api/users/officers/{id}/
DELETE /api/users/officers/{id}/

# Officer Custom Actions
PATCH  /api/users/officers/{id}/status/
POST   /api/users/officers/{id}/reset_password/
POST   /api/users/officers/{id}/send_invitation/
GET    /api/users/officers/by_department/?department_id=X
GET    /api/users/officers/by_ward/?ward=X
```

## Complete API Endpoint Reference

### Complaints
```
GET    /api/complaints/                    - List complaints
POST   /api/complaints/                    - Create complaint
GET    /api/complaints/{id}/               - Get complaint details
PUT    /api/complaints/{id}/               - Update complaint
PATCH  /api/complaints/{id}/               - Partial update
DELETE /api/complaints/{id}/               - Delete complaint
```

### Complaint Images
```
GET    /api/complaints/{complaint_id}/images/              - List images
POST   /api/complaints/{complaint_id}/images/              - Upload image
GET    /api/complaints/{complaint_id}/images/{id}/         - Get image
PUT    /api/complaints/{complaint_id}/images/{id}/         - Update image
PATCH  /api/complaints/{complaint_id}/images/{id}/         - Partial update
DELETE /api/complaints/{complaint_id}/images/{id}/         - Delete image
```

### Complaint Attachments
```
GET    /api/complaints/{complaint_id}/attachments/         - List attachments
POST   /api/complaints/{complaint_id}/attachments/         - Upload attachment
GET    /api/complaints/{complaint_id}/attachments/{id}/    - Get attachment
PUT    /api/complaints/{complaint_id}/attachments/{id}/    - Update attachment
PATCH  /api/complaints/{complaint_id}/attachments/{id}/    - Partial update
DELETE /api/complaints/{complaint_id}/attachments/{id}/    - Delete attachment
```

### Complaint Timeline
```
GET    /api/complaints/{complaint_id}/timeline/            - List timeline
GET    /api/complaints/{complaint_id}/timeline/{id}/       - Get timeline entry
```

### Complaint Resolution
```
GET    /api/complaints/{complaint_id}/resolution/          - Get resolution
POST   /api/complaints/{complaint_id}/resolution/          - Create resolution
PUT    /api/complaints/{complaint_id}/resolution/{id}/     - Update resolution
PATCH  /api/complaints/{complaint_id}/resolution/{id}/     - Partial update
DELETE /api/complaints/{complaint_id}/resolution/{id}/     - Delete resolution
```

### Officer Notes
```
GET    /api/complaints/{complaint_id}/notes/               - List notes
POST   /api/complaints/{complaint_id}/notes/               - Add note
GET    /api/complaints/{complaint_id}/notes/{id}/          - Get note
PUT    /api/complaints/{complaint_id}/notes/{id}/          - Update note
PATCH  /api/complaints/{complaint_id}/notes/{id}/          - Partial update
DELETE /api/complaints/{complaint_id}/notes/{id}/          - Delete note
```

### Officers
```
GET    /api/users/officers/                                - List officers
POST   /api/users/officers/                                - Create officer
GET    /api/users/officers/{id}/                           - Get officer
PUT    /api/users/officers/{id}/                           - Update officer
PATCH  /api/users/officers/{id}/                           - Partial update
DELETE /api/users/officers/{id}/                           - Delete officer

# Custom Actions
PATCH  /api/users/officers/{id}/status/                    - Toggle status
POST   /api/users/officers/{id}/reset_password/            - Reset password
POST   /api/users/officers/{id}/send_invitation/           - Send invitation
GET    /api/users/officers/by_department/?department_id=X  - Filter by department
GET    /api/users/officers/by_ward/?ward=X                 - Filter by ward
```

## Existing Endpoints (Unchanged)

### Authentication
```
POST   /api/users/register/                - Register citizen
POST   /api/users/admin-register/          - Register admin
POST   /api/users/login/                   - Login
POST   /api/users/token/refresh/           - Refresh token
POST   /api/users/logout/                  - Logout
```

### User Profile
```
GET    /api/users/profile/                 - Get profile
PUT    /api/users/profile/                 - Update profile
POST   /api/users/change-password/         - Change password
```

### Admin Management
```
GET    /api/users/admin-requests/          - List registration requests
POST   /api/users/admin-requests/{id}/action/ - Approve/reject request
POST   /api/users/create-super-admin/      - Create super admin
```

### Departments
```
GET    /api/departments/                   - List departments
POST   /api/departments/                   - Create department
GET    /api/departments/{id}/              - Get department
PUT    /api/departments/{id}/              - Update department
DELETE /api/departments/{id}/              - Delete department
```

### Analytics
```
GET    /api/complaints/analytics/dashboard/     - Dashboard stats
GET    /api/complaints/analytics/departments/   - Department performance
GET    /api/complaints/analytics/wards/         - Ward analytics
GET    /api/complaints/analytics/heatmap/       - Heatmap data
GET    /api/complaints/analytics/trends/        - Monthly trends
GET    /api/complaints/analytics/user/          - User activity
GET    /api/complaints/analytics/export/        - Export data
GET    /api/complaints/analytics/public/        - Public stats
```

## Nested Routing Structure

The complaint sub-resources use nested routing:

```
/api/complaints/
├── {id}/
│   ├── images/
│   │   ├── (GET, POST)
│   │   └── {image_id}/ (GET, PUT, PATCH, DELETE)
│   ├── attachments/
│   │   ├── (GET, POST)
│   │   └── {attachment_id}/ (GET, PUT, PATCH, DELETE)
│   ├── timeline/
│   │   ├── (GET)
│   │   └── {timeline_id}/ (GET)
│   ├── resolution/
│   │   ├── (GET, POST)
│   │   └── {resolution_id}/ (GET, PUT, PATCH, DELETE)
│   └── notes/
│       ├── (GET, POST)
│       └── {note_id}/ (GET, PUT, PATCH, DELETE)
```

## Router Configuration Details

### Complaints Router
- **Type**: DefaultRouter
- **Basename**: complaint
- **Prefix**: '' (empty, registered at root)

### Nested Routers
- **Type**: SimpleRouter (for nested resources)
- **Images Router**: Basename 'complaint-image'
- **Attachments Router**: Basename 'complaint-attachment'
- **Timeline Router**: Basename 'complaint-timeline'
- **Resolution Router**: Basename 'complaint-resolution'
- **Notes Router**: Basename 'complaint-notes'

### Officers Router
- **Type**: DefaultRouter
- **Basename**: officer
- **Prefix**: 'officers'
- **Parent**: users URLs

## Testing the Endpoints

### List Officers
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/users/officers/
```

### Get Officer Details
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/users/officers/1/
```

### Get Complaint Images
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/complaints/3/images/
```

### Get Complaint Timeline
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/complaints/3/timeline/
```

### Filter Officers by Department
```bash
curl -H "Authorization: Bearer TOKEN" "http://localhost:8000/api/users/officers/by_department/?department_id=1"
```

### Filter Officers by Ward
```bash
curl -H "Authorization: Bearer TOKEN" "http://localhost:8000/api/users/officers/by_ward/?ward=H/W"
```

## URL Namespace Configuration

### Complaints App
- **app_name**: 'complaints'
- **Namespace**: complaints

### Users App
- **app_name**: 'users'
- **Namespace**: users

## Implementation Status

✅ Complaints URLs Updated
✅ Users URLs Updated
✅ Nested Routing Configured
✅ Officer Routes Added
✅ All ViewSets Registered

## Next Steps

1. **Test All Endpoints**
   - Use Postman or curl to test
   - Verify nested routing works
   - Check permissions

2. **Frontend Integration**
   - Update API calls in frontend
   - Use new endpoints for data fetching
   - Test with real data

3. **Documentation**
   - Generate API documentation
   - Create Swagger/OpenAPI specs
   - Update frontend API client

## Files Modified

1. ✅ `/backend/apps/complaints/urls.py`
   - Added 5 nested routers
   - Updated imports
   - Added nested URL patterns

2. ✅ `/backend/apps/users/urls.py`
   - Added DefaultRouter
   - Added OfficerViewSet
   - Registered officer routes

## Total Changes

- 2 URL configuration files updated
- 6 new URL patterns added
- 5 nested routers configured
- 30+ new API endpoints available
- Full CRUD support for all resources

## Implementation Date
November 12, 2025
