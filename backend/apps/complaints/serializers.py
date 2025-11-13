"""
Serializers for complaints app.
"""
from rest_framework import serializers
from .models import (
    Complaint, ComplaintUpdate, ComplaintImage, ComplaintAttachment,
    ComplaintTimeline, ComplaintResolution, OfficerNotes
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
        read_only_fields = ('id', 'user', 'ai_category', 'ai_confidence_score', 
                             'created_at', 'updated_at', 'resolved_at')
    
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
            'ai_category', 'ai_confidence_score',
            'image', 'images', 'attachments',
            'admin_notes', 'officer_notes',
            'timeline', 'resolution', 'updates',
            'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = (
            'id', 'user', 'ai_category', 'ai_confidence_score',
            'created_at', 'updated_at', 'resolved_at',
            'images', 'attachments', 'timeline', 'resolution', 'updates', 'officer_notes'
        )
