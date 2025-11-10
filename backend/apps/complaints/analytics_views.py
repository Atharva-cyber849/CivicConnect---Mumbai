"""
Analytics API views for complaint data visualization.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
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