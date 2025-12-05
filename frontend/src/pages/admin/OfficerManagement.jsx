import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../components/Common/ErrorBoundary';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  EnvelopeIcon,
  UserIcon,
  ShieldCheckIcon,
  BuildingOffice2Icon,
  MapPinIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../context/AuthContext';
import { officersApi } from '../../api';
import { USER_ROLES, DEPARTMENTS } from '../../config/constants';
import { isSuperAdmin, isDepartmentAdmin, canManageOfficers } from '../../utils/roleBasedAccess';
import wardsData from '../../config/wardsData.json';

const OfficerManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Role-based access control - 3-tier admin hierarchy
  const userCanManageOfficers = canManageOfficers(user);
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsDepartmentAdmin = isDepartmentAdmin(user);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(null);

  // Extract wards from GeoJSON
  const mumbaiWards = wardsData.features.map(feature => ({
    code: feature.properties.ward_code,
    name: feature.properties.name,
    fullName: feature.properties.full_name
  })).sort((a, b) => a.code.localeCompare(b.code));

  // Fetch officers data with proper error handling
  const { data: officersData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['officers'],
    queryFn: async () => {
      try {
        const data = await officersApi.getAll();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Error in officers query:', err);
        throw err; // Re-throw to let React Query handle it
      }
    },
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching officers:', error);
      toast.error('Failed to load officers. Please try again.');
    }
  });

  // Safely get officers array
  const officers = useMemo(() => {
    if (!officersData) return [];
    return Array.isArray(officersData) ? officersData : [];
  }, [officersData]);

  // Determine which officers user can see based on role
  const getVisibleOfficers = useMemo(() => {
    if (!officers || !Array.isArray(officers)) return [];
    
    if (userIsSuperAdmin) return officers; // Super admin sees all officers
    if (userIsDepartmentAdmin) return officers.filter(o => o.department === user?.department); // Department Admin sees only their department officers
    
    return []; // BMC Officers cannot manage officers
  }, [officers, userIsSuperAdmin, userIsDepartmentAdmin, user?.department]);

  // Delete officer mutation
  const deleteOfficerMutation = useMutation({
    mutationFn: (id) => officersApi.delete(id),
    onSuccess: () => {
      toast.success('Officer deleted successfully');
      queryClient.invalidateQueries(['officers']);
      setShowDeleteDialog(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete officer');
    }
  });

  // Update officer status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => officersApi.updateOfficerStatus(id, { is_active: status }),
    onSuccess: () => {
      toast.success('Officer status updated successfully');
      queryClient.invalidateQueries(['officers']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (id) => officersApi.resetOfficerPassword(id),
    onSuccess: () => {
      toast.success('Password reset email sent to officer');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: (id) => officersApi.sendOfficerInvitation(id),
    onSuccess: () => {
      toast.success('Invitation email sent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  });

    // Filter officers based on search and filters AND role-based visibility
  const filteredOfficers = useMemo(() => {
    if (!getVisibleOfficers || !Array.isArray(getVisibleOfficers)) return [];
    
    return getVisibleOfficers.filter(officer => {
      if (!officer) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const officerName = officer.user_name?.toLowerCase() || '';
      const officerEmail = officer.user_email?.toLowerCase() || '';
      const officerDept = officer.department?.toLowerCase() || '';
      const officerWard = officer.ward?.toLowerCase() || '';
      
      const matchesSearch = officerName.includes(searchLower) ||
                          officerEmail.includes(searchLower) ||
                          officerDept.includes(searchLower) ||
                          officerWard.includes(searchLower);
      
      const matchesDepartment = !selectedDepartment || officer.department === selectedDepartment;
      const matchesWard = !selectedWard || officer.ward === selectedWard;
      const matchesStatus = !selectedStatus || (selectedStatus === 'active' ? officer.is_active : !officer.is_active);
      
      return matchesDepartment && matchesWard && matchesSearch && matchesStatus;
    });
  }, [getVisibleOfficers, searchTerm, selectedDepartment, selectedWard, selectedStatus]);

  const handleDeleteOfficer = async (id) => {
    await deleteOfficerMutation.mutateAsync(id);
  };

  const handleStatusToggle = async (officer) => {
    await updateStatusMutation.mutateAsync({
      id: officer.id,
      status: !officer.is_active
    });
  };

  const getDepartmentName = (deptId) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const getWardName = (wardCode) => {
    const ward = mumbaiWards.find(w => w.code === wardCode);
    return ward ? `${ward.code} Ward` : wardCode;
  };

  const getRoleBadgeColor = (role, isSuperuser = false) => {
    if (isSuperuser) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case USER_ROLES.DEPARTMENT_STAFF:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role, isSuperuser = false) => {
    if (isSuperuser) return 'Super Admin';
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Department Admin';
      case USER_ROLES.DEPARTMENT_STAFF:
        return 'Officer';
      default:
        return role || 'Unknown';
    }
  };

  // Redirect if not authorized
  if (!userCanManageOfficers) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to manage officers.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load officers. {error?.message || 'Please try again later.'}
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-2 text-sm font-medium text-red-700 underline hover:text-red-600 focus:outline-none"
              >
                Retry
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Return the main content with ErrorBoundary
  return (
    <ErrorBoundary>
      <div className="w-full space-y-6">
        {/* Header with Stats */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <UserIcon className="h-8 w-8 mr-3 text-blue-600" />
                BMC Officer Management
              </h1>
              <p className="text-gray-600 mt-1">Manage BMC ward officers and department administrators across Mumbai</p>
            </div>
            
            {userIsSuperAdmin && (
              <Link
                to="/admin/register"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Register Officer
              </Link>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{officers.length}</p>
              <p className="text-sm text-gray-600">Total Officers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{officers.filter(o => o.is_active).length}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{officers.filter(o => !o.is_active).length}</p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{new Set(officers.map(o => o.department)).size}</p>
              <p className="text-sm text-gray-600">Departments</p>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search officers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Mumbai Wards</option>
            {mumbaiWards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.code} - {ward.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            BMC Officers ({filteredOfficers.length})
          </h3>
        </div>

        {filteredOfficers.length === 0 ? (
          <div className="p-8 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No BMC officers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDepartment || selectedWard || selectedStatus
                ? 'Try adjusting your search criteria'
                : 'Get started by registering a new BMC officer'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">
                    Mumbai Ward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">
                              {officer.first_name?.charAt(0)}{officer.last_name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {officer.first_name} {officer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{officer.email}</div>
                          <div className="text-xs text-gray-400">{officer.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <BuildingOffice2Icon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getDepartmentName(officer.department)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {officer.department === 'ROADS' && 'Roads & Traffic'}
                            {officer.department === 'WASTE' && 'Waste Management'}
                            {officer.department === 'WATER' && 'Water Supply'}
                            {officer.department === 'HEALTH' && 'Public Health'}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{officer.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <MapPinIcon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {officer.assigned_ward}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getWardName(officer.assigned_ward)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(officer.role, officer.is_superuser)}`}>
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        {getRoleLabel(officer.role, officer.is_superuser)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(officer)}
                        disabled={updateStatusMutation.isLoading}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          officer.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {officer.is_active ? (
                          <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => navigate(`/admin/officers/${officer.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      
                      {(userIsSuperAdmin || (userIsAdmin && officer.department === user?.department)) && (
                        <>
                          {userIsSuperAdmin && (
                            <button
                              onClick={() => navigate(`/admin/officers/${officer.id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Officer"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {userIsSuperAdmin && (
                            <button
                              onClick={() => resetPasswordMutation.mutate(officer.id)}
                              disabled={resetPasswordMutation.isLoading}
                              className="text-orange-600 hover:text-orange-900"
                              title="Reset Password"
                            >
                              <KeyIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => sendInvitationMutation.mutate(officer.id)}
                            disabled={sendInvitationMutation.isLoading}
                            className="text-green-600 hover:text-green-900"
                            title="Send Invitation"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                          
                          {userIsSuperAdmin && (
                            <button
                              onClick={() => setShowDeleteDialog(officer)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Officer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Officer</h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete <strong>{showDeleteDialog.first_name} {showDeleteDialog.last_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOfficer(showDeleteDialog.id)}
                disabled={deleteOfficerMutation.isLoading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleteOfficerMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default OfficerManagement;