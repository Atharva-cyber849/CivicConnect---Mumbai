import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext' // Re-enabled
import { GENDER_CHOICES, WARD_CHOICES, LANGUAGE_CHOICES } from '../../config/constants'

const Register = () => {
  const navigate = useNavigate()
  // Re-enable full authentication context
  const authContext = useAuth()
  const { register: registerUser, loading } = authContext || {}
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
    gender: '',
    age: '',
    ward: '',
    address: '',
    pincode: '',
    language_preference: 'EN',
    profile_picture: null,
    has_accepted_terms: false,
    latitude: null,
    longitude: null,
  })

  // Field validation
  const validateField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should only contain letters'
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
          return 'Password must contain number, uppercase, lowercase, and symbol'
        }
        return ''
      
      case 'password2':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      
      case 'age':
        if (value && (value < 18 || value > 120)) return 'Age must be between 18 and 120'
        return ''
      
      case 'pincode':
        if (value && !/^\d{6}$/.test(value)) return 'Enter valid 6-digit pincode'
        if (value && !(400001 <= parseInt(value) && parseInt(value) <= 400107)) {
          return 'Enter valid Mumbai pincode'
        }
        return ''
      
      case 'has_accepted_terms':
        if (!value) return 'You must accept the terms and conditions'
        return ''
      
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    const newValue = type === 'checkbox' ? checked : 
                    type === 'file' ? files[0] : value
    
    setFormData(prev => ({ ...prev, [name]: newValue }))
    
    // Validate field
    const error = validateField(name, newValue)
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  // Location detection
  const detectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }))
          // TODO: Add reverse geocoding to get ward and address
        },
        (error) => {
          console.error('Error getting location:', error)
          setErrors(prev => ({
            ...prev,
            location: 'Could not detect location. Please select your ward manually.'
          }))
        }
      )
    }
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
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setIsSubmitting(false)
        return
      }

      // Re-enable registration functionality
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
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="card w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">🏙️ Join Snap & Report Mumbai</h2>
          <p className="text-gray-600 mt-2">
            Help us make Mumbai cleaner and smarter by reporting issues in your area.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">👤 Personal Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`input ${errors.full_name ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
                required
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select gender</option>
                  {GENDER_CHOICES.map(gender => (
                    <option key={gender.value} value={gender.value}>
                      {gender.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className={`input ${errors.age ? 'border-red-500' : ''}`}
                  placeholder="Enter your age"
                  min="18"
                  max="120"
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📞 Contact Details</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your.email@example.com"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mobile Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="10-digit mobile number"
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🔒 Account Security</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Min. 8 characters"
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  className={`input ${errors.password2 ? 'border-red-500' : ''}`}
                  placeholder="Re-enter password"
                  required
                />
                {errors.password2 && (
                  <p className="text-red-500 text-sm mt-1">{errors.password2}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">📍 Location Details</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={detectLocation}
                className="btn btn-secondary"
              >
                📍 Detect My Location
              </button>
              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ward</label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select your ward</option>
                  {WARD_CHOICES.map(ward => (
                    <option key={ward.value} value={ward.value}>
                      {ward.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`input ${errors.pincode ? 'border-red-500' : ''}`}
                  placeholder="Mumbai pincode"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input min-h-[80px]"
                placeholder="Enter your detailed address"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">⚙️ Preferences</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Language</label>
                <select
                  name="language_preference"
                  value={formData.language_preference}
                  onChange={handleChange}
                  className="input"
                >
                  {LANGUAGE_CHOICES.map(language => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profile Picture</label>
                <input
                  type="file"
                  name="profile_picture"
                  onChange={handleChange}
                  className="input py-1"
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="has_accepted_terms"
                checked={formData.has_accepted_terms}
                onChange={handleChange}
                className="mt-1"
              />
              <label className="text-sm">
                I agree to the Terms of Service and Privacy Policy. I understand that my data
                will be used to improve city services.
              </label>
            </div>
            {errors.has_accepted_terms && (
              <p className="text-red-500 text-sm">{errors.has_accepted_terms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full py-3"
          >
            {isSubmitting ? 'Creating your account...' : '🚀 Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary-600 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
