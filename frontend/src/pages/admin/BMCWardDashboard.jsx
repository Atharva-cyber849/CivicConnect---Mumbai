import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../utils/roleBasedAccess';
import { adminApi } from '../../api/adminApi';
import { MUMBAI_WARDS, BMC_DEPARTMENTS } from '../../utils/constants';
import WardMap from '../../components/Common/WardMap';
import {
  BuildingOffice2Icon,
  MapPinIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { Building2, MapPin, BarChart3, Clock, Users, AlertTriangle, Shield, TrendingUp, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const BMCWardDashboard = () => {
  const { user } = useAuth();
  const userIsSuperAdmin = isSuperAdmin(user);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWard, setSelectedWard] = useState(searchParams.get('ward') || 'A');
  const [selectedZone, setSelectedZone] = useState(searchParams.get('zone') || 'All');
  const [timeRange, setTimeRange] = useState('30');

  // Access control - Only Super Admin can access city-wide ward dashboard
  if (!userIsSuperAdmin) {
    return (
      <div className="min-h-96 flex items-center justify-center p-8">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
            <p className="text-gray-600 mb-2">
              The BMC Ward Dashboard provides city-wide ward access and is only available to Super Admins.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Department Admins can view their department data from the main dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // BMC Zones
  const zones = ['All', 'South', 'Central', 'Western', 'Eastern'];
  
  // Get wards by zone
  const getWardsByZone = (zone) => {
    if (zone === 'All') return MUMBAI_WARDS;
    return MUMBAI_WARDS.filter(ward => ward.zone === zone);
  };

  // Fetch ward-specific data
  const { data: wardData, isLoading } = useQuery({
    queryKey: ['bmc-ward-dashboard', selectedWard, timeRange],
    queryFn: async () => {
      const [complaints, analytics, officers] = await Promise.all([
        adminApi.getComplaintsByWard(selectedWard, timeRange),
        adminApi.getWardAnalytics(selectedWard, timeRange),
        adminApi.getOfficersByWard(selectedWard)
      ]);
      return { complaints, analytics, officers };
    },
    staleTime: 5 * 60 * 1000,
  });

  // BMC Service Centers data (mock for demonstration)
  const serviceCenters = {
    'A': [{ name: 'Colaba BMC Office', address: 'Shahid Bhagat Singh Road', services: ['Water', 'Roads', 'Health'] }],
    'B': [{ name: 'Dockyard Road BMC Office', address: 'P. D\'Mello Road', services: ['Waste', 'Parks', 'Building'] }],
    // Add more as needed
  };

  const handleWardChange = (ward) => {
    setSelectedWard(ward);
    setSearchParams({ ward, zone: selectedZone });
  };

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    setSearchParams({ ward: selectedWard, zone });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading BMC Ward Data...</p>
        </div>
      </div>
    );
  }

  const currentWard = MUMBAI_WARDS.find(w => w.value === selectedWard);
  const complaints = wardData?.complaints || [];
  const analytics = wardData?.analytics || {};
  const officers = wardData?.officers || [];
  const centers = serviceCenters[selectedWard] || [];

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pending', value: analytics.pending || 0, color: '#F59E0B' },
    { name: 'In Progress', value: analytics.in_progress || 0, color: '#3B82F6' },
    { name: 'Resolved', value: analytics.resolved || 0, color: '#10B981' },
    { name: 'Rejected', value: analytics.rejected || 0, color: '#EF4444' }
  ];

  // Department-wise data
  const deptData = BMC_DEPARTMENTS.map(dept => {
    const deptComplaints = complaints.filter(c => c.department === dept.value);
    return {
      name: dept.label,
      complaints: deptComplaints.length,
      resolved: deptComplaints.filter(c => c.status === 'RESOLVED').length
    };
  }).filter(d => d.complaints > 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ward-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ward-grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">BMC Ward Dashboard</h1>
              <p className="text-blue-100 text-lg mt-1">
                Comprehensive view of Mumbai Municipal Corporation ward operations
              </p>
            </div>
          </div>
          
          {/* Quick Stats for Selected Ward */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Complaints</p>
                  <p className="text-3xl font-bold">{wardData?.complaints?.length || 0}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-7 w-7" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-300">{wardData?.analytics?.resolved || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-300" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-300">{wardData?.complaints?.filter(c => c.status === 'PENDING').length || 0}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-7 w-7 text-yellow-300" />
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Officers</p>
                  <p className="text-3xl font-bold text-purple-300">{wardData?.officers?.length || 0}</p>
                </div>
                <div className="h-12 w-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zone and Ward Selector */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Select Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone} Zone</option>
              ))}
            </select>
          </div>
          
          <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Ward
          </label>
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
          >
            {getWardsByZone(selectedZone).map(ward => (
              <option key={ward.value} value={ward.value}>
                {ward.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        </div>
      </div>

      {/* Current Ward Info */}
      {currentWard && (
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentWard.label}</h2>
                <p className="text-green-100 text-lg">
                  Zone: {currentWard.zone} | BMC Ward Code: {currentWard.value}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-6 w-6" />
                  <p className="text-3xl font-bold">{complaints.length}</p>
                </div>
                <p className="text-sm text-green-100">Total Complaints</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6" />
                  <p className="text-3xl font-bold">{officers.length}</p>
                </div>
                <p className="text-sm text-green-100">Assigned Officers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-6 w-6" />
                  <p className="text-3xl font-bold">{centers.length}</p>
                </div>
                <p className="text-sm text-green-100">Service Centers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-6 w-6" />
                  <p className="text-3xl font-bold">
                    {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                  </p>
                </div>
                <p className="text-sm text-green-100">Resolution Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Complaint Status Distribution
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Department-wise Complaints
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
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
                <Bar dataKey="complaints" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BMC Service Centers */}
      {centers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              BMC Service Centers in {currentWard?.label}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centers.map((center, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                <h4 className="font-bold text-gray-900 mb-2">{center.name}</h4>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {center.address}
                </p>
                <div className="flex flex-wrap gap-1">
                  {center.services.map((service, serviceIndex) => (
                    <span 
                      key={serviceIndex}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ward Map */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Ward Map & Complaint Locations</h3>
        </div>
        <div className="h-96">
          <WardMap 
            selectedWardCode={selectedWard}
            complaints={complaints}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default BMCWardDashboard;