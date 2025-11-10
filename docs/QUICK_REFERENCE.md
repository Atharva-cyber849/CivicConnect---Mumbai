# 🚀 Snap & Report - Quick Reference Guide

## 📖 Table of Contents
- [Quick Start](#quick-start)
- [Common Commands](#common-commands)
- [API Quick Reference](#api-quick-reference)
- [Troubleshooting](#troubleshooting)
- [Useful Links](#useful-links)

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd snap-and-report

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up --build

# Create admin user (new terminal)
docker-compose exec backend python manage.py createsuperuser

# Access at:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000/admin
# API Docs: http://localhost:8000/api/docs
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# AI Service (new terminal)
cd ai_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

---

## ⚡ Common Commands

### Docker Commands

```bash
# Start services
docker-compose up
docker-compose up -d  # detached mode

# Stop services
docker-compose down
docker-compose down -v  # with volumes

# View logs
docker-compose logs -f
docker-compose logs -f backend  # specific service

# Restart service
docker-compose restart backend

# Execute commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py shell

# Rebuild
docker-compose up --build
docker-compose build backend  # specific service
```

### Django Commands

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations

# Admin
python manage.py createsuperuser
python manage.py changepassword <email>

# Shell
python manage.py shell
python manage.py dbshell

# Static files
python manage.py collectstatic

# Run server
python manage.py runserver
python manage.py runserver 0.0.0.0:8000

# Testing
python manage.py test
python manage.py test apps.users
```

### Celery Commands

```bash
# Worker
celery -A core worker -l info
celery -A core worker -l debug

# Beat (scheduler)
celery -A core beat -l info

# Flower (monitoring)
pip install flower
celery -A core flower

# Purge tasks
celery -A core purge
```

### Frontend Commands

```bash
# Development
npm run dev
npm run dev -- --host 0.0.0.0

# Build
npm run build
npm run preview

# Linting
npm run lint
npm run lint -- --fix

# Testing
npm test
npm run test:coverage
```

### Database Commands

```bash
# Backup
docker-compose exec db pg_dump -U postgres snap_and_report > backup.sql

# Restore
docker-compose exec -T db psql -U postgres snap_and_report < backup.sql

# Connect to PostgreSQL
docker-compose exec db psql -U postgres snap_and_report

# Reset database
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
```

---

## 📡 API Quick Reference

### Base URL
```
Development: http://localhost:8000/api
Production: https://api.yourdomain.com/api
```

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Response: {"access": "...", "refresh": "...", "user": {...}}

# Use token in requests
curl -X GET http://localhost:8000/api/complaints/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Complaints

```bash
# List complaints
GET /api/complaints/
GET /api/complaints/?status=PENDING
GET /api/complaints/?category=POTHOLE

# Get complaint
GET /api/complaints/{id}/

# Create complaint
POST /api/complaints/
Content-Type: multipart/form-data
{
  "title": "Pothole on Main Street",
  "description": "Large pothole near intersection",
  "category": "POTHOLE",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zip_code": "62701",
  "image": <file>
}

# Update status (admin only)
PATCH /api/complaints/{id}/update_status/
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "update_message": "Investigation started"
}

# Add comment
POST /api/complaints/{id}/add_update/
{
  "message": "Work crew dispatched"
}

# Statistics (admin)
GET /api/complaints/statistics/

# GeoJSON for maps
GET /api/complaints/geo_json/
```

### Departments (Admin)

```bash
# List departments
GET /api/departments/

# Create department
POST /api/departments/
{
  "name": "Public Works",
  "email": "works@city.gov",
  "categories": ["POTHOLE", "ROAD_DAMAGE"]
}

# Add staff
POST /api/departments/{id}/add_staff/
{
  "user": 5,
  "role": "Engineer"
}
```

### AI Service

```bash
# Predict category
POST http://localhost:8001/predict
Content-Type: multipart/form-data
{
  "description": "Large hole in the road",
  "image": <file>
}

# Response:
{
  "predicted_category": "POTHOLE",
  "confidence_score": 0.85,
  "ai_method": "text_classification",
  "message": "Category predicted from text description"
}
```

---

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### Migrations Error

```bash
# Reset migrations (WARNING: deletes data)
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
```

### Frontend Not Loading

```bash
# Clear node_modules
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check .env file
cat .env
# Should have: VITE_API_URL=http://localhost:8000/api
```

### Celery Not Processing Tasks

```bash
# Check Redis
docker-compose exec redis redis-cli ping
# Should return: PONG

# Check Celery worker logs
docker-compose logs -f celery

# Purge stuck tasks
docker-compose exec backend celery -A core purge
```

### Static Files Not Found

```bash
# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Check STATIC_ROOT in settings
```

### CORS Errors

```bash
# Check CORS_ALLOWED_ORIGINS in backend/core/settings.py
# Should include your frontend URL:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",
#     "http://localhost:3000",
# ]
```

---

## 📚 Useful Links

### Documentation
- [Full Setup Guide](./SETUP_GUIDE.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Architecture Diagram](./ARCHITECTURE.md)

### API Documentation
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- AI Service: http://localhost:8001/docs

### Admin Interfaces
- Django Admin: http://localhost:8000/admin/
- Celery Flower: http://localhost:5555/ (if installed)

### External Resources
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## 🎯 Quick Testing

### Test Backend

```bash
# Run all tests
docker-compose exec backend python manage.py test

# Run specific app tests
docker-compose exec backend python manage.py test apps.users

# With coverage
docker-compose exec backend coverage run --source='.' manage.py test
docker-compose exec backend coverage report
```

### Test API with curl

```bash
# Health check
curl http://localhost:8000/api/health

# Register user
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","password2":"test123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Test AI Service

```bash
# Health check
curl http://localhost:8001/health

# Predict with text
curl -X POST http://localhost:8001/predict \
  -F "description=Large pothole on main street"
```

---

## 📊 Default Data

### Categories
- POTHOLE
- STREETLIGHT
- GARBAGE
- WATER
- SEWAGE
- ROAD_DAMAGE
- TRAFFIC_SIGNAL
- PARK
- NOISE
- OTHER

### Status Values
- PENDING
- IN_PROGRESS
- RESOLVED
- REJECTED

### Priority Levels
- LOW
- MEDIUM
- HIGH
- URGENT

### User Roles
- CITIZEN
- DEPARTMENT_STAFF
- ADMIN

---

## 💡 Pro Tips

1. **Use environment variables** - Never commit `.env` files
2. **Check logs first** - Most issues are visible in logs
3. **Restart services** - When in doubt, restart
4. **Keep backups** - Regular database backups are essential
5. **Use migrations** - Never modify database directly
6. **Test locally** - Always test changes locally before deploying
7. **Monitor resources** - Keep an eye on CPU/memory usage
8. **Update dependencies** - Keep packages up to date

---

## 🆘 Getting Help

If you're stuck:

1. Check the logs: `docker-compose logs -f`
2. Read the error messages carefully
3. Search the documentation
4. Check GitHub Issues
5. Ask the community

---

**Happy Coding! 🚀**
