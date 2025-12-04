import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Shield, 
  Building, 
  MapPin, 
  BarChart3, 
  FileText, 
  Phone, 
  Mail,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  console.log('AdminPortal - Rendering with auth state:', { isAuthenticated, user: user?.email });
  
  const [quickStats, setQuickStats] = useState({
    todayIssues: 0,
    pendingIssues: 0,
    resolvedToday: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  // Set loading to false since we're not fetching stats
  useEffect(() => {
    setLoading(false);
  }, []);

  const roleCards = [
    {
      id: 'super-admin',
      title: 'Super Administrator',
      description: 'Full system access with city-wide administrative control over all departments and wards',
      icon: Shield,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      responsibilities: [
        'City-wide complaint overview & analytics',
        'Create & manage Department Admins',
        'Zone & ward management across Mumbai',
        'System settings & configuration',
        'Approve registration requests'
      ],
      loginPath: '/admin/auth/login?role=super-admin',
      superAdminOnly: true
    },
    {
      id: 'admin',
      title: 'Department Admin',
      description: 'Manage your department operations, officers, and department-specific complaints',
      icon: Building,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      responsibilities: [
        'Department complaint management',
        'Supervise department BMC officers',
        'Department-level analytics & reports',
        'Assign complaints to officers',
        'Monitor department performance'
      ],
      loginPath: '/admin/auth/login?role=admin'
    },
    {
      id: 'officer',
      title: 'BMC Officer',
      description: 'Handle and resolve complaints within your assigned ward boundaries',
      icon: MapPin,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      responsibilities: [
        'View assigned ward complaints',
        'Update complaint status & resolution',
        'Field verification & documentation',
        'Upload resolution photos',
        'Track personal performance'
      ],
      loginPath: '/admin/auth/login?role=officer'
    }
  ];

  const handleRoleSelect = (loginPath, role) => {
    // Navigate to login with role parameter
    navigate(`/admin/auth/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Only show back to public portal link */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Snap & Report</h1>
                <p className="text-sm text-gray-600">BMC Officer Portal</p>
              </div>
            </div>
            <Link 
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Public Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BMC Officer Portal
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamlined complaint management for Mumbai's civic administration. 
            Select your role to access the appropriate dashboard and tools.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : quickStats.todayIssues}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : quickStats.pendingIssues}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : quickStats.resolvedToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : `${quickStats.avgResponseTime}h`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-medium text-blue-900 mb-2">
                  Admin Hierarchy & Registration
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    • <strong>Super Admin:</strong> Full system access - can create Department Admins and manage all city-wide operations
                  </p>
                  <p>
                    • <strong>Department Admin:</strong> Department-level access - can manage officers within their department only
                  </p>
                  <p>
                    • <strong>BMC Officer:</strong> Ward-level access - can only view and resolve complaints in their assigned ward
                  </p>
                  <p className="pt-2 border-t border-blue-200 mt-2">
                    📝 New registrations require Super Admin approval. For urgent access: admin@snapandreport.mumbai.gov.in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Select Your Access Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roleCards.map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    role.superAdminOnly 
                      ? 'border-2 border-purple-500 shadow-purple-100' 
                      : 'border border-gray-200'
                  }`}
                >
                  {role.superAdminOnly && (
                    <div className="bg-purple-600 text-white text-xs font-medium px-4 py-1 text-center">
                      Super Admin Access Only
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg ${role.color}`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 ml-3">
                        {role.title}
                      </h4>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {role.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-900 mb-2">Key Responsibilities:</p>
                      <ul className="space-y-1">
                        {role.responsibilities.map((resp, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <ChevronRight className="h-3 w-3 text-gray-400 mr-1" />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => handleRoleSelect(role.loginPath, role.id)}
                      className={`w-full ${role.color} ${role.hoverColor} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center mb-3`}
                      disabled={false}
                    >
                      Proceed to Login
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                    
                    {!role.superAdminOnly && (
                      <Link
                        to={`/admin/auth/register?role=${role.id}`}
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
                      >
                        New {role.title}? Register Here
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h4>
            <div className="space-y-3">
              <Link 
                to="/admin/documentation"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                System Documentation
              </Link>
              <Link 
                to="/admin/support"
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Phone className="h-4 w-4 mr-2" />
                Technical Support
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Support & Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>admin@snapandreport.mumbai.gov.in</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 22 2266-xxxx (Admin Support)</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Support Hours: 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Building className="h-6 w-6" />
              <span className="font-medium">Mumbai Municipal Corporation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPortal;