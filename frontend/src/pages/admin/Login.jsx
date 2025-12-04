import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../config/constants'
import { Shield, User, Building } from 'lucide-react'
import { toast } from 'react-toastify'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, isAuthenticated, user } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roleParam = searchParams.get('role')

  // Always redirect to dashboard if authenticated and user is set
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('') // Clear error when input changes
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      // Pass true to indicate this is an admin login
      const result = await login(formData, true)
      if (result.success) {
        const { user } = result
        // Additional role validation based on roleParam
        // Backend returns 'role' field with values: 'ADMIN', 'DEPARTMENT_STAFF', 'CITIZEN'
        if (roleParam === 'super-admin' && !user.is_superuser) {
          throw new Error('Access Denied: You do not have Super Admin privileges')
        }
        if (roleParam === 'admin' && user.role !== 'ADMIN' && !user.is_superuser) {
          throw new Error('Access Denied: You do not have Department Admin privileges')
        }
        if (roleParam === 'officer' && user.role !== 'DEPARTMENT_STAFF' && !user.is_superuser) {
          throw new Error('Access Denied: You do not have Ward Officer privileges')
        }
        toast.success('Login successful! Redirecting to admin dashboard...')
        // The useEffect above will handle the redirect as soon as auth state updates
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleIcon = () => {
    switch (roleParam) {
      case 'officer':
        return <User className="h-6 w-6" />
      case 'admin':
        return <Building className="h-6 w-6" />
      case 'super-admin':
        return <Shield className="h-6 w-6" />
      default:
        return <Building className="h-6 w-6" />
    }
  }

  const getRoleTitle = () => {
    switch (roleParam) {
      case 'officer':
        return 'Ward Officer Login'
      case 'admin':
        return 'Department Admin Login'
      case 'super-admin':
        return 'Super Admin Login'
      default:
        return 'BMC Officer Login'
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="card w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        {/* Header with role context */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-lg ${
              roleParam === 'officer' ? 'bg-blue-100 text-blue-600' :
              roleParam === 'super-admin' ? 'bg-purple-100 text-purple-600' :
              'bg-green-100 text-green-600'
            }`}>
              {getRoleIcon()}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {getRoleTitle()}
          </h2>
          <p className="text-gray-600 mt-2">
            Access your administrative dashboard
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Official Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="officer@bmc.gov.in"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between text-sm">
            <Link 
              to="/admin" 
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              ← Back to Admin Portal
            </Link>
            <Link 
              to="/admin/support" 
              className="text-gray-600 hover:text-gray-900"
            >
              Need Help?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin