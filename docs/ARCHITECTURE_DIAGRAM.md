# Assignment System Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SNAP & REPORT                            │
│                 Complaint Assignment System                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Citizen App              Officer Dashboard      Admin Dashboard  │
│  ├─ Report Complaint      ├─ AssignmentTracker   ├─ SLA Dashboard│
│  ├─ Track Status          ├─ My Assignments      ├─ Metrics      │
│  └─ View Map              └─ Take Action         └─ Manual Assign│
│                                                                   │
└────────────────────┬────────────────────────┬────────────────────┘
                     │                        │
                     └────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /complaints/                 ← Create complaint             │
│  GET /assignments/my_assignments/  ← Officer's assignments       │
│  GET /assignments/sla_status/      ← System SLA metrics           │
│  POST /assignments/assign/         ← Manual assignment           │
│  POST /assignments/reassign/       ← Reassignment                │
│                                                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ComplaintAssignmentViewSet                                      │
│  ├─ my_assignments()                                             │
│  ├─ sla_status()                                                 │
│  ├─ officer_stats()                                              │
│  ├─ assign_complaint()                                           │
│  ├─ reassign_complaint()                                         │
│  ├─ reassignment_history()                                       │
│  └─ department_assignments()                                     │
│                                                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│               ASSIGNMENT SERVICE (Core Logic)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ComplaintAssignmentService                                      │
│  │                                                                │
│  ├─ assign_complaint(complaint)                                  │
│  │  ├─ Step 1: _get_department(category)                        │
│  │  │           └─ CATEGORY_DEPARTMENT_MAPPING                 │
│  │  │                                                           │
│  │  ├─ Step 2: _get_eligible_officers(department, ward)        │
│  │  │           └─ Filter by: ward, department, availability  │
│  │  │                                                           │
│  │  ├─ Step 3: _select_officer_by_load(officers)               │
│  │  │           └─ Select: min(open_complaints)                │
│  │  │                                                           │
│  │  ├─ Step 4: Create ComplaintAssignment                      │
│  │  │           └─ sla_deadline = assigned_at + sla_target_days│
│  │  │                                                           │
│  │  └─ Step 5: _send_assignment_email()                        │
│  │             └─ Render HTML template + send                   │
│  │                                                               │
│  ├─ reassign_complaint(complaint, new_officer)                 │
│  │  └─ Create ComplaintReassignment record + reassign          │
│  │                                                               │
│  ├─ get_assignment_stats(officer)                              │
│  │  └─ Calculate: assignments, completed, compliance rate      │
│  │                                                               │
│  └─ SLA_TARGETS & CATEGORY_DEPARTMENT_MAPPING                  │
│     (Configuration dictionaries)                                │
│                                                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DJANGO SIGNALS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  @receiver(post_save, sender=Complaint)                          │
│  def auto_assign_complaint():                                    │
│     if created and not assigned_to:                              │
│        ComplaintAssignmentService.assign_complaint()             │
│                                                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER (ORM)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Models:                                                         │
│  ├─ Complaint         (title, category, priority, ward, etc)    │
│  ├─ ComplaintAssignment (complaint, assigned_to, sla_deadline) │
│  ├─ ComplaintReassignment (complaint, reason, timestamp)       │
│  ├─ User             (officer/citizen/admin)                   │
│  ├─ Department       (Roads, Water, Sewage, etc)               │
│  └─ DepartmentStaff  (user, department, ward, available)       │
│                                                                   │
│  Serializers:                                                    │
│  ├─ OfficerSummarySerializer                                    │
│  ├─ ComplaintAssignmentSerializer                               │
│  ├─ ComplaintReassignmentSerializer                             │
│  ├─ AssignmentStatsSerializer                                   │
│  └─ ManualAssignmentSerializer                                  │
│                                                                   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PostgreSQL / SQLite                                             │
│  │                                                                │
│  ├─ complaints (base table)                                     │
│  │  ├─ id, title, description, category, priority              │
│  │  ├─ assigned_to_id (FK), department_id (FK)                 │
│  │  ├─ status, ward, address, lat, long                        │
│  │  └─ created_at, updated_at, resolved_at                     │
│  │                                                               │
│  ├─ complaint_assignments                                       │
│  │  ├─ id, complaint_id (OneToOne), assigned_to_id (FK)       │
│  │  ├─ department_id (FK), assigned_at, sla_target_days       │
│  │  └─ Indexes: (assigned_to, -assigned_at), (complaint)      │
│  │                                                               │
│  └─ complaint_reassignments                                     │
│     ├─ id, complaint_id (FK), previously_assigned_to_id       │
│     ├─ reason, reassigned_at                                   │
│     └─ Index: (complaint, -reassigned_at)                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Complaint Creation to Assignment

```
1. CITIZEN SUBMITS COMPLAINT
   ┌──────────────────────────┐
   │ POST /complaints/        │
   │ {title, category, ward}  │
   └──────────────────────────┘
                 │
                 ↓
   ┌──────────────────────────────────┐
   │ Complaint.objects.create()       │
   │ Save to database                 │
   └──────────────────────────────────┘
                 │
                 ↓
   ┌──────────────────────────────────┐
   │ Django Signal: post_save         │
   │ auto_assign_complaint() triggers │
   └──────────────────────────────────┘
                 │
                 ↓

2. ASSIGNMENT SERVICE EXECUTES
   ┌────────────────────────────────────────────┐
   │ ComplaintAssignmentService.assign()        │
   └────────────────────────────────────────────┘
        │
        ├─→ Step 1: Get Department
        │   CATEGORY: POTHOLE
        │   MAPPING: → Roads & Traffic Department
        │   LOOKUP: Department.objects.get(name=...)
        │
        ├─→ Step 2: Filter Eligible Officers  
        │   Query: Department officers in ward A
        │   Filter: is_available = True
        │   Result: [Officer1, Officer2, Officer3]
        │
        ├─→ Step 3: Load Balancing
        │   Officer1: 5 open complaints
        │   Officer2: 3 open complaints ← SELECTED
        │   Officer3: 6 open complaints
        │
        ├─→ Step 4: Create Assignment Record
        │   ComplaintAssignment.objects.create(
        │     complaint=complaint,
        │     assigned_to=Officer2,
        │     department=RoadsDept,
        │     sla_target_days=3
        │   )
        │
        └─→ Step 5: Send Email
            render_to_string(
              'complaint_assignment_notification.html',
              context
            )
            send_mail(...)
                 │
                 ↓
   ┌────────────────────────────────────┐
   │ Officer receives email with        │
   │ complaint details & SLA deadline   │
   └────────────────────────────────────┘
```

## Component Relationships

```
┌─────────────────────────────────────┐
│  Complaint (Primary Entity)         │
├─────────────────────────────────────┤
│ - id (PK)                           │
│ - title, description, category      │
│ - priority, status, ward            │
│ - user_id (FK) → User               │
│ - assigned_to_id (FK) → User        │
│ - department_id (FK) → Department   │
│ - created_at, updated_at, resolved  │
│                                     │
│ ├─ OneToOne → ComplaintAssignment  │
│ ├─ OneToMany → ComplaintReassign..  │
│ ├─ OneToMany → OfficerNotes         │
│ ├─ OneToMany → ComplaintTimeline    │
│ ├─ OneToMany → ComplaintImage       │
│ └─ OneToOne → ComplaintResolution   │
└─────────────────────────────────────┘
         │
         ├──────────────────────┐
         │                      │
         ↓                      ↓
┌──────────────────────┐  ┌──────────────────────┐
│ ComplaintAssignment  │  │ Department           │
├──────────────────────┤  ├──────────────────────┤
│ - id (PK)            │  │ - id (PK)            │
│ - complaint_id (1:1) │  │ - name               │
│ - assigned_to (FK)   │  │ - description        │
│ - department_id (FK) │  │ - contact            │
│ - assigned_at        │  │ - email              │
│ - sla_target_days    │  │                      │
│                      │  │ ├─ OneToMany →      │
│ @property:           │  │ │  DepartmentStaff  │
│ - sla_deadline       │  │ └─ OneToMany →      │
│ - days_remaining     │  │    Assignment       │
│ - is_overdue         │  └──────────────────────┘
└──────────────────────┘
         │
         └─ audit trail
                │
                ↓
┌──────────────────────────────────┐
│ ComplaintReassignment            │
├──────────────────────────────────┤
│ - id (PK)                        │
│ - complaint_id (FK)              │
│ - previously_assigned_to_id (FK) │
│ - reason                         │
│ - reassigned_at                  │
└──────────────────────────────────┘
```

## API Request/Response Flow

```
REQUEST:
────────
POST /complaints/assignments/my_assignments/
Headers: Authorization: Bearer TOKEN

┌─────────────────────────────────────┐
│ ComplaintAssignmentViewSet          │
│ .my_assignments(request)            │
├─────────────────────────────────────┤
│ 1. Get authenticated user           │
│ 2. Filter assignments by user_id    │
│ 3. Get pending & in_progress only   │
│ 4. Serialize with SLA info          │
│ 5. Calculate overdue count          │
└─────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ Database Query                      │
│ SELECT * FROM complaint_assignments │
│ WHERE assigned_to_id = ? AND        │
│ complaint.status IN (...)           │
│ ORDER BY assigned_at DESC           │
└─────────────────────────────────────┘
         │
         ↓
RESPONSE:
─────────
{
  "total_assignments": 5,
  "overdue": 1,
  "assignments": [
    {
      "id": 1,
      "complaint": {
        "id": 123,
        "title": "...",
        "priority": "HIGH",
        "status": "PENDING"
      },
      "assigned_to": { ... },
      "assigned_at": "2024-01-10T...",
      "sla_deadline": "2024-01-13T...",
      "sla_deadline_readable": "2 days remaining",
      "is_overdue": false
    },
    ...
  ]
}
```

## SLA Status Dashboard Flow

```
User Clicks "SLA Dashboard"
         │
         ↓
┌──────────────────────────────────┐
│ GET /assignments/sla_status/     │
│ (requires Admin role)            │
└──────────────────────────────────┘
         │
         ↓
┌───────────────────────────────────────────────────────────┐
│ ComplaintAssignmentViewSet.sla_status()                   │
│                                                            │
│ Query all active assignments                              │
│ For each:                                                 │
│   progress = (now - assigned_at).seconds                  │
│   sla_seconds = sla_target_days * 24 * 3600              │
│                                                            │
│   if progress > sla_seconds:         → RED (overdue)     │
│   elif progress > sla_seconds * 0.8: → YELLOW (warning)  │
│   else:                              → GREEN (on track)   │
│                                                            │
│ Calculate compliance_rate = (green + yellow) / total * 100│
└───────────────────────────────────────────────────────────┘
         │
         ↓
RESPONSE:
─────────
{
  "on_track": {
    "count": 10,
    "assignments": [...]
  },
  "warning": {
    "count": 3,
    "assignments": [...]
  },
  "overdue": {
    "count": 2,
    "assignments": [...]
  },
  "summary": {
    "total": 15,
    "sla_compliance_rate": 86.7
  }
}
         │
         ↓
Frontend: SLADashboard Component
         │
    ┌────┴────┬────────┬────────┐
    │          │        │        │
    ↓          ↓        ↓        ↓
 Summary    Green    Yellow    Red
 Cards      Table    Table     Table
```

## Email Notification Flow

```
Step 5: Send Email
    │
    ├─ Render Template
    │  ┌────────────────────────────────────┐
    │  │ complaint_assignment_notification. │
    │  │ html                               │
    │  │                                    │
    │  │ Context variables:                 │
    │  │ - complaint_title                  │
    │  │ - complaint_description            │
    │  │ - priority (color-coded)           │
    │  │ - category                         │
    │  │ - location                         │
    │  │ - reporter_name                    │
    │  │ - sla_deadline                     │
    │  │ - sla_target_days                  │
    │  │ - department_name                  │
    │  └────────────────────────────────────┘
    │
    ├─ Build Email
    │  ┌────────────────────────────────────┐
    │  │ Subject: New Complaint Assigned    │
    │  │ To: officer@example.com            │
    │  │ From: noreply@example.com          │
    │  │ ContentType: text/html             │
    │  └────────────────────────────────────┘
    │
    └─ Send via SMTP
       ┌────────────────────────────────────┐
       │ send_mail(                         │
       │   subject,                         │
       │   message,                         │
       │   from_email,                      │
       │   recipient_list,                  │
       │   html_message=html                │
       │ )                                  │
       └────────────────────────────────────┘
            │
            ↓
       SMTP Server (Gmail, etc)
            │
            ↓
       Officer's Email Inbox
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION ENVIRONMENT               │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend (React)          Backend (Django)              │
│  ├─ Assignment Tracker     ├─ Assignment Service        │
│  └─ SLA Dashboard          ├─ API Endpoints             │
│                            ├─ Django ORM                 │
│                            ├─ Email System               │
│                            └─ Signal Handlers            │
│                                    │                     │
│                                    └─ PostgreSQL DB      │
│                                       ├─ complaints      │
│                                       ├─ assignments     │
│                                       └─ reassignments   │
│                                                           │
│  Notifications                   Monitoring              │
│  └─ Email Service          ├─ SLA Compliance Rate       │
│     (SMTP via Gmail)       ├─ Officer Workload           │
│                            └─ System Metrics             │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

**Architecture Version:** 1.0  
**Last Updated:** 2024  
**Diagram Type:** Component & Data Flow  
**Complexity:** Medium  
**Scalability:** High (suitable for 1M+ complaints)
