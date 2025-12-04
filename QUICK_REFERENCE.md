# Quick Reference Guide

Fast access to documentation for all common tasks.

---

## 🚀 Quick Start by Role (5 minutes)

### Backend Developer
```
1. Read: backend/DETAILED_BACKEND_GUIDE.md (first 30 mins)
2. Setup: Follow "Local Development Setup" in backend guide
3. Run: python manage.py runserver
4. Code: Reference 04_BACKEND_IMPLEMENTATION.md while coding
5. Reference: 07_API_REFERENCE.md for endpoint contracts
```

### Frontend Developer
```
1. Read: frontend/DETAILED_FRONTEND_GUIDE.md (first 30 mins)
2. Setup: npm install && npm run dev
3. Code: Reference 05_FRONTEND_IMPLEMENTATION.md while coding
4. API: Check 07_API_REFERENCE.md for endpoints
5. Auth: Reference 09_AUTHENTICATION_AND_AUTHORIZATION.md
```

### DevOps Engineer
```
1. Read: 10_DEPLOYMENT_GUIDE.md (first 30 mins)
2. Read: backend/DETAILED_BACKEND_GUIDE.md (Config sections)
3. Read: frontend/DETAILED_FRONTEND_GUIDE.md (Build sections)
4. Setup: Follow Development/Production sections
5. Deploy: Use docker-compose up
```

---

## 📚 Documentation Files Quick Links

| Location | File | Best For |
|----------|------|----------|
| `/docs/` | `00_DOCUMENTATION_INDEX.md` | Master navigation |
| `/docs/` | `01_SYSTEM_OVERVIEW.md` | Understanding project |
| `/docs/` | `02_TECHNOLOGY_STACK.md` | Tech stack details |
| `/docs/` | `03_ARCHITECTURE_AND_STRUCTURE.md` | System architecture |
| `/docs/` | `04_BACKEND_IMPLEMENTATION.md` | Backend development |
| `/docs/` | `05_FRONTEND_IMPLEMENTATION.md` | Frontend development |
| `/docs/` | `06_3TIER_ADMIN_HIERARCHY.md` | Roles & permissions |
| `/docs/` | `07_API_REFERENCE.md` | API endpoints |
| `/docs/` | `08_DATABASE_SCHEMA.md` | Database design |
| `/docs/` | `09_AUTHENTICATION_AND_AUTHORIZATION.md` | Auth & JWT |
| `/docs/` | `10_DEPLOYMENT_GUIDE.md` | Deployment |
| `/docs/` | `11_TROUBLESHOOTING_AND_FAQ.md` | Troubleshooting |
| `/docs/` | `12_FRONTEND_BACKEND_INTEGRATION.md` | Integration flows |
| `/backend/` | `DETAILED_BACKEND_GUIDE.md` | Backend complete guide |
| `/frontend/` | `DETAILED_FRONTEND_GUIDE.md` | Frontend complete guide |

---

## 🔍 Find Documentation by Task

### Setting Up Development Environment
```
→ backend/DETAILED_BACKEND_GUIDE.md (Setup section)
→ frontend/DETAILED_FRONTEND_GUIDE.md (Installation section)
```

### Creating a New API Endpoint
```
→ backend/DETAILED_BACKEND_GUIDE.md (Adding new feature)
→ 04_BACKEND_IMPLEMENTATION.md (ViewSet patterns)
→ 07_API_REFERENCE.md (Document endpoint)
→ 12_FRONTEND_BACKEND_INTEGRATION.md (Contract)
```

### Creating a New Frontend Component
```
→ frontend/DETAILED_FRONTEND_GUIDE.md (Components section)
→ 05_FRONTEND_IMPLEMENTATION.md (Component patterns)
→ 07_API_REFERENCE.md (API endpoints)
→ 09_AUTHENTICATION_AND_AUTHORIZATION.md (Auth usage)
```

### Understanding User Roles & Permissions
```
→ 06_3TIER_ADMIN_HIERARCHY.md (Role matrix)
→ 04_BACKEND_IMPLEMENTATION.md (Permission classes)
→ 05_FRONTEND_IMPLEMENTATION.md (Role-based access)
→ 12_FRONTEND_BACKEND_INTEGRATION.md (Filtering logic)
```

### Deploying to Production
```
→ 10_DEPLOYMENT_GUIDE.md (Main guide)
→ backend/DETAILED_BACKEND_GUIDE.md (Configuration)
→ frontend/DETAILED_FRONTEND_GUIDE.md (Build section)
→ 08_DATABASE_SCHEMA.md (Migration)
```

### Fixing a Bug or Issue
```
→ 11_TROUBLESHOOTING_AND_FAQ.md (First stop)
→ backend/DETAILED_BACKEND_GUIDE.md (Debugging section)
→ frontend/DETAILED_FRONTEND_GUIDE.md (Debugging section)
→ 12_FRONTEND_BACKEND_INTEGRATION.md (If integration issue)
```

### Understanding Data Flow
```
→ 12_FRONTEND_BACKEND_INTEGRATION.md (Data flows)
→ 04_BACKEND_IMPLEMENTATION.md (Filtering logic)
→ 05_FRONTEND_IMPLEMENTATION.md (Component flow)
→ 07_API_REFERENCE.md (Request/response format)
```

---

## 📋 Common Commands

### Backend Development
```bash
# Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Run
python manage.py runserver

# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell
python manage.py shell

# Tests
python manage.py test

# Create superuser
python manage.py createsuperuser

# Load test data
python manage.py create_sample_data
```

### Frontend Development
```bash
# Setup
cd frontend
npm install

# Run
npm run dev

# Build
npm run build

# Preview
npm run preview

# Tests
npm run test
npm run test:watch
npm run test:coverage
```

### Docker Development
```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run command in container
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run build
```

---

## 🔑 Key Concepts Quick Reference

### 3-Tier Admin Hierarchy
```
┌─────────────────────────────────┐
│ SUPER ADMIN                     │
│ - All complaints worldwide      │
│ - Manage all departments        │
│ - Create roles, users           │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│ DEPARTMENT ADMIN                │
│ - Department complaints only    │
│ - Manage department staff       │
│ - Assign work to officers       │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│ BMC OFFICER                     │
│ - Assigned ward complaints only │
│ - Update complaint status       │
│ - Accept/reject complaints      │
└────────┬────────────────────────┘
         │
┌────────▼────────────────────────┐
│ CITIZEN                         │
│ - Own complaints only           │
│ - Report issues                 │
│ - Track complaint status        │
└─────────────────────────────────┘
```

### Data Isolation (get_queryset)
```python
Super Admin  → return all
Dept Admin   → return department complaints
Officer      → return ward complaints
Citizen      → return own complaints
```

### JWT Authentication
```
Login → Get access_token + refresh_token → Store in localStorage
        ↓
API Call → Add "Authorization: Bearer {token}" to header
        ↓
Expired? → Call refresh endpoint, get new token, retry
        ↓
Logout → Clear tokens from localStorage
```

---

## ⚙️ Configuration Quick Reference

### Environment Variables (.env)

**Backend**
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend**
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Snap & Report
VITE_MAPBOX_TOKEN=your-token
```

### API Base URLs
```
Development:  http://localhost:8000/api/
Production:   https://yourdomain.com/api/
```

### Key Files
```
Backend:
  - settings.py (Django config)
  - requirements.txt (Python packages)
  - docker-compose.yml (Services)

Frontend:
  - vite.config.js (Build config)
  - package.json (JS packages)
  - tailwind.config.js (Styling)
```

---

## 🧪 Testing Quick Reference

### Backend Tests
```bash
# Run all tests
python manage.py test

# Run specific app
python manage.py test apps.complaints

# Run with coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests
```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 🐛 Troubleshooting Quick Reference

### Database Issues
```
Error: "Cannot connect to database"
→ Check DATABASE_URL
→ Verify PostgreSQL is running
→ Check database credentials
→ See 11_TROUBLESHOOTING_AND_FAQ.md #1
```

### JWT Token Issues
```
Error: "Invalid token" or "Token expired"
→ Check localStorage has tokens
→ Verify token format in Authorization header
→ Check token expiration
→ See 11_TROUBLESHOOTING_AND_FAQ.md #2
```

### CORS Errors
```
Error: "Access to XMLHttpRequest blocked by CORS"
→ Check CORS_ALLOWED_ORIGINS setting
→ Verify frontend URL in allowed origins
→ See 11_TROUBLESHOOTING_AND_FAQ.md #3
```

### Permission Denied
```
Error: "403 Forbidden" on API requests
→ Check user role and tier
→ Verify user has officer profile (for admin/officer)
→ Check permission classes in ViewSet
→ See 11_TROUBLESHOOTING_AND_FAQ.md #5
```

### More Issues?
→ See `11_TROUBLESHOOTING_AND_FAQ.md` (40+ common issues)

---

## 🚢 Deployment Quick Reference

### Development to Production Checklist
```
Backend:
  ☐ Set DEBUG=False
  ☐ Update ALLOWED_HOSTS
  ☐ Update SECRET_KEY
  ☐ Setup PostgreSQL
  ☐ Configure AWS S3 (if using)
  ☐ Setup email backend
  ☐ Run migrations
  ☐ Collect static files
  ☐ Create superuser

Frontend:
  ☐ Update VITE_API_BASE_URL
  ☐ Run npm run build
  ☐ Test build: npm run preview
  ☐ Check bundle size
  ☐ Verify environment variables

DevOps:
  ☐ Setup Docker/Docker Compose
  ☐ Configure Nginx
  ☐ Setup SSL certificate
  ☐ Configure DNS
  ☐ Test all endpoints
  ☐ Setup monitoring
  ☐ Configure backups
  ☐ Document deployment
```

### Deploy Command
```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Check logs
docker-compose logs -f
```

---

## 📖 Reading Recommendations

### New to Project (1-2 hours)
1. `01_SYSTEM_OVERVIEW.md` (understand what it does)
2. `02_TECHNOLOGY_STACK.md` (understand tech choices)
3. `03_ARCHITECTURE_AND_STRUCTURE.md` (understand structure)
4. `06_3TIER_ADMIN_HIERARCHY.md` (understand roles)

### Backend Developer (2-3 hours)
1. `backend/DETAILED_BACKEND_GUIDE.md` (complete overview)
2. `04_BACKEND_IMPLEMENTATION.md` (specific implementation)
3. `07_API_REFERENCE.md` (endpoints)
4. `12_FRONTEND_BACKEND_INTEGRATION.md` (how frontend uses APIs)

### Frontend Developer (2-3 hours)
1. `frontend/DETAILED_FRONTEND_GUIDE.md` (complete overview)
2. `05_FRONTEND_IMPLEMENTATION.md` (specific implementation)
3. `07_API_REFERENCE.md` (endpoints to call)
4. `12_FRONTEND_BACKEND_INTEGRATION.md` (how to integrate)

### DevOps Engineer (2-3 hours)
1. `10_DEPLOYMENT_GUIDE.md` (deployment procedures)
2. `backend/DETAILED_BACKEND_GUIDE.md` (Configuration sections)
3. `frontend/DETAILED_FRONTEND_GUIDE.md` (Build sections)
4. `11_TROUBLESHOOTING_AND_FAQ.md` (common issues)

---

## 💡 Pro Tips

1. **Use Ctrl+F** to search within documents for quick answers
2. **Follow links** between documents for related topics
3. **Bookmark** frequently referenced docs
4. **Keep README.md** in browser tab for quick reference
5. **Update docs** when you find/fix issues
6. **Share** relevant docs with team members
7. **Ask questions** based on doc references
8. **Contribute** improvements to documentation

---

## 🎯 Next Steps

### As a Backend Developer
- [ ] Setup development environment
- [ ] Run migrations
- [ ] Create test data
- [ ] Test API endpoints
- [ ] Read API implementation details

### As a Frontend Developer
- [ ] Setup development environment
- [ ] Install dependencies
- [ ] Run dev server
- [ ] Test API integration
- [ ] Review component examples

### As a DevOps Engineer
- [ ] Review deployment guide
- [ ] Setup staging environment
- [ ] Test deployment procedure
- [ ] Configure monitoring
- [ ] Setup backup strategy

### As a Project Manager
- [ ] Review system overview
- [ ] Understand architecture
- [ ] Know tech stack
- [ ] Understand team roles
- [ ] Know deployment procedure

---

## 📞 Support

### Finding Help
1. **Check documentation** first (11_TROUBLESHOOTING_AND_FAQ.md)
2. **Search code examples** in relevant guide
3. **Enable debug mode** for more information
4. **Check logs** for error details
5. **Ask team** with document references

### Documentation Updates
- Report issues or improvements
- Share with team
- Keep in sync with code
- Update when features change
- Celebrate working solutions

---

## 📊 Documentation Stats

- **15 comprehensive files**
- **8000+ lines of content**
- **100+ code examples**
- **20+ diagrams**
- **50+ error scenarios**
- **100% system coverage**

---

**Start Here**: [docs/00_DOCUMENTATION_INDEX.md](docs/00_DOCUMENTATION_INDEX.md)

Last Updated: December 4, 2025
Version: 3.0

