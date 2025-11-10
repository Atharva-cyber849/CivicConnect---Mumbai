import React, { useState } from 'react';
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
  FlagIcon
} from '@heroicons/react/24/outline';
import L from 'leaflet';

import { complaintsApi } from '../../api/complaintsApi';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../config/constants';

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

  // Fetch complaint details
  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsApi.getComplaintById(id),
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

  const complaintData = complaint || mockComplaint;

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
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-[#0078D7] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="text-[#0078D7] hover:text-blue-800 mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Complaint #{complaintData.id}
              </h1>
              <p className="text-gray-600 mt-1">{complaintData.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaintData.status)}`}>
              {React.createElement(getStatusIcon(complaintData.status), { 
                className: 'h-4 w-4 mr-1' 
              })}
              {complaintData.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaintData.priority)}`}>
              {complaintData.priority} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Details */}
        <div className="space-y-6">
          {/* Complaint Image */}
          {complaintData.images && complaintData.images.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PhotoIcon className="h-5 w-5 text-[#0078D7] mr-2" />
                Complaint Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaintData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Complaint ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citizen Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Citizen Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  {complaintData.citizen.first_name} {complaintData.citizen.last_name}
                </span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3" />
                <a 
                  href={`mailto:${complaintData.citizen.email}`}
                  className="text-[#0078D7] hover:text-blue-800"
                >
                  {complaintData.citizen.email}
                </a>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-gray-400 mr-3" />
                <a 
                  href={`tel:${complaintData.citizen.phone}`}
                  className="text-[#0078D7] hover:text-blue-800"
                >
                  {complaintData.citizen.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Complaint Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed">{complaintData.description}</p>
          </div>

          {/* Attachments */}
          {complaintData.attachments && complaintData.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PaperClipIcon className="h-5 w-5 text-[#0078D7] mr-2" />
                Attachments
              </h3>
              <div className="space-y-2">
                {complaintData.attachments.map((file, index) => (
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Map & Metadata */}
        <div className="space-y-6">
          {/* Location Map */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Location
            </h3>
            <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
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
            <p className="text-sm text-gray-600 mt-2">{complaintData.address}</p>
          </div>

          {/* Complaint Metadata */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Complaint Details</h3>
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 text-[#0078D7] mr-2" />
              Status Timeline
            </h3>
            <div className="space-y-4">
              {complaintData.timeline.map((event, index) => (
                <div key={index} className="flex items-start">
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    index === 0 ? 'bg-[#0078D7]' : 'bg-gray-300'
                  }`}></div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{event.status}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">by {event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PencilIcon className="h-5 w-5 text-[#FF9E00] mr-2" />
              Update Status
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0078D7] focus:border-[#0078D7]"
                  >
                    <option value="">Select Status</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0078D7] focus:border-[#0078D7]"
                  >
                    <option value="">Keep Current</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Resolution (Days)</label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0078D7] focus:border-[#0078D7]"
                    placeholder="e.g., 3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign To</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0078D7] focus:border-[#0078D7]"
                  >
                    <option value="">Select Officer</option>
                    <option value="officer1">Officer Patil</option>
                    <option value="officer2">Officer Sharma</option>
                    <option value="officer3">Officer Singh</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Public Update Notes</label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#0078D7] focus:border-[#0078D7]"
                  placeholder="Add notes that will be visible to the citizen..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || !newStatus}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0078D7] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0078D7] disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </button>
                
                {newStatus === 'RESOLVED' && (
                  <button
                    onClick={() => setShowResolutionForm(true)}
                    className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                  >
                    Add Resolution Proof
                  </button>
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

      {/* Performance Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <StarIcon className="h-5 w-5 text-purple-600 mr-2" />
          Performance Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">2.5h</div>
            <div className="text-sm text-gray-600">Response Time</div>
            <div className="text-xs text-green-600 mt-1">✓ Within SLA</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">4d</div>
            <div className="text-sm text-gray-600">Age</div>
            <div className="text-xs text-orange-600 mt-1">Target: 7d</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
            <div className="text-sm text-gray-600">Dept. Efficiency</div>
            <div className="text-xs text-gray-500 mt-1">This month</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">4.2/5</div>
            <div className="text-sm text-gray-600">Avg. Rating</div>
            <div className="text-xs text-gray-500 mt-1">Category avg</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Risk Assessment</h4>
            <span className="flex items-center text-orange-600">
              <FlagIcon className="h-4 w-4 mr-1" />
              Medium Risk
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Escalation probability</span>
              <span className="font-medium">32%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Media attention risk</span>
              <span className="font-medium">Low</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Similar complaints (30d)</span>
              <span className="font-medium">3 nearby</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;