import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MapPinIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ChartPieIcon,
  BuildingOffice2Icon,
  EyeIcon,
  ShieldCheckIcon,
  UserIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon
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
  Cell
} from 'recharts';

import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { USER_ROLES } from '../../config/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState('7');

  // Role-based dashboard configuration
  const dashboardConfig = useMemo(() => {
    switch (user?.role) {
      case USER_ROLES.SUPER_ADMIN:
        return {
          title: 'System Overview',
          subtitle: 'Mumbai BMC - System Administration',
          features: ['system_stats', 'department_performance', 'user_management', 'all_complaints'],
          primaryColor: 'purple',
          accentColor: '#7C3AED'
        };
      case USER_ROLES.ADMIN:
        return {
          title: 'Department Dashboard',
          subtitle: `${user.department || 'Municipal'} Department - Administrative View`,
          features: ['department_stats', 'officer_performance', 'assigned_complaints'],
          primaryColor: 'blue',
          accentColor: '#0078D7'
        };
      case USER_ROLES.OFFICER:
        return {
          title: 'Ward Operations',
          subtitle: `${user.assigned_ward || 'Municipal'} Ward - Officer Dashboard`,
          features: ['ward_stats', 'my_assignments', 'field_updates'],
          primaryColor: 'green',
          accentColor: '#10B981'
        };
      default:
        return {
          title: 'BMC Dashboard',
          subtitle: 'Mumbai Municipal Corporation',
          features: ['general_stats'],
          primaryColor: 'gray',
          accentColor: '#6B7280'
        };
    }
  }, [user]);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', dateFilter, user?.role, user?.department, user?.assigned_ward],
    queryFn: () => adminApi.getDashboardStats({ 
      days: dateFilter,
      role: user?.role,
      department: user?.department,
      ward: user?.assigned_ward
    }),
    refetchInterval: 30000,
  });

  // Fetch recent complaints
  const { data: recentComplaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['recent-complaints', user?.role],
    queryFn: () => adminApi.getRecentComplaints({ 
      limit: 5,
      role: user?.role,
      department: user?.department,
      ward: user?.assigned_ward
    }),
    refetchInterval: 60000,
  });

  // Role-specific mock data
  const getRoleSpecificStats = () => {
    const baseStats = {
      total_complaints: 1247,
      pending_complaints: 24,
      resolved_complaints: 1156,
      in_progress_complaints: 67,
      average_resolution_time: 18.5,
      citizen_satisfaction: 92,
      complaints_today: 8,
      complaints_this_week: 42,
      total_change_percent: 12,
      pending_change_percent: -8,
      resolved_change_percent: 15,
      progress_change_percent: 5
    };

    if (user?.role === USER_ROLES.OFFICER) {
      return {
        ...baseStats,
        total_complaints: 89,
        pending_complaints: 3,
        resolved_complaints: 78,
        in_progress_complaints: 8,
        my_assignments_today: 5,
        ward_priority_complaints: 2
      };
    }
    
    if (user?.role === USER_ROLES.ADMIN) {
      return {
        ...baseStats,
        department_officers: 12,
        department_complaints: 234,
        department_performance: 89
      };
    }

    return baseStats;
  };

  const mockStats = getRoleSpecificStats();

  // Daily summary based on role
  const getDailySummary = () => {
    switch (user?.role) {
      case USER_ROLES.SUPER_ADMIN:
        return {
          title: "Today's System Overview",
          items: [
            "14 new complaints filed across all departments",
            "8 complaints resolved system-wide", 
            "2 critical issues escalated",
            "3 new officers onboarded",
            "System uptime: 99.9%"
          ]
        };
      case USER_ROLES.ADMIN:
        return {
          title: `${user.department || 'Department'} - Today's Brief`,
          items: [
            "6 new complaints assigned to your department",
            "4 complaints resolved by your team",
            "1 complaint escalated to senior officer",
            "2 officers completed field inspections",
            "Average resolution time: 16.5 hours"
          ]
        };
      case USER_ROLES.OFFICER:
        return {
          title: `${user.assigned_ward || 'Ward'} - Today's Summary`,
          items: [
            "3 new complaints assigned to you",
            "2 field inspections completed",
            "1 complaint resolved with citizen satisfaction",
            "Next inspection scheduled at 2:30 PM",
            "Priority: Water leak on Main Street"
          ]
        };
      default:
        return {
          title: "Today's Summary",
          items: ["System operational", "Complaints being processed"]
        };
    }
  };

  const todaysSummary = getDailySummary();
  const dashboardStats = stats || mockStats;

  // Role-specific stat cards
  const getStatCards = () => {
    const baseCards = [
      {
        title: 'Pending Complaints',
        value: dashboardStats.pending_complaints,
        icon: ClockIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-900',
        borderColor: 'border-yellow-200',
        change: dashboardStats.pending_change_percent,
        subtitle: 'Awaiting action'
      },
      {
        title: 'In Progress',
        value: dashboardStats.in_progress_complaints,
        icon: ExclamationTriangleIcon,
        color: 'orange',
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-900',
        borderColor: 'border-orange-200',
        change: dashboardStats.progress_change_percent,
        subtitle: 'Being resolved'
      },
      {
        title: 'Resolved',
        value: dashboardStats.resolved_complaints,
        icon: CheckCircleIcon,
        color: 'green',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
        borderColor: 'border-green-200',
        change: dashboardStats.resolved_change_percent,
        subtitle: 'Successfully closed'
      }
    ];

    if (user?.role === USER_ROLES.OFFICER) {
      baseCards.push({
        title: 'My Assignments',
        value: dashboardStats.my_assignments_today || 5,
        icon: UserIcon,
        color: 'blue',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        borderColor: 'border-blue-200',
        subtitle: 'Today'
      });
    } else if (user?.role === USER_ROLES.ADMIN) {
      baseCards.push({
        title: 'Department Officers',
        value: dashboardStats.department_officers || 12,
        icon: UserGroupIcon,
        color: 'purple',
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-200',
        subtitle: 'Active officers'
      });
    } else {
      baseCards.push({
        title: 'Total Complaints',
        value: dashboardStats.total_complaints,
        icon: DocumentTextIcon,
        color: 'blue',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        borderColor: 'border-blue-200',
        change: dashboardStats.total_change_percent,
        subtitle: 'All time'
      });
    }

    return baseCards;
  };

  const statCards = getStatCards();

  // Role-specific quick actions
  const getQuickActions = () => {
    switch (user?.role) {
      case USER_ROLES.SUPER_ADMIN:
        return [
          {
            title: 'System Analytics',
            description: 'Comprehensive system reports',
            icon: ChartBarIcon,
            color: 'text-purple-600',
            href: '/admin/dashboard/reports'
          },
          {
            title: 'User Management',
            description: 'Manage officers and departments',
            icon: UserGroupIcon,
            color: 'text-blue-600',
            href: '/admin/dashboard/officers'
          },
          {
            title: 'System Settings',
            description: 'Configure system parameters',
            icon: BuildingOffice2Icon,
            color: 'text-gray-600',
            href: '/admin/dashboard/settings'
          },
          {
            title: 'All Complaints',
            description: 'System-wide complaint overview',
            icon: DocumentTextIcon,
            color: 'text-orange-600',
            href: '/admin/dashboard/complaints'
          }
        ];
      case USER_ROLES.ADMIN:
        return [
          {
            title: 'Department Complaints',
            description: 'Manage department complaints',
            icon: DocumentTextIcon,
            color: 'text-blue-600',
            href: '/admin/dashboard/complaints'
          },
          {
            title: 'Officer Management',
            description: 'Manage department officers',
            icon: UserGroupIcon,
            color: 'text-green-600',
            href: '/admin/dashboard/officers'
          },
          {
            title: 'Performance Reports',
            description: 'Department analytics',
            icon: ChartBarIcon,
            color: 'text-purple-600',
            href: '/admin/dashboard/reports'
          },
          {
            title: 'Map View',
            description: 'Geographic department view',
            icon: MapPinIcon,
            color: 'text-red-600',
            href: '/admin/dashboard/map'
          }
        ];
      case USER_ROLES.OFFICER:
        return [
          {
            title: 'My Assignments',
            description: 'View assigned complaints',
            icon: DocumentTextIcon,
            color: 'text-green-600',
            href: '/admin/dashboard/complaints'
          },
          {
            title: 'Field Map',
            description: 'Ward-level mapping',
            icon: MapPinIcon,
            color: 'text-blue-600',
            href: '/admin/dashboard/map'
          },
          {
            title: 'Update Status',
            description: 'Submit field updates',
            icon: CheckCircleIcon,
            color: 'text-orange-600',
            href: '/admin/dashboard/complaints'
          },
          {
            title: 'Ward Reports',
            description: 'Ward performance metrics',
            icon: ChartBarIcon,
            color: 'text-purple-600',
            href: '/admin/dashboard/reports'
          }
        ];
      default:
        return [
          {
            title: 'View Complaints',
            description: 'All system complaints',
            icon: DocumentTextIcon,
            color: 'text-blue-600',
            href: '/admin/dashboard/complaints'
          },
          {
            title: 'Reports',
            description: 'System analytics',
            icon: ChartBarIcon,
            color: 'text-purple-600',
            href: '/admin/dashboard/reports'
          }
        ];
    }
  };

  const quickActions = getQuickActions();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow border">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Role-Sensitive Header */}
      <div className="bg-white rounded-lg shadow-sm border-l-4" style={{ borderColor: dashboardConfig.accentColor }}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {user?.role === USER_ROLES.SUPER_ADMIN && <ShieldCheckIcon className="h-8 w-8 text-purple-600 mr-3" />}
                {user?.role === USER_ROLES.ADMIN && <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mr-3" />}
                {user?.role === USER_ROLES.OFFICER && <UserIcon className="h-8 w-8 text-green-600 mr-3" />}
                {dashboardConfig.title}
              </h1>
              <p className="text-gray-600 mt-1">
                {dashboardConfig.subtitle}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ focusRingColor: dashboardConfig.accentColor }}
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6">
        <div className="flex items-start">
          <BellAlertIcon className="h-6 w-6 text-gray-600 mt-1 mr-3" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {todaysSummary.title}
            </h3>
            <ul className="space-y-2">
              {todaysSummary.items.map((item, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Role-Specific Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          
          return (
            <div 
              key={index}
              className={`${stat.bgColor} ${stat.borderColor} p-6 rounded-lg border-2 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${stat.textColor} opacity-75`}>
                      {stat.title}
                    </p>
                    <Icon className={`h-6 w-6 ${stat.iconColor} group-hover:scale-110 transition-transform`} />
                  </div>
                  
                  <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                    {stat.value.toLocaleString()}
                  </p>
                  
                  <p className="text-xs text-gray-600 mb-2">{stat.subtitle}</p>
                  
                  {stat.change !== undefined && (
                    <div className={`flex items-center text-xs font-medium ${
                      isPositive 
                        ? stat.color === 'yellow' || stat.color === 'orange' 
                          ? 'text-red-600'
                          : 'text-green-600' 
                        : stat.color === 'yellow' || stat.color === 'orange'
                          ? 'text-green-600'
                          : 'text-red-600'
                    }`}>
                      {(isPositive && (stat.color === 'yellow' || stat.color === 'orange')) ||
                       (!isPositive && (stat.color !== 'yellow' && stat.color !== 'orange')) ? (
                        <ArrowDownIcon className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowUpIcon className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(stat.change)}% vs last period
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-Specific Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" style={{ color: dashboardConfig.accentColor }} />
            Quick Actions
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="group p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                style={{ '&:hover': { borderColor: dashboardConfig.accentColor } }}
              >
                <div className="flex items-start">
                  <Icon className={`h-6 w-6 ${action.color} mr-3 group-hover:scale-110 transition-transform`} />
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics - Role Specific */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" style={{ color: dashboardConfig.accentColor }} />
            {user?.role === USER_ROLES.OFFICER ? 'Ward Performance' : 
             user?.role === USER_ROLES.ADMIN ? 'Department Metrics' : 'System Overview'}
          </h3>
          
          {/* Placeholder for role-specific chart */}
          <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            Role-specific performance chart will be displayed here
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <ChartPieIcon className="h-5 w-5 mr-2" style={{ color: dashboardConfig.accentColor }} />
            Key Metrics
          </h3>
          
          <div className="space-y-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.average_resolution_time}h
              </div>
              <div className="text-sm text-gray-600">Avg. Resolution Time</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.citizen_satisfaction}%
              </div>
              <div className="text-sm text-gray-600">Citizen Satisfaction</div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dashboardStats.citizen_satisfaction}%` }}></div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardStats.complaints_today}
              </div>
              <div className="text-sm text-gray-600">
                {user?.role === USER_ROLES.OFFICER ? 'My Tasks Today' : 'Complaints Today'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dashboardStats.complaints_this_week} this week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" style={{ color: dashboardConfig.accentColor }} />
            {user?.role === USER_ROLES.OFFICER ? 'My Recent Assignments' : 'Recent Complaints'}
          </h3>
          <Link
            to="/admin/dashboard/complaints"
            className="text-sm font-medium flex items-center hover:underline"
            style={{ color: dashboardConfig.accentColor }}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View All
          </Link>
        </div>
        
        {complaintsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: dashboardConfig.accentColor }}></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Description</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Category</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentComplaints?.length > 0 ? (
                  recentComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium" style={{ color: dashboardConfig.accentColor }}>
                        #{complaint.id}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {complaint.title || complaint.description}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {complaint.category}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                          complaint.status === 'RESOLVED' 
                            ? 'bg-green-100 text-green-800' 
                            : complaint.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No recent complaints
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;