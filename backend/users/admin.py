from typing import Any, Optional, Type, cast
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.forms import ModelForm
from django.http import HttpRequest
from django.utils.decorators import method_decorator
from django.utils.functional import cached_property
from .models import User, Department, UserLoginHistory
from .utils import safe_get_attr

def admin_display(
    short_description: str,
    boolean: bool = False,
    ordering: Optional[str] = None
) -> Any:
    """Decorator to set admin display properties on a method"""
    def decorator(func):
        func.short_description = short_description
        if boolean:
            func.boolean = True
        if ordering:
            func.admin_order_field = ordering
        return func
    return decorator

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at', 'updated_at')
    search_fields = ('name', 'code')
    ordering = ('name',)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'get_username', 'get_email', 'get_full_name', 'get_role',
        'get_department', 'get_ward', 'get_status', 'get_is_active'
    )
    list_filter = (
        'role', 'department', 'ward', 'status',
        'is_active', 'is_email_verified', 'is_phone_verified'
    )
    search_fields = (
        'username', 'email', 'full_name',
        'phone', 'employee_id'
    )
    ordering = ('-date_joined',)
    
    @admin_display('Username', ordering='username')
    def get_username(self, obj: Any) -> str:
        return str(safe_get_attr(obj, 'username', ''))
    
    @admin_display('Email', ordering='email')
    def get_email(self, obj: Any) -> str:
        return str(safe_get_attr(obj, 'email', ''))
    
    @admin_display('Full Name', ordering='full_name')
    def get_full_name(self, obj: Any) -> str:
        return str(safe_get_attr(obj, 'full_name', ''))
    
    @admin_display('Role', ordering='role')
    def get_role(self, obj: Any) -> str:
        role = safe_get_attr(obj, 'role', '')
        role_dict = dict(User.ROLE_CHOICES)
        return str(role_dict.get(role, role))
    
    @admin_display('Department', ordering='department')
    def get_department(self, obj: Any) -> str:
        dept = safe_get_attr(obj, 'department')
        return str(dept) if dept else ''
    
    @admin_display('Ward', ordering='ward')
    def get_ward(self, obj: Any) -> str:
        return str(safe_get_attr(obj, 'ward', ''))
    
    @admin_display('Status', ordering='status')
    def get_status(self, obj: Any) -> str:
        return str(safe_get_attr(obj, 'status', ''))
    
    @admin_display('Active', boolean=True, ordering='is_active')
    def get_is_active(self, obj: Any) -> bool:
        return bool(safe_get_attr(obj, 'is_active', False))
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': (
                'full_name', 'email', 'phone', 'gender',
                'age', 'profile_picture'
            )
        }),
        (_('Location'), {
            'fields': (
                'ward', 'address', 'pincode',
                'latitude', 'longitude'
            )
        }),
        (_('Role & Department'), {
            'fields': (
                'role', 'department', 'designation',
                'employee_id'
            )
        }),
        (_('Settings'), {
            'fields': (
                'language_preference',
                'notification_email',
                'notification_sms',
                'has_accepted_terms'
            )
        }),
        (_('Status'), {
            'fields': (
                'status', 'is_email_verified',
                'is_phone_verified', 'is_active'
            )
        }),
        (_('Important dates'), {
            'fields': (
                'last_login', 'date_joined',
                'password_changed_at'
            )
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'phone',
                'password1', 'password2', 'role'
            ),
        }),
    )
    
    readonly_fields = (
        'date_joined', 'last_login',
        'password_changed_at'
    )

    def get_form(self, request: HttpRequest, obj: Optional[User] = None, change: bool = False, **kwargs: Any) -> Type[ModelForm]:
        form = super().get_form(request, obj, change, **kwargs)
        is_superuser = getattr(request.user, 'is_superuser', False)
        
        # Only super users can change roles and departments
        if not is_superuser:
            # Get base_fields safely
            base_fields = getattr(form, 'base_fields', None)
            if base_fields:
                # Disable role and department fields if they exist
                role_field = base_fields.get('role')
                if role_field:
                    role_field.disabled = True
                    
                dept_field = base_fields.get('department')
                if dept_field:
                    dept_field.disabled = True
                
        return form

@admin.register(UserLoginHistory)
class UserLoginHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'timestamp', 'ip_address',
        'was_successful', 'failure_reason'
    )
    list_filter = ('was_successful', 'timestamp')
    search_fields = (
        'user__username', 'user__email',
        'ip_address', 'user_agent'
    )
    readonly_fields = (
        'user', 'timestamp', 'ip_address',
        'user_agent', 'was_successful',
        'failure_reason'
    )
    ordering = ('-timestamp',)