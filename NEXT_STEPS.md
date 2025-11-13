# Next Steps - Frontend & Backend Setup

## Current Status

✅ **Frontend**: 
- Dev server running on `http://localhost:5173/`
- All import errors fixed
- API modules properly exported
- Page should render after backend is ready

✅ **Backend**: 
- Running on `http://localhost:8000/`
- API endpoints responding correctly
- Authentication working

⚠️ **Database**: 
- Needs to be populated with test data
- Test users not yet created

---

## Step 1: Populate Database with Test Data

### Option A: Using Django Shell (Recommended)
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On Windows:
.venv\Scripts\activate

# On Mac/Linux:
source .venv/bin/activate

# Run the test data creation script
python manage.py create_test_users --full-reset
```

### Option B: Using Python Directly
```bash
# From backend directory
python manage.py create_test_users --full-reset
```

### What Gets Created
- ✅ 4 Departments (Roads, Waste, Water, Health)
- ✅ 1 Super Admin
- ✅ 4 Department Admins
- ✅ 5 Ward Officers with Officer profiles
- ✅ 8 Test Citizens

### Test Credentials After Setup
```
Super Admin:
  Email: superadmin@test.bmc.gov.in
  Password: admin123

Department Admin (Roads):
  Email: admin.roads@test.bmc.gov.in
  Password: admin123

Ward Officer (Bandra):
  Email: officer.bandra@test.bmc.gov.in
  Password: officer123

Citizen:
  Email: arjun.sharma@citizen.test
  Password: citizen123
```

---

## Step 2: Access Frontend

### Open Browser
```
http://localhost:5173/
```

### Expected to See
1. **Login Page** with:
   - Email input field
   - Password input field
   - Login button
   - Language selector

2. **After Login** (using test credentials):
   - Dashboard
   - Complaint list
   - Officer management
   - Department management

---

## Step 3: Verify Everything Works

### Frontend Checks
- [ ] Page loads without blank screen
- [ ] Login form visible
- [ ] Can enter credentials
- [ ] Console has no errors (F12)

### Backend Checks
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Database has test data
- [ ] No server errors

### Integration Checks
- [ ] Can login with test credentials
- [ ] Can see complaints list
- [ ] Can see officers list
- [ ] Can see departments
- [ ] API calls working (Network tab)

---

## Troubleshooting

### If Frontend Still Blank
1. **Restart dev server**:
   ```bash
   taskkill /F /IM node.exe
   npm run dev
   ```

2. **Hard refresh browser**: `Ctrl + Shift + R`

3. **Check console**: `F12` → Console tab
   - Look for errors
   - Check network requests

4. **Verify backend running**: `http://localhost:8000/api/users/`
   - Should return 401 (auth required)
   - Not 404 or connection refused

### If Backend Not Responding
1. **Check if running**: `http://localhost:8000/`
2. **Start backend**: `python manage.py runserver`
3. **Check for errors**: Look at terminal output

### If Database Empty
1. **Run test data script**: `python manage.py create_test_users --full-reset`
2. **Verify data created**: `python manage.py shell`
   ```python
   from django.contrib.auth import get_user_model
   User = get_user_model()
   print(User.objects.count())  # Should be 18
   ```

---

## File References

- **Database Setup**: `/DATABASE_SETUP_GUIDE.md`
- **Frontend Fixes**: `/FRONTEND_RENDERING_FIX.md`
- **API Fixes**: `/API_IMPORT_FIX_SUMMARY.md`
- **Troubleshooting**: `/FRONTEND_TROUBLESHOOTING.md`
- **Test Credentials**: `/TEST_CREDENTIALS.md`

---

## Quick Commands Reference

### Frontend
```bash
cd frontend
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Backend
```bash
cd backend
python manage.py runserver    # Start dev server
python manage.py migrate      # Apply migrations
python manage.py create_test_users --full-reset  # Populate DB
python manage.py shell        # Django shell
```

### Database
```bash
# Create test data
python manage.py create_test_users --full-reset

# Reset only test users
python manage.py create_test_users --reset

# Create without reset
python manage.py create_test_users
```

---

## Expected Final State

### Frontend
- ✅ Running on `http://localhost:5173/`
- ✅ Login page visible
- ✅ No console errors
- ✅ Can login with test credentials

### Backend
- ✅ Running on `http://localhost:8000/`
- ✅ API endpoints responding
- ✅ Database populated with test data
- ✅ Authentication working

### Database
- ✅ 4 departments created
- ✅ 18 users created (1 admin + 4 dept admins + 5 officers + 8 citizens)
- ✅ 5 officer profiles created
- ✅ All fields populated with realistic data

---

## Implementation Timeline

1. **Populate Database** (5 minutes)
   - Run: `python manage.py create_test_users --full-reset`

2. **Verify Backend** (2 minutes)
   - Check: `http://localhost:8000/api/users/`

3. **Verify Frontend** (2 minutes)
   - Check: `http://localhost:5173/`
   - Should see login page

4. **Test Login** (2 minutes)
   - Use test credentials
   - Verify dashboard loads

5. **Test Features** (10 minutes)
   - Test complaint list
   - Test officer management
   - Test API calls

**Total Time**: ~20 minutes

---

## Support

If you encounter issues:
1. Check the relevant guide file
2. Review console errors (F12)
3. Verify both frontend and backend are running
4. Check database has test data
5. Restart services if needed

---

## Implementation Date
November 12, 2025, 11:52 PM UTC+05:30

## Status
✅ **READY FOR NEXT STEPS**
