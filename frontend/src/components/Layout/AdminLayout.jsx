import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import NotificationPanel from '../Common/NotificationPanel';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      setShowUserMenu(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/admin/auth/login', { replace: true });
      }, 100);
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar - Light Theme */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-full mx-0 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              {/* Mobile sidebar toggle */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>

              {/* Logo and Title */}
              <div className="flex items-center ml-2 md:ml-0">
                <div className="flex-shrink-0 flex items-center">
                  <div className="bg-blue-600 p-2 rounded-lg mr-3">
                    <MapPinIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-gray-900">
                    <h1 className="text-xl font-bold">Snap & Report</h1>
                    <p className="text-gray-600 text-sm">BMC Admin Portal</p>
                  </div>
                </div>
              </div>

              {/* City Badge */}
              <div className="hidden lg:block ml-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  Mumbai BMC
                </span>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* User Info Badge - Hidden on small screens */}
              {user && (
                <div className="hidden lg:block text-gray-900 text-sm">
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                  <div className="text-gray-600">
                    {user.department && `${user.department} Dept`}
                    {user.assigned_ward && ` • ${user.assigned_ward} Ward`}
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <BellIcon className="h-6 w-6" />
                  {/* Notification badge */}
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white"></span>
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <UserCircleIcon className="h-6 w-6 mr-2" />
                  <span className="hidden md:block">
                    {user?.first_name || 'Admin'}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{user?.role}</p>
                      </div>
                      <a
                        href="/admin/dashboard/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <AdminSidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen}
          user={user}
          isMinimized={sidebarMinimized}
          setIsMinimized={setSidebarMinimized}
        />

        {/* Main Content - Flex grow to fill remaining space */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-gray-800 bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
