"""
Views for complaints management.
"""
from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

from .models import (
    Complaint, ComplaintUpdate, ComplaintImage, ComplaintAttachment,
    ComplaintTimeline, ComplaintResolution, OfficerNotes, ComplaintAssignment,
    OfficerRating, OfficerPerformance
)
from .status_transition_service import StatusTransitionService
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
    ComplaintDetailSerializerV2,
    OfficerRatingSerializer,
    OfficerRatingCreateSerializer,
    OfficerPerformanceSerializer,
    OfficerPerformanceDetailSerializer
)
from apps.users.permissions import IsAdminOrDepartmentStaff
from .tasks import send_complaint_notification, send_status_update_notification
from apps.notifications.utils import (
    notify_complaint_created,
    notify_status_change,
    notify_department_assignment,
    notify_staff_assignment,
)
from .analytics_service import AnalyticsService


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for complaint CRUD operations.
    Citizens can only see their own complaints.
    Admin/Staff can see all complaints.
    Supports Mumbai-specific zone and ward filtering.
    """
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'priority', 'department', 'ward']
    search_fields = ['title', 'description', 'address', 'city']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):  # type: ignore[override]
        """
        Filter complaints based on 3-tier admin hierarchy:
        - Super Admin (ADMIN + is_superuser): All complaints
        - Department Admin (ADMIN + not is_superuser): Only department complaints
        - BMC Officer (DEPARTMENT_STAFF): Only assigned ward complaints
        - Citizen: Only their own complaints
        """
        from .mumbai_utils import get_wards_for_zone
        
        user = self.request.user
        queryset = Complaint.objects.select_related('user', 'department', 'assigned_to')
        
        # Super Admin: Access to all complaints
        if getattr(user, 'role', '') == 'ADMIN' and getattr(user, 'is_superuser', False):
            queryset = queryset.all()
        
        # Department Admin: Only their department's complaints
        elif getattr(user, 'role', '') == 'ADMIN' and not getattr(user, 'is_superuser', False):
            user_department = None
            try:
                if hasattr(user, 'officer_profile') and user.officer_profile and user.officer_profile.department:
                    user_department = user.officer_profile.department
            except:
                pass
            
            if user_department:
                queryset = queryset.filter(department=user_department)
            else:
                queryset = queryset.none()  # No access if no department assigned
        
        # BMC Officer: Only their assigned ward complaints
        elif getattr(user, 'is_department_staff', False):
            user_ward = None
            try:
                if hasattr(user, 'officer_profile') and user.officer_profile:
                    user_ward = user.officer_profile.assigned_ward
            except:
                pass
            
            if user_ward:
                queryset = queryset.filter(ward=user_ward)
            else:
                queryset = queryset.none()  # No access if no ward assigned
        
        # Citizen: Only their own complaints
        else:
            queryset = queryset.filter(user=user)
        
        # Apply zone filter (Mumbai-specific) - Only for Super Admin
        zone = self.request.query_params.get('zone')
        if zone and zone != 'All':
            zone_wards = get_wards_for_zone(zone)
            if zone_wards:
                queryset = queryset.filter(ward__in=zone_wards)
        
        # Apply department filter from query params (for Super Admin filtering)
        department_filter = self.request.query_params.get('department')
        if department_filter and getattr(user, 'role', '') == 'ADMIN' and getattr(user, 'is_superuser', False):
            queryset = queryset.filter(department_id=department_filter)
        
        # Apply period filter
        period = self.request.query_params.get('period')
        if period:
            try:
                days = int(period)
                from_date = timezone.now() - timezone.timedelta(days=days)
                queryset = queryset.filter(created_at__gte=from_date)
            except ValueError:
                pass
        
        return queryset
    
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
        # Use V2 serializer for retrieve which includes nested images, attachments, etc
        return ComplaintDetailSerializerV2
    
    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to add role-based access control for 3-tier hierarchy.
        - Super Admin: Can view all complaints
        - Department Admin: Can view complaints in their department
        - BMC Officer: Can view complaints in their assigned ward
        - Citizen: Can view only their own complaints
        """
        complaint = self.get_object()
        user = request.user
        
        # Super Admin: Access to all complaints
        if user.role == 'ADMIN' and user.is_superuser:
            serializer = self.get_serializer(complaint)
            return Response(serializer.data)
        
        # Department Admin: Only their department's complaints
        if user.role == 'ADMIN' and not user.is_superuser:
            user_department = None
            try:
                if hasattr(user, 'officer_profile') and user.officer_profile and user.officer_profile.department:
                    user_department = user.officer_profile.department
            except:
                pass
            
            if not user_department or complaint.department != user_department:
                return Response(
                    {"error": "Access Denied: This complaint belongs to another department."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(complaint)
            return Response(serializer.data)
        
        # BMC Officer: Only their assigned ward complaints
        if user.is_department_staff:
            user_ward = None
            try:
                if hasattr(user, 'officer_profile') and user.officer_profile:
                    user_ward = user.officer_profile.assigned_ward
            except:
                pass
            
            if not user_ward:
                return Response(
                    {"error": "Access Denied: You do not have a ward assigned."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if complaint.ward != user_ward:
                return Response(
                    {"error": f"Access Denied: This complaint is in ward {complaint.ward}, but you are assigned to ward {user_ward}."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(complaint)
            return Response(serializer.data)
        
        # Citizen: Only their own complaints
        if complaint.user != user:
            return Response(
                {"error": "Access Denied: You can only view your own complaints."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(complaint)
        return Response(serializer.data)
    

    def perform_create(self, serializer):
        """Create complaint and send notifications."""
        try:
            # Ensure user is authenticated
            if not self.request.user.is_authenticated:
                raise serializers.ValidationError("Authentication required to submit complaints.")

            # Save the complaint with the authenticated user
            complaint = serializer.save(user=self.request.user)
            
            # Send notifications
            try:
                # Send synchronously if Celery is not enabled
                send_complaint_notification(complaint.id)
            except Exception as e:
                logger.error(f"Notification sending failed: {str(e)}")             
            
            # Create in-app notification
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

    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrDepartmentStaff])
    def officer_dashboard(self, request):
        """
        Get personalized officer dashboard data.
        Returns complaints assigned to the requesting officer grouped by status.
        Officers only see complaints in their assigned ward.
        """
        officer = request.user
        
        # Check if user is a department staff member
        if not getattr(officer, 'is_department_staff', False):
            return Response(
                {"error": "This endpoint is only for department staff"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if officer has a ward assigned
        if not officer.ward:
            return Response(
                {"error": "You do not have a ward assigned. Contact your supervisor."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all complaints assigned to this officer AND in their ward
        assigned_complaints = Complaint.objects.filter(
            assigned_to=officer,
            ward=officer.ward  # Filter by officer's assigned ward
        ).select_related('user', 'department', 'assignment')
        
        # Group by status
        new_complaints = assigned_complaints.filter(status='PENDING')
        in_progress = assigned_complaints.filter(status='IN_PROGRESS')
        resolved = assigned_complaints.filter(status='RESOLVED', resolved_at__date=timezone.now().date())
        
        # Serialize complaints
        new_serialized = ComplaintDetailSerializer(new_complaints, many=True).data
        in_progress_serialized = ComplaintDetailSerializer(in_progress, many=True).data
        resolved_serialized = ComplaintDetailSerializer(resolved, many=True).data
        
        # Add SLA info to each complaint
        for complaint_data in new_serialized + in_progress_serialized + resolved_serialized:
            complaint_id = complaint_data.get('id')
            if complaint_id:
                complaint = assigned_complaints.filter(id=complaint_id).first()
                if complaint:
                    complaint_data['sla_status'] = StatusTransitionService.get_sla_status(complaint)
        
        # Get performance metrics
        performance = StatusTransitionService.get_officer_performance(officer)
        
        # Get department performance for comparison
        department_performance = {}
        if officer.department:
            department_performance = StatusTransitionService.get_department_performance(officer.department)
        
        return Response({
            'officer': {
                'id': officer.id,
                'first_name': officer.first_name,
                'last_name': officer.last_name,
                'email': officer.email,
                'department': {
                    'id': officer.department.id if officer.department else None,
                    'name': officer.department.name if officer.department else None,
                    'location': officer.department.location if officer.department else None,
                } if hasattr(officer, 'department') else None
            },
            'new_complaints': new_serialized,
            'in_progress': in_progress_serialized,
            'recent_resolutions': resolved_serialized,
            'performance_metrics': {
                'total_assigned': performance['total_assigned'],
                'completed': performance['completed'],
                'pending': performance['pending'],
                'completion_rate': performance['completion_rate'],
                'avg_resolution_time': performance['avg_resolution_time'],
                'sla_compliance_rate': performance['sla_compliance_rate'],
                'sla_compliant': performance['sla_compliant'],
                'sla_breached': performance['sla_breached'],
                'department_avg_resolution_time': department_performance.get('avg_resolution_time', 0),
            }
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrDepartmentStaff])
    def update_status(self, request, pk=None):
        """
        Update complaint status with public/private updates and proof image.
        
        Request body:
        {
            "new_status": "IN_PROGRESS|RESOLVED|REJECTED",
            "public_update": "Update visible to citizen",
            "private_notes": "Internal notes for team",
            "proof_image": <file> (optional, for RESOLVED status)
        }
        """
        complaint = self.get_object()
        officer = request.user
        
        new_status = request.data.get('new_status')
        public_update = request.data.get('public_update', '')
        private_notes = request.data.get('private_notes', '')
        proof_image = request.FILES.get('proof_image')
        
        if not new_status:
            return Response(
                {"error": "new_status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use status transition service
        success, message, updated_complaint = StatusTransitionService.transition_complaint(
            complaint=complaint,
            new_status=new_status,
            officer=officer,
            public_update=public_update,
            private_notes=private_notes,
            proof_image=proof_image
        )
        
        if not success:
            return Response(
                {"error": message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send notifications
        try:
            notify_status_change(updated_complaint, complaint.status, new_status)
        except Exception as e:
            logger.error(f"Notification failed: {str(e)}")
        
        return Response({
            'success': True,
            'message': message,
            'complaint': ComplaintDetailSerializer(updated_complaint).data
        }, status=status.HTTP_200_OK)


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


class OfficerRatingViewSet(viewsets.ModelViewSet):
    """ViewSet for officer ratings from citizens."""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['officer', 'rating', 'complaint']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get ratings - citizens see their own, staff/admin see all."""
        user = self.request.user
        if getattr(user, 'is_department_staff', False) or getattr(user, 'is_admin', False):
            return OfficerRating.objects.select_related('officer', 'citizen', 'complaint').all()
        else:
            # Citizens only see ratings they submitted
            return OfficerRating.objects.filter(citizen=user).select_related('officer', 'complaint')
    
    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'create':
            return OfficerRatingCreateSerializer
        return OfficerRatingSerializer
    
    def perform_create(self, serializer):
        """Create rating with current user as citizen."""
        serializer.save(citizen=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrDepartmentStaff])
    def by_officer(self, request):
        """Get average rating for each officer."""
        from django.db.models import Avg
        officers = OfficerRating.objects.values('officer__id', 'officer__first_name', 'officer__last_name', 'officer__email').annotate(
            avg_rating=Avg('rating'),
            total_ratings=Count('id')
        ).order_by('-avg_rating')
        
        return Response({
            'officer_ratings': list(officers)
        })
    
    @action(detail=True, methods=['get'])
    def officer_ratings(self, request, pk=None):
        """Get all ratings for a specific officer."""
        from django.db.models import Count, Avg
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            officer = User.objects.get(id=pk)
            ratings = OfficerRating.objects.filter(officer=officer)
            
            stats = ratings.aggregate(
                avg_rating=Avg('rating'),
                total_ratings=Count('id')
            )
            
            serializer = OfficerRatingSerializer(ratings, many=True)
            
            return Response({
                'officer': {
                    'id': officer.id,
                    'name': officer.get_full_name(),
                    'email': officer.email,
                },
                'stats': stats,
                'ratings': serializer.data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Officer not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class OfficerPerformanceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for officer performance metrics (read-only)."""
    
    permission_classes = [IsAuthenticated]
    serializer_class = OfficerPerformanceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['officer']
    search_fields = ['officer__first_name', 'officer__last_name', 'officer__email']
    ordering_fields = ['avg_rating', 'sla_compliance_rate', 'avg_resolution_time_hours', 'total_resolved']
    ordering = ['-avg_rating']
    
    def get_queryset(self):
        """Get performance metrics - department staff see their own, admin sees all."""
        user = self.request.user
        
        if getattr(user, 'is_admin', False):
            return OfficerPerformance.objects.select_related('officer').all()
        elif getattr(user, 'is_department_staff', False):
            # Department staff see their own metrics and those of their department
            if hasattr(user, 'department') and user.department:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                dept_officers = User.objects.filter(department=user.department)
                return OfficerPerformance.objects.filter(officer__in=dept_officers)
        
        # Regular users see their own if applicable
        try:
            return OfficerPerformance.objects.filter(officer=user)
        except:
            return OfficerPerformance.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer."""
        if self.action == 'retrieve':
            return OfficerPerformanceDetailSerializer
        return OfficerPerformanceSerializer
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get top-performing officers by rating."""
        from django.db.models import Count, Avg
        
        top_officers = OfficerPerformance.objects.select_related('officer').order_by('-avg_rating')[:10]
        serializer = OfficerPerformanceSerializer(top_officers, many=True)
        
        return Response({
            'leaderboard': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def department_comparison(self, request):
        """Compare officer performance with department averages."""
        from django.db.models import Avg
        
        user = request.user
        if not hasattr(user, 'department') or not user.department:
            return Response(
                {'error': 'User has no department'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get this officer's metrics
        try:
            my_performance = OfficerPerformance.objects.get(officer=user)
        except OfficerPerformance.DoesNotExist:
            return Response(
                {'error': 'Performance metrics not yet calculated'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get department averages
        from django.contrib.auth import get_user_model
        User = get_user_model()
        dept_officers = User.objects.filter(department=user.department)
        dept_performance = OfficerPerformance.objects.filter(officer__in=dept_officers).aggregate(
            avg_rating=Avg('avg_rating'),
            avg_sla_compliance=Avg('sla_compliance_rate'),
            avg_resolution_time=Avg('avg_resolution_time_hours')
        )
        
        return Response({
            'my_performance': OfficerPerformanceSerializer(my_performance).data,
            'department_averages': dept_performance,
            'above_average': {
                'rating': my_performance.avg_rating > (dept_performance.get('avg_rating') or 0),
                'sla_compliance': my_performance.sla_compliance_rate > (dept_performance.get('avg_sla_compliance') or 0),
                'resolution_time': my_performance.avg_resolution_time_hours < (dept_performance.get('avg_resolution_time') or 999),
            }
        })


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for analytics and dashboard metrics.
    Admin only access.
    """
    permission_classes = [IsAuthenticated]
    
    def check_admin_permission(self, request):
        """Verify user is admin."""
        if not (request.user.is_admin or request.user.is_superuser):
            return False
        return True
    
    @action(detail=False, methods=['get'])
    def ward_heatmap(self, request):
        """
        Get complaint heatmap by ward and date.
        
        Query Parameters:
        - days: Number of days to include (default: 30)
        
        Returns heatmap data suitable for visualization
        """
        if not self.check_admin_permission(request):
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        data = AnalyticsService.get_ward_complaint_heatmap(days=days)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def response_times(self, request):
        """
        Get response time metrics by ward.
        
        Query Parameters:
        - days: Number of days to include (default: 30)
        
        Returns response time statistics for each ward
        """
        if not self.check_admin_permission(request):
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        data = AnalyticsService.get_ward_response_times(days=days)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def department_comparison(self, request):
        """
        Get comparison metrics across departments.
        
        Query Parameters:
        - days: Number of days to include (default: 30)
        
        Returns department performance comparison
        """
        if not self.check_admin_permission(request):
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        data = AnalyticsService.get_department_comparison(days=days)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def complaint_trends(self, request):
        """
        Get complaint trend data over time.
        
        Query Parameters:
        - days: Number of days to include (default: 30)
        
        Returns daily complaint counts and status distribution
        """
        if not self.check_admin_permission(request):
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        data = AnalyticsService.get_complaint_trends(days=days)
        
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """
        Get all analytics data for dashboard at once.
        
        Query Parameters:
        - days: Number of days to include (default: 30)
        
        Returns comprehensive dashboard data
        """
        if not self.check_admin_permission(request):
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        
        try:
            heatmap = AnalyticsService.get_ward_complaint_heatmap(days=days)
            response_times = AnalyticsService.get_ward_response_times(days=days)
            dept_comparison = AnalyticsService.get_department_comparison(days=days)
            trends = AnalyticsService.get_complaint_trends(days=days)
            
            return Response({
                'heatmap': heatmap,
                'response_times': response_times,
                'department_comparison': dept_comparison,
                'trends': trends,
                'period_days': days
            })
        except Exception as e:
            logger.error(f"Error generating dashboard summary: {str(e)}")
            return Response(
                {'error': 'Failed to generate dashboard data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )