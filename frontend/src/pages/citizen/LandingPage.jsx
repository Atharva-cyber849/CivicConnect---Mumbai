import { Link } from 'react-router-dom'
import { FiCheckCircle, FiMapPin, FiTrendingUp, FiSmartphone, FiClock, FiShield } from 'react-icons/fi'

const LandingPage = () => {
  console.log('===== LANDINGPAGE RENDERING =====');
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-civic-blue-50 via-white to-civic-orange-50 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230078D7' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-6 py-20 relative">
        <div className="text-center">
          {/* BMC Badge */}
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-6">
            <span className="text-2xl">🇮🇳</span>
            <span className="text-sm font-semibold text-civic-blue-600">BMC Mumbai</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            📸 <span className="text-civic-blue-600">Snap</span> <span className="text-civic-orange-500">&</span> <span className="text-civic-blue-600">Report</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
            Empowering <span className="text-civic-blue-600 font-bold">Mumbaikars</span> to Report Civic Issues
          </p>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your voice matters. Report potholes, garbage, water leaks, and more. 
            Help make Mumbai a cleaner, safer city for all.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              to="/auth/register" 
              className="bg-civic-blue-600 hover:bg-civic-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              🆕 Report an Issue
            </Link>
            <Link 
              to="/auth/login" 
              className="bg-white hover:bg-gray-50 text-civic-blue-600 border-2 border-civic-blue-600 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🔍 Track Complaint
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock className="text-civic-orange-500" />
              <span><strong>24/7</strong> Service</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin className="text-civic-orange-500" />
              <span><strong>24 Wards</strong> Covered</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiShield className="text-civic-orange-500" />
              <span><strong>Secure</strong> & Verified</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It <span className="text-civic-blue-600">Works</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Report civic issues in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300 border-t-4 border-civic-blue-500">
            <div className="w-16 h-16 bg-civic-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSmartphone className="w-8 h-8 text-civic-blue-600" />
            </div>
            <div className="text-3xl font-bold text-civic-blue-600 mb-2">1</div>
            <h3 className="text-xl font-bold mb-3">Snap a Photo</h3>
            <p className="text-gray-600">
              Take a photo of the civic issue using your smartphone camera
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300 border-t-4 border-civic-orange-500">
            <div className="w-16 h-16 bg-civic-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-8 h-8 text-civic-orange-600" />
            </div>
            <div className="text-3xl font-bold text-civic-orange-600 mb-2">2</div>
            <h3 className="text-xl font-bold mb-3">Add Location & Details</h3>
            <p className="text-gray-600">
              Select your ward, add description, and pinpoint exact location on map
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300 border-t-4 border-green-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">3</div>
            <h3 className="text-xl font-bold mb-3">Track & Resolve</h3>
            <p className="text-gray-600">
              Track status until resolved
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-civic-blue-600">Snap & Report</span>?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Empowering citizens with transparency, efficiency, and real-time communication
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Ward-Level Tracking</h3>
              <p className="text-gray-600">
                Coverage across all 24 Mumbai wards (A to T) with precise geolocation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Receive instant notifications as BMC officers update your complaint status.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                All complaint data is encrypted; only authorized municipal staff can access reports.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Transparent Analytics</h3>
              <p className="text-gray-600">
                Monitor city-wide performance metrics and departmental efficiency in real time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Bilingual Support</h3>
              <p className="text-gray-600">
                Fully available in English and Marathi (मराठी) for seamless accessibility.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* Mumbai Ward Services Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🏛️ BMC <span className="text-civic-blue-600">Ward Services</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Access ward-specific information, contact details, and services
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Description */}
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Find Your Ward Information
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-civic-blue-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700"><strong>Contact Details:</strong> Direct phone numbers and office timings for your BMC ward</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-civic-blue-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700"><strong>Available Services:</strong> Water supply, roads, waste management, street lighting, sewage, and parks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-civic-blue-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700"><strong>Key Landmarks:</strong> Important locations and amenities in your ward</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-civic-blue-600 text-xl font-bold">✓</span>
                  <span className="text-gray-700"><strong>Emergency Contacts:</strong> Quick access to emergency services and helplines</span>
                </li>
              </ul>
              <Link 
                to="/ward-services" 
                className="inline-block bg-civic-blue-600 hover:bg-civic-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-fit"
              >
                Explore Ward Services →
              </Link>
            </div>

            {/* Right Side - Visual Preview */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Mumbai's 4 Administrative Zones</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                  <div className="font-bold text-red-700">Eastern Zone (E-Ward)</div>
                  <div className="text-sm text-gray-600 mt-1">Wards E, F, G, H, K, L, M, N</div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
                  <div className="font-bold text-blue-700">Western Zone (W-Ward)</div>
                  <div className="text-sm text-gray-600 mt-1">Wards P, Q, R, S, T</div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50">
                  <div className="font-bold text-green-700">South-Central Zone (S-Ward)</div>
                  <div className="text-sm text-gray-600 mt-1">Wards A, B, C</div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-50">
                  <div className="font-bold text-purple-700">South Zone (D-Ward)</div>
                  <div className="text-sm text-gray-600 mt-1">Wards D</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-civic-blue-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Mumbai's Civic Impact</h2>
            <p className="text-civic-blue-100">Real numbers from real Mumbaikars</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-bold mb-2">25,000+</h3>
              <p className="text-lg">Issues Reported</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">21,000+</h3>
              <p className="text-lg">Issues Resolved</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">15,000+</h3>
              <p className="text-lg">Active Mumbaikars</p>
            </div>
            <div>
              <h3 className="text-5xl font-bold mb-2">84%</h3>
              <p className="text-lg">Resolution Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-civic-blue-600 to-civic-blue-700 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make Mumbai Better?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Mumbaikars building a cleaner, safer city
          </p>
          <Link 
            to="/auth/register" 
            className="inline-block bg-civic-orange-500 hover:bg-civic-orange-600 text-white px-10 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Reporting Today →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
