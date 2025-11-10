from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

app_name = 'notifications'

urlpatterns = router.urls