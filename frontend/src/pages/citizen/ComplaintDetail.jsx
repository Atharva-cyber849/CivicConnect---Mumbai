import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complaintsApi } from '../../api/complaintsApi'
import { useAuth } from '../../context/AuthContext'
import { 
  COMPLAINT_STATUS, 
  PRIORITY_LEVELS, 
  COMPLAINT_CATEGORIES,
  BMC_DEPARTMENTS 
} from '../../utils/constants'
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFlag,
  FiSend,
  FiImage,
  FiDownload,
  FiShare2,
  FiThumbsUp,
  FiThumbsDown,
  FiStar,
  FiHeart,
  FiEye,
  FiCamera,
  FiPaperclip,
  FiZoomIn,
  FiExternalLink,
  FiRefreshCw,
  FiTrendingUp
} from 'react-icons/fi'

const ComplaintDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newUpdate, setNewUpdate] = useState('')
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [updateImages, setUpdateImages] = useState([])
  const [attachments, setAttachments] = useState([])
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  // Fetch complaint details
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsApi.getComplaintById(id),
    enabled: !!id,
  })

  // Add update mutation
  const addUpdateMutation = useMutation({
    mutationFn: (updateData) => complaintAPI.addUpdate(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint', id])
      setNewUpdate('')
      setShowUpdateForm(false)
      setUpdateImages([])
      setAttachments([])
    },
  })

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: (feedbackData) => complaintsApi.submitFeedback(id, feedbackData),
    onSuccess: () => {
      queryClient.invalidateQueries(['complaint', id])
      setRating(0)
      setFeedback('')
      setShowFeedbackForm(false)
    },
  })

  const handleAddUpdate = (e) => {
    e.preventDefault()
    if (newUpdate.trim()) {
      const updateData = {
        message: newUpdate,
        images: updateImages,
        attachments: attachments
      }
      addUpdateMutation.mutate(updateData)
    }
  }

  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => {
      return {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }
    })
    setUpdateImages(prev => [...prev, ...newImages])
  }

  const handleAttachmentUpload = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeImage = (index) => {
    setUpdateImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    if (rating > 0) {
      submitFeedbackMutation.mutate({
        rating,
        feedback: feedback.trim()
      })
    }
  }

  const getStatusConfig = (status) => {
    const config = COMPLAINT_STATUS.find(s => s.value === status)
    return config || { label: status, color: 'gray' }
  }

  const getPriorityConfig = (priority) => {
    const config = PRIORITY_LEVELS.find(p => p.value === priority)
    return config || { label: priority, color: 'gray' }
  }

  const getCategoryInfo = (category) => {
    const categoryInfo = COMPLAINT_CATEGORIES.find(c => c.value === category)
    return categoryInfo || { label: category, icon: '📋' }
  }

  const getDepartmentInfo = (departmentName) => {
    const deptInfo = BMC_DEPARTMENTS.find(d => 
      d.label.toLowerCase().includes(departmentName?.toLowerCase() || '')
    )
    return deptInfo || { label: departmentName || 'Unknown', icon: '📋' }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <FiClock className="w-5 h-5" />
      case 'IN_PROGRESS':
        return <FiAlertCircle className="w-5 h-5" />
      case 'RESOLVED':
        return <FiCheckCircle className="w-5 h-5" />
      case 'REJECTED':
        return <FiXCircle className="w-5 h-5" />
      default:
        return <FiClock className="w-5 h-5" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSince = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks} weeks ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Complaint Not Found
            </h2>
            <p className="text-gray-600">
              The complaint you're looking for could not be found or you don't have permission to view it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(complaint?.status)
  const priorityConfig = getPriorityConfig(complaint?.priority)
  const categoryInfo = getCategoryInfo(complaint?.category)
  const departmentInfo = getDepartmentInfo(complaint?.department?.name)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Complaints
          </button>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <FiShare2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <FiDownload className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {complaint.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      Created {getTimeSince(complaint.created_at)}
                    </span>
                    <span>#{complaint.id}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                    ${statusConfig.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                    ${statusConfig.color === 'red' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {getStatusIcon(complaint.status)}
                    <span className="ml-1">{statusConfig.label}</span>
                  </span>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              {/* Complaint Image */}
              {complaint.image && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiImage className="w-5 h-5 mr-2" />
                    Original Evidence
                  </h4>
                  <div className="relative group cursor-pointer" onClick={() => {
                    setSelectedImage(complaint.image)
                    setShowImageModal(true)
                  }}>
                    <img
                      src={complaint.image}
                      alt="Complaint evidence"
                      className="rounded-lg max-w-full h-auto shadow-sm group-hover:shadow-md transition-shadow"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all">
                      <FiZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Evidence */}
              {complaint.status === 'RESOLVED' && complaint.resolution_images && complaint.resolution_images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiCheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Resolution Evidence
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {complaint.resolution_images.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => {
                        setSelectedImage(image.url)
                        setShowImageModal(true)
                      }}>
                        <img
                          src={image.url}
                          alt={`Resolution ${index + 1}`}
                          className="rounded-lg w-full h-48 object-cover shadow-sm group-hover:shadow-md transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all">
                          <FiZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {image.caption || `After ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Before/After Comparison */}
              {complaint.status === 'RESOLVED' && complaint.image && complaint.resolution_images && complaint.resolution_images.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FiRefreshCw className="w-5 h-5 mr-2 text-blue-600" />
                    Before & After Comparison
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <img
                        src={complaint.image}
                        alt="Before"
                        className="rounded-lg w-full h-48 object-cover shadow-sm"
                      />
                      <div className="absolute bottom-2 left-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                        Before
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={complaint.resolution_images[0].url}
                        alt="After"
                        className="rounded-lg w-full h-48 object-cover shadow-sm"
                      />
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <FiMapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p className="text-gray-700 text-sm mt-1">
                    {complaint.address}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {complaint.city}, {complaint.state} {complaint.zip_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Updates Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiMessageSquare className="w-5 h-5 mr-2" />
                  Updates & Comments
                </h3>
                
                {complaint && user && user.id === complaint.user?.id && (
                  <button
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add Update
                  </button>
                )}
              </div>

              {/* Add Update Form */}
              {showUpdateForm && (
                <form onSubmit={handleAddUpdate} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <textarea
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    placeholder="Add an update or question about this complaint..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  
                  {/* Image Upload */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Photos (Optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <FiCamera className="w-4 h-4 mr-2" />
                        <span className="text-sm text-gray-700">Add Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files)}
                        />
                      </label>
                      
                      <label className="cursor-pointer flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <FiPaperclip className="w-4 h-4 mr-2" />
                        <span className="text-sm text-gray-700">Add Files</span>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleAttachmentUpload(e.target.files)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preview Images */}
                  {updateImages.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-3 gap-2">
                        {updateImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Attachments */}
                  {attachments.length > 0 && (
                    <div className="mt-3">
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center">
                              <FiPaperclip className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiXCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end space-x-3 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateForm(false)
                        setUpdateImages([])
                        setAttachments([])
                        setNewUpdate('')
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newUpdate.trim() || addUpdateMutation.isLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <FiSend className="w-4 h-4 mr-2" />
                      {addUpdateMutation.isLoading ? 'Posting...' : 'Post Update'}
                    </button>
                  </div>
                </form>
              )}

              {/* Updates List */}
              <div className="space-y-4">
                {complaint.updates && complaint.updates.length > 0 ? (
                  complaint.updates.map((update, index) => (
                    <div key={update.id} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {update.user.first_name} {update.user.last_name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(update.created_at)}
                          </span>
                          {update.new_status && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Status changed to {update.new_status.replace('_', ' ').toLowerCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {update.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No updates yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Section for Resolved Complaints */}
            {complaint.status === 'RESOLVED' && !complaint.feedback && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FiStar className="w-5 h-5 mr-2 text-orange-500" />
                    Rate This Resolution
                  </h3>
                </div>

                {!showFeedbackForm ? (
                  <div className="text-center py-8">
                    <FiHeart className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Your complaint has been resolved!
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Help us improve by rating the resolution quality
                    </p>
                    <button
                      onClick={() => setShowFeedbackForm(true)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Rate Resolution
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How satisfied are you with the resolution?
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <FiStar className={star <= rating ? 'fill-current' : ''} />
                          </button>
                        ))}
                        <span className="ml-3 text-sm text-gray-600">
                          {rating > 0 && (
                            rating === 1 ? 'Poor' :
                            rating === 2 ? 'Fair' :
                            rating === 3 ? 'Good' :
                            rating === 4 ? 'Very Good' : 'Excellent'
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Share your experience or suggestions for improvement..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowFeedbackForm(false)
                          setRating(0)
                          setFeedback('')
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={rating === 0 || submitFeedbackMutation.isLoading}
                        className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {submitFeedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Display Existing Feedback */}
            {complaint.feedback && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiStar className="w-5 h-5 mr-2 text-orange-500" />
                  Your Feedback
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= complaint.feedback.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        ({complaint.feedback.rating}/5)
                      </span>
                    </div>
                  </div>
                  {complaint.feedback.comment && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Comment:</span>
                      <p className="text-gray-600 mt-1">{complaint.feedback.comment}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Submitted on {formatDate(complaint.feedback.created_at)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Complaint Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="flex items-center mt-1">
                    <span className="text-lg mr-2">{categoryInfo.icon}</span>
                    <span className="text-gray-900">{categoryInfo.label}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="flex items-center mt-1">
                    <FiFlag className={`w-4 h-4 mr-2 
                      ${priorityConfig.color === 'red' ? 'text-red-500' : ''}
                      ${priorityConfig.color === 'orange' ? 'text-orange-500' : ''}
                      ${priorityConfig.color === 'yellow' ? 'text-yellow-500' : ''}
                      ${priorityConfig.color === 'gray' ? 'text-gray-500' : ''}
                    `} />
                    <span className="text-gray-900">{priorityConfig.label}</span>
                  </div>
                </div>

                {complaint.department && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <div className="flex items-center mt-1">
                      <span className="text-lg mr-2">{departmentInfo.icon}</span>
                      <span className="text-gray-900">{complaint.department.name}</span>
                    </div>
                  </div>
                )}

                {complaint.assigned_to && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <div className="flex items-center mt-1">
                      <FiUser className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">
                        {complaint.assigned_to.first_name} {complaint.assigned_to.last_name}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900 text-sm mt-1">
                    {formatDate(complaint.created_at)}
                  </p>
                </div>

                {complaint.updated_at !== complaint.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900 text-sm mt-1">
                      {formatDate(complaint.updated_at)}
                    </p>
                  </div>
                )}

                {complaint.resolved_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Resolved</label>
                    <p className="text-gray-900 text-sm mt-1">
                      {formatDate(complaint.resolved_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reported By */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reported By
              </h3>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {complaint.user.first_name} {complaint.user.last_name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {complaint.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {complaint.ai_category && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Analysis
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Predicted Category</label>
                    <p className="text-gray-900 text-sm mt-1">{complaint.ai_category}</p>
                  </div>
                  
                  {complaint.ai_confidence_score && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Confidence</label>
                      <div className="mt-1">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${complaint.ai_confidence_score * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {Math.round(complaint.ai_confidence_score * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => {
                setShowImageModal(false)
                setSelectedImage(null)
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <FiXCircle className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
              <p className="text-sm">Click outside or press ESC to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tracking */}
      {complaint.metrics && (
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Resolution Performance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {complaint.metrics.response_time_hours}h
                </div>
                <div className="text-sm text-gray-600">Response Time</div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {complaint.category_sla?.response_hours || 24}h
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {complaint.metrics.resolution_time_days}d
                </div>
                <div className="text-sm text-gray-600">Resolution Time</div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {complaint.category_sla?.resolution_days || 7}d
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {complaint.metrics.citizen_satisfaction || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Satisfaction</div>
                <div className="text-xs text-gray-500 mt-1">
                  Average rating
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Department Efficiency</span>
                <span className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${complaint.metrics.department_efficiency || 0}%` }}
                    ></div>
                  </div>
                  {complaint.metrics.department_efficiency || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintDetail
