from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.departments.models import Department
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for different roles with sample credentials'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset existing test users before creating new ones',
        )
    
    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('Resetting existing test users...')
            User.objects.filter(email__endswith='@test.bmc.gov.in').delete()
            User.objects.filter(email__endswith='@citizen.test').delete()
        
        with transaction.atomic():
            # Create or get departments first
            departments = self.create_departments()
            
            # Create test users
            self.create_super_admin()
            self.create_department_admins(departments)
            self.create_ward_officers(departments)
            self.create_test_citizens()
            
        self.stdout.write(self.style.SUCCESS('✅ Test credentials created successfully!'))
        self.display_credentials()
    
    def create_departments(self):
        """Create sample departments"""
        departments_data = [
            {
                'name': 'Roads & Traffic Department',
                'email': 'roads@bmc.gov.in',
                'description': 'Handles road maintenance, traffic signals, and related infrastructure',
                'categories': ['POTHOLE', 'ROAD_DAMAGE', 'TRAFFIC_SIGNAL', 'MANHOLE']
            },
            {
                'name': 'Solid Waste Management',
                'email': 'waste@bmc.gov.in',
                'description': 'Manages garbage collection, waste disposal, and cleanliness',
                'categories': ['GARBAGE', 'GARBAGE_BIN', 'ILLEGAL_DUMPING']
            },
            {
                'name': 'Water Supply Department',
                'email': 'water@bmc.gov.in',
                'description': 'Handles water supply and related issues',
                'categories': ['WATER_LEAKAGE', 'WATER_SUPPLY']
            },
            {
                'name': 'Public Health Department',
                'email': 'health@bmc.gov.in',
                'description': 'Manages public health and sanitation',
                'categories': ['STRAY_ANIMALS', 'MOSQUITO']
            },
        ]
        
        departments = {}
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults={
                    'email': dept_data['email'],
                    'description': dept_data['description'],
                    'categories': dept_data['categories']
                }
            )
            departments[dept_data['name']] = dept
            if created:
                self.stdout.write(f'✅ Created department: {dept.name}')
            else:
                self.stdout.write(f'📋 Department already exists: {dept.name}')
        
        return departments
    
    def create_super_admin(self):
        """Create super admin user"""
        if not User.objects.filter(email='superadmin@test.bmc.gov.in').exists():
            user = User.objects.create_user(
                email='superadmin@test.bmc.gov.in',
                password='admin123',
                first_name='BMC Super',
                last_name='Administrator',
                phone='9876543210',
                role='ADMIN',
                gender='MALE',
                age=45,
                ward='D',  # Grant Road, Tardeo - Central location
                address='BMC Headquarters, Mahatma Gandhi Road, Fort',
                pincode='400001',
                latitude=18.9353,
                longitude=72.8350,
                language_preference='EN',
                is_staff=True,
                is_superuser=True,
                is_email_verified=True,
                is_phone_verified=True,
                has_accepted_terms=True,
            )
            self.stdout.write(f'✅ Created super admin: {user.email}')
        else:
            self.stdout.write('📋 Super admin already exists')
    
    def create_department_admins(self, departments):
        """Create department admin users"""
        admins_data = [
            {
                'email': 'admin.roads@test.bmc.gov.in',
                'full_name': 'Suresh Kumar Patil',
                'phone': '9876543211',
                'gender': 'MALE',
                'age': 42,
                'ward': 'D',
                'address': 'Roads Department Office, BMC Building, Fort',
                'pincode': '400001',
                'latitude': 18.9353,
                'longitude': 72.8350,
                'language_preference': 'EN',
                'department': departments['Roads & Traffic Department'],
                'designation': 'Assistant Commissioner - Roads',
            },
            {
                'email': 'admin.waste@test.bmc.gov.in',
                'full_name': 'Kavita Sharma',
                'phone': '9876543212',
                'gender': 'FEMALE',
                'age': 39,
                'ward': 'F/N',
                'address': 'SWM Department, Matunga Office',
                'pincode': '400019',
                'latitude': 19.0270,
                'longitude': 72.8570,
                'language_preference': 'MR',
                'department': departments['Solid Waste Management'],
                'designation': 'Assistant Commissioner - SWM',
            },
            {
                'email': 'admin.water@test.bmc.gov.in',
                'full_name': 'Rajesh Deshmukh',
                'phone': '9876543213',
                'gender': 'MALE',
                'age': 47,
                'ward': 'C',
                'address': 'Water Supply Department, Marine Lines',
                'pincode': '400002',
                'latitude': 18.9479,
                'longitude': 72.8230,
                'language_preference': 'EN',
                'department': departments['Water Supply Department'],
                'designation': 'Executive Engineer - Water',
            },
            {
                'email': 'admin.health@test.bmc.gov.in',
                'full_name': 'Dr. Priya Joshi',
                'phone': '9876543214',
                'gender': 'FEMALE',
                'age': 44,
                'ward': 'G/N',
                'address': 'Public Health Department, Dadar',
                'pincode': '400014',
                'latitude': 19.0183,
                'longitude': 72.8420,
                'language_preference': 'EN',
                'department': departments['Public Health Department'],
                'designation': 'Medical Officer',
            },
        ]
        
        for admin_data in admins_data:
            if not User.objects.filter(email=admin_data['email']).exists():
                user = User.objects.create_user(
                    email=admin_data['email'],
                    password='admin123',
                    first_name=admin_data['full_name'].split()[0],
                    last_name=' '.join(admin_data['full_name'].split()[1:]),
                    phone=admin_data['phone'],
                    role='ADMIN',
                    gender=admin_data['gender'],
                    age=admin_data['age'],
                    ward=admin_data['ward'],
                    address=admin_data['address'],
                    pincode=admin_data['pincode'],
                    latitude=admin_data['latitude'],
                    longitude=admin_data['longitude'],
                    language_preference=admin_data['language_preference'],
                    is_staff=True,
                    is_email_verified=True,
                    is_phone_verified=True,
                    has_accepted_terms=True,
                )
                self.stdout.write(f'✅ Created admin: {user.email}')
            else:
                self.stdout.write(f'📋 Admin already exists: {admin_data["email"]}')
    
    def create_ward_officers(self, departments):
        """Create ward officer users"""
        officers_data = [
            {
                'email': 'officer.bandra@test.bmc.gov.in',
                'full_name': 'Ravi Kumar Singh',
                'phone': '9876543215',
                'gender': 'MALE',
                'age': 35,
                'department': departments['Roads & Traffic Department'],
                'designation': 'Ward Officer',
                'ward': 'H/W',
                'address': 'Ward Office, Turner Road, Bandra West',
                'pincode': '400050',
                'latitude': 19.0596,
                'longitude': 72.8295,
                'language_preference': 'EN',
            },
            {
                'email': 'officer.andheri@test.bmc.gov.in',
                'full_name': 'Meera Kulkarni',
                'phone': '9876543216',
                'gender': 'FEMALE',
                'age': 32,
                'department': departments['Solid Waste Management'],
                'designation': 'Ward Officer',
                'ward': 'K/W',
                'address': 'Ward Office, Link Road, Andheri West',
                'pincode': '400053',
                'latitude': 19.1136,
                'longitude': 72.8460,
                'language_preference': 'MR',
            },
            {
                'email': 'officer.colaba@test.bmc.gov.in',
                'full_name': 'Vikram Tiwari',
                'phone': '9876543217',
                'gender': 'MALE',
                'age': 38,
                'department': departments['Water Supply Department'],
                'designation': 'Ward Officer',
                'ward': 'A',
                'address': 'Ward Office, Colaba Causeway',
                'pincode': '400005',
                'latitude': 18.9067,
                'longitude': 72.8147,
                'language_preference': 'EN',
            },
            {
                'email': 'officer.dadar@test.bmc.gov.in',
                'full_name': 'Asha Bhosle',
                'phone': '9876543218',
                'gender': 'FEMALE',
                'age': 29,
                'department': departments['Public Health Department'],
                'designation': 'Ward Officer',
                'ward': 'G/N',
                'address': 'Ward Office, Dadar East',
                'pincode': '400014',
                'latitude': 19.0176,
                'longitude': 72.8562,
                'language_preference': 'MR',
            },
            {
                'email': 'officer.malad@test.bmc.gov.in',
                'full_name': 'Santosh Yadav',
                'phone': '9876543219',
                'gender': 'MALE',
                'age': 41,
                'department': departments['Roads & Traffic Department'],
                'designation': 'Ward Officer',
                'ward': 'P/N',
                'address': 'Ward Office, Malad East',
                'pincode': '400097',
                'latitude': 19.1840,
                'longitude': 72.8495,
                'language_preference': 'EN',
            },
        ]
        
        for officer_data in officers_data:
            if not User.objects.filter(email=officer_data['email']).exists():
                user = User.objects.create_user(
                    email=officer_data['email'],
                    password='officer123',
                    first_name=officer_data['full_name'].split()[0],
                    last_name=' '.join(officer_data['full_name'].split()[1:]),
                    phone=officer_data['phone'],
                    role='DEPARTMENT_STAFF',
                    gender=officer_data['gender'],
                    age=officer_data['age'],
                    ward=officer_data['ward'],
                    address=officer_data['address'],
                    pincode=officer_data['pincode'],
                    latitude=officer_data['latitude'],
                    longitude=officer_data['longitude'],
                    language_preference=officer_data['language_preference'],
                    is_staff=True,
                    is_email_verified=True,
                    is_phone_verified=True,
                    has_accepted_terms=True,
                )
                self.stdout.write(f'✅ Created officer: {user.email} (Ward: {officer_data["ward"]})')
            else:
                self.stdout.write(f'📋 Officer already exists: {officer_data["email"]}')
    
    def create_test_citizens(self):
        """Create test citizen users"""
        citizens_data = [
            {
                'email': 'arjun.sharma@citizen.test',
                'full_name': 'Arjun Sharma',
                'phone': '9876543220',
                'gender': 'MALE',
                'age': 28,
                'ward': 'H/W',
                'address': '12/B, Linking Road, Near Station, Bandra West',
                'pincode': '400050',
                'latitude': 19.0596,
                'longitude': 72.8295,
                'language_preference': 'EN',
            },
            {
                'email': 'priya.patel@citizen.test',
                'full_name': 'Priya Patel',
                'phone': '9876543221',
                'gender': 'FEMALE',
                'age': 25,
                'ward': 'K/W',
                'address': '45, S.V. Road, Andheri West',
                'pincode': '400058',
                'latitude': 19.1136,
                'longitude': 72.8460,
                'language_preference': 'EN',
            },
            {
                'email': 'neha.kulkarni@citizen.test',
                'full_name': 'Neha Kulkarni',
                'phone': '9876543222',
                'gender': 'FEMALE',
                'age': 31,
                'ward': 'G/N',
                'address': '78, Dr. Ambedkar Road, Dadar East',
                'pincode': '400014',
                'latitude': 19.0176,
                'longitude': 72.8562,
                'language_preference': 'MR',
            },
            {
                'email': 'rohit.desai@citizen.test',
                'full_name': 'Rohit Desai',
                'phone': '9876543223',
                'gender': 'MALE',
                'age': 34,
                'ward': 'A',
                'address': '23, Colaba Causeway, Near Gateway',
                'pincode': '400001',
                'latitude': 18.9067,
                'longitude': 72.8147,
                'language_preference': 'EN',
            },
            {
                'email': 'sneha.joshi@citizen.test',
                'full_name': 'Sneha Joshi',
                'phone': '9876543224',
                'gender': 'FEMALE',
                'age': 27,
                'ward': 'F/N',
                'address': '101, Sion Circle, Sion East',
                'pincode': '400022',
                'latitude': 19.0431,
                'longitude': 72.8648,
                'language_preference': 'EN',
            },
            {
                'email': 'vikash.yadav@citizen.test',
                'full_name': 'Vikash Yadav',
                'phone': '9876543225',
                'gender': 'MALE',
                'age': 29,
                'ward': 'P/N',
                'address': '67, Link Road, Malad West',
                'pincode': '400064',
                'latitude': 19.1840,
                'longitude': 72.8495,
                'language_preference': 'MR',
            },
            {
                'email': 'kavya.menon@citizen.test',
                'full_name': 'Kavya Menon',
                'phone': '9876543226',
                'gender': 'FEMALE',
                'age': 26,
                'ward': 'H/E',
                'address': '89, LBS Road, Bandra East',
                'pincode': '400051',
                'latitude': 19.0596,
                'longitude': 72.8656,
                'language_preference': 'EN',
            },
            {
                'email': 'ramesh.gupta@citizen.test',
                'full_name': 'Ramesh Gupta',
                'phone': '9876543227',
                'gender': 'MALE',
                'age': 45,
                'ward': 'T',
                'address': '134, LBS Road, Mulund West',
                'pincode': '400080',
                'latitude': 19.1728,
                'longitude': 72.9481,
                'language_preference': 'EN',
            },
        ]
        
        for citizen_data in citizens_data:
            if not User.objects.filter(email=citizen_data['email']).exists():
                user = User.objects.create_user(
                    email=citizen_data['email'],
                    password='citizen123',
                    first_name=citizen_data['full_name'].split()[0],
                    last_name=' '.join(citizen_data['full_name'].split()[1:]),
                    phone=citizen_data['phone'],
                    role='CITIZEN',
                    gender=citizen_data['gender'],
                    age=citizen_data['age'],
                    ward=citizen_data['ward'],
                    address=citizen_data['address'],
                    pincode=citizen_data['pincode'],
                    latitude=citizen_data['latitude'],
                    longitude=citizen_data['longitude'],
                    language_preference=citizen_data['language_preference'],
                    is_email_verified=True,
                    is_phone_verified=True,
                    has_accepted_terms=True,
                )
                self.stdout.write(f'✅ Created citizen: {user.email} (Ward: {citizen_data["ward"]})')
            else:
                self.stdout.write(f'📋 Citizen already exists: {citizen_data["email"]}')
    
    def display_credentials(self):
        """Display all test credentials"""
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS('🔑 CIVICCONNECT - MUMBAI BMC TEST CREDENTIALS'))
        self.stdout.write('='*80)
        
        self.stdout.write('\n🚀 SUPER ADMIN:')
        self.stdout.write('Email: superadmin@test.bmc.gov.in')
        self.stdout.write('Password: admin123')
        self.stdout.write('Name: BMC Super Administrator')
        self.stdout.write('Access: Full system access, all wards')
        
        self.stdout.write('\n👥 DEPARTMENT ADMINS:')
        admins = [
            ('admin.roads@test.bmc.gov.in', 'Suresh Kumar Patil', 'Roads & Traffic'),
            ('admin.waste@test.bmc.gov.in', 'Kavita Sharma', 'Waste Management'),
            ('admin.water@test.bmc.gov.in', 'Rajesh Deshmukh', 'Water Supply'),
            ('admin.health@test.bmc.gov.in', 'Dr. Priya Joshi', 'Public Health'),
        ]
        for email, name, dept in admins:
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: admin123')
            self.stdout.write(f'Name: {name}')
            self.stdout.write(f'Department: {dept}')
            self.stdout.write('')
        
        self.stdout.write('🏛️ WARD OFFICERS:')
        officers = [
            ('officer.bandra@test.bmc.gov.in', 'Ravi Kumar Singh', 'Bandra West (H/W)'),
            ('officer.andheri@test.bmc.gov.in', 'Meera Kulkarni', 'Andheri West (K/W)'),
            ('officer.colaba@test.bmc.gov.in', 'Vikram Tiwari', 'Colaba (A)'),
            ('officer.dadar@test.bmc.gov.in', 'Asha Bhosle', 'Dadar East (G/N)'),
            ('officer.malad@test.bmc.gov.in', 'Santosh Yadav', 'Malad East (P/N)'),
        ]
        for email, name, ward in officers:
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: officer123')
            self.stdout.write(f'Name: {name}')
            self.stdout.write(f'Ward: {ward}')
            self.stdout.write('')
        
        self.stdout.write('👤 CITIZENS:')
        citizens = [
            ('arjun.sharma@citizen.test', 'Arjun Sharma', 'Bandra West (H/W)'),
            ('priya.patel@citizen.test', 'Priya Patel', 'Andheri West (K/W)'),
            ('neha.kulkarni@citizen.test', 'Neha Kulkarni', 'Dadar East (G/N)'),
            ('rohit.desai@citizen.test', 'Rohit Desai', 'Colaba (A)'),
            ('sneha.joshi@citizen.test', 'Sneha Joshi', 'Sion East (F/N)'),
            ('vikash.yadav@citizen.test', 'Vikash Yadav', 'Malad West (P/N)'),
            ('kavya.menon@citizen.test', 'Kavya Menon', 'Bandra East (H/E)'),
            ('ramesh.gupta@citizen.test', 'Ramesh Gupta', 'Mulund West (T)'),
        ]
        for email, name, area in citizens:
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: citizen123')
            self.stdout.write(f'Name: {name} - {area}')
            self.stdout.write('')
        
        self.stdout.write('='*80)
        self.stdout.write('🌟 FEATURES INCLUDED:')
        self.stdout.write('✅ Complete profile data (gender, age, location)')
        self.stdout.write('✅ GPS coordinates for mapping')
        self.stdout.write('✅ Bilingual support (English/Marathi)')
        self.stdout.write('✅ Ward-based routing')
        self.stdout.write('✅ Verified emails and phones')
        self.stdout.write('✅ Accepted terms & conditions')
        self.stdout.write('')
        self.stdout.write('🌐 Frontend URL: http://localhost:5173')
        self.stdout.write('🔧 Backend API: http://localhost:8000/api')
        self.stdout.write('⚡ Admin Panel: http://localhost:8000/admin')
        self.stdout.write('='*80)