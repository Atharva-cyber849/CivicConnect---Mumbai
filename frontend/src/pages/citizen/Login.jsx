import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../config/constants'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    try {
      // Citizen login only
      const result = await login(formData, false)
      console.log('Citizen Login - Login result:', result)
      
      if (result.success) {
        const { user } = result
        console.log('Citizen Login - User data:', user)
        
        // Validate citizen role
        if (user.role !== USER_ROLES.CITIZEN) {
          toast.error('Please use the admin portal to login.')
          setError('This login is for citizens only. Please use the admin portal.')
          return
        }
        
        toast.success('Welcome back!')
        navigate(result.redirectTo || '/dashboard')
      } else {
        console.log('Citizen Login - Login failed:', result.error)
        const errorMessage = result.error || 'Login failed'
        toast.error(errorMessage)
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Citizen Login error:', error)
      const errorMessage = 'Login failed. Please check your credentials.'
      toast.error(errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Citizen Login</h2>
          <p className="text-gray-600 mt-2">
            Report and track your complaints
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="your@email.com"
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
            className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 space-y-3 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-blue-600 font-medium hover:text-blue-800">
              Register
            </Link>
          </p>
          
          <div className="flex justify-between text-sm">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
