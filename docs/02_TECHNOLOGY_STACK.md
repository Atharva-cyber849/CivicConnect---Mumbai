# 2. Technology Stack

## Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Core programming language |
| **Django** | 4.2+ | Web framework |
| **Django REST Framework** | 3.14+ | RESTful API development |
| **SQLite** | 3.x | Development database |
| **PostgreSQL** | 14+ | Production database |
| **JWT (SimpleJWT)** | 5.x | JWT authentication |
| **Celery** | 5.x | Async task processing |
| **Redis** | 7.x | Caching & message broker |
| **Pillow** | 9.x+ | Image processing |
| **django-cors-headers** | 4.x | CORS handling |
| **drf-spectacular** | 0.26+ | API documentation |

---

## Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library |
| **Vite** | 5.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **React Router** | 6.x | Client-side routing |
| **TanStack Query** | 5.x | Server state management |
| **Leaflet** | 1.9.x | Interactive maps |
| **Axios** | 1.x | HTTP client |
| **Recharts** | 2.x | Chart library |
| **Lucide React** | - | Icon library |
| **React Hot Toast** | Latest | Toast notifications |
| **React Hook Form** | 7.x | Form handling |

---

## DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy & static file serving |
| **GitHub** | Version control & CI/CD |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **npm** | Node package manager |
| **pip** | Python package manager |
| **Pytest** | Testing framework |
| **Black** | Python code formatter |
| **ESLint** | JavaScript linter |
| **Postman** | API testing |

---

## System Requirements

### Backend
- Python 3.11+
- PostgreSQL 14+ (Production)
- Redis 7+ (for caching)
- 2GB RAM minimum
- 10GB storage

### Frontend
- Node.js 16+
- npm 8+
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## Architecture Overview

```
┌─────────────────────────────────┐
│      Frontend (React)            │
│      - React Router              │
│      - TanStack Query            │
│      - Tailwind CSS              │
│      - Leaflet Maps              │
└──────────────┬──────────────────┘
               │
        REST API (Axios)
               │
┌──────────────▼──────────────────┐
│   Backend (Django + DRF)         │
│   - JWT Authentication           │
│   - Role-Based Permissions       │
│   - REST Endpoints               │
│   - Background Tasks (Celery)    │
└──────────────┬──────────────────┘
               │
      ┌────────┴────────┐
      │                 │
┌─────▼──────┐   ┌──────▼───────┐
│  Database  │   │   Redis      │
│ PostgreSQL │   │   Cache      │
└────────────┘   └──────────────┘
```

