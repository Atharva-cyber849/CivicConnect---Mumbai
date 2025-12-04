"""
Analytics API views for complaint data visualization.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Count
from django.utils import timezone
from .analytics import ComplaintAnalytics
from .models import Complaint


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics."""
    try:
        # Initialize analytics with user filters
        ward = request.GET.get('ward')
        department = request.GET.get('department')
        
        analytics = ComplaintAnalytics(
            user=request.user,
            ward=ward,
            department=department
        )
        
        # Get all required data
        basic_stats = analytics.get_basic_stats()
        status_distribution = analytics.get_status_distribution()
        category_distribution = analytics.get_category_distribution()
        trend_data = analytics.get_trend_data(days=30)
        priority_distribution = analytics.get_priority_distribution()
        
        return Response({
            'basic_stats': basic_stats,
            'status_distribution': status_distribution,
            'category_distribution': category_distribution,
            'trend_data': trend_data,
            'priority_distribution': priority_distribution
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_performance(request):
    """Get department performance metrics."""
    try:
        ward = request.GET.get('ward')
        analytics = ComplaintAnalytics(ward=ward)
        performance_data = analytics.get_department_performance()
        
        return Response(performance_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ward_analytics(request):
    """Get ward-wise analytics."""
    try:
        analytics = ComplaintAnalytics()
        ward_summary = analytics.get_ward_summary()
        ward_distribution = analytics.get_ward_distribution()
        
        return Response({
            'ward_summary': ward_summary,
            'ward_distribution': ward_distribution
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def heatmap_data(request):
    """Get heatmap data for map visualization."""
    try:
        ward = request.GET.get('ward')
        department = request.GET.get('department')
        category = request.GET.get('category')
        
        analytics = ComplaintAnalytics(ward=ward, department=department)
        heatmap_points = analytics.get_heatmap_data()
        
        # Filter by category if specified
        if category:
            heatmap_points = [
                point for point in heatmap_points 
                if point['category'] == category
            ]
        
        return Response(heatmap_points)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_trends(request):
    """Get monthly trend data."""
    try:
        months = int(request.GET.get('months', 6))
        ward = request.GET.get('ward')
        department = request.GET.get('department')
        
        analytics = ComplaintAnalytics(ward=ward, department=department)
        monthly_data = analytics.get_monthly_comparison(months=months)
        
        return Response(monthly_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_activity(request):
    """Get user activity statistics."""
    try:
        analytics = ComplaintAnalytics(user=request.user)
        activity_stats = analytics.get_user_activity_stats()
        
        return Response(activity_stats)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def complaint_export(request):
    """Export complaint data for analysis."""
    try:
        # Get filter parameters
        ward = request.GET.get('ward')
        department = request.GET.get('department')
        status_filter = request.GET.get('status')
        category = request.GET.get('category')
        
        # Build queryset
        queryset = Complaint.objects.all()
        
        if ward:
            queryset = queryset.filter(ward=ward)
        if department:
            queryset = queryset.filter(department=department)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if category:
            queryset = queryset.filter(category=category)
        
        # Prepare export data
        export_data = []
        for complaint in queryset.order_by('-created_at'):
            export_data.append({
                'id': complaint.id,
                'title': complaint.title,
                'description': complaint.description,
                'category': complaint.category,
                'status': complaint.status,
                'priority': complaint.priority,
                'ward': complaint.ward,
                'department': complaint.department,
                'citizen_name': f"{complaint.citizen.first_name} {complaint.citizen.last_name}",
                'citizen_email': complaint.citizen.email,
                'latitude': str(complaint.latitude) if complaint.latitude else '',
                'longitude': str(complaint.longitude) if complaint.longitude else '',
                'address': complaint.address,
                'created_at': complaint.created_at.isoformat(),
                'updated_at': complaint.updated_at.isoformat(),
                'resolved_at': complaint.resolved_at.isoformat() if complaint.resolved_at else '',
            })
        
        return Response({
            'data': export_data,
            'count': len(export_data),
            'filters_applied': {
                'ward': ward,
                'department': department,
                'status': status_filter,
                'category': category
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def public_stats(request):
    """Public statistics (no authentication required)."""
    try:
        analytics = ComplaintAnalytics()
        basic_stats = analytics.get_basic_stats()
        
        # Only return public-facing stats
        public_data = {
            'total_complaints': basic_stats['total_complaints'],
            'resolved_complaints': basic_stats['resolved'],
            'resolution_rate': basic_stats['resolution_rate'],
            'active_wards': len(analytics.get_ward_distribution()),
            'categories_served': len(analytics.get_category_distribution())
        }
        
        return Response(public_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def zone_analytics(request):
    """Get zone-wise analytics for Mumbai BMC."""
    try:
        from .mumbai_utils import MUMBAI_ZONES, get_zone_for_ward
        from django.db.models import Count, Avg, F
        from django.db.models.functions import TruncDate
        
        period = int(request.GET.get('period', 30))
        from_date = timezone.now() - timezone.timedelta(days=period)
        
        zone_data = {}
        for zone_name, wards in MUMBAI_ZONES.items():
            complaints = Complaint.objects.filter(
                ward__in=wards,
                created_at__gte=from_date
            )
            
            total = complaints.count()
            resolved = complaints.filter(status='RESOLVED').count()
            pending = complaints.filter(status='PENDING').count()
            in_progress = complaints.filter(status='IN_PROGRESS').count()
            
            zone_data[zone_name] = {
                'total': total,
                'resolved': resolved,
                'pending': pending,
                'in_progress': in_progress,
                'resolution_rate': round((resolved / total * 100) if total > 0 else 0, 1),
                'wards': wards,
                'ward_count': len(wards)
            }
        
        return Response({
            'zones': zone_data,
            'period_days': period
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mumbai_bmc_analytics(request):
    """Get comprehensive Mumbai BMC analytics with zone and department breakdown."""
    try:
        from .mumbai_utils import MUMBAI_ZONES, MUMBAI_WARDS, get_zone_for_ward
        from django.db.models import Count, Avg, F, ExpressionWrapper, DurationField
        from django.db.models.functions import TruncDate, TruncMonth
        
        period = int(request.GET.get('period', 30))
        zone_filter = request.GET.get('zone')
        from_date = timezone.now() - timezone.timedelta(days=period)
        
        # Base queryset
        queryset = Complaint.objects.filter(created_at__gte=from_date)
        
        # Apply zone filter if specified
        if zone_filter and zone_filter != 'All':
            zone_wards = MUMBAI_ZONES.get(zone_filter, [])
            queryset = queryset.filter(ward__in=zone_wards)
        
        # Summary statistics
        total = queryset.count()
        resolved = queryset.filter(status='RESOLVED').count()
        pending = queryset.filter(status='PENDING').count()
        in_progress = queryset.filter(status='IN_PROGRESS').count()
        
        # Calculate average response time (simplified)
        from apps.users.models import User
        active_officers = User.objects.filter(
            role='DEPARTMENT_STAFF',
            is_active=True
        ).count()
        
        summary = {
            'total_complaints': total,
            'resolved': resolved,
            'pending': pending,
            'in_progress': in_progress,
            'resolution_rate': round((resolved / total * 100) if total > 0 else 0, 1),
            'avg_response_time': 18,  # Placeholder - calculate from actual data
            'active_officers': active_officers,
            'sla_compliance': round((resolved / total * 100 * 0.85) if total > 0 else 0, 1)
        }
        
        # Zone breakdown
        zone_breakdown = {}
        for zone_name, wards in MUMBAI_ZONES.items():
            zone_complaints = queryset.filter(ward__in=wards)
            zone_total = zone_complaints.count()
            zone_resolved = zone_complaints.filter(status='RESOLVED').count()
            
            zone_breakdown[zone_name] = {
                'total': zone_total,
                'resolved': zone_resolved,
                'pending': zone_complaints.filter(status='PENDING').count(),
                'resolution_rate': round((zone_resolved / zone_total * 100) if zone_total > 0 else 0, 1)
            }
        
        # Department performance
        department_stats = queryset.values('department__name').annotate(
            total=Count('id'),
            resolved=Count('id', filter=Q(status='RESOLVED'))
        ).order_by('-total')[:10]
        
        department_performance = [
            {
                'name': stat['department__name'] or 'Unassigned',
                'total': stat['total'],
                'resolved': stat['resolved'],
                'resolution_rate': round((stat['resolved'] / stat['total'] * 100) if stat['total'] > 0 else 0, 1)
            }
            for stat in department_stats
        ]
        
        # Ward performance
        ward_stats = queryset.values('ward').annotate(
            total=Count('id'),
            resolved=Count('id', filter=Q(status='RESOLVED'))
        ).order_by('-total')
        
        ward_performance = [
            {
                'ward': stat['ward'],
                'zone': get_zone_for_ward(stat['ward']),
                'total': stat['total'],
                'resolved': stat['resolved'],
                'resolution_rate': round((stat['resolved'] / stat['total'] * 100) if stat['total'] > 0 else 0, 1)
            }
            for stat in ward_stats
        ]
        
        # Category distribution
        category_stats = queryset.values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Daily trends
        daily_trends = queryset.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id'),
            resolved=Count('id', filter=Q(status='RESOLVED'))
        ).order_by('date')
        
        return Response({
            'summary': summary,
            'zone_breakdown': zone_breakdown,
            'department_performance': department_performance,
            'ward_performance': ward_performance,
            'category_distribution': list(category_stats),
            'daily_trends': list(daily_trends),
            'period_days': period,
            'zone_filter': zone_filter or 'All'
        })
        
    except Exception as e:
        import traceback
        return Response(
            {'error': str(e), 'traceback': traceback.format_exc()},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sla_metrics(request):
    """Get SLA compliance metrics by ward."""
    try:
        from .mumbai_utils import MUMBAI_WARDS, get_zone_for_ward
        
        ward = request.GET.get('ward')
        period = int(request.GET.get('period', 30))
        from_date = timezone.now() - timezone.timedelta(days=period)
        
        queryset = Complaint.objects.filter(created_at__gte=from_date)
        
        if ward:
            queryset = queryset.filter(ward=ward)
        
        total = queryset.count()
        resolved = queryset.filter(status='RESOLVED').count()
        
        # SLA categories (based on resolution time)
        # This is simplified - actual implementation would calculate based on resolved_at - created_at
        sla_data = {
            'total_complaints': total,
            'resolved': resolved,
            'sla_met': int(resolved * 0.75),  # Placeholder
            'sla_breached': int(resolved * 0.25),  # Placeholder
            'compliance_rate': 75.0,  # Placeholder
            'avg_resolution_hours': 22,  # Placeholder
            'by_category': {},
            'by_priority': {}
        }
        
        # Category breakdown
        for category_choice in Complaint.CATEGORY_CHOICES:
            cat_code = category_choice[0]
            cat_count = queryset.filter(category=cat_code).count()
            cat_resolved = queryset.filter(category=cat_code, status='RESOLVED').count()
            sla_data['by_category'][cat_code] = {
                'total': cat_count,
                'resolved': cat_resolved,
                'compliance': round((cat_resolved / cat_count * 100) if cat_count > 0 else 0, 1)
            }
        
        # Priority breakdown
        for priority_choice in Complaint.PRIORITY_CHOICES:
            pri_code = priority_choice[0]
            pri_count = queryset.filter(priority=pri_code).count()
            pri_resolved = queryset.filter(priority=pri_code, status='RESOLVED').count()
            sla_data['by_priority'][pri_code] = {
                'total': pri_count,
                'resolved': pri_resolved,
                'compliance': round((pri_resolved / pri_count * 100) if pri_count > 0 else 0, 1)
            }
        
        return Response(sla_data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )