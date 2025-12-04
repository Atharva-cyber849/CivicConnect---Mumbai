"""
Complaint Assignment Service
Handles intelligent routing, load balancing, and assignment of complaints to officers.
"""
from typing import Optional, List, Dict, Tuple
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from apps.complaints.models import Complaint, ComplaintAssignment, ComplaintReassignment
from apps.departments.models import Department, DepartmentStaff

User = get_user_model()


class ComplaintAssignmentService:
    """
    Service for intelligent complaint assignment based on:
    1. Category → Department mapping
    2. Ward → Officer filtering
    3. Load balancing (fewest open complaints)
    4. SLA tracking with assignment timestamp
    5. Email notification dispatch
    """

    # Mapping of complaint categories to departments
    CATEGORY_DEPARTMENT_MAPPING = {
        'POTHOLE': 'Roads & Traffic Department',
        'ROAD_DAMAGE': 'Roads & Traffic Department',
        'TRAFFIC_SIGNAL': 'Roads & Traffic Department',
        'STREETLIGHT': 'Street Lighting',
        'GARBAGE': 'Solid Waste Management',
        'WATER': 'Water Supply',
        'SEWAGE': 'Sewage & Drainage',
        'PARK': 'Gardens & Parks',
        'NOISE': 'Public Health',
        'OTHER': 'Other Services',
    }

    # SLA (Service Level Agreement) targets in days by priority
    SLA_TARGETS = {
        'URGENT': 1,  # 1 day
        'HIGH': 3,    # 3 days
        'MEDIUM': 7,  # 7 days
        'LOW': 14,    # 14 days
    }

    @staticmethod
    def assign_complaint(complaint: Complaint) -> Optional[User]:
        """
        Main method to assign a complaint to an appropriate officer.
        
        Process:
        1. Match category to department
        2. Filter officers by ward and department
        3. Apply load balancing (fewest open complaints)
        4. Record assignment timestamp
        5. Send email notification
        
        Args:
            complaint: Complaint instance to assign
            
        Returns:
            Assigned user/officer or None if assignment not possible
        """
        # Step 1: Determine appropriate department
        department = ComplaintAssignmentService._get_department(complaint.category)
        if not department:
            print(f"Warning: No department found for category {complaint.category}")
            return None

        # Set department on complaint
        complaint.department = department
        complaint.save()

        # Step 2: Find eligible officers in the complaint's ward
        eligible_officers = ComplaintAssignmentService._get_eligible_officers(
            department=department,
            ward=complaint.ward
        )

        if not eligible_officers:
            print(f"Warning: No eligible officers in ward {complaint.ward} for department {department.name}")
            return None

        # Step 3: Apply load balancing - select officer with fewest open complaints
        assigned_officer = ComplaintAssignmentService._select_officer_by_load(
            eligible_officers
        )

        if not assigned_officer:
            return None

        # Step 4: Record assignment
        complaint.assigned_to = assigned_officer
        complaint.assigned_officer = assigned_officer
        complaint.status = 'PENDING'  # Mark as awaiting officer action
        complaint.save()

        # Create assignment record for SLA tracking
        assignment = ComplaintAssignment.objects.create(
            complaint=complaint,
            assigned_to=assigned_officer,
            department=department,
            assigned_at=timezone.now(),
            sla_target_days=ComplaintAssignmentService.SLA_TARGETS.get(
                complaint.priority, 7
            )
        )

        # Step 5: Send email notification to officer
        ComplaintAssignmentService._send_assignment_email(
            complaint=complaint,
            officer=assigned_officer,
            department=department
        )

        return assigned_officer

    @staticmethod
    def _get_department(category: str) -> Optional[Department]:
        """
        Match complaint category to appropriate department.
        
        Args:
            category: Complaint category
            
        Returns:
            Department instance or None
        """
        department_name = ComplaintAssignmentService.CATEGORY_DEPARTMENT_MAPPING.get(
            category,
            'Other Services'
        )

        try:
            return Department.objects.get(
                name=department_name,
                is_active=True
            )
        except Department.DoesNotExist:
            # Fallback: try to find any active department
            return Department.objects.filter(is_active=True).first()

    @staticmethod
    def _get_eligible_officers(
        department: Department,
        ward: str
    ) -> List[User]:
        """
        Filter officers who are:
        1. Members of the specified department
        2. Assigned to the complaint's ward
        3. Marked as available for assignment
        
        Args:
            department: Department instance
            ward: Ward code (e.g., 'A', 'B', 'F/N')
            
        Returns:
            List of eligible officers
        """
        eligible_officers = User.objects.filter(
            Q(department_memberships__department=department) &
            Q(department_memberships__can_be_assigned=True) &
            Q(ward=ward) &
            Q(role='DEPARTMENT_STAFF')
        ).distinct()

        return list(eligible_officers)

    @staticmethod
    def _select_officer_by_load(officers: List[User]) -> Optional[User]:
        """
        Select officer with fewest open complaints (load balancing).
        
        Algorithm:
        - Count open complaints (PENDING, IN_PROGRESS) for each officer
        - Return officer with lowest count
        - Implements simple round-robin, could be upgraded to ML-based optimization
        
        Args:
            officers: List of eligible officers
            
        Returns:
            Selected officer or None
        """
        if not officers:
            return None

        if len(officers) == 1:
            return officers[0]

        # Count open complaints for each officer
        officer_loads = {}
        for officer in officers:
            open_count = Complaint.objects.filter(
                assigned_to=officer,
                status__in=['PENDING', 'IN_PROGRESS']
            ).count()
            officer_loads[officer] = open_count

        # Select officer with minimum load
        assigned_officer = min(officer_loads, key=officer_loads.get)
        return assigned_officer

    @staticmethod
    def _send_assignment_email(
        complaint: Complaint,
        officer: User,
        department: Department
    ) -> bool:
        """
        Send email notification to assigned officer with complaint details.
        
        Args:
            complaint: Assigned complaint
            officer: Assigned officer
            department: Department handling complaint
            
        Returns:
            True if email sent successfully
        """
        try:
            context = {
                'officer_name': officer.get_full_name() or officer.email,
                'complaint_id': complaint.id,
                'complaint_title': complaint.title,
                'complaint_description': complaint.description,
                'complaint_category': complaint.get_category_display(),
                'complaint_priority': complaint.get_priority_display(),
                'complaint_ward': complaint.ward,
                'complaint_address': complaint.address,
                'complaint_created': complaint.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'citizen_name': complaint.user.get_full_name() or complaint.user.email,
                'citizen_contact': complaint.user.phone or 'Not provided',
                'department_name': department.name,
                'system_url': settings.FRONTEND_URL,
                'complaint_detail_url': f"{settings.FRONTEND_URL}/admin/complaints/{complaint.id}",
            }

            subject = f"New Complaint Assignment - {complaint.title[:50]}"

            # Render HTML email template
            html_message = render_to_string(
                'emails/complaint_assignment_notification.html',
                context
            )

            # Send email
            send_mail(
                subject=subject,
                message=f"A new complaint has been assigned to you: {complaint.title}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[officer.email],
                html_message=html_message,
                fail_silently=False,
            )

            return True

        except Exception as e:
            print(f"Error sending assignment email to {officer.email}: {str(e)}")
            return False

    @staticmethod
    def reassign_complaint(
        complaint: Complaint,
        reason: str
    ) -> Optional[User]:
        """
        Reassign a complaint to a different officer.
        
        Args:
            complaint: Complaint to reassign
            reason: Reason for reassignment
            
        Returns:
            New assigned officer or None
        """
        # Create history record of reassignment
        if complaint.assigned_to:
            ComplaintReassignment.objects.create(
                complaint=complaint,
                previously_assigned_to=complaint.assigned_to,
                reason=reason,
                reassigned_at=timezone.now()
            )

        # Assign to new officer
        return ComplaintAssignmentService.assign_complaint(complaint)

    @staticmethod
    def get_assignment_stats(officer: User) -> Dict:
        """
        Get assignment statistics for an officer.
        
        Args:
            officer: Officer user instance
            
        Returns:
            Dictionary with assignment stats
        """
        assignments = ComplaintAssignment.objects.filter(assigned_to=officer)

        total_assigned = assignments.count()
        completed = Complaint.objects.filter(
            assigned_to=officer,
            status='RESOLVED'
        ).count()
        pending = Complaint.objects.filter(
            assigned_to=officer,
            status__in=['PENDING', 'IN_PROGRESS']
        ).count()

        # Calculate average resolution time
        resolved_complaints = Complaint.objects.filter(
            assigned_to=officer,
            status='RESOLVED',
            resolved_at__isnull=False
        )

        avg_resolution_days = 0
        if resolved_complaints.exists():
            from django.db.models import Avg
            from django.db.models.functions import ExtractDay
            total_days = sum(
                (c.resolved_at - c.created_at).days
                for c in resolved_complaints
            )
            avg_resolution_days = total_days // len(resolved_complaints)

        # Check SLA compliance
        overdue_assignments = ComplaintAssignment.objects.filter(
            assigned_to=officer,
            complaint__status__in=['PENDING', 'IN_PROGRESS'],
            sla_deadline__lt=timezone.now()
        ).count()

        return {
            'total_assigned': total_assigned,
            'completed': completed,
            'pending': pending,
            'completion_rate': (completed / total_assigned * 100) if total_assigned > 0 else 0,
            'avg_resolution_days': avg_resolution_days,
            'sla_breaches': overdue_assignments,
            'sla_compliance_rate': (
                ((total_assigned - overdue_assignments) / total_assigned * 100)
                if total_assigned > 0 else 100
            ),
        }




# Models are imported from apps.complaints.models
# See ComplaintAssignment and ComplaintReassignment in models.py
