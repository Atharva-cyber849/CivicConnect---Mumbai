# 3. Architecture and Directory Structure

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                     React + Vite (Port 5173)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Citizen   │  │ BMC Officer │  │  Dept Admin │  │Super Admin │ │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │  │ Dashboard  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                         API Layer (Axios)                            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ REST API
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND                                    │
│                   Django REST Framework (Port 8000)                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │    Users    │  │ Complaints  │  │ Departments │  │Notifications││
│  │     App     │  │     App     │  │     App     │  │    App     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Permissions Layer                        │   │
│  │   IsSuperAdmin │ IsDepartmentAdmin │ HasDepartmentAccess    │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        Database (SQLite/PostgreSQL)                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```
Snap & Report/
│
├── backend/
│   ├── apps/
│   │   ├── users/                     # User management & authentication
│   │   │   ├── __init__.py
│   │   │   ├── admin.py              # Django admin configuration
│   │   │   ├── models.py             # User, Officer models
│   │   │   ├── views.py              # User API viewsets
│   │   │   ├── serializers.py        # User serializers
│   │   │   ├── serializers_jwt.py    # JWT-specific serializers
│   │   │   ├── permissions.py        # Custom permission classes
│   │   │   ├── urls.py               # User routes
│   │   │   └── tests.py              # Unit tests
│   │   │
│   │   ├── complaints/               # Complaint management
│   │   │   ├── __init__.py
│   │   │   ├── models.py             # Complaint, Timeline, Resolution, etc.
│   │   │   ├── views.py              # Complaint CRUD viewsets
│   │   │   ├── serializers.py        # Complaint serializers
│   │   │   ├── analytics_views.py    # Analytics endpoints
│   │   │   ├── mumbai_utils.py       # Mumbai-specific utilities
│   │   │   ├── urls.py               # Complaint routes
│   │   │   └── tests.py              # Unit tests
│   │   │
│   │   ├── departments/              # Department management
│   │   │   ├── __init__.py
│   │   │   ├── models.py             # Department, DepartmentStaff models
│   │   │   ├── views.py              # Department API views
│   │   │   ├── serializers.py        # Department serializers
│   │   │   ├── urls.py               # Department routes
│   │   │   └── tests.py              # Unit tests
│   │   │
│   │   └── notifications/            # Notification system
│   │       ├── __init__.py
│   │       ├── models.py             # Notification models
│   │       ├── views.py              # Notification views
│   │       ├── serializers.py        # Notification serializers
│   │       └── urls.py               # Notification routes
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── settings.py               # Django settings & configuration
│   │   ├── urls.py                   # Root URL routing
│   │   ├── wsgi.py                   # WSGI application
│   │   ├── asgi.py                   # ASGI application
│   │   ├── middleware.py             # Custom middleware
│   │   └── celery.py                 # Celery configuration
│   │
│   ├── media/                        # Uploaded files (complaints, profiles)
│   ├── static/                       # Static files
│   ├── templates/                    # Email templates
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies
│   ├── db.sqlite3                    # Development database
│   └── README.md                     # Backend README
│
├── frontend/
│   ├── src/
│   │   ├── api/                      # API integration layer
│   │   │   ├── axiosConfig.js       # Axios configuration
│   │   │   ├── authApi.js           # Authentication endpoints
│   │   │   ├── complaintsApi.js     # Complaints endpoints
│   │   │   ├── departmentsApi.js    # Departments endpoints
│   │   │   ├── officersApi.js       # Officers endpoints
│   │   │   ├── adminApi.js          # Admin endpoints
│   │   │   ├── reportsApi.js        # Reports endpoints
│   │   │   └── notificationsApi.js  # Notifications endpoints
│   │   │
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin/               # Admin-specific components
│   │   │   ├── analytics/           # Analytics components
│   │   │   ├── Auth/                # Authentication components
│   │   │   ├── Common/              # Common components
│   │   │   ├── Inputs/              # Form input components
│   │   │   ├── Layout/              # Layout components
│   │   │   ├── mobile/              # Mobile-specific components
│   │   │   ├── officer/             # Officer-specific components
│   │   │   └── Settings/            # Settings components
│   │   │
│   │   ├── context/                 # React context providers
│   │   │   ├── AuthContext.jsx      # Authentication context
│   │   │   ├── ThemeContext.jsx     # Theme context
│   │   │   ├── NotificationContext.jsx
│   │   │   └── LanguageContext.jsx  # Multi-language support
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js           # Auth hook
│   │   │   ├── useMobile.js         # Mobile detection hook
│   │   │   └── ... other hooks
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin pages
│   │   │   │   ├── AdminPortal.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ComplaintsList.jsx
│   │   │   │   ├── ComplaintDetails.jsx
│   │   │   │   ├── OfficerManagement.jsx
│   │   │   │   ├── MumbaiBMCAnalytics.jsx
│   │   │   │   ├── BMCZoneManagement.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── ... more admin pages
│   │   │   │
│   │   │   ├── citizen/             # Citizen pages
│   │   │   │   ├── LandingPage.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ReportIssue.jsx
│   │   │   │   ├── MyComplaints.jsx
│   │   │   │   ├── ComplaintDetail.jsx
│   │   │   │   └── ... more citizen pages
│   │   │   │
│   │   │   └── officer/             # Officer pages
│   │   │       ├── BMCOfficerDashboard.jsx
│   │   │       └── ... more officer pages
│   │   │
│   │   ├── routes/                  # Routing configuration
│   │   │   ├── AppRouter.jsx        # Main router
│   │   │   ├── AdminRoutes.jsx      # Admin routes
│   │   │   ├── CitizenRoutes.jsx    # Citizen routes
│   │   │   └── withAdminAuth.js     # Route protection
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── roleBasedAccess.js   # Role checking utilities
│   │   │   ├── constants.js         # Application constants
│   │   │   ├── validation.js        # Form validation
│   │   │   ├── mapUtils.js          # Map utilities
│   │   │   └── ... more utilities
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   ├── constants.js         # Global constants
│   │   │   └── axios.js             # Axios config
│   │   │
│   │   ├── store/                   # State management
│   │   ├── i18n/                    # Internationalization
│   │   ├── locales/                 # Language files
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── public/                      # Static assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── ... static files
│   │
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── nginx.conf
│   └── README.md
│
├── docs/                            # Documentation
│   ├── 01_SYSTEM_OVERVIEW.md
│   ├── 02_TECHNOLOGY_STACK.md
│   ├── 03_ARCHITECTURE_AND_STRUCTURE.md
│   ├── 04_BACKEND_IMPLEMENTATION.md
│   ├── 05_FRONTEND_IMPLEMENTATION.md
│   ├── 06_3TIER_ADMIN_HIERARCHY.md
│   ├── 07_API_REFERENCE.md
│   ├── 08_DATABASE_SCHEMA.md
│   ├── 09_AUTHENTICATION_AND_AUTHORIZATION.md
│   ├── 10_MUMBAI_SPECIFIC_FEATURES.md
│   ├── 11_TEST_CREDENTIALS.md
│   ├── 12_DEPLOYMENT.md
│   └── VIDEO_SCRIPT_COPYRIGHT_DEMO.md
│
├── docker-compose.yml               # Docker Compose configuration
├── .gitignore
├── LICENSE
└── README.md                        # Project README
```

---

## Key Directories Explained

### Backend Structure

- **apps/**: Django apps organized by domain
- **core/**: Core Django configuration
- **media/**: User uploads
- **static/**: Static assets

### Frontend Structure

- **api/**: API client layer (all API calls)
- **components/**: Reusable React components
- **context/**: Global state (Auth, Theme, etc.)
- **pages/**: Full-page components
- **routes/**: Router configuration
- **utils/**: Helper functions
- **config/**: Configuration constants

