"""
URL configuration for users app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, ProfileView, ChangePasswordView, CustomLoginView, 
    AdminRegisterView, logout_view, AdminRegistrationRequestListView,
    AdminRegistrationRequestActionView, CreateSuperAdminView
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('admin-register/', AdminRegisterView.as_view(), name='admin_register'),
    path('login/', CustomLoginView.as_view(), name='login'),  # Use custom login view
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Admin registration management (super admin only)
    path('admin-requests/', AdminRegistrationRequestListView.as_view(), name='admin_requests'),
    path('admin-requests/<int:request_id>/action/', AdminRegistrationRequestActionView.as_view(), name='admin_request_action'),
    path('create-super-admin/', CreateSuperAdminView.as_view(), name='create_super_admin'),
]
