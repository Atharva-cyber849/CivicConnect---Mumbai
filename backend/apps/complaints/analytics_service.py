"""
Analytics Service for Complaint Dashboard
Provides metrics for ward-based heatmap and response time analysis
"""

from django.db.models import Count, Avg, Q, F, ExpressionWrapper, DurationField
from django.utils import timezone
from datetime import timedelta
from apps.complaints.models import Complaint, ComplaintAssignment, ComplaintTimeline
from apps.users.models import User
from apps.departments.models import Department
from django.db.models.functions import TruncDate, Cast
from django.db import models


class AnalyticsService:
    """Service for calculating analytics metrics for dashboard"""

    # Mumbai Ward List
    WARDS = [
        'A', 'B', 'C', 'D', 'E', 'F/N', 'F/S', 'G/N', 'G/S',
        'H/E', 'H/W', 'K/E', 'K/W', 'L', 'M/E', 'M/W',
        'N', 'P/N', 'P/S', 'R/C', 'R/N', 'R/S', 'S', 'T'
    ]

    @staticmethod
    def get_ward_complaint_heatmap(days=30):
        """
        Get heatmap of complaints by ward and date
        
        Returns: {
            'wards': ['A', 'B', 'C', ...],
            'dates': ['2024-01-01', '2024-01-02', ...],
            'data': {
                'A': [5, 3, 2, ...],  # count per date
                'B': [2, 4, 1, ...],
                ...
            },
            'summary': {
                'total': 150,
                'by_ward': {'A': 45, 'B': 30, ...},
                'date_range': {
                    'start': '2024-01-01',
                    'end': '2024-01-31'
                }
            }
        }
        """
        start_date = timezone.now() - timedelta(days=days)
        
        # Get all dates in range
        current = start_date.date()
        dates = []
        while current <= timezone.now().date():
            dates.append(str(current))
            current += timedelta(days=1)
        
        # Get complaints grouped by ward and date
        complaints = Complaint.objects.filter(
            created_at__gte=start_date
        ).values_list('ward', 'created_at__date')
        
        # Initialize data structure
        heatmap_data = {ward: [0] * len(dates) for ward in AnalyticsService.WARDS}
        
        # Count complaints by ward and date
        for ward, created_date in complaints:
            if ward in heatmap_data and str(created_date) in dates:
                date_index = dates.index(str(created_date))
                heatmap_data[ward][date_index] += 1
        
        # Calculate summary by ward
        ward_totals = {}
        for ward in AnalyticsService.WARDS:
            ward_totals[ward] = sum(heatmap_data[ward])
        
        total_complaints = sum(ward_totals.values())
        
        return {
            'wards': AnalyticsService.WARDS,
            'dates': dates,
            'data': heatmap_data,
            'summary': {
                'total': total_complaints,
                'by_ward': ward_totals,
                'date_range': {
                    'start': str(start_date.date()),
                    'end': str(timezone.now().date())
                }
            }
        }

    @staticmethod
    def get_ward_response_times(days=30):
        """
        Get response time metrics by ward
        
        Returns: {
            'wards': {
                'A': {
                    'avg_response_time_hours': 24.5,
                    'median_response_time_hours': 20.3,
                    'total_complaints': 45,
                    'resolved': 30,
                    'pending': 15,
                    'avg_resolution_time_hours': 48.2,
                    'sla_compliance_rate': 85.5,
                    'sla_breached': 7,
                    'response_distribution': {
                        'under_4_hours': 10,
                        '4_to_8_hours': 15,
                        '8_to_24_hours': 12,
                        '1_to_3_days': 5,
                        '3_plus_days': 3
                    }
                },
                ...
            },
            'summary': {
                'avg_response_time': 26.3,
                'best_performing_ward': 'D',
                'worst_performing_ward': 'S',
                'overall_sla_compliance': 82.3
            }
        }
        """
        start_date = timezone.now() - timedelta(days=days)
        
        ward_metrics = {}
        
        for ward in AnalyticsService.WARDS:
            complaints = Complaint.objects.filter(
                ward=ward,
                created_at__gte=start_date
            ).select_related('assigned_to')
            
            if not complaints.exists():
                ward_metrics[ward] = {
                    'avg_response_time_hours': None,
                    'median_response_time_hours': None,
                    'total_complaints': 0,
                    'resolved': 0,
                    'pending': 0,
                    'avg_resolution_time_hours': None,
                    'sla_compliance_rate': 0,
                    'sla_breached': 0,
                    'response_distribution': {
                        'under_4_hours': 0,
                        '4_to_8_hours': 0,
                        '8_to_24_hours': 0,
                        '1_to_3_days': 0,
                        '3_plus_days': 0
                    }
                }
                continue
            
            # Calculate response times (time from creation to first status change)
            response_times = []
            resolution_times = []
            sla_compliant = 0
            sla_breached = 0
            response_distribution = {
                'under_4_hours': 0,
                '4_to_8_hours': 0,
                '8_to_24_hours': 0,
                '1_to_3_days': 0,
                '3_plus_days': 0
            }
            
            for complaint in complaints:
                # Response time: created_at to first status change
                first_update = ComplaintTimeline.objects.filter(
                    complaint=complaint
                ).order_by('created_at').first()
                
                if first_update:
                    response_time = (first_update.created_at - complaint.created_at).total_seconds() / 3600
                    response_times.append(response_time)
                    
                    # Categorize response time
                    if response_time <= 4:
                        response_distribution['under_4_hours'] += 1
                    elif response_time <= 8:
                        response_distribution['4_to_8_hours'] += 1
                    elif response_time <= 24:
                        response_distribution['8_to_24_hours'] += 1
                    elif response_time <= 72:
                        response_distribution['1_to_3_days'] += 1
                    else:
                        response_distribution['3_plus_days'] += 1
                
                # Resolution time and SLA compliance
                if complaint.status == 'RESOLVED':
                    last_update = ComplaintTimeline.objects.filter(
                        complaint=complaint,
                        status_to='RESOLVED'
                    ).order_by('-created_at').first()
                    
                    if last_update:
                        resolution_time = (last_update.created_at - complaint.created_at).total_seconds() / 3600
                        resolution_times.append(resolution_time)
                
                # Check SLA compliance
                assignment = ComplaintAssignment.objects.filter(
                    complaint=complaint
                ).first()
                
                if assignment and assignment.sla_deadline:
                    if complaint.status == 'RESOLVED':
                        last_update = ComplaintTimeline.objects.filter(
                            complaint=complaint,
                            status_to='RESOLVED'
                        ).order_by('-created_at').first()
                        
                        if last_update and last_update.created_at <= assignment.sla_deadline:
                            sla_compliant += 1
                        else:
                            sla_breached += 1
                    elif timezone.now() <= assignment.sla_deadline:
                        sla_compliant += 1
                    else:
                        sla_breached += 1
            
            # Calculate averages
            avg_response_time = sum(response_times) / len(response_times) if response_times else None
            median_response_time = AnalyticsService._calculate_median(response_times) if response_times else None
            avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else None
            
            total_sla = sla_compliant + sla_breached
            sla_compliance_rate = (sla_compliant / total_sla * 100) if total_sla > 0 else 0
            
            resolved_count = complaints.filter(status='RESOLVED').count()
            pending_count = complaints.filter(status__in=['PENDING', 'IN_PROGRESS']).count()
            
            ward_metrics[ward] = {
                'avg_response_time_hours': round(avg_response_time, 1) if avg_response_time else None,
                'median_response_time_hours': round(median_response_time, 1) if median_response_time else None,
                'total_complaints': complaints.count(),
                'resolved': resolved_count,
                'pending': pending_count,
                'avg_resolution_time_hours': round(avg_resolution_time, 1) if avg_resolution_time else None,
                'sla_compliance_rate': round(sla_compliance_rate, 1),
                'sla_breached': sla_breached,
                'response_distribution': response_distribution
            }
        
        # Calculate summary
        all_response_times = [m['avg_response_time_hours'] for m in ward_metrics.values() if m['avg_response_time_hours']]
        overall_avg_response = sum(all_response_times) / len(all_response_times) if all_response_times else None
        
        best_ward = max(
            ((w, m['sla_compliance_rate']) for w, m in ward_metrics.items() if m['sla_compliance_rate']),
            key=lambda x: x[1],
            default=(None, 0)
        )[0]
        
        worst_ward = min(
            ((w, m['sla_compliance_rate']) for w, m in ward_metrics.items() if m['sla_compliance_rate']),
            key=lambda x: x[1],
            default=(None, 100)
        )[0]
        
        all_sla_rates = [m['sla_compliance_rate'] for m in ward_metrics.values() if m['total_complaints'] > 0]
        overall_sla = sum(all_sla_rates) / len(all_sla_rates) if all_sla_rates else 0
        
        return {
            'wards': ward_metrics,
            'summary': {
                'avg_response_time': round(overall_avg_response, 1) if overall_avg_response else None,
                'best_performing_ward': best_ward,
                'worst_performing_ward': worst_ward,
                'overall_sla_compliance': round(overall_sla, 1)
            }
        }

    @staticmethod
    def get_department_comparison(days=30):
        """
        Compare metrics across departments
        
        Returns: {
            'departments': {
                'Police': {
                    'total_complaints': 150,
                    'resolved': 120,
                    'pending': 30,
                    'avg_response_time': 24.5,
                    'sla_compliance_rate': 85.5,
                    'avg_officer_rating': 4.2
                },
                ...
            },
            'summary': {
                'best_department': 'Water Supply',
                'worst_department': 'Roads',
                'overall_metrics': {...}
            }
        }
        """
        start_date = timezone.now() - timedelta(days=days)
        
        departments = Department.objects.all()
        dept_metrics = {}
        
        for dept in departments:
            complaints = Complaint.objects.filter(
                department=dept,
                created_at__gte=start_date
            )
            
            if not complaints.exists():
                dept_metrics[dept.name] = {
                    'total_complaints': 0,
                    'resolved': 0,
                    'pending': 0,
                    'avg_response_time': None,
                    'sla_compliance_rate': 0,
                    'avg_officer_rating': None
                }
                continue
            
            # Calculate metrics
            response_times = []
            sla_compliant = 0
            sla_breached = 0
            
            for complaint in complaints:
                # Response time
                first_update = ComplaintTimeline.objects.filter(
                    complaint=complaint
                ).order_by('created_at').first()
                
                if first_update:
                    response_time = (first_update.created_at - complaint.created_at).total_seconds() / 3600
                    response_times.append(response_time)
                
                # SLA
                assignment = ComplaintAssignment.objects.filter(
                    complaint=complaint
                ).first()
                
                if assignment and assignment.sla_deadline:
                    if complaint.status == 'RESOLVED':
                        last_update = ComplaintTimeline.objects.filter(
                            complaint=complaint,
                            status_to='RESOLVED'
                        ).order_by('-created_at').first()
                        
                        if last_update and last_update.created_at <= assignment.sla_deadline:
                            sla_compliant += 1
                        else:
                            sla_breached += 1
                    elif timezone.now() <= assignment.sla_deadline:
                        sla_compliant += 1
                    else:
                        sla_breached += 1
            
            avg_response = sum(response_times) / len(response_times) if response_times else None
            total_sla = sla_compliant + sla_breached
            sla_rate = (sla_compliant / total_sla * 100) if total_sla > 0 else 0
            
            # Get average officer rating
            from apps.complaints.models import OfficerRating
            avg_rating = OfficerRating.objects.filter(
                complaint__department=dept,
                complaint__created_at__gte=start_date
            ).aggregate(avg=Avg('rating'))['avg']
            
            dept_metrics[dept.name] = {
                'total_complaints': complaints.count(),
                'resolved': complaints.filter(status='RESOLVED').count(),
                'pending': complaints.filter(status__in=['PENDING', 'IN_PROGRESS']).count(),
                'avg_response_time': round(avg_response, 1) if avg_response else None,
                'sla_compliance_rate': round(sla_rate, 1),
                'avg_officer_rating': round(avg_rating, 2) if avg_rating else None
            }
        
        # Summary
        best_dept = max(
            ((d, m['sla_compliance_rate']) for d, m in dept_metrics.items() if m['sla_compliance_rate']),
            key=lambda x: x[1],
            default=(None, 0)
        )[0]
        
        worst_dept = min(
            ((d, m['sla_compliance_rate']) for d, m in dept_metrics.items() if m['sla_compliance_rate']),
            key=lambda x: x[1],
            default=(None, 100)
        )[0]
        
        all_metrics = {
            'total': sum(m['total_complaints'] for m in dept_metrics.values()),
            'resolved': sum(m['resolved'] for m in dept_metrics.values()),
            'pending': sum(m['pending'] for m in dept_metrics.values()),
            'avg_response_time': None,
            'avg_sla_compliance': None
        }
        
        all_response_times = [m['avg_response_time'] for m in dept_metrics.values() if m['avg_response_time']]
        if all_response_times:
            all_metrics['avg_response_time'] = round(sum(all_response_times) / len(all_response_times), 1)
        
        all_sla_rates = [m['sla_compliance_rate'] for m in dept_metrics.values() if m['total_complaints'] > 0]
        if all_sla_rates:
            all_metrics['avg_sla_compliance'] = round(sum(all_sla_rates) / len(all_sla_rates), 1)
        
        return {
            'departments': dept_metrics,
            'summary': {
                'best_department': best_dept,
                'worst_department': worst_dept,
                'overall_metrics': all_metrics
            }
        }

    @staticmethod
    def get_complaint_trends(days=30):
        """
        Get trend data for complaints over time
        
        Returns daily complaint counts and status distribution
        """
        start_date = timezone.now() - timedelta(days=days)
        
        daily_data = {}
        current = start_date.date()
        
        while current <= timezone.now().date():
            date_str = str(current)
            complaints_today = Complaint.objects.filter(
                created_at__date=current
            )
            
            daily_data[date_str] = {
                'total': complaints_today.count(),
                'pending': complaints_today.filter(status='PENDING').count(),
                'in_progress': complaints_today.filter(status='IN_PROGRESS').count(),
                'resolved': complaints_today.filter(status='RESOLVED').count(),
                'rejected': complaints_today.filter(status='REJECTED').count()
            }
            
            current += timedelta(days=1)
        
        return {
            'data': daily_data,
            'summary': {
                'start_date': str(start_date.date()),
                'end_date': str(timezone.now().date()),
                'days': days
            }
        }

    @staticmethod
    def _calculate_median(values):
        """Calculate median of a list of values"""
        if not values:
            return None
        sorted_values = sorted(values)
        n = len(sorted_values)
        if n % 2 == 0:
            return (sorted_values[n // 2 - 1] + sorted_values[n // 2]) / 2
        else:
            return sorted_values[n // 2]
