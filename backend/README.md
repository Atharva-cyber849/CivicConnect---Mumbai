# Snap & Report Backend

Django REST API backend for the Snap & Report civic issue reporting system.

## Features

- 🔐 **JWT Authentication** with role-based access control
- 📋 **Complaint Management** with AI-powered categorization
- 🏢 **Department Management** with staff assignment
- 📧 **Email Notifications** via Celery
- 🗺️ **Geolocation Support** with PostGIS
- 📸 **Image Upload** to AWS S3/Cloudinary
- 📚 **API Documentation** with Swagger/OpenAPI

## Tech Stack

- **Django 5.0** + **Django REST Framework**
- **PostgreSQL** with **PostGIS**
- **Celery** + **Redis** for async tasks
- **JWT** authentication
- **Docker** for containerization

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL with PostGIS extension
- Redis
- (Optional) Docker & Docker Compose

### Local Development Setup

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

8. **Run Celery worker (in separate terminal)**
   ```bash
   celery -A core worker -l info
   ```

### Docker Setup

1. **Build and run containers**
   ```bash
   docker-compose up --build
   ```

2. **Create superuser in Docker**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

3. **Access the application**
   - API: http://localhost:8000/
   - Admin: http://localhost:8000/admin/
   - API Docs: http://localhost:8000/api/docs/

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - Login (get JWT tokens)
- `POST /api/users/token/refresh/` - Refresh access token
- `POST /api/users/logout/` - Logout

### User Profile
- `GET /api/users/profile/` - Get user profile
- `PATCH /api/users/profile/` - Update profile
- `POST /api/users/change-password/` - Change password

### Complaints
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/` - Create complaint
- `GET /api/complaints/{id}/` - Get complaint details
- `PATCH /api/complaints/{id}/` - Update complaint
- `DELETE /api/complaints/{id}/` - Delete complaint
- `GET /api/complaints/statistics/` - Get statistics (admin)
- `GET /api/complaints/geo_json/` - Get GeoJSON for maps
- `PATCH /api/complaints/{id}/update_status/` - Update status (admin)
- `POST /api/complaints/{id}/add_update/` - Add comment/update

### Departments
- `GET /api/departments/` - List departments
- `POST /api/departments/` - Create department (admin)
- `GET /api/departments/{id}/` - Get department details
- `PATCH /api/departments/{id}/` - Update department (admin)
- `DELETE /api/departments/{id}/` - Delete department (admin)
- `GET /api/departments/{id}/statistics/` - Get department stats
- `POST /api/departments/{id}/add_staff/` - Add staff member (admin)
- `DELETE /api/departments/{id}/remove_staff/` - Remove staff (admin)

## User Roles

- **CITIZEN** - Can create and view own complaints
- **DEPARTMENT_STAFF** - Can view and update assigned complaints
- **ADMIN** - Full access to all features

## Environment Variables

See `.env.example` for all required environment variables:

- Database configuration
- Redis URL
- Email settings (SMTP)
- AWS S3 credentials (optional)
- AI Service URL
- JWT settings

## Testing

Run tests:
```bash
python manage.py test
```

With coverage:
```bash
pytest --cov=apps
```

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper `SECRET_KEY`
3. Set up HTTPS with SSL certificate
4. Use Gunicorn + NGINX
5. Configure AWS S3 for media storage
6. Set up monitoring (Sentry, Prometheus)

## License

MIT License
