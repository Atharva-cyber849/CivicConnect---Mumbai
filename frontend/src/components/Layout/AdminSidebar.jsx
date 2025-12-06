/**
 * AdminSidebar Component (Vertical Navigation)
 * 
 * This is a vertical sidebar navigation for admin interfaces.
 * It complements the new horizontal top navigation system (RoleBasedNavigation).
 * 
 * For top navigation bar, use: RoleBasedNavigation component
 * For vertical sidebar, use: This AdminSidebar component
 * 
 * Choose based on your layout preference:
 * - Top navigation: Modern, space-efficient, better for mobile
 * - Sidebar: Traditional admin panel layout, more navigation space
 * 
 * Features:
 * - Role-based navigation items (Super Admin, Dept Admin, Ward Admin/Officer)
 * - Collapsible/expandable (desktop)
 * - Mobile drawer
 * - Active state highlighting
 * - User profile display
 * - Logout functionality
 */

import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { useRole } from '../../hooks/useRole';
import { adminApi } from '../../api/adminApi';
import { BMC_DEPARTMENTS } from '../../utils/constants';
import toast from 'react-hot-toast';

const AdminSidebar = ({ open, setOpen, user, isMinimized, setIsMinimized }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const role = useRole();
  
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
      // Navigation error handled silently
    }
  };
  
  // Role-based access using useRole hook
  const isSuperAdmin = role.isSuperAdmin;
  const isDepartmentAdmin = role.isExactlyDeptAdmin;
  const isBMCOfficer = role.isExactlyWardAdmin;

  // Fetch real-time data for badges based on role
  // Super Admin: Pending registration requests
  const { data: registrationsData } = useQuery({
    queryKey: ['pending-registrations-count'],
    queryFn: async () => {
      if (!isSuperAdmin) return [];
      const data = await adminApi.getRegistrationRequests();
      return data?.filter(r => r.status === 'PENDING') || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: isSuperAdmin,
  });

  // Department Admin: Unassigned complaints for department
  const { data: deptComplaintsData } = useQuery({
    queryKey: ['dept-unassigned-complaints', user?.department],
    queryFn: async () => {
      if (!isDepartmentAdmin || !user?.department) return [];
      const data = await adminApi.getComplaints({ status: 'UNASSIGNED' });
      return data?.filter(c => c.department === user?.department) || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: isDepartmentAdmin && !!user?.department,
  });

  // Ward Admin/Officer: Pending complaints for ward
  const { data: wardComplaintsData } = useQuery({
    queryKey: ['ward-pending-complaints', user?.ward],
    queryFn: async () => {
      if (!isBMCOfficer || !user?.ward) return [];
      const data = await adminApi.getComplaints({ status: 'PENDING' });
      return data?.filter(c => c.ward === user?.ward) || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: isBMCOfficer && !!user?.ward,
  });

  // Calculate badge counts
  const pendingRegistrations = registrationsData?.length || 0;
  const unassignedComplaints = deptComplaintsData?.length || 0;
  const pendingComplaints = wardComplaintsData?.length || 0;

  // Fetch department data if user.department is an ID
  const { data: departmentData } = useQuery({
    queryKey: ['department-name', user?.department],
    queryFn: async () => {
      if (!user?.department || !isDepartmentAdmin) return null;
      try {
        const departments = await adminApi.getDepartments();
        return departments?.find(d => d.id === user.department || d.id === parseInt(user.department));
      } catch (error) {
        console.error('Error fetching department:', error);
        return null;
      }
    },
    enabled: !!user?.department && isDepartmentAdmin,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

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
        description: isSuperAdmin ? 'All City Complaints' : isDepartmentAdmin ? 'Department Complaints' : 'Assigned Complaints',
        badge: isDepartmentAdmin ? unassignedComplaints : isBMCOfficer ? pendingComplaints : undefined
      },
      {
        name: 'Map View',
        href: '/admin/map',
        icon: MapIcon,
        description: isSuperAdmin ? 'City-wide Geographic View' : 'Ward Geographic View'
      }
    ];

    // Analytics - Available for all admin roles
    baseItems.push({
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartPieIcon,
      description: isSuperAdmin ? 'System Analytics' : isDepartmentAdmin ? 'Department Trends' : 'Performance Metrics'
    });

    // SLA Dashboard - Available for Ward Admin and above
    if (!isBMCOfficer || isDepartmentAdmin || isSuperAdmin) {
      baseItems.push({
        name: 'SLA Tracking',
        href: '/admin/sla-dashboard',
        icon: ClockIcon,
        description: 'Service Level Agreement Monitoring'
      });
    }

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
      // User Management - Consolidated registration management
      baseItems.push({
        name: 'User Management',
        href: '/admin/self-register',
        icon: UserGroupIcon,
        description: 'Manage Users & Registrations',
        badge: pendingRegistrations
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
    return role.getTierName();
  };

  // Format department name for display
  const getDepartmentName = () => {
    if (!user?.department) return null;
    
    // If we have department data from API, use it
    if (departmentData) {
      return departmentData.name || departmentData.label || 'Department';
    }
    
    // If user.department is a number (ID), show loading or ID
    if (!isNaN(user.department)) {
      return `Department ${user.department}`;
    }
    
    // Try to find department in constants
    const dept = BMC_DEPARTMENTS?.find(d => d.value === user.department);
    if (dept) return dept.label;
    
    // Fallback: format the raw department value
    return user.department
      .toString()
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
                      {getRoleLabel()}
                      {user?.assigned_ward && ` • ${user.assigned_ward} Ward`}
                      {isDepartmentAdmin && getDepartmentName() && ` • ${getDepartmentName()}`}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-blue-200 mt-0.5">
                        {user.email}
                      </p>
                    )}
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
                    <p className="text-xs font-medium text-gray-900">{getDepartmentName()}</p>
                    <p className="text-xs text-gray-500">Department</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help/Support Link */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleNavigation('/admin/help')}
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
                  <p className="text-xs text-blue-100">
                    {getRoleLabel()}
                    {isDepartmentAdmin && getDepartmentName() && ` • ${getDepartmentName()}`}
                  </p>
                  {user?.email && (
                    <p className="text-xs text-blue-200 mt-0.5 truncate max-w-[180px]">
                      {user.email}
                    </p>
                  )}
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