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
      <div className="min-h-96 flex items-center justify-center p-8">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
              <ShieldExclamationIcon className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">System Settings</h2>
            <p className="text-gray-600 mb-2">
              System Settings are only accessible to Super Admins.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Use the <strong>My Profile</strong> page to manage your personal preferences and notifications.
            </p>
            <a 
              href="/admin/profile" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Users className="h-5 w-5" />
              <span>Go to My Profile</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="settings-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#settings-grid)" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Cog6ToothIcon className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Settings</h1>
              <p className="text-purple-100 text-lg">Manage your account and system preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Super Admin Settings */}
      {userIsSuperAdmin && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">System Administration</h2>
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">All Departments Settings</h2>
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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">User Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              <option value={THEMES.LIGHT}>Light</option>
              <option value={THEMES.DARK}>Dark</option>
              <option value={THEMES.SYSTEM}>Auto (System)</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {theme === THEMES.SYSTEM 
                ? `Using system theme (${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'})`
                : `Using ${theme} theme`}
            </p>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            >
              {APP_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
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
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save className="h-5 w-5" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Role Information */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-gray-900 text-lg mb-2">Your Role: {userIsSuperAdmin ? 'Super Admin' : userIsAdmin ? 'Department Admin' : 'Officer'}</p>
            <p className="text-gray-600">
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