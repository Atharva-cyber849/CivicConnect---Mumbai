import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  PhotoIcon,
  PencilIcon,
  EyeIcon,
  StarIcon,
  ShieldCheckIcon,
  FlagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import L from 'leaflet';

import { complaintsApi, complaintDetailsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../config/constants';
import { isSuperAdmin, isAdmin, isOfficer } from '../../utils/roleBasedAccess';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Role-based access control
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsAdmin = isAdmin(user);
  const userIsOfficer = isOfficer(user);
  
  const [newStatus, setNewStatus] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolutionImages, setResolutionImages] = useState([]);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('');
  const [referToDepartment, setReferToDepartment] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [showInternalNotesForm, setShowInternalNotesForm] = useState(false);
  
  // Lightbox and carousel state
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch complaint details
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsApi.getComplaintById(id),
    enabled: !!id
  });

  // Fetch complaint images
  const { data: complaintImages = [] } = useQuery({
    queryKey: ['complaint-images', id],
    queryFn: () => complaintDetailsApi.images.getAll(id),
    enabled: !!id
  });

  // Fetch complaint timeline
  const { data: complaintTimeline = [] } = useQuery({
    queryKey: ['complaint-timeline', id],
    queryFn: () => complaintDetailsApi.timeline.getAll(id),
    enabled: !!id
  });

  // Fetch complaint resolution
  const { data: complaintResolution } = useQuery({
    queryKey: ['complaint-resolution', id],
    queryFn: () => complaintDetailsApi.resolution.get(id),
    enabled: !!id
  });

  // Fetch officer notes
  const { data: officerNotesList = [] } = useQuery({
    queryKey: ['complaint-notes', id],
    queryFn: () => complaintDetailsApi.notes.getAll(id),
    enabled: !!id
  });

  // Fetch complaint attachments
  const { data: complaintAttachments = [] } = useQuery({
    queryKey: ['complaint-attachments', id],
    queryFn: () => complaintDetailsApi.attachments.getAll(id),
    enabled: !!id
  });

  // Mock complaint data for development
  const mockComplaint = {
    id: id || 1,
    title: 'Broken street light on SV Road',
    description: 'The street light outside the Municipal School has been non-functional for the past week. This creates safety concerns for pedestrians and school children during evening hours.',
    category: 'Infrastructure',
    subcategory: 'Street Lighting',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    department: 'ROADS',
    assigned_ward: 'H/W',
    citizen: {
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91 9876543210'
    },
    address: 'Outside Municipal School, SV Road, Bandra West',
    latitude: 19.0596,
    longitude: 72.8295,
    images: [
      '/api/placeholder/400/300',
      '/api/placeholder/400/300'
    ],
    attachments: [
      {name: 'location_photo.jpg', size: '2.3 MB', type: 'image/jpeg'},
      {name: 'complaint_form.pdf', size: '456 KB', type: 'application/pdf'}
    ],
    created_at: '2024-11-08T14:30:00Z',
    updated_at: '2024-11-09T10:15:00Z',
    timeline: [
      {
        status: 'SUBMITTED',
        timestamp: '2024-11-08T14:30:00Z',
        description: 'Complaint submitted by citizen',
        user: 'Priya Sharma'
      },
      {
        status: 'ACKNOWLEDGED',
        timestamp: '2024-11-08T16:45:00Z',
        description: 'Complaint acknowledged and assigned to department',
        user: 'System'
      },
      {
        status: 'IN_PROGRESS',
        timestamp: '2024-11-09T10:15:00Z',
        description: 'Field inspection completed. Parts ordered for repair.',
        user: 'Officer Patil'
      }
    ],
    officer_notes: [
      {
        id: 1,
        note: 'Visited the location. Confirmed that the street light is not working. Need to replace the LED bulb and check wiring.',
        created_by: 'Officer Patil',
        created_at: '2024-11-09T10:15:00Z'
      }
    ],
    internal_notes: [
      {
        id: 1,
        notes: 'Contractor quote received: ₹2,500 for LED replacement. Budget approval pending.',
        created_by: 'Admin Shah',
        created_at: '2024-11-09T12:30:00Z'
      },
      {
        id: 2,
        notes: 'Similar complaints in this area. Consider bulk procurement for cost efficiency.',
        created_by: 'Supervisor Kumar',
        created_at: '2024-11-09T14:15:00Z'
      }
    ]
  };

  // Normalize complaint data - ensure images is always an array
  const normalizeComplaintData = (data) => {
    if (!data) return mockComplaint;
    
    return {
      ...data,
      // Handle both 'image' (singular) and 'images' (plural) fields
      images: data.images || (data.image ? [data.image] : []),
      // Ensure other array fields exist
      attachments: data.attachments || [],
      timeline: data.timeline || [],
      officer_notes: data.officer_notes || [],
      internal_notes: data.internal_notes || []
    };
  };

  const complaintData = normalizeComplaintData(complaint) || mockComplaint;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, notes }) => 
      complaintsApi.updateComplaintStatus(id, { status, officer_notes: notes }),
    onSuccess: () => {
      toast.success('Complaint status updated successfully');
      queryClient.invalidateQueries(['complaint', id]);
      setNewStatus('');
      setOfficerNotes('');
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
      setIsUpdating(false);
    }
  });

  // Add internal notes mutation
  const addInternalNotesMutation = useMutation({
    mutationFn: (notesData) => complaintsApi.addInternalNotes(id, notesData),
    onSuccess: () => {
      toast.success('Internal notes added successfully');
      queryClient.invalidateQueries(['complaint', id]);
      setInternalNotes('');
      setShowInternalNotesForm(false);
    },
    onError: (error) => {
      toast.error('Failed to add internal notes');
    }
  });

  // Submit resolution mutation
  const submitResolutionMutation = useMutation({
    mutationFn: (resolutionData) => complaintsApi.submitResolution(id, resolutionData),
    onSuccess: () => {
      toast.success('Resolution submitted successfully');
      queryClient.invalidateQueries(['complaint', id]);
      setShowResolutionForm(false);
      setResolutionImages([]);
      setResolutionNotes('');
    },
    onError: (error) => {
      toast.error('Failed to submit resolution');
    }
  });

  // Refer to department mutation
  const referToDepartmentMutation = useMutation({
    mutationFn: (departmentData) => complaintsApi.referToDepartment(id, departmentData),
    onSuccess: () => {
      toast.success('Complaint referred successfully');
      queryClient.invalidateQueries(['complaint', id]);
      setReferToDepartment('');
    },
    onError: (error) => {
      toast.error('Failed to refer complaint');
    }
  });

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }
    
    setIsUpdating(true);
    updateStatusMutation.mutate({
      status: newStatus,
      notes: officerNotes,
      estimated_days: estimatedDays,
      assigned_to: assignedTo,
      priority: priority
    });
  };

  const handleResolutionImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setResolutionImages(prev => [...prev, ...newImages]);
  };

  const removeResolutionImage = (index) => {
    setResolutionImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitResolution = () => {
    if (resolutionImages.length === 0) {
      toast.error('Please add at least one resolution image');
      return;
    }

    submitResolutionMutation.mutate({
      notes: resolutionNotes,
      images: resolutionImages,
      status: 'RESOLVED'
    });
  };

  const handleAddInternalNotes = () => {
    if (!internalNotes.trim()) {
      toast.error('Please enter notes');
      return;
    }

    addInternalNotesMutation.mutate({
      notes: internalNotes,
      created_by: user.name
    });
  };

  const handleReferToDepartment = () => {
    if (!referToDepartment) {
      toast.error('Please select a department');
      return;
    }

    referToDepartmentMutation.mutate({
      department: referToDepartment,
      reason: officerNotes
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return ClockIcon;
      case 'IN_PROGRESS':
        return ExclamationTriangleIcon;
      case 'RESOLVED':
        return CheckCircleIcon;
      case 'REJECTED':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get card border color based on status
  const getStatusCardBorder = (status) => {
    switch (status) {
      case 'PENDING':
        return 'border-l-4 border-yellow-400';
      case 'IN_PROGRESS':
        return 'border-l-4 border-blue-400';
      case 'RESOLVED':
        return 'border-l-4 border-green-400';
      case 'REJECTED':
        return 'border-l-4 border-red-400';
      default:
        return 'border-l-4 border-gray-400';
    }
  };

  // Check role-based access
  const canViewComplaint = userIsSuperAdmin || userIsAdmin || userIsOfficer;
  
  // Check if user can view this specific complaint (super admin sees all, admin sees own department, officer sees own ward)
  const canAccessThisComplaint = useMemo(() => {
    if (!complaintData) return false;
    if (userIsSuperAdmin) return true;
    if (userIsAdmin && complaintData.department === user?.department) return true;
    if (userIsOfficer && complaintData.assigned_ward === user?.assigned_ward) return true;
    return false;
  }, [complaintData, userIsSuperAdmin, userIsAdmin, userIsOfficer, user?.department, user?.assigned_ward]);
  
  // Check if user can edit this complaint based on role
  const canEditComplaint = useMemo(() => {
    if (!canAccessThisComplaint) return false;
    if (userIsSuperAdmin) return true;
    if (userIsAdmin && complaintData?.department === user?.department) return true;
    if (userIsOfficer && complaintData?.assigned_officer === user?.id) return true;
    return false;
  }, [complaintData, userIsSuperAdmin, userIsAdmin, userIsOfficer, user?.department, user?.id, canAccessThisComplaint]);

  if (!canViewComplaint) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this complaint.
          </p>
        </div>
      </div>
    );
  }

  if (!canAccessThisComplaint) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Restricted</h2>
          <p className="mt-2 text-sm text-gray-600">
            This complaint is not in your department or ward.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-200 h-96 rounded"></div>
            <div className="bg-gray-200 h-96 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Error Loading Complaint</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error.response?.data?.message || 'Failed to load complaint details'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-white rounded-lg shadow-md p-8 ${getStatusCardBorder(complaintData.status)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center flex-1">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="text-[#0078D7] hover:text-blue-800 mr-4 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Complaint #{complaintData.id}
              </h1>
              <p className="text-gray-600 mt-2 text-base">{complaintData.title}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(complaintData.status)}`}>
            {React.createElement(getStatusIcon(complaintData.status), { 
              className: 'h-5 w-5 mr-2' 
            })}
            {complaintData.status.replace('_', ' ')}
          </span>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(complaintData.priority)}`}>
            {complaintData.priority} Priority
          </span>
          <span className="text-xs text-gray-500 ml-auto">
            Created: {new Date(complaintData.created_at).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Details */}
        <div className="space-y-6">
          {/* Complaint Image Carousel */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Complaint Images
            </h3>
            {complaintImages && complaintImages.length > 0 ? (
              <div className="space-y-4">
                {/* Main Carousel */}
                <div className="relative group overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={complaintImages[currentImageIndex]?.image}
                    alt={`Complaint ${currentImageIndex + 1}`}
                    className="w-full h-80 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowLightbox(true)}
                  />
                  {/* Overlay with info */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <EyeIcon className="h-12 w-12 text-white mx-auto mb-2" />
                      <p className="text-white text-sm font-medium">Click to view full size</p>
                    </div>
                  </div>
                  {/* Image counter */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {complaintImages.length}
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? complaintImages.length - 1 : prev - 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Thumbnail strip */}
                  <div className="flex-1 mx-4 flex gap-2 overflow-x-auto pb-2">
                    {complaintImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-[#0078D7] shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={image.image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === complaintImages.length - 1 ? 0 : prev + 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No images uploaded for this complaint</p>
              </div>
            )}
          </div>

          {/* Lightbox Modal */}
          {showLightbox && complaintImages && complaintImages.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
              <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* Close button */}
                <button
                  onClick={() => setShowLightbox(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>

                {/* Main image */}
                <div className="relative max-w-4xl max-h-[90vh] flex items-center">
                  <img
                    src={complaintImages[currentImageIndex]?.image}
                    alt={`Complaint ${currentImageIndex + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                </div>

                {/* Navigation buttons */}
                {complaintImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? complaintImages.length - 1 : prev - 1))}
                      className="absolute left-4 p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all"
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === complaintImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 p-3 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-all"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {complaintImages.length}
                </div>
              </div>
            </div>
          )}

          {/* Citizen Information */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Citizen Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  {complaintData.citizen?.first_name || complaintData.citizen_name || 'Anonymous'} {complaintData.citizen?.last_name || ''}
                </span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3" />
                <a 
                  href={`mailto:${complaintData.citizen?.email || complaintData.email || ''}`}
                  className="text-[#0078D7] hover:text-blue-800"
                >
                  {complaintData.citizen?.email || complaintData.email || 'N/A'}
                </a>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-gray-400 mr-3" />
                <a 
                  href={`tel:${complaintData.citizen?.phone || complaintData.phone || ''}`}
                  className="text-[#0078D7] hover:text-blue-800"
                >
                  {complaintData.citizen?.phone || complaintData.phone || 'N/A'}
                </a>
              </div>
            </div>
          </div>

          {/* Complaint Description */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Description
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#0078D7]">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{complaintData.description}</p>
            </div>
          </div>

          {/* Attachments */}
          {complaintData.attachments && complaintData.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PaperClipIcon className="h-5 w-5 text-[#0078D7] mr-2" />
                Attachments
              </h3>
              <div className="space-y-2">
                {complaintData.attachments && complaintData.attachments.length > 0 ? (
                  complaintData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <PaperClipIcon className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({file.size})</span>
                        </div>
                      </div>
                      <button className="text-[#0078D7] hover:text-blue-800 text-sm">
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No attachments available</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map & Metadata */}
        <div className="space-y-6">
          {/* Location Map */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Location
            </h3>
            <div className="space-y-4">
              <div className="h-64 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <MapContainer
                  center={[complaintData.latitude, complaintData.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[complaintData.latitude, complaintData.longitude]}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{complaintData.title}</strong><br />
                        {complaintData.address}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(complaintData.address)}/@${complaintData.latitude},${complaintData.longitude},16z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors border border-blue-200"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                  Open in Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${complaintData.latitude},${complaintData.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors border border-green-200"
                >
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </div>

              {/* Address display */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Location Address</p>
                <p className="text-sm text-gray-700">{complaintData.address}</p>
              </div>
            </div>
          </div>

          {/* Complaint Metadata */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Complaint Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="flex items-center mt-1">
                    <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{complaintData.category}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subcategory</label>
                  <p className="text-gray-900 mt-1">{complaintData.subcategory}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <div className="flex items-center mt-1">
                    <BuildingOffice2Icon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {DEPARTMENTS.find(d => d.id === complaintData.department)?.name || complaintData.department}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ward</label>
                  <p className="text-gray-900 mt-1">{complaintData.assigned_ward}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="flex items-center mt-1">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {new Date(complaintData.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(complaintData.updated_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ClockIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Status Timeline
            </h3>
            <div className="space-y-0">
              {complaintData.timeline && complaintData.timeline.length > 0 ? (
                complaintData.timeline.map((event, index) => (
                  <div key={index} className="flex pb-6 relative">
                    {/* Vertical line */}
                    {index < complaintData.timeline.length - 1 && (
                      <div className="absolute left-3 top-8 w-0.5 h-12 bg-gradient-to-b from-[#0078D7] to-gray-200"></div>
                    )}
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                      index === 0 ? 'bg-[#0078D7] text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                    {/* Timeline content */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">{event.status}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">by {event.user}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No timeline events available</p>
              )}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300 border-t-4 border-[#FF9E00]">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PencilIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
              Update Status
            </h3>
            
            <div className="space-y-5">
              {/* Primary Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-[#0078D7] transition-all"
                  >
                    <option value="">Select Status</option>
                    <option value="IN_PROGRESS">🔄 In Progress</option>
                    <option value="RESOLVED">✓ Resolved</option>
                    <option value="REJECTED">✗ Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-[#0078D7] transition-all"
                  >
                    <option value="">Keep Current</option>
                    <option value="HIGH">🔴 High</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="LOW">🟢 Low</option>
                  </select>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Est. Resolution (Days)</label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-[#0078D7] transition-all"
                    placeholder="e.g., 3"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To Officer</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-[#0078D7] transition-all"
                  >
                    <option value="">Select Officer</option>
                    <option value="officer1">Officer Patil</option>
                    <option value="officer2">Officer Sharma</option>
                    <option value="officer3">Officer Singh</option>
                  </select>
                </div>
              </div>
              
              {/* Notes Section */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#FF9E00]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Public Update Notes</label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#0078D7] focus:border-[#0078D7] transition-all"
                  placeholder="Add notes that will be visible to the citizen..."
                />
                <p className="text-xs text-gray-500 mt-2">These notes will be sent to the citizen as an update.</p>
              </div>
              
              {/* Action Buttons - Role-Based Restrictions */}
              {canEditComplaint ? (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || !newStatus}
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-[#0078D7] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D7] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Update Status
                      </>
                    )}
                  </button>
                  
                  {newStatus === 'RESOLVED' && (
                    <button
                      onClick={() => setShowResolutionForm(true)}
                      className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-green-600 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-all"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Add Resolution Proof
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  <p className="text-sm flex items-center">
                    <ExclamationIcon className="h-4 w-4 mr-2" />
                    You don't have permission to edit this complaint.
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Resolution Form */}
          {showResolutionForm && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                Submit Resolution Proof
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Images *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <label className="cursor-pointer block text-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload before/after photos
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleResolutionImageUpload(e.target.files)}
                      />
                    </label>
                  </div>
                  
                  {resolutionImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {resolutionImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={`Resolution ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            onClick={() => removeResolutionImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolution Notes</label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe the resolution and any follow-up required..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitResolution}
                    disabled={resolutionImages.length === 0 || submitResolutionMutation.isLoading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitResolutionMutation.isLoading ? 'Submitting...' : 'Submit Resolution'}
                  </button>
                  <button
                    onClick={() => setShowResolutionForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Department Referral */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BuildingOffice2Icon className="h-5 w-5 text-purple-600 mr-2" />
              Refer to Department
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Department</label>
                <select
                  value={referToDepartment}
                  onChange={(e) => setReferToDepartment(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleReferToDepartment}
                disabled={!referToDepartment || referToDepartmentMutation.isLoading}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {referToDepartmentMutation.isLoading ? 'Referring...' : 'Refer Complaint'}
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <EyeIcon className="h-5 w-5 text-orange-600 mr-2" />
                Internal Notes (Admin Only)
              </h3>
              <button
                onClick={() => setShowInternalNotesForm(!showInternalNotesForm)}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium"
              >
                Add Note
              </button>
            </div>
            
            {showInternalNotesForm && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Add internal notes (not visible to citizen)..."
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleAddInternalNotes}
                    disabled={!internalNotes.trim() || addInternalNotesMutation.isLoading}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => {
                      setShowInternalNotesForm(false)
                      setInternalNotes('')
                    }}
                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {complaintData.internal_notes && complaintData.internal_notes.length > 0 ? (
                complaintData.internal_notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{note.created_by}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{note.notes}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">No internal notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Officer Notes Section */}
      {complaintData.officer_notes && complaintData.officer_notes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#0078D7] mr-2" />
            Officer Notes
          </h3>
          <div className="space-y-4">
            {complaintData.officer_notes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{note.created_by}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-gray-700">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;