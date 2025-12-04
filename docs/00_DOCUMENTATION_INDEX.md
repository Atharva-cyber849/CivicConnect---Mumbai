# Documentation Index

## Complete Documentation Set for Snap & Report System

This is a comprehensive technical documentation covering the Mumbai BMC Civic Complaint System (Snap & Report).

---

## Document Overview

### 📋 Getting Started

**[01_SYSTEM_OVERVIEW.md](01_SYSTEM_OVERVIEW.md)**
- Project purpose and features
- Key benefits for stakeholders
- Technical highlights
- System capabilities

---

**[02_TECHNOLOGY_STACK.md](02_TECHNOLOGY_STACK.md)**
- Backend technologies (Django, DRF, PostgreSQL)
- Frontend technologies (React, Vite, Tailwind)
- DevOps and deployment tools
- System architecture diagram
- Development environment setup

---

### 🏗️ Architecture & Design

**[03_ARCHITECTURE_AND_STRUCTURE.md](03_ARCHITECTURE_AND_STRUCTURE.md)**
- High-level system architecture
- Component interactions
- Directory structure (backend, frontend, docs)
- File organization and naming conventions
- Key modules and packages

---

**[06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md)**
- Role-based access control (4 tiers)
- Permission matrix (features vs roles)
- Data isolation at database level
- Security boundaries and validation
- Role transition flows

---

### 💻 Implementation Details

**[04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md)**
- Data models and relationships
- ViewSet implementations
- Serializers and validation
- Permission classes and decorators
- Complaint filtering logic (critical)
- URL routing and API endpoints

---

**[05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md)**
- React application structure
- Context API implementations
- Role-based access utilities
- API integration and axios setup
- Router configuration
- Page components overview
- Component hierarchy

---

### 🔌 API & Database

**[07_API_REFERENCE.md](07_API_REFERENCE.md)**
- Complete API endpoint documentation
- Authentication endpoints (login, register, refresh)
- Complaints CRUD operations
- Department management
- Officers management
- Analytics endpoints
- Error responses and status codes
- Rate limiting information

---

**[08_DATABASE_SCHEMA.md](08_DATABASE_SCHEMA.md)**
- Entity-relationship diagram
- Table definitions with columns
- Data types and constraints
- Indexes for performance
- Migration strategy
- Database relationships

---

### 🔐 Security & Auth

**[09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md)**
- JWT token flow and structure
- Frontend token management
- Backend authentication middleware
- Permission classes
- Session management
- Logout flow
- Security best practices
- Token refresh mechanism

---

### 🚀 Deployment & Operations

**[10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md)**
- Development setup instructions
- Docker and Docker Compose
- Production deployment
- Environment variables
- Nginx configuration
- SSL certificate setup
- AWS deployment options
- Health checks and monitoring
- Backup and recovery procedures

---

**[11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md)
- Common issues and solutions
- Database connection problems
- JWT token errors
- CORS configuration
- Static files handling
- Permission troubleshooting
- Email configuration
- Celery task issues
- Docker container problems
- Performance optimization
- Frequently asked questions

---

### 📁 Folder-Specific Guides

**[backend/DETAILED_BACKEND_GUIDE.md](../backend/DETAILED_BACKEND_GUIDE.md)**
- Complete backend project structure
- Core applications (Users, Complaints, Departments)
- Models, ViewSets, Serializers
- Permission classes and authentication
- Assignment and analytics services
- Mumbai utilities
- Database optimization
- Workflows and signals
- Celery background tasks
- Testing and debugging

---

**[frontend/DETAILED_FRONTEND_GUIDE.md](../frontend/DETAILED_FRONTEND_GUIDE.md)**
- Complete frontend project structure
- React components organization
- Context API (Auth, Theme, Notifications)
- Custom hooks (useAuth, useQuery, etc.)
- API layer with axios
- Role-based routing
- State management
- Environment configuration
- Tailwind CSS setup
- Performance optimization
- Testing with React Testing Library

---

**[12_FRONTEND_BACKEND_INTEGRATION.md](12_FRONTEND_BACKEND_INTEGRATION.md)**
- Complete request-response flow
- Authentication flow (login, refresh, logout)
- Data flow examples (complaint submission, filtering, etc.)
- API contract examples
- State management integration
- Error handling strategies
- Testing integration
- Deployment synchronization
- Development workflows

---

## Quick Navigation

### By Role

#### 👨‍💼 Project Managers
1. Start with [01_SYSTEM_OVERVIEW.md](01_SYSTEM_OVERVIEW.md)
2. Review [02_TECHNOLOGY_STACK.md](02_TECHNOLOGY_STACK.md)
3. Check [03_ARCHITECTURE_AND_STRUCTURE.md](03_ARCHITECTURE_AND_STRUCTURE.md)
4. See integration overview: [12_FRONTEND_BACKEND_INTEGRATION.md](12_FRONTEND_BACKEND_INTEGRATION.md)

#### 👨‍💻 Backend Developers
1. Read [backend/DETAILED_BACKEND_GUIDE.md](../backend/DETAILED_BACKEND_GUIDE.md) - Complete backend guide
2. Review [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md)
3. Check [08_DATABASE_SCHEMA.md](08_DATABASE_SCHEMA.md)
4. Reference [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md)
5. See integration: [12_FRONTEND_BACKEND_INTEGRATION.md](12_FRONTEND_BACKEND_INTEGRATION.md)
6. API Reference: [07_API_REFERENCE.md](07_API_REFERENCE.md)

#### 🎨 Frontend Developers
1. Read [frontend/DETAILED_FRONTEND_GUIDE.md](../frontend/DETAILED_FRONTEND_GUIDE.md) - Complete frontend guide
2. Review [05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md)
3. Check [07_API_REFERENCE.md](07_API_REFERENCE.md)
4. Reference [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md)
5. See integration: [12_FRONTEND_BACKEND_INTEGRATION.md](12_FRONTEND_BACKEND_INTEGRATION.md)
6. Role-based access: [06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md)

#### 🛠️ DevOps Engineers
1. Read [10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md)
2. Review [02_TECHNOLOGY_STACK.md](02_TECHNOLOGY_STACK.md)
3. Check [03_ARCHITECTURE_AND_STRUCTURE.md](03_ARCHITECTURE_AND_STRUCTURE.md)
4. Backend setup: [backend/DETAILED_BACKEND_GUIDE.md](../backend/DETAILED_BACKEND_GUIDE.md) - Configuration sections
5. Frontend setup: [frontend/DETAILED_FRONTEND_GUIDE.md](../frontend/DETAILED_FRONTEND_GUIDE.md) - Build & Deployment
6. Reference [11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md)

#### 🔍 QA/Testers
1. Review [06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md) - User roles and permissions
2. Check [07_API_REFERENCE.md](07_API_REFERENCE.md) - API endpoints
3. Reference [12_FRONTEND_BACKEND_INTEGRATION.md](12_FRONTEND_BACKEND_INTEGRATION.md) - Data flows
4. Backend testing: [backend/DETAILED_BACKEND_GUIDE.md](../backend/DETAILED_BACKEND_GUIDE.md) - Testing section
5. Frontend testing: [frontend/DETAILED_FRONTEND_GUIDE.md](../frontend/DETAILED_FRONTEND_GUIDE.md) - Testing section
6. Troubleshooting: [11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md)

---

### By Technical Area

#### Backend Development
- [backend/DETAILED_BACKEND_GUIDE.md](../backend/DETAILED_BACKEND_GUIDE.md) - Complete backend reference
- [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md) - Models and ViewSets
- [08_DATABASE_SCHEMA.md](08_DATABASE_SCHEMA.md) - Database structure
- [07_API_REFERENCE.md](07_API_REFERENCE.md) - API endpoints

#### Frontend Development
- [frontend/DETAILED_FRONTEND_GUIDE.md](../frontend/DETAILED_FRONTEND_GUIDE.md) - Complete frontend reference
- [05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md) - React components
- [07_API_REFERENCE.md](07_API_REFERENCE.md) - API consumption

#### API & Integration
- [07_API_REFERENCE.md](07_API_REFERENCE.md) - All endpoints
- [12_FRONTEND_BACKEND_INTEGRATION.md](12_FRONTEND_BACKEND_INTEGRATION.md) - Integration flows
- [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md) - Auth integration

#### Security & Permissions
- [06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md) - Role-based access
- [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md) - JWT & tokens
- [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md) - Permission classes

#### Deployment & DevOps
- [10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md) - Deployment procedures
- [backend/DETAILED_BACKEND_GUIDE.md](../backend/DETAILED_BACKEND_GUIDE.md) - Server configuration
- [frontend/DETAILED_FRONTEND_GUIDE.md](../frontend/DETAILED_FRONTEND_GUIDE.md) - Build & deployment
- [11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md) - Operations & troubleshooting

---

### By Task

#### Setting Up Development Environment
1. [02_TECHNOLOGY_STACK.md](02_TECHNOLOGY_STACK.md) - Prerequisites
2. [10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md) - Development Setup section

#### Deploying to Production
1. [10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md) - Production Deployment section
2. [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md) - Security checklist

#### Understanding the 3-Tier Admin Hierarchy
1. [06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md)
2. [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md) - Permission Classes
3. [05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md) - Role-based Access

#### API Integration
1. [07_API_REFERENCE.md](07_API_REFERENCE.md) - Endpoint reference
2. [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md) - Auth flow
3. [05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md) - Frontend implementation

#### Troubleshooting Issues
1. [11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md)
2. [10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md) - Monitoring section

---

## Key Concepts

### 3-Tier Admin Hierarchy

| Tier | Type | Access | Features |
|------|------|--------|----------|
| 1 | Super Admin | All complaints, all departments | Department management, analytics |
| 2 | Department Admin | Department complaints only | Officer management, ward assignment |
| 3 | BMC Officer | Ward complaints only | Status updates, complaint details |
| 4 | Citizen | Own complaints only | Report issues, track status |

See: [06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md)

---

### Data Flow

```
Citizen Reports Issue
        ↓
[Complaints API - POST]
        ↓
[Backend - Create Complaint Model]
        ↓
[Database - Store in Complaints Table]
        ↓
[Notifications - Trigger to Department]
        ↓
[Admin Dashboard - Show to Department Admin]
        ↓
[Assign to Officer]
        ↓
[Officer Dashboard - Officer assigns resources]
        ↓
[Status Update - Work in progress]
        ↓
[Resolution - Mark complete]
        ↓
[Citizen Notification - Update sent]
        ↓
[Feedback - Citizen rates response]
```

---

### Technology Stack Summary

**Backend:**
- Framework: Django 4.2+
- API: Django REST Framework 3.14+
- Database: PostgreSQL 14+ (Production)
- Task Queue: Celery + Redis
- Authentication: SimpleJWT
- Validation: Django Validators

**Frontend:**
- Framework: React 18.x
- Build: Vite 5.x
- Styling: Tailwind CSS 3.x
- State: React Context API
- Maps: Leaflet 1.9.x
- HTTP: Axios + TanStack Query
- Routing: React Router v6

**DevOps:**
- Containerization: Docker
- Orchestration: Docker Compose
- Web Server: Nginx
- SSL: Let's Encrypt

---

## Common Workflows

### Deploying a Change

1. Develop and test locally (see [10_DEPLOYMENT_GUIDE.md](10_DEPLOYMENT_GUIDE.md))
2. Create Docker images
3. Push to registry
4. Update docker-compose.yml
5. Run `docker-compose up -d`
6. Run migrations: `docker-compose exec backend python manage.py migrate`
7. Check health: `docker logs backend`

---

### Adding a New API Endpoint

1. Create model in `apps/*/models.py`
2. Create serializer in `apps/*/serializers.py`
3. Create viewset in `apps/*/views.py`
4. Register route in `urls.py`
5. Add permission class if needed
6. Document in [07_API_REFERENCE.md](07_API_REFERENCE.md)
7. Update frontend API client
8. Create frontend component
9. Add route if needed
10. Test with all user roles

See: [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md) and [05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md)

---

### Debugging a Permission Issue

1. Check user role: [06_3TIER_ADMIN_HIERARCHY.md](06_3TIER_ADMIN_HIERARCHY.md)
2. Verify permission class: [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md)
3. Check frontend role utilities: [05_FRONTEND_IMPLEMENTATION.md](05_FRONTEND_IMPLEMENTATION.md)
4. Review filtering logic: [04_BACKEND_IMPLEMENTATION.md](04_BACKEND_IMPLEMENTATION.md)
5. Check authentication: [09_AUTHENTICATION_AND_AUTHORIZATION.md](09_AUTHENTICATION_AND_AUTHORIZATION.md)
6. See troubleshooting: [11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md)

---

## File Cross-References

### Models Referenced
- User model: 04_BACKEND_IMPLEMENTATION.md, 08_DATABASE_SCHEMA.md, 09_AUTH
- Complaint model: 04_BACKEND_IMPLEMENTATION.md, 08_DATABASE_SCHEMA.md, 06_3TIER
- Department model: 04_BACKEND_IMPLEMENTATION.md, 08_DATABASE_SCHEMA.md
- Officer model: 04_BACKEND_IMPLEMENTATION.md, 08_DATABASE_SCHEMA.md, 06_3TIER

### Permission Classes Referenced
- IsSuperAdmin: 06_3TIER_ADMIN_HIERARCHY.md, 04_BACKEND_IMPLEMENTATION.md
- IsDepartmentAdmin: 06_3TIER_ADMIN_HIERARCHY.md, 04_BACKEND_IMPLEMENTATION.md
- HasDepartmentAccess: 06_3TIER_ADMIN_HIERARCHY.md, 04_BACKEND_IMPLEMENTATION.md

### API Endpoints Referenced
- Authentication: 07_API_REFERENCE.md, 09_AUTHENTICATION_AND_AUTHORIZATION.md
- Complaints: 07_API_REFERENCE.md, 05_FRONTEND_IMPLEMENTATION.md
- Departments: 07_API_REFERENCE.md, 04_BACKEND_IMPLEMENTATION.md
- Analytics: 07_API_REFERENCE.md, 04_BACKEND_IMPLEMENTATION.md

---

## Updates & Maintenance

All documentation files are in the `docs/` directory and should be kept in sync with code changes:

- Update API docs when changing endpoints
- Update database schema when modifying models
- Update deployment guide when changing infrastructure
- Update troubleshooting when fixing known issues
- Update architecture docs for major refactoring

---

## Related Documentation

Also see in the repository:
- `backend/README.md` - Backend-specific setup
- `backend/docs/` - Backend feature docs
- `frontend/README.md` - Frontend-specific setup
- `docs/VIDEO_SCRIPT_COPYRIGHT_DEMO.md` - Copyright demonstration script
- `docs/TECHNICAL_DOCUMENTATION.md` - Consolidated technical reference (deprecated)

---

## Contact & Support

For documentation issues or improvements:
1. Check [11_TROUBLESHOOTING_AND_FAQ.md](11_TROUBLESHOOTING_AND_FAQ.md)
2. Review related documentation files
3. Check Django/React official documentation
4. Consult backend logs: `docker-compose logs -f backend`
5. Consult frontend console (browser DevTools)

---

## Version Information

**Documentation Version**: 3.0
**Last Updated**: 2025-12-04
**System Version**: 1.0.0
**Django Version**: 4.2+
**React Version**: 18.x
**Python Version**: 3.10+
**Node Version**: 18+

## Complete Document List

### Core Documentation (12 files in `/docs/`)
1. `00_DOCUMENTATION_INDEX.md` - This file (master index)
2. `01_SYSTEM_OVERVIEW.md` - Project overview and features
3. `02_TECHNOLOGY_STACK.md` - Technology selection and architecture
4. `03_ARCHITECTURE_AND_STRUCTURE.md` - System architecture and structure
5. `04_BACKEND_IMPLEMENTATION.md` - Backend implementation details
6. `05_FRONTEND_IMPLEMENTATION.md` - Frontend implementation details
7. `06_3TIER_ADMIN_HIERARCHY.md` - Role-based access control
8. `07_API_REFERENCE.md` - Complete API documentation
9. `08_DATABASE_SCHEMA.md` - Database schema and structure
10. `09_AUTHENTICATION_AND_AUTHORIZATION.md` - Auth and security
11. `10_DEPLOYMENT_GUIDE.md` - Deployment procedures
12. `11_TROUBLESHOOTING_AND_FAQ.md` - Troubleshooting and FAQs
13. `12_FRONTEND_BACKEND_INTEGRATION.md` - Integration guide

### Folder-Specific Guides (2 additional files)
1. `backend/DETAILED_BACKEND_GUIDE.md` - Complete backend development guide
2. `frontend/DETAILED_FRONTEND_GUIDE.md` - Complete frontend development guide

**Total**: 15 comprehensive documentation files covering all aspects of the system

