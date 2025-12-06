import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import AdminRegistrationRequests from '../../components/admin/AdminRegistrationRequests';

/**
 * UserManagement - Unified user and admin management page
 * Consolidates all registration and user management functions
 */
const UserManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('registrations');

  const tabs = [
    {
      id: 'registrations',
      name: 'Registration Requests',
      icon: ClipboardDocumentCheckIcon,
      description: 'Review pending registration requests'
    },
    {
      id: 'create-admin',
      name: 'Create Department Admin',
      icon: ShieldCheckIcon,
      description: 'Create new department administrators'
    },
    {
      id: 'create-super',
      name: 'Create Super Admin',
      icon: UserPlusIcon,
      description: 'Create new super administrators'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="user-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#user-grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <UserGroupIcon className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">User Management</h1>
              <p className="text-purple-100 text-lg">
                Manage registrations, create administrators, and oversee system access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 group relative py-4 px-6 text-center border-b-2 font-medium text-sm transition-all
                    ${activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'registrations' && (
            <div>
              <AdminRegistrationRequests />
            </div>
          )}

          {activeTab === 'create-admin' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Department Admin</h3>
                  <p className="text-gray-600">
                    Create a new department administrator account
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/create-admin')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  Go to Admin Creation Form
                </button>
              </div>
            </div>
          )}

          {activeTab === 'create-super' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlusIcon className="h-9 w-9 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Super Admin</h3>
                  <p className="text-gray-600 mb-4">
                    Create a new super administrator with full system access
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>Warning:</strong> Super Admins have complete system control. Use with extreme caution.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/create-super-admin')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  Go to Super Admin Creation Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Pending Requests</h3>
              <p className="text-sm text-gray-500">Review registrations</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('registrations')}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Department Admins</h3>
              <p className="text-sm text-gray-500">Create new admin</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('create-admin')}
            className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Create Admin →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserPlusIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Super Admins</h3>
              <p className="text-sm text-gray-500">Create super admin</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('create-super')}
            className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Create Super Admin →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
