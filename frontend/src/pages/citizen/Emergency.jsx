import React from 'react'
import { 
  PhoneIcon, 
  FireIcon,
  ShieldExclamationIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  BoltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const Emergency = () => {
  const emergencyContacts = [
    {
      icon: ShieldExclamationIcon,
      title: 'Police Emergency',
      number: '100',
      description: 'For immediate police assistance',
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      available: '24/7'
    },
    {
      icon: FireIcon,
      title: 'Fire Brigade',
      number: '101',
      description: 'Fire emergencies and rescue operations',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600',
      available: '24/7'
    },
    {
      icon: HeartIcon,
      title: 'Ambulance',
      number: '102',
      description: 'Medical emergencies and ambulance service',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      available: '24/7'
    },
    {
      icon: PhoneIcon,
      title: 'BMC Control Room',
      number: '1916',
      description: 'Municipal services and civic complaints',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      available: '24/7'
    }
  ]

  const bmcServices = [
    {
      icon: TruckIcon,
      department: 'Disaster Management',
      number: '022-2269 4725',
      email: 'disaster@mcgm.gov.in',
      description: 'Natural disasters, floods, building collapse'
    },
    {
      icon: WrenchScrewdriverIcon,
      department: 'Water Supply Department',
      number: '022-2285 5511',
      email: 'water@mcgm.gov.in',
      description: 'Water supply issues, pipe bursts, contamination'
    },
    {
      icon: BoltIcon,
      department: 'Electrical Department',
      number: '022-2285 6868',
      email: 'electrical@mcgm.gov.in',
      description: 'Street light failures, electrical hazards'
    },
    {
      icon: ExclamationTriangleIcon,
      department: 'Sewerage & Drainage',
      number: '022-2285 5588',
      email: 'sewerage@mcgm.gov.in',
      description: 'Sewage overflow, drainage blockage'
    }
  ]

  const zoneOffices = [
    {
      zone: 'Zone 1 - South Mumbai',
      address: 'BMC Head Office, Mahapalika Marg, Fort',
      phone: '022-2262 4200',
      wards: 'A, B, C, D, E'
    },
    {
      zone: 'Zone 2 - Western Suburbs',
      address: 'Raheja Vihar, Off Chandivali Road, Andheri (East)',
      phone: '022-2821 7121',
      wards: 'K/E, K/W, H/E, H/W, P/N, P/S'
    },
    {
      zone: 'Zone 3 - Eastern Suburbs',
      address: 'Kamgar Kalyan Bhavan, Vikhroli',
      phone: '022-2577 8181',
      wards: 'L, M/E, M/W, N, T, S'
    }
  ]

  const emergencyGuidelines = [
    {
      title: 'During Floods',
      points: [
        'Move to higher ground immediately',
        'Don\'t walk through flood water',
        'Avoid contact with electrical equipment',
        'Call BMC Control Room: 1916'
      ]
    },
    {
      title: 'Gas Leaks',
      points: [
        'Don\'t use any electrical switches',
        'Open all windows and doors',
        'Evacuate the building',
        'Call Gas Authority: 1906'
      ]
    },
    {
      title: 'Building Hazards',
      points: [
        'Report structural cracks immediately',
        'Evacuate if building is unsafe',
        'Don\'t return until inspection',
        'Contact: 022-2269 4725'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-pulse">
            <ShieldExclamationIcon className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Emergency Contacts</h1>
            <p className="text-red-100 mt-1">Quick access to emergency services in Mumbai</p>
          </div>
        </div>
        <div className="bg-red-500/30 backdrop-blur-sm rounded-lg p-4 border border-red-400/50">
          <p className="text-sm">
            <strong>⚠️ For Life-Threatening Emergencies:</strong> Call 100 (Police), 101 (Fire), or 102 (Ambulance) immediately
          </p>
        </div>
      </div>

      {/* Emergency Numbers */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Primary Emergency Numbers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {emergencyContacts.map((contact, idx) => (
            <div key={idx} className={`${contact.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <contact.icon className={`h-10 w-10 ${contact.iconColor}`} />
                <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
                  {contact.available}
                </span>
              </div>
              <h3 className="font-bold text-xl mb-2 text-gray-900">{contact.title}</h3>
              <a 
                href={`tel:${contact.number}`}
                className="text-3xl font-bold text-gray-900 hover:underline mb-2 block"
              >
                {contact.number}
              </a>
              <p className="text-sm text-gray-600">{contact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BMC Department Contacts */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">BMC Department Emergency Lines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bmcServices.map((service, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <service.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{service.department}</h3>
                  <div className="space-y-1 text-sm">
                    <a href={`tel:${service.number}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                      <PhoneIcon className="h-4 w-4" />
                      {service.number}
                    </a>
                    <a href={`mailto:${service.email}`} className="text-gray-600 hover:text-blue-600 block">
                      {service.email}
                    </a>
                    <p className="text-gray-500 mt-2">{service.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Offices */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">BMC Zone Offices</h2>
        <div className="space-y-4">
          {zoneOffices.map((zone, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-blue-600 mb-2">{zone.zone}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{zone.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                      <a href={`tel:${zone.phone}`} className="text-blue-600 hover:underline">
                        {zone.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500">Wards Covered</span>
                  <p className="text-sm font-medium text-gray-900 mt-1">{zone.wards}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Guidelines */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Emergency Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {emergencyGuidelines.map((guideline, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-red-600">{guideline.title}</h3>
              <ul className="space-y-2">
                {guideline.points.map((point, pointIdx) => (
                  <li key={pointIdx} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-orange-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg text-orange-900 mb-2">Important Notice</h3>
            <ul className="space-y-2 text-sm text-orange-800">
              <li>• Keep these emergency numbers saved in your phone</li>
              <li>• For non-emergency civic issues, use the "Report Issue" feature on this portal</li>
              <li>• Prank calls to emergency services are punishable by law</li>
              <li>• During monsoon season, avoid traveling to flood-prone areas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Emergency
