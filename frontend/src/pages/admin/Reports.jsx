import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ClockIcon,
  TrophyIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  UsersIcon,
  DocumentChartBarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../config/constants';

const Reports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30'); // Last 30 days
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange, selectedDepartment, selectedWard],
    queryFn: () => adminApi.getAnalytics({ 
      days: dateRange,
      department: selectedDepartment,
      ward: selectedWard 
    }),
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Mock analytics data for development
  const mockAnalytics = {
    summary: {
      total_complaints: 1247,
      resolved_rate: 92.8,
      avg_resolution_time: 18.5,
      citizen_satisfaction: 4.2,
      officer_performance: 87.5
    },
    departmentPerformance: [
      { department: 'Roads', complaints: 156, resolved: 144, avgTime: 15.2, satisfaction: 89 },
      { department: 'Water Supply', complaints: 98, resolved: 94, avgTime: 12.8, satisfaction: 94 },
      { department: 'Waste Management', complaints: 145, resolved: 138, avgTime: 18.5, satisfaction: 87 },
      { department: 'Electricity', complaints: 67, resolved: 62, avgTime: 22.1, satisfaction: 82 },
      { department: 'Building', complaints: 43, resolved: 38, avgTime: 35.6, satisfaction: 79 },
      { department: 'Health', complaints: 32, resolved: 31, avgTime: 8.9, satisfaction: 96 }
    ],
    wardWiseData: [
      { ward: 'A', complaints: 45, resolved: 41, resolutionRate: 91.1 },
      { ward: 'B', complaints: 38, resolved: 36, resolutionRate: 94.7 },
      { ward: 'C', complaints: 52, resolved: 47, resolutionRate: 90.4 },
      { ward: 'D', complaints: 41, resolved: 39, resolutionRate: 95.1 },
      { ward: 'E', complaints: 36, resolved: 33, resolutionRate: 91.7 },
      { ward: 'F/N', complaints: 48, resolved: 44, resolutionRate: 91.7 },
      { ward: 'G/N', complaints: 55, resolved: 52, resolutionRate: 94.5 },
      { ward: 'H/E', complaints: 62, resolved: 58, resolutionRate: 93.5 },
      { ward: 'H/W', complaints: 71, resolved: 65, resolutionRate: 91.5 },
      { ward: 'K/E', complaints: 89, resolved: 83, resolutionRate: 93.3 }
    ],
    categoryTrends: [
      { category: 'Roads', jan: 45, feb: 52, mar: 48, apr: 56, may: 61, jun: 58 },
      { category: 'Water', jan: 32, feb: 28, mar: 35, apr: 31, may: 29, jun: 33 },
      { category: 'Waste', jan: 38, feb: 42, mar: 41, apr: 39, may: 45, jun: 43 },
      { category: 'Electricity', jan: 22, feb: 19, mar: 24, apr: 21, may: 23, jun: 25 }
    ],
    resolutionTrends: [
      { month: 'Jan', avgTime: 16.2, complaints: 137 },
      { month: 'Feb', avgTime: 17.8, complaints: 141 },
      { month: 'Mar', avgTime: 15.4, complaints: 148 },
      { month: 'Apr', avgTime: 18.9, complaints: 147 },
      { month: 'May', avgTime: 19.2, complaints: 158 },
      { month: 'Jun', avgTime: 16.7, complaints: 159 }
    ],
    topOfficers: [
      { name: 'Officer Patil', department: 'Roads', resolved: 45, satisfaction: 4.8, avgTime: 12.3 },
      { name: 'Officer Singh', department: 'Water', resolved: 38, satisfaction: 4.6, avgTime: 14.1 },
      { name: 'Officer Kumar', department: 'Waste', resolved: 42, satisfaction: 4.4, avgTime: 15.8 },
      { name: 'Officer Sharma', department: 'Electricity', resolved: 29, satisfaction: 4.3, avgTime: 18.2 },
      { name: 'Officer Joshi', department: 'Building', resolved: 25, satisfaction: 4.1, avgTime: 22.5 }
    ]
  };

  const analytics = analyticsData || mockAnalytics;

  // Chart colors
  const COLORS = ['#0078D7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const exportReport = (format) => {
    // Mock export functionality
    console.log(`Exporting report in ${format} format`);
    // In real implementation, this would trigger a download
  };

  const getSummaryCards = () => [
    {
      title: 'Total Complaints',
      value: analytics.summary.total_complaints.toLocaleString(),
      icon: DocumentChartBarIcon,
      color: 'text-[#0078D7]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Resolution Rate',
      value: `${analytics.summary.resolved_rate}%`,
      icon: TrophyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Resolution Time',
      value: `${analytics.summary.avg_resolution_time}h`,
      icon: ClockIcon,
      color: 'text-[#FF9E00]',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Citizen Satisfaction',
      value: `${analytics.summary.citizen_satisfaction}/5`,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-[#0078D7] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 text-[#0078D7] mr-3" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights and performance analytics for Mumbai BMC
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => exportReport('pdf')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#0078D7] hover:bg-blue-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent"
            >
              <option value="">All Wards</option>
              {analytics.wardWiseData.map(ward => (
                <option key={ward.ward} value={ward.ward}>{ward.ward} Ward</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getSummaryCards().map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} p-6 rounded-lg border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color} mt-1`}>{card.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BuildingOffice2Icon className="h-5 w-5 text-[#0078D7] mr-2" />
            Department Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
              <Bar dataKey="complaints" fill="#0078D7" name="Total Complaints" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ward-wise Resolution Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
            Ward-wise Resolution Rate
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.wardWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ward" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'resolutionRate' ? `${value}%` : value,
                  name === 'resolutionRate' ? 'Resolution Rate' : name
                ]}
              />
              <Bar dataKey="resolutionRate" fill="#0078D7" name="Resolution Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resolution Time Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 text-[#0078D7] mr-2" />
            Resolution Time Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={analytics.resolutionTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="complaints" fill="#0078D7" name="Complaints" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Avg Time (hours)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartPieIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.departmentPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, complaints }) => `${department}: ${complaints}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="complaints"
              >
                {analytics.departmentPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performing Officers */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrophyIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
          Top Performing Officers
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Rank</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Officer</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Department</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Resolved</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Satisfaction</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Avg Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.topOfficers.map((officer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-900">{officer.name}</td>
                  <td className="py-4 text-sm text-gray-600">{officer.department}</td>
                  <td className="py-4 text-sm text-gray-900">{officer.resolved}</td>
                  <td className="py-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-900 mr-2">{officer.satisfaction}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(officer.satisfaction) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-900">{officer.avgTime}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;