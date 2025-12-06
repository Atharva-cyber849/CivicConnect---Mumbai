import React from 'react'
import { useAuth } from '../../context/AuthContext'
import OfficerWardMap from '../../components/Common/OfficerWardMap'
import { FiMapPin, FiAlertCircle } from 'react-icons/fi'
import { Map, MapPin, AlertTriangle, Target, Navigation } from 'lucide-react'

/**
 * BMC Officer Map Page
 * Officer-specific page showing only their assigned Mumbai ward
 * Features complaint map with density heatmap and hotspot identification
 */
const OfficerMapPage = () => {
  const { user } = useAuth()
  
  // Get ward from either ward or assigned_ward field
  const officerWard = user?.assigned_ward || user?.ward

  if (!officerWard) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Map className="h-9 w-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">BMC Ward Map</h1>
              <p className="text-blue-100 text-lg mt-1">Your assigned Mumbai ward's complaint overview</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">BMC Ward Assignment Required</h3>
          <p className="text-gray-600">
            Your account doesn't have a Mumbai ward assignment. Please contact the BMC administrator
            to assign your ward jurisdiction.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What is the BMC Officer Map?</h3>
          <p className="text-gray-600 mb-4">
            The BMC Officer Map displays all civic complaints within your assigned Mumbai ward:
          </p>
          <ul className="text-gray-600 space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>View all BMC complaints in your ward with status-based coloring</span>
            </li>
            <li className="flex items-start gap-2">
              <Map className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>Identify complaint hotspots with high density clustering</span>
            </li>
            <li className="flex items-start gap-2">
              <Navigation className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>See complaint density heatmap for quick visualization</span>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="officer-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#officer-map-grid)" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <MapPin className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">BMC Ward {officerWard} Map</h1>
            <p className="text-green-100 text-lg mt-1">
              Civic complaint overview and management for your assigned Mumbai ward
            </p>
          </div>
        </div>
      </div>

      {/* Officer Ward Map */}
      <OfficerWardMap height="75vh" />

      {/* Help Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">BMC Officer Map Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              View & Filter
            </h4>
            <ul className="text-gray-600 space-y-1 ml-7">
              <li>• Click pins to see civic complaint details</li>
              <li>• Use density heatmap to find problem areas</li>
              <li>• Filter by department (Roads, Water, etc.)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              Take Action
            </h4>
            <ul className="text-gray-600 space-y-1 ml-7">
              <li>• Click "Details" to open complaint page</li>
              <li>• Update status per BMC SLA guidelines</li>
              <li>• Navigate directly to complaint location</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Map className="h-5 w-5 text-purple-600" />
              BMC Metrics
            </h4>
            <ul className="text-gray-600 space-y-1 ml-7">
              <li>• View total complaints in your ward</li>
              <li>• Track SLA compliance and response times</li>
              <li>• Monitor pending vs. resolved ratio</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Priority Areas
            </h4>
            <ul className="text-gray-600 space-y-1 ml-7">
              <li>• Red markers show complaint clusters</li>
              <li>• Prioritize overdue SLA complaints</li>
              <li>• Focus on high-density problem areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficerMapPage
