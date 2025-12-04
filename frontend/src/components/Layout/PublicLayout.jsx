import { Outlet, Link } from 'react-router-dom'
import { FiSearch, FiLogIn, FiUserPlus, FiShield } from 'react-icons/fi'
import { useEffect } from 'react'

const PublicLayout = () => {
  useEffect(() => {
    console.log('===== PUBLICLAYOUT MOUNTED =====');
    // Any one-time initialization can go here
    return () => {
      // Cleanup if needed
    }
  }, [])
  
  // Professional button styling
  const portalButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#4b5563', // gray-600
    fontWeight: '500',
    border: '1px solid #d1d5db', // gray-300
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.3s',
    fontSize: '14px',
    backgroundColor: 'white'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Public Header */}
      <header className="bg-white shadow-sm border-b border-civic-blue-100 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-civic-blue-600">
              🏛️ Snap & Report - Mumbai
            </Link>
            
            <nav className="flex items-center space-x-4">
              {/* BMC Officer Portal - Professional styling */}
              <Link
                to="/admin"
                style={portalButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#374151' // gray-700
                  e.currentTarget.style.borderColor = '#9ca3af' // gray-400
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4b5563' // gray-600
                  e.currentTarget.style.borderColor = '#d1d5db' // gray-300
                }}
                data-testid="bmc-portal-btn"
              >
                <FiShield style={{ width: '16px', height: '16px' }} />
                <span>BMC Officer Portal</span>
              </Link>
              
              <Link
                to="/auth/login"
                className="flex items-center space-x-2 text-gray-600 hover:text-civic-blue-600"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              
              <Link
                to="/auth/register"
                className="flex items-center space-x-2 bg-civic-blue-600 text-white px-4 py-2 rounded-lg hover:bg-civic-blue-700 transition-colors"
              >
                <FiUserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content area - full width for LandingPage */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
