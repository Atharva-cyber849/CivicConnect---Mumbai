import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ListBulletIcon,
  UsersIcon,
  CogIcon,
  MapPinIcon,
  BellIcon,
  UserIcon,
  ChartBarIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'

const Sidebar = ({ userType }) => {
  const citizenLinks = [
    { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', end: true },
    { to: '/dashboard/report', icon: PlusCircleIcon, label: 'Report Issue' },
    { to: '/dashboard/complaints', icon: ListBulletIcon, label: 'My Complaints' },
    { to: '/dashboard/mumbai-ward-services', icon: BuildingOffice2Icon, label: 'BMC Ward Services' },
    { to: '/dashboard/map', icon: MapPinIcon, label: 'Map View' },
    { to: '/dashboard/notifications', icon: BellIcon, label: 'Notifications' },
    { to: '/dashboard/profile', icon: UserIcon, label: 'Profile' },
  ]

  const adminLinks = [
    { to: '/admin', icon: HomeIcon, label: 'Dashboard', end: true },
    { to: '/admin/dashboard', icon: HomeIcon, label: 'Dashboard' },
    { to: '/admin/complaints', icon: DocumentTextIcon, label: 'All Complaints' },
    { to: '/admin/map', icon: MapPinIcon, label: 'Map View' },
    { to: '/admin/officer-map', icon: MapPinIcon, label: 'Officer Map' },
    { to: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
    { to: '/admin/sla-dashboard', icon: ChartBarIcon, label: 'SLA Dashboard' },
    { to: '/admin/reports', icon: ChartBarIcon, label: 'Reports' },
    { to: '/admin/officers', icon: UsersIcon, label: 'Officers' },
    { to: '/admin/settings', icon: CogIcon, label: 'Settings' },
  ]

  const links = userType === 'admin' ? adminLinks : citizenLinks

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {userType === 'admin' ? 'Admin Panel' : 'Citizen Portal'}
        </h2>
        
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="mr-3 h-5 w-5" />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
