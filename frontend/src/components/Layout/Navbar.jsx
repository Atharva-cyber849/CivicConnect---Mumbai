import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  UserIcon, 
  BellIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to={user?.role === 'citizen' ? '/dashboard' : '/admin'} 
            className="text-xl font-bold text-blue-600 hover:text-blue-700"
          >
            🏛️ Snap & Report Mumbai
          </Link>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <UserIcon className="h-5 w-5" />
              <span>{user?.first_name} {user?.last_name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <BellIcon className="h-6 w-6" />
              {/* Notification badge would go here */}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
