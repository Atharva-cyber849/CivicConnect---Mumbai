import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { isSuperAdmin, isDepartmentAdmin, isOfficer, getRoleLabel } from '../../utils/roleBasedAccess';
import { BMC_DEPARTMENTS, MUMBAI_WARDS } from '../../utils/constants';
import { authApi } from '../../api/authApi';
import {
  UserCircleIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { User, Bell, Mail, Phone, Building2, MapPin, Save, Settings as SettingsIcon, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Role-based access control
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsDepartmentAdmin = isDepartmentAdmin(user);
  const userIsOfficer = isOfficer(user);
  
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    complaintUpdates: true,
    theme: theme,
    language: language
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Fetch fresh user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profileData = await authApi.getProfile();
        updateUser(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Update local state when theme or language changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme,
      language: language
    }));
  }, [theme, language]);
  
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Update the appropriate context based on setting
    switch (key) {
      case 'theme':
        setTheme(value);
        break;
      case 'language':
        setLanguage(value);
        break;
      default:
        break;
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Get department name
  const getDepartmentName = () => {
    const dept = BMC_DEPARTMENTS.find(d => d.value === user?.department);
    return dept?.label || user?.department || 'Not Assigned';
  };

  // Get ward name
  const getWardName = () => {
    const ward = MUMBAI_WARDS.find(w => w.value === user?.assigned_ward);
    return ward?.label || user?.assigned_ward || 'Not Assigned';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className={`bg-gradient-to-r ${
        userIsSuperAdmin 
          ? 'from-purple-600 via-indigo-600 to-purple-700' 
          : userIsDepartmentAdmin 
          ? 'from-blue-600 via-cyan-600 to-blue-700'
          : 'from-blue-600 via-indigo-600 to-blue-700'
      } rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="admin-profile-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-profile-grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <User className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">My Profile</h1>
              <p className={`text-lg ${
                userIsSuperAdmin ? 'text-purple-100' : 'text-blue-100'
              }`}>Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
        <div className={`bg-gradient-to-r ${
          userIsSuperAdmin 
            ? 'from-purple-600 to-purple-700' 
            : userIsDepartmentAdmin 
            ? 'from-blue-600 to-cyan-600'
            : 'from-blue-600 to-indigo-600'
        } px-8 py-10`}>
          <div className="flex items-center">
            <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-4 border-white/30">
              <span className="text-4xl font-bold text-white">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </span>
            </div>
            <div className="ml-6 text-white">
              <h2 className="text-3xl font-bold mb-1">{user?.first_name} {user?.last_name}</h2>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5" />
                <p className={userIsSuperAdmin ? 'text-purple-100 font-semibold' : 'text-blue-100 font-semibold'}>{getRoleLabel(user)}</p>
              </div>
              <p className={`text-sm ${userIsSuperAdmin ? 'text-purple-200' : 'text-blue-200'}`}>{user?.email}</p>
            </div>
          </div>
        </div>
        
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="flex items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow duration-200">
            <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
          
          {/* Department */}
          {(userIsDepartmentAdmin || userIsOfficer) && (
            <div className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow duration-200">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</p>
                <p className="font-medium text-gray-900">{getDepartmentName()}</p>
              </div>
            </div>
          )}
          
          {/* Ward (Officers only) */}
          {userIsOfficer && (
            <div className="flex items-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow duration-200">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Ward</p>
                <p className="font-medium text-gray-900">{getWardName()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Complaint Updates</p>
              <p className="text-sm text-gray-500">
                {userIsOfficer 
                  ? 'Get notified when assigned complaints are updated' 
                  : 'Get notified of new complaints in your department'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.complaintUpdates}
                onChange={(e) => handleSettingChange('complaintUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Profile;
