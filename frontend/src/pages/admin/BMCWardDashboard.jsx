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
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldExclamationIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="mt-2 text-gray-600">
            The BMC Ward Dashboard provides city-wide ward access and is only available to Super Admins.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Department Admins can view their department data from the main dashboard.
          </p>
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading BMC Ward Data...</p>
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
  const deptData = BMC_DEPARTMENTS.map(dept => ({
    name: dept.label,
    complaints: complaints.filter(c => c.department === dept.value).length,
    avgResponseTime: Math.floor(Math.random() * 48) + 12 // Mock data
  }));

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
            BMC Ward Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of Mumbai Municipal Corporation ward operations
          </p>
        </div>
        
        {/* Quick Stats for Selected Ward */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{wardData?.complaints?.length || 0}</p>
            <p className="text-sm text-gray-600">Total Complaints</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{wardData?.analytics?.resolved || 0}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{wardData?.complaints?.filter(c => c.status === 'PENDING').length || 0}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{wardData?.officers?.length || 0}</p>
            <p className="text-sm text-gray-600">Officers</p>
          </div>
        </div>
      </div>

      {/* Zone and Ward Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone} Zone</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Ward
          </label>
          <select
            value={selectedWard}
            onChange={(e) => handleWardChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getWardsByZone(selectedZone).map(ward => (
              <option key={ward.value} value={ward.value}>
                {ward.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Current Ward Info */}
      {currentWard && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentWard.label}</h2>
              <p className="text-blue-100 mb-4">
                Zone: {currentWard.zone} | BMC Ward Code: {currentWard.value}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{complaints.length}</p>
                  <p className="text-sm text-blue-100">Total Complaints</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{officers.length}</p>
                  <p className="text-sm text-blue-100">Assigned Officers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{centers.length}</p>
                  <p className="text-sm text-blue-100">Service Centers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                  </p>
                  <p className="text-sm text-blue-100">Resolution Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            Complaint Status Distribution
          </h3>
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
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Department-wise Complaints
          </h3>
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
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
            BMC Service Centers in {currentWard?.label}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centers.map((center, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{center.name}</h4>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-blue-600" />
          Ward Map & Complaint Locations
        </h3>
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