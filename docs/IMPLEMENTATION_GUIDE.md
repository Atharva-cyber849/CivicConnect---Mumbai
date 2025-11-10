# 🧭 Snap & Report — Mumbai Implementation Guide

**Complete 10-Phase Implementation Roadmap for BMC Civic Issue Reporting System**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Phase 1: Environment & Core Setup](#phase-1-environment--core-setup)
3. [Phase 2: User Authentication & Roles](#phase-2-user-authentication--roles)
4. [Phase 3: Complaint Management System](#phase-3-complaint-management-system)
5. [Phase 4: AI SmartRoute™ Integration](#phase-4-ai-smartroute-integration)
6. [Phase 5: Admin & Officer Dashboard](#phase-5-admin--officer-dashboard)
7. [Phase 6: Notifications & Feedback](#phase-6-notifications--feedback)
8. [Phase 7: Maps & Location Integration](#phase-7-maps--location-integration)
9. [Phase 8: Analytics & Reports](#phase-8-analytics--reports)
10. [Phase 9: Security & Optimization](#phase-9-security--optimization)
11. [Phase 10: Deployment & Monitoring](#phase-10-deployment--monitoring)
12. [Mumbai-Specific Features](#mumbai-specific-features)
13. [UI/UX Guidelines](#uiux-guidelines)
14. [Testing Checklist](#testing-checklist)

---

## 🎯 Project Overview

### Goal
A comprehensive civic issue reporting platform enabling **Mumbaikars** to report civic problems (potholes, garbage, water leaks, etc.) and **BMC officers** to manage and resolve them efficiently.

### System Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│    Django    │────▶│ PostgreSQL  │
│  Frontend   │     │  REST API    │     │  + PostGIS  │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   FastAPI    │
                    │ AI Service   │
                    └──────────────┘
                            │
                    ┌──────────────┐
                    │  Redis +     │
                    │  Celery      │
                    └──────────────┘
```

### Tech Stack
| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Django 5.0 + DRF |
| **Database** | PostgreSQL 15 + PostGIS 3.3 |
| **AI Service** | FastAPI + PyTorch |
| **Task Queue** | Celery + Redis |
| **Maps** | React Leaflet + OpenStreetMap |
| **Deployment** | Docker + NGINX |

---

## 📍 Phase 1: Environment & Core Setup

### Objective
Set up foundational infrastructure and ensure all components communicate properly.

### Tasks

#### 1.1 Initialize Project Structure ✅
```bash
CivicConnect/
├── backend/          # Django REST API
├── frontend/         # React + Vite
├── ai_service/       # FastAPI AI service
├── docker-compose.yml
└── docs/
```

#### 1.2 Configure Environment Variables
**backend/.env**
```env
# Database
DATABASE_NAME=snap_and_report
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_HOST=db
DATABASE_PORT=5432

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT
JWT_SECRET_KEY=your-jwt-secret

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_STORAGE_BUCKET_NAME=snap-and-report-media
AWS_S3_REGION_NAME=ap-south-1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

# Redis
REDIS_URL=redis://redis:6379/0

# AI Service
AI_SERVICE_URL=http://ai_service:8001
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:8000/api
VITE_MAP_CENTER_LAT=19.0760
VITE_MAP_CENTER_LNG=72.8777
```

#### 1.3 Setup Docker Services
```bash
# Start all services
docker-compose up --build

# Verify services are running
docker-compose ps

# Expected output:
# - db (PostgreSQL)
# - redis
# - backend (Django)
# - celery (Worker)
# - celery-beat (Scheduler)
# - ai_service (FastAPI)
# - frontend (React dev server)
```

#### 1.4 Initialize Database
```bash
# Create database and run migrations
docker-compose exec backend python manage.py migrate

# Create admin superuser
docker-compose exec backend python manage.py createsuperuser

# Load initial data (optional)
docker-compose exec backend python manage.py loaddata initial_data.json
```

### ✅ Validation Checklist
- [ ] All Docker containers running without errors
- [ ] Database migrations completed successfully
- [ ] Admin user created
- [ ] API health endpoint accessible: `http://localhost:8000/api/health/`
- [ ] Frontend loads: `http://localhost:5173`
- [ ] Redis connection successful
- [ ] Celery worker processing tasks

### 🐛 Common Issues & Solutions

**Issue:** Port already in use (8000/5173)
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

**Issue:** Database connection refused
```bash
# Check PostgreSQL logs
docker-compose logs db

# Restart database
docker-compose restart db
```

---

## 🔐 Phase 2: User Authentication & Roles

### Objective
Implement secure authentication with role-based access control for Citizens, Department Staff, and Admins.

### Tasks

#### 2.1 Custom User Model ✅
**File:** `backend/apps/users/models.py`

Features:
- Email-based authentication (no username)
- Three roles: CITIZEN, DEPARTMENT_STAFF, ADMIN
- Profile fields: phone, address, ward

#### 2.2 JWT Authentication Setup ✅
**Package:** `djangorestframework-simplejwt`

Endpoints:
- `POST /api/users/register/` - Register new citizen
- `POST /api/users/login/` - Get access + refresh tokens
- `POST /api/users/token/refresh/` - Refresh access token
- `GET /api/users/profile/` - Get current user profile
- `PATCH /api/users/profile/` - Update profile

#### 2.3 Role-Based Permissions ✅
**File:** `backend/apps/users/permissions.py`

- `IsCitizen` - Can create/view own complaints
- `IsDepartmentStaff` - Can view/update assigned complaints
- `IsAdmin` - Full access to all resources

#### 2.4 Frontend Auth Integration ✅
**Files:**
- `frontend/src/store/authStore.js` - Zustand state management
- `frontend/src/api/axios.js` - JWT token interceptor
- `frontend/src/App.jsx` - Protected routes

### ✅ Validation Checklist
- [ ] Citizen can register with email and password
- [ ] Login returns JWT tokens (access + refresh)
- [ ] Token automatically refreshed on 401 response
- [ ] Protected routes redirect unauthenticated users
- [ ] Role-based redirects working (citizen → dashboard, admin → admin panel)
- [ ] Profile update working

### 🧪 Test Cases
```bash
# Register new user
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@test.com",
    "password": "test123456",
    "password2": "test123456",
    "first_name": "Raj",
    "last_name": "Sharma"
  }'

# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@test.com",
    "password": "test123456"
  }'

# Expected response:
{
  "access": "eyJ0eXAi...",
  "refresh": "eyJ0eXAi...",
  "user": {
    "id": 1,
    "email": "citizen@test.com",
    "first_name": "Raj",
    "role": "CITIZEN"
  }
}
```

---

## 📝 Phase 3: Complaint Management System

### Objective
Enable citizens to report civic issues with photo, location, and description, and allow officers to manage them.

### Tasks

#### 3.1 Complaint Model ✅
**File:** `backend/apps/complaints/models.py`

Fields:
- `user` (FK to User)
- `department` (FK to Department)
- `title`, `description`
- `category` (POTHOLE, GARBAGE, WATER_LEAKAGE, etc.)
- `status` (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- `priority` (LOW, MEDIUM, HIGH, URGENT)
- `image` (ImageField)
- `location` (PostGIS PointField)
- `address`, `city`, `state`, `zip_code`, `ward`
- `ai_category`, `ai_confidence_score`

#### 3.2 API Endpoints ✅
**File:** `backend/apps/complaints/views.py`

- `POST /api/complaints/` - Submit new complaint
- `GET /api/complaints/` - List complaints (filtered by user role)
- `GET /api/complaints/{id}/` - Get complaint details
- `PATCH /api/complaints/{id}/update_status/` - Update status (staff/admin)
- `POST /api/complaints/{id}/add_update/` - Add comment/update
- `GET /api/complaints/statistics/` - Get analytics (admin)
- `GET /api/complaints/geo_json/` - Get map data

#### 3.3 Frontend Report Form
**File:** `frontend/src/pages/User/ReportIssue.jsx`

Features to implement:
- [ ] Photo upload with preview
- [ ] Category dropdown (Mumbai-specific categories)
- [ ] Ward selection (A to T wards)
- [ ] Interactive map for location selection
- [ ] GPS "Use My Location" button
- [ ] Address auto-fill from coordinates
- [ ] Form validation
- [ ] Success confirmation with complaint ID

#### 3.4 Media Storage Configuration
**Options:**
1. **Local Storage (Development)**
   ```python
   MEDIA_URL = '/media/'
   MEDIA_ROOT = BASE_DIR / 'media'
   ```

2. **AWS S3 (Production)** ✅
   ```python
   DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
   AWS_STORAGE_BUCKET_NAME = 'snap-and-report-media'
   AWS_S3_REGION_NAME = 'ap-south-1'
   ```

### ✅ Validation Checklist
- [ ] Citizen can submit complaint with image
- [ ] Image uploads successfully
- [ ] Location captured correctly (lat/lng)
- [ ] Ward auto-detected or manually selected
- [ ] Complaint appears in user's dashboard
- [ ] Officer can view assigned complaints
- [ ] Admin can view all complaints
- [ ] Status updates work correctly
- [ ] Filters working (status, category, ward, date)

### 🧪 Test Cases
```bash
# Submit complaint (multipart/form-data)
curl -X POST http://localhost:8000/api/complaints/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Pothole on SV Road" \
  -F "description=Large pothole near Bandra station" \
  -F "category=POTHOLE" \
  -F "ward=H/W" \
  -F "address=SV Road, Bandra West" \
  -F "city=Mumbai" \
  -F "state=Maharashtra" \
  -F "zip_code=400050" \
  -F "image=@pothole.jpg"
```

---

## 🤖 Phase 4: AI SmartRoute™ Integration

### Objective
Automatically categorize complaints using image and text analysis, then route to the correct BMC department.

### Tasks

#### 4.1 FastAPI AI Service ✅
**File:** `ai_service/app.py`

Endpoint:
- `POST /predict` - Accepts image + description, returns category + confidence

Current Implementation:
- Rule-based keyword matching (mock)
- Returns predicted category and confidence score

#### 4.2 Upgrade to Real AI Models
**Files to modify:**
- `ai_service/utils/predict.py`
- `ai_service/models/` (add trained models)

**Steps:**
1. Train image classification model (CNN)
   ```python
   # Use pre-trained ResNet/EfficientNet
   # Fine-tune on Mumbai civic issue dataset
   ```

2. Train text classification model (NLP)
   ```python
   # Use BERT/DistilBERT
   # Train on complaint descriptions
   ```

3. Implement ensemble prediction
   ```python
   # Combine image + text predictions
   # Use confidence-weighted voting
   ```

#### 4.3 Backend Integration ✅
**File:** `backend/apps/complaints/tasks.py`

Celery task:
```python
@shared_task
def process_complaint_with_ai(complaint_id):
    # Send image + description to AI service
    # Update complaint with AI category
    # Assign to department
    # Notify user
```

#### 4.4 Department Auto-Assignment
**File:** `backend/apps/complaints/signals.py`

Logic:
1. AI predicts category
2. Map category → department
3. Assign complaint to department
4. Notify department staff

### ✅ Validation Checklist
- [ ] AI service reachable: `http://localhost:8001/docs`
- [ ] AI prediction returns valid category
- [ ] Confidence score between 0-1
- [ ] Low confidence complaints flagged for manual review
- [ ] Department correctly assigned based on category
- [ ] Fallback to manual assignment if AI fails

### 🧪 Test Cases
```bash
# Test AI prediction
curl -X POST http://localhost:8001/predict \
  -F "description=Large hole in the road causing traffic issues" \
  -F "image=@test_pothole.jpg"

# Expected response:
{
  "predicted_category": "POTHOLE",
  "confidence_score": 0.87,
  "ai_method": "ensemble",
  "department": "ROADS"
}
```

---

## 📊 Phase 5: Admin & Officer Dashboard

### Objective
Provide comprehensive management interface for BMC staff with analytics, filters, and status updates.

### Tasks

#### 5.1 Admin Dashboard Overview ✅
**File:** `frontend/src/pages/Admin/Dashboard.jsx`

Components to enhance:
- [ ] Total complaints count (by status)
- [ ] Ward-wise breakdown chart
- [ ] Department performance metrics
- [ ] Resolution time analytics
- [ ] Interactive Mumbai map with complaint clusters
- [ ] Recent activity feed
- [ ] Quick stats cards

#### 5.2 Complaint Management Page ✅
**File:** `frontend/src/pages/Admin/ComplaintList.jsx`

Features:
- [ ] Advanced filters (ward, category, status, date range)
- [ ] Sortable table/cards
- [ ] Bulk actions (assign, export)
- [ ] Search by complaint ID or keywords
- [ ] Map view toggle

#### 5.3 Complaint Detail Page ✅
**File:** `frontend/src/pages/Admin/ComplaintDetail.jsx`

Features:
- [ ] Full complaint details with image
- [ ] Location map with ward boundary
- [ ] Status timeline (Pending → In Progress → Resolved)
- [ ] Priority selector
- [ ] Department assignment
- [ ] Add update/comment
- [ ] Send notification to citizen

#### 5.4 Department Management ✅
**File:** `frontend/src/pages/Admin/DepartmentManagement.jsx`

Features:
- [ ] List all BMC departments
- [ ] Add/edit departments
- [ ] Assign staff to departments
- [ ] Set department categories
- [ ] Performance analytics per department

### ✅ Validation Checklist
- [ ] Admin can view all complaints
- [ ] Filters work correctly
- [ ] Status updates reflect immediately
- [ ] Charts display accurate data
- [ ] Map shows correct complaint locations
- [ ] Department assignment working
- [ ] Notifications sent on status change

---

## 🔔 Phase 6: Notifications & Feedback

### Objective
Keep users informed about complaint status changes via email and in-app notifications.

### Tasks

#### 6.1 Email Notification System ✅
**File:** `backend/apps/notifications/tasks.py`

Celery tasks:
- `send_complaint_submitted_email()`
- `send_status_update_email()`
- `send_complaint_resolved_email()`

Templates:
- Professional HTML email templates
- Include complaint details and status
- Add link to view complaint

#### 6.2 In-App Notifications ✅
**File:** `frontend/src/components/common/NotificationPanel.jsx`

Features:
- Bell icon with unread count badge
- Dropdown panel with notifications
- Mark as read/unread
- Delete notifications
- Link to related complaint
- Real-time polling (30s interval)

#### 6.3 Notification API Endpoints
**To create:**
```python
# backend/apps/notifications/views.py
class NotificationViewSet(viewsets.ModelViewSet):
    - GET /api/notifications/ - List user notifications
    - PATCH /api/notifications/{id}/ - Mark as read
    - POST /api/notifications/mark_all_read/ - Mark all as read
    - DELETE /api/notifications/{id}/ - Delete notification
```

#### 6.4 Feedback System (Optional)
**To create:**
```python
# backend/apps/complaints/models.py
class ComplaintFeedback(models.Model):
    complaint = models.OneToOneField(Complaint)
    rating = models.IntegerField(1-5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### ✅ Validation Checklist
- [ ] Email sent when complaint submitted
- [ ] Email sent when status changes
- [ ] In-app notifications appear in real-time
- [ ] Notification badge shows correct count
- [ ] Notifications link to correct complaint
- [ ] Mark as read functionality works
- [ ] Email templates are mobile-responsive

---

## 🗺️ Phase 7: Maps & Location Integration

### Objective
Integrate interactive maps for location selection and visualization across Mumbai's 24 wards.

### Tasks

#### 7.1 Map Utilities ✅
**File:** `frontend/src/utils/mapUtils.js`

Features:
- Mumbai-centered map configuration
- Custom markers for complaint categories
- Marker clustering for dense areas
- Ward detection from coordinates
- Reverse geocoding (lat/lng → address)
- GPS location detection
- Distance calculation

#### 7.2 Ward Boundaries GeoJSON
**File to create:** `frontend/public/data/mumbai-wards.geojson`

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ward": "A",
        "name": "Colaba",
        "zone": "South"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[72.8100, 18.9000], ...]]
      }
    },
    // ... 23 more wards
  ]
}
```

**Note:** Obtain actual ward boundaries from [MCGM Open Data Portal](https://portal.mcgm.gov.in/)

#### 7.3 Interactive Map Component
**File to create:** `frontend/src/components/Map/InteractiveMap.jsx`

Features:
- Click to select location
- Draggable marker
- Ward boundaries overlay
- Complaint markers with popups
- Clustering for multiple complaints
- Search location
- Current location button

#### 7.4 Heatmap for Admin Dashboard
**Package:** `react-leaflet-heatmap-layer-v3`

```jsx
<HeatmapLayer
  points={complaintHeatmapData}
  longitudeExtractor={p => p.lng}
  latitudeExtractor={p => p.lat}
  intensityExtractor={p => p.intensity}
/>
```

### ✅ Validation Checklist
- [ ] Map centered on Mumbai (19.0760, 72.8777)
- [ ] User can click/drag to select location
- [ ] GPS "Use My Location" works
- [ ] Ward auto-detected from coordinates
- [ ] Address auto-filled from coordinates
- [ ] Ward boundaries visible on map
- [ ] Complaint markers show correct locations
- [ ] Marker clustering works for dense areas
- [ ] Heatmap shows complaint density

### 🧪 Test Locations (Mumbai)
| Location | Ward | Lat/Lng |
|----------|------|---------|
| Gateway of India | A | 18.9220, 72.8347 |
| Bandra Station | H/W | 19.0544, 72.8406 |
| Andheri Station | K/E | 19.1197, 72.8464 |
| Dadar Station | G/N | 19.0176, 72.8481 |
| Borivali National Park | R/N | 19.2244, 72.8664 |

---

## 📈 Phase 8: Analytics & Reports

### Objective
Provide data-driven insights for BMC administrators to track performance and identify trends.

### Tasks

#### 8.1 Analytics Endpoints
**File:** `backend/apps/complaints/views.py`

Endpoints to add:
```python
@action(detail=False, methods=['get'])
def analytics_dashboard(self, request):
    """
    Returns:
    - Total complaints by status
    - Ward-wise breakdown
    - Category distribution
    - Average resolution time
    - Daily/weekly trends
    """
    
@action(detail=False, methods=['get'])
def department_performance(self, request):
    """
    Returns per department:
    - Total assigned complaints
    - Resolved count
    - Average resolution time
    - Pending count
    """
    
@action(detail=False, methods=['get'])
def ward_statistics(self, request, ward):
    """
    Returns for specific ward:
    - Complaint categories
    - Resolution rate
    - Most common issues
    """
```

#### 8.2 Frontend Charts Integration
**Package:** `recharts` ✅

Charts to implement:
1. **Bar Chart** - Complaints by Ward
2. **Pie Chart** - Status Distribution
3. **Line Chart** - Daily Trends
4. **Area Chart** - Category Trends Over Time
5. **Table** - Top Issues by Ward

**File:** `frontend/src/pages/Admin/Analytics.jsx`

#### 8.3 Export Functionality
**Formats:**
- CSV - For spreadsheet analysis
- PDF - For reports
- GeoJSON - For GIS analysis

**Implementation:**
```python
# backend/apps/complaints/views.py
@action(detail=False, methods=['get'])
def export_csv(self, request):
    # Generate CSV with filters
    
@action(detail=False, methods=['get'])
def export_pdf(self, request):
    # Generate PDF report with charts
```

#### 8.4 Real-Time Dashboard
**Technology:** WebSockets (optional)

```python
# For real-time updates
from channels.generic.websocket import AsyncWebsocketConsumer

class ComplaintConsumer(AsyncWebsocketConsumer):
    # Push new complaints to dashboard
```

### ✅ Validation Checklist
- [ ] Analytics dashboard loads quickly
- [ ] Charts display accurate data
- [ ] Filters update charts dynamically
- [ ] Export CSV works with filters
- [ ] PDF report generation works
- [ ] Date range selector works
- [ ] Ward comparison view works

---

## 🔒 Phase 9: Security & Optimization

### Objective
Secure the application and optimize performance for production use.

### Tasks

#### 9.1 Security Measures

**Django Settings:**
```python
# HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://snapandreport.mumbai.gov.in",
]

# Rate Limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
    }
}
```

**Input Validation:**
- [ ] Validate image file types (jpg, png only)
- [ ] Limit image file size (5MB max)
- [ ] Sanitize user inputs (XSS prevention)
- [ ] Validate coordinates (within Mumbai bounds)
- [ ] Prevent SQL injection (use ORM)

**Authentication Security:**
- [ ] Implement password strength requirements
- [ ] Add rate limiting on login endpoint
- [ ] Enable account lockout after failed attempts
- [ ] Add email verification (optional)
- [ ] Implement 2FA for admin accounts (optional)

#### 9.2 Performance Optimization

**Database:**
```python
# Add indexes
class Complaint(models.Model):
    class Meta:
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['ward', 'category']),
            models.Index(fields=['user', '-created_at']),
        ]
```

**Caching:**
```python
# Redis caching
from django.core.cache import cache

# Cache ward boundaries
ward_data = cache.get('mumbai_wards')
if not ward_data:
    ward_data = load_ward_boundaries()
    cache.set('mumbai_wards', ward_data, 3600)  # 1 hour
```

**API Optimization:**
- [ ] Enable pagination for list endpoints
- [ ] Use `select_related` and `prefetch_related`
- [ ] Compress API responses (gzip)
- [ ] Implement API caching for statistics
- [ ] Optimize image sizes (thumbnails)

**Frontend Optimization:**
- [ ] Code splitting (lazy loading)
- [ ] Image optimization (WebP format)
- [ ] Minify CSS/JS in production
- [ ] Use CDN for static assets
- [ ] Implement service worker (PWA)

#### 9.3 Monitoring & Logging

**Sentry Integration:**
```python
# backend/core/settings.py
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=0.1,
)
```

**Custom Logging:**
```python
# Log important events
import logging
logger = logging.getLogger(__name__)

logger.info(f'Complaint {complaint.id} submitted by user {user.id}')
logger.warning(f'AI confidence low: {confidence_score}')
logger.error(f'Failed to send notification: {error}')
```

### ✅ Validation Checklist
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting working
- [ ] File upload validation working
- [ ] Database queries optimized (< 100ms)
- [ ] API response times < 500ms
- [ ] Frontend loads in < 3s
- [ ] Error logging to Sentry
- [ ] No sensitive data in logs

---

## 🚀 Phase 10: Deployment & Monitoring

### Objective
Deploy the complete system to production cloud infrastructure with monitoring and CI/CD.

### Tasks

#### 10.1 Production Environment Setup

**Option A: AWS Deployment**

**Infrastructure:**
- EC2 instance (t3.medium or larger)
- RDS PostgreSQL with PostGIS
- ElastiCache Redis
- S3 for media storage
- CloudFront CDN
- Route 53 for DNS
- ALB (Application Load Balancer)

**Setup Steps:**
1. Launch EC2 instance (Ubuntu 22.04)
2. Install Docker and Docker Compose
3. Configure security groups (ports 80, 443, 22)
4. Setup RDS PostgreSQL with PostGIS extension
5. Create S3 bucket for media files
6. Configure IAM roles and permissions

**Option B: Render/Railway Deployment**
- Simpler setup for quick deployment
- Auto-scaling and managed services
- Built-in SSL certificates

#### 10.2 Docker Production Configuration

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  backend:
    image: snapandreport/backend:latest
    env_file: .env.production
    command: gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/app/staticfiles
    
  frontend:
    image: snapandreport/frontend:latest
    build:
      context: ./frontend
      dockerfile: Dockerfile
```

#### 10.3 NGINX Configuration

**nginx/nginx.conf:**
```nginx
server {
    listen 80;
    server_name snapandreport.mumbai.gov.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name snapandreport.mumbai.gov.in;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Static files
    location /static/ {
        alias /app/staticfiles/;
    }
    
    # Media files
    location /media/ {
        alias /app/media/;
    }
}
```

#### 10.4 CI/CD Pipeline

**GitHub Actions:** `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          docker-compose run backend python manage.py test
          
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build and push Docker images
        run: |
          docker build -t snapandreport/backend:latest ./backend
          docker push snapandreport/backend:latest
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: |
          ssh user@server 'cd /app && docker-compose pull && docker-compose up -d'
```

#### 10.5 Monitoring & Alerting

**Grafana Dashboard:**
- API response times
- Database query performance
- Celery task queue length
- Error rates
- User activity metrics

**Prometheus Metrics:**
```python
# backend/core/middleware.py
from prometheus_client import Counter, Histogram

complaint_submissions = Counter('complaint_submissions_total', 'Total complaints')
api_response_time = Histogram('api_response_seconds', 'API response time')
```

**Health Check Endpoints:**
```python
# backend/core/views.py
@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'database': check_database(),
        'redis': check_redis(),
        'celery': check_celery(),
    })
```

### ✅ Validation Checklist
- [ ] Production server accessible via HTTPS
- [ ] SSL certificate valid
- [ ] Database backups automated (daily)
- [ ] Media files served from S3/CDN
- [ ] Static files cached properly
- [ ] CI/CD pipeline working
- [ ] Monitoring dashboard setup
- [ ] Error alerts configured
- [ ] Load testing completed (>1000 concurrent users)
- [ ] Disaster recovery plan documented

---

## 🏙️ Mumbai-Specific Features

### Ward Configuration
24 wards (A to T) covering all of Mumbai:
- **South Mumbai:** A, B, C, D, E
- **Central:** F/N, F/S, G/N, G/S
- **Western:** H/E, H/W, K/E, K/W, P/N, P/S, R/N, R/C, R/S
- **Eastern:** L, M/E, M/W, N, S, T

### BMC Departments
1. **Roads & Traffic** - Potholes, road damage, traffic signals
2. **Solid Waste Management** - Garbage, illegal dumping
3. **Water Supply** - Leaks, no water supply
4. **Sewage & Drainage** - Overflow, blockages
5. **Street Lighting** - Non-functional lights
6. **Gardens & Parks** - Maintenance issues
7. **Encroachment Removal** - Illegal constructions
8. **Public Health** - Mosquitoes, stray animals

### Localization
- **Languages:** English + Marathi (मराठी)
- **Currency:** ₹ (Rupees) for any fees/fines
- **Date Format:** DD/MM/YYYY (Indian format)
- **Contact:** BMC Helpline 1916

---

## 🎨 UI/UX Guidelines

### Design System

**Colors:**
- Primary: Mumbai Civic Blue (#0078D7)
- Accent: Bright Orange (#FF9E00)
- Success: Green (#10B981)
- Warning: Yellow (#FCD34D)
- Danger: Red (#EF4444)

**Typography:**
- Headings: Inter/Roboto Bold
- Body: Inter/Roboto Regular
- Devanagari (Marathi): Noto Sans Devanagari

**Components:**
- Cards with soft shadows
- Rounded corners (8px)
- Icon + text labels
- Hover states with scale transitions
- Loading skeletons

### Responsive Design
- **Mobile:** Single column, bottom navigation
- **Tablet:** Two columns, sidebar
- **Desktop:** Full dashboard layout

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Text scaling support

---

## ✅ Testing Checklist

### Functional Testing
- [ ] User registration and login
- [ ] Complaint submission with all fields
- [ ] Image upload and preview
- [ ] Location selection on map
- [ ] Status updates by officers
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Analytics dashboard
- [ ] Department management
- [ ] User profile updates

### Integration Testing
- [ ] Backend API ↔ Frontend
- [ ] Backend ↔ AI Service
- [ ] Backend ↔ Email service
- [ ] Backend ↔ S3 storage
- [ ] Celery task execution
- [ ] Redis caching

### Performance Testing
- [ ] Load test: 1000 concurrent users
- [ ] API response time < 500ms
- [ ] Image upload < 5 seconds
- [ ] Dashboard load < 3 seconds
- [ ] Database queries optimized

### Security Testing
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication bypass attempts
- [ ] File upload validation
- [ ] Rate limiting

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS/Android)

---

## 📞 Support & Maintenance

### User Support
- **BMC Helpline:** 1916
- **Email:** support@snapandreport.mumbai.gov.in
- **In-app:** Help/FAQ section

### Maintenance Schedule
- **Daily:** Database backups
- **Weekly:** Security updates
- **Monthly:** Performance review
- **Quarterly:** Feature updates

---

## 🎯 Success Metrics

### KPIs to Track
1. **User Adoption:** Active users per month
2. **Resolution Rate:** % of complaints resolved
3. **Resolution Time:** Average days to resolve
4. **AI Accuracy:** % correctly categorized
5. **User Satisfaction:** Feedback ratings
6. **Department Performance:** Per-department resolution rates

### Target Metrics (Year 1)
- 50,000+ registered users
- 100,000+ complaints reported
- 80%+ resolution rate
- <7 days average resolution time
- 85%+ AI accuracy
- 4+ star user rating

---

**For questions or issues, refer to:**
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common commands
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Deployment guide

---

**Made with ❤️ for Mumbai | जय महाराष्ट्र** 🇮🇳
