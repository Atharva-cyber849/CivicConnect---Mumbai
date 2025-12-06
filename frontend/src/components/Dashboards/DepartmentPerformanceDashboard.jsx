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
import { getDepartmentPerformance, getComplaintsByDate } from '../utils/analyticsUtils'
import {
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

/**
 * DepartmentPerformanceDashboard Component
 * Displays department-wide analytics and SLA tracking
 */
const DepartmentPerformanceDashboard = ({
  complaints = [],
  departmentName = 'Water Supply Department',
}) => {
  const [selectedMetric, setSelectedMetric] = useState('total')
  const [timeframe, setTimeframe] = useState('monthly')

  // Calculate department metrics
  const metrics = useMemo(() => {
    const total = complaints.length
    const resolved = complaints.filter(c => c.status === 'RESOLVED').length
    const pending = complaints.filter(c => c.status === 'PENDING').length
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length

    const byCategory = {}
    complaints.forEach(complaint => {
      byCategory[complaint.category] = (byCategory[complaint.category] || 0) + 1
    })

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

    // SLA = Resolved within 7 days
    const slaCompliant = complaints.filter(c => {
      if (c.status !== 'RESOLVED') return false
      const days =
        (new Date(c.resolved_at) - new Date(c.created_at)) /
        (1000 * 60 * 60 * 24)
      return days <= 7
    }).length

    return {
      total,
      resolved,
      pending,
      inProgress,
      resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) : 0,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      slaCompliance: total > 0 ? ((slaCompliant / total) * 100).toFixed(1) : 0,
      categoryCount: Object.keys(byCategory).length,
    }
  }, [complaints])

  // Get department performance by ward
  const wardPerformance = useMemo(() => {
    const wards = {}
    complaints.forEach(complaint => {
      const ward = complaint.ward || 'Unknown'
      if (!wards[ward]) {
        wards[ward] = {
          ward,
          total: 0,
          resolved: 0,
          pending: 0,
          inProgress: 0,
        }
      }
      wards[ward].total += 1
      if (complaint.status === 'RESOLVED') {
        wards[ward].resolved += 1
      } else if (complaint.status === 'PENDING') {
        wards[ward].pending += 1
      } else if (complaint.status === 'IN_PROGRESS') {
        wards[ward].inProgress += 1
      }
    })

    return Object.values(wards)
      .map(ward => ({
        ...ward,
        resolutionRate: ward.total > 0 ? ((ward.resolved / ward.total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [complaints])

  // Get officer performance
  const officerPerformance = useMemo(() => {
    const officers = {}
    complaints.forEach(complaint => {
      const officer = complaint.assigned_to || 'Unassigned'
      if (!officers[officer]) {
        officers[officer] = {
          name: officer,
          total: 0,
          resolved: 0,
          pending: 0,
          inProgress: 0,
        }
      }
      officers[officer].total += 1
      if (complaint.status === 'RESOLVED') {
        officers[officer].resolved += 1
      } else if (complaint.status === 'PENDING') {
        officers[officer].pending += 1
      } else if (complaint.status === 'IN_PROGRESS') {
        officers[officer].inProgress += 1
      }
    })

    return Object.values(officers)
      .map(officer => ({
        ...officer,
        resolutionRate: officer.total > 0 ? ((officer.resolved / officer.total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [complaints])

  // Get trend data
  const trendData = useMemo(() => {
    return getComplaintsByDate(complaints).slice(-30)
  }, [complaints])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{departmentName}</h1>
        <p className="text-gray-600 mt-1">
          Monitor department performance and SLA compliance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-blue-600">Total Complaints</div>
              <div className="text-3xl font-bold text-blue-900 mt-2">
                {metrics.total}
              </div>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-green-600">Resolution Rate</div>
              <div className="text-3xl font-bold text-green-900 mt-2">
                {metrics.resolutionRate}%
              </div>
              <div className="text-xs text-green-600 mt-1">
                {metrics.resolved} resolved
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
                {metrics.slaCompliance}%
              </div>
              <div className="text-xs text-purple-600 mt-1">
                Resolved within 7 days
              </div>
            </div>
            <ExclamationIcon className="h-8 w-8 text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-orange-600">
                Avg Resolution Time
              </div>
              <div className="text-3xl font-bold text-orange-900 mt-2">
                {metrics.avgResolutionTime}d
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Target: 7 days
              </div>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
            Pending Complaints
          </h3>
          <div className="text-4xl font-bold text-yellow-600">
            {metrics.pending}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {metrics.total > 0
              ? ((metrics.pending / metrics.total) * 100).toFixed(1)
              : 0}
            % of total
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-600 h-2 rounded-full"
              style={{
                width: `${
                  metrics.total > 0 ? (metrics.pending / metrics.total) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
            In Progress
          </h3>
          <div className="text-4xl font-bold text-blue-600">
            {metrics.inProgress}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {metrics.total > 0
              ? ((metrics.inProgress / metrics.total) * 100).toFixed(1)
              : 0}
            % of total
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${
                  metrics.total > 0
                    ? (metrics.inProgress / metrics.total) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">
            Resolved
          </h3>
          <div className="text-4xl font-bold text-green-600">
            {metrics.resolved}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {metrics.total > 0
              ? ((metrics.resolved / metrics.total) * 100).toFixed(1)
              : 0}
            % of total
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{
                width: `${
                  metrics.total > 0 ? (metrics.resolved / metrics.total) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaint Trend */}
        {trendData.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
                  name="Complaints"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Ward Performance */}
        {wardPerformance.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance by Ward
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {wardPerformance.slice(0, 8).map((ward, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      Ward {ward.ward}
                    </span>
                    <span className="text-gray-600">
                      {ward.resolved}/{ward.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
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
              ))}
            </div>
          </div>
        )}

        {/* Officer Performance */}
        {officerPerformance.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Officers by Resolution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={officerPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Resolved', value: metrics.resolved },
                  { name: 'In Progress', value: metrics.inProgress },
                  { name: 'Pending', value: metrics.pending },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {[0, 1, 2].map((index) => (
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
      </div>

      {/* Recommendations */}
      {metrics.slaCompliance < 80 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">⚠️ SLA Alert</h4>
          <p className="text-sm text-red-800">
            SLA compliance is below 80%. Consider allocating additional resources or
            re-prioritizing pending complaints to improve resolution times.
          </p>
        </div>
      )}

      {metrics.pending > metrics.total * 0.3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">⏱️ High Pending Count</h4>
          <p className="text-sm text-yellow-800">
            More than 30% of complaints are pending. Review and prioritize these
            complaints to prevent further delays.
          </p>
        </div>
      )}
    </div>
  )
}

export default DepartmentPerformanceDashboard
