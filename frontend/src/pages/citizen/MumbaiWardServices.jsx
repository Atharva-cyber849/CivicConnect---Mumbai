import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '../../api/complaintsApi';
import { useAuth } from '../../context/AuthContext';
import { MUMBAI_WARDS, BMC_DEPARTMENTS, COMPLAINT_CATEGORIES, BMC_WARD_OFFICES, BMC_ZONES } from '../../utils/constants';
import WardMap from '../../components/Common/WardMap';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  BuildingOffice2Icon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const MumbaiWardServices = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWard, setSelectedWard] = useState(searchParams.get('ward') || null);
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');

  // Get ward office info from centralized constants
  const getWardOfficeInfo = (wardCode) => {
    const wardOffice = BMC_WARD_OFFICES[wardCode];
    if (!wardOffice) return null;
    
    return {
      office: {
        name: wardOffice.name,
        address: wardOffice.address,
        phone: wardOffice.phone,
        timing: wardOffice.timing,
        officer: wardOffice.officer
      },
      services: [
        { name: 'Water Supply', department: 'WATER_SUPPLY', contact: wardOffice.phone, status: 'Active' },
        { name: 'Road Maintenance', department: 'ROADS', contact: wardOffice.phone, status: 'Active' },
        { name: 'Solid Waste Management', department: 'SOLID_WASTE', contact: wardOffice.phone, status: 'Active' },
        { name: 'Street Lighting', department: 'STREETLIGHTS', contact: wardOffice.phone, status: 'Active' },
        { name: 'Sewage & Drainage', department: 'SEWAGE', contact: wardOffice.phone, status: 'Active' },
        { name: 'Parks & Gardens', department: 'GARDENS', contact: wardOffice.phone, status: 'Active' }
      ],
      landmarks: wardOffice.landmarks,
      emergencyServices: wardOffice.emergencyContacts
    };
  };

  // Fetch ward-specific data only if authenticated
  const { data: wardData, isLoading } = useQuery({
    queryKey: ['mumbai-ward-services', selectedWard],
    queryFn: async () => {
      if (!selectedWard) return null;
      
      const [complaints, analytics] = await Promise.all([
        complaintsApi.getComplaintsByWard(selectedWard),
        complaintsApi.getWardServiceStats(selectedWard)
      ]);
      
      return { complaints, analytics };
    },
    enabled: !!selectedWard && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const handleWardSelect = (wardCode) => {
    setSelectedWard(wardCode);
    setSearchParams({ ward: wardCode, ...(selectedService && { service: selectedService }) });
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSearchParams({ ...(selectedWard && { ward: selectedWard }), service });
  };

  const handleReportIssue = (department) => {
    if (!isAuthenticated) {
      // Redirect to login and store the report details for after login
      navigate('/auth/login', { 
        state: { 
          from: '/ward-services',
          reportData: {
            ward: selectedWard,
            department,
            category: COMPLAINT_CATEGORIES.find(c => c.department === department)?.value
          }
        }
      });
      return;
    }
    
    navigate('/dashboard/report', { 
      state: { 
        ward: selectedWard,
        department,
        category: COMPLAINT_CATEGORIES.find(c => c.department === department)?.value
      }
    });
  };

  const currentWard = MUMBAI_WARDS.find(w => w.value === selectedWard);
  const wardInfo = getWardOfficeInfo(selectedWard);
  const complaints = wardData?.complaints || [];
  const analytics = wardData?.analytics || {};

  // Get zone info for selected ward
  const getWardZone = () => {
    if (!selectedWard) return null;
    return BMC_ZONES.find(zone => zone.wards.includes(selectedWard));
  };

  const currentZone = getWardZone();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
          <BuildingOffice2Icon className="h-10 w-10 text-blue-600" />
          Mumbai Ward Services
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Access BMC services, contact information, and report issues for your ward
        </p>
      </div>

      {/* Zone Overview */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 Select Your Ward</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BMC_ZONES.map((zone) => (
            <div 
              key={zone.name}
              className="p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg"
              style={{ borderColor: zone.color, backgroundColor: `${zone.color}08` }}
            >
              <h3 className="font-bold text-lg" style={{ color: zone.color }}>{zone.name} Zone</h3>
              <p className="text-sm text-gray-600 mt-2">{zone.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {zone.wards.map(ward => (
                  <button
                    key={ward}
                    onClick={() => handleWardSelect(ward)}
                    className={`text-xs px-2 py-1 rounded ${
                      selectedWard === ward 
                        ? 'text-white' 
                        : 'bg-white border'
                    }`}
                    style={{ 
                      backgroundColor: selectedWard === ward ? zone.color : undefined,
                      borderColor: zone.color
                    }}
                  >
                    {ward}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ward Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Select Your Ward</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {MUMBAI_WARDS.map((ward) => (
            <button
              key={ward.value}
              onClick={() => handleWardSelect(ward.value)}
              className={`p-3 text-center border rounded-lg transition-all ${
                selectedWard === ward.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="font-bold text-lg">{ward.value}</div>
              <div className="text-xs opacity-75">{ward.zone}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Ward Information */}
      {selectedWard && currentWard && (
        <>
          {/* Ward Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold mb-2">{currentWard.label}</h2>
                <p className="text-blue-100 text-lg">📍 Zone: {currentWard.zone}</p>
              </div>
              <MapPinIcon className="h-12 w-12 text-blue-100 opacity-50" />
            </div>
            
            {wardInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {isAuthenticated ? (
                  <>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-3xl font-bold">{complaints.length}</div>
                      <div className="text-sm text-blue-100 mt-1">Active Complaints</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-3xl font-bold">{wardInfo.services.length}</div>
                      <div className="text-sm text-blue-100 mt-1">Services</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-3xl font-bold">
                        {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                      </div>
                      <div className="text-sm text-blue-100 mt-1">Resolution Rate</div>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <div className="text-3xl font-bold">{analytics.avgResponseTime || 24}h</div>
                      <div className="text-sm text-blue-100 mt-1">Avg Response Time</div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20 col-span-full">
                    <div className="text-3xl font-bold">{wardInfo.services.length}</div>
                    <div className="text-sm text-blue-100 mt-1">Available Services</div>
                    <p className="text-blue-100 text-xs mt-2">Login to view statistics and complaints</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ward Office Information */}
          {wardInfo?.office && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BuildingOffice2Icon className="h-7 w-7 text-blue-600" />
                Ward Office Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-4">{wardInfo.office.name}</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPinIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Address</p>
                        <p className="text-base text-gray-800 mt-1">{wardInfo.office.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <PhoneIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Phone</p>
                        <p className="text-base text-gray-800 mt-1 font-semibold">{wardInfo.office.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <ClockIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-600">Office Hours</p>
                        <p className="text-base text-gray-800 mt-1">{wardInfo.office.timing}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-900 text-xl mb-4">Ward Officer</h4>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <p className="font-medium">{wardInfo.office.officer}</p>
                    <p className="text-sm text-gray-600 mt-1">Ward Administrative Officer</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mt-6 mb-3">Emergency Contacts</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(wardInfo.emergencyServices).map(([service, number]) => (
                      <div key={service} className="text-center p-2 bg-red-50 rounded border">
                        <div className="text-sm font-medium capitalize">{service}</div>
                        <div className="text-sm text-red-600 font-bold">{number}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Services */}
          {wardInfo?.services && (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🔧 Available BMC Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {wardInfo.services.map((service, index) => {
                  const department = BMC_DEPARTMENTS.find(d => d.value === service.department);
                  return (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {department?.icon}
                            {service.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-2">📞 {service.contact}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          service.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleReportIssue(service.department)}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Report Issue
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Complaints in Ward */}
          {isAuthenticated ? (
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ExclamationCircleIcon className="h-7 w-7 text-orange-600" />
                Recent Complaints in {currentWard.label}
              </h3>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Loading complaints...</p>
                </div>
              ) : complaints.length > 0 ? (
                <div className="space-y-4">
                  {complaints.slice(0, 5).map((complaint) => (
                    <div key={complaint.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-base">{complaint.title}</h4>
                          <p className="text-sm text-gray-600 mt-2">Category: {complaint.category}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            📅 {new Date(complaint.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-4 ${
                          complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          complaint.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {complaints.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => navigate('/dashboard/complaints', { state: { ward: selectedWard } })}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all {complaints.length} complaints
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <InformationCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No recent complaints in this ward</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-8 rounded-xl">
              <div className="flex items-start gap-4">
                <InformationCircleIcon className="h-7 w-7 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-blue-900 text-lg mb-2">Login to view complaints</h3>
                  <p className="text-blue-700 mb-5">Login to see recent complaints and their status for this ward</p>
                  <button
                    onClick={() => navigate('/auth/login', { state: { from: '/ward-services', ward: selectedWard } })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Login to View Complaints
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ward Map */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              Ward Map & Service Locations
            </h3>
            <div className="h-96">
              <WardMap 
                selectedWardCode={selectedWard}
                complaints={complaints}
                height="100%"
              />
            </div>
          </div>
        </>
      )}
      
      {!selectedWard && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm p-8">
          <BuildingOffice2Icon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 text-xl font-semibold">Please select a ward to view services and information</p>
          <p className="text-gray-500 text-base mt-2">Choose from the zones above to get started</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default MumbaiWardServices;