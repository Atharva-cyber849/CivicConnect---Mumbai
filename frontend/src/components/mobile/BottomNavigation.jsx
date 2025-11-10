import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  PlusCircleIcon,
  ListBulletIcon,
  BellIcon,
  UserIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid,
  BuildingOffice2Icon as BuildingOffice2IconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';

const BottomNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on desktop or admin pages
  const shouldShow = window.innerWidth <= 768 && !location.pathname.includes('/admin');

  if (!shouldShow) return null;

  const citizenTabs = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: HomeIcon,
      activeIcon: HomeIconSolid
    },
    {
      name: 'Report',
      path: '/dashboard/report',
      icon: PlusCircleIcon,
      activeIcon: PlusCircleIconSolid
    },
    {
      name: 'Complaints',
      path: '/dashboard/complaints',
      icon: ListBulletIcon,
      activeIcon: ListBulletIconSolid
    },
    {
      name: 'Alerts',
      path: '/dashboard/notifications',
      icon: BellIcon,
      activeIcon: BellIconSolid
    },
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid
    }
  ];

  const adminTabs = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: BuildingOffice2Icon,
      activeIcon: BuildingOffice2IconSolid
    },
    {
      name: 'Complaints',
      path: '/admin/complaints',
      icon: ListBulletIcon,
      activeIcon: ListBulletIconSolid
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Cog6ToothIcon,
      activeIcon: Cog6ToothIconSolid
    }
  ];

  const tabs = user?.role === 'citizen' ? citizenTabs : adminTabs;

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className="h-20 md:hidden"></div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            const IconComponent = active ? tab.activeIcon : tab.icon;
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className={`h-6 w-6 mb-1 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.name}
                </span>
                {active && (
                  <div className="absolute -top-1 h-1 w-8 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Notification Badge */}
        {user?.unread_notifications_count > 0 && (
          <div className="absolute top-1 right-1/4 transform translate-x-3 -translate-y-1">
            <div className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {user.unread_notifications_count > 9 ? '9+' : user.unread_notifications_count}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BottomNavigation;