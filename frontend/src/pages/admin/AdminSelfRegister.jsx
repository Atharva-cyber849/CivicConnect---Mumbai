import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, User, Building, Crown, MapPin, Phone, Mail, Lock, FileText, ChevronDown, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

const AdminSelfRegister = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { adminRegister } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    justification: '',
    department: '',
    ward: '',
    designation: '',
    employee_id: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get role from URL params
  const role = searchParams.get('role') || 'officer'

  // BMC Departments
  const departments = [
    { value: '', label: 'Select Department' },
    { value: 'solid_waste', label: '🗑️ Solid Waste Management' },
    { value: 'water_supply', label: '💧 Water Supply' },
    { value: 'roads', label: '🛣️ Roads & Maintenance' },
    { value: 'street_lighting', label: '💡 Street Lighting' },
    { value: 'drainage', label: '🚿 Drainage & Sewage' },
    { value: 'parks', label: '🌳 Parks & Gardens' },
    { value: 'building', label: '🏢 Building Department' },
    { value: 'traffic', label: '🚦 Traffic & Transport' },
    { value: 'health', label: '🏥 Public Health' },
    { value: 'education', label: '📚 Education' },
    { value: 'fire', label: '🚒 Fire Services' },
    { value: 'admin', label: '📋 Administration' }
  ]

  // Mumbai BMC Wards (A to T + additional)
  const wards = [
    { value: '', label: 'Select Ward (if applicable)' },
    { value: 'A', label: 'Ward A - Churchgate, CST, Fort' },
    { value: 'B', label: 'Ward B - Nagpada, Agripada' },
    { value: 'C', label: 'Ward C - Kalbadevi, Bhuleshwar' },
    { value: 'D', label: 'Ward D - Girgaon, Charni Road' },
    { value: 'E', label: 'Ward E - Byculla, Chinchpokli' },
    { value: 'F/N', label: 'Ward F/N - Matunga, Sion, Wadala' },
    { value: 'G/N', label: 'Ward G/N - Dadar, Dharavi' },
    { value: 'H/E', label: 'Ward H/E - Bandra East, Kurla' },
    { value: 'H/W', label: 'Ward H/W - Bandra West, Khar' },
    { value: 'K/E', label: 'Ward K/E - Andheri East, Vile Parle' },
    { value: 'K/W', label: 'Ward K/W - Andheri West, Juhu' },
    { value: 'L', label: 'Ward L - Kurla, Sakinaka' },
    { value: 'M/E', label: 'Ward M/E - Chembur, Mankhurd' },
    { value: 'M/W', label: 'Ward M/W - Chembur West' },
    { value: 'N', label: 'Ward N - Ghatkopar' },
    { value: 'P/N', label: 'Ward P/N - Malad' },
    { value: 'P/S', label: 'Ward P/S - Goregaon' },
    { value: 'R/C', label: 'Ward R/C - Borivali' },
    { value: 'R/N', label: 'Ward R/N - Dahisar' },
    { value: 'R/S', label: 'Ward R/S - Kandivali' },
    { value: 'S', label: 'Ward S - Bhandup, Vikhroli' },
    { value: 'T', label: 'Ward T - Mulund' }
  ]

  const designations = [
    { value: '', label: 'Select Designation' },
    { value: 'ward_officer', label: 'Ward Officer' },
    { value: 'assistant_engineer', label: 'Assistant Engineer' },
    { value: 'junior_engineer', label: 'Junior Engineer' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'inspector', label: 'Inspector' },
    { value: 'department_head', label: 'Department Head' },
    { value: 'deputy_engineer', label: 'Deputy Engineer' },
    { value: 'executive_engineer', label: 'Executive Engineer' },
    { value: 'admin_officer', label: 'Administrative Officer' },
    { value: 'other', label: 'Other' }
  ]

  const getRoleInfo = () => {
    switch (role) {
      case 'officer':
        return {
          title: 'BMC Officer Registration',
          description: 'Register as a Ward Officer or Department Staff',
          icon: <User className="h-8 w-8" />,
          bgColor: 'bg-blue-600',
          textColor: 'text-blue-600'
        }
      case 'admin':
        return {
          title: 'BMC Administrator Registration',
          description: 'Register as a Department Administrator',
          icon: <Building className="h-8 w-8" />,
          bgColor: 'bg-green-600',
          textColor: 'text-green-600'
        }
      default:
        return {
          title: 'BMC Staff Registration',
          description: 'Register as BMC Staff',
          icon: <Shield className="h-8 w-8" />,
          bgColor: 'bg-gray-600',
          textColor: 'text-gray-600'
        }
    }
  }

  const roleInfo = getRoleInfo()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.phone && (!/^\d{10}$/.test(formData.phone))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match'
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department'
    }

    if (!formData.designation) {
      newErrors.designation = 'Please select your designation'
    }

    if (!formData.justification.trim()) {
      newErrors.justification = 'Please provide justification for your admin access request'
    } else if (formData.justification.length < 20) {
      newErrors.justification = 'Justification must be at least 20 characters'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await adminRegister(formData, role)
      
      if (result.success) {
        // Show approval pending message instead of redirecting to dashboard
        navigate('/admin', { 
          state: { 
            message: 'Registration request submitted successfully! You will be notified once your request is reviewed by an administrator.',
            type: 'success',
            pendingApproval: true
          }
        })
      } else {
        setErrors({ general: result.error || 'Registration failed' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230078D7' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 bg-gradient-to-br ${roleInfo.bgColor === 'bg-blue-600' ? 'from-blue-600 to-indigo-600' : roleInfo.bgColor === 'bg-green-600' ? 'from-green-600 to-emerald-600' : 'from-gray-600 to-gray-700'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {roleInfo.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {roleInfo.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  {roleInfo.description}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                <span className="text-xl">🇮🇳</span> BMC Mumbai
              </span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your registration will be reviewed by a Super Administrator. You'll receive a notification once approved.
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Registration Form
            </h2>
            <p className="text-blue-100 text-sm mt-1">Please fill in all required information accurately</p>
          </div>

          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Registration Error</p>
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h3>
                <p className="text-sm text-gray-600">Basic details about you</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="your.email@bmc.gov.in"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="Enter 10-digit number"
                    maxLength="10"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Employee ID <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    name="employee_id"
                    type="text"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                    placeholder="e.g., BMC2023-12345"
                  />
                </div>
              </div>
            </div>

            {/* Department & Ward Information */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Department & Location</h3>
                <p className="text-sm text-gray-600">Your work assignment details</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4 text-green-600" />
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {departments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    Ward <span className="text-gray-500 text-xs">(if applicable)</span>
                  </label>
                  <div className="relative">
                    <select
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400 transition-all"
                    >
                      {wards.map(ward => (
                        <option key={ward.value} value={ward.value}>{ward.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${errors.designation ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {designations.map(des => (
                        <option key={des.value} value={des.value}>{des.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.designation && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.designation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Security Credentials</h3>
                <p className="text-sm text-gray-600">Create a secure password for your account</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                      placeholder="Create strong password (min. 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password2"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.password2}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.password2 ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password2 && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password2}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Justification Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Access Justification</h3>
                <p className="text-sm text-gray-600">Explain why you need admin access</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="justification"
                  value={formData.justification}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${errors.justification ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                  placeholder="Please provide detailed justification including your role, responsibilities, and why you need admin access to the Snap & Report system. Mention any relevant experience with similar systems."
                />
                {errors.justification && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.justification}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  This information will be reviewed by administrators before approval
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Registration...
                  </>
                ) : (
                  <>
                    <Shield className="h-6 w-6" />
                    Submit Registration Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <p className="text-gray-700 mb-3">
              Already have an account?{' '}
              <Link
                to={`/admin/auth/login?role=${role}`}
                className={`font-bold hover:underline ${roleInfo.textColor}`}
              >
                Sign in here
              </Link>
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Admin Portal
            </Link>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">Secure Process</h4>
              </div>
              <p className="text-sm text-blue-800">All registrations are reviewed by Super Admins</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-green-900">Data Protection</h4>
              </div>
              <p className="text-sm text-green-800">Your information is encrypted and secure</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-purple-900">Quick Review</h4>
              </div>
              <p className="text-sm text-purple-800">Most requests reviewed within 24-48 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSelfRegister