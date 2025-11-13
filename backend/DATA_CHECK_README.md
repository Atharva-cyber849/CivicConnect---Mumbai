# Data Check Script

This script provides a comprehensive overview of all data available in the CivicConnect database.

## Overview

The `check_data.py` script checks and displays:

- **Users & Authentication**: Total users, superusers, staff, active users
- **Officers**: Total officers, by role, by department, by ward
- **Departments**: All departments with details
- **Complaints**: Total complaints, by status, priority, category, ward

## Usage

### Prerequisites

Make sure you're in the backend directory:

```bash
cd backend
```

### Run the Script

**Option 1: Direct execution (Recommended for PowerShell)**

```bash
python check_data.py
```

**Option 2: Using Django shell (Linux/Mac)**

```bash
python manage.py shell < check_data.py
```

**Option 3: Using Django shell (PowerShell)**

```powershell
python manage.py shell
>>> exec(open('check_data.py').read())
```

**Option 4: Using Django shell (PowerShell - Alternative)**

```powershell
Get-Content check_data.py | python manage.py shell
```

## Output

The script will display:

### 1. Users & Authentication
- Total count of users
- Count of superusers, staff, and active users
- Details of each user (email, name, role, status, dates)

### 2. Officers
- Total officers by role (ADMIN, OFFICER)
- Officers by department (ROADS, WASTE, WATER, HEALTH)
- Officers by assigned ward
- Detailed information for each officer

### 3. Departments
- Total departments
- Department name, code, description, status
- Creation dates

### 4. Complaints
- Total complaints
- Breakdown by status (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- Breakdown by priority (LOW, MEDIUM, HIGH, CRITICAL)
- Breakdown by category
- Breakdown by ward
- Detailed information for first 5 complaints

### 5. Summary Statistics
- Quick overview of all data counts

## Example Output

```
================================================================================
  USERS & AUTHENTICATION DATA
================================================================================

✓ Total Users: 15
  - Superusers: 1
  - Staff: 5
  - Active: 14

--------------------------------------------------------------------------------
  User Details
--------------------------------------------------------------------------------

  ID: 1
  Email: superadmin@test.bmc.gov.in
  Name: BMC Super Administrator
  Username: superadmin
  Is Staff: True
  Is Superuser: True
  Is Active: True
  Created: 2024-01-15 10:30:00
  Last Login: 2024-11-12 15:45:00
```

## What Data is Checked

### Users Table
- `id`, `email`, `username`, `first_name`, `last_name`
- `is_staff`, `is_superuser`, `is_active`
- `date_joined`, `last_login`

### Officers Table
- `id`, `first_name`, `last_name`, `email`, `username`, `phone`
- `role` (ADMIN, OFFICER)
- `department` (ROADS, WASTE, WATER, HEALTH)
- `assigned_ward` (A, B, C, D, etc.)
- `designation`, `is_active`
- `created_at`, `updated_at`

### Departments Table
- `id`, `name`, `code`, `description`
- `is_active`, `created_at`

### Complaints Table
- `id`, `title`, `description`, `status`, `priority`
- `category`, `subcategory`, `ward`
- `address`, `latitude`, `longitude`
- `user` (citizen), `created_at`, `updated_at`
- Related images and attachments

## Troubleshooting

### Script doesn't run
- Make sure you're in the `backend` directory
- Check that Django is properly installed: `pip install -r requirements.txt`
- Ensure `.env` file is configured

### No data appears
- Check database connection in `.env`
- Run migrations: `python manage.py migrate`
- Verify data exists in database

### Import errors
- Ensure all models are properly imported
- Check that app names in `INSTALLED_APPS` match the import paths

## Related Scripts

- `check_complaints.py` - Focused check on complaints data
- `simulate_api.py` - Simulates API responses

## Notes

- The script displays first 10 officers and first 5 complaints to avoid overwhelming output
- All dates are formatted as `YYYY-MM-DD HH:MM:SS`
- The script is read-only and doesn't modify any data
- Use this script to verify data before frontend development
