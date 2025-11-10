"""
Views for departments management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Department, DepartmentStaff
from .serializers import (
    DepartmentListSerializer,
    DepartmentDetailSerializer,
    DepartmentCreateUpdateSerializer,
    DepartmentStaffSerializer
)
from apps.users.permissions import IsAdminUser


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for department CRUD operations.
    All authenticated users can view departments.
    Only admins can create/update/delete.
    """
    
    queryset = Department.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            return DepartmentListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DepartmentCreateUpdateSerializer
        return DepartmentDetailSerializer
    
    def get_permissions(self):
        """Only admins can create/update/delete departments."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def add_staff(self, request, pk=None):
        """Add staff member to department."""
        department = self.get_object()
        
        serializer = DepartmentStaffSerializer(data={
            **request.data,
            'department': department.id
        })
        serializer.is_valid(raise_exception=True)
        serializer.save(department=department)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAdminUser])
    def remove_staff(self, request, pk=None):
        """Remove staff member from department."""
        department = self.get_object()
        user_id = request.data.get('user_id')
        
        try:
            staff = DepartmentStaff.objects.get(department=department, user_id=user_id)
            staff.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DepartmentStaff.DoesNotExist:
            return Response(
                {"error": "Staff member not found in this department."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get department statistics."""
        department = self.get_object()
        
        stats = {
            'total_staff': department.staff_members.count(),
            'total_complaints': department.complaints.count(),
            'pending_complaints': department.complaints.filter(status='PENDING').count(),
            'in_progress_complaints': department.complaints.filter(status='IN_PROGRESS').count(),
            'resolved_complaints': department.complaints.filter(status='RESOLVED').count(),
        }
        
        return Response(stats)
