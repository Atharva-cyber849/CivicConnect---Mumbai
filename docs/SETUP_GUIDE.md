# 🚀 Snap & Report - Setup & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Docker Setup](#docker-setup)
3. [Production Deployment](#production-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Migrations](#database-migrations)
6. [Common Issues](#common-issues)

---

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Install PostgreSQL with PostGIS extension
   # Create database
   createdb snap_and_report
   
   # Enable PostGIS
   psql snap_and_report
   CREATE EXTENSION postgis;
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start Redis**
   ```bash
   # Windows (with Redis installed)
   redis-server
   
   # Mac
   brew services start redis
   
   # Linux
   sudo systemctl start redis
   ```

9. **Start Celery worker (new terminal)**
   ```bash
   celery -A core worker -l info
   ```

10. **Start Django server**
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit with your API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### AI Service Setup

1. **Navigate to AI service directory**
   ```bash
   cd ai_service
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start FastAPI server**
   ```bash
   uvicorn app:app --reload --port 8001
   ```

---

## Docker Setup

### Quick Start with Docker Compose

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url>
   cd snap-and-report
   ```

2. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Create superuser (new terminal)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

5. **Access applications**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Admin: http://localhost:8000/admin
   - API Docs: http://localhost:8000/api/docs
   - AI Service: http://localhost:8001/docs

### Docker Commands

```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access Django shell
docker-compose exec backend python manage.py shell

# Access PostgreSQL
docker-compose exec db psql -U postgres snap_and_report
```

---

## Production Deployment

### AWS Deployment

#### 1. Backend (EC2)

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv postgresql postgis nginx

# Clone repository
git clone <your-repo-url>
cd snap-and-report/backend

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
python manage.py migrate
python manage.py collectstatic

# Set up Gunicorn
pip install gunicorn
```

**Gunicorn systemd service** (`/etc/systemd/system/gunicorn.service`):
```ini
[Unit]
Description=Gunicorn daemon for Snap & Report
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/snap-and-report/backend
ExecStart=/home/ubuntu/snap-and-report/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/ubuntu/snap-and-report/backend/gunicorn.sock \
          core.wsgi:application

[Install]
WantedBy=multi-user.target
```

**NGINX Configuration** (`/etc/nginx/sites-available/snapreport`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /static/ {
        alias /home/ubuntu/snap-and-report/backend/staticfiles/;
    }

    location /media/ {
        alias /home/ubuntu/snap-and-report/backend/media/;
    }

    location / {
        proxy_pass http://unix:/home/ubuntu/snap-and-report/backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. Frontend (Vercel/Netlify)

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**Netlify:**
```bash
# Build
cd frontend
npm run build

# Deploy dist folder via Netlify dashboard or CLI
netlify deploy --prod --dir=dist
```

#### 3. Database (AWS RDS)

1. Create PostgreSQL instance in AWS RDS
2. Enable PostGIS extension
3. Update `backend/.env` with RDS credentials
4. Run migrations

#### 4. Media Storage (AWS S3)

1. Create S3 bucket
2. Configure IAM user with S3 access
3. Update `backend/.env`:
   ```
   USE_S3=True
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_STORAGE_BUCKET_NAME=your-bucket
   ```

#### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables

### Backend (.env)

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=snap_and_report
DB_USER=postgres
DB_PASSWORD=secure-password
DB_HOST=db  # or RDS endpoint
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# AWS S3
USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AI Service
AI_SERVICE_URL=http://ai_service:8001
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=Snap & Report
```

---

## Database Migrations

### Creating Migrations

```bash
# Create migration files
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations

# Rollback migration
python manage.py migrate app_name migration_name
```

### Backup and Restore

```bash
# Backup
docker-compose exec db pg_dump -U postgres snap_and_report > backup.sql

# Restore
docker-compose exec -T db psql -U postgres snap_and_report < backup.sql
```

---

## Common Issues

### Issue: Port already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Issue: Database connection error

**Solution:**
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure PostGIS extension is installed

### Issue: Static files not loading

**Solution:**
```bash
python manage.py collectstatic --noinput
```

### Issue: CORS errors

**Solution:**
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in `settings.py`
- Ensure backend is accessible from frontend

### Issue: Celery not processing tasks

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Restart Celery worker
celery -A core worker -l info
```

---

## Monitoring & Logging

### Set up Sentry (Error Tracking)

```bash
pip install sentry-sdk

# In settings.py
import sentry_sdk
sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### Application Logs

```bash
# View Django logs
tail -f /path/to/django.log

# View Celery logs
tail -f /path/to/celery.log
```

---

## Performance Optimization

1. **Enable Redis Caching**
2. **Use CDN** for static files
3. **Enable Gzip** compression
4. **Database indexing** on frequent queries
5. **Lazy loading** images in frontend
6. **API pagination** for large datasets

---

## Security Checklist

- [ ] Change default `SECRET_KEY`
- [ ] Set `DEBUG=False` in production
- [ ] Use HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Use environment variables for secrets
- [ ] Enable Django security middleware
- [ ] Implement CSRF protection
- [ ] Use strong passwords
- [ ] Regular database backups

---

For more help, check the individual README files in each service directory or create an issue in the repository.
