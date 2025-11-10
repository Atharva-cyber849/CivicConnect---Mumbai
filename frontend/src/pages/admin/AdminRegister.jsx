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
import { DEPARTMENTS, DESIGNATIONS, USER_ROLES } from '../../config/constants';
import wardsData from '../../config/wardsData.json';

const AdminRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is super admin
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    assignedWard: '',
    roleType: USER_ROLES.OFFICER,
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
        roleType: USER_ROLES.OFFICER,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/officers')}
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Officers Management
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="h-8 w-8 mr-3 text-blue-600" />
            Register New Officer/Admin
          </h1>
          <p className="text-gray-600">Create authorized BMC officer or admin accounts</p>
        </div>
        
        <div className="text-right text-sm text-gray-500">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            Super Admin Access Required
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Personal Information */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Personal Information
            </h3>
          </div>
          
          <div className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <div className="relative flex items-stretch flex-grow">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full border rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="officer.name@bmc.gov.in"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={generateBMCEmail}
                    className="relative -ml-px inline-flex items-center px-3 py-2 border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </button>
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`block w-full pl-10 border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BuildingOffice2Icon className="h-5 w-5 mr-2" />
              Professional Information
            </h3>
          </div>
          
          <div className="px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.department ? 'border-red-300' : 'border-gray-300'
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
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.designation ? 'border-red-300' : 'border-gray-300'
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
                  <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned Ward */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assigned Ward <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.assignedWard}
                  onChange={(e) => handleInputChange('assignedWard', e.target.value)}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.assignedWard ? 'border-red-300' : 'border-gray-300'
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
                  <p className="mt-1 text-sm text-red-600">{errors.assignedWard}</p>
                )}
              </div>

              {/* Role Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roleType}
                  onChange={(e) => handleInputChange('roleType', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={USER_ROLES.OFFICER}>Officer (Ward Level)</option>
                  <option value={USER_ROLES.ADMIN}>Admin (Department Head)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Account Credentials */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Account Credentials
            </h3>
          </div>
          
          <div className="px-6 py-5 space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Auto-generated based on ward and department"
                readOnly
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Username is auto-generated: bmc_[ward]_[dept]_[name]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Generate Strong Password
                  </button>
                </div>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`block w-full border rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`block w-full border rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Options */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center">
              <input
                id="sendEmailInvite"
                type="checkbox"
                checked={formData.sendEmailInvite}
                onChange={(e) => handleInputChange('sendEmailInvite', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendEmailInvite" className="ml-2 block text-sm text-gray-900">
                Send email invitation with login credentials
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Activate account immediately
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/officers')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || registerOfficerMutation.isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting || registerOfficerMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Create {formData.roleType === USER_ROLES.ADMIN ? 'Admin' : 'Officer'} Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminRegister;