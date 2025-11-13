# 🧪 Quick Testing Checklist - Logout Functionality

## ✅ Citizen Logout Test

### Setup
- [ ] Clear browser localStorage (DevTools → Application → Storage)
- [ ] Navigate to http://localhost:5173
- [ ] Click "Login" button

### Login
- [ ] Enter email: `arjun.sharma@citizen.test`
- [ ] Enter password: `citizen123`
- [ ] Click "Login"
- [ ] Should see "Login successful" toast
- [ ] Should redirect to http://localhost:5173/dashboard

### Logout Test
- [ ] Look for logout button in top-right header (red button labeled "Logout")
- [ ] Click the "Logout" button
- [ ] **Expected:** 
  - [ ] Toast notification appears: "Logged out successfully"
  - [ ] Page redirects to http://localhost:5173/auth/login
  - [ ] User email no longer visible in header
  - [ ] localStorage is cleared
- [ ] Check browser DevTools → Application → Storage → localStorage
  - [ ] `civic_auth_token` should be gone
  - [ ] `civic_user_data` should be gone
  - [ ] `civic_refresh_token` should be gone

---

## ✅ Admin Logout Test (Via Menu)

### Setup
- [ ] Clear browser localStorage
- [ ] Navigate to http://localhost:5173/admin
- [ ] Click "Officer/Admin Login" link

### Login
- [ ] Enter email: `admin.roads@test.bmc.gov.in`
- [ ] Enter password: `admin123`
- [ ] Click "Login"
- [ ] Should see dashboard with sidebar

### Logout via Navbar Menu
- [ ] Look for user menu in top-right navbar (shows name with dropdown icon)
- [ ] Click the user dropdown menu
- [ ] Should see "Admin Settings" and "Sign out" options
- [ ] Click "Sign out"
- [ ] **Expected:**
  - [ ] Toast notification: "Logged out successfully"
  - [ ] Page redirects to http://localhost:5173/admin/auth/login
  - [ ] Sidebar closes/disappears
  - [ ] localStorage is cleared

---

## ✅ Admin Logout Test (Via Sidebar)

### Setup
- [ ] Complete Admin Login (see above)

### Logout via Sidebar
- [ ] Look for "Sign Out" button at bottom of sidebar
- [ ] Click "Sign Out"
- [ ] **Expected:**
  - [ ] Toast notification: "Logged out successfully"
  - [ ] Page redirects to http://localhost:5173/admin/auth/login
  - [ ] localStorage is cleared

---

## ✅ Mobile Admin Logout Test

### Setup
- [ ] Open DevTools with responsive design mode
- [ ] Set to mobile size (e.g., iPhone 12)
- [ ] Login with admin credentials
- [ ] Dashboard should show mobile hamburger menu

### Logout via Mobile Menu
- [ ] Click hamburger menu icon (top-left)
- [ ] Scroll to bottom of mobile sidebar
- [ ] Click "Sign Out" button
- [ ] **Expected:**
  - [ ] Toast notification: "Logged out successfully"
  - [ ] Mobile sidebar closes
  - [ ] Page redirects to admin login
  - [ ] localStorage is cleared

---

## ✅ Error Scenarios

### Test 1: Network Error During Logout
- [ ] Open DevTools → Network tab
- [ ] Throttle network to offline
- [ ] Click logout button
- [ ] **Expected:**
  - [ ] Still shows "Logged out successfully" toast
  - [ ] Still redirects to login
  - [ ] localStorage still cleared (graceful handling)

### Test 2: Multiple Rapid Logout Clicks
- [ ] Click logout button rapidly multiple times
- [ ] **Expected:**
  - [ ] Only one redirect happens
  - [ ] No console errors
  - [ ] Clean logout flow

---

## ✅ Session Persistence Test

### Test 1: Page Refresh After Login
- [ ] Login to dashboard
- [ ] Refresh page (Ctrl+R or Cmd+R)
- [ ] **Expected:**
  - [ ] Should stay logged in
  - [ ] Dashboard loads normally
  - [ ] User data still visible

### Test 2: Page Refresh After Logout
- [ ] Login to dashboard
- [ ] Logout (see toast appear)
- [ ] Quickly refresh page before redirect completes
- [ ] **Expected:**
  - [ ] Should be redirected to login
  - [ ] No logged-in content visible
  - [ ] Clean login page displayed

---

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| Citizen Login & Logout | ⬜ | |
| Admin Login & Navbar Logout | ⬜ | |
| Admin Login & Sidebar Logout | ⬜ | |
| Mobile Admin Logout | ⬜ | |
| localStorage Cleanup | ⬜ | |
| Toast Notifications | ⬜ | |
| Redirect Functionality | ⬜ | |
| Network Error Handling | ⬜ | |
| Session Persistence | ⬜ | |

**Legend:** ⬜ = Not Started | 🟡 = In Progress | ✅ = Passed | ❌ = Failed

---

## 🚀 Deployment Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] No network errors
- [ ] localStorage properly cleaned
- [ ] Redirects working correctly
- [ ] Toast notifications visible
- [ ] Mobile layout working
- [ ] Ready for production
