import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { USER_ROLES } from '../../config/constants'
import { Shield, User, Building, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [language, setLanguage] = useState('EN')

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
        return language === 'EN' ? 'Ward Officer Login' : 'वॉर्ड अधिकारी लॉगिन'
      case 'admin':
        return language === 'EN' ? 'Department Admin Login' : 'विभाग प्रशासक लॉगिन'
      case 'super-admin':
        return language === 'EN' ? 'Super Admin Login' : 'सुपर अॅडमिन लॉगिन'
      default:
        return language === 'EN' ? 'BMC Officer Login' : 'BMC अधिकारी लॉगिन'
    }
  }

  const getRoleColor = () => {
    switch (roleParam) {
      case 'officer':
        return { from: 'from-blue-600', to: 'to-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' }
      case 'super-admin':
        return { from: 'from-purple-600', to: 'to-indigo-600', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700' }
      default:
        return { from: 'from-green-600', to: 'to-emerald-600', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700' }
    }
  }

  const colors = getRoleColor()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-slate-400 to-gray-500"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header Section with Role-Specific Gradient */}
          <div className={`bg-gradient-to-r ${colors.from} ${colors.to} px-8 py-10 text-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
            </div>
            <div className="relative z-10">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300">
                {getRoleIcon()}
              </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {getRoleTitle()}
          </h2>
          <p className="text-white/90 text-sm">
            {language === 'EN' ? 'Access your administrative dashboard' : 'आपल्या प्रशासकीय डॅशबोर्डमध्ये प्रवेश करा'}
          </p>
          
          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setLanguage('EN')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === 'EN'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('MR')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === 'MR'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              मराठी
            </button>
          </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className={`px-8 py-4 ${colors.bg} border-b ${colors.border}`}>
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className={`flex items-center gap-1 ${colors.text}`}>
                <Shield className="h-4 w-4" />
                <span className="font-medium">Secure Access</span>
              </div>
              <div className="flex items-center gap-1 text-gray-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">BMC Official</span>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'EN' ? 'Official Email' : 'अधिकृत ईमेल'}
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
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all hover:border-gray-400"
              placeholder={language === 'EN' ? 'officer@bmc.gov.in' : 'अधिकारी@bmc.gov.in'}
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
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all hover:border-gray-400"
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
                <p className="text-red-800 font-medium text-sm">Authentication Failed</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{language === 'EN' ? 'Authenticating...' : 'प्रमाणीकरण करत आहे...'}</span>
              </>
            ) : (
              <span>{language === 'EN' ? 'Sign In' : 'साइन इन करा'}</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 space-y-4">
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {language === 'EN' ? 'Quick Links' : 'त्वरित लिंक'}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <Link 
              to="/admin" 
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {language === 'EN' ? 'Admin Portal' : 'अॅडमिन पोर्टल'}
            </Link>
            <Link 
              to="/admin/support" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {language === 'EN' ? 'Need Help?' : 'मदत हवी आहे?'}
            </Link>
          </div>
        </div>

        {/* Info Cards at Bottom */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Role-Based Access */}
          <div className={`${colors.bg} rounded-xl p-4 border ${colors.border} hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                {getRoleIcon()}
              </div>
              <div>
                <h4 className={`font-semibold ${colors.text} text-sm`}>
                  {language === 'EN' ? 'Role-Based' : 'भूमिका-आधारित'}
                </h4>
                <p className="text-gray-600 text-xs mt-1">
                  {language === 'EN' ? 'Secure role-specific access' : 'सुरक्षित भूमिका-विशिष्ट प्रवेश'}
                </p>
              </div>
            </div>
          </div>

          {/* Encrypted */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  {language === 'EN' ? 'Encrypted' : 'एनक्रिप्टेड'}
                </h4>
                <p className="text-gray-600 text-xs mt-1">
                  {language === 'EN' ? 'End-to-end encryption' : 'एंड-टू-एंड एनक्रिप्शन'}
                </p>
              </div>
            </div>
          </div>

          {/* Verified */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 text-sm">
                  {language === 'EN' ? 'BMC Official' : 'BMC अधिकृत'}
                </h4>
                <p className="text-green-700 text-xs mt-1">
                  {language === 'EN' ? 'Government verified' : 'सरकार सत्यापित'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

      {/* CSS Animation */}
      <style jsx>{`
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

export default AdminLogin