import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Activity,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

const Departments = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [language, setLanguage] = useState('EN');

  // Mock departments data for unauthenticated users
  const mockDepartments = [
    {
      id: 1,
      name: 'Solid Waste Management',
      icon: '🧹',
      color: 'green',
      activeComplaints: 87,
      resolvedToday: 34,
      totalOfficers: 145,
      avgResponseTime: '2.3h',
      resolutionRate: 89,
      status: 'active',
      email: 'waste@bmc.gov.in',
      phone: '1916-101',
      coverage: '24 Wards',
      head: 'Rajesh Kumar',
      description: 'Manages garbage collection, waste disposal, and street cleanliness'
    },
    {
      id: 2,
      name: 'Water Supply',
      icon: '💧',
      color: 'blue',
      activeComplaints: 52,
      resolvedToday: 18,
      totalOfficers: 98,
      avgResponseTime: '1.8h',
      resolutionRate: 92,
      status: 'active',
      email: 'water@bmc.gov.in',
      phone: '1916-102',
      coverage: '24 Wards',
      head: 'Priya Sharma',
      description: 'Handles water supply issues, leakages, and pipeline maintenance'
    },
    {
      id: 3,
      name: 'Roads & Maintenance',
      icon: '🛣️',
      color: 'orange',
      activeComplaints: 134,
      resolvedToday: 41,
      totalOfficers: 210,
      avgResponseTime: '4.2h',
      resolutionRate: 85,
      status: 'active',
      email: 'roads@bmc.gov.in',
      phone: '1916-103',
      coverage: '24 Wards',
      head: 'Amit Patel',
      description: 'Repairs potholes, maintains road infrastructure, and footpaths'
    },
    {
      id: 4,
      name: 'Street Lighting',
      icon: '💡',
      color: 'yellow',
      activeComplaints: 29,
      resolvedToday: 15,
      totalOfficers: 67,
      avgResponseTime: '3.1h',
      resolutionRate: 94,
      status: 'active',
      email: 'lighting@bmc.gov.in',
      phone: '1916-104',
      coverage: '24 Wards',
      head: 'Sunita Desai',
      description: 'Manages street lights, electrical repairs, and public lighting'
    },
    {
      id: 5,
      name: 'Drainage & Sewage',
      icon: '🚿',
      color: 'purple',
      activeComplaints: 43,
      resolvedToday: 12,
      totalOfficers: 89,
      avgResponseTime: '2.7h',
      resolutionRate: 87,
      status: 'active',
      email: 'drainage@bmc.gov.in',
      phone: '1916-105',
      coverage: '24 Wards',
      head: 'Vikram Singh',
      description: 'Handles sewage blockages, drainage issues, and manhole maintenance'
    },
    {
      id: 6,
      name: 'Parks & Gardens',
      icon: '🌳',
      color: 'emerald',
      activeComplaints: 18,
      resolvedToday: 8,
      totalOfficers: 54,
      avgResponseTime: '5.4h',
      resolutionRate: 91,
      status: 'active',
      email: 'parks@bmc.gov.in',
      phone: '1916-106',
      coverage: '24 Wards',
      head: 'Meera Joshi',
      description: 'Maintains public gardens, parks, tree trimming, and landscaping'
    },
    {
      id: 7,
      name: 'Building Department',
      icon: '🏢',
      color: 'indigo',
      activeComplaints: 31,
      resolvedToday: 7,
      totalOfficers: 76,
      avgResponseTime: '6.8h',
      resolutionRate: 83,
      status: 'active',
      email: 'building@bmc.gov.in',
      phone: '1916-107',
      coverage: '24 Wards',
      head: 'Anil Mehta',
      description: 'Handles illegal construction, building violations, and structural issues'
    },
    {
      id: 8,
      name: 'Traffic & Transport',
      icon: '🚦',
      color: 'red',
      activeComplaints: 64,
      resolvedToday: 19,
      totalOfficers: 112,
      avgResponseTime: '1.5h',
      resolutionRate: 88,
      status: 'active',
      email: 'traffic@bmc.gov.in',
      phone: '1916-108',
      coverage: '24 Wards',
      head: 'Kavita Rao',
      description: 'Manages traffic signals, illegal parking, and transport issues'
    }
  ];

  // Fetch departments from API only if authenticated
  const { data: departmentsData, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => adminApi.getDepartments(),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const departments = isAuthenticated ? (departmentsData || []) : mockDepartments;

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || dept.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate summary stats
  const totalComplaints = departments.reduce((sum, dept) => sum + (dept.activeComplaints || 0), 0);
  const totalOfficers = departments.reduce((sum, dept) => sum + (dept.totalOfficers || 0), 0);
  const totalResolvedToday = departments.reduce((sum, dept) => sum + (dept.resolvedToday || 0), 0);
  const avgResolutionRate = departments.length > 0 
    ? Math.round(departments.reduce((sum, dept) => sum + (dept.resolutionRate || 0), 0) / departments.length)
    : 0;

  const getColorClasses = (color) => {
    const colors = {
      green: 'from-green-500 to-green-600 border-green-500 bg-green-50 text-green-700',
      blue: 'from-blue-500 to-blue-600 border-blue-500 bg-blue-50 text-blue-700',
      orange: 'from-orange-500 to-orange-600 border-orange-500 bg-orange-50 text-orange-700',
      yellow: 'from-yellow-500 to-yellow-600 border-yellow-500 bg-yellow-50 text-yellow-700',
      purple: 'from-purple-500 to-purple-600 border-purple-500 bg-purple-50 text-purple-700',
      emerald: 'from-emerald-500 to-emerald-600 border-emerald-500 bg-emerald-50 text-emerald-700',
      indigo: 'from-indigo-500 to-indigo-600 border-indigo-500 bg-indigo-50 text-indigo-700',
      red: 'from-red-500 to-red-600 border-red-500 bg-red-50 text-red-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Department Directory</h1>
                  <p className="text-gray-600 text-sm mt-1">BMC Mumbai - 8 Specialized Departments</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('EN')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    language === 'EN'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('MR')}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    language === 'MR'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  मराठी
                </button>
              </div>

              <Link 
                to="/admin/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{departments.length}</p>
                <p className="text-xs text-blue-600 mt-1">All active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Complaints</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalComplaints}</p>
                <p className="text-xs text-orange-600 mt-1">Across all depts</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Officers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalOfficers}</p>
                <p className="text-xs text-green-600 mt-1">On duty today</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Resolution Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{avgResolutionRate}%</p>
                <p className="text-xs text-purple-600 mt-1">↑ +3% this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search departments by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({departments.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'active'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({departments.filter(d => d.status === 'active').length})
              </button>
            </div>
          </div>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${getColorClasses(dept.color).split(' ')[0]} ${getColorClasses(dept.color).split(' ')[1]} p-6 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{dept.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{dept.name}</h3>
                      <p className="text-sm text-white/90">{dept.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold">
                          {dept.coverage}
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold">
                          {dept.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-gray-600 font-medium">Active</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dept.activeComplaints}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600 font-medium">Resolved Today</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dept.resolvedToday}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600 font-medium">Officers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dept.totalOfficers}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600 font-medium">Avg Response</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{dept.avgResponseTime}</p>
                  </div>
                </div>

                {/* Resolution Rate */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
                    <span className="text-sm font-bold text-gray-900">{dept.resolutionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`bg-gradient-to-r ${getColorClasses(dept.color).split(' ')[0]} ${getColorClasses(dept.color).split(' ')[1]} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${dept.resolutionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Department Head & Contact */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Department Head</p>
                      <p className="font-semibold text-gray-900">{dept.head}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${dept.email}`} className="hover:text-blue-600">{dept.email}</a>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${dept.phone}`} className="hover:text-blue-600">{dept.phone}</a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/admin/departments/${dept.id}/analytics`}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Link>
                  <Link
                    to={`/admin/complaints?department=${dept.id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    View Complaints
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDepartments.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Globe className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Need Help?</h4>
              <p className="text-blue-800 text-sm mb-3">
                For department-specific queries or to report issues, contact the respective department directly using the contact information provided above.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="tel:1916" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  📞 Call BMC Helpline: 1916
                </a>
                <Link to="/admin/complaints" className="bg-white hover:bg-gray-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-blue-300">
                  View All Complaints
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Departments;
