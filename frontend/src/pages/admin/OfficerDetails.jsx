import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  KeyIcon,
  EnvelopeOpenIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { officersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../config/constants';
import { isSuperAdmin, isAdmin, isOfficer } from '../../utils/roleBasedAccess';
import wardsData from '../../config/wardsData.json';

const OfficerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Role-based access control
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsAdmin = isAdmin(user);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Extract wards from GeoJSON
  const mumbaiWards = wardsData.features.map(feature => ({
    code: feature.properties.ward_code,
    name: feature.properties.name,
    fullName: feature.properties.full_name
  })).sort((a, b) => a.code.localeCompare(b.code));

  // Fetch officer details
  const { data: officer, isLoading, error } = useQuery({
    queryKey: ['officer', id],
    queryFn: () => officersApi.getById(id),
    enabled: !!id,
    retry: 1
  });

  // Mock officer data for development
  const mockOfficer = {
    id: id || 65,
    first_name: 'Ravi',
    last_name: 'Kumar',
    email: 'officer.bandra@test.bmc.gov.in',
    username: 'ravi_kumar',
    phone: '+91 9876543210',
    role: 'OFFICER',
    department: 'ROADS',
    assigned_ward: 'H/W',
    designation: 'Ward Officer',
    is_active: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-11-12T15:45:00Z',
    complaints_handled: 45,
    average_resolution_time: 3.2
  };

  const officerData = officer || mockOfficer;

  // Delete officer mutation
  const deleteOfficerMutation = useMutation({
    mutationFn: () => officersApi.delete(id),
    onSuccess: () => {
      toast.success('Officer deleted successfully');
      navigate('/admin/officers');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete officer');
    }
  });

  // Update officer status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status) => officersApi.toggleStatus(id, status),
    onSuccess: () => {
      toast.success('Officer status updated successfully');
      queryClient.invalidateQueries(['officer', id]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: () => officersApi.resetPassword(id),
    onSuccess: (data) => {
      toast.success(`Password reset. Temporary password: ${data.temporary_password}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: () => officersApi.sendInvitation(id),
    onSuccess: () => {
      toast.success('Invitation email sent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  });

  const getDepartmentName = (deptId) => {
    const dept = DEPARTMENTS.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const getWardName = (wardCode) => {
    const ward = mumbaiWards.find(w => w.code === wardCode);
    return ward ? `${ward.code} - ${ward.name}` : wardCode;
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OFFICER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Officer Details</h1>
        </div>
        <div className="bg-white shadow rounded-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Error Loading Officer</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.response?.data?.message || 'Failed to load officer details'}
          </p>
          <button
            onClick={() => navigate('/admin/officers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Officers
          </button>
        </div>
      </div>
    );
  }

  // Check if user can access this officer's details
  const canAccessOfficer = useMemo(() => {
    if (!officerData) return false;
    if (userIsSuperAdmin) return true; // Super admin sees all
    if (userIsAdmin && officerData.department === user?.department) return true; // Admin sees own dept
    if (userIsOfficer) return false; // Officers cannot view other officers
    return false;
  }, [officerData, userIsSuperAdmin, userIsAdmin, userIsOfficer, user?.department]);

  // Access denial screen
  if (!canAccessOfficer) {
    return (
      <div className="min-h-96 flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to view this officer's details.
          </p>
          <button
            onClick={() => navigate('/admin/officers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Officers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-blue-400">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1">
            <button
              onClick={() => navigate('/admin/officers')}
              className="text-blue-600 hover:text-blue-800 mr-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {officerData.first_name} {officerData.last_name}
              </h1>
              <p className="text-gray-600 mt-2 text-base">@{officerData.username}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getRoleBadgeColor(officerData.role)}`}>
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            {officerData.role}
          </span>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
            officerData.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {officerData.is_active ? (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Active
              </>
            ) : (
              <>
                <XCircleIcon className="h-5 w-5 mr-2" />
                Inactive
              </>
            )}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            Joined: {new Date(officerData.created_at).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Personal Information */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <a
                  href={`mailto:${officerData.email}`}
                  className="text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {officerData.email}
                </a>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <a
                  href={`tel:${officerData.phone}`}
                  className="text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {officerData.phone || 'N/A'}
                </a>
              </div>
            </div>
          </div>

          {/* Department Information */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BuildingOffice2Icon className="h-5 w-5 text-purple-600 mr-2" />
              Department
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Department Name</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {getDepartmentName(officerData.department)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {officerData.department === 'ROADS' && 'Roads & Traffic Management'}
                  {officerData.department === 'WASTE' && 'Waste Management & Sanitation'}
                  {officerData.department === 'WATER' && 'Water Supply & Drainage'}
                  {officerData.department === 'HEALTH' && 'Public Health & Hygiene'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Designation</label>
                <p className="text-gray-900 mt-1 font-medium">{officerData.designation}</p>
              </div>
            </div>
          </div>

          {/* Ward Information */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
              Assigned Ward
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Ward Code</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                    {officerData.assigned_ward}
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium">
                  {getWardName(officerData.assigned_ward)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Ward Type</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {officerData.assigned_ward?.includes('N') || officerData.assigned_ward?.includes('S') ? 'North/South' : 'East/West'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 mb-1">Region</p>
                  <p className="text-sm text-gray-900 font-medium">
                    {officerData.assigned_ward?.includes('H') || officerData.assigned_ward?.includes('K') ? 'Western' : 'Central/Eastern'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Performance & Actions */}
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              Performance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Complaints Handled</p>
                <p className="text-2xl font-bold text-blue-600">{officerData.complaints_handled || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Avg. Resolution Time</p>
                <p className="text-2xl font-bold text-green-600">{officerData.average_resolution_time || 0} days</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 text-gray-600 mr-2" />
              Account Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900 font-medium">
                  {new Date(officerData.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900 font-medium">
                  {new Date(officerData.updated_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${officerData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {officerData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {userIsSuperAdmin && (
            <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <PencilIcon className="h-5 w-5 text-orange-600 mr-2" />
                Actions
              </h3>
              <div className="space-y-3">
                {/* Status Toggle */}
                <button
                  onClick={() => updateStatusMutation.mutate(!officerData.is_active)}
                  disabled={updateStatusMutation.isLoading}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    officerData.is_active
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  } disabled:opacity-50`}
                >
                  {updateStatusMutation.isLoading ? 'Updating...' : (officerData.is_active ? 'Deactivate Officer' : 'Activate Officer')}
                </button>

                {/* Reset Password */}
                <button
                  onClick={() => resetPasswordMutation.mutate()}
                  disabled={resetPasswordMutation.isLoading}
                  className="w-full px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  {resetPasswordMutation.isLoading ? 'Sending...' : 'Reset Password'}
                </button>

                {/* Send Invitation */}
                <button
                  onClick={() => sendInvitationMutation.mutate()}
                  disabled={sendInvitationMutation.isLoading}
                  className="w-full px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <EnvelopeOpenIcon className="h-4 w-4 mr-2" />
                  {sendInvitationMutation.isLoading ? 'Sending...' : 'Send Invitation'}
                </button>

                {/* Edit Officer */}
                <button
                  onClick={() => navigate(`/admin/officers/${id}/edit`)}
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Officer
                </button>

                {/* Delete Officer */}
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Officer
                </button>
              </div>
            </div>
          )}
        </div>
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
              Are you sure you want to delete <strong>{officerData.first_name} {officerData.last_name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOfficerMutation.mutate()}
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
  );
};

export default OfficerDetails;
