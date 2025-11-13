# Database Setup & Population Guide

## Overview
Complete guide for resetting and populating the CivicConnect database with test data including all departments, users, and officer profiles.

## Quick Start

### Full Database Reset & Populate
```bash
# Navigate to backend directory
cd backend

# Run full reset and populate
python manage.py create_test_users --full-reset
```

### Reset Only Test Users
```bash
python manage.py create_test_users --reset
```

### Create Without Reset
```bash
python manage.py create_test_users
```

---

## What Gets Created

### 1. Departments (4 total)

#### Roads & Traffic Department
- **Email**: roads@bmc.gov.in
- **Categories**: POTHOLE, ROAD_DAMAGE, TRAFFIC_SIGNAL, MANHOLE
- **Description**: Handles road maintenance, traffic signals, and related infrastructure

#### Solid Waste Management
- **Email**: waste@bmc.gov.in
- **Categories**: GARBAGE, GARBAGE_BIN, ILLEGAL_DUMPING
- **Description**: Manages garbage collection, waste disposal, and cleanliness

#### Water Supply Department
- **Email**: water@bmc.gov.in
- **Categories**: WATER_LEAKAGE, WATER_SUPPLY
- **Description**: Handles water supply and related issues

#### Public Health Department
- **Email**: health@bmc.gov.in
- **Categories**: STRAY_ANIMALS, MOSQUITO
- **Description**: Manages public health and sanitation

---

### 2. Super Admin (1 user)

**Email**: superadmin@test.bmc.gov.in  
**Password**: admin123  
**Name**: BMC Super Administrator  
**Role**: ADMIN (Superuser)  
**Ward**: D (Fort - Central Mumbai)  
**Access**: Full system access, all wards, all departments

---

### 3. Department Admins (4 users)

#### Roads & Traffic Admin
- **Email**: admin.roads@test.bmc.gov.in
- **Password**: admin123
- **Name**: Suresh Kumar Patil
- **Designation**: Assistant Commissioner - Roads
- **Department**: Roads & Traffic Department
- **Ward**: D (Fort)
- **Gender**: Male, Age: 42

#### Waste Management Admin
- **Email**: admin.waste@test.bmc.gov.in
- **Password**: admin123
- **Name**: Kavita Sharma
- **Designation**: Assistant Commissioner - SWM
- **Department**: Solid Waste Management
- **Ward**: F/N (Matunga)
- **Gender**: Female, Age: 39

#### Water Supply Admin
- **Email**: admin.water@test.bmc.gov.in
- **Password**: admin123
- **Name**: Rajesh Deshmukh
- **Designation**: Executive Engineer - Water
- **Department**: Water Supply Department
- **Ward**: C (Marine Lines)
- **Gender**: Male, Age: 47

#### Public Health Admin
- **Email**: admin.health@test.bmc.gov.in
- **Password**: admin123
- **Name**: Dr. Priya Joshi
- **Designation**: Medical Officer
- **Department**: Public Health Department
- **Ward**: G/N (Dadar)
- **Gender**: Female, Age: 44

---

### 4. Ward Officers (5 users + Officer Profiles)

#### Bandra West Officer
- **Email**: officer.bandra@test.bmc.gov.in
- **Password**: officer123
- **Name**: Ravi Kumar Singh
- **Designation**: Ward Officer
- **Department**: Roads & Traffic Department
- **Ward**: H/W (Bandra West)
- **Gender**: Male, Age: 35
- **Officer Profile**: Created with all fields

#### Andheri West Officer
- **Email**: officer.andheri@test.bmc.gov.in
- **Password**: officer123
- **Name**: Meera Kulkarni
- **Designation**: Ward Officer
- **Department**: Solid Waste Management
- **Ward**: K/W (Andheri West)
- **Gender**: Female, Age: 32
- **Officer Profile**: Created with all fields

#### Colaba Officer
- **Email**: officer.colaba@test.bmc.gov.in
- **Password**: officer123
- **Name**: Vikram Tiwari
- **Designation**: Ward Officer
- **Department**: Water Supply Department
- **Ward**: A (Colaba)
- **Gender**: Male, Age: 38
- **Officer Profile**: Created with all fields

#### Dadar East Officer
- **Email**: officer.dadar@test.bmc.gov.in
- **Password**: officer123
- **Name**: Asha Bhosle
- **Designation**: Ward Officer
- **Department**: Public Health Department
- **Ward**: G/N (Dadar East)
- **Gender**: Female, Age: 29
- **Officer Profile**: Created with all fields

#### Malad East Officer
- **Email**: officer.malad@test.bmc.gov.in
- **Password**: officer123
- **Name**: Santosh Yadav
- **Designation**: Ward Officer
- **Department**: Roads & Traffic Department
- **Ward**: P/N (Malad East)
- **Gender**: Male, Age: 41
- **Officer Profile**: Created with all fields

---

### 5. Citizens (8 users)

#### Arjun Sharma
- **Email**: arjun.sharma@citizen.test
- **Password**: citizen123
- **Ward**: H/W (Bandra West)
- **Gender**: Male, Age: 28

#### Priya Patel
- **Email**: priya.patel@citizen.test
- **Password**: citizen123
- **Ward**: K/W (Andheri West)
- **Gender**: Female, Age: 25

#### Neha Kulkarni
- **Email**: neha.kulkarni@citizen.test
- **Password**: citizen123
- **Ward**: G/N (Dadar East)
- **Gender**: Female, Age: 31

#### Rohit Desai
- **Email**: rohit.desai@citizen.test
- **Password**: citizen123
- **Ward**: A (Colaba)
- **Gender**: Male, Age: 34

#### Sneha Joshi
- **Email**: sneha.joshi@citizen.test
- **Password**: citizen123
- **Ward**: F/N (Sion East)
- **Gender**: Female, Age: 27

#### Vikash Yadav
- **Email**: vikash.yadav@citizen.test
- **Password**: citizen123
- **Ward**: P/N (Malad West)
- **Gender**: Male, Age: 29

#### Kavya Menon
- **Email**: kavya.menon@citizen.test
- **Password**: citizen123
- **Ward**: H/E (Bandra East)
- **Gender**: Female, Age: 26

#### Ramesh Gupta
- **Email**: ramesh.gupta@citizen.test
- **Password**: citizen123
- **Ward**: T (Mulund West)
- **Gender**: Male, Age: 45

---

## Database Reset Details

### Full Reset (`--full-reset`)
Deletes:
- ✅ All Users
- ✅ All Officer profiles
- ✅ All Departments

Then recreates everything from scratch.

### Partial Reset (`--reset`)
Deletes:
- ✅ Users with emails ending in `@test.bmc.gov.in`
- ✅ Users with emails ending in `@citizen.test`

Keeps:
- ✅ Departments (recreated if missing)
- ✅ Officer profiles (recreated if missing)

### No Reset (default)
- ✅ Creates only missing departments
- ✅ Creates only missing users
- ✅ Creates only missing officer profiles
- ✅ Skips existing records

---

## Officer Profile Fields

Each Officer profile includes:
- **user**: OneToOne relationship to User
- **department**: ForeignKey to Department
- **assigned_ward**: Ward code (e.g., 'H/W')
- **role**: DEPARTMENT_STAFF
- **designation**: Officer title
- **phone**: Contact number
- **email**: Email address
- **is_active**: Active status (default: True)
- **complaints_handled**: Counter (default: 0)
- **average_resolution_time**: Float (default: 0.0)
- **created_at**: Timestamp
- **updated_at**: Timestamp

---

## User Profile Fields

All users include:
- **email**: Unique email address
- **password**: Hashed password
- **first_name**: First name
- **last_name**: Last name
- **phone**: 10-digit phone number
- **role**: ADMIN, DEPARTMENT_STAFF, or CITIZEN
- **gender**: MALE or FEMALE
- **age**: Age in years
- **ward**: Ward code
- **address**: Full address
- **pincode**: 6-digit postal code
- **latitude**: GPS latitude
- **longitude**: GPS longitude
- **language_preference**: EN or MR
- **is_staff**: Staff status
- **is_superuser**: Superuser status (admin only)
- **is_email_verified**: Email verification status
- **is_phone_verified**: Phone verification status
- **has_accepted_terms**: Terms acceptance status

---

## Department Fields

Each department includes:
- **name**: Department name
- **email**: Department email
- **description**: Department description
- **categories**: List of complaint categories handled

---

## Verification After Setup

### Check Departments
```bash
python manage.py shell
>>> from apps.departments.models import Department
>>> Department.objects.count()  # Should be 4
>>> Department.objects.all().values_list('name', flat=True)
```

### Check Users
```bash
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.count()  # Should be 18 (1 super admin + 4 admins + 5 officers + 8 citizens)
>>> User.objects.filter(role='ADMIN').count()  # Should be 5
>>> User.objects.filter(role='DEPARTMENT_STAFF').count()  # Should be 5
>>> User.objects.filter(role='CITIZEN').count()  # Should be 8
```

### Check Officer Profiles
```bash
>>> from apps.users.models import Officer
>>> Officer.objects.count()  # Should be 5
>>> Officer.objects.all().values_list('user__email', 'assigned_ward')
```

---

## Testing the Setup

### Login as Super Admin
```
Email: superadmin@test.bmc.gov.in
Password: admin123
```

### Login as Department Admin
```
Email: admin.roads@test.bmc.gov.in
Password: admin123
```

### Login as Ward Officer
```
Email: officer.bandra@test.bmc.gov.in
Password: officer123
```

### Login as Citizen
```
Email: arjun.sharma@citizen.test
Password: citizen123
```

---

## API Testing

### Get All Officers
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/users/officers/
```

### Get Officer by ID
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/users/officers/1/
```

### Filter Officers by Department
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/users/officers/by_department/?department_id=1"
```

### Filter Officers by Ward
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/users/officers/by_ward/?ward=H/W"
```

---

## Troubleshooting

### Issue: "Officer model not found"
**Solution**: Make sure migrations are applied
```bash
python manage.py migrate
```

### Issue: "Department not created"
**Solution**: Check if Department model exists
```bash
python manage.py makemigrations
python manage.py migrate
```

### Issue: "User creation failed"
**Solution**: Check User model has all required fields
```bash
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User._meta.get_fields()
```

### Issue: "Officer profile not created"
**Solution**: Ensure Officer model has OneToOne relationship with User
```bash
python manage.py shell
>>> from apps.users.models import Officer
>>> Officer._meta.get_fields()
```

---

## Script Features

✅ **Atomic Transactions**: All operations wrapped in transaction.atomic()  
✅ **Idempotent**: Can be run multiple times safely  
✅ **Verbose Output**: Shows creation status for each record  
✅ **Error Handling**: Graceful handling of duplicate records  
✅ **Flexible**: Supports full reset, partial reset, or create-only modes  
✅ **Complete Data**: All user fields populated with realistic data  
✅ **Officer Profiles**: Automatically creates Officer profiles for officers  
✅ **GPS Coordinates**: Realistic Mumbai ward coordinates  
✅ **Bilingual**: Support for English and Marathi preferences  

---

## File Location

**Script**: `/backend/apps/users/management/commands/create_test_users.py`

**Size**: ~550 lines  
**Last Updated**: November 12, 2025  
**Status**: ✅ Production Ready

---

## Related Files

- `/backend/apps/users/models.py` - User and Officer models
- `/backend/apps/departments/models.py` - Department model
- `/backend/apps/complaints/models.py` - Complaint model
- `/TEST_CREDENTIALS.md` - Test credentials reference

---

## Summary

The database setup script provides:
- ✅ 4 departments with categories
- ✅ 1 super admin with full access
- ✅ 4 department admins
- ✅ 5 ward officers with Officer profiles
- ✅ 8 test citizens
- ✅ Complete profile data for all users
- ✅ Realistic Mumbai ward assignments
- ✅ GPS coordinates for mapping
- ✅ Bilingual support (EN/MR)
- ✅ Verified emails and phones

**Total Records**: 18 users + 5 officer profiles + 4 departments = 27 records

**Ready for**: Testing, Development, Demonstration, QA

---

## Implementation Date
November 12, 2025

## Status
✅ **COMPLETE AND READY FOR USE**
