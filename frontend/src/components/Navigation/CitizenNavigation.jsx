/**
 * Citizen Navigation Component
 * Purpose: Report issues, track complaints, manage profile
 * Theme: Blue
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MapPinIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import toast from 'react-hot-toast';

const CitizenNavigation = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: HomeIcon },
    { name: 'Report Issue', path: '/dashboard/report', icon: PlusCircleIcon, highlight: true },
    { name: 'My Complaints', path: '/dashboard/complaints', icon: ClipboardDocumentListIcon },
    { name: 'Notifications', path: '/dashboard/notifications', icon: BellIcon, badge: unreadCount },
    { name: 'Nearby Issues', path: '/dashboard/map', icon: MapPinIcon },
    { name: 'Help / FAQs', path: '/dashboard/help', icon: QuestionMarkCircleIcon },
    { name: 'Emergency Contacts', path: '/dashboard/emergency', icon: PhoneIcon },
    { name: 'Ward Info', path: '/dashboard/ward-info', icon: BuildingOffice2Icon },
    { name: 'Profile', path: '/dashboard/profile', icon: UserCircleIcon },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.highlight
                      ? 'bg-white text-blue-900 hover:bg-blue-50 shadow-md'
                      : isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-2" />
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-12">
            <span className="text-white text-sm font-medium">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-md hover:bg-blue-700"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-blue-700 bg-blue-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center px-3 py-3 rounded-md text-base font-medium ${
                      item.highlight
                        ? 'bg-white text-blue-900'
                        : isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-6 w-6 mr-3" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Quick Action Button (FAB) */}
      <button
        onClick={() => navigate('/dashboard/report')}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-50 md:hidden"
        title="Report Issue"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </>
  );
};

export default CitizenNavigation;
