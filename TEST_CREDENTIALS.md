# 🔑 CivicConnect - Mumbai BMC Test Credentials

## Quick Setup
```bash
# Backend (Django)
cd backend
python manage.py create_test_users --reset

# Frontend (React)
cd frontend
npm run dev
```

## 🚀 Super Admin
- **Email:** superadmin@test.bmc.gov.in
- **Password:** admin123
- **Name:** BMC Super Administrator
- **Access:** Full system access, all wards

## 👥 Department Admins
| Email | Password | Name | Department |
|-------|----------|------|------------|
| admin.roads@test.bmc.gov.in | admin123 | Suresh Kumar Patil | Roads & Traffic |
| admin.waste@test.bmc.gov.in | admin123 | Kavita Sharma | Waste Management |
| admin.water@test.bmc.gov.in | admin123 | Rajesh Deshmukh | Water Supply |
| admin.health@test.bmc.gov.in | admin123 | Dr. Priya Joshi | Public Health |

## 🏛️ Ward Officers
| Email | Password | Name | Ward |
|-------|----------|------|------|
| officer.bandra@test.bmc.gov.in | officer123 | Ravi Kumar Singh | Bandra West (H/W) |
| officer.andheri@test.bmc.gov.in | officer123 | Meera Kulkarni | Andheri West (K/W) |
| officer.colaba@test.bmc.gov.in | officer123 | Vikram Tiwari | Colaba (A) |
| officer.dadar@test.bmc.gov.in | officer123 | Asha Bhosle | Dadar East (G/N) |
| officer.malad@test.bmc.gov.in | officer123 | Santosh Yadav | Malad East (P/N) |

## 👤 Citizens

| Email | Password | Name | Ward |
|-------|----------|------|------|
| arjun.sharma@citizen.test | citizen123 | Arjun Sharma | Bandra West (H/W) |
| priya.patel@citizen.test | citizen123 | Priya Patel | Andheri West (K/W) |
| neha.kulkarni@citizen.test | citizen123 | Neha Kulkarni | Dadar East (G/N) |
| rohit.desai@citizen.test | citizen123 | Rohit Desai | Colaba (A) |
| sneha.joshi@citizen.test | citizen123 | Sneha Joshi | Sion East (F/N) |
| vikash.yadav@citizen.test | citizen123 | Vikash Yadav | Malad West (P/N) |
| kavya.menon@citizen.test | citizen123 | Kavya Menon | Bandra East (H/E) |
| ramesh.gupta@citizen.test | citizen123 | Ramesh Gupta | Mulund West (T) |

## ✨ Features Included
- ✅ Complete profile data (gender, age, location)
- ✅ GPS coordinates for mapping 
- ✅ Bilingual support (English/Marathi)
- ✅ Ward-based routing
- ✅ Verified emails and phones
- ✅ Accepted terms & conditions

## 🌐 Application URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **Admin Panel:** http://localhost:8000/admin

## 🎯 Testing Scenarios
1. **Citizen Flow:** Login as any citizen → Create complaint → Track status
2. **Officer Flow:** Login as ward officer → View assigned complaints → Update status
3. **Admin Flow:** Login as admin → View analytics → Manage departments
4. **Multi-Ward Testing:** Different citizens in different wards
5. **Bilingual Testing:** Use Marathi preference users (Kavita, Meera, Neha, Vikash)

## 📍 Ward Coverage
The test data covers 8 different Mumbai wards:
- **A Ward:** Colaba (Rohit, Officer Vikram)
- **F/N Ward:** Sion (Sneha)
- **G/N Ward:** Dadar (Neha, Officer Asha)
- **H/W Ward:** Bandra West (Arjun, Officer Ravi)
- **H/E Ward:** Bandra East (Kavya)
- **K/W Ward:** Andheri West (Priya, Officer Meera)
- **P/N Ward:** Malad (Vikash, Officer Santosh)
- **T Ward:** Mulund (Ramesh)