# Role-Based Navigation System

## Overview

Comprehensive navigation bar implementation for all user roles in the Snap & Report civic complaint management system. Each role has a color-coded, purpose-specific navigation interface.

---

## 🎨 Role Color Schemes

| Role | Primary Color | Secondary Color | Use Case |
|------|--------------|-----------------|----------|
| **Citizen** | Blue (`blue-600`) | Light Blue | Report & track issues |
| **Ward Admin** | Green (`green-600`) | Light Green | Ward-level management |
| **Department Admin** | Orange (`orange-600`) | Light Orange | Department oversight |
| **Super Admin** | Indigo/Dark Blue (`indigo-900`) | Yellow accent | System-wide control |

---

## 📱 Components Created

### 1. **CitizenNavigation.jsx**
**Purpose**: Enable citizens to report issues and track complaints

**Navigation Items**:
- 🏠 Home - Dashboard overview
- ➕ **Report Issue** (Highlighted primary action)
- 📋 My Complaints - Personal complaint history
- 🔔 Notifications (with unread badge)
- 📍 Nearby Issues (Map View)
- ❓ Help / FAQs
- 📞 Emergency Contacts
- 🏢 Ward Information
- 👤 Profile
- 🚪 Logout

**Special Features**:
- Unread notification badge
- Floating Action Button (FAB) for "Report Issue" on mobile
- Responsive drawer menu for mobile

---

### 2. **WardAdminNavigation.jsx**
**Purpose**: Manage complaints within assigned ward

**Navigation Items**:
- 📊 Dashboard
- 📋 **Ward Complaints** (Dropdown submenu):
  - ⏰ Pending
  - 🔄 In Progress
  - ✅ Resolved
  - ⚠️ Unassigned
- 🗺️ Ward Map View
- 📈 Reports & Analytics
- 👥 Officer Workload Overview
- 📇 Citizen Directory (Ward-wise)
- 👤 Profile
- 🚪 Logout

**Special Features**:
- Ward name displayed in header
- Dropdown complaint filter menu
- Quick Export button (FAB) for daily summary
- Hover dropdowns for desktop

---

### 3. **DepartmentAdminNavigation.jsx**
**Purpose**: Oversee department-wide complaints (city-wide or zone-wise)

**Navigation Items**:
- 📊 Dashboard
- 📋 **Department Complaints** (Dropdown):
  - ⚠️ Unassigned
  - 🔄 In Progress
  - ✅ Resolved
- 👥 Assign to Field Officers
- 🎯 Officer Performance
- 📈 Department Reports
- ⏱️ SLA Tracking
- 🔔 Auto-Escalations Panel
- 🗺️ Department Heatmap
- 👤 Profile
- 🚪 Logout

**Special Features**:
- Department name in header
- Escalation alerts integration
- Quick Assign button (FAB)
- SLA compliance tracking

---

### 4. **SuperAdminNavigation.jsx**
**Purpose**: Master control for entire system

**Navigation Items**:
- 📊 Master Dashboard
- 📋 All Complaints
- 👥 **Manage Users** (Dropdown):
  - All Users
  - Citizens
  - Ward Admins
  - Department Admins
  - Super Admins
  - ➕ Create Admin
- 🏢 Manage Departments
- 🗺️ Manage Wards
- 📈 **Reports & Insights** (Dropdown):
  - Complaint Trends
  - SLA Compliance
  - Department Comparison
  - Ward Comparison
  - 🔥 Predictive Heatmap
- 📄 System Logs
- 📤 Bulk Import/Export
- 🛡️ Audit & Compliance Panel
- ⚙️ Settings
- 🚪 Logout

**Special Features**:
- Gold shield icon badge
- "System Master Control" subtitle
- Comprehensive dropdown menus
- Quick Settings button (FAB)
- Scrollable mobile menu

---

### 5. **RoleBasedNavigation.jsx**
**Purpose**: Wrapper component that dynamically renders the correct navigation

**Logic**:
```javascript
if (role.isSuperAdmin) return <SuperAdminNavigation />;
if (role.isDeptAdmin) return <DepartmentAdminNavigation />;
if (role.isWardAdmin) return <WardAdminNavigation />;
if (role.isCitizen) return <CitizenNavigation />;
return null; // Unauthenticated
```

---

## 🔧 Implementation

### Step 1: Import in Main Layout
```javascript
import { RoleBasedNavigation } from '../components/Navigation';

const MainLayout = ({ children }) => {
  return (
    <div>
      <RoleBasedNavigation />
      <main>{children}</main>
    </div>
  );
};
```

### Step 2: Integration with useRole Hook
All navigation components use the `useRole()` hook for:
- Role detection
- Tier verification
- Scope information (ward/department)
- Permission checking

### Step 3: Dynamic Route Protection
Navigation items automatically link to routes protected by `ProtectedRoute` components with appropriate tier requirements.

---

## 📱 Responsive Design

### Desktop (md: 768px+)
- **Horizontal top navigation bar**
- Dropdown menus on hover
- All items visible
- Logo and role badge on left
- Logout on far right

### Mobile (< 768px)
- **Hamburger menu** (☰) button
- Slide-out drawer menu
- Stacked vertical navigation
- Expandable submenus
- **Floating Action Button (FAB)** for primary action:
  - Citizen: Report Issue
  - Ward Admin: Export Daily Summary
  - Dept Admin: Assign Officers
  - Super Admin: System Settings

---

## 🎯 Key Features

### 1. **Active Page Highlighting**
Uses React Router's `NavLink` with `isActive` prop to highlight current page

### 2. **Notification Badges**
- Red badge showing unread count
- Real-time updates via `useNotifications` hook
- Only on Citizen navigation

### 3. **Role-Specific Branding**
Each navigation displays:
- Role title (e.g., "Ward Admin")
- Scope information (e.g., ward name, department name)
- Role-appropriate icon

### 4. **Dropdown Submenus**
Complex navigation items (Complaints, Users, Reports) organized in collapsible dropdown menus

### 5. **Quick Actions**
Persistent "Help" button and role-specific FABs for mobile users

---

## 🔗 Integration with RBAC System

### Permission Checking
Navigation items automatically respect RBAC permissions:
```javascript
const role = useRole();

// Only show if user can manage officers
{role.canManageOfficers && (
  <NavLink to="/admin/officers">Officer Management</NavLink>
)}
```

### Scope Filtering
- Ward Admins see ward-specific routes
- Dept Admins see department-filtered data
- Super Admins see all system data

### Logout Flow
All navigation components handle logout uniformly:
1. Call `logout()` from `useAuth()`
2. Show success toast
3. Redirect to appropriate login page
4. Clear session and tokens

---

## 🎨 Styling Standards

### Colors
- **Primary**: Role-specific gradient backgrounds
- **Active State**: Darker shade of primary color
- **Hover**: Slightly lighter than active
- **Text**: White on colored backgrounds

### Icons
Using **Heroicons v2** (outline variants):
- Consistent 24px size (h-6 w-6)
- Left-aligned with 12px margin
- Descriptive and intuitive

### Typography
- Navigation item text: `text-sm font-medium` (desktop)
- Navigation item text: `text-base font-medium` (mobile)
- Role title: `text-lg font-bold`
- Scope subtitle: `text-xs`

### Spacing
- Desktop: `space-x-1` between items
- Mobile: `space-y-1` between items
- Padding: `px-3 py-2` for nav items

---

## 🚀 Usage Examples

### Example 1: Replace Existing Sidebar
```javascript
// Before
<AdminSidebar />

// After
<RoleBasedNavigation />
```

### Example 2: Add to Layout Wrapper
```javascript
// src/components/Layout/AppLayout.jsx
import { RoleBasedNavigation } from '../Navigation';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavigation />
      <div className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </div>
    </div>
  );
};
```

### Example 3: Conditional Rendering
```javascript
import { useAuth } from '../../context/AuthContext';
import { RoleBasedNavigation } from '../Navigation';

const App = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <RoleBasedNavigation />}
      <Routes>{/* ... */}</Routes>
    </div>
  );
};
```

---

## 🧪 Testing Checklist

- [ ] Citizen navigation displays for CITIZEN role
- [ ] Ward Admin navigation displays for WARD_ADMIN role
- [ ] Dept Admin navigation displays for DEPT_ADMIN role
- [ ] Super Admin navigation displays for SUPER_ADMIN role
- [ ] Notification badges update in real-time
- [ ] Active page highlighting works correctly
- [ ] Dropdown menus open on hover (desktop)
- [ ] Mobile menu drawer opens/closes correctly
- [ ] FAB buttons navigate to correct routes
- [ ] Logout flow works and redirects properly
- [ ] Role scope (ward/dept) displays correctly in header
- [ ] All navigation items link to valid routes

---

## 📦 Dependencies

### Required Hooks
- `useAuth()` - Authentication context
- `useRole()` - Role and permission checking
- `useNotifications()` - Notification state (Citizen only)

### Required Libraries
- `react-router-dom` - Routing and navigation
- `@heroicons/react` - Icon library
- `react-hot-toast` - Toast notifications

### Route Protection
All navigation routes must be protected with:
- `ProtectedRoute` component
- Appropriate `requiredRole` and `minTier` props

---

## 🔮 Future Enhancements

### Suggested Additions
1. **Search Bar**: Quick complaint search in navigation
2. **Theme Toggle**: Light/dark mode switcher
3. **Language Selector**: Multi-language support
4. **Breadcrumbs**: Show navigation hierarchy
5. **Recent Actions**: Quick access to recent items
6. **Keyboard Shortcuts**: Power user navigation
7. **Customizable Layout**: User preferences for navigation order

### Performance Optimizations
1. Lazy load dropdown menus
2. Memoize navigation items
3. Virtualize long mobile menus
4. Cache notification counts

---

## 📝 Notes

- All navigation components are **fully responsive**
- Mobile-first design approach
- Accessibility: ARIA labels and keyboard navigation supported
- SEO-friendly with semantic HTML
- Print-friendly (navigation hidden in print stylesheet)

---

## 🆘 Troubleshooting

### Issue: Navigation not showing
**Solution**: Check if `RoleBasedNavigation` is imported and rendered in layout

### Issue: Active highlighting not working
**Solution**: Ensure using `NavLink` instead of `Link` from react-router-dom

### Issue: Notification badge not updating
**Solution**: Check if `useNotifications` hook is fetching data correctly

### Issue: Dropdown not opening
**Solution**: Verify CSS `group` and `group-hover` classes are applied correctly

### Issue: Mobile menu not closing
**Solution**: Ensure `onClick={() => setMobileMenuOpen(false)}` is on NavLink components

---

## 📄 Related Documentation

- [RBAC Implementation Checklist](./RBAC_IMPLEMENTATION_CHECKLIST.md)
- [Role-Based Access Control Guide](./RBAC_IMPLEMENTATION_GUIDE.md)
- [useRole Hook Documentation](../frontend/src/hooks/useRole.js)
- [ProtectedRoute Documentation](../frontend/src/routes/ProtectedRoute.jsx)

---

**Created**: December 5, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
