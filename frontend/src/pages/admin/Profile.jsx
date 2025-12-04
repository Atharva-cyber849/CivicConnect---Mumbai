import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { isSuperAdmin, isDepartmentAdmin, isOfficer, getRoleLabel } from '../../utils/roleBasedAccess';
import { BMC_DEPARTMENTS, MUMBAI_WARDS } from '../../utils/constants';
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
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center">
        <UserCircleIcon className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-blue-600">
                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
              </span>
            </div>
            <div className="ml-6 text-white">
              <h2 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h2>
              <p className="text-blue-100">{getRoleLabel(user)}</p>
              <p className="text-blue-200 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
          
          {/* Department */}
          {(userIsDepartmentAdmin || userIsOfficer) && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{getDepartmentName()}</p>
              </div>
            </div>
          )}
          
          {/* Ward (Officers only) */}
          {userIsOfficer && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Assigned Ward</p>
                <p className="font-medium text-gray-900">{getWardName()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <BellIcon className="h-6 w-6 text-amber-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
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
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Cog6ToothIcon className="h-6 w-6 text-gray-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Profile;
