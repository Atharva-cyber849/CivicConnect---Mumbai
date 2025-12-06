# Migration Guide: Replacing Existing Navigation with Role-Based Navigation

## 🎯 Quick Start (5 Minutes)

### Step 1: Remove Old Navigation Components
Identify and remove/replace these existing components:
- `Header.jsx`
- `AdminSidebar.jsx`
- `CitizenHeader.jsx`
- Any other custom navigation components

### Step 2: Import and Use RoleBasedNavigation

**Option A: Replace in Layout Component**
```jsx
// File: src/components/Layout/Layout.jsx

// ❌ Before
import Header from './Header';
import AdminSidebar from './AdminSidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
};

// ✅ After
import { RoleBasedNavigation } from '../Navigation';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <RoleBasedNavigation />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
```

**Option B: Direct Integration in App.jsx**
```jsx
// File: src/App.jsx
import { RoleBasedNavigation } from './components/Navigation';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen">
      {isAuthenticated && <RoleBasedNavigation />}
      <Routes>
        {/* Your routes */}
      </Routes>
    </div>
  );
}
```

### Step 3: Test Each Role
Log in as different user types and verify navigation:
- ✅ Citizen sees blue navigation
- ✅ Ward Admin sees green navigation
- ✅ Department Admin sees orange navigation
- ✅ Super Admin sees dark blue navigation

---

## 📋 Detailed Migration Steps

### 1. Backup Current Navigation
```bash
# Create backup of current navigation files
mkdir src/components/__backup_navigation__
cp src/components/Layout/Header.jsx src/components/__backup_navigation__/
cp src/components/Layout/AdminSidebar.jsx src/components/__backup_navigation__/
```

### 2. Update Route Paths (If Needed)

The new navigation links to these routes. Ensure they exist:

**Citizen Routes:**
- `/dashboard` - Home
- `/dashboard/report` - Report Issue
- `/dashboard/complaints` - My Complaints
- `/dashboard/notifications` - Notifications
- `/dashboard/map` - Nearby Issues
- `/dashboard/help` - Help/FAQs
- `/dashboard/emergency` - Emergency Contacts
- `/dashboard/ward-info` - Ward Information
- `/dashboard/profile` - Profile

**Ward Admin Routes:**
- `/admin/dashboard` - Dashboard
- `/admin/complaints?status=PENDING` - Pending complaints
- `/admin/complaints?status=IN_PROGRESS` - In-progress complaints
- `/admin/complaints?status=RESOLVED` - Resolved complaints
- `/admin/map` - Ward Map
- `/admin/reports` - Reports
- `/admin/analytics` - Analytics
- `/admin/officer-workload` - Officer Workload
- `/admin/citizens` - Citizen Directory
- `/admin/profile` - Profile

**Department Admin Routes:**
- `/admin/dashboard` - Dashboard
- `/admin/complaints?status=UNASSIGNED` - Unassigned
- `/admin/complaints?status=IN_PROGRESS` - In Progress
- `/admin/complaints?status=RESOLVED` - Resolved
- `/admin/assign` - Assign Officers
- `/admin/officers` - Officer Performance
- `/admin/reports` - Department Reports
- `/admin/sla-dashboard` - SLA Tracking
- `/admin/escalations` - Auto-Escalations
- `/admin/map` - Department Heatmap
- `/admin/profile` - Profile

**Super Admin Routes:**
- `/admin/dashboard` - Master Dashboard
- `/admin/complaints` - All Complaints
- `/admin/users` - All Users
- `/admin/users?role=CITIZEN` - Citizens
- `/admin/users?role=WARD_ADMIN` - Ward Admins
- `/admin/users?role=DEPT_ADMIN` - Dept Admins
- `/admin/users?role=SUPER_ADMIN` - Super Admins
- `/admin/create-admin` - Create Admin
- `/admin/departments` - Manage Departments
- `/admin/wards` - Manage Wards
- `/admin/reports/trends` - Complaint Trends
- `/admin/sla-dashboard` - SLA Compliance
- `/admin/reports/departments` - Dept Comparison
- `/admin/reports/wards` - Ward Comparison
- `/admin/analytics` - Predictive Heatmap
- `/admin/logs` - System Logs
- `/admin/bulk-operations` - Bulk Import/Export
- `/admin/audit` - Audit & Compliance
- `/admin/settings` - Settings

### 3. Add Missing Routes (If Any)

Example for missing routes:
```jsx
// File: src/routes/AppRouter.jsx
import { Route } from 'react-router-dom';

// Citizen routes
<Route path="/dashboard/emergency" element={<EmergencyContacts />} />
<Route path="/dashboard/ward-info" element={<WardInformation />} />

// Admin routes
<Route path="/admin/escalations" element={<AutoEscalations />} />
<Route path="/admin/officer-workload" element={<OfficerWorkload />} />
<Route path="/admin/citizens" element={<CitizenDirectory />} />
<Route path="/admin/bulk-operations" element={<BulkOperations />} />
<Route path="/admin/audit" element={<AuditPanel />} />
```

### 4. Remove Old Navigation Imports

Find and remove old navigation imports throughout your codebase:
```bash
# Search for old imports
grep -r "import.*Header" src/
grep -r "import.*Sidebar" src/
grep -r "import.*Navigation" src/ | grep -v "RoleBasedNavigation"
```

### 5. Update CSS (If Needed)

Remove old navigation-specific styles:
```css
/* Delete or comment out in your CSS files */
.old-header { }
.admin-sidebar { }
.nav-container { }
```

The new navigation uses Tailwind CSS classes exclusively.

---

## 🔧 Customization Options

### Option 1: Change Colors
Edit the navigation component files:
```jsx
// Example: Change Citizen theme from blue to purple
// File: CitizenNavigation.jsx
// Replace: from-blue-600 to-blue-700
// With: from-purple-600 to-purple-700
```

### Option 2: Add/Remove Navigation Items
```jsx
// File: CitizenNavigation.jsx
const navItems = [
  { name: 'Home', path: '/dashboard', icon: HomeIcon },
  // Add your custom item:
  { name: 'My Custom Page', path: '/dashboard/custom', icon: CustomIcon },
  // ... rest of items
];
```

### Option 3: Change Logo
```jsx
// Replace MapPinIcon with your logo
<div className="flex items-center">
  <img src="/logo.png" alt="Logo" className="h-8 w-8" />
  <span className="ml-2 text-xl font-bold text-white">Your App Name</span>
</div>
```

### Option 4: Add Badge to Navigation Item
```jsx
// Add badge prop to any nav item
{ 
  name: 'Reports', 
  path: '/admin/reports', 
  icon: DocumentIcon,
  badge: 5 // Will show red badge with number
}
```

---

## 🐛 Troubleshooting

### Issue 1: "Cannot read property 'role' of undefined"
**Cause**: useRole hook called before authentication
**Fix**: Wrap with authentication check
```jsx
const { isAuthenticated } = useAuth();
return isAuthenticated ? <RoleBasedNavigation /> : null;
```

### Issue 2: Navigation not appearing
**Cause**: Missing imports or wrong component name
**Fix**: Check import path
```jsx
import { RoleBasedNavigation } from './components/Navigation';
// NOT: import RoleBasedNavigation from './components/Navigation';
```

### Issue 3: Wrong navigation showing for user
**Cause**: Role not properly set in JWT token
**Fix**: Check backend token generation includes correct role/tier
```python
# Backend: apps/users/serializers.py
def get_tokens_for_user(user):
    tokens['role'] = user.role
    tokens['admin_tier'] = user.get_admin_tier()
```

### Issue 4: Dropdown menus not working
**Cause**: Missing Tailwind CSS classes or configuration
**Fix**: Ensure Tailwind configured properly
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // ... rest of config
}
```

### Issue 5: Mobile menu not closing after navigation
**Cause**: Missing setMobileMenuOpen in onClick
**Fix**: Add to all NavLink components
```jsx
<NavLink
  onClick={() => setMobileMenuOpen(false)}
  // ... rest of props
>
```

---

## ✅ Testing Checklist

After migration, test these scenarios:

### Desktop Testing
- [ ] Navigation bar displays at top
- [ ] All menu items visible
- [ ] Hover effects work on links
- [ ] Dropdown menus open on hover
- [ ] Active page highlighted correctly
- [ ] Logout button works
- [ ] Logo/branding displays

### Mobile Testing
- [ ] Hamburger menu button visible
- [ ] Menu drawer opens/closes
- [ ] All items accessible in drawer
- [ ] FAB button displays and works
- [ ] Navigation doesn't overlap content
- [ ] Smooth transitions

### Role Testing
- [ ] Citizen sees blue navigation with citizen items
- [ ] Ward Admin sees green navigation with ward items
- [ ] Dept Admin sees orange navigation with dept items
- [ ] Super Admin sees dark blue navigation with all items
- [ ] Unauthenticated users see no navigation

### Permission Testing
- [ ] Notification badge appears for citizens
- [ ] Ward/dept name displays correctly in admin navs
- [ ] Restricted items hidden for lower tiers
- [ ] All links navigate to correct pages

---

## 🚀 Performance Tips

### 1. Lazy Load Navigation
```jsx
import { lazy, Suspense } from 'react';

const RoleBasedNavigation = lazy(() => 
  import('./components/Navigation/RoleBasedNavigation')
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoleBasedNavigation />
    </Suspense>
  );
}
```

### 2. Memoize Navigation Items
```jsx
import { useMemo } from 'react';

const navItems = useMemo(() => [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  // ... rest of items
], []); // Empty dependency array - items don't change
```

### 3. Optimize Icon Imports
```jsx
// Import only needed icons instead of entire library
import { 
  HomeIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';
```

---

## 📚 Additional Resources

- [Navigation System Documentation](./NAVIGATION_SYSTEM.md)
- [RBAC Implementation Guide](./RBAC_IMPLEMENTATION_GUIDE.md)
- [useRole Hook Documentation](../frontend/src/hooks/useRole.js)
- [React Router v6 Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

## 🆘 Need Help?

If you encounter issues during migration:

1. **Check browser console** for error messages
2. **Verify authentication** - ensure useAuth returns correct data
3. **Check role assignment** - verify JWT token contains role info
4. **Review route configuration** - ensure all navigation paths exist
5. **Test with different roles** - login as each user type

---

**Migration Time Estimate**: 15-30 minutes  
**Difficulty Level**: Easy  
**Breaking Changes**: None (additive only)  

✅ Safe to deploy without downtime
