"""
Analytics views for the users app.
"""
from datetime import datetime, timedelta
from django.db.models import Count, Avg, F, Q, Case, When, Value, IntegerField
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, Coalesce
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from .models import Officer
from apps.departments.models import Department
from .permissions import IsAdminOrDepartmentStaff

User = get_user_model()

class AnalyticsView(APIView):
    """
    API endpoint for retrieving analytics data.
    """
    permission_classes = [IsAuthenticated, IsAdminOrDepartmentStaff]

    def get(self, request):
        # Get query parameters with defaults
        days = int(request.query_params.get('days', 30))
        department_id = request.query_params.get('department')
        ward = request.query_params.get('ward')
        role = request.query_params.get('role')
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Base querysets
        complaints = Complaint.objects.filter(created_at__range=[start_date, end_date])
        officers = Officer.objects.filter(created_at__range=[start_date, end_date])
        
        # Apply filters
        if department_id:
            complaints = complaints.filter(department_id=department_id)
            officers = officers.filter(department_id=department_id)
            
        if ward:
            complaints = complaints.filter(ward=ward)
            officers = officers.filter(assigned_ward=ward)
            
        if role:
            officers = officers.filter(role=role)
        
        # 1. Complaints by status
        complaints_by_status = complaints.values('status').annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / (Count('id', distinct=True) or 1)
        ).order_by('-count')
        
        # 2. Complaints by department
        complaints_by_dept = complaints.values('department__name').annotate(
            count=Count('id'),
            resolved=Count(Case(When(status='RESOLVED', then=1), output_field=IntegerField())),
            avg_resolution_time=Avg('resolution_time')
        ).order_by('-count')
        
        # 3. Complaints over time (daily for < 30 days, weekly for < 6 months, monthly otherwise)
        if days <= 30:
            time_series = complaints.annotate(
                date=TruncDay('created_at')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        elif days <= 180:  # 6 months
            time_series = complaints.annotate(
                date=TruncWeek('created_at')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        else:
            time_series = complaints.annotate(
                date=TruncMonth('created_at')
            ).values('date').annotate(
                count=Count('id')
            ).order_by('date')
        
        # 4. Officer performance
        officer_performance = officers.annotate(
            complaints_handled=Count('complaints'),
            complaints_resolved=Count(
                Case(
                    When(complaints__status='RESOLVED', then=1),
                    output_field=IntegerField()
                )
            ),
            resolution_rate=Case(
                When(complaints_handled=0, then=Value(0)),
                default=100.0 * F('complaints_resolved') / F('complaints_handled'),
                output_field=IntegerField()
            )
        ).values(
            'id', 'user__first_name', 'user__last_name', 'user__email',
            'department__name', 'assigned_ward', 'complaints_handled',
            'complaints_resolved', 'resolution_rate'
        ).order_by('-complaints_handled')
        
        # 5. Department performance
        dept_performance = Department.objects.annotate(
            total_complaints=Count('complaints'),
            resolved_complaints=Count(
                Case(
                    When(complaints__status='RESOLVED', then=1),
                    output_field=IntegerField()
                )
            ),
            avg_resolution_time=Avg('complaints__resolution_time')
        ).values(
            'id', 'name', 'total_complaints', 'resolved_complaints',
            'avg_resolution_time'
        ).order_by('-total_complaints')
        
        # 6. Ward-wise distribution
        ward_distribution = complaints.values('ward').annotate(
            count=Count('id'),
            resolved=Count(Case(When(status='RESOLVED', then=1), output_field=IntegerField())),
            resolution_rate=Case(
                When(count=0, then=Value(0)),
                default=100.0 * F('resolved') / F('count'),
                output_field=IntegerField()
            )
        ).order_by('-count')
        
        return Response({
            'summary': {
                'total_complaints': complaints.count(),
                'resolved_complaints': complaints.filter(status='RESOLVED').count(),
                'total_officers': officers.count(),
                'departments_covered': complaints.values('department').distinct().count(),
                'wards_covered': complaints.values('ward').distinct().count(),
            },
            'complaints_by_status': list(complaints_by_status),
            'complaints_by_department': list(complaints_by_dept),
            'time_series': list(time_series),
            'officer_performance': list(officer_performance),
            'department_performance': list(dept_performance),
            'ward_distribution': list(ward_distribution),
            'filters': {
                'days': days,
                'department': department_id,
                'ward': ward,
                'role': role
            },
            'last_updated': datetime.now().isoformat()
        })
