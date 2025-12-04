# 10. Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL database (production)
- Nginx web server (production)
- Let's Encrypt SSL certificate (production)
- AWS/Cloud hosting account (optional)

---

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd snap-and-report
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Generate SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 3. Environment Variables (.env)

```env
DEBUG=True
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

# AWS S3 (optional)
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
```

### 4. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata sample_data.json
```

### 5. Run Development Server

```bash
python manage.py runserver
```

Backend available at: `http://localhost:8000`

---

### 6. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

### 7. Frontend Environment Variables (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Snap & Report
VITE_MAPBOX_TOKEN=your-mapbox-token
VITE_ENVIRONMENT=development
```

Frontend available at: `http://localhost:5173`

---

## Docker Development

### Build Images

```bash
# Backend
cd backend
docker build -f Dockerfile.dev -t snap-report-backend:dev .

# Frontend
cd frontend
docker build -f Dockerfile.dev -t snap-report-frontend:dev .
```

### Run with Docker Compose

```bash
docker-compose -f docker-compose.dev.yml up
```

---

## Production Deployment

### 1. Build Docker Images

```bash
# Backend
docker build -f backend/Dockerfile -t snap-report-backend:latest .
docker tag snap-report-backend:latest your-registry/snap-report-backend:latest
docker push your-registry/snap-report-backend:latest

# Frontend
docker build -f frontend/Dockerfile -t snap-report-frontend:latest .
docker tag snap-report-frontend:latest your-registry/snap-report-frontend:latest
docker push your-registry/snap-report-frontend:latest
```

---

### 2. Production Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: always
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - app-network

  backend:
    image: your-registry/snap-report-backend:latest
    environment:
      DEBUG: 'False'
      SECRET_KEY: ${SECRET_KEY}
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      ALLOWED_HOSTS: ${ALLOWED_HOSTS}
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    restart: always
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery:
    image: your-registry/snap-report-backend:latest
    command: celery -A core worker -l info
    environment:
      DEBUG: 'False'
      SECRET_KEY: ${SECRET_KEY}
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: always
    networks:
      - app-network

  frontend:
    image: your-registry/snap-report-frontend:latest
    restart: always
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - static_volume:/app/static:ro
      - media_volume:/app/media:ro
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - app-network

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  app-network:
```

---

### 3. Environment Variables (Production)

```env
# Django
DEBUG=False
SECRET_KEY=your-strong-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@db:5432/dbname
DB_NAME=snap_report_prod
DB_USER=snap_user
DB_PASSWORD=strong_password

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=app-password

# AWS S3
USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=snap-report-bucket

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENVIRONMENT=production
```

---

### 4. Nginx Configuration

```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
    
    # Static files
    location /static/ {
        alias /app/staticfiles/;
        expires 30d;
    }
    
    # Media files
    location /media/ {
        alias /app/media/;
        expires 7d;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### 5. SSL Certificate Setup

```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy to project
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem

# Auto-renewal
certbot renew --quiet --no-eff-email --email admin@yourdomain.com
```

---

### 6. Deploy with Docker Compose

```bash
# Navigate to project directory
cd snap-and-report

# Create .env file with production values
nano .env

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Check logs
docker-compose logs -f
```

---

## AWS Deployment (Optional)

### 1. Create RDS PostgreSQL Instance

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier snap-report-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourPassword123! \
  --allocated-storage 20 \
  --storage-type gp2 \
  --publicly-accessible false
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://snap-report-media --region us-east-1
aws s3api put-bucket-versioning \
  --bucket snap-report-media \
  --versioning-configuration Status=Enabled
```

### 3. Create ECR Repositories

```bash
aws ecr create-repository --repository-name snap-report-backend
aws ecr create-repository --repository-name snap-report-frontend
```

### 4. Deploy with ECS/Fargate

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name snap-report

# Register task definitions
aws ecs register-task-definition --cli-input-json file://backend-task-def.json

# Create services
aws ecs create-service \
  --cluster snap-report \
  --service-name snap-report-backend \
  --task-definition snap-report-backend:1 \
  --desired-count 2
```

---

## Monitoring & Logging

### Application Monitoring

```python
# Django settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/app.log',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}
```

### Health Checks

```python
# urls.py
path('health/', views.health_check, name='health'),

# views.py
@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'database': check_database(),
        'redis': check_redis()
    })
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup PostgreSQL
pg_dump -h localhost -U user dbname > backup.sql

# Restore from backup
psql -h localhost -U user dbname < backup.sql

# Automated daily backup
0 2 * * * pg_dump -h localhost -U user dbname | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Media Files Backup

```bash
# Backup to S3
aws s3 sync /app/media s3://snap-report-backups/media/ --delete
```

---

## Performance Optimization

1. **Caching**: Redis for session/query caching
2. **Database**: Use indexes on frequently queried fields
3. **Static Files**: CDN for static assets
4. **Images**: Compress with Pillow in backend
5. **API Pagination**: Default 20 items per page
6. **Rate Limiting**: 1000 requests/hour per user

