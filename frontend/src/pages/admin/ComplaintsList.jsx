import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin, isAdmin, isOfficer } from '../../utils/roleBasedAccess';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '../../api/adminApi';

const ComplaintsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Role-based access control
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsAdmin = isAdmin(user);
  const userIsOfficer = isOfficer(user);
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    ward: '',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });

  // Apply role-based filters automatically
  const roleBasedFilters = useMemo(() => {
    const baseFilters = { ...filters };
    
    // Officers can only see complaints from their ward
    if (userIsOfficer && user?.assigned_ward) {
      baseFilters.ward = user.assigned_ward;
    }
    
    // Admins can only see complaints from their department
    if (userIsAdmin && user?.department) {
      baseFilters.department = user.department;
    }
    
    return baseFilters;
  }, [filters, userIsOfficer, userIsAdmin, user?.assigned_ward, user?.department]);

  // Fetch complaints with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-complaints', roleBasedFilters, pagination],
    queryFn: () => adminApi.getComplaints({
      ...roleBasedFilters,
      page: pagination.page,
      limit: pagination.limit
    }),
    keepPreviousData: true,
    enabled: userIsSuperAdmin || userIsAdmin || userIsOfficer
  });

  // Update complaint status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateComplaintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-complaints']);
      toast.success('Complaint status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const handleStatusUpdate = (complaintId, newStatus) => {
    updateStatusMutation.mutate({ id: complaintId, status: newStatus });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'RESOLVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'bg-red-100 text-red-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Check access
  if (!userIsSuperAdmin && !userIsAdmin && !userIsOfficer) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to view complaints.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading complaints: {error.message}</p>
      </div>
    );
  }

  const complaints = data?.results || [];
  const totalComplaints = data?.count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaints Management</h1>
        <p className="text-gray-600">Manage and track all citizen complaints</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className={`grid gap-4 ${userIsSuperAdmin ? 'grid-cols-1 md:grid-cols-6' : 'grid-cols-1 md:grid-cols-5'}`}>
          {/* Search */}
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="ROAD_MAINTENANCE">Road Maintenance</option>
            <option value="WATER_SUPPLY">Water Supply</option>
            <option value="WASTE_MANAGEMENT">Waste Management</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="DRAINAGE">Drainage</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Ward Filter - Only for Super Admin */}
          {userIsSuperAdmin && (
            <select
              value={filters.ward}
              onChange={(e) => setFilters({...filters, ward: e.target.value})}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Wards</option>
              <option value="A">A Ward</option>
              <option value="B">B Ward</option>
              <option value="C">C Ward</option>
              {/* Add more wards as needed */}
            </select>
          )}

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ status: '', category: '', priority: '', ward: '', search: '' })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Citizen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {complaint.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {complaint.category}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {complaint.citizen_name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {complaint.citizen_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                        className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {complaint.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Accept"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(complaint.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {complaints.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No complaints found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalComplaints > pagination.limit && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page * pagination.limit >= totalComplaints}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalComplaints)} of {totalComplaints} results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page * pagination.limit >= totalComplaints}
                    onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintsList;