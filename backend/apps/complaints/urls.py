"""
URL configuration for complaints app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import (
    ComplaintViewSet,
    ComplaintImageViewSet,
    ComplaintAttachmentViewSet,
    ComplaintTimelineViewSet,
    ComplaintResolutionViewSet,
    OfficerNotesViewSet
)
from .geocoding import reverse_geocode
from .analytics_views import (
    dashboard_stats,
    department_performance,
    ward_analytics,
    heatmap_data,
    monthly_trends,
    user_activity,
    complaint_export,
    public_stats
)

router = DefaultRouter()
router.register(r'', ComplaintViewSet, basename='complaint')

# Nested routers for complaint sub-resources
images_router = SimpleRouter()
images_router.register(r'images', ComplaintImageViewSet, basename='complaint-image')

attachments_router = SimpleRouter()
attachments_router.register(r'attachments', ComplaintAttachmentViewSet, basename='complaint-attachment')

timeline_router = SimpleRouter()
timeline_router.register(r'timeline', ComplaintTimelineViewSet, basename='complaint-timeline')

resolution_router = SimpleRouter()
resolution_router.register(r'resolution', ComplaintResolutionViewSet, basename='complaint-resolution')

notes_router = SimpleRouter()
notes_router.register(r'notes', OfficerNotesViewSet, basename='complaint-notes')

app_name = 'complaints'

urlpatterns = [
    path('user/stats/', ComplaintViewSet.as_view({'get': 'user_stats'}), name='user_stats'),
    # Admin dashboard stats compatibility endpoint
    path('admin/dashboard/stats/', ComplaintViewSet.as_view({'get': 'statistics'}), name='admin_dashboard_stats'),
    path('', include(router.urls)),
    
    # Nested routes for complaint sub-resources
    path('<int:complaint_id>/', include(images_router.urls)),
    path('<int:complaint_id>/', include(attachments_router.urls)),
    path('<int:complaint_id>/', include(timeline_router.urls)),
    path('<int:complaint_id>/', include(resolution_router.urls)),
    path('<int:complaint_id>/', include(notes_router.urls)),
    
    # Geocoding endpoint
    path('geocode/reverse/', reverse_geocode, name='reverse_geocode'),
    
    # Analytics endpoints
    path('analytics/dashboard/', dashboard_stats, name='dashboard_stats'),
    path('analytics/departments/', department_performance, name='department_performance'),
    path('analytics/wards/', ward_analytics, name='ward_analytics'),
    path('analytics/heatmap/', heatmap_data, name='heatmap_data'),
    path('analytics/trends/', monthly_trends, name='monthly_trends'),
    path('analytics/user/', user_activity, name='user_activity'),
    path('analytics/export/', complaint_export, name='complaint_export'),
    path('analytics/public/', public_stats, name='public_stats'),
]
