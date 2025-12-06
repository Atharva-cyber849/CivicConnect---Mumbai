import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiCheckCircle, FiMapPin, FiTrendingUp, FiSmartphone, FiClock, FiShield, FiZap, FiBell, FiLock, FiUsers, FiAward, FiActivity } from 'react-icons/fi'

const LandingPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [language, setLanguage] = useState('EN');
  const [counters, setCounters] = useState({
    today: 0,
    resolved: 0,
    active: 0,
    rate: 0,
    avgTime: 0
  });

  // Animate counters on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = {
      today: 247,
      resolved: 1834,
      active: 432,
      rate: 84,
      avgTime: 28
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCounters({
        today: Math.floor((targets.today / steps) * step),
        resolved: Math.floor((targets.resolved / steps) * step),
        active: Math.floor((targets.active / steps) * step),
        rate: Math.floor((targets.rate / steps) * step),
        avgTime: Math.floor((targets.avgTime / steps) * step)
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const issueCategories = [
    { icon: '🕳️', name: 'Potholes', color: 'from-red-500 to-red-600' },
    { icon: '🗑️', name: 'Garbage Overflow', color: 'from-green-500 to-green-600' },
    { icon: '💡', name: 'Street Light', color: 'from-yellow-500 to-yellow-600' },
    { icon: '💧', name: 'Water Leakage', color: 'from-blue-500 to-blue-600' },
    { icon: '🌳', name: 'Tree Fallen', color: 'from-emerald-500 to-emerald-600' },
    { icon: '🚗', name: 'Illegal Parking', color: 'from-purple-500 to-purple-600' },
    { icon: '🐄', name: 'Stray Cattle', color: 'from-orange-500 to-orange-600' },
    { icon: '🧱', name: 'Infrastructure', color: 'from-gray-500 to-gray-600' }
  ];

  const testimonials = [
    {
      text: "Garbage overflow in Andheri East cleared within 12 hours of reporting!",
      location: "Andheri East, Ward K",
      time: "Resolved in 12 hours"
    },
    {
      text: "Street light repaired in Powai within 2 days. Great response time!",
      location: "Powai, Ward L",
      time: "Resolved in 48 hours"
    },
    {
      text: "Pothole on SV Road fixed promptly. Happy to see BMC's quick action.",
      location: "Goregaon, Ward P",
      time: "Resolved in 24 hours"
    }
  ];

  const journeySteps = [
    { icon: '📸', title: 'Snap the Issue', desc: 'Take a photo' },
    { icon: '📍', title: 'Auto-Location', desc: 'GPS captured' },
    { icon: '📝', title: 'Submit Complaint', desc: 'Details added' },
    { icon: '🏛️', title: 'Department Routing', desc: 'Auto-assigned' },
    { icon: '🔧', title: 'Issue Resolved', desc: 'Action taken' },
    { icon: '📩', title: 'Feedback', desc: 'Your rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230078D7' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
            animation: 'slide 20s linear infinite'
          }} />
        </div>
        
        <div className="container mx-auto px-6 py-16 relative">
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
          
          <div className="flex justify-center">
            <Link 
              to="/auth/register" 
              className="bg-civic-blue-600 hover:bg-civic-blue-700 text-white px-10 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              <FiZap className="w-5 h-5" />
              Report an Issue Now
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              <FiClock className="text-civic-orange-500" />
              <span><strong>24/7</strong> Service</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              <FiMapPin className="text-civic-orange-500" />
              <span><strong>24 Wards</strong> Covered</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
              <FiUsers className="text-civic-orange-500" />
              <span><strong>15,000+</strong> Citizens</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Real-Time Stats Dashboard */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-12 -mt-8 relative z-10">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-white to-transparent"></div>
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">🔥 Live System Dashboard</h3>
            <p className="text-blue-100 text-sm">Real-time metrics updated every 5 minutes</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            <div className="group">
              <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiActivity className="w-7 h-7 text-yellow-900" />
                </div>
                <h3 className="text-4xl font-bold mb-1">{counters.today}</h3>
                <p className="text-sm text-blue-100 font-medium">Filed Today</p>
                <div className="mt-2 text-xs text-yellow-200">↑ +12% vs yesterday</div>
              </div>
            </div>
            
            <div className="group">
              <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="w-7 h-7 text-green-900" />
                </div>
                <h3 className="text-4xl font-bold mb-1">{counters.resolved}</h3>
                <p className="text-sm text-blue-100 font-medium">Resolved This Week</p>
                <div className="mt-2 text-xs text-green-200">↑ Record high!</div>
              </div>
            </div>
            
            <div className="group">
              <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiTrendingUp className="w-7 h-7 text-orange-900" />
                </div>
                <h3 className="text-4xl font-bold mb-1">{counters.active}</h3>
                <p className="text-sm text-blue-100 font-medium">Active Complaints</p>
                <div className="mt-2 text-xs text-orange-200">In progress</div>
              </div>
            </div>
            
            <div className="group">
              <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiAward className="w-7 h-7 text-purple-900" />
                </div>
                <h3 className="text-4xl font-bold mb-1">{counters.rate}%</h3>
                <p className="text-sm text-blue-100 font-medium">Resolution Rate</p>
                <div className="mt-2 text-xs text-purple-200">Above target</div>
              </div>
            </div>
            
            <div className="group">
              <div className="text-center bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-xl">
                <div className="w-12 h-12 bg-pink-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FiClock className="w-7 h-7 text-pink-900" />
                </div>
                <h3 className="text-4xl font-bold mb-1">{counters.avgTime}h</h3>
                <p className="text-sm text-blue-100 font-medium">Avg Response Time</p>
                <div className="mt-2 text-xs text-pink-200">↓ 18% faster</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Issue Category Buttons */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
            <span className="text-blue-700 font-semibold text-sm">⚡ Quick Access Portal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quick <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Report</span> by Category
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select an issue type to start reporting instantly • GPS-tagged • Auto-routed to department
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {issueCategories.map((category, idx) => (
            <Link
              key={idx}
              to={`/auth/register?category=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <div className={`relative bg-gradient-to-br ${category.color} text-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 cursor-pointer overflow-hidden`}>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                  <h3 className="font-bold text-sm md:text-base">{category.name}</h3>
                  <div className="mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Tap to report →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Use Snap & Report - Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Use <span className="text-civic-blue-600">Snap & Report</span>?
            </h2>
            <p className="text-gray-600 text-lg">
              Citizen-first governance powered by technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FiZap className="w-6 h-6 text-civic-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instant Filing</h3>
              <p className="text-gray-600 text-sm">Report issues in under 2 minutes with our streamlined process</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FiMapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">GPS Auto-Capture</h3>
              <p className="text-gray-600 text-sm">Precise location tagging ensures accurate complaint routing</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FiBell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Live Status Updates</h3>
              <p className="text-gray-600 text-sm">Real-time notifications at every stage of resolution</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FiShield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Direct BMC Routing</h3>
              <p className="text-gray-600 text-sm">Automatically forwarded to the right department instantly</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FiLock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Secured System</h3>
              <p className="text-gray-600 text-sm">Bank-grade encryption protects all your data</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FiTrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Transparent Analytics</h3>
              <p className="text-gray-600 text-sm">Track city-wide performance and department efficiency</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Bilingual Support</h3>
              <p className="text-gray-600 text-sm">Available in English & Marathi (मराठी)</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Community Verified</h3>
              <p className="text-gray-600 text-sm">Trusted by 15,000+ active Mumbaikars</p>
            </div>
          </div>
        </div>
      </section>

      {/* User Journey Timeline */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your <span className="text-civic-blue-600">Complaint Journey</span>
          </h2>
          <p className="text-gray-600 text-lg">
            From report to resolution - transparent every step of the way
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-civic-blue-200 via-civic-orange-200 to-green-200 hidden md:block -translate-y-1/2"></div>
          
          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
            {journeySteps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center text-4xl shadow-lg border-4 border-white relative z-10 mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.5), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.5), transparent 50%)`
          }} />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-4">
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-semibold text-blue-600">4.8/5 Rating • 15,000+ Reviews</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Real Stories, Real <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Impact</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See how Mumbaikars are making a difference • Verified success stories
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                ✓ VERIFIED
              </div>
              
              <div className="text-6xl text-civic-blue-200 mb-4">"</div>
              
              <div className="relative min-h-[120px]">
                {testimonials.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className={`transition-all duration-500 ${
                      activeTestimonial === idx ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                  >
                    <p className="text-xl md:text-2xl text-gray-700 mb-6 italic">
                      {testimonial.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">📍 {testimonial.location}</p>
                        <p className="text-sm text-green-600 font-semibold">✅ {testimonial.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      activeTestimonial === idx ? 'bg-civic-blue-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mumbai Ward Map Preview */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🗺️ Mumbai's <span className="text-civic-blue-600">24 Wards</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Find your ward and access local services
          </p>
        </div>

        <div className="bg-gradient-to-br from-civic-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Ward Map Visualization */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-center">Administrative Zones</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                  <div className="font-bold text-red-700">🔴 Eastern Zone</div>
                  <div className="text-sm text-gray-600 mt-1">Wards: E, F, G, H, K, L, M, N</div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="font-bold text-blue-700">🔵 Western Zone</div>
                  <div className="text-sm text-gray-600 mt-1">Wards: P, Q, R, S, T</div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                  <div className="font-bold text-green-700">🟢 South-Central Zone</div>
                  <div className="text-sm text-gray-600 mt-1">Wards: A, B, C</div>
                </div>
                <div className="p-4 rounded-lg border-l-4 border-purple-500 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                  <div className="font-bold text-purple-700">🟣 South Zone</div>
                  <div className="text-sm text-gray-600 mt-1">Ward: D</div>
                </div>
              </div>
            </div>

            {/* Right - Ward Services */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Ward Services Available</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span><strong>Officer Contacts:</strong> Direct phone & office timings</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span><strong>Services:</strong> Water, roads, waste, lighting, sewage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span><strong>Landmarks:</strong> Important locations in your area</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span><strong>Emergency:</strong> Quick access to helplines</span>
                </li>
              </ul>
              
              <Link 
                to="/ward-services" 
                className="inline-flex items-center gap-2 bg-civic-blue-600 hover:bg-civic-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                <FiMapPin className="w-5 h-5" />
                Explore Ward Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Login Cards */}
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full shadow-lg mb-4">
              <FiShield className="w-4 h-4" />
              <span className="text-sm font-semibold">Government Officials Only</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              BMC <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Officer Portal</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              3-Tier Administrative System • Role-based access • Real-time monitoring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Ward Admin */}
            <Link to="/admin/auth/login?role=ward" className="group">
              <div className="relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 border-2 border-transparent hover:border-green-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 group-hover:text-white transition-colors">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all">
                    <FiMapPin className="w-10 h-10 text-white" />
                  </div>
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-3 group-hover:bg-white/20 group-hover:text-white">
                    TIER 3 • GROUND LEVEL
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-white">Ward Admin</h3>
                  <p className="text-gray-600 mb-4 group-hover:text-green-100">Manage ward-level complaints</p>
                  <div className="text-sm text-gray-600 space-y-1 mb-6 group-hover:text-green-100">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 group-hover:text-white">✓</span>
                      <span>Ward-specific access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 group-hover:text-white">✓</span>
                      <span>Complaint assignment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 group-hover:text-white">✓</span>
                      <span>Performance tracking</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 group-hover:border-white/20">
                    <span className="font-semibold">Login as Ward Admin</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Department Admin */}
            <Link to="/admin/auth/login?role=dept" className="group">
              <div className="relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 border-2 border-transparent hover:border-orange-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 group-hover:text-white transition-colors">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all">
                    <span className="text-4xl">🏢</span>
                  </div>
                  <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mb-3 group-hover:bg-white/20 group-hover:text-white">
                    TIER 2 • DEPARTMENT
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-white">Department Admin</h3>
                  <p className="text-gray-600 mb-4 group-hover:text-orange-100">Oversee department operations</p>
                  <div className="text-sm text-gray-600 space-y-1 mb-6 group-hover:text-orange-100">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 group-hover:text-white">✓</span>
                      <span>Department-wide view</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 group-hover:text-white">✓</span>
                      <span>Officer management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 group-hover:text-white">✓</span>
                      <span>SLA monitoring</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 group-hover:border-white/20">
                    <span className="font-semibold">Login as Dept Admin</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Super Admin */}
            <Link to="/admin/auth/login?role=super" className="group">
              <div className="relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 duration-300 border-2 border-transparent hover:border-purple-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold z-20">
                  👑 HIGHEST
                </div>
                <div className="relative z-10 group-hover:text-white transition-colors">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all shadow-lg">
                    <FiShield className="w-10 h-10 text-white" />
                  </div>
                  <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-3 group-hover:bg-white/20 group-hover:text-white">
                    TIER 1 • CITYWIDE
                  </div>
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-white">Super Admin</h3>
                  <p className="text-gray-600 mb-4 group-hover:text-purple-100">City-wide system control</p>
                  <div className="text-sm text-gray-600 space-y-1 mb-6 group-hover:text-purple-100">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500 group-hover:text-white">✓</span>
                      <span>Full system access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500 group-hover:text-white">✓</span>
                      <span>User management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500 group-hover:text-white">✓</span>
                      <span>Analytics & reports</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 group-hover:border-white/20">
                    <span className="font-semibold">Login as Super Admin</span>
                    <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Info Banner */}
          <div className="mt-8 max-w-3xl mx-auto bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-800">
              <span className="font-bold">🔐 Secure Access:</span> All officer logins require BMC-issued credentials • 2FA enabled • Audit logged
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-civic-blue-600 via-civic-blue-700 to-indigo-700 rounded-2xl shadow-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Make Mumbai Better?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join 15,000+ Mumbaikars building a cleaner, safer city. Every report counts!
            </p>
            <Link 
              to="/auth/register" 
              className="inline-flex items-center gap-3 bg-civic-orange-500 hover:bg-civic-orange-600 text-white px-10 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <FiZap className="w-6 h-6" />
              Start Reporting Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3), transparent 50%)`
          }} />
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  S&R
                </div>
                <div>
                  <h3 className="text-xl font-bold">Snap & Report</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Empowering Mumbaikars to report civic issues and build a better city together through technology.
              </p>
              <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <span className="text-2xl">🇮🇳</span>
                <span className="text-gray-300">Mumbai BMC Portal</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>→</span> About Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>→</span> FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>→</span> Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>→</span> Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Services</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link to="/ward-services" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>🗺️</span> Ward Services (24)
                  </Link>
                </li>
                <li>
                  <Link to="/departments" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>🏢</span> Department Directory
                  </Link>
                </li>
                <li>
                  <Link to="/emergency" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>🚨</span> Emergency Services
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all">
                    <span>💬</span> Feedback & Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Contact & Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <div>
                    <div className="text-white font-semibold">1916</div>
                    <div className="text-xs">BMC Helpline</div>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">📧</span>
                  <div>
                    <div className="text-white font-semibold">support@snapreport.gov.in</div>
                    <div className="text-xs">Email Support</div>
                  </div>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🕒</span>
                  <div>
                    <div className="text-white font-semibold">24/7 Service</div>
                    <div className="text-xs">Always available</div>
                  </div>
                </li>
                <li className="pt-2">
                  <div className="flex gap-3">
                    <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">𝕏</a>
                    <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">f</a>
                    <a href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">📷</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <div className="text-gray-400">
                <Link to="/sitemap" className="hover:text-white">Sitemap</Link> • <Link to="/privacy" className="hover:text-white">Privacy</Link> • <Link to="/terms" className="hover:text-white">Terms</Link>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <span className="flex items-center gap-2 bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30">
                  <FiLock className="w-4 h-4" />
                  <span className="text-xs font-semibold">Secured System</span>
                </span>
                <span className="flex items-center gap-2 bg-purple-900/30 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30">
                  <FiUsers className="w-4 h-4" />
                  <span className="text-xs font-semibold">15,000+ Users</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
