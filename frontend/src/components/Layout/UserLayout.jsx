import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Plus, 
  FileText, 
  Map, 
  Bell, 
  User, 
  Menu,
  X,
  LogOut,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const UserLayout = ({ children }) => {
  console.log('📐 UserLayout rendering...')
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = React.useRef(null)

  // Handle click outside to close user menu
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: location.pathname === '/dashboard' },
    { name: 'Report Issue', href: '/dashboard/report', icon: Plus, current: location.pathname === '/dashboard/report' },
    { name: 'My Complaints', href: '/dashboard/complaints', icon: FileText, current: location.pathname.startsWith('/dashboard/complaints') },
    { name: 'Map View', href: '/dashboard/map', icon: Map, current: location.pathname === '/dashboard/map' },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, current: location.pathname === '/dashboard/notifications' },
    { name: 'Profile', href: '/dashboard/profile', icon: User, current: location.pathname === '/dashboard/profile' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Snap & Report</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent navigation={navigation} user={user} logout={logout} mobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:flex lg:flex-col">
        <div className="bg-white shadow-lg border-r border-blue-100 h-full">
          <div className="flex items-center p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">🏛️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Snap & Report</h1>
                <p className="text-blue-100 text-xs">Citizen Portal</p>
              </div>
            </div>
          </div>
          <SidebarContent navigation={navigation} user={user} logout={logout} />
        </div>
      </div>

      {/* Header */}
      <div className="lg:pl-64">
        <div className="bg-white shadow-sm border-b border-blue-100 lg:border-0">
          <div className="flex items-center justify-between p-4 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-2 lg:ml-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getCurrentPageTitle(location.pathname)}
                </h2>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg p-2"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="hidden md:block">
                    <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Help & Support
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, user, logout, mobile = false }) => {
  return (
    <div className="flex flex-col h-full">
      {/* User info (mobile only) */}
      {mobile && (
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${item.current ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/help"
          className="flex items-center px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HelpCircle className="mr-3 h-5 w-5 text-gray-400" />
          Help & Support
        </Link>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

const getCurrentPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/dashboard/report': 'Report New Issue',
    '/dashboard/complaints': 'My Complaints',
    '/dashboard/map': 'Map View',
    '/dashboard/notifications': 'Notifications',
    '/dashboard/profile': 'Profile Settings'
  }
  
  if (pathname.startsWith('/dashboard/complaints/')) {
    return 'Complaint Details'
  }
  
  return titles[pathname] || 'Dashboard'
}

export default UserLayout
