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

  // Fetch ward-specific data
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
    enabled: !!selectedWard,
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
          Mumbai Ward Services
        </h1>
        <p className="text-gray-600 mt-1">
          Access BMC services, contact information, and report issues for your ward
        </p>
      </div>

      {/* Zone Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Mumbai Administrative Zones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BMC_ZONES.map((zone) => (
            <div 
              key={zone.name}
              className="p-4 rounded-lg border"
              style={{ borderColor: zone.color, backgroundColor: `${zone.color}10` }}
            >
              <h3 className="font-bold" style={{ color: zone.color }}>{zone.name} Zone</h3>
              <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">{currentWard.label}</h2>
            <p className="text-blue-100 mb-4">Zone: {currentWard.zone}</p>
            
            {wardInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{complaints.length}</div>
                  <div className="text-sm text-blue-100">Active Complaints</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{wardInfo.services.length}</div>
                  <div className="text-sm text-blue-100">Available Services</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">
                    {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-blue-100">Resolution Rate</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{analytics.avgResponseTime || 24}h</div>
                  <div className="text-sm text-blue-100">Avg Response Time</div>
                </div>
              </div>
            )}
          </div>

          {/* Ward Office Information */}
          {wardInfo?.office && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BuildingOffice2Icon className="h-5 w-5 text-blue-600" />
                Ward Office Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{wardInfo.office.name}</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-gray-600">{wardInfo.office.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{wardInfo.office.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Office Hours</p>
                        <p className="text-sm text-gray-600">{wardInfo.office.timing}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Ward Officer</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
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
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Available BMC Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wardInfo.services.map((service, index) => {
                  const department = BMC_DEPARTMENTS.find(d => d.value === service.department);
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {department?.icon}
                            {service.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">Contact: {service.contact}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          service.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleReportIssue(service.department)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-orange-600" />
              Recent Complaints in {currentWard.label}
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading complaints...</p>
              </div>
            ) : complaints.length > 0 ? (
              <div className="space-y-3">
                {complaints.slice(0, 5).map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{complaint.category}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
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
        <div className="text-center py-12">
          <BuildingOffice2Icon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 text-lg">Please select a ward to view services and information</p>
        </div>
      )}
    </div>
  );
};

export default MumbaiWardServices;