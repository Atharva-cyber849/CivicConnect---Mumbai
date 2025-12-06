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
import { Users, UserPlus, Search, Filter, Eye, Edit, Trash2, Key, Mail, Shield, Building2, MapPin, AlertTriangle, CheckCircle as CheckCircleIcon2, XCircle, TrendingUp } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
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
        const data = await adminApi.getOfficers();
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
    mutationFn: (id) => adminApi.deleteOfficer(id),
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
    mutationFn: ({ id, status }) => adminApi.updateOfficerStatus(id, { is_active: status }),
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
    mutationFn: (id) => adminApi.resetOfficerPassword(id),
    onSuccess: () => {
      toast.success('Password reset email sent to officer');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: (id) => adminApi.sendOfficerInvitation(id),
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
      <div className="min-h-96 flex items-center justify-center p-8">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to manage officers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-600 font-medium">Loading officers...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load officers</h3>
            <p className="text-sm text-gray-600 mb-4">
              {error?.message || 'Please try again later.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Retry
            </button>
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
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="officer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#officer-grid)" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="h-9 w-9" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">BMC Officer Management</h1>
                  <p className="text-purple-100 text-lg">Manage BMC ward officers and department administrators across Mumbai</p>
                </div>
              </div>
              
              {userIsSuperAdmin && (
                <Link
                  to="/admin/register"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register Officer</span>
                </Link>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Total Officers</p>
                    <p className="text-3xl font-bold">{officers.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7" />
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Active</p>
                    <p className="text-3xl font-bold text-green-300">{officers.filter(o => o.is_active).length}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon2 className="h-7 w-7 text-green-300" />
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Inactive</p>
                    <p className="text-3xl font-bold text-red-300">{officers.filter(o => !o.is_active).length}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-red-300" />
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Departments</p>
                    <p className="text-3xl font-bold text-blue-300">{new Set(officers.map(o => o.department)).size}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-blue-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Filter className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Filters & Search</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search officers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
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
            className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
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
            className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                BMC Officers ({filteredOfficers.length})
              </h3>
            </div>
          </div>
        </div>

        {filteredOfficers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No BMC officers found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedDepartment || selectedWard || selectedStatus
                ? 'Try adjusting your search criteria'
                : 'Get started by registering a new BMC officer'}
            </p>
            {userIsSuperAdmin && (
              <Link
                to="/admin/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <UserPlus className="h-5 w-5" />
                <span>Register Officer</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Officer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-48">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider min-w-40">
                    Mumbai Ward
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                            <span className="text-base font-bold text-white">
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
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">
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
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-8 w-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {officer.assigned_ward}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getWardName(officer.assigned_ward)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${getRoleBadgeColor(officer.role, officer.is_superuser)}`}>
                        <Shield className="h-4 w-4" />
                        {getRoleLabel(officer.role, officer.is_superuser)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(officer)}
                        disabled={updateStatusMutation.isLoading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                          officer.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 border-2 border-red-300'
                        }`}
                      >
                        {officer.is_active ? (
                          <>
                            <CheckCircleIcon2 className="h-4 w-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/officers/${officer.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        
                        {(userIsSuperAdmin || (userIsAdmin && officer.department === user?.department)) && (
                          <>
                            {userIsSuperAdmin && (
                              <button
                                onClick={() => navigate(`/admin/officers/${officer.id}/edit`)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Officer"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            )}
                            
                            {userIsSuperAdmin && (
                              <button
                                onClick={() => resetPasswordMutation.mutate(officer.id)}
                                disabled={resetPasswordMutation.isLoading}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Reset Password"
                              >
                                <Key className="h-5 w-5" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => sendInvitationMutation.mutate(officer.id)}
                              disabled={sendInvitationMutation.isLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Send Invitation"
                            >
                              <Mail className="h-5 w-5" />
                            </button>
                            
                            {userIsSuperAdmin && (
                              <button
                                onClick={() => setShowDeleteDialog(officer)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Officer"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Officer</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong className="text-gray-900">{showDeleteDialog.first_name} {showDeleteDialog.last_name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteDialog(null)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteOfficer(showDeleteDialog.id)}
                  disabled={deleteOfficerMutation.isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {deleteOfficerMutation.isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default OfficerManagement;