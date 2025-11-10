from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from users.models import Department
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
            {'name': 'Roads & Traffic Department', 'code': 'ROADS'},
            {'name': 'Solid Waste Management', 'code': 'SWM'},
            {'name': 'Water Supply Department', 'code': 'WATER'},
            {'name': 'Public Health Department', 'code': 'HEALTH'},
        ]
        
        departments = {}
        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                code=dept_data['code'],
                defaults={'name': dept_data['name']}
            )
            departments[dept_data['code']] = dept
            if created:
                self.stdout.write(f'Created department: {dept.name}')
        
        return departments
    
    def create_super_admin(self):
        """Create super admin user"""
        if not User.objects.filter(email='superadmin@test.bmc.gov.in').exists():
            user = User.objects.create_user(
                username='superadmin@test.bmc.gov.in',
                email='superadmin@test.bmc.gov.in',
                password='admin123',
                full_name='BMC Super Administrator',
                phone='9876543210',
                role='super_admin',
                is_staff=True,
                is_superuser=True,
                status='active',
                is_email_verified=True,
                is_phone_verified=True,
                has_accepted_terms=True,
            )
            self.stdout.write(f'Created super admin: {user.email}')
    
    def create_department_admins(self, departments):
        """Create department admin users"""
        admins_data = [
            {
                'email': 'admin.roads@test.bmc.gov.in',
                'full_name': 'Roads Department Admin',
                'phone': '9876543211',
                'department': departments['ROADS'],
                'designation': 'Assistant Commissioner - Roads',
            },
            {
                'email': 'admin.waste@test.bmc.gov.in',
                'full_name': 'Waste Management Admin',
                'phone': '9876543212',
                'department': departments['SWM'],
                'designation': 'Assistant Commissioner - SWM',
            },
            {
                'email': 'admin.water@test.bmc.gov.in',
                'full_name': 'Water Supply Admin',
                'phone': '9876543213',
                'department': departments['WATER'],
                'designation': 'Executive Engineer - Water',
            },
        ]
        
        for admin_data in admins_data:
            if not User.objects.filter(email=admin_data['email']).exists():
                user = User.objects.create_user(
                    username=admin_data['email'],
                    email=admin_data['email'],
                    password='admin123',
                    full_name=admin_data['full_name'],
                    phone=admin_data['phone'],
                    role='admin',
                    department=admin_data['department'],
                    designation=admin_data['designation'],
                    is_staff=True,
                    status='active',
                    is_email_verified=True,
                    is_phone_verified=True,
                    has_accepted_terms=True,
                )
                self.stdout.write(f'Created admin: {user.email}')
    
    def create_ward_officers(self, departments):
        """Create ward officer users"""
        officers_data = [
            {
                'email': 'officer.bandra@test.bmc.gov.in',
                'full_name': 'Bandra Ward Officer',
                'phone': '9876543214',
                'department': departments['ROADS'],
                'designation': 'Ward Officer',
                'ward': 'H/W',
            },
            {
                'email': 'officer.andheri@test.bmc.gov.in',
                'full_name': 'Andheri Ward Officer',
                'phone': '9876543215',
                'department': departments['SWM'],
                'designation': 'Ward Officer',
                'ward': 'K/W',
            },
            {
                'email': 'officer.colaba@test.bmc.gov.in',
                'full_name': 'Colaba Ward Officer',
                'phone': '9876543216',
                'department': departments['WATER'],
                'designation': 'Ward Officer',
                'ward': 'A',
            },
        ]
        
        for officer_data in officers_data:
            if not User.objects.filter(email=officer_data['email']).exists():
                user = User.objects.create_user(
                    username=officer_data['email'],
                    email=officer_data['email'],
                    password='officer123',
                    full_name=officer_data['full_name'],
                    phone=officer_data['phone'],
                    role='officer',
                    department=officer_data['department'],
                    designation=officer_data['designation'],
                    ward=officer_data['ward'],
                    is_staff=True,
                    status='active',
                    is_email_verified=True,
                    is_phone_verified=True,
                    has_accepted_terms=True,
                )
                self.stdout.write(f'Created officer: {user.email}')
    
    def create_test_citizens(self):
        """Create test citizen users"""
        citizens_data = [
            {
                'email': 'mumbaikar1@citizen.test',
                'full_name': 'Rajesh Sharma',
                'phone': '9876543217',
                'ward': 'H/W',
                'address': 'Linking Road, Bandra West',
                'pincode': '400050',
            },
            {
                'email': 'mumbaikar2@citizen.test',
                'full_name': 'Priya Patel',
                'phone': '9876543218',
                'ward': 'K/W',
                'address': 'S.V. Road, Andheri West',
                'pincode': '400058',
            },
            {
                'email': 'mumbaikar3@citizen.test',
                'full_name': 'Amit Desai',
                'phone': '9876543219',
                'ward': 'A',
                'address': 'Colaba Causeway, Colaba',
                'pincode': '400001',
            },
        ]
        
        for citizen_data in citizens_data:
            if not User.objects.filter(email=citizen_data['email']).exists():
                user = User.objects.create_user(
                    username=citizen_data['email'],
                    email=citizen_data['email'],
                    password='citizen123',
                    full_name=citizen_data['full_name'],
                    phone=citizen_data['phone'],
                    role='citizen',
                    ward=citizen_data['ward'],
                    address=citizen_data['address'],
                    pincode=citizen_data['pincode'],
                    status='active',
                    is_email_verified=True,
                    is_phone_verified=True,
                    has_accepted_terms=True,
                )
                self.stdout.write(f'Created citizen: {user.email}')
    
    def display_credentials(self):
        """Display all test credentials"""
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('🔑 TEST CREDENTIALS'))
        self.stdout.write('='*60)
        
        self.stdout.write('\n🚀 SUPER ADMIN:')
        self.stdout.write('Email: superadmin@test.bmc.gov.in')
        self.stdout.write('Password: admin123')
        self.stdout.write('Access: Full system access')
        
        self.stdout.write('\n👥 DEPARTMENT ADMINS:')
        admins = [
            ('admin.roads@test.bmc.gov.in', 'Roads & Traffic Dept'),
            ('admin.waste@test.bmc.gov.in', 'Waste Management Dept'),
            ('admin.water@test.bmc.gov.in', 'Water Supply Dept'),
        ]
        for email, dept in admins:
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: admin123')
            self.stdout.write(f'Department: {dept}')
            self.stdout.write('')
        
        self.stdout.write('🏛️ WARD OFFICERS:')
        officers = [
            ('officer.bandra@test.bmc.gov.in', 'Bandra West (H/W)'),
            ('officer.andheri@test.bmc.gov.in', 'Andheri West (K/W)'),
            ('officer.colaba@test.bmc.gov.in', 'Colaba (A)'),
        ]
        for email, ward in officers:
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: officer123')
            self.stdout.write(f'Ward: {ward}')
            self.stdout.write('')
        
        self.stdout.write('👤 CITIZENS:')
        citizens = [
            ('mumbaikar1@citizen.test', 'Rajesh Sharma', 'Bandra West'),
            ('mumbaikar2@citizen.test', 'Priya Patel', 'Andheri West'),
            ('mumbaikar3@citizen.test', 'Amit Desai', 'Colaba'),
        ]
        for email, name, area in citizens:
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: citizen123')
            self.stdout.write(f'Name: {name} ({area})')
            self.stdout.write('')
        
        self.stdout.write('='*60)
        self.stdout.write('🌐 Frontend URL: http://localhost:5173')
        self.stdout.write('🔧 Backend API: http://localhost:8000/api')
        self.stdout.write('⚡ Admin Panel: http://localhost:8000/admin')
        self.stdout.write('='*60)