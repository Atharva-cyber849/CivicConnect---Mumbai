// Constants
import { userRoles } from '../utils/constants'
const { SUPER_ADMIN, ADMIN, OFFICER } = userRoles

// Higher-order component to protect admin routes
const withAdminAuth = (Component, requiredRoles = [SUPER_ADMIN, ADMIN, OFFICER]) => {
  return function AdminAuthComponent(props) {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuthStore()

    useEffect(() => {
      if (!isAuthenticated) {
        navigate('/auth/login')
        return
      }

      if (!requiredRoles.includes(user?.role)) {
        toast.error('You do not have permission to access this page')
        navigate('/dashboard')
      }
    }, [isAuthenticated, user, navigate])

    if (!isAuthenticated || !user) return null
    if (!requiredRoles.includes(user.role)) return null

    return <Component {...props} />
  }
}

// Layout wrapper for admin pages
const withAdminLayout = (Component) => {
  return function AdminLayoutComponent(props) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNav />
        <main className="p-6">
          <Component {...props} />
        </main>
      </div>
    )
  }
}

export { withAdminAuth, withAdminLayout }