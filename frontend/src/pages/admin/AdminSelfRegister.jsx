import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Shield, User, Building, Crown } from 'lucide-react'

const AdminSelfRegister = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { adminRegister } = useAuth()
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    justification: '',
    department: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get role from URL params
  const role = searchParams.get('role') || 'officer'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className={`mx-auto h-16 w-16 ${roleInfo.bgColor} rounded-full flex items-center justify-center text-white`}>
            {roleInfo.icon}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {roleInfo.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {roleInfo.description}
          </p>
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              🇮🇳 BMC Mumbai
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.full_name ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Create a password (min. 8 characters)"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                name="password2"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password2 ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Confirm your password"
              />
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-600">{errors.password2}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Public Works, Health, Education"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                name="justification"
                value={formData.justification}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.justification ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Please explain why you should be granted admin access and your relevant experience..."
              />
              {errors.justification && (
                <p className="mt-1 text-sm text-red-600">{errors.justification}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This will help administrators review your request
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `${roleInfo.bgColor} hover:opacity-90`
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Create {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')} Account
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to={`/admin/auth/login?role=${role}`}
                className={`font-medium hover:underline ${roleInfo.textColor}`}
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center"
            >
              ← Back to Admin Portal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminSelfRegister