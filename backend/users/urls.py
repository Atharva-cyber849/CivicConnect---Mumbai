from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet)
router.register(r'', views.UserViewSet)

app_name = 'users'

urlpatterns = [
    path('', include(router.urls)),
]