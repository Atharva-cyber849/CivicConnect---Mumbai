# Role-Based Navigation Visual Reference

## 🎨 Navigation Bar Previews

### 1. Citizen Navigation (Blue Theme)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📍 Snap & Report  [Home] [➕Report Issue] [My Complaints] [🔔3] [Map]       │
│                   [Help] [Emergency] [Ward Info] [Profile] [Logout]         │
└─────────────────────────────────────────────────────────────────────────────┘
                                   Primary Action: Report Issue
                                   Mobile FAB: ➕ (Report Issue)
```

**Features**:
- 🔵 Blue gradient background (`from-blue-600 to-blue-700`)
- 🔔 Notification badge showing unread count
- ➕ Highlighted "Report Issue" button
- 📍 Map icon logo
- 📱 Mobile: Hamburger menu + FAB button

---

### 2. Ward Admin Navigation (Green Theme)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🗺️ Ward Admin     [Dashboard] [Ward Complaints ▼] [Ward Map] [Reports]     │
│    Ward A         [Analytics] [Officer Workload] [Citizens] [Profile] [Out] │
└─────────────────────────────────────────────────────────────────────────────┘
                     Ward Complaints Dropdown:
                     ┌─────────────────────┐
                     │ ⏰ Pending          │
                     │ 🔄 In Progress      │
                     │ ✅ Resolved         │
                     │ ⚠️  Unassigned      │
                     └─────────────────────┘
                                   Mobile FAB: 📄 (Export Daily Summary)
```

**Features**:
- 🟢 Green gradient background (`from-green-600 to-green-700`)
- 🗺️ Map icon badge
- Ward name display (e.g., "Ward A")
- Dropdown complaint filters
- 📊 Reports and analytics access

---

### 3. Department Admin Navigation (Orange Theme)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏢 Dept Admin     [Dashboard] [Dept Complaints ▼] [Assign] [Officers]      │
│    Public Works   [Reports] [⏱️SLA] [🔔Escalations] [Map] [Profile] [Out]  │
└─────────────────────────────────────────────────────────────────────────────┘
                     Dept Complaints Dropdown:
                     ┌─────────────────────┐
                     │ ⚠️  Unassigned      │
                     │ 🔄 In Progress      │
                     │ ✅ Resolved         │
                     └─────────────────────┘
                                   Mobile FAB: 👥 (Assign to Officers)
```

**Features**:
- 🟠 Orange gradient background (`from-orange-600 to-orange-700`)
- 🏢 Building icon badge
- Department name display
- SLA tracking emphasis
- Auto-escalation panel access
- Officer assignment focus

---

### 4. Super Admin Navigation (Dark Blue Theme)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ Super Admin    [Master Dashboard] [All Complaints] [Manage Users ▼]     │
│    System Master  [Manage Depts] [Manage Wards] [Reports ▼] [Logs] [⚙️] [Out]│
└─────────────────────────────────────────────────────────────────────────────┘
         Manage Users Dropdown:        Reports & Insights Dropdown:
         ┌──────────────────────┐     ┌───────────────────────┐
         │ All Users            │     │ Complaint Trends      │
         │ Citizens             │     │ SLA Compliance        │
         │ Ward Admins          │     │ Dept Comparison       │
         │ Dept Admins          │     │ Ward Comparison       │
         │ Super Admins         │     │ 🔥 Predictive Heatmap│
         │ ➕ Create Admin      │     └───────────────────────┘
         └──────────────────────┘
                                   Mobile FAB: ⚙️ (System Settings)
```

**Features**:
- 🔵 Dark blue gradient (`from-indigo-900 to-blue-900`)
- 🛡️ Shield icon with gold accent
- "System Master Control" subtitle
- Multiple dropdown menus
- Comprehensive system access
- Bulk operations and audit access

---

## 📱 Mobile Navigation Views

### Collapsed State (All Roles)
```
┌──────────────────────────────────────────┐
│ 🗺️ Snap & Report            ☰           │
└──────────────────────────────────────────┘
```

### Expanded Drawer (Example: Citizen)
```
┌──────────────────────────────────────────┐
│ 🗺️ Snap & Report            ✕           │
├──────────────────────────────────────────┤
│ 🏠 Home                                  │
│ ➕ Report Issue              [PRIMARY]   │
│ 📋 My Complaints                         │
│ 🔔 Notifications                    [3]  │
│ 📍 Nearby Issues                         │
│ ❓ Help / FAQs                           │
│ 📞 Emergency Contacts                    │
│ 🏢 Ward Information                      │
│ 👤 Profile                               │
│ 🚪 Logout                                │
└──────────────────────────────────────────┘

                [➕] ← Floating Action Button
```

---

## 🎯 Navigation Item Types

### Standard Link
```jsx
[🏠 Home]
```
- Single-level navigation
- Direct route navigation
- Active state highlighting

### Dropdown Menu (Desktop)
```jsx
[📋 Ward Complaints ▼]
     ↓ (hover)
┌──────────────────┐
│ ⏰ Pending       │
│ 🔄 In Progress   │
│ ✅ Resolved      │
└──────────────────┘
```
- Multi-level navigation
- Appears on hover
- White background with shadow

### Highlighted Action
```jsx
[➕ Report Issue]  ← White background, colored text
```
- Primary call-to-action
- Stands out from other items
- Role-specific key action

### Badge Indicator
```jsx
[🔔 Notifications 3]
```
- Red circular badge
- Shows count (e.g., unread notifications)
- Updates in real-time

### Mobile Submenu
```
📋 Ward Complaints
   ⏰ Pending
   🔄 In Progress
   ✅ Resolved
```
- Expanded inline
- Indented items
- Toggle on click

---

## 🔄 State Indicators

### Active Page
```
Background: Darker shade of theme color
Text: White
Example: bg-blue-800 (Citizen), bg-green-800 (Ward Admin)
```

### Hover State
```
Background: Medium shade of theme color
Text: White
Example: bg-blue-500 (Citizen), bg-orange-500 (Dept Admin)
```

### Inactive
```
Background: Transparent
Text: Light tint of theme color (e.g., blue-100, green-100)
```

### Disabled (Not implemented yet)
```
Background: Transparent
Text: Gray
Cursor: not-allowed
Opacity: 0.5
```

---

## 🎨 Color Coding Guide

### Citizen (Blue)
```
Primary:   #2563EB (blue-600)
Secondary: #1D4ED8 (blue-700)
Active:    #1E40AF (blue-800)
Hover:     #3B82F6 (blue-500)
Text:      #DBEAFE (blue-100)
```

### Ward Admin (Green)
```
Primary:   #16A34A (green-600)
Secondary: #15803D (green-700)
Active:    #166534 (green-800)
Hover:     #22C55E (green-500)
Text:      #DCFCE7 (green-100)
```

### Department Admin (Orange)
```
Primary:   #EA580C (orange-600)
Secondary: #C2410C (orange-700)
Active:    #9A3412 (orange-800)
Hover:     #F97316 (orange-500)
Text:      #FFEDD5 (orange-100)
```

### Super Admin (Indigo/Dark Blue)
```
Primary:   #312E81 (indigo-900)
Secondary: #1E3A8A (blue-900)
Active:    #1E40AF (blue-700)
Hover:     #1E40AF (blue-800)
Text:      #DBEAFE (blue-100)
Accent:    #FBBF24 (yellow-400) - for shield icon
```

---

## 📐 Layout Measurements

### Desktop Navigation Bar
```
Height: 64px (h-16)
Padding: 16px horizontal (px-4)
Max Width: 1280px (max-w-7xl)
Item Spacing: 4px (space-x-1)
Item Padding: 12px horizontal, 8px vertical (px-3 py-2)
Border Radius: 6px (rounded-md)
Font Size: 14px (text-sm)
```

### Mobile Navigation Bar
```
Height: 64px (h-16)
Drawer Width: 100% viewport
Drawer Padding: 8px (px-2)
Item Spacing: 4px vertical (space-y-1)
Item Padding: 12px horizontal, 8px vertical (px-3 py-2)
Font Size: 16px (text-base)
```

### Floating Action Button (FAB)
```
Position: Fixed bottom-right
Bottom: 24px (bottom-6)
Right: 24px (right-6)
Size: 64px (p-4 with h-6 w-6 icon)
Border Radius: 50% (rounded-full)
Shadow: Large (shadow-lg)
Z-Index: 50
```

### Dropdown Menu
```
Width: 192px (w-48) - standard
       224px (w-56) - super admin
Margin Top: 8px (mt-2)
Padding: 0px (menu container)
Item Padding: 16px horizontal, 8px vertical (px-4 py-2)
Border Radius: 6px (rounded-md)
Shadow: Large (shadow-lg)
Background: White
```

---

## 🔍 Responsive Breakpoints

### Mobile (Default)
```
< 768px (md)
- Horizontal navigation hidden
- Hamburger menu visible
- Drawer-style navigation
- FAB button visible
```

### Desktop
```
≥ 768px (md)
- Full horizontal navigation visible
- Hamburger menu hidden
- Dropdown menus on hover
- FAB button hidden
```

---

## 🎯 Interaction Patterns

### Desktop Navigation
```
1. Hover over link → Background color change
2. Click link → Navigate to route + highlight active
3. Hover over dropdown → Menu appears
4. Move mouse away → Menu disappears (200ms delay)
5. Click dropdown item → Navigate + close menu
```

### Mobile Navigation
```
1. Tap hamburger → Drawer slides in from right
2. Tap menu item → Navigate + drawer closes
3. Tap submenu header → Submenu expands inline
4. Tap outside drawer → Drawer closes
5. Tap FAB → Navigate to primary action
```

---

## 🛠️ Icon Reference

### Common Icons (All Roles)
- 🏠 Home - `HomeIcon`
- 📋 Complaints - `ClipboardDocumentListIcon`
- 👤 Profile - `UserCircleIcon`
- 🚪 Logout - `ArrowRightOnRectangleIcon`
- ⚙️ Settings - `CogIcon`

### Citizen-Specific
- ➕ Report - `PlusCircleIcon`
- 🔔 Notifications - `BellIcon`
- ❓ Help - `QuestionMarkCircleIcon`
- 📞 Emergency - `PhoneIcon`
- 🗺️ Map - `MapPinIcon`

### Admin-Specific
- 📊 Dashboard - `ChartBarIcon`
- 👥 Users/Officers - `UsersIcon`
- 🏢 Departments - `BuildingOffice2Icon`
- 📈 Analytics - `ChartPieIcon`
- ⏱️ SLA - `ClockIcon`
- 🔔 Escalations - `BellAlertIcon`
- 📄 Reports - `DocumentChartBarIcon`

### Super Admin-Specific
- 🛡️ Shield - `ShieldCheckIcon`
- 📤 Bulk Operations - `ArrowUpTrayIcon`
- 📝 Logs - `DocumentTextIcon`
- ✅ Audit - `ClipboardDocumentCheckIcon`
- 🔥 Heatmap - `FireIcon`

---

## 📊 Navigation Hierarchy

```
Root Navigation
├── Citizen Navigation (Tier 0)
│   ├── Home
│   ├── Report Issue ★
│   ├── My Complaints
│   ├── Notifications (with badge)
│   ├── Nearby Issues
│   ├── Help/FAQs
│   ├── Emergency Contacts
│   ├── Ward Info
│   ├── Profile
│   └── Logout
│
├── Ward Admin Navigation (Tier 1)
│   ├── Dashboard
│   ├── Ward Complaints (Dropdown)
│   │   ├── Pending
│   │   ├── In Progress
│   │   ├── Resolved
│   │   └── Unassigned
│   ├── Ward Map
│   ├── Reports & Analytics
│   ├── Officer Workload
│   ├── Citizen Directory
│   ├── Profile
│   └── Logout
│
├── Department Admin Navigation (Tier 2)
│   ├── Dashboard
│   ├── Dept Complaints (Dropdown)
│   │   ├── Unassigned
│   │   ├── In Progress
│   │   └── Resolved
│   ├── Assign to Officers ★
│   ├── Officer Performance
│   ├── Department Reports
│   ├── SLA Tracking
│   ├── Auto-Escalations
│   ├── Department Heatmap
│   ├── Profile
│   └── Logout
│
└── Super Admin Navigation (Tier 3)
    ├── Master Dashboard
    ├── All Complaints
    ├── Manage Users (Dropdown)
    │   ├── All Users
    │   ├── Citizens
    │   ├── Ward Admins
    │   ├── Dept Admins
    │   ├── Super Admins
    │   └── Create Admin
    ├── Manage Departments
    ├── Manage Wards
    ├── Reports & Insights (Dropdown)
    │   ├── Complaint Trends
    │   ├── SLA Compliance
    │   ├── Dept Comparison
    │   ├── Ward Comparison
    │   └── Predictive Heatmap
    ├── System Logs
    ├── Bulk Import/Export
    ├── Audit & Compliance
    ├── Settings ★
    └── Logout

★ = Primary action (highlighted/FAB)
```

---

**Visual Reference Version**: 1.0.0  
**Last Updated**: December 5, 2025  
**Component Files**: `frontend/src/components/Navigation/`
