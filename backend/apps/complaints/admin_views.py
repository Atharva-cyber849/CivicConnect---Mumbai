"""
Admin-specific views for complaint management.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from django.contrib.auth import get_user_model

from .models import Complaint
from .serializers import ComplaintDetailSerializer
from apps.users.permissions import IsAdminUser

User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_complaints(request):
    """
    Bulk update multiple complaints.
    Expects: complaint_ids (list) and update fields.
    """
    complaint_ids = request.data.get('complaint_ids', [])
    if not complaint_ids:
        return Response(
            {'error': 'complaint_ids is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get update fields
    update_data = {}
    if 'status' in request.data:
        update_data['status'] = request.data['status']
    if 'priority' in request.data:
        update_data['priority'] = request.data['priority']
    if 'department' in request.data:
        update_data['department_id'] = request.data['department']
    if 'assigned_to' in request.data:
        update_data['assigned_to_id'] = request.data['assigned_to']
    
    if not update_data:
        return Response(
            {'error': 'No update fields provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update complaints
    updated_count = Complaint.objects.filter(
        id__in=complaint_ids
    ).update(**update_data)
    
    return Response({
        'message': f'{updated_count} complaints updated successfully',
        'updated_count': updated_count
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_ward_data(request):
    """
    Get ward-wise complaint statistics.
    """
    # Get all wards from User model WARD_CHOICES
    ward_stats = []
    
    # Aggregate complaints by ward
    ward_data = Complaint.objects.values('ward').annotate(
        total=Count('id'),
        pending=Count('id', filter=Q(status='PENDING')),
        in_progress=Count('id', filter=Q(status='IN_PROGRESS')),
        resolved=Count('id', filter=Q(status='RESOLVED')),
        rejected=Count('id', filter=Q(status='REJECTED'))
    ).order_by('ward')
    
    for ward in ward_data:
        ward_stats.append({
            'ward': ward['ward'],
            'total_complaints': ward['total'],
            'pending': ward['pending'],
            'in_progress': ward['in_progress'],
            'resolved': ward['resolved'],
            'rejected': ward['rejected']
        })
    
    return Response({
        'wards': ward_stats,
        'total_wards': len(ward_stats)
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_dashboard_stats(request):
    """
    Get comprehensive dashboard statistics for admin.
    This is an alias/compatibility endpoint for /complaints/statistics/
    """
    queryset = Complaint.objects.all()
    
    stats = {
        'total': queryset.count(),
        'pending': queryset.filter(status='PENDING').count(),
        'in_progress': queryset.filter(status='IN_PROGRESS').count(),
        'resolved': queryset.filter(status='RESOLVED').count(),
        'rejected': queryset.filter(status='REJECTED').count(),
        'by_category': {},
        'by_priority': {}
    }
    
    # Count by category
    for choice in Complaint.CATEGORY_CHOICES:
        category = choice[0]
        stats['by_category'][category] = queryset.filter(category=category).count()
    
    # Count by priority
    for choice in Complaint.PRIORITY_CHOICES:
        priority = choice[0]
        stats['by_priority'][priority] = queryset.filter(priority=priority).count()
    
    return Response(stats)
