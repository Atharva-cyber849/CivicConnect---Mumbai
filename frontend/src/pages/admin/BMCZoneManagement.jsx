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
import { Map, Building2, Users, BarChart3, Clock, AlertTriangle, Shield, TrendingUp, CheckCircle, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BMCZoneManagement = () => {
  const { user } = useAuth();
  const userIsSuperAdmin = isSuperAdmin(user);
  
  const [selectedZone, setSelectedZone] = useState('South');
  const [timeRange, setTimeRange] = useState('30');

  // Access control - Only Super Admin can access zone management
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
              Zone Management is only available to Super Admins. 
              This feature provides city-wide zone overview and control.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Contact your Super Admin if you need access to zone-level data.
            </p>
          </div>
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
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading Zone Data...</p>
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
    
    // Calculate average response time from resolved complaints
    const resolvedWithTime = wardComplaints.filter(c => c.status === 'RESOLVED' && c.resolved_at && c.created_at);
    const avgResponseTime = resolvedWithTime.length > 0 
      ? Math.round(resolvedWithTime.reduce((sum, c) => {
          const responseTime = (new Date(c.resolved_at) - new Date(c.created_at)) / (1000 * 60 * 60); // hours
          return sum + responseTime;
        }, 0) / resolvedWithTime.length)
      : 0;
    
    return {
      name: ward.label,
      total: wardComplaints.length,
      resolved,
      resolutionRate: Math.round(resolutionRate),
      avgResponseTime
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="zone-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#zone-grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Map className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">BMC Zone Management</h1>
              <p className="text-purple-100 text-lg mt-1">
                Administrative overview of Mumbai Municipal Corporation zones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Selector */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Administrative Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              {zones.map(zone => (
                <option key={zone.name} value={zone.name}>
                  {zone.name} Zone - {zone.wards.length} Wards
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Zone Overview */}
      {currentZone && (
        <div 
          className="text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          style={{ backgroundColor: currentZone.color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentZone.name} Zone</h2>
                <p className="text-white/90 text-lg">{currentZone.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <MapPin className="h-6 w-6" />
                  <p className="text-3xl font-bold">{zoneWards.length}</p>
                </div>
                <p className="text-sm opacity-90">Total Wards</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-6 w-6" />
                  <p className="text-3xl font-bold">{complaints.length}</p>
                </div>
                <p className="text-sm opacity-90">Total Complaints</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6" />
                  <p className="text-3xl font-bold">{officers.length}</p>
                </div>
                <p className="text-sm opacity-90">Total Officers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-6 w-6" />
                  <p className="text-3xl font-bold">
                    {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                  </p>
                </div>
                <p className="text-sm opacity-90">Zone Resolution Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Ward Performance in {selectedZone} Zone
              </h3>
            </div>
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Avg Response Time</span>
                <span className="font-bold text-lg text-blue-600">{analytics.avgResponseTime || 24}h</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-700">High Priority</span>
                <span className="font-bold text-lg text-red-600">
                  {complaints.filter(c => c.priority === 'HIGH' || c.priority === 'URGENT').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Overdue Cases</span>
                <span className="font-bold text-lg text-orange-600">
                  {analytics.overdueCount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Citizen Satisfaction</span>
                <span className="font-bold text-lg text-green-600">
                  {analytics.satisfactionRate || 85}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ward Details Grid */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Ward Details in {selectedZone} Zone
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zoneWards.map((ward) => {
            const wardStats = wardPerformance.find(w => w.name === ward.label);
            return (
              <div key={ward.value} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{ward.label}</h4>
                  <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold">
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