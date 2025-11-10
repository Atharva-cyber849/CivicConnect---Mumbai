import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'
import { CheckCircle, XCircle, Clock, User, Building, Mail, Phone, FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminRegistrationRequests = () => {
  const { user, token } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    fetchRegistrationRequests()
  }, [])

  const fetchRegistrationRequests = async () => {
    try {
      const data = await authApi.getAdminRequests()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error fetching registration requests:', error)
      toast.error('Failed to load registration requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    setProcessingRequest(requestId)
    try {
      const data = await authApi.approveAdminRequest(requestId)
      toast.success(data.message)
      fetchRegistrationRequests() // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error(error.response?.data?.error || 'Failed to approve request')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setProcessingRequest(selectedRequest.id)
    try {
      const data = await authApi.rejectAdminRequest(selectedRequest.id, rejectionReason)
      toast.success(data.message)
      fetchRegistrationRequests() // Refresh the list
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error(error.response?.data?.error || 'Failed to reject request')
    } finally {
      setProcessingRequest(null)
    }
  }

  const openRejectModal = (request) => {
    setSelectedRequest(request)
    setShowRejectModal(true)
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
    setRejectionReason('')
    setSelectedRequest(null)
  }

  if (!user || user.role !== 'ADMIN' || !user.is_superuser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Only Super Administrators can view registration requests.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading registration requests...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Registration Requests</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{requests.length} pending requests</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All admin registration requests have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      {request.requested_role === 'ADMIN' ? (
                        <Building className="h-5 w-5 text-blue-600" />
                      ) : (
                        <User className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        Requesting: {request.requested_role === 'ADMIN' ? 'Department Administrator' : 'Ward Officer'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{request.email}</span>
                    </div>
                    {request.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{request.phone}</span>
                      </div>
                    )}
                    {request.department && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{request.department}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.justification && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Justification:</span>
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {request.justification}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processingRequest === request.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingRequest === request.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span>Approve</span>
                  </button>
                  
                  <button
                    onClick={() => openRejectModal(request)}
                    disabled={processingRequest === request.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Registration Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedRequest?.full_name}'s registration request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeRejectModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingRequest === selectedRequest?.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {processingRequest === selectedRequest?.id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRegistrationRequests