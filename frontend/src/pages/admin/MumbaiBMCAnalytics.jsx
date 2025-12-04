import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { MUMBAI_WARDS, BMC_DEPARTMENTS } from '../../utils/constants';
import WardHeatmap from '../../components/analytics/WardHeatmap';
import {
  ChartBarIcon,
  MapIcon,
  ClockIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const MumbaiBMCAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('complaints');

  const periods = [
    { label: '7 days', value: '7' },
    { label: '30 days', value: '30' },
    { label: '90 days', value: '90' },
    { label: '6 months', value: '180' },
    { label: '1 year', value: '365' }
  ];

  const zones = ['All', 'South', 'Central', 'Western', 'Eastern'];
  const metrics = [
    { value: 'complaints', label: 'Total Complaints' },
    { value: 'resolution_time', label: 'Resolution Time' },
    { value: 'satisfaction', label: 'Citizen Satisfaction' },
    { value: 'department_efficiency', label: 'Department Efficiency' }
  ];

  // Fetch comprehensive BMC analytics
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['mumbai-bmc-analytics', selectedPeriod, selectedZone],
    queryFn: () => adminApi.getMumbaiBMCAnalytics({
      period: selectedPeriod,
      zone: selectedZone
    }),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading Mumbai BMC Analytics...</p>
        </div>
      </div>
    );
  }

  const data = analyticsData || {};
  const {
    summary = {},
    wardAnalytics = {},
    departmentPerformance = [],
    zoneComparison = [],
    trendsData = [],
    satisfactionData = [],
    responseTimeMetrics = {}
  } = data;

  // Color schemes for different zones
  const zoneColors = {
    'South': '#EF4444',
    'Central': '#F59E0B',
    'Western': '#10B981',
    'Eastern': '#3B82F6'
  };

  // Zone performance data for radar chart
  const zoneRadarData = zones.filter(z => z !== 'All').map(zone => ({
    zone,
    complaints: zoneComparison.find(z => z.zone === zone)?.complaints || 0,
    resolution_rate: zoneComparison.find(z => z.zone === zone)?.resolution_rate || 0,
    avg_response_time: 100 - (zoneComparison.find(z => z.zone === zone)?.avg_response_time || 0),
    satisfaction: zoneComparison.find(z => z.zone === zone)?.satisfaction || 0
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="h-8 w-8 text-blue-600" />
          Mumbai BMC Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analytics and insights for Brihanmumbai Municipal Corporation
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Filter
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  {zone === 'All' ? 'All Zones' : `${zone} Zone`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BMC Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Complaints</p>
              <p className="text-3xl font-bold">{summary.total_complaints || 0}</p>
              <p className="text-blue-100 text-xs mt-1">
                +{summary.complaints_growth || 0}% from last period
              </p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Resolution Rate</p>
              <p className="text-3xl font-bold">{summary.resolution_rate || 0}%</p>
              <p className="text-green-100 text-xs mt-1">
                Target: 85%
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold">{summary.avg_response_time || 0}h</p>
              <p className="text-orange-100 text-xs mt-1">
                Target: &lt; 24h
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Officers</p>
              <p className="text-3xl font-bold">{summary.active_officers || 0}</p>
              <p className="text-purple-100 text-xs mt-1">
                Across {MUMBAI_WARDS.length} wards
              </p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Zone Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-blue-600" />
            Zone Performance Radar
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={zoneRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="zone" />
                <PolarRadiusAxis angle={0} domain={[0, 100]} />
                <Radar
                  name="Resolution Rate"
                  dataKey="resolution_rate"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Response Time Score"
                  dataKey="avg_response_time"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.3}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-green-600" />
            Department Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPerformance}>
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
                <Bar dataKey="efficiency_score" fill="#3B82F6" name="Efficiency Score" />
                <Bar dataKey="satisfaction_score" fill="#10B981" name="Satisfaction Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trends and Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
            Complaint Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="complaints" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Citizen Satisfaction by Ward</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={satisfactionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {satisfactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(zoneColors)[index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ward Heatmap */}
      {wardAnalytics && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-red-600" />
            Ward Activity Heatmap
          </h3>
          <WardHeatmap data={wardAnalytics} />
        </div>
      )}

      {/* Response Time Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-orange-600" />
          Response Time Analysis by Category
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {responseTimeMetrics.excellent_percent || 0}%
            </div>
            <div className="text-sm text-gray-600">&lt; 6 hours (Excellent)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {responseTimeMetrics.good_percent || 0}%
            </div>
            <div className="text-sm text-gray-600">6-24 hours (Good)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {responseTimeMetrics.poor_percent || 0}%
            </div>
            <div className="text-sm text-gray-600">&gt; 24 hours (Needs Improvement)</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div 
                className="bg-green-500" 
                style={{ width: `${responseTimeMetrics.excellent_percent || 0}%` }}
              ></div>
              <div 
                className="bg-yellow-500" 
                style={{ width: `${responseTimeMetrics.good_percent || 0}%` }}
              ></div>
              <div 
                className="bg-red-500" 
                style={{ width: `${responseTimeMetrics.poor_percent || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MumbaiBMCAnalytics;