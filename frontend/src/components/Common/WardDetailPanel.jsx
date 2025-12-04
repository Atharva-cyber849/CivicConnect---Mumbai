import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FiX, FiTrendingUp, FiBarChart2, FiClock } from 'react-icons/fi'
import { format, differenceInDays } from 'date-fns'

/**
 * WardDetailPanel Component
 * Displays detailed statistics and information for a selected ward
 * Shows complaint breakdown by status and category
 */
const WardDetailPanel = ({
  wardCode,
  wardName,
  stats,
  complaints = [],
  onClose,
  className = '',
}) => {
  if (!wardCode || !stats) {
    return null
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const resolved = complaints.filter(c => c.status === 'RESOLVED')
    const avgResolutionDays = resolved.length
      ? resolved.reduce((sum, c) => {
          const created = new Date(c.created_at)
          const resolved = new Date(c.resolved_at || c.updated_at)
          return sum + differenceInDays(resolved, created)
        }, 0) / resolved.length
      : 0

    const categoryCount = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1
      return acc
    }, {})

    return {
      avgResolution: Math.round(avgResolutionDays),
      categories: Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      percentResolved: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    }
  }, [complaints, stats])

  // Status colors
  const statusColors = {
    PENDING: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
    IN_PROGRESS: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
    RESOLVED: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
    REJECTED: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{wardName}</h3>
          <p className="text-gray-600 text-sm mt-1">Ward {wardCode} - Complaint Details</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-indigo-900 mb-1">Total Issues</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-yellow-900 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-blue-900 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-green-900 mb-1">Resolved</div>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
        </div>
      </div>

      {/* Resolution Rate & Avg Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Resolution Rate */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">Resolution Rate</h4>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-green-600">
              {statistics.percentResolved}%
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {stats.resolved} of {stats.total} resolved
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all"
              style={{ width: `${statistics.percentResolved}%` }}
            />
          </div>
        </div>

        {/* Average Resolution Time */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Avg Resolution Time</h4>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-blue-600">
              {statistics.avgResolution}
            </div>
            <div className="text-sm text-gray-600 mb-1">days</div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Based on {stats.resolved} resolved complaints
          </p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FiBarChart2 className="w-4 h-4" />
          Status Distribution
        </h4>
        <div className="space-y-2">
          {Object.entries(stats).map(
            ([status, count]) =>
              ['pending', 'in_progress', 'resolved', 'rejected'].includes(status) && (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {status.replace('_', ' ').charAt(0).toUpperCase() +
                        status.replace('_', ' ').slice(1)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getStatusBarColor(
                        status.toUpperCase()
                      )}`}
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* Top Categories */}
      {statistics.categories.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Top Issue Categories</h4>
          <div className="space-y-2">
            {statistics.categories.map(({ category, count }) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      style={{
                        width: `${
                          statistics.categories[0].count > 0
                            ? (count / statistics.categories[0].count) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Complaints */}
      {stats.rejected > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">Rejected Complaints</h4>
          <p className="text-sm text-red-800">
            {stats.rejected} complaint(s) have been rejected and are not being processed.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Link
          to={`/dashboard/map?ward=${wardCode}`}
          className="flex-1 btn btn-primary btn-sm"
        >
          View All Issues
        </Link>
        <Link
          to="/dashboard/map"
          className="flex-1 btn btn-secondary btn-sm"
        >
          Back to Map
        </Link>
      </div>
    </div>
  )
}

// Helper function to get status bar color
function getStatusBarColor(status) {
  switch (status) {
    case 'PENDING':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    case 'IN_PROGRESS':
      return 'bg-gradient-to-r from-blue-400 to-blue-600'
    case 'RESOLVED':
      return 'bg-gradient-to-r from-green-400 to-green-600'
    case 'REJECTED':
      return 'bg-gradient-to-r from-red-400 to-red-600'
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600'
  }
}

export default WardDetailPanel
