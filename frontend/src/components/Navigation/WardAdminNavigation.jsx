/**
 * Ward Admin Navigation Component
 * Purpose: View and manage complaints within assigned ward
 * Theme: Green
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  DocumentChartBarIcon,
  UsersIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ChartPieIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../hooks/useRole';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

const WardAdminNavigation = () => {
  const { logout, user } = useAuth();
  const role = useRole();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch pending complaints count for this ward
  const { data: complaintsData } = useQuery({
    queryKey: ['ward-pending-complaints', user?.ward],
    queryFn: async () => {
      const data = await adminApi.getComplaints({ status: 'PENDING' });
      return data?.filter(c => c.ward === user?.ward) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user?.ward,
  });

  const pendingCount = complaintsData?.length || 0;

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
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartBarIcon },
    {
      name: 'Ward Complaints',
      icon: ClipboardDocumentListIcon,
      submenu: [
        { name: 'Pending', path: '/admin/complaints?status=PENDING', icon: ClockIcon },
        { name: 'In Progress', path: '/admin/complaints?status=IN_PROGRESS', icon: ArrowPathIcon },
        { name: 'Resolved', path: '/admin/complaints?status=RESOLVED', icon: CheckCircleIcon },
        { name: 'Unassigned', path: '/admin/complaints?status=UNASSIGNED', icon: ExclamationCircleIcon },
      ],
      badge: pendingCount
    },
    { name: 'Ward Map', path: '/admin/map', icon: MapIcon },
    { name: 'Reports', path: '/admin/reports', icon: DocumentChartBarIcon },
    { name: 'Analytics', path: '/admin/analytics', icon: ChartPieIcon },
    { name: 'Officer Workload', path: '/admin/officer-workload', icon: UsersIcon },
    { name: 'Citizen Directory', path: '/admin/citizens', icon: UsersIcon },
    { name: 'Profile', path: '/admin/profile', icon: UserCircleIcon },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Badge */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg">
                  <MapIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <span className="text-lg font-bold text-white">Ward Admin</span>
                  <p className="text-xs text-green-100">{role.getScopeName()}</p>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                item.submenu ? (
                  <div key={item.name} className="relative group">
                    <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-green-500 hover:text-white transition-colors">
                      <item.icon className="h-5 w-5 mr-1.5" />
                      <span>{item.name}</span>
                      {item.badge > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                    {/* Dropdown */}
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {item.submenu.map((subitem) => (
                        <NavLink
                          key={subitem.path}
                          to={subitem.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 first:rounded-t-md last:rounded-b-md"
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
                          ? 'bg-green-800 text-white'
                          : 'text-green-100 hover:bg-green-500 hover:text-white'
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
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-red-500 hover:text-white transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <MapIcon className="h-8 w-8 text-white" />
              <div className="ml-2">
                <span className="text-lg font-bold text-white">Ward Admin</span>
                <p className="text-xs text-green-100">{role.getScopeName()}</p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-md hover:bg-green-500"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-green-500">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) =>
                item.submenu ? (
                  <div key={item.name}>
                    <div className="flex items-center px-3 py-2 text-base font-medium text-green-100">
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
                          className="flex items-center px-3 py-2 text-sm text-green-100 hover:bg-green-500"
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
                        isActive ? 'bg-green-800 text-white' : 'text-green-100 hover:bg-green-500'
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
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-green-100 hover:bg-red-500"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Quick Export Button */}
      <button
        onClick={() => navigate('/admin/export-daily')}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-transform hover:scale-110 z-50 md:hidden"
        title="Export Daily Summary"
      >
        <DocumentArrowDownIcon className="h-6 w-6" />
      </button>
    </>
  );
};

export default WardAdminNavigation;
