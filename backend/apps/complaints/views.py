"""
Views for complaints management.
"""
from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

from .models import (
    Complaint, ComplaintUpdate, ComplaintImage, ComplaintAttachment,
    ComplaintTimeline, ComplaintResolution, OfficerNotes
)
from .serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintUpdateStatusSerializer,
    ComplaintUpdateSerializer,
    ComplaintImageSerializer,
    ComplaintAttachmentSerializer,
    ComplaintTimelineSerializer,
    ComplaintResolutionSerializer,
    OfficerNotesSerializer,
    ComplaintDetailSerializerV2
)
from apps.users.permissions import IsAdminOrDepartmentStaff
from .tasks import process_complaint_with_ai, send_complaint_notification, send_status_update_notification
from apps.notifications.utils import (
    notify_complaint_created,
    notify_status_change,
    notify_department_assignment,
    notify_staff_assignment,
)


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for complaint CRUD operations.
    Citizens can only see their own complaints.
    Admin/Staff can see all complaints.
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'priority', 'department']
    search_fields = ['title', 'description', 'address', 'city']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):  # type: ignore[override]
        """Filter complaints based on user role."""
        user = self.request.user
        
        if getattr(user, 'is_admin', False) or getattr(user, 'is_department_staff', False):  # type: ignore[attr-defined]
            return Complaint.objects.select_related('user', 'department', 'assigned_to').all()
        else:
            # Citizens only see their own complaints
            return Complaint.objects.filter(user=user).select_related('department')
    
    def get_serializer_class(self):  # type: ignore
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return ComplaintListSerializer
        elif self.action == 'create':
            return ComplaintCreateSerializer
        elif self.action in ['update_status', 'partial_update']:
            return ComplaintUpdateStatusSerializer
        elif self.action == 'geo_json':
            return ComplaintListSerializer
        return ComplaintDetailSerializer
    
    def perform_create(self, serializer):
        """Create complaint and trigger AI processing."""
        try:
            # Ensure user is authenticated
            if not self.request.user.is_authenticated:
                raise serializers.ValidationError("Authentication required to submit complaints.")

            # Save the complaint with the authenticated user
            complaint = serializer.save(user=self.request.user)
            
                # Process with AI service if image exists
            if complaint.image:
                try:
                    # Process synchronously if Celery is not enabled
                    process_complaint_with_ai(complaint.id)
                except Exception as e:
                    logger.error(f"AI processing failed: {str(e)}")
                    # Don't raise the error - allow complaint creation even if AI fails
            
            # Send notifications
            try:
                # Send synchronously if Celery is not enabled
                send_complaint_notification(complaint.id)
            except Exception as e:
                logger.error(f"Notification sending failed: {str(e)}")             # Create in-app notification
            notify_complaint_created(complaint)
            
            return complaint
            
        except Exception as e:
            logger.error(f"Error creating complaint: {str(e)}")
            raise serializers.ValidationError(str(e))
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrDepartmentStaff])
    def update_status(self, request, pk=None):
        """Update complaint status (admin/staff only)."""
        complaint = self.get_object()
        serializer = self.get_serializer(complaint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        previous_status = complaint.status
        updated = serializer.save()
        # If status changed, notify
        if previous_status != updated.status:
            # Send status update notification synchronously if Celery is not enabled
            send_status_update_notification(updated.id, previous_status, updated.status)
            notify_status_change(updated, previous_status, updated.status)  # in-app persistent
            # Department/staff assignment notifications
            if updated.department and (not complaint.department or complaint.department != updated.department):
                notify_department_assignment(updated, updated.department)
            if updated.assigned_to and (not complaint.assigned_to or complaint.assigned_to != updated.assigned_to):
                notify_staff_assignment(updated, updated.assigned_to)
        return Response(ComplaintDetailSerializer(complaint).data)
    
    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """Add an update/comment to a complaint."""
        complaint = self.get_object()
        
        serializer = ComplaintUpdateSerializer(data={
            **request.data,
            'complaint': complaint.id,
            'user': request.user.id
        })
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, complaint=complaint)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrDepartmentStaff])
    def statistics(self, request):
        """Get complaint statistics (admin only)."""
        queryset = self.get_queryset()
        
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
    
    @action(detail=False, methods=['get'])
    def geo_json(self, request):
        """Get complaints as GeoJSON for map visualization."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = ComplaintListSerializer(queryset, many=True)
        
        # Convert to GeoJSON format
        features = []
        for complaint in serializer.data:
            # Only include complaints that have coordinates
            if complaint.get('latitude') is not None and complaint.get('longitude') is not None:
                feature = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [float(complaint['longitude']), float(complaint['latitude'])]
                    },
                    'properties': {
                        k: v for k, v in complaint.items() 
                        if k not in ['latitude', 'longitude']
                    }
                }
                features.append(feature)
        
        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }
        
        return Response(geojson)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def map(self, request):
        """Get complaints for map view with optional bounds filter."""
        queryset = Complaint.objects.filter(latitude__isnull=False, longitude__isnull=False)
        
        # Filter by bounds if provided
        ne_lat = request.GET.get('ne_lat')
        ne_lng = request.GET.get('ne_lng')
        sw_lat = request.GET.get('sw_lat')
        sw_lng = request.GET.get('sw_lng')
        
        if all([ne_lat, ne_lng, sw_lat, sw_lng]):
            queryset = queryset.filter(
                latitude__lte=float(ne_lat),
                latitude__gte=float(sw_lat),
                longitude__lte=float(ne_lng),
                longitude__gte=float(sw_lng)
            )
        
        serializer = ComplaintListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='track/(?P<tracking_number>[^/.]+)', permission_classes=[AllowAny])
    def track(self, request, tracking_number=None):
        """Track complaint by tracking number (public access)."""
        try:
            complaint = Complaint.objects.get(id=tracking_number)
            serializer = ComplaintDetailSerializer(complaint)
            return Response(serializer.data)
        except Complaint.DoesNotExist:
            return Response(
                {"error": "Complaint not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get complaint statistics for the current user."""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        queryset = Complaint.objects.filter(user=request.user)
        
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
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrDepartmentStaff])
    def quick_stats(self, request):
        """Get quick statistics for admin dashboard."""
        return self.statistics(request)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminOrDepartmentStaff])
    def assign(self, request, pk=None):
        """Assign complaint to department or staff member."""
        complaint = self.get_object()
        
        department_id = request.data.get('department')
        assigned_to_id = request.data.get('assigned_to')
        
        if department_id:
            from apps.departments.models import Department
            try:
                complaint.department = Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                return Response(
                    {"error": "Department not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if assigned_to_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                complaint.assigned_to = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        complaint.save()
        return Response(ComplaintDetailSerializer(complaint).data)
    
    @action(detail=True, methods=['post'])
    def comments(self, request, pk=None):
        """Add comment to complaint (alias for add_update)."""
        return self.add_update(request, pk)
    
    @action(detail=False, methods=['get'])
    def ward(self, request):
        """Get complaints by ward."""
        ward_id = request.query_params.get('ward')
        if not ward_id:
            return Response(
                {"error": "ward parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(ward=ward_id)
        serializer = ComplaintListSerializer(queryset, many=True)
        return Response(serializer.data)


class ComplaintImageViewSet(viewsets.ModelViewSet):
    """ViewSet for complaint images."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintImageSerializer
    
    def get_queryset(self):
        complaint_id = self.kwargs.get('complaint_id')
        return ComplaintImage.objects.filter(complaint_id=complaint_id)
    
    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('complaint_id')
        try:
            complaint = Complaint.objects.get(id=complaint_id)
            serializer.save(complaint=complaint)
        except Complaint.DoesNotExist:
            raise serializers.ValidationError("Complaint not found")


class ComplaintAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for complaint attachments."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintAttachmentSerializer
    
    def get_queryset(self):
        complaint_id = self.kwargs.get('complaint_id')
        return ComplaintAttachment.objects.filter(complaint_id=complaint_id)
    
    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('complaint_id')
        try:
            complaint = Complaint.objects.get(id=complaint_id)
            serializer.save(complaint=complaint)
        except Complaint.DoesNotExist:
            raise serializers.ValidationError("Complaint not found")


class ComplaintTimelineViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for complaint timeline (read-only)."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = ComplaintTimelineSerializer
    
    def get_queryset(self):
        complaint_id = self.kwargs.get('complaint_id')
        return ComplaintTimeline.objects.filter(complaint_id=complaint_id)


class ComplaintResolutionViewSet(viewsets.ModelViewSet):
    """ViewSet for complaint resolution."""
    
    permission_classes = [IsAuthenticated, IsAdminOrDepartmentStaff]
    serializer_class = ComplaintResolutionSerializer
    
    def get_queryset(self):
        complaint_id = self.kwargs.get('complaint_id')
        return ComplaintResolution.objects.filter(complaint_id=complaint_id)
    
    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('complaint_id')
        try:
            complaint = Complaint.objects.get(id=complaint_id)
            serializer.save(complaint=complaint, resolved_by=self.request.user)
        except Complaint.DoesNotExist:
            raise serializers.ValidationError("Complaint not found")


class OfficerNotesViewSet(viewsets.ModelViewSet):
    """ViewSet for officer notes."""
    
    permission_classes = [IsAuthenticated, IsAdminOrDepartmentStaff]
    serializer_class = OfficerNotesSerializer
    
    def get_queryset(self):
        complaint_id = self.kwargs.get('complaint_id')
        return OfficerNotes.objects.filter(complaint_id=complaint_id)
    
    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('complaint_id')
        try:
            complaint = Complaint.objects.get(id=complaint_id)
            serializer.save(complaint=complaint, officer=self.request.user)
        except Complaint.DoesNotExist:
            raise serializers.ValidationError("Complaint not found")
