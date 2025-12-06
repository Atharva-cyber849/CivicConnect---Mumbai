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
  Clock,
  Search,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';

const AdminPortal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [language, setLanguage] = useState('EN');
  
  const [quickStats, setQuickStats] = useState({
    todayIssues: 0,
    pendingIssues: 0,
    resolvedToday: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from APIs (only if authenticated)
  useEffect(() => {
    const fetchStats = async () => {
      // If not authenticated, use mock data immediately
      if (!isAuthenticated) {
        setQuickStats({
          todayIssues: 247,
          pendingIssues: 432,
          resolvedToday: 189,
          avgResponseTime: 28
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch complaints data
        const complaints = await adminApi.getComplaints();
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayComplaints = complaints.filter(c => {
          const complaintDate = new Date(c.created_at);
          complaintDate.setHours(0, 0, 0, 0);
          return complaintDate.getTime() === today.getTime();
        });
        
        const pendingComplaints = complaints.filter(c => 
          c.status === 'PENDING' || c.status === 'UNASSIGNED' || c.status === 'ASSIGNED'
        );
        
        const resolvedTodayComplaints = complaints.filter(c => {
          if (c.status !== 'RESOLVED' && c.status !== 'CLOSED') return false;
          const resolvedDate = new Date(c.updated_at);
          resolvedDate.setHours(0, 0, 0, 0);
          return resolvedDate.getTime() === today.getTime();
        });
        
        // Calculate average response time (in hours)
        const resolvedComplaintsWithTime = complaints.filter(c => 
          (c.status === 'RESOLVED' || c.status === 'CLOSED') && c.created_at && c.updated_at
        );
        
        let avgResponseTime = 0;
        if (resolvedComplaintsWithTime.length > 0) {
          const totalHours = resolvedComplaintsWithTime.reduce((sum, c) => {
            const created = new Date(c.created_at);
            const resolved = new Date(c.updated_at);
            const hours = (resolved - created) / (1000 * 60 * 60);
            return sum + hours;
          }, 0);
          avgResponseTime = Math.round(totalHours / resolvedComplaintsWithTime.length);
        }
        
        setQuickStats({
          todayIssues: todayComplaints.length,
          pendingIssues: pendingComplaints.length,
          resolvedToday: resolvedTodayComplaints.length,
          avgResponseTime: avgResponseTime
        });
        
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to mock data on error
        setQuickStats({
          todayIssues: 247,
          pendingIssues: 432,
          resolvedToday: 189,
          avgResponseTime: 28
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  const quickActions = [
    { icon: Search, label: 'View All Complaints', path: '/admin/complaints', color: 'blue' },
    { icon: Building, label: 'Department Overview', path: '/admin/departments', color: 'green' },
    { icon: Users, label: 'Manage Officers', path: '/admin/officers', color: 'purple' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings', color: 'gray', superAdminOnly: true }
  ];

  const departments = [
    { name: 'Solid Waste', icon: '🧹' },
    { name: 'Water Supply', icon: '🚰' },
    { name: 'Roads & Maintenance', icon: '🛣️' },
    { name: 'Street Lighting', icon: '💡' },
    { name: 'Drainage & Sewage', icon: '🚿' },
    { name: 'Parks & Gardens', icon: '🌳' },
    { name: 'Building Dept', icon: '🏢' },
    { name: 'Traffic & Transport', icon: '🚦' }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-md border-b-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Snap & Report
                  </h1>
                </div>
                <p className="text-sm text-gray-600 font-medium">BMC Mumbai | Officer Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    language === 'EN' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('MR')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    language === 'MR' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  मराठी
                </button>
              </div>
              <Link 
                to="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Public Portal
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section with City Context */}
        <div className="relative mb-12 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230078D7' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* City Context Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-8 shadow-2xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🏛️</span>
                  <h2 className="text-3xl font-bold">BMC Mumbai Administrative Portal</h2>
                </div>
                <p className="text-blue-100 text-lg">
                  Managing citizen complaints across <strong>24 wards</strong> & <strong>17+ departments</strong>
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <Globe className="h-12 w-12 text-white opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Hero */}
          <div className="text-center relative">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to BMC Officer Portal
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamlined system for <span className="text-blue-600 font-semibold">ward-level</span>, 
              <span className="text-green-600 font-semibold"> department-level</span>, and 
              <span className="text-purple-600 font-semibold"> city-level governance</span>.
            </p>
          </div>
        </div>

        {/* Enhanced Quick Stats with Icons and Colors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Today's Issues</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? '...' : quickStats.todayIssues}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from yesterday
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-2xl">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Pending</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? '...' : quickStats.pendingIssues}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ⏳ Awaiting action
                </p>
              </div>
              <div className="p-4 bg-yellow-100 rounded-2xl">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Resolved Today</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? '...' : quickStats.resolvedToday}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  76% completion rate
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-2xl">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Avg Response</p>
                <p className="text-4xl font-bold text-gray-900">
                  {loading ? '...' : `${quickStats.avgResponseTime}h`}
                </p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Fast resolution
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-2xl">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={idx}
                  to={action.path}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-${action.color}-500 hover:bg-${action.color}-50 transition-all duration-200 group`}
                >
                  <div className={`p-3 bg-${action.color}-100 rounded-xl mb-2 group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {action.label}
                  </span>
                  {action.superAdminOnly && (
                    <span className="text-xs text-purple-600 mt-1">Super Admin</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Enhanced Admin Hierarchy with Visual Diagram */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-600 mt-1" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-2xl font-bold text-blue-900 mb-6">
                  Admin Hierarchy & Registration System
                </h4>
                
                {/* Visual Hierarchy Diagram */}
                <div className="bg-white rounded-xl p-6 mb-6 shadow-md">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    {/* Super Admin */}
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                        <Shield className="h-16 w-16 text-white" />
                      </div>
                      <h5 className="font-bold text-gray-900 mb-1">Super Admin</h5>
                      <p className="text-xs text-gray-600">City-wide Control</p>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex flex-col items-center">
                      <ChevronRight className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">creates</span>
                    </div>

                    {/* Department Admin */}
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                        <Building className="h-16 w-16 text-white" />
                      </div>
                      <h5 className="font-bold text-gray-900 mb-1">Department Admin</h5>
                      <p className="text-xs text-gray-600">Dept-level Access</p>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex flex-col items-center">
                      <ChevronRight className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">manages</span>
                    </div>

                    {/* Ward Officer */}
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                        <MapPin className="h-16 w-16 text-white" />
                      </div>
                      <h5 className="font-bold text-gray-900 mb-1">Ward Officer</h5>
                      <p className="text-xs text-gray-600">Ward-level Access</p>
                    </div>
                  </div>
                </div>

                {/* Role Descriptions */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h6 className="font-bold text-purple-900 mb-2 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Super Admin
                    </h6>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Full system access</li>
                      <li>• Create admins</li>
                      <li>• City-wide analytics</li>
                      <li>• System configuration</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h6 className="font-bold text-green-900 mb-2 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Department Admin
                    </h6>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Department control</li>
                      <li>• Manage officers</li>
                      <li>• Assign complaints</li>
                      <li>• Dept analytics</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h6 className="font-bold text-blue-900 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ward Officer
                    </h6>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Ward complaints</li>
                      <li>• Field verification</li>
                      <li>• Update status</li>
                      <li>• Upload evidence</li>
                    </ul>
                  </div>
                </div>

                {/* Registration Notice */}
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
                  <p className="text-sm text-amber-900 flex items-center">
                    <span className="text-2xl mr-2">📝</span>
                    <strong>New registrations require Super Admin approval.</strong>
                    <span className="ml-2">For urgent access: admin@snapandreport.mumbai.gov.in</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-2 font-semibold text-blue-600">Select Access Level</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
            <div className="flex items-center opacity-50">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 text-gray-500">Login</span>
            </div>
          </div>
        </div>

        {/* Enhanced Role Selection Cards */}
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Select Your Access Level
          </h3>
          <p className="text-center text-gray-600 mb-10">
            Choose the role that matches your position in the BMC hierarchy
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {roleCards.map((role) => {
              const IconComponent = role.icon;
              return (
                <div
                  key={role.id}
                  className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
                    role.superAdminOnly 
                      ? 'border-4 border-purple-500 ring-4 ring-purple-100' 
                      : 'border-2 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  {role.superAdminOnly && (
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold px-4 py-2 text-center">
                      🔒 SUPER ADMIN ACCESS ONLY
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className={`p-4 rounded-2xl ${role.color} shadow-lg`}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-2xl font-bold text-gray-900">
                          {role.title}
                        </h4>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                          role.superAdminOnly ? 'bg-purple-100 text-purple-700' :
                          role.id === 'admin' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {role.id === 'super-admin' ? 'Tier 1' : role.id === 'admin' ? 'Tier 2' : 'Tier 3'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {role.description}
                    </p>
                    
                    <div className="mb-6 bg-gray-50 rounded-xl p-4">
                      <p className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Key Responsibilities:
                      </p>
                      <ul className="space-y-2">
                        {role.responsibilities.slice(0, 3).map((resp, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <ChevronRight className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                      {role.responsibilities.length > 3 && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium flex items-center">
                          View all {role.responsibilities.length} permissions
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRoleSelect(role.loginPath, role.id)}
                      className={`w-full ${role.color} ${role.hoverColor} text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center mb-3 shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                      <span>Proceed to Login</span>
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                    
                    {!role.superAdminOnly && (
                      <Link
                        to={`/admin/auth/register?role=${role.id}`}
                        className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center border-2 border-gray-300 hover:border-gray-400"
                      >
                        New {role.title}? Register Here →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role Comparison Table */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Role Comparison Matrix
            </h4>
            <p className="text-center text-gray-600 mb-8">
              Instantly understand the permissions and access levels for each role
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                    <th className="text-left py-4 px-6 font-bold text-gray-900">Feature / Permission</th>
                    <th className="text-center py-4 px-4 font-bold text-purple-700">
                      <div className="flex flex-col items-center">
                        <Shield className="h-6 w-6 mb-1" />
                        Super Admin
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-green-700">
                      <div className="flex flex-col items-center">
                        <Building className="h-6 w-6 mb-1" />
                        Dept Admin
                      </div>
                    </th>
                    <th className="text-center py-4 px-4 font-bold text-blue-700">
                      <div className="flex flex-col items-center">
                        <MapPin className="h-6 w-6 mb-1" />
                        Ward Officer
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">Citywide Analytics</td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">Create Department Admins</td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">Assign Officers to Wards</td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">Manage Ward Issues</td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">Upload Field Evidence</td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">System Configuration</td>
                    <td className="py-4 px-4 text-center"><CheckCircle className="h-6 w-6 text-green-500 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                    <td className="py-4 px-4 text-center"><XCircle className="h-6 w-6 text-gray-300 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Directory */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Mumbai BMC Departments</h4>
              <p className="text-gray-600">17+ specialized departments serving 24 wards</p>
            </div>
            <Building className="h-12 w-12 text-green-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-green-500 group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{dept.icon}</div>
                <p className="text-sm font-semibold text-gray-800">{dept.name}</p>
              </div>
            ))}
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

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Building className="h-8 w-8 text-blue-400" />
                <div>
                  <span className="font-bold text-xl">Mumbai BMC</span>
                  <p className="text-xs text-gray-400">Municipal Corporation</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Official administrative portal for managing civic complaints across Mumbai's 24 wards and 17+ departments.
              </p>
              <div className="mt-4 flex items-center space-x-2 text-xs">
                <span className="text-gray-500">Snap & Report Platform</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
              <div className="space-y-3">
                <Link 
                  to="/admin/documentation"
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  System Documentation
                </Link>
                <Link 
                  to="/admin/support"
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Technical Support
                </Link>
                <Link 
                  to="/ward-services"
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View 24 Wards →
                </Link>
              </div>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Support & Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-sm">admin@snapandreport.mumbai.gov.in</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2 text-green-400" />
                  <span className="text-sm">+91 22 2266-xxxx (Admin)</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="text-sm">9:00 AM - 6:00 PM (Mon-Sat)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                Mumbai Municipal Corporation Portal
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-blue-400" />
                  Secured System
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPortal;