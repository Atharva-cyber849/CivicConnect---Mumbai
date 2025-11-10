"""
Analytics utilities for complaint data analysis and reporting.
"""
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from collections import defaultdict
from .models import Complaint


class ComplaintAnalytics:
    """Analytics class for complaint data processing."""
    
    def __init__(self, user=None, ward=None, department=None):
        """Initialize analytics with optional filters."""
        self.user = user
        self.ward = ward
        self.department = department
        self.base_queryset = Complaint.objects.all()
        
        # Apply filters if provided
        if ward:
            self.base_queryset = self.base_queryset.filter(ward=ward)
        if department:
            self.base_queryset = self.base_queryset.filter(department=department)
    
    def get_basic_stats(self):
        """Get basic complaint statistics."""
        total = self.base_queryset.count()
        pending = self.base_queryset.filter(status='PENDING').count()
        in_progress = self.base_queryset.filter(status='IN_PROGRESS').count()
        resolved = self.base_queryset.filter(status='RESOLVED').count()
        rejected = self.base_queryset.filter(status='REJECTED').count()
        
        return {
            'total_complaints': total,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'rejected': rejected,
            'resolution_rate': round((resolved / total * 100) if total > 0 else 0, 2),
            'success_rate': round(((resolved + in_progress) / total * 100) if total > 0 else 0, 2)
        }
    
    def get_status_distribution(self):
        """Get complaint distribution by status."""
        return list(
            self.base_queryset.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )
    
    def get_category_distribution(self):
        """Get complaint distribution by category."""
        return list(
            self.base_queryset.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
    
    def get_ward_distribution(self):
        """Get complaint distribution by ward."""
        return list(
            self.base_queryset.values('ward')
            .annotate(count=Count('id'))
            .order_by('ward')
        )
    
    def get_department_performance(self):
        """Get performance metrics by department."""
        departments = self.base_queryset.values('department').distinct()
        performance = []
        
        for dept in departments:
            dept_name = dept['department']
            dept_complaints = self.base_queryset.filter(department=dept_name)
            
            total = dept_complaints.count()
            resolved = dept_complaints.filter(status='RESOLVED').count()
            avg_resolution_time = dept_complaints.filter(
                status='RESOLVED'
            ).aggregate(
                avg_time=Avg('updated_at') - Avg('created_at')
            )['avg_time']
            
            performance.append({
                'department': dept_name,
                'total_complaints': total,
                'resolved_complaints': resolved,
                'resolution_rate': round((resolved / total * 100) if total > 0 else 0, 2),
                'avg_resolution_time_days': avg_resolution_time.days if avg_resolution_time else 0
            })
        
        return sorted(performance, key=lambda x: x['resolution_rate'], reverse=True)
    
    def get_trend_data(self, days=30):
        """Get trend data for the last N days."""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Generate date range
        date_range = []
        current_date = start_date
        while current_date <= end_date:
            date_range.append(current_date)
            current_date += timedelta(days=1)
        
        # Get complaints by date
        complaints_by_date = defaultdict(int)
        complaints = self.base_queryset.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).values('created_at__date').annotate(count=Count('id'))
        
        for item in complaints:
            complaints_by_date[item['created_at__date']] = item['count']
        
        # Format for chart
        trend_data = []
        for date in date_range:
            trend_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'complaints': complaints_by_date[date],
                'day_name': date.strftime('%a')
            })
        
        return trend_data
    
    def get_priority_distribution(self):
        """Get complaint distribution by priority."""
        return list(
            self.base_queryset.values('priority')
            .annotate(count=Count('id'))
            .order_by('priority')
        )
    
    def get_heatmap_data(self):
        """Get geographic data for heatmap visualization."""
        complaints_with_location = self.base_queryset.filter(
            latitude__isnull=False,
            longitude__isnull=False
        ).values('latitude', 'longitude', 'priority', 'status', 'category')
        
        heatmap_points = []
        for complaint in complaints_with_location:
            # Weight points by priority and status
            weight = 1.0
            if complaint['priority'] == 'URGENT':
                weight = 1.0
            elif complaint['priority'] == 'HIGH':
                weight = 0.8
            elif complaint['priority'] == 'MEDIUM':
                weight = 0.6
            else:
                weight = 0.4
            
            # Reduce weight for resolved complaints
            if complaint['status'] == 'RESOLVED':
                weight *= 0.3
            elif complaint['status'] == 'REJECTED':
                weight *= 0.1
            
            heatmap_points.append({
                'lat': float(complaint['latitude']),
                'lng': float(complaint['longitude']),
                'weight': weight,
                'category': complaint['category'],
                'status': complaint['status']
            })
        
        return heatmap_points
    
    def get_ward_summary(self):
        """Get comprehensive ward-wise summary."""
        ward_summary = {}
        
        for ward in self.base_queryset.values('ward').distinct():
            ward_name = ward['ward']
            if not ward_name:
                continue
                
            ward_complaints = self.base_queryset.filter(ward=ward_name)
            
            total = ward_complaints.count()
            resolved = ward_complaints.filter(status='RESOLVED').count()
            pending = ward_complaints.filter(status='PENDING').count()
            
            # Most common category
            top_category = ward_complaints.values('category').annotate(
                count=Count('id')
            ).order_by('-count').first()
            
            ward_summary[ward_name] = {
                'total_complaints': total,
                'resolved': resolved,
                'pending': pending,
                'resolution_rate': round((resolved / total * 100) if total > 0 else 0, 2),
                'top_category': top_category['category'] if top_category else None,
                'top_category_count': top_category['count'] if top_category else 0
            }
        
        return ward_summary
    
    def get_monthly_comparison(self, months=6):
        """Get month-wise comparison data."""
        end_date = timezone.now().date()
        start_date = end_date.replace(day=1) - timedelta(days=30 * months)
        
        monthly_data = []
        current_date = start_date.replace(day=1)
        
        while current_date <= end_date:
            # Get next month
            if current_date.month == 12:
                next_month = current_date.replace(year=current_date.year + 1, month=1)
            else:
                next_month = current_date.replace(month=current_date.month + 1)
            
            # Count complaints for this month
            month_complaints = self.base_queryset.filter(
                created_at__date__gte=current_date,
                created_at__date__lt=next_month
            )
            
            total = month_complaints.count()
            resolved = month_complaints.filter(status='RESOLVED').count()
            
            monthly_data.append({
                'month': current_date.strftime('%B %Y'),
                'month_short': current_date.strftime('%b'),
                'year': current_date.year,
                'total_complaints': total,
                'resolved_complaints': resolved,
                'resolution_rate': round((resolved / total * 100) if total > 0 else 0, 2)
            })
            
            current_date = next_month
        
        return monthly_data
    
    def get_user_activity_stats(self):
        """Get user activity statistics."""
        if not self.user:
            return None
            
        user_complaints = self.base_queryset.filter(citizen=self.user)
        
        return {
            'total_reported': user_complaints.count(),
            'resolved': user_complaints.filter(status='RESOLVED').count(),
            'pending': user_complaints.filter(status='PENDING').count(),
            'in_progress': user_complaints.filter(status='IN_PROGRESS').count(),
            'first_complaint': user_complaints.order_by('created_at').first(),
            'latest_complaint': user_complaints.order_by('-created_at').first(),
            'most_used_category': user_complaints.values('category').annotate(
                count=Count('id')
            ).order_by('-count').first()
        }