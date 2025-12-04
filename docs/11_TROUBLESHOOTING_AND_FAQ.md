# 11. Troubleshooting & FAQ

## Common Issues

### 1. Database Connection Issues

#### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U snap_user -d snap_report_prod

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Verify database exists
psql -l | grep snap_report
```

---

### 2. JWT Token Errors

#### Problem: "Invalid token" or "Token expired"

**Solution:**
```python
# Check token expiration
import jwt
import json
from django.conf import settings

token = "your_token_here"
decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
print(json.dumps(decoded, indent=2))

# Manually refresh token via API
POST /api/users/token/refresh/
{
  "refresh": "your_refresh_token"
}
```

---

### 3. CORS Errors

#### Problem: "Access to XMLHttpRequest blocked by CORS"

**Solution:**
```python
# backend/core/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://yourdomain.com"
]

# Also ensure frontend .env has correct API URL
VITE_API_BASE_URL=http://localhost:8000/api
```

---

### 4. Static Files Not Loading

#### Problem: "404 on /static/..."

**Solution:**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check static root directory
ls -la /app/staticfiles/

# Verify Nginx configuration points to correct location
# Check nginx.conf location block for /static/
```

---

### 5. Permission Denied Errors

#### Problem: "403 Forbidden" on API requests

**Solution:**
```python
# Check user role and permissions
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='user@example.com')

# Debug user properties
print(f"Role: {user.role}")
print(f"Is Superuser: {user.is_superuser}")
print(f"Admin Tier: {user.admin_tier}")
print(f"Department: {user.officer_profile.department if hasattr(user, 'officer_profile') else 'N/A'}")

# Check permission class in ViewSet
# Ensure correct permission_classes are set
```

---

### 6. Email Not Sending

#### Problem: "SMTPAuthenticationError" or emails not delivered

**Solution:**
```env
# Verify email configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Use app password, not regular password
EMAIL_USE_TLS=True

# Test email
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail(
...     'Test Subject',
...     'Test Message',
...     'from@example.com',
...     ['to@example.com'],
...     fail_silently=False,
... )
```

---

### 7. Celery Tasks Not Running

#### Problem: "Celery worker not processing tasks"

**Solution:**
```bash
# Check Redis connection
redis-cli ping
# Should return: PONG

# Start Celery worker
celery -A core worker -l info

# Check task queue
celery -A core inspect active

# Reset Celery (warning: loses all pending tasks)
celery -A core purge
```

---

### 8. Docker Container Crashes

#### Problem: "Container exited with code 1"

**Solution:**
```bash
# Check container logs
docker logs container_name -f

# Get detailed error information
docker inspect container_name | grep -A 20 '"State"'

# Try rebuilding
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

---

### 9. Frontend Build Errors

#### Problem: "Vite build fails" or "npm ERR! 404 Not Found"

**Solution:**
```bash
# Clear node_modules and cache
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstall dependencies
npm install

# Check Node version (requires 14+)
node --version

# Try building again
npm run build
```

---

### 10. Memory/Performance Issues

#### Problem: "Out of memory" or application slow

**Solution:**
```bash
# Check system resources
free -h
df -h

# Monitor Docker container
docker stats container_name

# Optimize settings
# Reduce WORKERS in Gunicorn
# Enable caching in Redis
# Use database connection pooling
# Enable Gzip compression in Nginx

# Check slow queries
python manage.py shell_plus
>>> from django.db import connection
>>> from django.test.utils import CaptureQueriesContext
>>> with CaptureQueriesContext(connection) as context:
...     # Run slow operation
...     pass
>>> print(f"{len(context)} queries executed")
```

---

## FAQ

### General Questions

**Q: How do I reset my admin password?**

A: Use Django's createsuperuser with --noinput to change password:
```bash
python manage.py changepassword admin_email@example.com
```

---

**Q: Can I use SQLite in production?**

A: Not recommended. Use PostgreSQL for:
- Concurrent users
- Data integrity
- Backup/recovery
- Performance

---

**Q: How do I migrate from SQLite to PostgreSQL?**

A:
```bash
# Dump SQLite data
python manage.py dumpdata > data.json

# Switch DATABASE_URL to PostgreSQL
# Run migrations
python manage.py migrate

# Load data
python manage.py loaddata data.json
```

---

### Authentication Questions

**Q: How long do JWT tokens last?**

A:
- Access Token: 15 minutes
- Refresh Token: 7 days
- Session Timeout: 30 minutes of inactivity

---

**Q: Can users have multiple sessions?**

A: Yes. Each login generates new tokens. Previous tokens remain valid until expiration.

---

**Q: How do I implement SSO/OAuth?**

A: Install django-allauth:
```bash
pip install django-allauth

# Configure in settings.py
INSTALLED_APPS = [
    'allauth',
    'allauth.account',
]

# Add social providers (Google, Facebook, etc.)
```

---

### Complaint Management Questions

**Q: Can officers reassign complaints?**

A: Currently, only admins can assign complaints. To enable officer reassignment:

```python
# apps/complaints/permissions.py
class CanReassignComplaint(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow assigned officer or admin
        return (request.user == obj.assigned_to or 
                request.user.is_superuser or
                request.user.role == 'ADMIN')
```

---

**Q: How do I track who made what changes?**

A: Use Django's admin.LogEntry or create audit trail:

```python
# apps/complaints/models.py
class AuditLog(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    action = models.CharField(max_length=50)
    changes = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

---

**Q: Can citizens edit their complaints?**

A: Currently, only status updates are allowed. To enable full editing:

```python
# Allow edit only within 24 hours of creation
from django.utils import timezone
from datetime import timedelta

def can_edit_complaint(complaint, user):
    if user != complaint.user:
        return False
    time_diff = timezone.now() - complaint.created_at
    return time_diff < timedelta(hours=24)
```

---

### Role & Permission Questions

**Q: How do I create a new role?**

A:
```python
# Modify User model
ROLE_CHOICES = (
    ('CITIZEN', 'Citizen'),
    ('ADMIN', 'Admin'),
    ('DEPARTMENT_STAFF', 'Department Staff'),
    ('NEW_ROLE', 'New Role'),  # Add here
)

# Create permission class
class HasNewRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'NEW_ROLE'
```

---

**Q: How do I restrict a department admin from seeing other departments?**

A: This is already implemented:
```python
# apps/complaints/views.py get_queryset()
if user.role == 'ADMIN' and not user.is_superuser:
    return queryset.filter(department=user_department)  # Automatic filtering
```

---

### Database Questions

**Q: How often should I backup the database?**

A: Minimum daily, preferably hourly for production:
```bash
# Hourly cron job
0 * * * * pg_dump snap_report_prod | gzip > /backups/db_$(date +%Y%m%d_%H).sql.gz
```

---

**Q: How do I archive old complaints?**

A:
```python
# Management command
from django.core.management.base import BaseCommand
from datetime import timedelta
from django.utils import timezone

class Command(BaseCommand):
    def handle(self, *args, **options):
        cutoff_date = timezone.now() - timedelta(days=365)
        old_complaints = Complaint.objects.filter(
            created_at__lt=cutoff_date,
            status='RESOLVED'
        )
        # Archive to separate table or export to file
```

---

### Performance Questions

**Q: How many complaints can the system handle?**

A: With proper optimization:
- Concurrent users: 10,000+
- Complaints: 1,000,000+
- Query response: <100ms

Key optimizations:
- Database indexing
- Query optimization
- Caching (Redis)
- CDN for static files

---

**Q: How do I monitor API response times?**

A:
```python
# Middleware for request timing
import time
from django.utils.deprecation import MiddlewareMixin

class TimingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            response['X-Response-Time'] = duration
        return response
```

---

## Getting Help

1. **Check logs first**:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. **Search documentation**:
   - Django docs: https://docs.djangoproject.com/
   - React docs: https://react.dev/
   - DRF docs: https://www.django-rest-framework.org/

3. **Enable debug mode** (dev only):
   ```env
   DEBUG=True
   ```

4. **Use Django shell**:
   ```bash
   python manage.py shell_plus
   ```

5. **Check system resources**:
   ```bash
   free -h
   df -h
   top
   ```

