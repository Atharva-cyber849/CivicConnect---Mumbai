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
import { Building2, MapPin, Phone, Clock, Info, AlertTriangle, Target, Map, Shield, Users, FileText, Activity, TrendingUp, CheckCircle2 } from 'lucide-react';

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
        { name: 'Road Maintenance', department: 'ROADS_MAINTENANCE', contact: wardOffice.phone, status: 'Active' },
        { name: 'Solid Waste Management', department: 'SOLID_WASTE', contact: wardOffice.phone, status: 'Active' },
        { name: 'Street Lighting', department: 'STREETLIGHTS', contact: wardOffice.phone, status: 'Active' },
        { name: 'Sewage & Drainage', department: 'SEWERAGE', contact: wardOffice.phone, status: 'Active' },
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
    <div className="min-h-screen bg-gray-50">
      {/* Government Header Banner */}
      <div className="bg-white border-b-4 border-orange-500">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mumbai Ward Services</h1>
                <p className="text-sm text-gray-600">Brihanmumbai Municipal Corporation</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-2xl text-orange-600">24</div>
                <div className="text-gray-600">Wards</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-600">6</div>
                <div className="text-gray-600">Zones</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="font-bold text-2xl text-green-600">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Ward-Based Service Portal</h2>
              <p className="text-blue-100 leading-relaxed">
                Select your ward to access localized BMC services, view ward office details, contact information, 
                and track civic issues in your area. Each ward is managed by dedicated officers ensuring prompt service delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Zone Overview Cards */}
        <div>
          <div className="bg-white border-l-4 border-orange-500 p-4 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-orange-600" />
              Select Ward by Zone
            </h2>
            <p className="text-gray-600 text-sm mt-1">Mumbai is divided into 6 administrative zones. Select your zone and ward below.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BMC_ZONES.map((zone) => (
              <div 
                key={zone.name}
                className="bg-white border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                style={{ borderColor: zone.color }}
              >
                <div 
                  className="p-4 text-white font-bold text-lg flex items-center gap-2"
                  style={{ backgroundColor: zone.color }}
                >
                  <Building2 className="w-5 h-5" />
                  {zone.name} Zone
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{zone.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Wards:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {zone.wards.map(ward => (
                        <button
                          key={ward}
                          onClick={() => handleWardSelect(ward)}
                          className={`text-sm font-medium py-2 rounded transition-all ${
                            selectedWard === ward 
                              ? 'text-white shadow-md transform scale-105' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          style={{ 
                            backgroundColor: selectedWard === ward ? zone.color : undefined
                          }}
                        >
                          {ward}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* Selected Ward Information */}
      {selectedWard && currentWard && (
        <>
          {/* Ward Header Card */}
          <div className="bg-white border-l-4 border-green-600 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-green-100 mb-1">Selected Ward</div>
                  <h2 className="text-3xl font-bold mb-1">{currentWard.label}</h2>
                  <div className="flex items-center gap-2 text-green-100">
                    <MapPin className="w-4 h-4" />
                    <span>Zone: {currentWard.zone}</span>
                  </div>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-12 h-12" />
                </div>
              </div>
            </div>
            
            {wardInfo && (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isAuthenticated ? (
                    <>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900">{complaints.length}</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">Active Complaints</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-900">{wardInfo.services.length}</div>
                        <div className="text-xs text-purple-600 font-medium mt-1">Services Available</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-900">
                          {Math.round(((analytics.resolved || 0) / Math.max(complaints.length, 1)) * 100)}%
                        </div>
                        <div className="text-xs text-green-600 font-medium mt-1">Resolution Rate</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-900">{analytics.avgResponseTime || 24}h</div>
                        <div className="text-xs text-orange-600 font-medium mt-1">Avg Response</div>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 md:col-span-4 text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <div className="text-xl font-bold text-gray-700">{wardInfo.services.length} Services Available</div>
                      <p className="text-sm text-gray-500 mt-2">Login to view ward statistics and complaint tracking</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ward Office Information */}
          {wardInfo?.office && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
                  Ward Office Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contact Details */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-4 pb-2 border-b">{wardInfo.office.name}</h4>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Address</p>
                            <p className="text-sm text-gray-800">{wardInfo.office.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Contact Number</p>
                            <p className="text-sm text-gray-800 font-bold">{wardInfo.office.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Office Hours</p>
                            <p className="text-sm text-gray-800">{wardInfo.office.timing}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Officer & Emergency */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-4 pb-2 border-b">Administrative Officer</h4>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-600">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-blue-900">{wardInfo.office.officer}</p>
                            <p className="text-xs text-blue-600 font-medium">Ward Administrative Officer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Emergency Contacts
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(wardInfo.emergencyServices).map(([service, number]) => (
                          <div key={service} className="text-center p-3 bg-red-50 rounded-lg border-2 border-red-200">
                            <div className="text-xs font-bold text-red-900 capitalize mb-1">{service}</div>
                            <div className="text-base text-red-600 font-bold">{number}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available Services */}
          {wardInfo?.services && (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Available BMC Services
                </h3>
                <p className="text-sm text-gray-600 mt-1">Report issues and access ward-level services</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wardInfo.services.map((service, index) => {
                    const department = BMC_DEPARTMENTS.find(d => d.value === service.department);
                    return (
                      <div key={index} className="border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-white overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                {department?.icon || '🏢'}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                service.status === 'Active' 
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-red-100 text-red-700 border border-red-300'
                              }`}>
                                {service.status}
                              </span>
                            </div>
                          </div>
                          <h4 className="font-bold text-gray-900">{service.name}</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{service.contact}</span>
                          </div>
                          <button
                            onClick={() => handleReportIssue(service.department)}
                            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Report Issue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Complaints in Ward */}
          {isAuthenticated ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-orange-600" />
                  Recent Complaints - {currentWard.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Track and monitor civic issues reported in your ward</p>
              </div>
              
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">Loading complaint data...</p>
                </div>
              ) : complaints.length > 0 ? (
                <div className="p-6">
                  <div className="space-y-3">
                    {complaints.slice(0, 5).map((complaint) => (
                      <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all bg-gray-50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                complaint.status === 'RESOLVED' ? 'bg-green-500' :
                                complaint.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                complaint.status === 'REJECTED' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{complaint.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="font-medium">{complaint.category}</span>
                                  <span>•</span>
                                  <span>{new Date(complaint.created_at).toLocaleDateString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
                            complaint.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border border-green-300' :
                            complaint.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                            complaint.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-300' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          }`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {complaints.length > 5 && (
                    <div className="mt-6 text-center pt-4 border-t">
                      <button
                        onClick={() => navigate('/dashboard/complaints', { state: { ward: selectedWard } })}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center gap-2"
                      >
                        View All {complaints.length} Complaints
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <InformationCircleIcon className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No recent complaints in this ward</p>
                  <p className="text-sm text-gray-400 mt-1">Start by reporting an issue above</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-2">Authentication Required</h3>
                  <p className="text-blue-700 mb-4 leading-relaxed">Login to your account to view recent complaints, track issue status, and access detailed ward statistics.</p>
                  <button
                    onClick={() => navigate('/auth/login', { state: { from: '/ward-services', ward: selectedWard } })}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Login to View Complaints
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ward Map */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-green-600" />
                Ward Map & Service Locations
              </h3>
              <p className="text-sm text-gray-600 mt-1">Geographic view of {currentWard.label} with complaint markers</p>
            </div>
            <div className="p-6">
              <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: '500px' }}>
                <WardMap 
                  selectedWardCode={selectedWard}
                  showStats={true}
                  height="500px"
                />
              </div>
            </div>
          </div>
        </>
      )}
      
      {!selectedWard && (
        <div className="bg-white shadow-lg rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Ward Selected</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Please select a ward from the zones above to view services, office information, and track civic issues in your area.
          </p>
        </div>
      )}
      </div>
    </div>
  );
};

export default MumbaiWardServices;