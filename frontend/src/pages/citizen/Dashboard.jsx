import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiMapPin, 
  FiPlus,
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const UserDashboard = () => {
  const { data: complaints, isLoading, error } = useQuery({
    queryKey: ['userComplaints'],
    queryFn: async () => {
      try {
        return await complaintsApi.getUserComplaints()
      } catch (err) {
        console.error('Error fetching complaints:', err)
        throw err
      }
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    onError: (err) => {
      console.error('Query error:', err)
    }
  })

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      try {
        return await complaintsApi.getUserStats()
      } catch (err) {
        console.error('Error fetching stats:', err)
        // Return default stats on error
        return { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 }
      }
    },
    retry: 1,
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Show loading state
  if (isLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error.message || 'Please try again later'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // Handle different response structures
  const complaintsList = complaints?.results || complaints?.data?.results || complaints || []
  
  const stats = {
    total: complaintsList.length,
    pending: complaintsList.filter(c => c.status === 'PENDING').length,
    inProgress: complaintsList.filter(c => c.status === 'IN_PROGRESS').length,
    resolved: complaintsList.filter(c => c.status === 'RESOLVED').length,
  }

  // Chart data for donut chart
  const pieData = [
    { name: 'Resolved', value: stats.resolved, color: '#10B981' },
    { name: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
  ].filter(item => item.value > 0)

  // Recent activity data
  const recentActivityData = complaintsList
    .slice(0, 7)
    .map(complaint => ({
      day: new Date(complaint.created_at).toLocaleDateString('en-IN', { weekday: 'short' }),
      count: 1
    }))

  const avgResponseTime = userStats?.averageResponseTime || '2.5 days'
  const lastComplaintLocation = complaintsList[0]?.location

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
        </div>
        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              Welcome back! 👋
              <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">v2.0</span>
            </h1>
            <p className="text-blue-100 text-lg">
              Track your complaints and help improve Mumbai together
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <FiCalendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <FiTrendingUp className="w-4 h-4" />
                <span>Active Citizen</span>
              </div>
            </div>
          </div>
          <Link 
            to="/dashboard/report"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:scale-105 duration-200"
          >
            <FiPlus className="w-6 h-6" />
            <span>Report New Issue</span>
          </Link>
        </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1 uppercase tracking-wide">Total Complaints</p>
              <h3 className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                All time
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FiFileText className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1 uppercase tracking-wide">Pending</p>
              <h3 className="text-4xl font-bold text-yellow-600 mb-1">{stats.pending}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                Awaiting action
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
              <FiClock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1 uppercase tracking-wide">In Progress</p>
              <h3 className="text-4xl font-bold text-blue-600 mb-1">{stats.inProgress}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" />
                Being resolved
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <FiAlertCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold mb-1 uppercase tracking-wide">Resolved</p>
              <h3 className="text-4xl font-bold text-green-600 mb-1">{stats.resolved}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiCheckCircle className="w-3 h-3" />
                Successfully closed
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <FiCheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolution Chart */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-4 h-4 text-white" />
            </div>
            Resolution Status
          </h3>
          {stats.total > 0 ? (
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-600">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No complaints yet</p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiTrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Avg Response Time</span>
              </div>
              <span className="font-semibold text-gray-900">{avgResponseTime}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiCheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Resolution Rate</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">This Month</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.total} complaints</span>
            </div>
          </div>
        </div>

        {/* Map Snapshot */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Reported Location</h3>
          {lastComplaintLocation ? (
            <div className="space-y-3">
              <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center">
                <FiMapPin className="w-8 h-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Map Preview</span>
              </div>
              <p className="text-sm text-gray-600">
                {lastComplaintLocation.ward}, {lastComplaintLocation.area}
              </p>
              <Link 
                to="/dashboard/map"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Full Map →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiMapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No location data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Complaints</h2>
          <Link 
            to="/dashboard/complaints" 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading complaints...</p>
          </div>
        ) : complaintsList.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
            <p className="text-gray-600 mb-6">Start making a difference in your community</p>
            <Link 
              to="/dashboard/report" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Report Your First Issue</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaintsList.slice(0, 5).map((complaint) => (
              <Link
                key={complaint.id}
                to={`/dashboard/complaints/${complaint.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{complaint.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{complaint.category}</span>
                      <span>•</span>
                      <span>{new Date(complaint.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      complaint.status === 'RESOLVED' 
                        ? 'bg-green-100 text-green-700'
                        : complaint.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/dashboard/report"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl transition-colors group"
        >
          <FiPlus className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Report New Issue</h3>
          <p className="text-blue-100 text-sm">Submit a new complaint with photos</p>
        </Link>

        <Link 
          to="/dashboard/map"
          className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl transition-colors group"
        >
          <FiMapPin className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Explore Map</h3>
          <p className="text-green-100 text-sm">View complaints in your area</p>
        </Link>

        <Link 
          to="/dashboard/notifications"
          className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl transition-colors group"
        >
          <FiCheckCircle className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold mb-1">Track Status</h3>
          <p className="text-purple-100 text-sm">Get updates on your complaints</p>
        </Link>
      </div>
    </div>
  )
}

export default UserDashboard
