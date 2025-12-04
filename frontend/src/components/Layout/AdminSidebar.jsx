import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  ChartPieIcon,
  UsersIcon,
  CogIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../config/constants';
import toast from 'react-hot-toast';

const AdminSidebar = ({ open, setOpen, user, isMinimized, setIsMinimized }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Handle logout with navigation
  const handleLogout = () => {
    try {
      logout();
      toast.success('Logged out successfully');
      setOpen(false);
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/admin/auth/login', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };
  
  // Handle navigation with error handling
  const handleNavigation = (href) => {
    try {
      navigate(href);
      // Close mobile sidebar after navigation
      if (open) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
  
  // Determine admin tier for 3-tier hierarchy
  const isSuperAdmin = user?.role === USER_ROLES.ADMIN && user?.is_superuser;
  const isDepartmentAdmin = user?.role === USER_ROLES.ADMIN && !user?.is_superuser;
  const isBMCOfficer = user?.role === USER_ROLES.DEPARTMENT_STAFF;

  // Define navigation items based on user role and admin tier
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: ChartBarIcon,
        description: isSuperAdmin ? 'System Overview' : isDepartmentAdmin ? 'Department Overview' : 'My Assignments'
      },
      {
        name: 'Complaints',
        href: '/admin/complaints',
        icon: ClipboardDocumentListIcon,
        description: isSuperAdmin ? 'All City Complaints' : isDepartmentAdmin ? 'Department Complaints' : 'Assigned Complaints'
      },
      {
        name: 'Map View',
        href: '/admin/map',
        icon: MapIcon,
        description: isSuperAdmin ? 'City-wide Geographic View' : 'Ward Geographic View'
      }
    ];

    // BMC Ward Dashboard - Super Admin sees all wards, Department Admin sees their ward only
    if (isSuperAdmin) {
      baseItems.push({
        name: 'BMC Ward Dashboard',
        href: '/admin/bmc-ward-dashboard',
        icon: BuildingOffice2Icon,
        description: 'All Wards Management'
      });
    }

    // Zone Management - Super Admin only (city-wide access)
    if (isSuperAdmin) {
      baseItems.push({
        name: 'Zone Management',
        href: '/admin/bmc-zone-management',
        icon: MapIcon,
        description: 'Mumbai Zone Overview'
      });
    }

    // Reports - different scope based on role
    baseItems.push({
      name: 'Reports',
      href: '/admin/reports',
      icon: ChartPieIcon,
      description: isSuperAdmin ? 'City-Wide Analytics' : isDepartmentAdmin ? 'Department Analytics' : 'My Performance'
    });

    // Officers Management - Super Admin: all officers, Department Admin: department officers only
    if (isSuperAdmin) {
      baseItems.push({
        name: 'All Officers',
        href: '/admin/officers',
        icon: UsersIcon,
        description: 'Manage All BMC Officers'
      });
    } else if (isDepartmentAdmin) {
      baseItems.push({
        name: 'Department Officers',
        href: '/admin/officers',
        icon: UsersIcon,
        description: 'Manage Department Staff'
      });
    }

    // ===== SUPER ADMIN ONLY SECTIONS =====
    if (isSuperAdmin) {
      baseItems.push({
        name: 'Self Registrations',
        href: '/admin/self-register',
        icon: UserPlusIcon,
        description: 'Review Self-Registered Users'
      });
      
      baseItems.push({
        name: 'Registration Requests',
        href: '/admin/registration-requests',
        icon: UserGroupIcon,
        description: 'Pending Registration Approvals'
      });
      
      baseItems.push({
        name: 'Create Admin',
        href: '/admin/create-admin',
        icon: ShieldCheckIcon,
        description: 'Create Department Admin'
      });

      baseItems.push({
        name: 'Create Super Admin',
        href: '/admin/create-super-admin',
        icon: ShieldCheckIcon,
        description: 'Create Super Admin Account'
      });

      // System Settings - Super Admin only
      baseItems.push({
        name: 'System Settings',
        href: '/admin/settings',
        icon: CogIcon,
        description: 'System Configuration'
      });
    }

    // Profile Settings for Department Admin and Officers
    if (isDepartmentAdmin || isBMCOfficer) {
      baseItems.push({
        name: 'My Profile',
        href: '/admin/profile',
        icon: CogIcon,
        description: 'Profile & Preferences'
      });
    }

    return baseItems;
  };

  // Get user role display label based on admin tier
  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isDepartmentAdmin) return 'Department Admin';
    if (isBMCOfficer) return 'BMC Officer';
    return user?.role || 'User';
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    if (href === '/admin/dashboard' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar - Sticky (scrolls with page) */}
      <div className={`hidden md:flex md:flex-col md:sticky md:top-16 md:h-[calc(100vh-64px)] transition-all duration-300 ${
        isMinimized ? 'md:w-20' : 'md:w-64'
      }`}>
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-sm overflow-hidden">
          {/* User Info Section */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-[#0078D7] to-blue-600">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${isMinimized ? 'flex-col' : ''}`}>
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold text-[#0078D7]">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  </div>
                </div>
                {!isMinimized && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-blue-100">
                      {getRoleLabel()} {user?.assigned_ward && `• ${user.assigned_ward} Ward`}
                    </p>
                  </div>
                )}
              </div>
              {/* Minimize Button */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
                title={isMinimized ? 'Expand Sidebar' : 'Minimize Sidebar'}
              >
                {isMinimized ? (
                  <ChevronRightIcon className="h-5 w-5 text-white" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className={`flex-1 ${isMinimized ? 'px-1 py-4 space-y-2' : 'px-2 py-4 space-y-1'}`}>
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    title={isMinimized ? item.name : ''}
                    className={`w-full text-left ${
                      active
                        ? 'bg-[#0078D7] text-white border-r-4 border-[#FF9E00]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#0078D7]'
                    } group flex items-center ${isMinimized ? 'justify-center' : 'px-3'} py-2 text-sm font-medium rounded-l-lg transition-colors duration-200`}
                  >
                    <item.icon
                      className={`${
                        active ? 'text-white' : 'text-gray-400 group-hover:text-[#0078D7]'
                      } flex-shrink-0 h-5 w-5`}
                    />
                    {!isMinimized && (
                      <div className="flex-1 ml-3">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              active ? 'bg-white text-[#0078D7]' : 'bg-[#FF9E00] text-white'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${active ? 'text-blue-100' : 'text-gray-500'} mt-0.5`}>
                          {item.description}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Department Badge */}
            {user?.department && !isMinimized && (
              <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{user.department}</p>
                    <p className="text-xs text-gray-500">Department</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help/Support Link */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleNavigation('/help')}
                title="Help & Support"
                className={`w-full flex items-center ${isMinimized ? 'justify-center' : ''} px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200`}
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!isMinimized && <span className="ml-2">Help & Support</span>}
              </button>
            </div>

            {/* Logout Button */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleLogout}
                title="Sign Out"
                className={`w-full flex items-center ${isMinimized ? 'justify-center' : ''} px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200`}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
                {!isMinimized && <span className="ml-2">Sign Out</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } top-16 flex flex-col`}>
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 shadow-lg overflow-hidden">
          {/* Mobile User Info */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-[#0078D7] to-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm font-bold text-[#0078D7]">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-blue-100">{getRoleLabel()}</p>
                </div>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full text-left ${
                    active
                      ? 'bg-[#0078D7] text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-[#0078D7]'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200`}
                >
                  <item.icon
                    className={`${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-[#0078D7]'
                    } flex-shrink-0 mr-3 h-5 w-5`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          active ? 'bg-white text-[#0078D7]' : 'bg-[#FF9E00] text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Mobile Logout Button */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="ml-2">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;