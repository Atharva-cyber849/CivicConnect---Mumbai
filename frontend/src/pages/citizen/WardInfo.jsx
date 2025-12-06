import React, { useState } from 'react'
import { 
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  HomeModernIcon,
  ChartBarIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const WardInfo = () => {
  const [selectedWard, setSelectedWard] = useState('H/W')
  const [searchQuery, setSearchQuery] = useState('')

  const mumbaiWards = [
    {
      code: 'A',
      name: 'Churchgate, Colaba, Fort',
      zone: 'Zone 1',
      area: '8.76 sq km',
      population: '89,000',
      officer: 'Mr. Rajesh Kumar',
      phone: '022-2266 1234',
      email: 'warda@mcgm.gov.in',
      office: 'A Ward Office, Colaba',
      highlights: ['Marine Drive', 'Gateway of India', 'Horniman Circle']
    },
    {
      code: 'B',
      name: 'Byculla, Agripada, Mazgaon',
      zone: 'Zone 1',
      area: '6.32 sq km',
      population: '156,000',
      officer: 'Ms. Priya Sharma',
      phone: '022-2373 4567',
      email: 'wardb@mcgm.gov.in',
      office: 'B Ward Office, Byculla',
      highlights: ['Bhau Daji Lad Museum', 'Veermata Jijabai Bhosale Udyan']
    },
    {
      code: 'H/W',
      name: 'Bandra West',
      zone: 'Zone 2',
      area: '11.24 sq km',
      population: '278,000',
      officer: 'Mr. Amit Desai',
      phone: '022-2640 5678',
      email: 'wardhw@mcgm.gov.in',
      office: 'H/W Ward Office, Bandra West',
      highlights: ['Bandstand', 'Bandra Fort', 'Linking Road', 'Carter Road']
    },
    {
      code: 'H/E',
      name: 'Bandra East',
      zone: 'Zone 2',
      area: '9.87 sq km',
      population: '312,000',
      officer: 'Ms. Sneha Patil',
      phone: '022-2642 3456',
      email: 'wardhe@mcgm.gov.in',
      office: 'H/E Ward Office, Bandra East',
      highlights: ['Bandra Kurla Complex', 'Kalanagar']
    },
    {
      code: 'K/W',
      name: 'Andheri West, Versova',
      zone: 'Zone 2',
      area: '14.52 sq km',
      population: '485,000',
      officer: 'Mr. Suresh Mehta',
      phone: '022-2632 7890',
      email: 'wardkw@mcgm.gov.in',
      office: 'K/W Ward Office, Andheri West',
      highlights: ['Versova Beach', 'Juhu', 'Lokhandwala']
    },
    {
      code: 'K/E',
      name: 'Andheri East, Marol',
      zone: 'Zone 2',
      area: '13.89 sq km',
      population: '421,000',
      officer: 'Ms. Kavita Naik',
      phone: '022-2836 4321',
      email: 'wardke@mcgm.gov.in',
      office: 'K/E Ward Office, Andheri East',
      highlights: ['SEEPZ', 'Marol', 'Chakala']
    },
    {
      code: 'L',
      name: 'Kurla, Sakinaka',
      zone: 'Zone 3',
      area: '12.43 sq km',
      population: '654,000',
      officer: 'Mr. Prakash Yadav',
      phone: '022-2505 8901',
      email: 'wardl@mcgm.gov.in',
      office: 'L Ward Office, Kurla',
      highlights: ['Kurla Terminus', 'Phoenix Market City']
    },
    {
      code: 'M/E',
      name: 'Chembur, Tilak Nagar',
      zone: 'Zone 3',
      area: '15.67 sq km',
      population: '523,000',
      officer: 'Ms. Meera Joshi',
      phone: '022-2522 6543',
      email: 'wardme@mcgm.gov.in',
      office: 'M/E Ward Office, Chembur',
      highlights: ['Chembur Colony', 'Diamond Garden']
    }
  ]

  const wardStats = selectedWard ? mumbaiWards.find(w => w.code === selectedWard) : null

  const departments = [
    {
      name: 'Public Health',
      services: ['Mosquito Control', 'Food Inspection', 'Immunization']
    },
    {
      name: 'Solid Waste Management',
      services: ['Door-to-Door Collection', 'Street Cleaning', 'Recycling']
    },
    {
      name: 'Roads & Maintenance',
      services: ['Pothole Repairs', 'Road Resurfacing', 'Footpath Maintenance']
    },
    {
      name: 'Water Supply',
      services: ['Water Distribution', 'Pipe Maintenance', 'Quality Testing']
    }
  ]

  const filteredWards = mumbaiWards.filter(ward => 
    ward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ward.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <BuildingOffice2Icon className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ward Information</h1>
            <p className="text-indigo-100 mt-1">Know your ward and local BMC office</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search ward by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Ward Selector */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Select Your Ward</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredWards.map((ward) => (
            <button
              key={ward.code}
              onClick={() => setSelectedWard(ward.code)}
              className={`p-4 rounded-lg border-2 font-semibold text-center transition-all ${
                selectedWard === ward.code
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300 text-gray-700'
              }`}
            >
              {ward.code}
            </button>
          ))}
        </div>
      </div>

      {/* Ward Details */}
      {wardStats && (
        <>
          {/* Overview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ward {wardStats.code}</h2>
                <p className="text-gray-600 mt-1">{wardStats.name}</p>
              </div>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm">
                {wardStats.zone}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <span className="text-sm text-gray-600">Area</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{wardStats.area}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                  <span className="text-sm text-gray-600">Population</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{wardStats.population}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <HomeModernIcon className="h-6 w-6 text-purple-600" />
                  <span className="text-sm text-gray-600">Density</span>
                </div>
                <p className="text-xl font-bold text-gray-900">High</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <InformationCircleIcon className="h-6 w-6 text-orange-600" />
                  <span className="text-sm text-gray-600">Status</span>
                </div>
                <p className="text-xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>

          {/* Ward Officer & Contact */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">Ward Officer Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{wardStats.officer}</h4>
                    <p className="text-sm text-gray-600 mb-3">Ward Officer</p>
                    <div className="space-y-2 text-sm">
                      <a href={`tel:${wardStats.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <PhoneIcon className="h-4 w-4" />
                        {wardStats.phone}
                      </a>
                      <a href={`mailto:${wardStats.email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                        <EnvelopeIcon className="h-4 w-4" />
                        {wardStats.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPinIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Ward Office</h4>
                    <p className="text-sm text-gray-600 mb-3">{wardStats.office}</p>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Office Hours:</p>
                      <p>Mon - Fri: 10:00 AM - 6:00 PM</p>
                      <p>Sat: 10:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Key Locations in Ward {wardStats.code}</h3>
            <div className="flex flex-wrap gap-2">
              {wardStats.highlights.map((highlight, idx) => (
                <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">Departments & Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map((dept, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                  <h4 className="font-semibold text-lg mb-3 text-indigo-600">{dept.name}</h4>
                  <ul className="space-y-2">
                    {dept.services.map((service, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full"></span>
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <InformationCircleIcon className="h-8 w-8 text-indigo-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-indigo-900 mb-2">About Mumbai Wards</h3>
            <p className="text-sm text-indigo-800 mb-2">
              Mumbai is divided into 24 municipal wards (A to S) for administrative purposes. Each ward has a dedicated
              officer responsible for civic services and complaint resolution.
            </p>
            <p className="text-sm text-indigo-800">
              You can report issues specific to your ward using the "Report Issue" feature, and they will be
              automatically routed to your ward officer for faster resolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WardInfo
