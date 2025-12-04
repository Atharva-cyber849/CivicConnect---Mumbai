"""
Complaint Assignment Serializers
Handles serialization of assignment-related data
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.complaints.models import Complaint
from apps.departments.models import Department
from apps.complaints.assignment_service import ComplaintAssignment, ComplaintReassignment

User = get_user_model()


class OfficerSummarySerializer(serializers.ModelSerializer):
    """Minimal officer info for assignment displays"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'ward', 'phone']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email


class DepartmentSimpleSerializer(serializers.ModelSerializer):
    """Minimal department info"""
    class Meta:
        model = Department
        fields = ['id', 'name', 'email', 'phone']


class ComplaintAssignmentSerializer(serializers.ModelSerializer):
    """Serialize complaint assignment with officer and department details"""
    assigned_to = OfficerSummarySerializer(read_only=True)
    department = DepartmentSimpleSerializer(read_only=True)
    complaint_id = serializers.SerializerMethodField()
    complaint_title = serializers.SerializerMethodField()
    sla_deadline = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplaintAssignment
        fields = [
            'id',
            'complaint_id',
            'complaint_title',
            'assigned_to',
            'department',
            'assigned_at',
            'sla_target_days',
            'sla_deadline',
            'days_until_deadline',
            'is_overdue',
        ]
        read_only_fields = fields
    
    def get_complaint_id(self, obj):
        return obj.complaint.id
    
    def get_complaint_title(self, obj):
        return obj.complaint.title
    
    def get_sla_deadline(self, obj):
        return obj.sla_deadline
    
    def get_days_until_deadline(self, obj):
        from datetime import datetime, timezone
        days = (obj.sla_deadline - datetime.now(timezone.utc)).days
        return max(days, 0)
    
    def get_is_overdue(self, obj):
        from datetime import datetime, timezone
        return obj.sla_deadline < datetime.now(timezone.utc)


class ComplaintReassignmentSerializer(serializers.ModelSerializer):
    """Serialize complaint reassignment history"""
    previously_assigned_to = OfficerSummarySerializer(read_only=True)
    complaint_title = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplaintReassignment
        fields = [
            'id',
            'complaint_title',
            'previously_assigned_to',
            'reason',
            'reassigned_at',
        ]
        read_only_fields = fields
    
    def get_complaint_title(self, obj):
        return obj.complaint.title


class AssignmentStatsSerializer(serializers.Serializer):
    """Serialize officer assignment statistics"""
    total_assigned = serializers.IntegerField()
    completed = serializers.IntegerField()
    pending = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    avg_resolution_days = serializers.IntegerField()
    sla_breaches = serializers.IntegerField()
    sla_compliance_rate = serializers.FloatField()


class ManualAssignmentSerializer(serializers.Serializer):
    """Serializer for manual complaint assignment request"""
    officer_id = serializers.IntegerField(
        help_text="ID of the officer to assign the complaint to"
    )
    reason = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Reason for manual assignment"
    )
    
    def validate_officer_id(self, value):
        """Validate that officer exists and is department staff"""
        try:
            officer = User.objects.get(
                id=value,
                role='DEPARTMENT_STAFF'
            )
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Officer not found or is not department staff"
            )
