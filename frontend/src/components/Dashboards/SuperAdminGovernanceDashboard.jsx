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
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  SparklesIcon,
  TrendingUpIcon,
  ExclamationIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import {
  calculateMetrics,
  getDepartmentPerformance,
  getComplaintsByDate,
  getWardPerformance,
} from '../utils/analyticsUtils'

/**
 * SuperAdminGovernanceDashboard Component
 * City-wide analytics and governance overview for super admins
 */
const SuperAdminGovernanceDashboard = ({
  complaints = [],
  startDate = null,
  endDate = null,
}) => {
  const [selectedDept, setSelectedDept] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // overview, departmental, zonal

  // Filter by date range
  const filteredComplaints = useMemo(() => {
    let filtered = complaints

    if (startDate) {
      filtered = filtered.filter(
        c => new Date(c.created_at) >= new Date(startDate)
      )
    }

    if (endDate) {
      filtered = filtered.filter(
        c => new Date(c.created_at) <= new Date(endDate)
      )
    }

    return filtered
  }, [complaints, startDate, endDate])

  // Calculate city-wide metrics
  const cityMetrics = useMemo(() => {
    const metrics = calculateMetrics(filteredComplaints)

    // Calculate trend
    const past30Days = filteredComplaints.filter(c => {
      const days =
        (Date.now() - new Date(c.created_at)) / (1000 * 60 * 60 * 24)
      return days <= 30
    })

    const past7Days = filteredComplaints.filter(c => {
      const days =
        (Date.now() - new Date(c.created_at)) / (1000 * 60 * 60 * 24)
      return days <= 7
    })

    return {
      ...metrics,
      last7Days: past7Days.length,
      last30Days: past30Days.length,
      avgComplaintsPerDay: (past30Days.length / 30).toFixed(1),
      criticalCount: filteredComplaints.filter(
        c => c.priority === 'URGENT' && c.status !== 'RESOLVED'
      ).length,
    }
  }, [filteredComplaints])

  // Department performance
  const deptPerformance = useMemo(() => {
    return getDepartmentPerformance(filteredComplaints)
      .slice(0, 10)
  }, [filteredComplaints])

  // Ward performance
  const wardPerformance = useMemo(() => {
    return getWardPerformance(filteredComplaints)
  }, [filteredComplaints])

  // Trend data
  const trendData = useMemo(() => {
    return getComplaintsByDate(filteredComplaints).slice(-30)
  }, [filteredComplaints])

  // Department performance comparison
  const deptComparison = useMemo(() => {
    return deptPerformance.map(dept => ({
      name: dept.name.substring(0, 15),
      resolution: parseFloat(dept.resolutionRate),
      total: dept.total,
    }))
  }, [deptPerformance])

  // Priority distribution
  const priorityData = useMemo(() => {
    const priority = {}
    filteredComplaints.forEach(c => {
      const p = c.priority || 'MEDIUM'
      priority[p] = (priority[p] || 0) + 1
    })

    return Object.entries(priority)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => {
        const order = { URGENT: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
        return (order[a.name] || 5) - (order[b.name] || 5)
      })
  }, [filteredComplaints])

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F97316',
  ]

  const PRIORITY_COLORS = {
    URGENT: '#EF4444',
    HIGH: '#F59E0B',
    MEDIUM: '#3B82F6',
    LOW: '#10B981',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            City Governance Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time city-wide complaint management and performance oversight
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('departmental')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'departmental'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => setViewMode('zonal')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'zonal'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Wards
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {cityMetrics.criticalCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <ExclamationIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Critical Alert</h3>
            <p className="text-sm text-red-800 mt-1">
              {cityMetrics.criticalCount} urgent unresolved complaints require
              immediate attention
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-blue-600">Total Complaints</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {cityMetrics.total}
              </div>
              <div className="text-xs text-blue-600 mt-2">
                {cityMetrics.avgComplaintsPerDay} per day (30-day avg)
              </div>
            </div>
            <SparklesIcon className="h-8 w-8 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-green-600">Resolution Rate</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {cityMetrics.resolutionRate}%
              </div>
              <div className="text-xs text-green-600 mt-2">
                {cityMetrics.resolved} resolved
              </div>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-purple-600">SLA Compliance</div>
              <div className="text-3xl font-bold text-purple-900 mt-2">
                {cityMetrics.slaAdherence}%
              </div>
              <div className="text-xs text-purple-600 mt-2">
                Target: 100%
              </div>
            </div>
            <TrendingUpIcon className="h-8 w-8 text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-red-600">Critical Issues</div>
              <div className="text-3xl font-bold text-red-900 mt-2">
                {cityMetrics.criticalCount}
              </div>
              <div className="text-xs text-red-600 mt-2">
                Urgent & unresolved
              </div>
            </div>
            <ExclamationIcon className="h-8 w-8 text-red-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* City-wide Trend */}
          {trendData.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                30-Day Complaint Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 3 }}
                    name="Complaints"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Priority Distribution */}
          {priorityData.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                By Priority
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORITY_COLORS[entry.name] || '#999'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Status Breakdown */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Resolved
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {cityMetrics.resolved}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{
                      width: `${
                        cityMetrics.total > 0
                          ? (cityMetrics.resolved / cityMetrics.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    In Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {cityMetrics.inProgress}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full"
                    style={{
                      width: `${
                        cityMetrics.total > 0
                          ? (cityMetrics.inProgress / cityMetrics.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Pending
                  </span>
                  <span className="text-sm font-bold text-yellow-600">
                    {cityMetrics.pending}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-600 h-3 rounded-full"
                    style={{
                      width: `${
                        cityMetrics.total > 0
                          ? (cityMetrics.pending / cityMetrics.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Departmental View */}
      {viewMode === 'departmental' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Comparison */}
          {deptComparison.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Department Resolution Rate Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="resolution" fill="#3B82F6" name="Resolution Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Department Rankings */}
          {deptPerformance.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Departments by Volume
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {deptPerformance.map((dept, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => setSelectedDept(dept.name)}
                  >
                    <div className="text-2xl font-bold text-gray-300 w-8">
                      {idx + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-gray-900">
                        {dept.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {dept.total} complaints • {dept.resolutionRate}% resolved
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              dept.total > 0
                                ? (dept.resolved / dept.total) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zonal View */}
      {viewMode === 'zonal' && wardPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ward-wise Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wardPerformance.map((ward, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="font-semibold text-gray-900 mb-3">
                  Ward {ward.name}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{ward.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resolved:</span>
                    <span className="font-medium text-green-600">{ward.resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">{ward.resolutionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ward.total > 0
                            ? (ward.resolved / ward.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">📊 Governance Insights</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          {cityMetrics.slaAdherence < 80 && (
            <li>
              • SLA compliance is below 80%. Focus on departments with lower
              resolution rates.
            </li>
          )}
          {cityMetrics.pending > cityMetrics.total * 0.3 && (
            <li>
              • High number of pending complaints ({cityMetrics.pending}). Consider
              resource allocation adjustments.
            </li>
          )}
          {cityMetrics.criticalCount > 0 && (
            <li>
              • {cityMetrics.criticalCount} urgent issues need immediate resolution.
              Escalate to department heads.
            </li>
          )}
          <li>
            • Current resolution rate: {cityMetrics.resolutionRate}% (Target:
            100%)
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SuperAdminGovernanceDashboard
