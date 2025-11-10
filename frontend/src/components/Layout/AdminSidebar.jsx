import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { USER_ROLES } from '../../config/constants';

const AdminSidebar = ({ open, setOpen, user }) => {
  const location = useLocation();
  
  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: ChartBarIcon,
        description: 'Overview & Statistics'
      },
      {
        name: 'Complaints',
        href: '/admin/complaints',
        icon: ClipboardDocumentListIcon,
        description: 'Manage Complaints',
        badge: '12' // This would come from real data
      },
      {
        name: 'Map View',
        href: '/admin/map',
        icon: MapIcon,
        description: 'Geographic View'
      },
      {
        name: 'Reports',
        href: '/admin/reports',
        icon: ChartPieIcon,
        description: 'Analytics & Insights'
      }
    ];

    // Add officer management for admins and super admins
    if (user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPER_ADMIN) {
      baseItems.push({
        name: 'Officers',
        href: '/admin/officers',
        icon: UsersIcon,
        description: 'Manage Officers'
      });
    }

    // Add super admin specific items (checking both role and is_superuser)
    if (user?.role === USER_ROLES.ADMIN && user?.is_superuser) {
      baseItems.push({
        name: 'Registration Requests',
        href: '/admin/registration-requests',
        icon: UserGroupIcon,
        description: 'Approve Admin Requests',
        badge: '3' // This would come from real data
      });
      
      baseItems.push({
        name: 'Create Super Admin',
        href: '/admin/create-super-admin',
        icon: ShieldCheckIcon,
        description: 'Create Super Admin Account'
      });
    }

    // Add settings for all admin users
    baseItems.push({
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon,
      description: 'Profile & Preferences'
    });

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  // Quick stats for sidebar (would come from API)
  const quickStats = [
    { label: 'Pending', count: 24, color: 'text-yellow-600', icon: ClockIcon },
    { label: 'In Progress', count: 18, color: 'text-blue-600', icon: ExclamationTriangleIcon },
    { label: 'Resolved', count: 156, color: 'text-green-600', icon: CheckCircleIcon }
  ];

  const isActive = (href) => {
    if (href === '/admin/dashboard' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:top-16">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-sm">
          {/* User Info Section */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-[#0078D7] to-blue-600">
            <div className="flex items-center">
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
                  {user?.role} {user?.assigned_ward && `• ${user.assigned_ward} Ward`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigationItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`${
                      active
                        ? 'bg-[#0078D7] text-white border-r-4 border-[#FF9E00]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#0078D7]'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200`}
                  >
                    <item.icon
                      className={`${
                        active ? 'text-white' : 'text-gray-400 group-hover:text-[#0078D7]'
                      } flex-shrink-0 -ml-1 mr-3 h-5 w-5`}
                    />
                    <div className="flex-1">
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
                  </NavLink>
                );
              })}
            </nav>

            {/* Quick Stats Section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Quick Stats
              </h3>
              <div className="space-y-2">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <stat.icon className={`h-4 w-4 ${stat.color} mr-2`} />
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Badge */}
            {user?.department && (
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
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      } top-16`}>
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 shadow-lg">
          {/* Mobile User Info */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-[#0078D7] to-blue-600">
            <div className="flex items-center">
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
                <p className="text-xs text-blue-100">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`${
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
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;