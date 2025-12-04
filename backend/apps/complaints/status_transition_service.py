"""
Complaint Status Transition Service
Handles workflow state changes, SLA tracking, and compliance enforcement
"""
from typing import Optional, Dict, Tuple
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, Avg, Count
from django.contrib.auth import get_user_model

from apps.complaints.models import Complaint, ComplaintTimeline, OfficerNotes, ComplaintResolution
from apps.departments.models import Department

User = get_user_model()


class StatusTransitionService:
    """
    Service for managing complaint status transitions with SLA tracking
    """

    # Valid state transitions
    VALID_TRANSITIONS = {
        'PENDING': ['IN_PROGRESS'],
        'IN_PROGRESS': ['RESOLVED', 'REJECTED'],
        'RESOLVED': [],  # Terminal state
        'REJECTED': [],  # Terminal state
    }

    # SLA Targets (in hours) by priority
    SLA_TARGETS = {
        'URGENT': 4,      # 4 hours
        'HIGH': 24,       # 1 day
        'MEDIUM': 72,     # 3 days
        'LOW': 168,       # 7 days
    }

    @staticmethod
    def can_transition(from_status: str, to_status: str) -> bool:
        """Check if transition is allowed"""
        return to_status in StatusTransitionService.VALID_TRANSITIONS.get(from_status, [])

    @staticmethod
    def transition_complaint(
        complaint: Complaint,
        new_status: str,
        officer: User,
        public_update: str = '',
        private_notes: str = '',
        proof_image=None
    ) -> Tuple[bool, str, Optional[Complaint]]:
        """
        Transition complaint to new status with comprehensive logging
        
        Args:
            complaint: Complaint instance
            new_status: Target status (IN_PROGRESS, RESOLVED, REJECTED)
            officer: Officer making the transition
            public_update: Message visible to citizen
            private_notes: Internal notes for team
            proof_image: Image file for RESOLVED status
            
        Returns:
            Tuple of (success, message, updated_complaint)
        """
        old_status = complaint.status

        # Validate transition
        if not StatusTransitionService.can_transition(old_status, new_status):
            return False, f"Cannot transition from {old_status} to {new_status}", None

        try:
            # Update complaint
            complaint.status = new_status
            complaint.updated_at = timezone.now()

            # Mark resolved timestamp
            if new_status == 'RESOLVED' and not complaint.resolved_at:
                complaint.resolved_at = timezone.now()

            complaint.save()

            # Create timeline entry
            ComplaintTimeline.objects.create(
                complaint=complaint,
                previous_status=old_status,
                new_status=new_status,
                updated_by=officer,
                notes=public_update or f"Status changed to {new_status}"
            )

            # Create or update officer notes
            if private_notes:
                OfficerNotes.objects.create(
                    complaint=complaint,
                    officer=officer,
                    notes=private_notes,
                    is_internal=True
                )

            # Handle RESOLVED with proof
            if new_status == 'RESOLVED':
                StatusTransitionService._create_resolution(
                    complaint=complaint,
                    officer=officer,
                    notes=public_update,
                    proof_image=proof_image
                )

            # Check and log SLA compliance
            StatusTransitionService._log_sla_compliance(complaint)

            # Update officer's performance metrics
            try:
                from apps.complaints.performance_service import PerformanceCalculationService
                PerformanceCalculationService.calculate_officer_performance(officer)
            except Exception as e:
                # Don't fail the transition if performance calculation fails
                pass

            return True, f"Complaint status updated to {new_status}", complaint

        except Exception as e:
            return False, f"Error updating complaint: {str(e)}", None

    @staticmethod
    def _create_resolution(
        complaint: Complaint,
        officer: User,
        notes: str = '',
        proof_image=None
    ) -> ComplaintResolution:
        """Create resolution record with proof"""
        resolution, created = ComplaintResolution.objects.get_or_create(
            complaint=complaint,
            defaults={
                'resolution_notes': notes or 'Issue resolved',
                'resolution_date': timezone.now(),
                'resolved_by': officer,
            }
        )

        if proof_image and created:
            resolution.proof_image = proof_image
            resolution.save()

        return resolution

    @staticmethod
    def _log_sla_compliance(complaint: Complaint) -> None:
        """Log whether SLA was met for resolved complaints"""
        if complaint.status != 'RESOLVED':
            return

        if not hasattr(complaint, 'assignment') or not complaint.assignment:
            return

        assignment = complaint.assignment
        sla_deadline = assignment.sla_deadline
        now = timezone.now()

        # Mark compliance
        was_compliant = now <= sla_deadline

        # This would update an SLA compliance log table in production
        # For now, store in notes
        if not was_compliant and complaint.resolved_at:
            OfficerNotes.objects.create(
                complaint=complaint,
                officer=complaint.assigned_to,
                notes=f"⚠️ SLA BREACH: Resolved {(complaint.resolved_at - sla_deadline).days} days late",
                is_internal=True
            )

    @staticmethod
    def get_sla_status(complaint: Complaint) -> Dict:
        """Get detailed SLA status for a complaint"""
        if not hasattr(complaint, 'assignment') or not complaint.assignment:
            return {
                'has_sla': False,
                'status': 'N/A',
                'message': 'No SLA assigned'
            }

        assignment = complaint.assignment
        now = timezone.now()
        deadline = assignment.sla_deadline
        target_hours = assignment.sla_target_days * 24

        if complaint.status == 'RESOLVED':
            # Calculate compliance for resolved complaints
            was_compliant = complaint.resolved_at <= deadline
            elapsed_hours = (complaint.resolved_at - assignment.assigned_at).total_seconds() / 3600

            return {
                'has_sla': True,
                'status': 'RESOLVED',
                'compliant': was_compliant,
                'target_hours': target_hours,
                'actual_hours': round(elapsed_hours, 1),
                'deadline': deadline.isoformat(),
                'message': f"{'✓ On time' if was_compliant else '✗ Late'}: {round(elapsed_hours, 1)}h of {target_hours}h"
            }

        else:
            # Calculate for active complaints
            elapsed_hours = (now - assignment.assigned_at).total_seconds() / 3600
            remaining_hours = (deadline - now).total_seconds() / 3600
            is_overdue = remaining_hours < 0

            if is_overdue:
                status = 'OVERDUE'
                color = 'red'
            elif remaining_hours < 4:
                status = 'CRITICAL'
                color = 'red'
            elif remaining_hours < target_hours * 0.2:
                status = 'WARNING'
                color = 'yellow'
            else:
                status = 'ON_TRACK'
                color = 'green'

            return {
                'has_sla': True,
                'status': status,
                'compliant': not is_overdue,
                'target_hours': target_hours,
                'elapsed_hours': round(elapsed_hours, 1),
                'remaining_hours': max(0, round(remaining_hours, 1)),
                'deadline': deadline.isoformat(),
                'color': color,
                'message': f"{status}: {max(0, round(remaining_hours, 1))}h remaining of {target_hours}h"
            }

    @staticmethod
    def get_officer_performance(officer: User) -> Dict:
        """Calculate officer performance metrics"""
        assignments = officer.complaint_assignments.all()

        if not assignments.exists():
            return {
                'total_assigned': 0,
                'completed': 0,
                'pending': 0,
                'completion_rate': 0,
                'avg_resolution_time': 0,
                'sla_compliance_rate': 0,
                'sla_compliant': 0,
                'sla_breached': 0,
            }

        # Get all complaints for this officer
        complaints = Complaint.objects.filter(assigned_to=officer)
        resolved = complaints.filter(status='RESOLVED')
        pending = complaints.filter(status__in=['PENDING', 'IN_PROGRESS'])

        total = complaints.count()
        resolved_count = resolved.count()
        pending_count = pending.count()

        # Calculate average resolution time
        resolutions = resolved.filter(resolved_at__isnull=False)
        if resolutions.exists():
            from django.db.models import F
            avg_time = resolutions.aggregate(
                avg_hours=Avg(
                    (F('resolved_at') - F('created_at')).total_seconds() / 3600
                )
            )['avg_hours'] or 0
        else:
            avg_time = 0

        # Calculate SLA compliance
        sla_compliant = 0
        sla_breached = 0

        for complaint in resolved:
            if hasattr(complaint, 'assignment') and complaint.assignment:
                if complaint.resolved_at <= complaint.assignment.sla_deadline:
                    sla_compliant += 1
                else:
                    sla_breached += 1

        sla_rate = (sla_compliant / resolved_count * 100) if resolved_count > 0 else 0

        return {
            'total_assigned': total,
            'completed': resolved_count,
            'pending': pending_count,
            'completion_rate': round((resolved_count / total * 100) if total > 0 else 0, 1),
            'avg_resolution_time': round(avg_time, 1),
            'sla_compliance_rate': round(sla_rate, 1),
            'sla_compliant': sla_compliant,
            'sla_breached': sla_breached,
        }

    @staticmethod
    def get_department_performance(department: Department) -> Dict:
        """Calculate department-level performance metrics"""
        complaints = Complaint.objects.filter(department=department)
        resolved = complaints.filter(status='RESOLVED')

        # Get average resolution time for department
        if resolved.exists():
            from django.db.models import F
            avg_time = resolved.aggregate(
                avg_hours=Avg(
                    (F('resolved_at') - F('created_at')).total_seconds() / 3600
                )
            )['avg_hours'] or 0
        else:
            avg_time = 0

        # Get average by priority
        avg_by_priority = {}
        for priority, _ in Complaint.PRIORITY_CHOICES:
            priority_complaints = resolved.filter(priority=priority)
            if priority_complaints.exists():
                avg = priority_complaints.aggregate(
                    avg_hours=Avg(
                        (F('resolved_at') - F('created_at')).total_seconds() / 3600
                    )
                )['avg_hours'] or 0
                avg_by_priority[priority] = round(avg, 1)

        return {
            'total_complaints': complaints.count(),
            'resolved': resolved.count(),
            'pending': complaints.filter(status__in=['PENDING', 'IN_PROGRESS']).count(),
            'avg_resolution_time': round(avg_time, 1),
            'avg_by_priority': avg_by_priority,
        }

    @staticmethod
    def check_and_escalate_overdue(complaint: Complaint) -> Optional[Dict]:
        """
        Check if complaint is overdue and needs escalation
        Returns escalation info if overdue
        """
        if not hasattr(complaint, 'assignment') or not complaint.assignment:
            return None

        sla_status = StatusTransitionService.get_sla_status(complaint)

        if sla_status.get('status') != 'OVERDUE':
            return None

        # Escalation info
        return {
            'complaint_id': complaint.id,
            'overdue_by_hours': round(
                -sla_status.get('remaining_hours', 0), 1
            ),
            'target_was': sla_status.get('target_hours'),
            'assigned_to': complaint.assigned_to,
            'requires_action': True,
            'suggested_action': 'Escalate to supervisor or reassign to more experienced officer'
        }
