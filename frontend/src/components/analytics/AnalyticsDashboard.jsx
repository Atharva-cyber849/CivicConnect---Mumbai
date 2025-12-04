import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import WardHeatmap from './WardHeatmap';
import ResponseTimeMetrics from './ResponseTimeMetrics';
import {
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = 'http://localhost:8000/api';

const AnalyticsDashboard = () => {
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState('heatmap');

  // Fetch dashboard summary
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['analytics-dashboard', days],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}/complaints/analytics/dashboard-summary/`,
        {
          params: { days },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      return response.data;
    },
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to load analytics data</p>
      </div>
    );
  }

  const handleDaysChange = (newDays) => {
    setDays(newDays);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-600 mt-1">Complaint trends and performance metrics</p>
            </div>
            
            {/* Period Selector */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
              {[7, 14, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDaysChange(d)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    days === d
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Complaints"
            value={dashboardData?.heatmap?.summary?.total || 0}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Avg Response Time"
            value={`${dashboardData?.response_times?.summary?.avg_response_time || 0}h`}
            icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="SLA Compliance"
            value={`${dashboardData?.response_times?.summary?.overall_sla_compliance || 0}%`}
            icon={<ChartPieIcon className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Best Ward"
            value={dashboardData?.response_times?.summary?.best_performing_ward || 'N/A'}
            icon={<CalendarIcon className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <TabButton
            active={activeTab === 'heatmap'}
            onClick={() => setActiveTab('heatmap')}
            label="Ward Heatmap"
          />
          <TabButton
            active={activeTab === 'response-time'}
            onClick={() => setActiveTab('response-time')}
            label="Response Time"
          />
          <TabButton
            active={activeTab === 'trends'}
            onClick={() => setActiveTab('trends')}
            label="Trends"
          />
          <TabButton
            active={activeTab === 'departments'}
            onClick={() => setActiveTab('departments')}
            label="Departments"
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'heatmap' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Complaints by Ward</h2>
              <WardHeatmap data={dashboardData?.heatmap} />
            </div>
          )}

          {activeTab === 'response-time' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Response Time Metrics</h2>
              <ResponseTimeMetrics data={dashboardData?.response_times} />
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Complaint Trends</h2>
              <ComplaintTrends data={dashboardData?.trends} />
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Department Comparison</h2>
              <DepartmentComparison data={dashboardData?.department_comparison} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200'
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-600 hover:text-slate-900'
    }`}
  >
    {label}
  </button>
);

const ComplaintTrends = ({ data }) => {
  if (!data?.data) return <div>No data available</div>;

  const dates = Object.keys(data.data).sort();
  const totals = dates.map(d => data.data[d].total);
  const resolved = dates.map(d => data.data[d].resolved);
  const pending = dates.map(d => data.data[d].pending);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Total Complaints',
        data: totals,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Resolved',
        data: resolved,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      },
      {
        label: 'Pending',
        data: pending,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="w-full h-96">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};

const DepartmentComparison = ({ data }) => {
  if (!data?.departments) return <div>No data available</div>;

  const departments = Object.keys(data.departments);
  const slaCompliance = departments.map(
    d => data.departments[d].sla_compliance_rate
  );
  const avgResponse = departments.map(
    d => data.departments[d].avg_response_time || 0
  );

  const chartData = {
    labels: departments,
    datasets: [
      {
        label: 'SLA Compliance %',
        data: slaCompliance,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">SLA Compliance by Department</h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: {
                beginAtZero: true,
                max: 100
              }
            }
          }}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Department Metrics</h3>
        {departments.map((dept) => (
          <div key={dept} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-900">{dept}</p>
                <div className="text-sm text-slate-600 mt-1">
                  <p>Complaints: {data.departments[dept].total_complaints}</p>
                  <p>Resolved: {data.departments[dept].resolved}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  {data.departments[dept].sla_compliance_rate}%
                </p>
                <p className="text-xs text-slate-500">SLA Rate</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
