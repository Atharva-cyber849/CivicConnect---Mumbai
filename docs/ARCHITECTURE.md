# 🏗️ Snap & Report - System Architecture Diagram

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                         🌐 INTERNET / PUBLIC ACCESS                             │
│                                                                                 │
└──────────────────────────────────┬──────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
         ┌──────────▼─────────┐        ┌─────────▼────────┐
         │   CITIZEN USER     │        │   ADMIN USER     │
         │   (Browser/App)    │        │   (Browser)      │
         └──────────┬─────────┘        └─────────┬────────┘
                    │                            │
                    └────────────┬───────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │   🎨 FRONTEND       │
                      │   React + Vite      │
                      │   Port: 5173        │
                      └──────────┬──────────┘
                                 │
                                 │ REST API Calls
                                 │ (JSON/HTTPS)
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        │    ┌───────────────────▼───────────────────┐   │
        │    │   🔐 AUTHENTICATION LAYER             │   │
        │    │   JWT Token Validation                │   │
        │    │   Role-Based Access Control           │   │
        │    └───────────────────┬───────────────────┘   │
        │                        │                        │
        │    ┌───────────────────▼───────────────────┐   │
        │    │   🧱 BACKEND API (Django REST)        │   │
        │    │   Port: 8000                          │   │
        │    │                                       │   │
        │    │   ┌─────────────────────────────┐    │   │
        │    │   │  📱 APPS                    │    │   │
        │    │   │  ├── Users                  │    │   │
        │    │   │  ├── Complaints             │    │   │
        │    │   │  ├── Departments            │    │   │
        │    │   │  └── Notifications          │    │   │
        │    │   └─────────────────────────────┘    │   │
        │    │                                       │   │
        │    └───────┬───────────┬───────────┬──────┘   │
        │            │           │           │          │
        └────────────┼───────────┼───────────┼──────────┘
                     │           │           │
        ┌────────────▼──┐   ┌────▼────┐   ┌─▼────────────────┐
        │               │   │         │   │                  │
        │  🗃️ DATABASE  │   │  💾     │   │  🤖 AI SERVICE   │
        │  PostgreSQL   │   │  REDIS  │   │  FastAPI         │
        │  + PostGIS    │   │         │   │  Port: 8001      │
        │  Port: 5432   │   │ Port:   │   │                  │
        │               │   │  6379   │   │  ┌─────────────┐ │
        │  ┌─────────┐  │   │         │   │  │ Image Model │ │
        │  │  Users  │  │   │  Cache  │   │  │    (CNN)    │ │
        │  │Complaints│  │   │  Tasks  │   │  └─────────────┘ │
        │  │Departments│ │   └────┬────┘   │  ┌─────────────┐ │
        │  │ Updates  │  │        │        │  │ Text Model  │ │
        │  └─────────┘  │        │        │  │   (NLP)     │ │
        └───────────────┘        │        │  └─────────────┘ │
                                 │        └──────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   ⚙️ CELERY WORKERS     │
                    │                         │
                    │  ├── Email Tasks        │
                    │  ├── AI Processing      │
                    │  ├── Notifications      │
                    │  └── Background Jobs    │
                    └─────────────────────────┘


                    ┌─────────────────────────┐
                    │   ☁️ EXTERNAL SERVICES  │
                    │                         │
                    │  ├── AWS S3 (Storage)   │
                    │  ├── SMTP (Email)       │
                    │  ├── Sentry (Monitoring)│
                    │  └── Maps API           │
                    └─────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Complaint Submission Flow

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Citizen │         │ Frontend │         │ Backend  │         │ Database │
└────┬────┘         └─────┬────┘         └─────┬────┘         └─────┬────┘
     │                    │                    │                    │
     │  Fill Form         │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │  Upload Photo      │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │  Submit            │  POST /complaints  │                    │
     ├───────────────────>├───────────────────>│                    │
     │                    │                    │                    │
     │                    │                    │  INSERT complaint  │
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │                    │  Return ID         │
     │                    │                    │<───────────────────┤
     │                    │                    │                    │
     │                    │  201 Created       │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │  Success Message   │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │                    │                    │  Trigger Celery    │
     │                    │                    ├──────────┐         │
     │                    │                    │          │         │
     │                    │                    │<─────────┘         │
     │                    │                    │                    │
     
     
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Celery  │         │    AI    │         │  Email   │
│  Worker  │         │ Service  │         │ Service  │
└─────┬────┘         └─────┬────┘         └─────┬────┘
      │                    │                    │
      │  Process Image     │                    │
      ├───────────────────>│                    │
      │                    │                    │
      │  Return Category   │                    │
      │<───────────────────┤                    │
      │                    │                    │
      │  Send Notification │                    │
      ├────────────────────────────────────────>│
      │                    │                    │
```

### 2. Admin Assignment Flow

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Admin  │         │ Frontend │         │ Backend  │         │ Database │
└────┬────┘         └─────┬────┘         └─────┬────┘         └─────┬────┘
     │                    │                    │                    │
     │  View Complaint    │  GET /complaints/1 │                    │
     ├───────────────────>├───────────────────>│                    │
     │                    │                    │   SELECT complaint │
     │                    │                    ├───────────────────>│
     │                    │                    │   Return data      │
     │                    │                    │<───────────────────┤
     │                    │  200 OK + Data     │                    │
     │                    │<───────────────────┤                    │
     │  Display Details   │                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │  Assign Department │PATCH /complaints/1 │                    │
     ├───────────────────>├───────────────────>│                    │
     │                    │                    │   UPDATE complaint │
     │                    │                    ├───────────────────>│
     │                    │                    │   Return updated   │
     │                    │                    │<───────────────────┤
     │                    │  200 OK            │                    │
     │                    │<───────────────────┤                    │
     │  Success           │                    │                    │
     │<───────────────────┤                    │  Send Email        │
     │                    │                    ├──────────┐         │
     │                    │                    │          │         │
     │                    │                    │<─────────┘         │
```

### 3. AI Classification Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│ Backend  │         │    AI    │         │  Image   │         │   Text   │
│          │         │ Service  │         │  Model   │         │  Model   │
└─────┬────┘         └─────┬────┘         └─────┬────┘         └─────┬────┘
      │                    │                    │                    │
      │  POST /predict     │                    │                    │
      ├───────────────────>│                    │                    │
      │  (image + text)    │                    │                    │
      │                    │                    │                    │
      │                    │  Preprocess Image  │                    │
      │                    ├───────────────────>│                    │
      │                    │                    │                    │
      │                    │  Predict Category  │                    │
      │                    │<───────────────────┤                    │
      │                    │  (POTHOLE, 0.85)   │                    │
      │                    │                    │                    │
      │                    │  Preprocess Text   │                    │
      │                    ├────────────────────────────────────────>│
      │                    │                    │                    │
      │                    │  Predict Category  │                    │
      │                    │<────────────────────────────────────────┤
      │                    │  (POTHOLE, 0.78)   │                    │
      │                    │                    │                    │
      │                    │  Ensemble Results  │                    │
      │                    │  (POTHOLE, 0.88)   │                    │
      │                    │                    │                    │
      │  Return Prediction │                    │                    │
      │<───────────────────┤                    │                    │
      │  {category,        │                    │                    │
      │   confidence}      │                    │                    │
```

---

## Deployment Topology

### Production Environment

```
                           ┌───────────────────┐
                           │   LOAD BALANCER   │
                           │   (AWS ALB/ELB)   │
                           └─────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
          ┌─────────▼────────┐  ┌───▼────┐  ┌────────▼──────┐
          │   Frontend       │  │Backend │  │   AI Service  │
          │   (Vercel)       │  │  EC2   │  │     EC2       │
          │                  │  │Instance│  │   Instance    │
          │  ┌────────────┐  │  │        │  │               │
          │  │ React SPA  │  │  │ Gunicorn│ │   Uvicorn     │
          │  │ + Assets   │  │  │ Django │  │   FastAPI     │
          │  └────────────┘  │  │  API   │  │               │
          └──────────────────┘  └───┬────┘  └───────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
          ┌─────────▼────────┐  ┌──▼───┐  ┌────────▼──────┐
          │   RDS Database   │  │Redis │  │   S3 Bucket   │
          │   PostgreSQL     │  │Cache │  │  Media Files  │
          │   + PostGIS      │  │      │  │    Images     │
          └──────────────────┘  └──────┘  └───────────────┘
```

### Docker Compose (Development)

```
┌──────────────────────────────────────────────────────────────┐
│                    Docker Network                             │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Frontend │  │ Backend  │  │    AI    │  │ Database │    │
│  │Container │  │Container │  │Container │  │Container │    │
│  │ :5173    │  │ :8000    │  │ :8001    │  │ :5432    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │              │             │           │
│  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐    │
│  │  Node.js │  │  Django  │  │ FastAPI  │  │PostgreSQL│    │
│  │   Vite   │  │  + DRF   │  │ PyTorch  │  │ PostGIS  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                      │                            │          │
│                 ┌────┴─────┐              ┌───────┴────┐    │
│                 │  Celery  │              │   Redis    │    │
│                 │  Worker  │              │   :6379    │    │
│                 │Container │              │ Container  │    │
│                 └──────────┘              └────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Layer 1: Network Security                          │    │
│  │  ├── HTTPS/TLS Encryption                          │    │
│  │  ├── CORS Configuration                            │    │
│  │  └── Rate Limiting                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┼─────────────────────────────┐  │
│  │  Layer 2: Authentication                             │  │
│  │  ├── JWT Token System                               │  │
│  │  ├── Password Hashing (PBKDF2)                      │  │
│  │  └── Token Refresh & Blacklisting                   │  │
│  └────────────────────────┼─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┼─────────────────────────────┐  │
│  │  Layer 3: Authorization                              │  │
│  │  ├── Role-Based Access Control (RBAC)               │  │
│  │  ├── Permission Checks                              │  │
│  │  └── Object-Level Permissions                       │  │
│  └────────────────────────┼─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┼─────────────────────────────┐  │
│  │  Layer 4: Application Security                       │  │
│  │  ├── Input Validation                               │  │
│  │  ├── CSRF Protection                                │  │
│  │  ├── XSS Prevention                                 │  │
│  │  └── SQL Injection Prevention (ORM)                 │  │
│  └────────────────────────┼─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │  Layer 5: Data Security                              │  │
│  │  ├── Encrypted Database Connections                 │  │
│  │  ├── Secure File Storage (S3)                       │  │
│  │  └── Audit Logging                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Note**: This architecture is designed to be scalable, secure, and maintainable for production deployment.
