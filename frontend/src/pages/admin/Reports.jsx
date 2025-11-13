import React, { useState, useMemo, useEffect } from 'react';
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
import { DEPARTMENTS, WARD_CHOICES, USER_ROLES } from '../../config/constants';
import { isSuperAdmin, isAdmin, isOfficer, canExportReports } from '../../utils/roleBasedAccess';
import { ExclamationIcon } from '@heroicons/react/24/solid';

const Reports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30'); // Last 30 days
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  // Role-based access control
  const userIsOfficer = isOfficer(user);
  const userIsAdmin = isAdmin(user);
  const userIsSuperAdmin = isSuperAdmin(user);

  // Check if user can access reports
  const canAccessReports = userIsSuperAdmin || userIsAdmin || userIsOfficer;

  // Apply role-based automatic filters
  useEffect(() => {
    // For officers: Auto-restrict to their assigned ward
    if (userIsOfficer && user?.assigned_ward) {
      setSelectedWard(user.assigned_ward);
      setSelectedDepartment(''); // Clear department for officers
    }
    // For admins: Auto-restrict to their department
    else if (userIsAdmin && user?.department) {
      setSelectedDepartment(user.department);
      setSelectedWard(''); // Clear ward for admins
    }
    // Super admins can see everything - no pre-fill
  }, [userIsOfficer, userIsAdmin, user?.assigned_ward, user?.department]);

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange, selectedDepartment, selectedWard, user?.role],
    queryFn: () => adminApi.getAnalytics({ 
      days: dateRange,
      department: selectedDepartment,
      ward: selectedWard,
      role: user?.role
    }),
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Generate mock analytics data dynamically based on filters
  const generateMockAnalytics = useMemo(() => {
    const days = parseInt(dateRange);
    const multiplier = days === 7 ? 0.5 : days === 30 ? 1 : days === 90 ? 2.5 : 8;
    
    // Filter departments based on selection
    const filteredDepts = selectedDepartment 
      ? DEPARTMENTS.filter(d => d.id === selectedDepartment)
      : DEPARTMENTS;
    
    // Generate department performance based on filters
    const deptPerformance = filteredDepts.map(dept => {
      const baseComplaints = Math.floor(Math.random() * 100 + 50) * multiplier;
      const resolved = Math.floor(baseComplaints * (0.85 + Math.random() * 0.15));
      return {
        department: dept.name,
        complaints: Math.floor(baseComplaints),
        resolved: Math.floor(resolved),
        avgTime: Math.floor(Math.random() * 20 + 10),
        satisfaction: Math.floor(Math.random() * 20 + 75)
      };
    });
    
    const totalComplaints = deptPerformance.reduce((sum, d) => sum + d.complaints, 0);
    const totalResolved = deptPerformance.reduce((sum, d) => sum + d.resolved, 0);
    
    // Filter wards based on selection
    const filteredWards = selectedWard
      ? WARD_CHOICES.filter(w => w.value === selectedWard)
      : WARD_CHOICES;
    
    return {
      summary: {
        total_complaints: totalComplaints,
        resolved_rate: Math.round((totalResolved / totalComplaints) * 100),
        avg_resolution_time: Math.floor(Math.random() * 15 + 10),
        citizen_satisfaction: (Math.random() * 1 + 3.5).toFixed(1),
        officer_performance: Math.floor(Math.random() * 20 + 75)
      },
      departmentPerformance: deptPerformance,
      wardWiseData: filteredWards.map(ward => ({
        ward: ward.value,
        label: ward.label,
        complaints: Math.floor(Math.random() * 80 + 20) * (multiplier * 0.5),
        resolved: Math.floor(Math.random() * 70 + 15) * (multiplier * 0.5),
        resolutionRate: Math.floor(Math.random() * 15 + 80)
      })),
      categoryTrends: deptPerformance.map((dept, idx) => ({
        category: dept.department,
        jan: Math.floor(dept.complaints * 0.1),
        feb: Math.floor(dept.complaints * 0.12),
        mar: Math.floor(dept.complaints * 0.11),
        apr: Math.floor(dept.complaints * 0.13),
        may: Math.floor(dept.complaints * 0.14),
        jun: Math.floor(dept.complaints * 0.12)
      })),
      resolutionTrends: Array.from({ length: Math.min(days, 6) }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
        avgTime: Math.floor(Math.random() * 10 + 12),
        complaints: Math.floor(totalComplaints / Math.min(days, 6) + (Math.random() * 20 - 10))
      })),
      topOfficers: deptPerformance.slice(0, 5).map((dept, idx) => ({
        name: `Officer ${['Patil', 'Singh', 'Kumar', 'Sharma', 'Joshi'][idx]}`,
        department: dept.department,
        resolved: Math.floor(dept.resolved * 0.7),
        satisfaction: (Math.random() * 0.5 + 4).toFixed(1),
        avgTime: dept.avgTime
      }))
    };
  }, [dateRange, selectedDepartment, selectedWard]);

  const mockAnalytics = generateMockAnalytics;

  const analytics = analyticsData || mockAnalytics;

  // Chart colors
  const COLORS = ['#0078D7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Generate dynamic resolution trends based on date range
  const generateResolutionTrends = useMemo(() => {
    const days = parseInt(dateRange);
    const trends = [];
    const now = new Date();
    
    // Generate data points for the selected period
    for (let i = Math.min(days, 6) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Calculate proportional values
      const avgComplaints = Math.round(analytics.summary.total_complaints / Math.min(days, 6));
      const avgTime = analytics.summary.avg_resolution_time;
      
      // Add variance
      const variance = Math.floor(Math.random() * 10) - 5;
      
      trends.push({
        month: monthName,
        avgTime: Math.max(5, avgTime + (variance * 0.5)),
        complaints: Math.max(1, avgComplaints + variance)
      });
    }
    
    return trends;
  }, [dateRange, analytics.summary]);

  // Generate dynamic category trends
  const generateCategoryTrends = useMemo(() => {
    const categories = analytics.departmentPerformance.map(dept => ({
      category: dept.department,
      ...Object.fromEntries(
        ['jan', 'feb', 'mar', 'apr', 'may', 'jun'].map(month => [
          month,
          Math.max(1, Math.round((dept.complaints / 6) + (Math.random() * 20 - 10)))
        ])
      )
    }));
    return categories;
  }, [analytics.departmentPerformance]);

  const exportReport = (format) => {
    // Mock export functionality
    console.log(`Exporting report in ${format} format`);
    // In real implementation, this would trigger a download
  };

  // Calculate dynamic summary metrics
  const calculateSummary = useMemo(() => {
    const totalComplaints = analytics.summary.total_complaints;
    const totalResolved = analytics.departmentPerformance.reduce((sum, dept) => sum + dept.resolved, 0);
    const resolutionRate = Math.round((totalResolved / totalComplaints) * 100);
    const avgTime = analytics.summary.avg_resolution_time;
    const satisfaction = analytics.summary.citizen_satisfaction;
    
    return { totalComplaints, resolutionRate, avgTime, satisfaction };
  }, [analytics]);

  const getSummaryCards = () => [
    {
      title: 'Total Complaints',
      value: calculateSummary.totalComplaints.toLocaleString(),
      icon: DocumentChartBarIcon,
      color: 'text-[#0078D7]',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Resolution Rate',
      value: `${calculateSummary.resolutionRate}%`,
      icon: TrophyIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Resolution Time',
      value: `${calculateSummary.avgTime}h`,
      icon: ClockIcon,
      color: 'text-[#FF9E00]',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Citizen Satisfaction',
      value: `${calculateSummary.satisfaction}/5`,
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

  // Access Denial Screen - Check if user can access reports
  if (!canAccessReports) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <ExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the Reports & Analytics page.
          </p>
          <p className="text-sm text-gray-500">
            Please contact your administrator if you believe this is an error.
          </p>
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
          
          {canExportReports(user) && (
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
          )}
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
        
        <div className={`grid gap-4 ${userIsSuperAdmin ? 'grid-cols-1 md:grid-cols-3' : userIsAdmin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
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

          {/* Department filter - visible for Super Admin and Admin */}
          {(userIsSuperAdmin || userIsAdmin) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                disabled={userIsAdmin && user?.department}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{userIsAdmin && user?.department ? 'Department (Locked)' : 'All Departments'}</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Ward filter - visible for Super Admin and Officer */}
          {(userIsSuperAdmin || userIsOfficer) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={userIsOfficer && user?.assigned_ward}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{userIsOfficer && user?.assigned_ward ? 'Ward (Locked)' : 'All Wards'}</option>
                {WARD_CHOICES.map(ward => (
                  <option key={ward.value} value={ward.value}>{ward.label}</option>
                ))}
              </select>
            </div>
          )}
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
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.departmentPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45}
                textAnchor="end"
                height={90}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[8, 8, 0, 0]} />
              <Bar dataKey="complaints" fill="#0078D7" name="Total Complaints" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ward-wise Resolution Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
            Ward-wise Resolution Rate
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.wardWiseData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="ward" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} />
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
                cursor={{ fill: 'rgba(0, 120, 215, 0.1)' }}
              />
              <Legend />
              <Bar dataKey="resolutionRate" fill="#0078D7" name="Resolution Rate %" radius={[8, 8, 0, 0]} />
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
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={generateResolutionTrends} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45}
                textAnchor="end"
                height={90}
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="left" label={{ value: 'Complaints', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Hours', angle: 90, position: 'insideRight' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  name === 'avgTime' ? `${value.toFixed(1)}h` : value,
                  name === 'avgTime' ? 'Avg Resolution Time' : 'Complaints'
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="complaints" fill="#0078D7" name="Complaints" radius={[8, 8, 0, 0]} />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Avg Time (hours)"
                dot={{ fill: '#F59E0B', r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution - Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartPieIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
            Complaint Distribution by Department
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
                formatter={(value) => `${value} complaints`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Satisfaction & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Satisfaction */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrophyIcon className="h-5 w-5 text-[#10B981] mr-2" />
            Department Satisfaction Scores
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.departmentPerformance} layout="vertical" margin={{ top: 20, right: 30, left: 150, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="department" type="category" width={140} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="satisfaction" fill="#10B981" name="Satisfaction %" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Rate by Department */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-[#8B5CF6] mr-2" />
            Resolution Rate by Department
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analytics.departmentPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45}
                textAnchor="end"
                height={90}
                tick={{ fontSize: 11 }}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #0078D7',
                  borderRadius: '8px'
                }}
                formatter={(value) => {
                  const resolved = value;
                  const rate = Math.round((resolved / (resolved + Math.random() * 30)) * 100);
                  return `${rate}%`;
                }}
              />
              <Legend />
              <Bar dataKey="resolved" fill="#8B5CF6" name="Resolved" radius={[8, 8, 0, 0]} />
              <Bar dataKey="complaints" fill="#EF4444" name="Total" radius={[8, 8, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Trends Over Time */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-[#06B6D4] mr-2" />
          Category Trends Over Time
        </h3>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={generateCategoryTrends} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #0078D7',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="jan" stackId="1" stroke="#0078D7" fill="#0078D7" name="January" />
            <Area type="monotone" dataKey="feb" stackId="1" stroke="#10B981" fill="#10B981" name="February" />
            <Area type="monotone" dataKey="mar" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="March" />
            <Area type="monotone" dataKey="apr" stackId="1" stroke="#EF4444" fill="#EF4444" name="April" />
            <Area type="monotone" dataKey="may" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="May" />
            <Area type="monotone" dataKey="jun" stackId="1" stroke="#06B6D4" fill="#06B6D4" name="June" />
          </AreaChart>
        </ResponsiveContainer>
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