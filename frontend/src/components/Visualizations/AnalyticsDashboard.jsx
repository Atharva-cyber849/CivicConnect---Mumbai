import React, { useState, useMemo } from 'react'
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
  AreaChart,
  Area,
} from 'recharts'
import {
  CalendarIcon,
  FunnelIcon,
  DocumentDownloadIcon,
} from '@heroicons/react/24/outline'

/**
 * AdvancedAnalyticsDashboard Component
 * Comprehensive analytics with multiple chart types and filters
 */
const AnalyticsDashboard = ({
  complaints = [],
  title = 'Analytics Dashboard',
  showDateFilter = true,
  showCategoryFilter = true,
  showDepartmentFilter = true,
  onExport = () => {},
}) => {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: '',
    department: '',
  })

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      if (filters.startDate && complaint.created_at < filters.startDate) {
        return false
      }
      if (filters.endDate && complaint.created_at > filters.endDate) {
        return false
      }
      if (filters.category && complaint.category !== filters.category) {
        return false
      }
      if (filters.department && complaint.department !== filters.department) {
        return false
      }
      return true
    })
  }, [complaints, filters])

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredComplaints.length
    const resolved = filteredComplaints.filter(
      c => c.status === 'RESOLVED'
    ).length
    const pending = filteredComplaints.filter(
      c => c.status === 'PENDING'
    ).length
    const inProgress = filteredComplaints.filter(
      c => c.status === 'IN_PROGRESS'
    ).length

    const avgResolutionTime =
      resolved > 0
        ? filteredComplaints
            .filter(c => c.status === 'RESOLVED')
            .reduce((sum, c) => {
              const days =
                (new Date(c.resolved_at) -
                  new Date(c.created_at)) /
                (1000 * 60 * 60 * 24)
              return sum + days
            }, 0) / resolved
        : 0

    const slaAdherence =
      total > 0
        ? ((resolved / total) * 100).toFixed(1)
        : 0

    return {
      total,
      resolved,
      pending,
      inProgress,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      slaAdherence,
      resolutionRate: ((resolved / total) * 100).toFixed(1),
    }
  }, [filteredComplaints])

  // Data for complaints by category
  const categoryData = useMemo(() => {
    const data = {}
    filteredComplaints.forEach(complaint => {
      data[complaint.category] = (data[complaint.category] || 0) + 1
    })
    return Object.entries(data).map(([category, count]) => ({
      name: category,
      value: count,
    }))
  }, [filteredComplaints])

  // Data for status distribution
  const statusData = useMemo(() => {
    return [
      { name: 'Pending', value: metrics.pending },
      { name: 'In Progress', value: metrics.inProgress },
      { name: 'Resolved', value: metrics.resolved },
    ].filter(item => item.value > 0)
  }, [metrics])

  // Data for complaints over time
  const timeseriesData = useMemo(() => {
    const data = {}
    filteredComplaints.forEach(complaint => {
      const date = new Date(complaint.created_at)
        .toISOString()
        .split('T')[0]
      data[date] = (data[date] || 0) + 1
    })
    return Object.entries(data)
      .sort()
      .slice(-30)
      .map(([date, count]) => ({
        date,
        complaints: count,
      }))
  }, [filteredComplaints])

  // Data for resolution time by department
  const departmentData = useMemo(() => {
    const data = {}
    filteredComplaints.forEach(complaint => {
      if (!data[complaint.department]) {
        data[complaint.department] = {
          department: complaint.department,
          count: 0,
          resolved: 0,
          avgTime: 0,
        }
      }
      data[complaint.department].count += 1
      if (complaint.status === 'RESOLVED') {
        data[complaint.department].resolved += 1
      }
    })

    return Object.values(data).slice(0, 8)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={() => onExport(filteredComplaints)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <DocumentDownloadIcon className="h-5 w-5" />
          Export Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FunnelIcon className="h-4 w-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {showDateFilter && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {showCategoryFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={e =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {Array.from(
                  new Set(complaints.map(c => c.category))
                ).map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showDepartmentFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={e =>
                  setFilters({ ...filters, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {Array.from(
                  new Set(complaints.map(c => c.department))
                ).map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                category: '',
                department: '',
              })}
              className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-600">Total Complaints</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">
            {metrics.total}
          </div>
          <div className="text-xs text-blue-600 mt-2">
            {filters.startDate} to {filters.endDate}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-600">Resolved</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {metrics.resolved}
          </div>
          <div className="text-xs text-green-600 mt-2">
            {metrics.resolutionRate}% resolution
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <div className="text-sm font-medium text-yellow-600">In Progress</div>
          <div className="text-3xl font-bold text-yellow-900 mt-2">
            {metrics.inProgress}
          </div>
          <div className="text-xs text-yellow-600 mt-2">
            {((metrics.inProgress / metrics.total) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-purple-600">
            Avg Resolution Time
          </div>
          <div className="text-3xl font-bold text-purple-900 mt-2">
            {metrics.avgResolutionTime}d
          </div>
          <div className="text-xs text-purple-600 mt-2">
            SLA: {metrics.slaAdherence}%
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category */}
        {categoryData.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Complaints by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        {statusData.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
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

        {/* Complaints Over Time */}
        {timeseriesData.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Complaints Over Time (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeseriesData}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorComplaints)"
                  name="Complaints"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department Performance */}
        {departmentData.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Department Performance
            </h3>
            <div className="space-y-3">
              {departmentData.map((dept, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {dept.department}
                    </span>
                    <span className="text-gray-600">
                      {dept.resolved} / {dept.count} resolved
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          dept.count > 0
                            ? (dept.resolved / dept.count) * 100
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
      </div>
    </div>
  )
}

export default AnalyticsDashboard
