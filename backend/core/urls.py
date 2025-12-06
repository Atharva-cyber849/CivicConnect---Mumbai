"""
URL configuration for Snap & Report project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Import admin views for custom endpoints
from apps.complaints.admin_views import bulk_update_complaints, get_ward_data, get_dashboard_stats

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Endpoints
    path('api/users/', include('apps.users.urls')),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/departments/', include('apps.departments.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/audit/', include('apps.audit.urls')),
    
    # Admin Management Endpoints (for frontend /admin/ routes)
    path('api/admin/', include('apps.users.admin_urls')),
    path('api/admin/departments/', include('apps.departments.urls')),  # Reuse departments endpoints
    path('api/admin/wards/', get_ward_data, name='admin_wards'),
    path('api/admin/complaints/bulk-update/', bulk_update_complaints, name='admin_bulk_update'),
    path('api/admin/dashboard/stats/', get_dashboard_stats, name='admin_dashboard_stats'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
