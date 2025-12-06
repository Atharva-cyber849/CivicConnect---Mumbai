import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { 
  FiSearch, FiFilter, FiMapPin, FiCalendar, 
  FiEye, FiClock, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi'
import { FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { COMPLAINT_STATUS, COMPLAINT_CATEGORIES } from '../../utils/constants'

const MyComplaints = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const { data: complaintsResponse, isLoading, error } = useQuery({
    queryKey: ['userComplaints', searchTerm, statusFilter, categoryFilter],
    queryFn: () => complaintsApi.getUserComplaints(),
  })

  // Get complaints from response - handle different response formats
  let allComplaints = []
  console.log('MyComplaints - Full Response:', complaintsResponse)
  
  if (complaintsResponse) {
    // Try different response formats
    if (complaintsResponse?.results) {
      allComplaints = complaintsResponse.results
    } else if (complaintsResponse?.data?.results) {
      allComplaints = complaintsResponse.data.results
    } else if (Array.isArray(complaintsResponse?.data)) {
      allComplaints = complaintsResponse.data
    } else if (Array.isArray(complaintsResponse)) {
      allComplaints = complaintsResponse
    } else if (typeof complaintsResponse === 'object') {
      // If it's an object but not matching above patterns, try to extract array
      const values = Object.values(complaintsResponse)
      if (Array.isArray(values[0])) {
        allComplaints = values[0]
      }
    }
  }
  console.log('MyComplaints - Extracted complaints:', allComplaints, 'Count:', allComplaints.length)
  
  // Log ward field status
  if (allComplaints.length > 0) {
    console.log('First complaint ward field:', allComplaints[0].ward)
    console.log('First complaint address field:', allComplaints[0].address)
    console.log('First complaint full object:', JSON.stringify(allComplaints[0], null, 2))
  }

  // Apply client-side filtering and search
  const complaints = allComplaints.filter(complaint => {
    const matchesSearch = searchTerm === '' || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || complaint.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  }).map(complaint => {
    // Ensure ward field is populated - extract from address if missing
    if (!complaint.ward && complaint.address) {
      // Try to extract ward from address (e.g., "M/E Ward, Zone 5, Mumbai...")
      const wardMatch = complaint.address.match(/([A-Z](?:\/[A-Z])?)\s*(?:Ward|ward)/i)
      if (wardMatch) {
        complaint.ward = wardMatch[1]
      }
    }
    return complaint
  })

  const getStatusConfig = (status) => {
    const config = COMPLAINT_STATUS.find(s => s.value === status)
    return config || { label: status, color: 'gray' }
  }

  const getCategoryInfo = (category) => {
    const categoryInfo = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return categoryInfo || { label: category, icon: '📋' }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <FiClock className="w-4 h-4" />
      case 'IN_PROGRESS':
        return <FiAlertCircle className="w-4 h-4" />
      case 'RESOLVED':
        return <FiCheckCircle className="w-4 h-4" />
      default:
        return <FiClock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
        </div>
        <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="h-7 w-7" />
              </div>
              <h1 className="text-4xl font-bold">My Complaints</h1>
            </div>
            <p className="text-blue-100 text-lg ml-1">Track and manage your reported issues</p>
            <div className="flex items-center gap-2 mt-3 ml-1 text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg inline-flex">
              <TrendingUp className="h-4 w-4" />
              <span>{complaints.length} Total Issues</span>
            </div>
          </div>
          <Link
            to="/dashboard/report"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Report New Issue</span>
          </Link>
        </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters & Search</h3>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 appearance-none bg-white"
            >
              <option value="ALL">All Status</option>
              {COMPLAINT_STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 bg-white"
            >
              <option value="ALL">All Categories</option>
              {COMPLAINT_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('PENDING')}
              className="px-4 py-2 text-sm font-medium bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-all border border-yellow-200 hover:shadow-md"
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all border border-blue-200 hover:shadow-md"
            >
              Active
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-bold text-sm">Error Loading Complaints</h3>
            <p className="text-red-700 text-sm mt-1">
              {error.message || 'Failed to load complaints. Please try refreshing the page.'}
            </p>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FiMapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' 
                ? 'Try adjusting your filters or search terms.'
                : "You haven't reported any issues yet."}
            </p>
            <Link
              to="/dashboard/report"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FiMapPin className="w-5 h-5 mr-2" />
              Report Your First Issue
            </Link>
          </div>
        ) : (
          complaints.map((complaint) => {
            const statusConfig = getStatusConfig(complaint.status)
            const categoryInfo = getCategoryInfo(complaint.category)
            console.log(`Rendering complaint ${complaint.id}: ward="${complaint.ward}"`)
            
            return (
              <div
                key={complaint.id}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/dashboard/complaints/${complaint.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Complaint Image/Icon */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {complaint.image ? (
                          <img
                            src={complaint.image}
                            alt="Complaint"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{categoryInfo.icon}</span>
                        )}
                      </div>

                      {/* Complaint Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {complaint.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <span className="mr-1">{categoryInfo.icon}</span>
                            {categoryInfo.label}
                          </span>
                          <span className="flex items-center">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {complaint.ward ? `Ward ${complaint.ward}` : 'Ward Unknown'}
                          </span>
                          <span className="flex items-center">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            {formatDate(complaint.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                        ${statusConfig.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                        ${statusConfig.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {getStatusIcon(complaint.status)}
                        <span className="ml-1">{statusConfig.label}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/dashboard/complaints/${complaint.id}`)
                        }}
                        className="text-civic-blue-600 hover:text-civic-blue-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Complaint ID */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Complaint ID: <span className="font-mono font-semibold">#{complaint.id}</span>
                      </span>
                      {complaint.department && (
                        <span className="text-gray-500">
                          Dept: {complaint.department.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      {complaints.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{complaints.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {complaints.filter(c => c.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'RESOLVED').length}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyComplaints
