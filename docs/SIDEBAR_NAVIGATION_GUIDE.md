# Sidebar Navigation Guide

## Overview

This guide covers the sidebar navigation components in the Snap & Report system. You have two navigation options:

1. **Top Navigation** (Recommended) - `RoleBasedNavigation` component
2. **Sidebar Navigation** - `AdminSidebar` component

---

## 🎯 Which Navigation Should You Use?

### Option 1: Top Navigation (RoleBasedNavigation) ⭐ Recommended

**Best For:**
- Modern, clean interfaces
- Mobile-first applications
- Maximum content space
- All user types (Citizen, Ward Admin, Dept Admin, Super Admin)

**Advantages:**
- ✅ Better mobile experience
- ✅ More screen space for content
- ✅ Horizontal layout is familiar to users
- ✅ Color-coded by role
- ✅ Easier to see all options at once

**Usage:**
```jsx
import { RoleBasedNavigation } from './components/Navigation';

const App = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <RoleBasedNavigation />}
      <main>{children}</main>
    </div>
  );
};
```

**See:** `docs/NAVIGATION_SYSTEM.md` for complete documentation

---

### Option 2: Sidebar Navigation (AdminSidebar)

**Best For:**
- Traditional admin panel layouts
- Desktop-focused applications
- Need for persistent navigation visibility
- Complex navigation hierarchies
- Admin users only (not for citizens)

**Advantages:**
- ✅ More space for navigation items
- ✅ Always visible on desktop
- ✅ Traditional admin panel feel
- ✅ Can show descriptions for each item
- ✅ Collapsible to save space

**Usage:**
```jsx
import AdminSidebar from './components/Layout/AdminSidebar';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  return (
    <div className="flex">
      <AdminSidebar 
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        user={user}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
};
```

---

## 🔧 AdminSidebar Component

### Features

#### ✅ Role-Based Items
- Automatically shows/hides items based on user role
- Super Admin sees all items
- Dept Admin sees department-scoped items
- Ward Admin/Officer sees limited items

#### ✅ Desktop Features
- **Collapsible**: Click arrow to minimize/expand
- **Sticky**: Stays visible while scrolling
- **Active Highlighting**: Current page is highlighted
- **User Info**: Shows avatar and role at top
- **Department Badge**: Shows assigned department

#### ✅ Mobile Features
- **Drawer**: Slides in from left
- **Overlay**: Closes when clicking outside
- **Touch-Optimized**: Larger touch targets
- **Auto-Close**: Closes after navigation

---

## 📐 AdminSidebar Layout

### Desktop (≥ 768px)

```
┌────────────────────────┐
│ [Avatar] John Doe      │ ← User Info
│ Super Admin            │
│        [<] Minimize    │
├────────────────────────┤
│ ▣ Dashboard           │ ← Active Item
│   System Overview      │
├────────────────────────┤
│ ▢ Complaints          │
│   All City Complaints  │
├────────────────────────┤
│ ▢ Map View            │
│   City-wide View       │
├────────────────────────┤
│ ▢ Analytics           │
│   System Analytics     │
├────────────────────────┤
│ ▢ SLA Tracking        │
│   SLA Monitoring       │
├────────────────────────┤
│ ... more items ...    │
├────────────────────────┤
│ 🏢 Public Works Dept  │ ← Department Badge
├────────────────────────┤
│ ? Help & Support      │ ← Help Link
├────────────────────────┤
│ ⎋ Sign Out            │ ← Logout
└────────────────────────┘

Width: 256px (16rem) - Expanded
       80px (5rem) - Minimized
```

### Mobile (< 768px)

```
[☰] ← Hamburger in header triggers sidebar

When open:
┌────────────────────────┐
│ [Avatar] John  [X]     │
│ Super Admin            │
├────────────────────────┤
│ ▣ Dashboard           │
├────────────────────────┤
│ ▢ Complaints          │
├────────────────────────┤
│ ... more items ...    │
├────────────────────────┤
│ ⎋ Sign Out            │
└────────────────────────┘
```

---

## 🎨 AdminSidebar Styling

### Colors
- **Primary**: `#0078D7` (Microsoft Blue)
- **Accent**: `#FF9E00` (Orange for active indicators)
- **Background**: White
- **Text**: Gray-700 (inactive), White (active)
- **Hover**: Gray-50

### Active State
- **Background**: `#0078D7` (blue)
- **Text**: White
- **Border**: Right border with `#FF9E00` (orange accent)

### User Info Section
- **Background**: Gradient from `#0078D7` to `blue-600`
- **Text**: White
- **Avatar**: White circle with blue initials

---

## 📊 Navigation Items by Role

### Super Admin (Full Access)
1. Dashboard - System Overview
2. Complaints - All City Complaints
3. Map View - City-wide Geographic View
4. **Analytics** - System Analytics
5. **SLA Tracking** - Service Level Agreement Monitoring
6. BMC Ward Dashboard - All Wards Management
7. Zone Management - Mumbai Zone Overview
8. Reports - City-Wide Analytics
9. All Officers - Manage All BMC Officers
10. **Self Registrations** - Review Self-Registered Users
11. **Registration Requests** - Pending Registration Approvals
12. **Create Admin** - Create Department Admin
13. **Create Super Admin** - Create Super Admin Account
14. **System Settings** - System Configuration

### Department Admin
1. Dashboard - Department Overview
2. Complaints - Department Complaints
3. Map View - Ward Geographic View
4. **Analytics** - Department Trends
5. **SLA Tracking** - Service Level Agreement Monitoring
6. Reports - Department Analytics
7. Department Officers - Manage Department Staff
8. My Profile - Profile & Preferences

### Ward Admin / BMC Officer
1. Dashboard - My Assignments
2. Complaints - Assigned Complaints
3. Map View - Ward Geographic View
4. **Analytics** - Performance Metrics
5. Reports - My Performance
6. My Profile - Profile & Preferences

---

## 🔄 Migration from Legacy Sidebar

### Old Sidebar Component
The old `Sidebar.jsx` component has been deprecated and now redirects to `RoleBasedNavigation`.

**If you're using:**
```jsx
import Sidebar from './components/Layout/Sidebar';
<Sidebar userType="admin" />
```

**Replace with:**
```jsx
// Option 1: Top Navigation (Recommended)
import { RoleBasedNavigation } from './components/Navigation';
<RoleBasedNavigation />

// Option 2: Sidebar (If you prefer vertical layout)
import AdminSidebar from './components/Layout/AdminSidebar';
<AdminSidebar 
  open={sidebarOpen}
  setOpen={setSidebarOpen}
  user={user}
  isMinimized={isMinimized}
  setIsMinimized={setIsMinimized}
/>
```

---

## 💡 Usage Examples

### Example 1: Admin Layout with Sidebar

```jsx
// File: src/components/Layout/AdminLayout.jsx
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        user={user}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with mobile menu button */}
        <header className="md:hidden bg-white shadow-sm p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600"
          >
            ☰ Menu
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
```

### Example 2: Using with React Router

```jsx
// File: src/routes/AdminRoutes.jsx
import AdminLayout from '../components/Layout/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaints" element={<Complaints />} />
        {/* ... more routes */}
      </Routes>
    </AdminLayout>
  );
}
```

### Example 3: Hybrid Approach (Top Nav + Sidebar)

```jsx
// Use top navigation for main navigation
// Use sidebar for sub-navigation within sections

const HybridLayout = ({ children }) => {
  return (
    <div>
      {/* Top Navigation for primary navigation */}
      <RoleBasedNavigation />
      
      <div className="flex">
        {/* Sidebar for secondary navigation */}
        <SecondaryNavSidebar />
        
        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};
```

---

## 🎯 Props Reference

### AdminSidebar Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | boolean | Yes | Controls mobile sidebar visibility |
| `setOpen` | function | Yes | Function to toggle sidebar (mobile) |
| `user` | object | Yes | User object with name, role, department |
| `isMinimized` | boolean | Yes | Controls desktop sidebar minimized state |
| `setIsMinimized` | function | Yes | Function to toggle minimized state |

### User Object Structure

```javascript
{
  first_name: "John",
  last_name: "Doe",
  role: "SUPER_ADMIN",
  admin_tier: 3,
  department: "Public Works",
  assigned_ward: "A",
  email: "john.doe@bmc.gov.in"
}
```

---

## 🔍 Customization

### Add New Navigation Item

```jsx
// In AdminSidebar.jsx, find getNavigationItems() function

// For all users:
baseItems.push({
  name: 'Custom Page',
  href: '/admin/custom',
  icon: CustomIcon,
  description: 'My custom description'
});

// For specific role:
if (isSuperAdmin) {
  baseItems.push({
    name: 'Admin Only',
    href: '/admin/admin-only',
    icon: ShieldIcon,
    description: 'Super Admin Only'
  });
}
```

### Change Colors

```jsx
// User info gradient
className="bg-gradient-to-r from-[#0078D7] to-blue-600"
// Change to: from-purple-600 to-purple-700

// Active item background
className="bg-[#0078D7]"
// Change to: bg-purple-600

// Active item border
className="border-[#FF9E00]"
// Change to: border-purple-400
```

### Add Badge to Item

```jsx
{
  name: 'Complaints',
  href: '/admin/complaints',
  icon: ClipboardIcon,
  description: 'View complaints',
  badge: 5  // Add this line
}
```

---

## 🐛 Troubleshooting

### Issue: Sidebar not showing on mobile
**Solution**: Ensure you have a button to trigger `setOpen(true)`
```jsx
<button onClick={() => setSidebarOpen(true)}>☰</button>
```

### Issue: Sidebar overlaps content on desktop
**Solution**: Use flex layout
```jsx
<div className="flex">
  <AdminSidebar {...props} />
  <main className="flex-1">{children}</main>
</div>
```

### Issue: Active highlighting not working
**Solution**: Check that your routes match the `href` in navigation items exactly

### Issue: User info not displaying
**Solution**: Ensure `user` object has `first_name` and `last_name` properties

---

## 📱 Responsive Behavior

### Desktop (md: 768px+)
- Sidebar always visible
- Can be minimized to 80px width
- Sticky positioning (scrolls with content)
- Hover states active

### Mobile (< 768px)
- Sidebar hidden by default
- Opens as drawer from left
- Full-screen overlay
- Auto-closes after navigation
- Touch-optimized buttons

---

## ✅ Best Practices

### Do's ✅
- Use AdminSidebar for admin interfaces only
- Use RoleBasedNavigation for citizen interfaces
- Keep navigation item descriptions concise
- Test on both mobile and desktop
- Use role-based conditionals for items
- Provide logout functionality
- Show user info in header

### Don'ts ❌
- Don't use AdminSidebar for citizens (use RoleBasedNavigation instead)
- Don't add too many items (keep under 15)
- Don't hide critical navigation items
- Don't forget mobile hamburger button
- Don't use both sidebar and top nav for same purpose

---

## 🔮 Future Enhancements

Planned features for AdminSidebar:

- [ ] Collapsible sub-menus
- [ ] Search functionality
- [ ] Recent pages history
- [ ] Pinned/favorite items
- [ ] Notification indicators
- [ ] Keyboard shortcuts
- [ ] Custom themes
- [ ] Drag-to-reorder items

---

## 📚 Related Documentation

- [NAVIGATION_SYSTEM.md](./NAVIGATION_SYSTEM.md) - Top navigation documentation
- [NAVIGATION_MIGRATION_GUIDE.md](./NAVIGATION_MIGRATION_GUIDE.md) - Migration guide
- [RBAC_IMPLEMENTATION_GUIDE.md](./RBAC_IMPLEMENTATION_GUIDE.md) - RBAC system

---

## 📊 Comparison: Top Nav vs Sidebar

| Feature | Top Navigation | Sidebar |
|---------|---------------|---------|
| **Screen Space** | More space for content | Less horizontal space |
| **Mobile** | Better mobile UX | Needs drawer |
| **Visibility** | Always visible at top | Can be hidden/minimized |
| **Navigation Items** | Limited by width | More vertical space |
| **User Familiarity** | Modern, familiar | Traditional admin feel |
| **Best For** | All user types | Admin users only |
| **Complexity** | Simple, flat structure | Can handle hierarchies |
| **Setup** | 1-line import | Requires layout setup |

---

## 🎉 Conclusion

### Quick Decision Guide

**Choose Top Navigation (RoleBasedNavigation) if:**
- You want a modern, mobile-first design
- You need to support citizens and admins
- You want color-coded role interfaces
- You prefer maximum content space
- You want quick setup

**Choose Sidebar (AdminSidebar) if:**
- You prefer traditional admin panel layout
- You have complex navigation hierarchies
- You want always-visible navigation
- You need space for item descriptions
- You're building admin-only interfaces

Both options are fully supported and maintained. Choose based on your specific needs and preferences.

---

**Last Updated**: December 5, 2025  
**Component Version**: 1.0.0  
**Status**: ✅ Production Ready
