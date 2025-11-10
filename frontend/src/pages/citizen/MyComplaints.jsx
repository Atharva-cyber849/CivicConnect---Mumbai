import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { 
  FiSearch, FiFilter, FiMapPin, FiCalendar, 
  FiEye, FiClock, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi'
import { COMPLAINT_STATUS, COMPLAINT_CATEGORIES } from '../../utils/constants'

const MyComplaints = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const { data: complaintsResponse, isLoading } = useQuery({
    queryKey: ['userComplaints', searchTerm, statusFilter, categoryFilter],
    queryFn: () => complaintAPI.getAll({
      search: searchTerm,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined
    }),
  })

  const complaints = complaintsResponse?.data?.results || []

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-600 mt-1">Track and manage your reported issues</p>
        </div>
        <Link
          to="/dashboard/report"
          className="bg-civic-blue-600 hover:bg-civic-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          + Report New Issue
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by ID or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 appearance-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500"
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
              className="px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Active
            </button>
          </div>
        </div>
      </div>

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
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' 
                ? 'Try adjusting your filters or search terms.'
                : "You haven't reported any issues yet."}
            </p>
            <Link
              to="/dashboard/report"
              className="inline-flex items-center px-6 py-3 bg-civic-blue-600 text-white rounded-lg hover:bg-civic-blue-700 font-semibold"
            >
              <FiMapPin className="w-5 h-5 mr-2" />
              Report Your First Issue
            </Link>
          </div>
        ) : (
          complaints.map((complaint) => {
            const statusConfig = getStatusConfig(complaint.status)
            const categoryInfo = getCategoryInfo(complaint.category)
            
            return (
              <div
                key={complaint.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
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
                            Ward {complaint.ward || 'Unknown'}
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
