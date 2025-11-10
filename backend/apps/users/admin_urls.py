"""
URL configuration for admin management endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .admin_views import OfficerManagementViewSet, UserManagementViewSet

router = DefaultRouter()
router.register(r'officers', OfficerManagementViewSet, basename='officer')
router.register(r'users', UserManagementViewSet, basename='user')

app_name = 'admin'

urlpatterns = [
    path('', include(router.urls)),
]
