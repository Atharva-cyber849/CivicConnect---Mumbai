"""
Serializers for complaints app.
"""
from rest_framework import serializers
from .models import (
    Complaint, ComplaintUpdate, ComplaintImage, ComplaintAttachment,
    ComplaintTimeline, ComplaintResolution, OfficerNotes, OfficerRating, OfficerPerformance
)


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """Serializer for complaint updates/comments."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ComplaintUpdate
        fields = ('id', 'complaint', 'user', 'user_name', 'user_email', 'message', 
                  'previous_status', 'new_status', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class ComplaintListSerializer(serializers.ModelSerializer):
    """Serializer for complaint list view."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = ('id', 'title', 'category', 'status', 'priority', 'user_name', 
                  'department_name', 'address', 'city', 'latitude', 'longitude', 
                  'image', 'created_at')
    
    def get_latitude(self, obj):
        return obj.latitude if obj.latitude is not None else None
    
    def get_longitude(self, obj):
        return obj.longitude if obj.longitude is not None else None


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """Serializer for complaint detail view."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at', 'resolved_at')
    
    def get_latitude(self, obj):
        return obj.latitude if obj.latitude is not None else None
    
    def get_longitude(self, obj):
        return obj.longitude if obj.longitude is not None else None


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating complaints."""
    
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)
    
    class Meta:
        model = Complaint
        fields = ('title', 'description', 'category', 'address', 'ward', 'city', 'state', 
                  'zip_code', 'latitude', 'longitude', 'image')
    
    def create(self, validated_data):
        # Extract lat/lng if provided
        latitude = validated_data.get('latitude', None)
        longitude = validated_data.get('longitude', None)
        
        # Set user from request context
        validated_data['user'] = self.context['request'].user
        
        return super().create(validated_data)


class ComplaintUpdateStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating complaint status (admin/staff only)."""
    
    update_message = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Complaint
        fields = ('status', 'priority', 'department', 'assigned_to', 'admin_notes', 'update_message')
    
    def update(self, instance, validated_data):
        update_message = validated_data.pop('update_message', None)
        previous_status = instance.status
        
        # Update complaint
        updated_complaint = super().update(instance, validated_data)
        
        # Create update record if message provided or status changed
        if update_message or (previous_status != updated_complaint.status):
            ComplaintUpdate.objects.create(
                complaint=updated_complaint,
                user=self.context['request'].user,
                message=update_message or f"Status changed from {previous_status} to {updated_complaint.status}",
                previous_status=previous_status,
                new_status=updated_complaint.status
            )
        
        return updated_complaint


class ComplaintImageSerializer(serializers.ModelSerializer):
    """Serializer for complaint images."""
    
    class Meta:
        model = ComplaintImage
        fields = ('id', 'complaint', 'image', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for complaint attachments."""
    
    class Meta:
        model = ComplaintAttachment
        fields = ('id', 'complaint', 'file', 'file_name', 'file_type', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class ComplaintTimelineSerializer(serializers.ModelSerializer):
    """Serializer for complaint timeline."""
    
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)
    updated_by_email = serializers.CharField(source='updated_by.email', read_only=True)
    
    class Meta:
        model = ComplaintTimeline
        fields = ('id', 'complaint', 'previous_status', 'new_status', 'updated_by', 
                  'updated_by_name', 'updated_by_email', 'notes', 'created_at')
        read_only_fields = ('id', 'created_at')


class ComplaintResolutionSerializer(serializers.ModelSerializer):
    """Serializer for complaint resolution."""
    
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    resolved_by_email = serializers.CharField(source='resolved_by.email', read_only=True)
    
    class Meta:
        model = ComplaintResolution
        fields = ('id', 'complaint', 'resolution_notes', 'resolution_date', 'resolved_by',
                  'resolved_by_name', 'resolved_by_email', 'proof_image', 'proof_document',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class OfficerNotesSerializer(serializers.ModelSerializer):
    """Serializer for officer notes."""
    
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    officer_email = serializers.CharField(source='officer.email', read_only=True)
    
    class Meta:
        model = OfficerNotes
        fields = ('id', 'complaint', 'officer', 'officer_name', 'officer_email', 
                  'notes', 'is_internal', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class ComplaintDetailSerializerV2(serializers.ModelSerializer):
    """Enhanced serializer for complaint detail view with all relationships."""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    assigned_officer_name = serializers.CharField(source='assigned_officer.get_full_name', read_only=True)
    
    # Nested relationships
    images = ComplaintImageSerializer(many=True, read_only=True)
    attachments = ComplaintAttachmentSerializer(many=True, read_only=True)
    timeline = ComplaintTimelineSerializer(many=True, read_only=True)
    resolution = ComplaintResolutionSerializer(read_only=True)
    officer_notes = OfficerNotesSerializer(many=True, read_only=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = (
            'id', 'title', 'description', 'category', 'status', 'priority',
            'user', 'user_name', 'user_email',
            'department', 'department_name',
            'assigned_to', 'assigned_to_name',
            'assigned_officer', 'assigned_officer_name',
            'estimated_resolution_days', 'public_update',
            'address', 'ward', 'city', 'state', 'zip_code',
            'latitude', 'longitude',
            'image', 'images', 'attachments',
            'admin_notes', 'officer_notes',
            'timeline', 'resolution', 'updates',
            'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = (
            'id', 'user',
            'created_at', 'updated_at', 'resolved_at',
            'images', 'attachments', 'timeline', 'resolution', 'updates', 'officer_notes'
        )


class OfficerRatingSerializer(serializers.ModelSerializer):
    """Serializer for officer ratings from citizens."""
    
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    officer_email = serializers.CharField(source='officer.email', read_only=True)
    citizen_name = serializers.CharField(source='citizen.get_full_name', read_only=True)
    complaint_title = serializers.CharField(source='complaint.title', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    
    class Meta:
        model = OfficerRating
        fields = (
            'id', 'complaint', 'complaint_title',
            'officer', 'officer_name', 'officer_email',
            'citizen', 'citizen_name',
            'rating', 'rating_display', 'comment',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'officer', 'citizen', 'created_at', 'updated_at')


class OfficerRatingCreateSerializer(serializers.ModelSerializer):
    """Serializer for citizens to submit officer ratings."""
    
    class Meta:
        model = OfficerRating
        fields = ('complaint', 'officer', 'rating', 'comment')
    
    def create(self, validated_data):
        # Set citizen to the current user
        validated_data['citizen'] = self.context['request'].user
        return super().create(validated_data)


class OfficerPerformanceSerializer(serializers.ModelSerializer):
    """Serializer for officer performance metrics."""
    
    officer_name = serializers.CharField(source='officer.get_full_name', read_only=True)
    officer_email = serializers.CharField(source='officer.email', read_only=True)
    department_name = serializers.SerializerMethodField()
    completion_rate = serializers.SerializerMethodField()
    rating_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = OfficerPerformance
        fields = (
            'id', 'officer', 'officer_name', 'officer_email',
            'department_name',
            'total_assigned', 'total_resolved', 'total_pending', 'total_rejected',
            'completion_rate',
            'sla_compliant_count', 'sla_breached_count', 'sla_compliance_rate',
            'avg_resolution_time_hours', 'avg_resolution_time_days',
            'total_ratings', 'avg_rating',
            'rating_breakdown',
            'department_avg_rating', 'department_avg_resolution_time',
            'created_at', 'updated_at', 'last_calculated'
        )
        read_only_fields = '__all__'
    
    def get_department_name(self, obj):
        """Get officer's department name."""
        if hasattr(obj.officer, 'department') and obj.officer.department:
            return obj.officer.department.name
        return None
    
    def get_completion_rate(self, obj):
        """Calculate completion rate as percentage."""
        if obj.total_assigned == 0:
            return 0
        return round((obj.total_resolved / obj.total_assigned) * 100, 1)
    
    def get_rating_breakdown(self, obj):
        """Return rating distribution."""
        return {
            '5_star': obj.five_star_count,
            '4_star': obj.four_star_count,
            '3_star': obj.three_star_count,
            '2_star': obj.two_star_count,
            '1_star': obj.one_star_count,
        }


class OfficerPerformanceDetailSerializer(OfficerPerformanceSerializer):
    """Extended performance serializer with recent ratings."""
    
    recent_ratings = serializers.SerializerMethodField()
    
    class Meta(OfficerPerformanceSerializer.Meta):
        fields = OfficerPerformanceSerializer.Meta.fields + ('recent_ratings',)
    
    def get_recent_ratings(self, obj):
        """Get the 5 most recent ratings for this officer."""
        ratings = OfficerRating.objects.filter(officer=obj.officer).order_by('-created_at')[:5]
        return OfficerRatingSerializer(ratings, many=True).data