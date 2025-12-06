import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/authApi'
import { toast } from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiSave, FiEdit3, FiShield, FiCheckCircle, FiBell } from 'react-icons/fi'

const MUMBAI_WARDS = [
  'A Ward (Colaba, Fort, Navy Nagar)',
  'B Ward (Dongri, Mazgaon, Wadi Bunder)',
  'C Ward (Masjid, Victoria Dock)',
  'D Ward (Tardeo, Haj House, Nagpada)',
  'E Ward (Byculla, Mazgaon)',
  'F/N Ward (Matunga, Mahim)',
  'F/S Ward (Parel, Sewri)',
  'G/N Ward (Dadar, Mahim)',
  'G/S Ward (Worli, Lower Parel)',
  'H/E Ward (Bandra East)',
  'H/W Ward (Bandra West)',
  'K/E Ward (Andheri East)',
  'K/W Ward (Andheri West)',
  'L Ward (Kurla)',
  'M/E Ward (Chembur)',
  'M/W Ward (Chembur West)',
  'N Ward (Ghatkopar)',
  'P/N Ward (Malad)',
  'P/S Ward (Goregaon)',
  'R/C Ward (Borivali)',
  'R/N Ward (Dahisar)',
  'R/S Ward (Kandivali)',
  'S Ward (Bhandup)',
  'T Ward (Mulund)'
]

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    ward: user?.ward || '',
    preferred_language: user?.preferred_language || 'en',
    receive_notifications: user?.receive_notifications ?? true,
    receive_sms: user?.receive_sms ?? false
  })

  // Fetch fresh user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true)
        const profileData = await authApi.getProfile()
        updateUser(profileData)
        setFormData({
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          email: profileData?.email || '',
          phone: profileData?.phone || '',
          address: profileData?.address || '',
          ward: profileData?.ward || '',
          preferred_language: profileData?.preferred_language || 'en',
          receive_notifications: profileData?.receive_notifications ?? true,
          receive_sms: profileData?.receive_sms ?? false
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoadingProfile(false)
      }
    }
    
    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const updatedProfile = await authApi.updateProfile(formData)
      updateUser(updatedProfile)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="profile-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profile-grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FiUser className="h-9 w-9" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
                <p className="text-blue-100 text-lg">Manage your account information and preferences</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                isEditing 
                  ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white' 
                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl'
              }`}
            >
              {isEditing ? (
                <>
                  <span className="text-lg">✕</span>
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FiEdit3 className="h-5 w-5" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiUser className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiMail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiMapPin className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Location Information</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mumbai Ward
              </label>
              <select
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="">Select your ward</option>
                {MUMBAI_WARDS.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <FiMapPin className="h-4 w-4" />
                This helps us route your complaints to the correct department
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none"
                placeholder="Enter your full address in Mumbai"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiGlobe className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="receive_notifications"
                  name="receive_notifications"
                  checked={formData.receive_notifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-civic-blue-600 focus:ring-civic-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="receive_notifications" className="ml-2 block text-sm text-gray-700">
                  Receive email notifications for complaint updates
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="receive_sms"
                  name="receive_sms"
                  checked={formData.receive_sms}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-civic-blue-600 focus:ring-civic-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label htmlFor="receive_sms" className="ml-2 block text-sm text-gray-700">
                  Receive SMS notifications for important updates
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FiShield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Data Security</h3>
          </div>
          <p className="text-sm text-gray-600">Your personal information is encrypted and securely stored</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Privacy</h3>
          </div>
          <p className="text-sm text-gray-600">We never share your data with third parties</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <FiBell className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Stay Updated</h3>
          </div>
          <p className="text-sm text-gray-600">Get real-time updates on your complaint status</p>
        </div>
      </div>
    </div>
  )
}

export default Profile
