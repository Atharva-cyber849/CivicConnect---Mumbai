import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { officersApi } from '../../api/officersApi';
import { MUMBAI_WARDS, BMC_DEPARTMENTS, COMPLAINT_CATEGORIES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import WardMap from '../../components/Common/WardMap';
import {
  ClipboardDocumentListIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOffice2Icon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const BMCOfficerDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [selectedWard, setSelectedWard] = useState('');

  // Fetch officer profile and assigned wards
  const { data: officerProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['officer-profile', user?.id],
    queryFn: () => officersApi.getProfile(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch assigned complaints
  const { data: assignedComplaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['officer-complaints', selectedPeriod, selectedWard],
    queryFn: () => officersApi.getAssignedComplaints({
      period: selectedPeriod,
      ward: selectedWard
    }),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch performance metrics
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['officer-performance', selectedPeriod],
    queryFn: () => officersApi.getPerformanceMetrics(selectedPeriod),
    staleTime: 5 * 60 * 1000,
  });

  // Get officer's assigned wards
  const assignedWards = officerProfile?.assigned_wards || [];
  const assignedWardLabels = MUMBAI_WARDS.filter(w => assignedWards.includes(w.value));
  
  useEffect(() => {
    if (assignedWards.length > 0 && !selectedWard) {
      setSelectedWard(assignedWards[0]);
    }
  }, [assignedWards, selectedWard]);

  if (profileLoading || complaintsLoading || performanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading BMC Officer Dashboard...</p>
        </div>
      </div>
    );
  }

  const complaints = assignedComplaints?.results || [];
  const performance = performanceData || {};
  
  // Calculate status counts
  const statusCounts = {
    pending: complaints.filter(c => c.status === 'PENDING').length,
    in_progress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaints.filter(c => c.status === 'RESOLVED').length,
    overdue: complaints.filter(c => {
      const daysSince = Math.floor((new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24));
      return daysSince > 7 && c.status !== 'RESOLVED';
    }).length
  };

  // Department-wise data for charts
  const departmentData = BMC_DEPARTMENTS.map(dept => ({
    name: dept.label,
    complaints: complaints.filter(c => c.department === dept.value).length,
    resolved: complaints.filter(c => c.department === dept.value && c.status === 'RESOLVED').length
  })).filter(d => d.complaints > 0);

  // Daily resolution trend
  const resolutionTrend = performance.daily_resolutions || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <UserIcon className="h-7 w-7 text-white" />
          </div>
          BMC Officer Dashboard
        </h1>
        <p className="text-gray-600 text-lg ml-1">
          Welcome back, {officerProfile?.name || user?.username}. Manage your assigned ward complaints efficiently.
        </p>
      </div>

      {/* Officer Profile Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
        </div>
        <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <UserIcon className="h-6 w-6" />
              </div>
              {officerProfile?.name || user?.username}
            </h2>
            <div className="space-y-2 ml-1">
              <p className="text-blue-100 flex items-center gap-2">
                <span className="font-medium">Employee ID:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{officerProfile?.employee_id || 'BMC' + user?.id}</span>
              </p>
              <p className="text-blue-100 flex items-center gap-2">
                <BuildingOffice2Icon className="h-4 w-4" />
                <span className="font-medium">Department:</span> {officerProfile?.department || 'General'}
              </p>
              <p className="text-blue-100 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                <span className="font-medium">Assigned Wards:</span> {assignedWardLabels.map(w => w.value).join(', ') || 'None assigned'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-2">{performance.completion_rate || 0}%</div>
            <div className="text-base text-blue-100">Completion Rate</div>
            <div className="mt-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm">Active Officer</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold mb-1">{complaints.length}</div>
            <div className="text-sm text-blue-100">Total Assigned</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold text-yellow-200 mb-1">{statusCounts.pending}</div>
            <div className="text-sm text-blue-100">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold text-green-200 mb-1">{statusCounts.resolved}</div>
            <div className="text-sm text-blue-100">Resolved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all">
            <div className="text-3xl font-bold text-red-200 mb-1">{statusCounts.overdue}</div>
            <div className="text-sm text-blue-100">Overdue</div>
          </div>
        </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-blue-400"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Ward
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Assigned Wards</option>
              {assignedWardLabels.map(ward => (
                <option key={ward.value} value={ward.value}>
                  {ward.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button 
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
            Department-wise Complaints
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="complaints" fill="#3B82F6" name="Total" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-green-600" />
            Daily Resolution Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Complaints */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
          High Priority & Overdue Complaints
        </h3>
        
        {complaints.filter(c => 
          (c.priority === 'HIGH' || c.priority === 'URGENT') || 
          (Math.floor((new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24)) > 7 && c.status !== 'RESOLVED')
        ).length > 0 ? (
          <div className="space-y-3">
            {complaints
              .filter(c => 
                (c.priority === 'HIGH' || c.priority === 'URGENT') || 
                (Math.floor((new Date() - new Date(c.created_at)) / (1000 * 60 * 60 * 24)) > 7 && c.status !== 'RESOLVED')
              )
              .slice(0, 10)
              .map((complaint) => {
                const daysSince = Math.floor((new Date() - new Date(complaint.created_at)) / (1000 * 60 * 60 * 24));
                const isOverdue = daysSince > 7 && complaint.status !== 'RESOLVED';
                
                return (
                  <div key={complaint.id} className={`border rounded-lg p-4 ${
                    isOverdue ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          {complaint.title}
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {daysSince} days old
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {complaint.category} | Ward: {complaint.ward} | Priority: {complaint.priority}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {complaint.status}
                        </span>
                        <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-green-300" />
            <p>No high priority or overdue complaints</p>
          </div>
        )}
      </div>

      {/* Ward Map */}
      {selectedWard && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            Complaints Map - Ward {selectedWard}
          </h3>
          <div className="h-96">
            <WardMap 
              selectedWardCode={selectedWard}
              complaints={complaints.filter(c => !selectedWard || c.ward === selectedWard)}
              height="100%"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BMCOfficerDashboard;