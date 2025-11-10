import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import {
  validateComplaintForm,
  validateImageFile,
  validateAudioFile,
  standardizeAddress,
  standardizeWardData
} from '../../utils/validation';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CameraIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  MicrophoneIcon,
  StopIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { complaintsApi } from '../../api/complaintsApi';

const MobileComplaintForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    images: [],
    location: {
      address: '',
      latitude: null,
      longitude: null,
      ward: '',
      ward_name: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip_code: ''
    },
    priority: 'MEDIUM',
    contactMethod: 'email'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  const steps = [
    {
      title: 'Category',
      icon: DocumentTextIcon,
      description: 'What type of issue?'
    },
    {
      title: 'Details',
      icon: DocumentTextIcon,
      description: 'Describe the problem'
    },
    {
      title: 'Evidence',
      icon: PhotoIcon,
      description: 'Add photos/audio'
    },
    {
      title: 'Location',
      icon: MapPinIcon,
      description: 'Where is this issue?'
    },
    {
      title: 'Review',
      icon: CheckCircleIcon,
      description: 'Confirm and submit'
    }
  ];

  const categories = [
    { id: 'POTHOLE', name: 'Pothole', icon: '�️', color: 'bg-red-100 text-red-800' },
    { id: 'STREETLIGHT', name: 'Street Light', icon: '�', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'GARBAGE', name: 'Garbage/Waste', icon: '🗑️', color: 'bg-green-100 text-green-800' },
    { id: 'WATER', name: 'Water Supply', icon: '💧', color: 'bg-blue-100 text-blue-800' },
    { id: 'SEWAGE', name: 'Sewage', icon: '�', color: 'bg-brown-100 text-brown-800' },
    { id: 'ROAD_DAMAGE', name: 'Road Damage', icon: '🛣️', color: 'bg-orange-100 text-orange-800' },
    { id: 'TRAFFIC_SIGNAL', name: 'Traffic Signal', icon: '🚦', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'PARK', name: 'Park/Recreation', icon: '🌳', color: 'bg-green-100 text-green-800' },
    { id: 'NOISE', name: 'Noise Pollution', icon: '�', color: 'bg-purple-100 text-purple-800' },
    { id: 'OTHER', name: 'Other', icon: '📝', color: 'bg-gray-100 text-gray-800' }
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800', description: 'Non-urgent' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', description: 'Moderate impact' },
    { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800', description: 'Urgent attention needed' }
  ];

  const submitMutation = useMutation({
    mutationFn: (data) => complaintsApi.createComplaint(data),
    onSuccess: () => {
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard/complaints');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    }
  });

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    try {
      setIsAddressLoading(true);
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Get location details from our backend geocoding service
      const response = await complaintsApi.reverseGeocode(latitude, longitude);

      if (!response.ward) {
        throw new Error('Location is outside Mumbai municipal boundaries');
      }

      const standardizedAddress = standardizeAddress(response.full_address);
      const standardizedWard = standardizeWardData(response.ward);

      setFormData(prev => ({
        ...prev,
        location: {
          address: standardizedAddress,
          latitude,
          longitude,
          ward: standardizedWard,
          ward_name: response.ward_name,
          city: response.address_components.city,
          state: response.address_components.state,
          zip_code: response.address_components.postcode || ''
        }
      }));

      setFormErrors(prev => ({
        ...prev,
        location: undefined,
        ward: undefined
      }));

      toast.success('Location and address details captured!');
    } catch (error) {
      console.error('Location error:', error);
      toast.error(error.message || 'Could not get your location details');
      setFormErrors(prev => ({
        ...prev,
        location: error.message
      }));
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Debounced address validation
  const validateAddress = useCallback(
    debounce(async (address) => {
      if (!address) return;

      try {
        setIsAddressLoading(true);
        // Use geocoding service to validate and standardize address
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)},Mumbai`
        );
        const results = await response.json();

        if (results.length === 0) {
          setFormErrors(prev => ({
            ...prev,
            location: 'Could not verify this address'
          }));
          return;
        }

        const { lat, lon } = results[0];
        
        // Verify if the location is within Mumbai
        const geocodeResponse = await complaintsApi.reverseGeocode(lat, lon);
        
        if (!geocodeResponse.ward) {
          setFormErrors(prev => ({
            ...prev,
            location: 'Address must be within Mumbai municipal boundaries'
          }));
          return;
        }

        const standardizedAddress = standardizeAddress(address);
        const standardizedWard = standardizeWardData(geocodeResponse.ward);

        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: standardizedAddress,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            ward: standardizedWard,
            ward_name: geocodeResponse.ward_name,
            zip_code: geocodeResponse.address_components.postcode || ''
          }
        }));

        setFormErrors(prev => ({
          ...prev,
          location: undefined,
          ward: undefined
        }));
      } catch (error) {
        console.error('Address validation error:', error);
        setFormErrors(prev => ({
          ...prev,
          location: 'Could not validate address'
        }));
      } finally {
        setIsAddressLoading(false);
      }
    }, 1000),
    []
  );

  const handleImageCapture = async (files) => {
    const validImages = [];
    const errors = [];

    for (const file of Array.from(files)) {
      try {
        await validateImageFile(file);
        validImages.push({
          file,
          preview: URL.createObjectURL(file),
          name: file.name
        });
      } catch (error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }

    if (validImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validImages]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        try {
          await validateAudioFile(blob);
          setAudioBlob(blob);
          toast.success('Audio recording saved successfully');
        } catch (error) {
          toast.error(error.message);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Category
        if (!formData.category) {
          setFormErrors(prev => ({ ...prev, category: 'Please select a category' }));
          return false;
        }
        return true;

      case 1: // Details
        const titleError = !formData.title?.trim() ? 'Title is required' :
          formData.title.length < 10 ? 'Title must be at least 10 characters' : null;

        const descError = !formData.description?.trim() ? 'Description is required' :
          formData.description.length < 30 ? 'Description must be at least 30 characters' : null;

        setFormErrors(prev => ({
          ...prev,
          title: titleError,
          description: descError
        }));

        return !titleError && !descError;

      case 2: // Evidence
        return true; // Optional step

      case 3: // Location
        const locationValid = formData.location.address.trim() && formData.location.ward;
        if (!locationValid) {
          setFormErrors(prev => ({
            ...prev,
            location: !formData.location.address.trim() ? 'Address is required' : null,
            ward: !formData.location.ward ? 'Location must be within a valid Mumbai ward' : null
          }));
        }
        return locationValid;

      case 4: // Review
        const { isValid, errors } = validateComplaintForm(formData);
        setFormErrors(errors);
        return isValid;

      default:
        return false;
    }
  };

  const canProceed = () => {
    if (isAddressLoading) return false;
    return validateStep();
  };

  const handleSubmit = () => {
    const submitData = new FormData();
    submitData.append('category', formData.category);
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    // Location details
    submitData.append('address', formData.location.address);
    submitData.append('ward', formData.location.ward || '');
    submitData.append('city', formData.location.city);
    submitData.append('state', formData.location.state);
    submitData.append('zip_code', formData.location.zip_code || '');
    
    if (formData.location.latitude) {
      submitData.append('latitude', formData.location.latitude);
    }
    if (formData.location.longitude) {
      submitData.append('longitude', formData.location.longitude);
    }
    
    submitData.append('priority', formData.priority);
    submitData.append('contact_method', formData.contactMethod);
    
    formData.images.forEach((image, index) => {
      submitData.append(`images`, image.file);
    });

    if (audioBlob) {
      submitData.append('audio_description', audioBlob, 'description.wav');
    }

    submitMutation.mutate(submitData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              What type of issue are you reporting?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.category === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Tell us about the issue
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  setFormErrors(prev => ({ ...prev, title: null }));
                }}
                placeholder="Brief title for your complaint..."
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base ${
                  formErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
                />
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-full ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? (
                      <StopIcon className="h-5 w-5" />
                    ) : (
                      <MicrophoneIcon className="h-5 w-5" />
                    )}
                  </button>
                  {audioBlob && (
                    <button
                      type="button"
                      className="p-2 rounded-full bg-green-100 text-green-600"
                      onClick={() => {
                        const audio = new Audio(URL.createObjectURL(audioBlob));
                        audio.play();
                      }}
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              {isRecording && (
                <p className="text-sm text-red-600 mt-2 animate-pulse">
                  🔴 Recording... Tap stop when finished
                </p>
              )}
              {audioBlob && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ Audio description recorded
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <div className="space-y-2">
                {priorities.map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      formData.priority === priority.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                          {priority.label}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{priority.description}</p>
                      </div>
                      {priority.value === 'HIGH' && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Add Evidence (Optional)
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photos
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer group">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center group-hover:border-blue-400 transition-colors">
                      <CameraIcon className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                      <span className="text-sm text-gray-600 group-hover:text-blue-600">
                        Take Photo
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={(e) => handleImageCapture(e.target.files)}
                      className="hidden"
                    />
                  </label>
                  
                  <label className="cursor-pointer group">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center group-hover:border-blue-400 transition-colors">
                      <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                      <span className="text-sm text-gray-600 group-hover:text-blue-600">
                        Upload Photo
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageCapture(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Selected Photos ({formData.images.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.preview}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Where is this issue located?
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                <textarea
                  value={formData.location.address}
                  onChange={(e) => {
                    const address = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, address }
                    }));
                    setFormErrors(prev => ({ ...prev, location: null }));
                    validateAddress(address);
                  }}
                  placeholder="Enter the complete address with landmarks..."
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base resize-none ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {isAddressLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                )}
              </div>
              </div>

              <button
                onClick={getCurrentLocation}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                Use Current Location
              </button>

              {formData.location.latitude && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    GPS coordinates captured
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              Review Your Complaint
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Category</h3>
                <p className="text-gray-700">
                  {categories.find(c => c.id === formData.category)?.name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Issue</h3>
                <p className="font-medium text-gray-900">{formData.title}</p>
                <p className="text-gray-700 mt-1">{formData.description}</p>
              </div>

              {formData.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Evidence ({formData.images.length} photos)
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.preview}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                <p className="text-gray-700">{formData.location.address}</p>
                
                {formData.location.ward && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-blue-600">
                      Ward: {formData.location.ward_name}
                    </span>
                  </div>
                )}
                
                <div className="mt-2 text-sm text-gray-600">
                  <p>{formData.location.city}, {formData.location.state}</p>
                  {formData.location.zip_code && (
                    <p>PIN: {formData.location.zip_code}</p>
                  )}
                </div>
                
                {formData.location.latitude && (
                  <p className="text-sm text-green-600 mt-2">
                    ✅ GPS coordinates captured
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Priority</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                  priorities.find(p => p.value === formData.priority)?.color
                }`}>
                  {priorities.find(p => p.value === formData.priority)?.label}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Report Issue
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          {steps.map((step, index) => (
            <span key={index} className={index === currentStep ? 'font-medium text-blue-600' : ''}>
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isLoading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <CheckCircleIcon className="h-5 w-5 ml-1" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileComplaintForm;