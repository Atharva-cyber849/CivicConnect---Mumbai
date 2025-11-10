import React from 'react'
import { Link } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'

const DashboardSimple = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-blue-100 text-lg">
              Track your complaints and help improve Mumbai together
            </p>
          </div>
          <Link 
            to="/dashboard/report"
            className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 shadow-lg"
          >
            <FiPlus className="w-5 h-5" />
            <span>Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* Test Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Loading...</h2>
        <p className="text-gray-600">
          If you see this message, the routing is working correctly.
        </p>
        <p className="text-gray-600 mt-2">
          The issue was with the API calls in the main Dashboard component.
        </p>
      </div>
    </div>
  )
}

export default DashboardSimple
