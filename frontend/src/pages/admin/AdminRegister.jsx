import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { DEPARTMENTS, DESIGNATIONS, USER_ROLES, isSuperAdmin as checkIsSuperAdmin } from '../../config/constants';
import wardsData from '../../config/wardsData.json';

const AdminRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is super admin
  const isSuperAdmin = checkIsSuperAdmin(user);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    assignedWard: '',
    roleType: USER_ROLES.DEPARTMENT_STAFF,
    username: '',
    password: '',
    confirmPassword: '',
    sendEmailInvite: true,
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Extract wards from GeoJSON data
  const mumbaiWards = wardsData.features.map(feature => ({
    code: feature.properties.ward_code,
    name: feature.properties.name,
    fullName: feature.properties.full_name
  })).sort((a, b) => a.code.localeCompare(b.code));

  // Auto-generate username when firstName, lastName, department, and ward change
  useEffect(() => {
    if (formData.firstName && formData.lastName && formData.department && formData.assignedWard) {
      const dept = DEPARTMENTS.find(d => d.id === formData.department);
      const ward = mumbaiWards.find(w => w.code === formData.assignedWard);
      
      if (dept && ward) {
        const firstName = formData.firstName.toLowerCase().replace(/[^a-z]/g, '');
        const lastName = formData.lastName.toLowerCase().replace(/[^a-z]/g, '');
        const deptCode = dept.code.toLowerCase();
        const wardCode = ward.code.toLowerCase();
        
        const username = `bmc_${wardCode}_${deptCode}_${firstName}${lastName.charAt(0)}`;
        setFormData(prev => ({ ...prev, username }));
      }
    }
  }, [formData.firstName, formData.lastName, formData.department, formData.assignedWard]);

  // Auto-generate password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = 'Mumbai' + Math.floor(Math.random() * 1000);
    for (let i = 0; i < 4; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ 
      ...prev, 
      password, 
      confirmPassword: password 
    }));
  };

  // Generate BMC email
  const generateBMCEmail = () => {
    if (formData.firstName && formData.lastName) {
      const firstName = formData.firstName.toLowerCase().replace(/[^a-z]/g, '');
      const lastName = formData.lastName.toLowerCase().replace(/[^a-z]/g, '');
      const email = `${firstName}.${lastName}@bmc.gov.in`;
      setFormData(prev => ({ ...prev, email }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.assignedWard) newErrors.assignedWard = 'Ward assignment is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register officer mutation
  const registerOfficerMutation = useMutation({
    mutationFn: (officerData) => adminApi.registerOfficer(officerData),
    onSuccess: (response) => {
      toast.success(
        `${formData.roleType === USER_ROLES.ADMIN ? 'Admin' : 'Officer'} account created successfully!`
      );
      
      if (formData.sendEmailInvite) {
        toast.success('Email invitation sent to the officer');
      }
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        assignedWard: '',
        roleType: USER_ROLES.DEPARTMENT_STAFF,
        username: '',
        password: '',
        confirmPassword: '',
        sendEmailInvite: true,
        isActive: true
      });
      
      // Navigate back or stay for creating more accounts
      setTimeout(() => {
        navigate('/admin/officers');
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          'Failed to create officer account';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSuperAdmin) {
      toast.error('Unauthorized: Only Super Admins can create officer accounts');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    // Prepare data for API
    const officerData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      username: formData.username,
      password: formData.password,
      role: formData.roleType,
      department: formData.department,
      designation: formData.designation,
      assigned_ward: formData.assignedWard,
      is_active: formData.isActive,
      send_email_invite: formData.sendEmailInvite
    };

    try {
      await registerOfficerMutation.mutateAsync(officerData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Redirect if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-600">
            Only Super Administrators can create officer accounts.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230078D7' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <UserPlusIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Register New Officer/Admin
                </h1>
                <p className="text-gray-600 mt-1">
                  Create authorized BMC officer or admin accounts
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                <ShieldCheckIcon className="h-4 w-4" />
                Super Admin
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/officers')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Officers Management
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="h-6 w-6" />
                Personal Information
              </h3>
              <p className="text-blue-100 text-sm mt-1">Basic details of the officer/admin</p>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`flex-1 px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="officer.name@bmc.gov.in"
                    />
                    <button
                      type="button"
                      onClick={generateBMCEmail}
                      className="px-4 py-3 border border-gray-300 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                      title="Generate BMC Email"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-blue-600" />
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    placeholder="9876543210"
                    maxLength="10"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <BuildingOffice2Icon className="h-6 w-6" />
                Professional Information
              </h3>
              <p className="text-green-100 text-sm mt-1">Work assignment and department details</p>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <BuildingOffice2Icon className="h-4 w-4 text-green-600" />
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.designation ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map((designation) => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                  {errors.designation && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.designation}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Ward */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-green-600" />
                    Assigned Ward <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.assignedWard}
                    onChange={(e) => handleInputChange('assignedWard', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      errors.assignedWard ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">Select Ward</option>
                    {mumbaiWards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.code} Ward - {ward.fullName}
                      </option>
                    ))}
                  </select>
                  {errors.assignedWard && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.assignedWard}
                    </p>
                  )}
                </div>

                {/* Role Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-green-600" />
                    Role Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleType}
                    onChange={(e) => handleInputChange('roleType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400 transition-all"
                  >
                    <option value={USER_ROLES.DEPARTMENT_STAFF}>Officer (Ward Level)</option>
                    <option value={USER_ROLES.ADMIN}>Admin (Department Head)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Account Credentials Card */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheckIcon className="h-6 w-6" />
                Account Credentials
              </h3>
              <p className="text-purple-100 text-sm mt-1">Login credentials for the new account</p>
            </div>
            
            <div className="px-8 py-6 space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-purple-600" />
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Auto-generated based on ward and department"
                    readOnly
                  />
                  <CheckCircleIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.username}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3" />
                  Auto-generated format: bmc_[ward]_[dept]_[name]
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Generate Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Enter password (min. 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Options Card */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                <input
                  id="sendEmailInvite"
                  type="checkbox"
                  checked={formData.sendEmailInvite}
                  onChange={(e) => handleInputChange('sendEmailInvite', e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="sendEmailInvite" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                    Send Email Invitation
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Send login credentials and welcome email to the new officer/admin
                  </div>
                </label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    Activate Account Immediately
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Allow the officer/admin to log in right after account creation
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/officers')}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || registerOfficerMutation.isLoading}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              {isSubmitting || registerOfficerMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-6 w-6" />
                  Create {formData.roleType === USER_ROLES.ADMIN ? 'Admin' : 'Officer'} Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRegister;