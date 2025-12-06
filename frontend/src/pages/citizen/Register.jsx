import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Mail, Phone, Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const authContext = useAuth()
  const { register: registerUser, loading } = authContext || {}
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [language, setLanguage] = useState('EN')
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  })

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)

  // Field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        if (value.length > 50) return 'Name is too long'
        return ''
      
      case 'email':
        if (!value) return 'Email is required'
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format'
        return ''
      
      case 'phone':
        if (!value) return 'Phone number is required'
        if (!/^[6-9]\d{9}$/.test(value)) return 'Enter valid 10-digit Indian mobile number'
        return ''
      
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(value)) {
          return 'Must contain number, uppercase, lowercase & symbol'
        }
        return ''
      
      case 'password2':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate field
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)
    
    try {
      // Validate all fields
      const newErrors = {}
      Object.keys(formData).forEach(key => {
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      })
      
      // Check terms acceptance
      if (!hasAcceptedTerms) {
        newErrors.terms = 'You must accept the terms and conditions'
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsSubmitting(false)
        return
      }

      if (!registerUser) {
        setErrors({ general: 'Registration service unavailable. Please try again later.' })
        setIsSubmitting(false)
        return
      }

      // Call registration function
      const result = await registerUser(formData)
      
      if (result.success) {
        navigate('/auth/login?message=Registration successful! Please log in.')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden py-12 px-4">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      {/* Main Registration Card */}
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
            </div>
            <div className="relative z-10">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-all duration-300">
                <UserPlus className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {language === 'EN' ? 'Create Citizen Account' : 'नागरिक खाते तयार करा'}
              </h1>
              <p className="text-blue-100 text-sm">
                {language === 'EN' ? 'Join Snap & Report to report civic issues in Mumbai' : 'मुंबईतील नागरी समस्या नोंदवण्यासाठी सामील व्हा'}
              </p>
              
              {/* Language Toggle */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  type="button"
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
                  type="button"
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

          {/* Progress Indicator */}
          <div className="px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <span className="font-medium text-blue-900">Personal Info</span>
              </div>
              <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <span className="font-medium text-blue-900">Security</span>
              </div>
              <div className="flex-1 h-1 bg-blue-200 mx-4"></div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <span className="font-medium text-blue-900">Complete</span>
              </div>
            </div>
          </div>

        {/* General Error */}
        {errors.general && (
          <div className="mx-8 mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium text-sm">Registration Failed</p>
              <p className="text-red-600 text-sm mt-1">{errors.general}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Personal Information Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                {language === 'EN' ? 'Personal Information' : 'वैयक्तिक माहिती'}
              </h3>
              <p className="text-blue-100 text-xs mt-1">
                {language === 'EN' ? 'Your basic details' : 'तुमचा मूलभूत तपशील'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'EN' ? 'Full Name' : 'पूर्ण नाव'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 ${errors.full_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              placeholder={language === 'EN' ? 'Enter your full name' : 'तुमचे पूर्ण नाव प्रविष्ट करा'}
              autoComplete="name"
            />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Email */}
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
              className={`w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              placeholder={language === 'EN' ? 'your.email@example.com' : 'तुमचा.ईमेल@उदाहरण.com'}
              autoComplete="email"
            />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'EN' ? 'Mobile Number' : 'मोबाइल नंबर'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              placeholder={language === 'EN' ? '10-digit mobile number' : '10-अंकी मोबाइल नंबर'}
              autoComplete="tel"
            />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phone}
              </p>
            )}
          </div>

            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {language === 'EN' ? 'Security Credentials' : 'सुरक्षा क्रेडेन्शियल'}
              </h3>
              <p className="text-green-100 text-xs mt-1">
                {language === 'EN' ? 'Create a strong password to secure your account' : 'आपले खाते सुरक्षित करण्यासाठी मजबूत संकेतशब्द तयार करा'}
              </p>
            </div>
            <div className="p-6 space-y-4">

          {/* Password */}
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
                className={`w-full pl-12 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder={language === 'EN' ? 'Min. 8 characters with number & symbol' : 'किमान 8 वर्ण संख्या आणि चिन्हासह'}
                autoComplete="new-password"
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
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'EN' ? 'Confirm Password' : 'संकेतशब्दाची पुष्टी करा'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword2 ? 'text' : 'password'}
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400 ${errors.password2 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder={language === 'EN' ? 'Re-enter password' : 'संकेतशब्द पुन्हा प्रविष्ट करा'}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword2 ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password2 && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password2}
              </p>
            )}
          </div>

            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={hasAcceptedTerms}
              onChange={(e) => setHasAcceptedTerms(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
              {language === 'EN' ? 'I agree to the' : 'मी याला सहमत आहे'}{' '}
              <a href="#" className="text-blue-600 font-medium hover:underline">
                {language === 'EN' ? 'Terms of Service' : 'सेवा अटी'}
              </a>
              {' '}{language === 'EN' ? 'and' : 'आणि'}{' '}
              <a href="#" className="text-blue-600 font-medium hover:underline">
                {language === 'EN' ? 'Privacy Policy' : 'गोपनीयता धोरण'}
              </a>
            </label>
            </div>
          {errors.terms && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1 ml-8">
              <AlertCircle className="h-3 w-3" />
              {errors.terms}
            </p>
          )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSubmitting || loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{language === 'EN' ? 'Creating Account...' : 'खाते तयार करत आहे...'}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>{language === 'EN' ? 'Create Account' : 'खाते तयार करा'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {language === 'EN' ? 'Already have an account?' : 'आधीच खाते आहे?'}{' '}
              <Link 
                to="/auth/login" 
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                {language === 'EN' ? 'Sign in' : 'साइन इन करा'}
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
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
                    {language === 'EN' ? 'Secure' : 'सुरक्षित'}
                  </h4>
                  <p className="text-blue-700 text-xs mt-1">
                    {language === 'EN' ? 'Your data is encrypted' : 'तुमचा डेटा एनक्रिप्ट केलेला आहे'}
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
                    {language === 'EN' ? 'BMC Verified' : 'BMC सत्यापित'}
                  </h4>
                  <p className="text-green-700 text-xs mt-1">
                    {language === 'EN' ? 'Official BMC platform' : 'अधिकृत BMC प्लॅटफॉर्म'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fast */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900 text-sm">
                    {language === 'EN' ? 'Quick Setup' : 'त्वरित सेटअप'}
                  </h4>
                  <p className="text-purple-700 text-xs mt-1">
                    {language === 'EN' ? 'Get started in minutes' : 'काही मिनिटांत सुरू करा'}
                  </p>
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

export default Register
