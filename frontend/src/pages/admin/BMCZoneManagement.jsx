import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../utils/roleBasedAccess';
import { adminApi } from '../../api/adminApi';
import { MUMBAI_WARDS, BMC_DEPARTMENTS } from '../../utils/constants';
import {
  MapIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BMCZoneManagement = () => {
  const { user } = useAuth();
  const userIsSuperAdmin = isSuperAdmin(user);
  
  const [selectedZone, setSelectedZone] = useState('South');
  const [timeRange, setTimeRange] = useState('30');

  // Access control - Only Super Admin can access zone management
  if (!userIsSuperAdmin) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldExclamationIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="mt-2 text-gray-600">
            Zone Management is only available to Super Admins. 
            This feature provides city-wide zone overview and control.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Contact your Super Admin if you need access to zone-level data.
          </p>
        </div>
      </div>
    );
  }

  // BMC Administrative Zones
  const zones = [
    { 
      name: 'South', 
      wards: ['A', 'B', 'C', 'D', 'E'],
      color: '#EF4444',
      description: 'Historic Mumbai - Colaba to Byculla'
    },
    { 
      name: 'Central', 
      wards: ['F/N', 'F/S', 'G/N', 'G/S'],
      color: '#F59E0B', 
      description: 'Central Business District - Matunga to Parel'
    },
    { 
      name: 'Western', 
      wards: ['H/E', 'H/W', 'K/E', 'K/W', 'P/N', 'P/S', 'R/N', 'R/C', 'R/S'],
      color: '#10B981',
      description: 'Western Suburbs - Bandra to Dahisar'
    },
    { 
      name: 'Eastern', 
      wards: ['L', 'M/E', 'M/W', 'N', 'S', 'T'],
      color: '#3B82F6',
      description: 'Eastern Suburbs - Kurla to Mulund'
    }
  ];

  // Get zone data
  const getZoneWards = (zoneName) => {
    const zone = zones.find(z => z.name === zoneName);
    return MUMBAI_WARDS.filter(ward => zone?.wards.includes(ward.value));
  };

  // Fetch zone analytics
  const { data: zoneData, isLoading } = useQuery({
    queryKey: ['bmc-zone-data', selectedZone, timeRange],
    queryFn: async () => {
      const zoneWards = getZoneWards(selectedZone);
      const wardCodes = zoneWards.map(w => w.value);
      
      const [complaints, analytics, officers] = await Promise.all([
        adminApi.getComplaintsByZone(selectedZone, timeRange),
        adminApi.getZoneAnalytics(selectedZone, timeRange),
        adminApi.getOfficersByZone(selectedZone)
      ]);
      
      return { complaints, analytics, officers, wards: zoneWards };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading Zone Data...</p>
        </div>
      </div>
    );
  }

  const currentZone = zones.find(z => z.name === selectedZone);
  const zoneWards = zoneData?.wards || [];
  const complaints = zoneData?.complaints || [];
  const analytics = zoneData?.analytics || {};
  const officers = zoneData?.officers || [];

  // Ward performance data
  const wardPerformance = zoneWards.map(ward => {
    const wardComplaints = complaints.filter(c => c.ward === ward.value);
    const resolved = wardComplaints.filter(c => c.status === 'RESOLVED').length;
    const resolutionRate = wardComplaints.length > 0 ? (resolved / wardComplaints.length * 100) : 0;
    
    return {
      name: ward.label,
      total: wardComplaints.length,
      resolved,
      resolutionRate: Math.round(resolutionRate),
      avgResponseTime: Math.floor(Math.random() * 48) + 12 // Mock data
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MapIcon className="h-8 w-8 text-blue-600" />
          BMC Zone Management
        </h1>
        <p className="text-gray-600 mt-1">
          Administrative overview of Mumbai Municipal Corporation zones
        </p>
      </div>

      {/* Zone Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Administrative Zone
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {zones.map(zone => (
              <option key={zone.name} value={zone.name}>
                {zone.name} Zone - {zone.wards.length} Wards
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
          </select>
        </div>
      </div>

      {/* Zone Overview */}
      {currentZone && (
        <div 
          className="text-white p-6 rounded-lg"
          style={{ backgroundColor: currentZone.color }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentZone.name} Zone</h2>
              <p className="text-white/90 mb-4">{currentZone.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">{zoneWards.length}</p>
                  <p className="text-sm opacity-90">Total Wards</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{complaints.length}</p>
                  <p className="text-sm opacity-90">Total Complaints</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{officers.length}</p>
                  <p className="text-sm opacity-90">Total Officers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                  </p>
                  <p className="text-sm opacity-90">Zone Resolution Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              Ward Performance in {selectedZone} Zone
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Complaints" />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-orange-600" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="font-semibold">{analytics.avgResponseTime || 24}h</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">High Priority</span>
                <span className="font-semibold text-red-600">
                  {complaints.filter(c => c.priority === 'HIGH' || c.priority === 'URGENT').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Overdue Cases</span>
                <span className="font-semibold text-orange-600">
                  {analytics.overdueCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Citizen Satisfaction</span>
                <span className="font-semibold text-green-600">
                  {analytics.satisfactionRate || 85}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Details Grid */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
          Ward Details in {selectedZone} Zone
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zoneWards.map((ward) => {
            const wardStats = wardPerformance.find(w => w.name === ward.label);
            return (
              <div key={ward.value} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{ward.label}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Ward {ward.value}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complaints:</span>
                    <span className="font-medium">{wardStats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolved:</span>
                    <span className="font-medium text-green-600">{wardStats?.resolved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolution Rate:</span>
                    <span className="font-medium">{wardStats?.resolutionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response:</span>
                    <span className="font-medium">{wardStats?.avgResponseTime || 0}h</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${wardStats?.resolutionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BMCZoneManagement;