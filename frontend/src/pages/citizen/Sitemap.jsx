import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileText, MapPin, Shield, User, Building2, BarChart3 } from 'lucide-react';

const Sitemap = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Site Navigation</h1>
          <p className="text-gray-600 mb-8">Complete overview of all pages on Snap & Report portal.</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Public Pages */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-blue-600" />
                Public Pages
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Home / Landing Page
                  </Link>
                </li>
                <li>
                  <Link to="/ward-services" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Ward Services
                  </Link>
                </li>
                <li>
                  <Link to="/auth/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Citizen Login
                  </Link>
                </li>
                <li>
                  <Link to="/auth/register" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Citizen Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Citizen Dashboard */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Citizen Dashboard
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/report" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Report New Issue
                  </Link>
                </li>
                <li>
                  <Link to="/complaints" className="text-blue-600 hover:text-blue-800 hover:underline">
                    My Complaints
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Map View
                  </Link>
                </li>
                <li>
                  <Link to="/notifications" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Notifications
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Admin Portal */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Admin Portal
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/admin" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Admin Portal Home
                  </Link>
                </li>
                <li>
                  <Link to="/admin/auth/login" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/complaints" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Complaints Management
                  </Link>
                </li>
                <li>
                  <Link to="/admin/officers" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Officer Management
                  </Link>
                </li>
                <li>
                  <Link to="/admin/departments" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link to="/admin/map" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Admin Map View
                  </Link>
                </li>
              </ul>
            </div>

            {/* Analytics & Reports */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                Analytics & Reports
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Mumbai BMC Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/admin/sla-dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                    SLA Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/reports" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link to="/admin/bmc-ward-dashboard" className="text-blue-600 hover:text-blue-800 hover:underline">
                    BMC Ward Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin/bmc-zone-management" className="text-blue-600 hover:text-blue-800 hover:underline">
                    BMC Zone Management
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Info */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Legal & Information
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/sitemap" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Sitemap (This Page)
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
