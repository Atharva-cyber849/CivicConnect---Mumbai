# Frontend Troubleshooting Guide

## Issue: Blank Page at localhost:5173

### Symptoms
- Page loads but shows blank/white screen
- Console shows errors related to API imports
- Dev server is running but frontend not rendering

---

## Solution Steps

### Step 1: Restart Dev Server
The dev server needs to be restarted after file changes.

```bash
# Kill existing process
taskkill /F /IM node.exe

# Restart dev server
cd frontend
npm run dev
```

### Step 2: Clear Browser Cache
```bash
# Hard refresh in browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Or clear cache manually
DevTools → Application → Clear Storage
```

### Step 3: Check Console Errors
Open DevTools (F12) and check Console tab for:
- ❌ `SyntaxError: export 'adminApi' is not defined`
- ❌ `Failed to fetch`
- ❌ `CORS errors`
- ❌ `Module not found`

### Step 4: Verify Backend is Running
```bash
# Check if backend is running
curl http://localhost:8000/api/

# If not running, start it
cd backend
python manage.py runserver
```

### Step 5: Check Network Tab
DevTools → Network tab:
- Look for failed requests (red)
- Check API endpoint URLs
- Verify response status codes

---

## Common Issues & Fixes

### Issue 1: "export 'adminApi' is not defined"
**Cause**: Circular dependency in API imports  
**Fix**: Restart dev server
```bash
taskkill /F /IM node.exe
npm run dev
```

### Issue 2: Blank Page with No Errors
**Cause**: Backend not running or CORS issues  
**Fix**: Start backend
```bash
cd backend
python manage.py runserver
```

### Issue 3: CORS Errors in Console
**Cause**: Backend CORS settings  
**Fix**: Check backend CORS configuration
```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

### Issue 4: Module Not Found Errors
**Cause**: Missing dependencies  
**Fix**: Reinstall dependencies
```bash
cd frontend
npm install
npm run dev
```

### Issue 5: API Calls Failing
**Cause**: Backend not responding  
**Fix**: 
1. Check backend is running: `http://localhost:8000/api/`
2. Check API endpoints exist
3. Check authentication token

---

## Verification Checklist

- [ ] Dev server running: `http://localhost:5173/`
- [ ] Backend running: `http://localhost:8000/api/`
- [ ] No console errors
- [ ] Page renders (not blank)
- [ ] Can see login form
- [ ] Network requests successful (200 status)
- [ ] API responses valid JSON

---

## Testing Procedure

### 1. Frontend Only
```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# Should see: VITE v5.4.21 ready in XXX ms
# ➜  Local: http://localhost:5173/
```

### 2. Backend Only
```bash
# Terminal 2: Backend
cd backend
python manage.py runserver
# Should see: Starting development server at http://127.0.0.1:8000/
```

### 3. Access Frontend
```
http://localhost:5173/
```

### 4. Check Console
- F12 → Console tab
- Should be empty (no errors)
- Should see network requests in Network tab

---

## Expected Behavior

### After Fixes Applied
1. **Dev server starts**: `VITE v5.4.21 ready in XXX ms`
2. **Page loads**: Shows login form or dashboard
3. **No console errors**: Console is clean
4. **API calls work**: Network tab shows successful requests

### Login Page Should Show
- Email input field
- Password input field
- Login button
- "Forgot password?" link
- Language selector

---

## Debug Commands

### Check Frontend Build
```bash
cd frontend
npm run build
# Should complete without errors
```

### Check Backend API
```bash
curl -X GET http://localhost:8000/api/
# Should return JSON response
```

### Check Node Modules
```bash
cd frontend
npm ls
# Should show dependency tree
```

### Check Vite Config
```bash
# frontend/vite.config.js should exist and be valid
cat vite.config.js
```

---

## File Locations

- **Frontend**: `c:\Users\admin\OneDrive\Desktop\CivicConnect\frontend\`
- **Backend**: `c:\Users\admin\OneDrive\Desktop\CivicConnect\backend\`
- **API Index**: `frontend\src\api\index.js`
- **Main App**: `frontend\src\App.jsx`
- **Entry Point**: `frontend\src\main.jsx`

---

## Port Information

- **Frontend Dev Server**: `http://localhost:5173/`
- **Backend API**: `http://localhost:8000/api/`
- **Django Admin**: `http://localhost:8000/admin/`

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## Quick Fix Summary

**If page is blank:**
1. Restart dev server: `taskkill /F /IM node.exe && npm run dev`
2. Hard refresh browser: `Ctrl + Shift + R`
3. Check console for errors: `F12`
4. Verify backend running: `http://localhost:8000/api/`

**If errors persist:**
1. Clear node_modules: `rm -r node_modules && npm install`
2. Clear browser cache: DevTools → Application → Clear Storage
3. Restart both frontend and backend
4. Check file permissions

---

## Support

If issues persist:
1. Check `/FRONTEND_RENDERING_FIX.md` for recent changes
2. Review `/API_IMPORT_FIX_SUMMARY.md` for import fixes
3. Check browser console for specific error messages
4. Verify all files were saved correctly

---

## Implementation Date
November 12, 2025, 11:52 PM UTC+05:30

## Status
✅ **TROUBLESHOOTING GUIDE READY**
