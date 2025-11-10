import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Header = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    // Show success message
    toast.success('Logged out successfully')
    
    // Redirect to login page
    navigate('/auth/login')
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand/Logo */}
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-primary-600">
              CivicConnect
            </a>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* User info */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || user.email}
                  </span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header