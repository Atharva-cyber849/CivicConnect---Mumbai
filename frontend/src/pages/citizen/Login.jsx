import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../config/constants'
import { Shield, User, Building } from 'lucide-react'
import { toast } from 'react-toastify'

const Login = ({ adminMode = false }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, loading } = useAuth() // Re-enabled
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get role from URL params for admin login
  const roleParam = searchParams.get('role')
  const isAdminLogin = adminMode || window.location.pathname.includes('/admin/')

  useEffect(() => {
    // If coming from admin portal with role selection, we could pre-populate or style accordingly
    if (roleParam) {
      console.log('Login for role:', roleParam)
    }
  }, [roleParam])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      const result = await login(formData, isAdminLogin)
      console.log('Login component - Login result:', result)
      
      if (result.success) {
        const { user } = result
        console.log('Login component - User data:', user)
        
        // Validate role for login context
        if (isAdminLogin) {
          // Admin/Officer login - check for valid admin roles
          const validAdminRoles = [USER_ROLES.ADMIN, USER_ROLES.DEPARTMENT_STAFF]
          if (!validAdminRoles.includes(user.role)) {
            toast.error('Access denied. Admin credentials required.')
            setError('Access denied. Admin credentials required.')
            return
          }
          
          toast.success('Login successful!')
          navigate(result.redirectTo || '/admin/dashboard')
        } else {
          // Citizen login - check for citizen role
          if (user.role !== USER_ROLES.CITIZEN) {
            toast.error('Please use the admin portal to login.')
            setError('This login is for citizens only. Please use the admin portal.')
            return
          }
          
          toast.success('Welcome back!')
          navigate(result.redirectTo || '/dashboard')
        }
      } else {
        console.log('Login component - Login failed:', result.error)
        const errorMessage = result.error || 'Login failed'
        toast.error(errorMessage)
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'Login failed. Please check your credentials.'
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
      case 'super_admin':
        return <Shield className="h-6 w-6" />
      default:
        return null
    }
  }

  const getRoleTitle = () => {
    switch (roleParam) {
      case 'officer':
        return 'Ward Officer Login'
      case 'admin':
        return 'Department Admin Login'
      case 'super_admin':
        return 'Super Admin Login'
      default:
        return isAdminLogin ? 'BMC Officer Login' : 'Citizen Login'
    }
  }

  const getBackLink = () => {
    if (isAdminLogin) {
      return '/admin'
    }
    return '/'
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-full max-w-md">
        {/* Header with role context */}
        <div className="text-center mb-6">
          {roleParam && (
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-lg ${
                roleParam === 'officer' ? 'bg-blue-100 text-blue-600' :
                roleParam === 'admin' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {getRoleIcon()}
              </div>
            </div>
          )}
          <h2 className="text-3xl font-bold">
            {getRoleTitle()}
          </h2>
          {isAdminLogin && (
            <p className="text-gray-600 mt-2">
              Access your administrative dashboard
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {isAdminLogin ? 'Official Email' : 'Email'}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder={isAdminLogin ? 'officer@bmc.gov.in' : 'your@email.com'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isAdminLogin 
                ? 'bg-gray-800 hover:bg-gray-900 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 space-y-3 text-center">
          {!isAdminLogin && (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-blue-600 font-medium hover:text-blue-800">
                Register
              </Link>
            </p>
          )}
          
          <div className="flex justify-between text-sm">
            <Link 
              to={getBackLink()} 
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to {isAdminLogin ? 'Admin Portal' : 'Home'}
            </Link>
            {isAdminLogin && (
              <Link 
                to="/admin/support" 
                className="text-gray-600 hover:text-gray-800"
              >
                Need Help?
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
