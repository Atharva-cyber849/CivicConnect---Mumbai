import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'
import { Crown, User, Mail, Phone, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const CreateSuperAdmin = () => {
  const { user, token } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const data = await authApi.createSuperAdmin(formData)
      toast.success(data.message)
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        password2: ''
      })
    } catch (error) {
      console.error('Error creating super admin:', error)
      setErrors({ general: error.response?.data?.error || 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.role !== 'ADMIN' || !user.is_superuser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Only Super Administrators can create super admin accounts.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Super Admin</h2>
            <p className="text-sm text-gray-600">Create a new super administrator account</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-800">
              <p className="font-medium mb-1">Super Admin Privileges:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Full system access and configuration</li>
                <li>Approve/reject admin registration requests</li>
                <li>Create other super admin accounts</li>
                <li>Manage all users and departments</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.full_name ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter full name"
              />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Enter 10-digit phone number"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Create a strong password (min. 8 characters)"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password2"
              type="password"
              value={formData.password2}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.password2 ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Confirm password"
            />
            {errors.password2 && (
              <p className="mt-1 text-sm text-red-600">{errors.password2}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Super Admin...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Create Super Admin Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateSuperAdmin