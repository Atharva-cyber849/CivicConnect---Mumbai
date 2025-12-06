# User Credentials - Snap & Report System

## Overview
This document lists all user accounts available in the database for testing and demonstration purposes.

**Total Users: 13**

---

## Super Admin (System-Wide Access)

### Super Admin Account
- **Name**: Super Admin
- **Email**: `superadmin@bmc.gov.in`
- **Phone**: 9990000001
- **Role**: ADMIN (Super Admin)
- **Permissions**: Full system access
- **Access**: Can manage all departments, wards, users, and system settings

**Login URL**: http://localhost:5173/admin/login

---

## Department Admins (Department-Level Access)

### Roads & Infrastructure Department
- **Name**: Priya Sharma
- **Email**: `deptadmin.roads@bmc.gov.in`
- **Phone**: 9990000011
- **Department**: Roads & Infrastructure (ID: 7)
- **Role**: Department Administrator
- **Permissions**: Manage complaints and officers within Roads department

### Solid Waste Management Department
- **Name**: Rahul Patel
- **Email**: `deptadmin.waste@bmc.gov.in`
- **Phone**: 9990000012
- **Department**: Solid Waste Management
- **Role**: Department Administrator
- **Permissions**: Manage complaints and officers within Waste Management department

### Water Supply Department
- **Name**: Anjali Desai
- **Email**: `deptadmin.water@bmc.gov.in`
- **Phone**: 9990000013
- **Department**: Water Supply
- **Role**: Department Administrator
- **Permissions**: Manage complaints and officers within Water Supply department

**Login URL**: http://localhost:5173/admin/login

---

## Ward Officers (Ward-Level Access)

### Bandra Ward Officer
- **Name**: Vikram Singh
- **Email**: `officer.bandra@bmc.gov.in`
- **Phone**: 9990000021
- **Ward**: Bandra
- **Role**: Department Staff (Ward Officer)
- **Permissions**: Handle complaints assigned to Bandra ward

### Andheri Ward Officer
- **Name**: Neha Gupta
- **Email**: `officer.andheri@bmc.gov.in`
- **Phone**: 9990000022
- **Ward**: Andheri
- **Role**: Department Staff (Ward Officer)
- **Permissions**: Handle complaints assigned to Andheri ward

### Colaba Ward Officer
- **Name**: Arjun Nair
- **Email**: `officer.colaba@bmc.gov.in`
- **Phone**: 9990000023
- **Ward**: Colaba
- **Role**: Department Staff (Ward Officer)
- **Permissions**: Handle complaints assigned to Colaba ward

### Dadar Ward Officer
- **Name**: Kavita Joshi
- **Email**: `officer.dadar@bmc.gov.in`
- **Phone**: 9990000024
- **Ward**: Dadar
- **Role**: Department Staff (Ward Officer)
- **Permissions**: Handle complaints assigned to Dadar ward

### Malad Ward Officer
- **Name**: Suresh Kumar
- **Email**: `officer.malad@bmc.gov.in`
- **Phone**: 9990000025
- **Ward**: Malad
- **Role**: Department Staff (Ward Officer)
- **Permissions**: Handle complaints assigned to Malad ward

**Login URL**: http://localhost:5173/admin/login

---

## Citizens (Public Users)

### Citizen 1 - Bandra
- **Name**: Amit Verma
- **Email**: `citizen1@gmail.com`
- **Phone**: 9990000031
- **Ward**: Bandra
- **Role**: Citizen
- **Permissions**: File and track complaints

### Citizen 2 - Andheri
- **Name**: Sneha Rao
- **Email**: `citizen2@gmail.com`
- **Phone**: 9990000032
- **Ward**: Andheri
- **Role**: Citizen
- **Permissions**: File and track complaints

### Citizen 3 - Dadar
- **Name**: Rohan Mehta
- **Email**: `citizen3@gmail.com`
- **Phone**: 9990000033
- **Ward**: Dadar
- **Role**: Citizen
- **Permissions**: File and track complaints

### Citizen 4
- **Name**: Atharva Naik
- **Email**: `citizen4@gmail.com`
- **Phone**: 8451893624
- **Ward**: Not assigned
- **Role**: Citizen
- **Permissions**: File and track complaints

**Login URL**: http://localhost:5173/login

---

## Default Passwords

**Note**: The default password for all test accounts should be set during the database setup process. 

Common default passwords to try:
- `admin123` (for admin accounts)
- `password123`
- `test123`
- Check your `setup.bat` or database initialization scripts for the actual password

---

## Access URLs

- **Citizen Portal**: http://localhost:5173/
- **Citizen Login**: http://localhost:5173/login
- **Admin Portal**: http://localhost:5173/admin
- **Admin Login**: http://localhost:5173/admin/login

---

## Profile Information

All users now have complete profile information including:
- ✅ First Name
- ✅ Last Name
- ✅ Email Address
- ✅ Phone Number
- ✅ Ward Assignment (for officers and citizens)
- ✅ Department Assignment (for department admins and officers)
- ✅ Role-based permissions

### Profile Pages
Users can view and update their profile information at:
- **Admin/Officer Profile**: `/admin/profile`
- **Citizen Profile**: `/profile`

Profile pages now automatically fetch fresh user data from the database on load.

---

## Testing Workflows

### For Super Admin Testing
1. Login with `superadmin@bmc.gov.in`
2. Access: Dashboard, User Management, All Complaints, All Departments, Reports, Analytics
3. Test: Approve/reject registration requests, manage all users

### For Department Admin Testing
1. Login with `deptadmin.roads@bmc.gov.in` (or any dept admin)
2. Access: Department Dashboard, Department Complaints, Assign Officers
3. Test: View complaints in your department, assign to ward officers

### For Ward Officer Testing
1. Login with `officer.bandra@bmc.gov.in` (or any officer)
2. Access: Ward Dashboard, Assigned Complaints
3. Test: Update complaint status, add comments, resolve issues

### For Citizen Testing
1. Login with `citizen1@gmail.com` (or any citizen)
2. Access: File Complaints, Track Complaints, Profile
3. Test: Submit new complaints, track status, update profile

---

## Database Query Commands

To fetch all credentials from the database:
```bash
cd backend
python manage.py shell -c "from apps.users.models import User; users = User.objects.all(); [print(f'Name: {u.first_name} {u.last_name}\nEmail: {u.email}\nRole: {u.role}\nPhone: {u.phone}\n---') for u in users]"
```

To fetch a specific user:
```bash
python manage.py shell -c "from apps.users.models import User; user = User.objects.get(email='superadmin@bmc.gov.in'); print(f'{user.first_name} {user.last_name}\n{user.email}\n{user.phone}\n{user.role}')"
```

---

## Notes

- All admin and officer accounts have `is_staff=True`
- Only the super admin has `is_superuser=True`
- Citizen accounts have `is_staff=False` and `is_superuser=False`
- All accounts are active (`is_active=True`)
- Profile information is now automatically synced when accessing profile pages
- Users should see their complete information (name, email, phone, department, ward) in the sidebar and profile pages

---

## Troubleshooting

### Profile Not Showing Data
1. **Clear browser cache and localStorage**
   - Open browser DevTools (F12)
   - Go to Application > Local Storage
   - Clear all items
   - Refresh page

2. **Log out and log back in**
   - The profile pages now fetch fresh data from the API
   - This will update your session with complete user information

3. **Check API response**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for `/api/users/profile/` request
   - Verify the response contains all user fields

### Database Not Updated
If you made changes to user data directly in the database:
```bash
cd backend
python manage.py shell -c "from django.core.management import call_command; call_command('migrate')"
```

---

**Last Updated**: December 6, 2025
