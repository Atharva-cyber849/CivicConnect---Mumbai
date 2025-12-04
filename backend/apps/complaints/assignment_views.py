"""
Complaint Assignment API Endpoints
Handles assignment operations and SLA tracking
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count
from django.contrib.auth import get_user_model

from apps.complaints.models import Complaint
from apps.complaints.assignment_service import (
    ComplaintAssignmentService,
    ComplaintAssignment,
    ComplaintReassignment,
)
from apps.complaints.assignment_serializers import (
    ComplaintAssignmentSerializer,
    ComplaintReassignmentSerializer,
    AssignmentStatsSerializer,
    ManualAssignmentSerializer,
)

User = get_user_model()


class ComplaintAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing complaint assignments.
    Provides endpoints for:
    - Viewing assignments
    - Checking SLA status
    - Getting officer statistics
    - Reassigning complaints
    """
    queryset = ComplaintAssignment.objects.select_related(
        'complaint', 'assigned_to', 'department'
    )
    serializer_class = ComplaintAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter assignments based on user role"""
        user = self.request.user

        # Superadmin sees all
        if user.is_superuser:
            return ComplaintAssignment.objects.select_related(
                'complaint', 'assigned_to', 'department'
            )

        # Officers see only their assignments
        if user.is_department_staff:
            return ComplaintAssignment.objects.filter(
                assigned_to=user
            ).select_related('complaint', 'assigned_to', 'department')

        # Admins see all
        if user.is_admin:
            return ComplaintAssignment.objects.select_related(
                'complaint', 'assigned_to', 'department'
            )

        return ComplaintAssignment.objects.none()

    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """Get current user's assignments with SLA status"""
        user = request.user

        if not user.is_department_staff:
            return Response(
                {'error': 'Only department staff can view assignments'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get pending and in-progress assignments
        assignments = ComplaintAssignment.objects.filter(
            assigned_to=user,
            complaint__status__in=['PENDING', 'IN_PROGRESS']
        ).select_related('complaint', 'department').order_by('-assigned_at')

        serializer = self.get_serializer(assignments, many=True)

        # Calculate summary stats
        total = assignments.count()
        overdue = sum(1 for a in assignments if a.sla_deadline < timezone.now())

        return Response({
            'total_assignments': total,
            'overdue': overdue,
            'assignments': serializer.data,
        })

    @action(detail=False, methods=['get'])
    def sla_status(self, request):
        """Get SLA status for all open assignments"""
        assignments = self.get_queryset().filter(
            complaint__status__in=['PENDING', 'IN_PROGRESS']
        )

        now = timezone.now()
        green = []  # Within SLA
        yellow = []  # Warning (80% of time passed)
        red = []  # Overdue

        for assignment in assignments:
            progress = (now - assignment.assigned_at).total_seconds()
            sla_seconds = assignment.sla_target_days * 24 * 3600

            if progress > sla_seconds:
                red.append(assignment)
            elif progress > (sla_seconds * 0.8):
                yellow.append(assignment)
            else:
                green.append(assignment)

        return Response({
            'on_track': {
                'count': len(green),
                'assignments': ComplaintAssignmentSerializer(green, many=True).data,
            },
            'warning': {
                'count': len(yellow),
                'assignments': ComplaintAssignmentSerializer(yellow, many=True).data,
            },
            'overdue': {
                'count': len(red),
                'assignments': ComplaintAssignmentSerializer(red, many=True).data,
            },
            'summary': {
                'total': len(green) + len(yellow) + len(red),
                'sla_compliance_rate': (
                    (len(green) + len(yellow)) / (len(green) + len(yellow) + len(red)) * 100
                    if (len(green) + len(yellow) + len(red)) > 0 else 100
                ),
            },
        })

    @action(detail=False, methods=['get'])
    def officer_stats(self, request):
        """Get assignment statistics for a specific officer"""
        officer_id = request.query_params.get('officer_id')

        if not officer_id:
            return Response(
                {'error': 'officer_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            officer = User.objects.get(id=officer_id, role='DEPARTMENT_STAFF')
        except User.DoesNotExist:
            return Response(
                {'error': 'Officer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        stats = ComplaintAssignmentService.get_assignment_stats(officer)
        serializer = AssignmentStatsSerializer(stats)

        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def assign_complaint(self, request):
        """
        Manually assign a complaint to an officer.
        POST body: {"complaint_id": 123, "officer_id": 456, "reason": "Load balancing"}
        """
        complaint_id = request.data.get('complaint_id')
        officer_id = request.data.get('officer_id')
        reason = request.data.get('reason', 'Manual assignment')

        # Validate complaint exists
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response(
                {'error': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate officer exists
        try:
            officer = User.objects.get(id=officer_id, role='DEPARTMENT_STAFF')
        except User.DoesNotExist:
            return Response(
                {'error': 'Officer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Perform assignment
        try:
            complaint.assigned_to = officer
            complaint.assigned_officer = officer
            complaint.save()

            assignment = ComplaintAssignment.objects.create(
                complaint=complaint,
                assigned_to=officer,
                department=complaint.department,
                assigned_at=timezone.now(),
                sla_target_days=ComplaintAssignmentService.SLA_TARGETS.get(
                    complaint.priority, 7
                )
            )

            serializer = ComplaintAssignmentSerializer(assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def reassign_complaint(self, request):
        """
        Reassign a complaint to a different officer.
        POST body: {"complaint_id": 123, "officer_id": 456, "reason": "Unable to complete"}
        """
        complaint_id = request.data.get('complaint_id')
        officer_id = request.data.get('officer_id')
        reason = request.data.get('reason', 'Reassignment')

        # Validate complaint exists
        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response(
                {'error': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create reassignment record
        if complaint.assigned_to:
            ComplaintReassignment.objects.create(
                complaint=complaint,
                previously_assigned_to=complaint.assigned_to,
                reason=reason,
                reassigned_at=timezone.now()
            )

        # Assign to new officer
        new_assignment = ComplaintAssignmentService.assign_complaint(complaint)

        if not new_assignment:
            return Response(
                {'error': 'Could not reassign complaint'},
                status=status.HTTP_400_BAD_REQUEST
            )

        assignment = ComplaintAssignment.objects.get(complaint=complaint)
        serializer = ComplaintAssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def reassignment_history(self, request):
        """Get reassignment history for a specific complaint"""
        complaint_id = request.query_params.get('complaint_id')

        if not complaint_id:
            return Response(
                {'error': 'complaint_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            complaint = Complaint.objects.get(id=complaint_id)
        except Complaint.DoesNotExist:
            return Response(
                {'error': 'Complaint not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reassignments = ComplaintReassignment.objects.filter(
            complaint=complaint
        ).select_related('previously_assigned_to').order_by('-reassigned_at')

        serializer = ComplaintReassignmentSerializer(reassignments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def department_assignments(self, request):
        """Get all assignments for a specific department"""
        department_id = request.query_params.get('department_id')

        if not department_id:
            return Response(
                {'error': 'department_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        assignments = self.get_queryset().filter(
            department_id=department_id
        ).order_by('-assigned_at')

        serializer = self.get_serializer(assignments, many=True)

        # Calculate department stats
        total = assignments.count()
        completed = Complaint.objects.filter(
            assignment__department_id=department_id,
            status='RESOLVED'
        ).count()

        return Response({
            'total_assignments': total,
            'completed': completed,
            'completion_rate': (completed / total * 100) if total > 0 else 0,
            'assignments': serializer.data,
        })
