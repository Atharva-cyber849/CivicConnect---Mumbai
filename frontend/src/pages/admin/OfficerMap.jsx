import React from 'react'
import { useAuth } from '../../context/AuthContext'
import OfficerWardMap from '../../components/Common/OfficerWardMap'
import { FiMapPin, FiAlertCircle } from 'react-icons/fi'

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BMC Ward Map</h1>
          <p className="text-gray-600 mt-1">Your assigned Mumbai ward's complaint overview</p>
        </div>

        <div className="card p-8 bg-red-50 border border-red-200 rounded-lg text-center">
          <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">BMC Ward Assignment Required</h3>
          <p className="text-red-800">
            Your account doesn't have a Mumbai ward assignment. Please contact the BMC administrator
            to assign your ward jurisdiction.
          </p>
        </div>

        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">What is the BMC Officer Map?</h3>
          <p className="text-blue-800 text-sm mb-3">
            The BMC Officer Map displays all civic complaints within your assigned Mumbai ward:
          </p>
          <ul className="text-blue-800 text-sm space-y-1 ml-4">
            <li>• View all BMC complaints in your ward with status-based coloring</li>
            <li>• Identify complaint hotspots with high density clustering</li>
            <li>• See complaint density heatmap for quick visualization</li>
            <li>• Track SLA response times and pending complaints</li>
            <li>• Access detailed complaint information and take action</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FiMapPin className="text-blue-600" />
          BMC Ward {officerWard} Map
        </h1>
        <p className="text-gray-600 mt-1">
          Civic complaint overview and management for your assigned Mumbai ward
        </p>
      </div>

      {/* Officer Ward Map */}
      <OfficerWardMap height="75vh" />

      {/* Help Section */}
      <div className="card bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">BMC Officer Map Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">🔍 View & Filter</h4>
            <ul className="text-indigo-800 space-y-1">
              <li>• Click pins to see civic complaint details</li>
              <li>• Use density heatmap to find problem areas</li>
              <li>• Filter by department (Roads, Water, etc.)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">⚡ Take Action</h4>
            <ul className="text-indigo-800 space-y-1">
              <li>• Click "Details" to open complaint page</li>
              <li>• Update status per BMC SLA guidelines</li>
              <li>• Navigate directly to complaint location</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">📊 BMC Metrics</h4>
            <ul className="text-indigo-800 space-y-1">
              <li>• View total complaints in your ward</li>
              <li>• Track SLA compliance and response times</li>
              <li>• Monitor pending vs. resolved ratio</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-900 mb-2">🎯 Priority Areas</h4>
            <ul className="text-indigo-800 space-y-1">
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
