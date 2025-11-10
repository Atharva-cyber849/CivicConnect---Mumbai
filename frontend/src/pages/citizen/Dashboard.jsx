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
  console.log('🎯 Dashboard component rendering...')
  
  const { data: complaints, isLoading, error } = useQuery({
    queryKey: ['userComplaints'],
    queryFn: async () => {
      try {
        console.log('📡 Fetching user complaints...')
        return await complaintsApi.getUserComplaints()
      } catch (err) {
        console.error('❌ Error fetching complaints:', err)
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
        console.log('📡 Fetching user stats...')
        return await complaintsApi.getUserStats()
      } catch (err) {
        console.error('❌ Error fetching stats:', err)
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

  // Log current state
  console.log('📊 Dashboard state:', { isLoading, statsLoading, error, hasComplaints: !!complaints })
  
  // Show loading state
  if (isLoading || statsLoading) {
    console.log('⏳ Showing loading state...')
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
  console.log('✅ Dashboard rendering with data. Complaints count:', complaintsList.length)
  
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100 text-lg">
              Track your complaints and help improve Mumbai together
            </p>
          </div>
          <Link 
            to="/dashboard/report"
            className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Complaints</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.pending}</h3>
              <p className="text-sm text-gray-500 mt-1">Awaiting action</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
              <h3 className="text-3xl font-bold text-blue-600">{stats.inProgress}</h3>
              <p className="text-sm text-gray-500 mt-1">Being resolved</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Resolved</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.resolved}</h3>
              <p className="text-sm text-gray-500 mt-1">Successfully closed</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Status</h3>
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
