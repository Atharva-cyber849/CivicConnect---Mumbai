import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../config/constants'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Users, Shield, CheckCircle, AlertCircle } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('EN')

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
        
        // Check if we have report data from ward services redirect
        const reportData = location.state?.reportData
        if (reportData) {
          // Redirect to report issue with pre-filled data
          navigate('/dashboard/report', { state: reportData })
        } else {
          navigate(result.redirectTo || '/dashboard')
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
            </div>
            <div className="relative z-10">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {language === 'EN' ? 'Citizen Login' : 'नागरिक लॉगिन'}
              </h1>
              <p className="text-blue-100 text-sm">
                {language === 'EN' ? 'Access your complaint portal' : 'आपल्या तक्रार पोर्टलमध्ये प्रवेश करा'}
              </p>
              
              {/* Language Toggle */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === 'EN'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('MR')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    language === 'MR'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="px-8 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-1 text-blue-700">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Secure Login</span>
              </div>
              <div className="flex items-center gap-1 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">BMC Verified</span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'EN' ? 'Email Address' : 'ईमेल पत्ता'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
              placeholder={language === 'EN' ? 'your@email.com' : 'तुमचा@ईमेल.com'}
              required
            />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'EN' ? 'Password' : 'संकेतशब्द'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
              placeholder={language === 'EN' ? 'Enter your password' : 'तुमचा संकेतशब्द प्रविष्ट करा'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium text-sm">Login Failed</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting || loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{language === 'EN' ? 'Signing in...' : 'साइन इन करत आहे...'}</span>
              </>
            ) : (
              <span>{language === 'EN' ? 'Sign In' : 'साइन इन करा'}</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 space-y-4">
          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {language === 'EN' ? "Don't have an account?" : 'खाते नाही?'}{' '}
              <Link 
                to="/auth/register" 
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                {language === 'EN' ? 'Register Now' : 'आता नोंदणी करा'}
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {language === 'EN' ? 'Quick Access' : 'त्वरित प्रवेश'}
              </span>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {language === 'EN' ? 'Back to Home' : 'मुख्यपृष्ठावर परत या'}
            </Link>
          </div>
        </div>

          </div>
        </div>

        {/* Info Cards at Bottom */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Secure */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">
                  {language === 'EN' ? 'Secure Access' : 'सुरक्षित प्रवेश'}
                </h4>
                <p className="text-blue-700 text-xs mt-1">
                  {language === 'EN' ? 'Encrypted data transmission' : 'एनक्रिप्टेड डेटा ट्रान्समिशन'}
                </p>
              </div>
            </div>
          </div>

          {/* Fast */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 text-sm">
                  {language === 'EN' ? 'Quick Login' : 'त्वरित लॉगिन'}
                </h4>
                <p className="text-green-700 text-xs mt-1">
                  {language === 'EN' ? 'Access your dashboard instantly' : 'तुमच्या डॅशबोर्डमध्ये त्वरित प्रवेश'}
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 text-sm">
                  {language === 'EN' ? '24/7 Support' : '24/7 सपोर्ट'}
                </h4>
                <p className="text-purple-700 text-xs mt-1">
                  {language === 'EN' ? 'Get help anytime you need' : 'आवश्यकता असल्यास कधीही मदत मिळवा'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slide {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(40px, 40px);
          }
        }
      `}</style>
    </div>
  )
}

export default Login
