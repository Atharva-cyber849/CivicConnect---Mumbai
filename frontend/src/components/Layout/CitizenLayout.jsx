import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CitizenLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      // Redirect to login after a short delay to allow state to update
      setTimeout(() => {
        navigate('/auth/login', { replace: true });
      }, 100);
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header with Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg">
        <div className="border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Government Logo & Title */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-lg leading-tight">BMC</h1>
                    <p className="text-blue-200 text-xs">Brihanmumbai Municipal Corporation</p>
                  </div>
                </div>
                <div className="hidden md:block h-8 w-px bg-blue-600 mx-2"></div>
                <div className="hidden md:block">
                  <h2 className="text-white font-semibold">Snap & Report Mumbai</h2>
                  <p className="text-blue-200 text-xs">Citizen Grievance Portal</p>
                </div>
              </div>

              {/* User Info & Actions */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-blue-800 px-4 py-2 rounded-lg">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user?.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{user?.first_name || 'Citizen'}</p>
                    <p className="text-blue-300 text-xs">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-blue-800/50 backdrop-blur-sm">
          <Sidebar userType="citizen" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CitizenLayout;
