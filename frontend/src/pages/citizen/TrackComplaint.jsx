import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { format } from 'date-fns'
import { FiSearch, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { COMPLAINT_STATUS, COMPLAINT_CATEGORIES } from '../../utils/constants'
import { Link } from 'react-router-dom'

const TrackComplaint = () => {
  const [complaintId, setComplaintId] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [error, setError] = useState('')

  const trackMutation = useMutation({
    mutationFn: (id) => complaintAPI.getById(id),
    onSuccess: (response) => {
      setComplaint(response.data)
      setError('')
    },
    onError: (error) => {
      setComplaint(null)
      setError(error.response?.data?.detail || 'Complaint not found')
    }
  })

  const handleTrack = (e) => {
    e.preventDefault()
    if (!complaintId.trim()) {
      setError('Please enter a complaint ID')
      return
    }
    trackMutation.mutate(complaintId.trim())
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FiClock className="w-5 h-5 text-yellow-600" />
      case 'IN_PROGRESS': return <FiAlertCircle className="w-5 h-5 text-blue-600" />
      case 'RESOLVED': return <FiCheckCircle className="w-5 h-5 text-green-600" />
      default: return <FiClock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'RESOLVED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryLabel = (category) => {
    const cat = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const getStatusProgress = (status) => {
    switch (status) {
      case 'PENDING': return 33
      case 'IN_PROGRESS': return 66
      case 'RESOLVED': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔍 Track Your Complaint
          </h1>
          <p className="text-xl text-gray-600">
            Enter your complaint ID to check the current status and progress
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint ID
              </label>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    placeholder="e.g., 12345 or #12345"
                    className="pl-10 input w-full"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackMutation.isPending}
                  className="btn btn-primary px-8"
                >
                  {trackMutation.isPending ? 'Searching...' : 'Track Status'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm mt-2 p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {complaint && (
          <div className="space-y-6">
            {/* Complaint Overview */}
            <div className="card">
              <div className="flex items-start gap-6">
                {complaint.image && (
                  <img
                    src={complaint.image}
                    alt="Complaint"
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        #{complaint.id} - {complaint.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {format(new Date(complaint.created_at), 'MMM dd, yyyy')}</span>
                        <span>📍 Ward {complaint.ward}</span>
                        <span>🏢 {getCategoryLabel(complaint.category)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(complaint.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{complaint.description}</p>
                  
                  {complaint.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin className="w-4 h-4" />
                      <span className="text-sm">{complaint.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Status Timeline</h3>
              
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-600">{getStatusProgress(complaint.status)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-civic-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getStatusProgress(complaint.status)}%` }}
                  />
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-4">
                {/* Submitted */}
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Complaint Submitted</h4>
                    <p className="text-sm text-gray-600">
                      Your complaint has been received and assigned ID #{complaint.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(complaint.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {/* Under Review */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['IN_PROGRESS', 'RESOLVED'].includes(complaint.status) 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                  }`}>
                    <FiAlertCircle className={`w-4 h-4 ${
                      ['IN_PROGRESS', 'RESOLVED'].includes(complaint.status) 
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      ['IN_PROGRESS', 'RESOLVED'].includes(complaint.status) 
                        ? 'text-gray-900' 
                        : 'text-gray-500'
                    }`}>
                      Under Review
                    </h4>
                    <p className={`text-sm ${
                      ['IN_PROGRESS', 'RESOLVED'].includes(complaint.status) 
                        ? 'text-gray-600' 
                        : 'text-gray-400'
                    }`}>
                      {['IN_PROGRESS', 'RESOLVED'].includes(complaint.status)
                        ? 'Your complaint is being processed by the concerned department'
                        : 'Waiting for department assignment and review'
                      }
                    </p>
                    {complaint.status === 'IN_PROGRESS' && (
                      <p className="text-xs text-gray-500 mt-1">In progress</p>
                    )}
                  </div>
                </div>

                {/* Resolved */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    complaint.status === 'RESOLVED' 
                      ? 'bg-green-100' 
                      : 'bg-gray-100'
                  }`}>
                    <FiCheckCircle className={`w-4 h-4 ${
                      complaint.status === 'RESOLVED' 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      complaint.status === 'RESOLVED' 
                        ? 'text-gray-900' 
                        : 'text-gray-500'
                    }`}>
                      Resolved
                    </h4>
                    <p className={`text-sm ${
                      complaint.status === 'RESOLVED' 
                        ? 'text-gray-600' 
                        : 'text-gray-400'
                    }`}>
                      {complaint.status === 'RESOLVED'
                        ? 'Your complaint has been successfully resolved'
                        : 'Final resolution pending'
                      }
                    </p>
                    {complaint.status === 'RESOLVED' && complaint.updated_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(complaint.updated_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Department Info */}
            {complaint.department && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Department Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Assigned Department</h4>
                    <p className="text-gray-600">{getCategoryLabel(complaint.category)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Ward Office</h4>
                    <p className="text-gray-600">Ward {complaint.ward} - Mumbai BMC</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Link to="/auth/login" className="btn btn-primary">
                View Full Details (Login Required)
              </Link>
              <button
                onClick={() => window.open(`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`, '_blank')}
                className="btn btn-secondary flex items-center gap-2"
                disabled={!complaint.latitude || !complaint.longitude}
              >
                <FiMapPin className="w-4 h-4" />
                View Location
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center text-gray-600 text-sm">
              <p>
                Need help? Contact BMC Helpline: <strong>1916</strong> or email{' '}
                <strong>complaints@mcgm.gov.in</strong>
              </p>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!complaint && !trackMutation.isPending && complaintId && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Enter a complaint ID to track
            </h3>
            <p className="text-gray-600">
              You can find your complaint ID in the confirmation email or SMS
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackComplaint