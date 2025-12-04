import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { isSuperAdmin, isDepartmentAdmin, isOfficer } from '../../utils/roleBasedAccess';
import {
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user } = useAuth();
  
  // Role-based access control - 3-tier admin hierarchy
  const userIsSuperAdmin = isSuperAdmin(user);
  const userIsDepartmentAdmin = isDepartmentAdmin(user);
  const userIsOfficer = isOfficer(user);
  
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, LANGUAGES: APP_LANGUAGES } = useLanguage();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    complaintUpdates: true,
    weeklyReports: true,
    theme: theme,
    language: language
  });

  // Update local state when theme or language changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      theme: theme,
      language: language
    }));
  }, [theme, language]);
  
  const [isSaving, setIsSaving] = useState(false);
  
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
      alert('Settings saved successfully!');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Access control - Only Super Admin can access system settings
  // Department Admins and Officers should use Profile page
  if (!userIsSuperAdmin) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldExclamationIcon className="mx-auto h-16 w-16 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">System Settings</h2>
          <p className="mt-2 text-gray-600">
            System Settings are only accessible to Super Admins.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Use the <strong>My Profile</strong> page to manage your personal preferences and notifications.
          </p>
          <a 
            href="/admin/profile" 
            className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to My Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Cog6ToothIcon className="h-8 w-8 text-gray-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and system preferences</p>
        </div>
      </div>

      {/* Super Admin Settings */}
      {userIsSuperAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">System Administration</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <span className="ml-3 text-gray-700">System Email Notifications</span>
              </label>
              <p className="ml-7 text-sm text-gray-500 mt-1">Receive critical system alerts</p>
            </div>
            
            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                  className="h-4 w-4 text-purple-600 rounded"
                />
                <span className="ml-3 text-gray-700">Weekly System Reports</span>
              </label>
              <p className="ml-7 text-sm text-gray-500 mt-1">Get weekly system performance reports</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Settings - Super Admin Only (city-wide) */}
      {userIsSuperAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-6">
            <BuildingOffice2Icon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">All Departments Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.complaintUpdates}
                  onChange={(e) => handleSettingChange('complaintUpdates', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">Complaint Update Notifications</span>
              </label>
              <p className="ml-7 text-sm text-gray-500 mt-1">Get notified of new complaints across all departments</p>
            </div>
            
            <div className="border-t pt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">SMS Alerts for High Priority Issues</span>
              </label>
              <p className="ml-7 text-sm text-gray-500 mt-1">Receive SMS for urgent complaints city-wide</p>
            </div>
          </div>
        </div>
      )}

      {/* User Preferences (All Roles) */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <UserGroupIcon className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">User Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={THEMES.LIGHT}>Light</option>
              <option value={THEMES.DARK}>Dark</option>
              <option value={THEMES.SYSTEM}>Auto (System)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {theme === THEMES.SYSTEM 
                ? `Using system theme (${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'})`
                : `Using ${theme} theme`}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {APP_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Current language: {APP_LANGUAGES.find(l => l.code === language)?.name || 'English'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Role Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Your Role: {userIsSuperAdmin ? 'Super Admin' : userIsAdmin ? 'Department Admin' : 'Officer'}</p>
            <p className="mt-1">
              {userIsSuperAdmin 
                ? 'You have access to all system settings and can manage the entire platform.'
                : userIsAdmin
                ? 'You can manage department-specific settings and view department reports.'
                : 'You have limited access to personal preferences only.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;