/**
 * Super Admin Navigation Component
 * Purpose: Manage entire system, departments, wards, users, and analytics
 * Theme: Dark/Royal Blue
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  BuildingOffice2Icon,
  MapIcon,
  ChartPieIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
  FireIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

const SuperAdminNavigation = () => {
  const { logout, user } = useAuth();
  const role = useRole();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch pending registration requests count
  const { data: registrationsData } = useQuery({
    queryKey: ['pending-registrations-count'],
    queryFn: async () => {
      const data = await adminApi.getRegistrationRequests();
      return data?.filter(r => r.status === 'PENDING') || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const pendingRegistrations = registrationsData?.length || 0;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/auth/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { name: 'Master Dashboard', path: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'All Complaints', path: '/admin/complaints', icon: ClipboardDocumentListIcon },
    {
      name: 'Manage Users',
      icon: UsersIcon,
      submenu: [
        { name: 'All Users', path: '/admin/users', icon: UsersIcon },
        { name: 'Citizens', path: '/admin/users?role=CITIZEN', icon: UsersIcon },
        { name: 'Ward Admins', path: '/admin/users?role=WARD_ADMIN', icon: MapIcon },
        { name: 'Dept Admins', path: '/admin/users?role=DEPT_ADMIN', icon: BuildingOffice2Icon },
        { name: 'Super Admins', path: '/admin/users?role=SUPER_ADMIN', icon: ShieldCheckIcon },
        { name: 'Create Admin', path: '/admin/create-admin', icon: UserPlusIcon },
      ],
      badge: pendingRegistrations
    },
    { name: 'Manage Departments', path: '/admin/departments', icon: BuildingOffice2Icon },
    { name: 'Manage Wards', path: '/admin/wards', icon: MapIcon },
    {
      name: 'Reports & Insights',
      icon: ChartPieIcon,
      submenu: [
        { name: 'Complaint Trends', path: '/admin/reports/trends', icon: ChartPieIcon },
        { name: 'SLA Compliance', path: '/admin/sla-dashboard', icon: ClipboardDocumentCheckIcon },
        { name: 'Dept Comparison', path: '/admin/reports/departments', icon: BuildingOffice2Icon },
        { name: 'Ward Comparison', path: '/admin/reports/wards', icon: MapIcon },
        { name: 'Predictive Heatmap', path: '/admin/analytics', icon: FireIcon },
      ]
    },
    { name: 'System Logs', path: '/admin/logs', icon: DocumentTextIcon },
    { name: 'Bulk Import/Export', path: '/admin/bulk-operations', icon: ArrowUpTrayIcon },
    { name: 'Audit & Compliance', path: '/admin/audit', icon: ClipboardDocumentCheckIcon },
    { name: 'Settings', path: '/admin/settings', icon: CogIcon },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-gradient-to-r from-indigo-900 to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Badge */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-2 rounded-lg shadow-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-indigo-900" />
                </div>
                <div className="ml-3">
                  <span className="text-lg font-bold text-white">Super Admin</span>
                  <p className="text-xs text-blue-200">System Master Control</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                item.submenu ? (
                  <div key={item.name} className="relative group">
                    <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors">
                      <item.icon className="h-5 w-5 mr-1.5" />
                      <span>{item.name}</span>
                      {item.badge > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                    {/* Dropdown */}
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.submenu.map((subitem) => (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 first:rounded-t-md last:rounded-b-md"
                        >
                          <subitem.icon className="h-4 w-4 mr-2" />
                          {subitem.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-lg'
                          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 mr-1.5" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gradient-to-r from-indigo-900 to-blue-900 shadow-lg">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-yellow-400" />
              <div className="ml-2">
                <span className="text-lg font-bold text-white">Super Admin</span>
                <p className="text-xs text-blue-200">Master Control</p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-md hover:bg-blue-800"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-blue-800">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) =>
                item.submenu ? (
                  <div key={item.name}>
                    <div className="flex items-center px-3 py-2 text-base font-medium text-blue-100">
                      <item.icon className="h-6 w-6 mr-3" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.submenu.map((subitem) => (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center px-3 py-2 text-sm text-blue-100 hover:bg-blue-800"
                        >
                          <subitem.icon className="h-5 w-5 mr-2" />
                          {subitem.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-base font-medium ${
                        isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-800'
                      }`
                    }
                  >
                    <item.icon className="h-6 w-6 mr-3" />
                    {item.name}
                  </NavLink>
                )
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-red-600"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Quick Access Button */}
      <button
        onClick={() => navigate('/admin/settings')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 md:hidden"
        title="System Settings"
      >
        <CogIcon className="h-6 w-6" />
      </button>
    </>
  );
};

export default SuperAdminNavigation;
