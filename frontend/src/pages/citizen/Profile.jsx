import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiSave, FiEdit3 } from 'react-icons/fi'

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
  const { user, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
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
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 bg-civic-blue-600 text-white px-4 py-2 rounded-lg hover:bg-civic-blue-700 transition-colors"
        >
          <FiEdit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiUser className="w-5 h-5 mr-2 text-civic-blue-600" />
            Personal Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiMail className="w-5 h-5 mr-2 text-civic-blue-600" />
            Contact Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiMapPin className="w-5 h-5 mr-2 text-civic-blue-600" />
            Location Information
          </h2>
          
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select your ward</option>
                {MUMBAI_WARDS.map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                This helps us route your complaints to the correct department
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter your full address in Mumbai"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FiGlobe className="w-5 h-5 mr-2 text-civic-blue-600" />
            Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Language
              </label>
              <select
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-civic-blue-500 focus:border-civic-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
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
              className="flex items-center space-x-2 bg-civic-blue-600 text-white px-6 py-2 rounded-lg hover:bg-civic-blue-700 transition-colors"
            >
              <FiSave className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default Profile
