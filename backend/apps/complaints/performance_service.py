"""
Officer Performance Calculation Service
Aggregates metrics from complaints, ratings, and SLA data
"""
from django.db.models import Avg, Count
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.complaints.models import (
    Complaint, OfficerRating, OfficerPerformance, PerformanceAuditLog
)

User = get_user_model()


class PerformanceCalculationService:
    """
    Service for calculating and updating officer performance metrics.
    """

    @staticmethod
    def calculate_officer_performance(officer: User) -> OfficerPerformance:
        """
        Calculate comprehensive performance metrics for an officer.
        
        Args:
            officer: User instance (must be department staff)
            
        Returns:
            OfficerPerformance instance with updated metrics
        """
        # Get all complaints assigned to this officer
        all_complaints = Complaint.objects.filter(assigned_to=officer)
        
        # Status breakdown
        total_assigned = all_complaints.count()
        total_resolved = all_complaints.filter(status='RESOLVED').count()
        total_pending = all_complaints.filter(status__in=['PENDING', 'IN_PROGRESS']).count()
        total_rejected = all_complaints.filter(status='REJECTED').count()
        
        # SLA Compliance
        resolved_complaints = all_complaints.filter(status='RESOLVED')
        sla_compliant = 0
        sla_breached = 0
        total_hours = 0
        
        for complaint in resolved_complaints:
            if hasattr(complaint, 'assignment') and complaint.assignment:
                if complaint.resolved_at and complaint.resolved_at <= complaint.assignment.sla_deadline:
                    sla_compliant += 1
                else:
                    sla_breached += 1
                
                # Calculate resolution time
                if complaint.resolved_at:
                    hours = (complaint.resolved_at - complaint.assignment.assigned_at).total_seconds() / 3600
                    total_hours += hours
        
        sla_compliance_rate = (sla_compliant / (sla_compliant + sla_breached) * 100) if (sla_compliant + sla_breached) > 0 else 0
        avg_resolution_hours = (total_hours / resolved_complaints.count()) if resolved_complaints.count() > 0 else 0
        avg_resolution_days = avg_resolution_hours / 24
        
        # Ratings
        ratings = OfficerRating.objects.filter(officer=officer)
        total_ratings = ratings.count()
        
        avg_rating = 0
        five_star = 0
        four_star = 0
        three_star = 0
        two_star = 0
        one_star = 0
        
        if total_ratings > 0:
            avg_rating = ratings.aggregate(avg=Avg('rating'))['avg'] or 0
            
            # Count by star
            five_star = ratings.filter(rating=5).count()
            four_star = ratings.filter(rating=4).count()
            three_star = ratings.filter(rating=3).count()
            two_star = ratings.filter(rating=2).count()
            one_star = ratings.filter(rating=1).count()
        
        # Get or create performance record
        performance, created = OfficerPerformance.objects.get_or_create(
            officer=officer
        )
        
        # Update metrics
        performance.total_assigned = total_assigned
        performance.total_resolved = total_resolved
        performance.total_pending = total_pending
        performance.total_rejected = total_rejected
        
        performance.sla_compliant_count = sla_compliant
        performance.sla_breached_count = sla_breached
        performance.sla_compliance_rate = round(sla_compliance_rate, 1)
        
        performance.avg_resolution_time_hours = round(avg_resolution_hours, 1)
        performance.avg_resolution_time_days = round(avg_resolution_days, 1)
        
        performance.total_ratings = total_ratings
        performance.avg_rating = round(avg_rating, 2)
        performance.five_star_count = five_star
        performance.four_star_count = four_star
        performance.three_star_count = three_star
        performance.two_star_count = two_star
        performance.one_star_count = one_star
        
        # Calculate department averages for comparison
        if hasattr(officer, 'department') and officer.department:
            dept_officers = User.objects.filter(department=officer.department)
            dept_performance = OfficerPerformance.objects.filter(officer__in=dept_officers)
            
            if dept_performance.exists():
                performance.department_avg_rating = round(
                    dept_performance.aggregate(avg=Avg('avg_rating'))['avg'] or 0,
                    2
                )
                performance.department_avg_resolution_time = round(
                    dept_performance.aggregate(avg=Avg('avg_resolution_time_hours'))['avg'] or 0,
                    1
                )
        
        performance.last_calculated = timezone.now()
        performance.save()
        
        # Log this calculation
        PerformanceAuditLog.objects.create(
            officer=officer,
            total_assigned=total_assigned,
            total_resolved=total_resolved,
            sla_compliance_rate=performance.sla_compliance_rate,
            avg_resolution_time_hours=performance.avg_resolution_time_hours,
            avg_rating=performance.avg_rating,
            reason='Automatic calculation from status_transition_service'
        )
        
        return performance

    @staticmethod
    def calculate_all_officers_performance():
        """
        Recalculate performance for all officers.
        Useful for scheduled task execution.
        
        Returns:
            Count of officers updated
        """
        from apps.users.models import User as UserModel
        
        # Get all department staff
        staff_users = UserModel.objects.filter(is_department_staff=True)
        
        updated_count = 0
        for officer in staff_users:
            try:
                PerformanceCalculationService.calculate_officer_performance(officer)
                updated_count += 1
            except Exception as e:
                print(f"Error calculating performance for {officer.email}: {str(e)}")
        
        return updated_count

    @staticmethod
    def get_department_leaderboard(department):
        """
        Get top-performing officers in a department.
        
        Args:
            department: Department instance
            
        Returns:
            Sorted list of OfficerPerformance objects
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        dept_officers = User.objects.filter(department=department)
        return OfficerPerformance.objects.filter(
            officer__in=dept_officers
        ).order_by('-avg_rating', '-sla_compliance_rate')

    @staticmethod
    def get_performance_trend(officer: User, days: int = 30):
        """
        Get performance trend for an officer over the last N days.
        
        Args:
            officer: User instance
            days: Number of days to look back
            
        Returns:
            List of audit logs showing performance trajectory
        """
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        
        return PerformanceAuditLog.objects.filter(
            officer=officer,
            created_at__gte=cutoff_date
        ).order_by('created_at')

    @staticmethod
    def get_officer_strengths_weaknesses(officer: User) -> dict:
        """
        Analyze officer's performance strengths and weaknesses.
        
        Args:
            officer: User instance
            
        Returns:
            Dictionary with analysis
        """
        try:
            performance = OfficerPerformance.objects.get(officer=officer)
        except OfficerPerformance.DoesNotExist:
            return {'error': 'Performance data not found'}
        
        strengths = []
        weaknesses = []
        
        # Analyze ratings
        if performance.avg_rating >= 4.5:
            strengths.append(f"Excellent citizen satisfaction ({performance.avg_rating}/5.0)")
        elif performance.avg_rating >= 4.0:
            strengths.append(f"Good citizen satisfaction ({performance.avg_rating}/5.0)")
        elif performance.avg_rating < 3.0:
            weaknesses.append(f"Low citizen satisfaction ({performance.avg_rating}/5.0)")
        
        # Analyze SLA compliance
        if performance.sla_compliance_rate >= 90:
            strengths.append(f"Excellent SLA compliance ({performance.sla_compliance_rate}%)")
        elif performance.sla_compliance_rate >= 80:
            strengths.append(f"Good SLA compliance ({performance.sla_compliance_rate}%)")
        elif performance.sla_compliance_rate < 70:
            weaknesses.append(f"Poor SLA compliance ({performance.sla_compliance_rate}%)")
        
        # Analyze resolution speed
        if performance.avg_resolution_time_days <= 1:
            strengths.append(f"Fast resolution time ({performance.avg_resolution_time_days:.1f} days)")
        elif performance.avg_resolution_time_days > 7:
            weaknesses.append(f"Slow resolution time ({performance.avg_resolution_time_days:.1f} days)")
        
        # Analyze completion rate
        if performance.total_assigned > 0:
            completion_rate = (performance.total_resolved / performance.total_assigned) * 100
            if completion_rate >= 95:
                strengths.append(f"High completion rate ({completion_rate:.1f}%)")
            elif completion_rate < 50:
                weaknesses.append(f"Low completion rate ({completion_rate:.1f}%)")
        
        return {
            'officer_id': officer.id,
            'officer_name': officer.get_full_name(),
            'strengths': strengths if strengths else ['No significant strengths identified'],
            'weaknesses': weaknesses if weaknesses else ['No significant weaknesses identified'],
            'overall_score': round((performance.avg_rating / 5.0 * 100), 1),
            'recommendation': PerformanceCalculationService._get_recommendation(performance)
        }

    @staticmethod
    def _get_recommendation(performance: OfficerPerformance) -> str:
        """Generate recommendation based on performance metrics."""
        if performance.avg_rating < 3.0 or performance.sla_compliance_rate < 60:
            return "⚠️ Requires immediate coaching and support"
        elif performance.avg_rating < 3.5 or performance.sla_compliance_rate < 75:
            return "📈 Needs improvement in key areas"
        elif performance.avg_rating >= 4.5 and performance.sla_compliance_rate >= 90:
            return "⭐ Top performer - consider for leadership roles"
        elif performance.avg_rating >= 4.0 and performance.sla_compliance_rate >= 85:
            return "✓ Good performer - on track"
        else:
            return "→ Consistent performer - monitor progress"
