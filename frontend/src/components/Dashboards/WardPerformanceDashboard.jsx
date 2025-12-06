import React, { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeOffIcon,
} from '@heroicons/react/24/outline'
import { getComplaintsByDate, getStatusDistribution } from '../utils/analyticsUtils'

/**
 * WardPerformanceDashboard Component
 * Displays ward-specific analytics and performance metrics
 */
const WardPerformanceDashboard = ({
  complaints = [],
  wardName = 'Ward A',
}) => {
  const [showCharts, setShowCharts] = useState(true)

  // Calculate ward metrics
  const metrics = useMemo(() => {
    const total = complaints.length
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length
    const pending = complaints.filter(c => c.status === 'PENDING').length
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length

    const urgentCount = complaints.filter(c => c.priority === 'URGENT').length
    const highCount = complaints.filter(c => c.priority === 'HIGH').length

    const avgResolutionTime =
      resolved > 0
        ? complaints
            .filter(c => c.status === 'RESOLVED')
            .reduce((sum, c) => {
              const days =
                (new Date(c.resolved_at) - new Date(c.created_at)) /
                (1000 * 60 * 60 * 24)
              return sum + days
            }, 0) / resolved
        : 0

    return {
      total,
      resolved,
      pending,
      inProgress,
      urgentCount,
      highCount,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
    }
  }, [complaints])

  // Get category breakdown
  const categoryData = useMemo(() => {
    const data = {}
    complaints.forEach(complaint => {
      data[complaint.category] = (data[complaint.category] || 0) + 1
    })
    return Object.entries(data)
      .map(([category, count]) => ({
        name: category,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [complaints])

  // Get status distribution
  const statusData = useMemo(() => {
    return getStatusDistribution(complaints)
  }, [complaints])

  // Get trend data
  const trendData = useMemo(() => {
    return getComplaintsByDate(complaints).slice(-14)
  }, [complaints])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{wardName} Performance</h1>
          <p className="text-gray-600 mt-1">
            Track complaints and performance metrics for your ward
          </p>
        </div>
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={showCharts ? 'Hide charts' : 'Show charts'}
        >
          {showCharts ? (
            <EyeOffIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <EyeIcon className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-600">Total Complaints</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {metrics.total}
              </div>
            </div>
            <div className="text-4xl opacity-10 text-blue-600">📋</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-600">Resolved</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {metrics.resolved}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {metrics.resolutionRate}% rate
              </div>
            </div>
            <div className="text-4xl opacity-10 text-green-600">✓</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-yellow-600">Pending</div>
              <div className="text-3xl font-bold text-yellow-900 mt-2">
                {metrics.pending}
              </div>
              <div className="text-xs text-yellow-600 mt-1">Awaiting action</div>
            </div>
            <div className="text-4xl opacity-10 text-yellow-600">⏱️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-600">Urgent (High)</div>
              <div className="text-3xl font-bold text-red-900 mt-2">
                {metrics.urgentCount + metrics.highCount}
              </div>
              <div className="text-xs text-red-600 mt-1">Need attention</div>
            </div>
            <div className="text-4xl opacity-10 text-red-600">🚨</div>
          </div>
        </div>
      </div>

      {/* Resolution Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* In Progress */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            In Progress Complaints
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Total In Progress
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {metrics.inProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      metrics.total > 0
                        ? (metrics.inProgress / metrics.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {metrics.total > 0
                  ? ((metrics.inProgress / metrics.total) * 100).toFixed(1)
                  : 0}
                % of total complaints
              </div>
            </div>
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resolution Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Avg Resolution Time
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  {metrics.avgResolutionTime}d
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Based on {metrics.resolved} resolved complaints
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          {categoryData.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Complaint Categories
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Status Distribution */}
          {statusData.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status Overview
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData.map(item => ({
                      name: item.status,
                      value: item.count,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trend */}
          {trendData.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Complaint Trend (Last 2 Weeks)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    name="Complaints"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Use these metrics to identify patterns and prioritize
          resources. Focus on urgent and high-priority complaints first, and monitor
          resolution times to ensure timely completion.
        </p>
      </div>
    </div>
  )
}

export default WardPerformanceDashboard
