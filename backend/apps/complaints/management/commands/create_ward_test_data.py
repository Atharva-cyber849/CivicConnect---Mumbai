"""
Management command to create test data for ward-based access testing.
Creates multiple ward officers and complaints in different wards.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from apps.departments.models import Department
from apps.users.models import Officer
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test data for ward isolation testing'

    def handle(self, *args, **options):
        # Get or create departments
        water_dept, _ = Department.objects.get_or_create(
            name='Water Supply',
            defaults={
                'email': 'water@municipality.gov',
                'description': 'Handles water supply and sewage issues'
            }
        )
        road_dept, _ = Department.objects.get_or_create(
            name='Road & Traffic',
            defaults={
                'email': 'roads@municipality.gov',
                'description': 'Handles road damage and traffic signal issues'
            }
        )

        # Create ward A officer user
        ward_a_user, user_created = User.objects.get_or_create(
            email='officer.ward.a@municipality.gov',
            defaults={
                'first_name': 'Amit',
                'last_name': 'Sharma',
                'phone': '9876543210',
                'role': 'DEPARTMENT_STAFF',
                'ward': 'A',
            }
        )
        if user_created:
            ward_a_user.set_password('testpass123')
            ward_a_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward A User: {ward_a_user.email}'))
        
        # Create Ward A officer profile
        ward_a_officer, officer_created = Officer.objects.get_or_create(
            user=ward_a_user,
            defaults={
                'department': water_dept,
                'assigned_ward': 'A',
                'role': 'DEPARTMENT_STAFF',
                'designation': 'Water Supply Officer',
                'phone': '9876543210',
            }
        )
        if officer_created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward A Officer Profile'))

        # Create ward B officer user
        ward_b_user, user_created = User.objects.get_or_create(
            email='officer.ward.b@municipality.gov',
            defaults={
                'first_name': 'Priya',
                'last_name': 'Singh',
                'phone': '9876543211',
                'role': 'DEPARTMENT_STAFF',
                'ward': 'B',
            }
        )
        if user_created:
            ward_b_user.set_password('testpass123')
            ward_b_user.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward B User: {ward_b_user.email}'))
        
        # Create Ward B officer profile
        ward_b_officer, officer_created = Officer.objects.get_or_create(
            user=ward_b_user,
            defaults={
                'department': road_dept,
                'assigned_ward': 'B',
                'role': 'DEPARTMENT_STAFF',
                'designation': 'Road & Traffic Officer',
                'phone': '9876543211',
            }
        )
        if officer_created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward B Officer Profile'))

        # Create a test citizen
        citizen, created = User.objects.get_or_create(
            email='citizen.test@gmail.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Citizen',
                'role': 'CITIZEN',
                'ward': 'A',
            }
        )
        if created:
            citizen.set_password('testpass123')
            citizen.save()
            self.stdout.write(self.style.SUCCESS(f'✓ Created Test Citizen: {citizen.email}'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Test Citizen already exists: {citizen.email}'))

        # Create complaints in Ward A
        ward_a_complaint_1, created = Complaint.objects.get_or_create(
            title='Pothole on Main Street (Ward A)',
            description='Large pothole affecting traffic flow',
            defaults={
                'category': 'ROAD_DAMAGE',
                'priority': 'HIGH',
                'user': citizen,
                'department': water_dept,
                'assigned_to': ward_a_user,
                'status': 'IN_PROGRESS',
                'address': 'Main Street, Colaba',
                'ward': 'A',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'zip_code': '400001',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward A Complaint 1: {ward_a_complaint_1.id}'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Ward A Complaint 1 already exists'))

        ward_a_complaint_2, created = Complaint.objects.get_or_create(
            title='Water Supply Issue (Ward A)',
            description='Low water pressure in the area',
            defaults={
                'category': 'WATER',
                'priority': 'MEDIUM',
                'user': citizen,
                'department': water_dept,
                'assigned_to': ward_a_user,
                'status': 'PENDING',
                'address': 'Cuffe Parade, Colaba',
                'ward': 'A',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'zip_code': '400001',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward A Complaint 2: {ward_a_complaint_2.id}'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Ward A Complaint 2 already exists'))

        # Create complaints in Ward B
        ward_b_complaint_1, created = Complaint.objects.get_or_create(
            title='Broken Traffic Signal (Ward B)',
            description='Traffic signal malfunctioning',
            defaults={
                'category': 'TRAFFIC_SIGNAL',
                'priority': 'URGENT',
                'user': citizen,
                'department': road_dept,
                'assigned_to': ward_b_user,
                'status': 'PENDING',
                'address': 'Dongri Market, Ward B',
                'ward': 'B',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'zip_code': '400003',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward B Complaint 1: {ward_b_complaint_1.id}'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Ward B Complaint 1 already exists'))

        ward_b_complaint_2, created = Complaint.objects.get_or_create(
            title='Streetlight Down (Ward B)',
            description='Street light not functioning at night',
            defaults={
                'category': 'STREETLIGHT',
                'priority': 'MEDIUM',
                'user': citizen,
                'department': road_dept,
                'assigned_to': ward_b_user,
                'status': 'IN_PROGRESS',
                'address': 'Masjid Bunder, Ward B',
                'ward': 'B',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'zip_code': '400003',
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created Ward B Complaint 2: {ward_b_complaint_2.id}'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠ Ward B Complaint 2 already exists'))

        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('TEST DATA CREATED SUCCESSFULLY'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('\n📋 TEST CREDENTIALS:\n')
        self.stdout.write(f'Ward A Officer:')
        self.stdout.write(f'  Email: officer.ward.a@municipality.gov')
        self.stdout.write(f'  Password: testpass123')
        self.stdout.write(f'  Ward: A')
        self.stdout.write(f'  Complaints: {ward_a_complaint_1.id}, {ward_a_complaint_2.id}\n')
        
        self.stdout.write(f'Ward B Officer:')
        self.stdout.write(f'  Email: officer.ward.b@municipality.gov')
        self.stdout.write(f'  Password: testpass123')
        self.stdout.write(f'  Ward: B')
        self.stdout.write(f'  Complaints: {ward_b_complaint_1.id}, {ward_b_complaint_2.id}\n')

        self.stdout.write(f'Test Citizen:')
        self.stdout.write(f'  Email: citizen.test@gmail.com')
        self.stdout.write(f'  Password: testpass123\n')

        self.stdout.write(self.style.SUCCESS('WARD ISOLATION TEST PLAN:'))
        self.stdout.write('='*60)
        self.stdout.write('1. Log in as Ward A Officer')
        self.stdout.write(f'   ✓ Can view dashboard (should show complaints {ward_a_complaint_1.id}, {ward_a_complaint_2.id})')
        self.stdout.write(f'   ✓ Can view complaint {ward_a_complaint_1.id} (Ward A)')
        self.stdout.write(f'   ✗ Cannot view complaint {ward_b_complaint_1.id} (Ward B) - Access Denied\n')

        self.stdout.write('2. Log in as Ward B Officer')
        self.stdout.write(f'   ✓ Can view dashboard (should show complaints {ward_b_complaint_1.id}, {ward_b_complaint_2.id})')
        self.stdout.write(f'   ✓ Can view complaint {ward_b_complaint_1.id} (Ward B)')
        self.stdout.write(f'   ✗ Cannot view complaint {ward_a_complaint_1.id} (Ward A) - Access Denied\n')

        self.stdout.write('3. Log in as Citizen')
        self.stdout.write(f'   ✓ Can view their own complaints')
        self.stdout.write(f'   ✗ Cannot view other complaints - Access Denied\n')
