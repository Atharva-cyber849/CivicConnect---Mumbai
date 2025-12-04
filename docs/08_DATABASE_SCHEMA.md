# 8. Database Schema

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      User        │       │    Department    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ email (UQ)       │       │ name (UQ)        │
│ username (UQ)    │       │ description      │
│ first_name       │       │ email            │
│ last_name        │       │ phone            │
│ role             │       │ head_id (FK)     │
│ is_superuser     │       │ categories       │
│ is_staff         │       │ is_active        │
│ is_active        │       │ created_at       │
│ phone            │       │ updated_at       │
│ ward             │       └─────────┬────────┘
│ address          │                 │
│ pincode          │                 │ 1:N
│ latitude         │                 │
│ longitude        │         ┌───────▼────────┐
│ language_pref    │         │ DepartmentStaff│
│ has_terms        │         ├────────────────┤
│ is_email_verified│         │ id (PK)        │
│ profile_picture  │         │ department_id  │
│ created_at       │         │ user_id        │
│ updated_at       │         │ role           │
└────────┬─────────┘         │ joined_at      │
         │                   └────────────────┘
         │ 1:1
         ▼
    ┌──────────────┐
    │   Officer    │
    ├──────────────┤
    │ id (PK)      │
    │ user_id (FK) │
    │ department_id│
    │ assigned_ward│
    │ role         │
    │ designation  │
    │ phone        │
    │ email        │
    │ complaints..│
    │ avg_time     │
    │ is_active    │
    │ created_at   │
    └──────────────┘
         │
         │ 1:N
         │
    ┌────▼─────────────┐
    │   Complaint      │
    ├──────────────────┤
    │ id (PK)          │
    │ title            │
    │ description      │
    │ category         │
    │ user_id (FK)     │
    │ department_id    │
    │ assigned_to_id   │
    │ status           │
    │ priority         │
    │ address          │
    │ ward             │
    │ city             │
    │ state            │
    │ zip_code         │
    │ latitude         │
    │ longitude        │
    │ image            │
    │ admin_notes      │
    │ created_at       │
    │ updated_at       │
    │ resolved_at      │
    └────┬─────────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
    ▼         ▼          ▼          ▼
┌────────┐┌─────────┐┌──────────┐┌─────────┐
│Timeline││  Image  ││Update    ││ Notes   │
└────────┘└─────────┘└──────────┘└─────────┘
```

---

## Tables

### Users Table
```sql
CREATE TABLE auth_user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    password VARCHAR(128) NOT NULL,
    role VARCHAR(20) DEFAULT 'CITIZEN',
    is_superuser BOOLEAN DEFAULT FALSE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(10),
    ward VARCHAR(5),
    address TEXT,
    pincode VARCHAR(6),
    latitude FLOAT,
    longitude FLOAT,
    language_preference VARCHAR(2) DEFAULT 'EN',
    has_accepted_terms BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(100),
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Departments Table
```sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    email VARCHAR(254),
    phone VARCHAR(15),
    head_id INTEGER REFERENCES auth_user(id),
    categories JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Officers Table
```sql
CREATE TABLE officers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES auth_user(id),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    assigned_ward VARCHAR(10) NOT NULL,
    role VARCHAR(20),
    designation VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(254),
    complaints_handled INTEGER DEFAULT 0,
    average_resolution_time FLOAT DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, department_id)
);
```

---

### Complaints Table
```sql
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES auth_user(id),
    department_id INTEGER REFERENCES departments(id),
    assigned_to_id INTEGER REFERENCES auth_user(id),
    assigned_officer_id INTEGER REFERENCES auth_user(id),
    status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    address TEXT NOT NULL,
    ward VARCHAR(10) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(10),
    latitude FLOAT,
    longitude FLOAT,
    image VARCHAR(100),
    public_update TEXT,
    admin_notes TEXT,
    estimated_resolution_days INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
```

---

### Complaint Images Table
```sql
CREATE TABLE complaint_images (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Complaint Timeline Table
```sql
CREATE TABLE complaint_timeline (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    updated_by_id INTEGER REFERENCES auth_user(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Complaint Updates Table
```sql
CREATE TABLE complaint_updates (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES auth_user(id),
    message TEXT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Officer Notes Table
```sql
CREATE TABLE officer_notes (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    officer_id INTEGER REFERENCES auth_user(id),
    notes TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_ward ON complaints(ward);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_officers_department ON officers(department_id);
CREATE INDEX idx_officers_ward ON officers(assigned_ward);
CREATE INDEX idx_timeline_complaint ON complaint_timeline(complaint_id, created_at DESC);
CREATE INDEX idx_updates_complaint ON complaint_updates(complaint_id, created_at DESC);
```

---

## Constraints

| Table | Constraint | Details |
|-------|-----------|---------|
| auth_user | email | UNIQUE, required |
| auth_user | username | UNIQUE |
| departments | name | UNIQUE |
| officers | user_id | UNIQUE |
| officers | user_id, department_id | UNIQUE combination |
| complaints | title | NOT NULL |
| complaints | description | NOT NULL |

---

## Data Types

| Type | Usage |
|------|-------|
| SERIAL | Auto-incrementing IDs |
| VARCHAR(n) | Short strings |
| TEXT | Long text content |
| BOOLEAN | True/False values |
| FLOAT | Coordinates (lat/long) |
| TIMESTAMP | Date/time values |
| JSONB | JSON objects (PostgreSQL) |
| INTEGER | Foreign keys |

---

## Migration Strategy

### Development
Uses SQLite automatically

### Production
1. Create PostgreSQL database
2. Run migrations: `python manage.py migrate`
3. Create superuser: `python manage.py createsuperuser`
4. Collect static: `python manage.py collectstatic`

