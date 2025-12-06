"""
URL configuration for Audit Logging.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, LoginAttemptViewSet

router = DefaultRouter()
router.register(r'logs', AuditLogViewSet, basename='audit-logs')
router.register(r'login-attempts', LoginAttemptViewSet, basename='login-attempts')

app_name = 'audit'

urlpatterns = [
    path('', include(router.urls)),
]
