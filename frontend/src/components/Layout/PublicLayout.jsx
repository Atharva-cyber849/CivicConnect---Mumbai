import { Outlet, Link } from 'react-router-dom'
import { FiSearch, FiLogIn, FiUserPlus, FiShield } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { clearAllCaches } from '../../utils/clearCache'

const PublicLayout = () => {
  // Force re-render to avoid cache issues
  const [renderKey, setRenderKey] = useState(Date.now())
  
  useEffect(() => {
    // Clear all caches on mount to ensure fresh content
    clearAllCaches()
    
    // Force component update every time it mounts
    setRenderKey(Date.now())
    console.log('PublicLayout mounted with BMC Portal - Key:', renderKey)
    
    // Force browser to not cache this component
    const metaElement = document.createElement('meta')
    metaElement.httpEquiv = 'Cache-Control'
    metaElement.content = 'no-cache, no-store, must-revalidate'
    document.head.appendChild(metaElement)
    
    return () => {
      // Cleanup
      if (document.head.contains(metaElement)) {
        document.head.removeChild(metaElement)
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" key={renderKey}>
      {/* Public Header */}
      <header className="bg-white shadow-sm border-b border-civic-blue-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-civic-blue-600">
              🏛️ CivicConnect Mumbai
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link
                to="/track"
                className="flex items-center space-x-2 text-civic-blue-600 hover:text-civic-blue-700 font-medium"
              >
                <FiSearch className="w-4 h-4" />
                <span>Track Complaint</span>
              </Link>

              {/* BMC Officer Portal - Professional styling */}
              <a
                href="/admin"
                style={portalButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.color = '#374151' // gray-700
                  e.target.style.borderColor = '#9ca3af' // gray-400
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#4b5563' // gray-600
                  e.target.style.borderColor = '#d1d5db' // gray-300
                }}
                data-testid="bmc-portal-btn"
                key={`bmc-portal-${renderKey}`}
              >
                <FiShield style={{ width: '16px', height: '16px' }} />
                <span>BMC Officer Portal</span>
              </a>
              
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
      
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
