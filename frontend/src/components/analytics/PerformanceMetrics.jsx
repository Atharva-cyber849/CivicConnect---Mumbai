import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const PerformanceMetrics = ({ officerId }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch performance data
  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['officerPerformance', officerId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/complaints/performance/${officerId}/`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }
      );
      return response.data;
    },
    enabled: !!officerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent ratings
  const { data: ratingsData, isLoading: ratingsLoading } = useQuery({
    queryKey: ['officerRatings', officerId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/complaints/ratings/officer_ratings/${officerId}/`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }
      );
      return response.data;
    },
    enabled: !!officerId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch comparison with department
  const { data: comparisonData } = useQuery({
    queryKey: ['performanceComparison'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/complaints/performance/department_comparison/`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (performanceLoading || ratingsLoading) {
    return <div className="flex justify-center items-center h-64">Loading performance data...</div>;
  }

  if (!performanceData) {
    return <div className="p-6 text-center text-gray-500">No performance data available</div>;
  }

  const p = performanceData;
  const rating = ratingsData?.stats || {};
  const comparison = comparisonData?.my_performance || {};
  const deptAvg = comparisonData?.department_averages || {};

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {['overview', 'ratings', 'comparison', 'trends'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              selectedTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Rating Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">Citizen Satisfaction</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{p.avg_rating.toFixed(1)}</p>
                <p className="text-sm text-gray-500 mt-1">from {p.total_ratings} ratings</p>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon
                    key={i}
                    className={`h-6 w-6 ${
                      i <= Math.round(p.avg_rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="text-center">
                  <div className="h-8 bg-yellow-300 rounded-sm mb-1" style={{
                    height: `${Math.max((p[`${stars}_star_count`] / Math.max(...Object.values(p).filter((v, k) => k.includes('_star_count'))) * 40), 4)}px`
                  }}></div>
                  <p className="text-xs font-medium">{stars}★</p>
                  <p className="text-xs text-gray-500">{p[`${stars}_star_count`]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Completion Rate */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-blue-500" />
                <p className="text-xs font-medium text-gray-600">Completion Rate</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{p.completion_rate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{p.total_resolved} of {p.total_assigned}</p>
            </div>

            {/* SLA Compliance */}
            <div className={`bg-white rounded-lg border p-4 ${
              p.sla_compliance_rate >= 85 ? 'border-green-200' : 'border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <ArrowTrendingUpIcon className={`h-5 w-5 ${
                  p.sla_compliance_rate >= 85 ? 'text-green-500' : 'text-red-500'
                }`} />
                <p className="text-xs font-medium text-gray-600">SLA Compliance</p>
              </div>
              <p className={`text-2xl font-bold ${
                p.sla_compliance_rate >= 85 ? 'text-green-600' : 'text-red-600'
              }`}>
                {p.sla_compliance_rate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {p.sla_compliant_count} on-time, {p.sla_breached_count} late
              </p>
            </div>

            {/* Avg Resolution Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                <p className="text-xs font-medium text-gray-600">Avg Resolution</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {p.avg_resolution_time_days.toFixed(1)}d
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {p.avg_resolution_time_hours.toFixed(1)} hours
              </p>
            </div>

            {/* Pending Complaints */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <UserGroupIcon className="h-5 w-5 text-orange-500" />
                <p className="text-xs font-medium text-gray-600">Active Cases</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{p.total_pending}</p>
              <p className="text-xs text-gray-500 mt-1">
                {p.total_assigned} total assigned
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ratings Tab */}
      {selectedTab === 'ratings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Recent Ratings & Comments</h4>
            {ratingsData?.ratings && ratingsData.ratings.length > 0 ? (
              <div className="space-y-4">
                {ratingsData.ratings.map((rating) => (
                  <div key={rating.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{rating.complaint_title}</p>
                        <p className="text-sm text-gray-600 mt-1">{rating.comment || 'No comment'}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i <= rating.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No ratings yet</p>
            )}
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {selectedTab === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Rating Comparison</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Rating</span>
                  <span className="text-lg font-bold text-blue-600">{p.avg_rating?.toFixed(1)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(p.avg_rating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Dept Average</span>
                  <span className="text-lg font-bold text-gray-600">
                    {deptAvg.avg_rating?.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${(deptAvg.avg_rating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                {comparisonData?.above_average?.rating ? (
                  <p className="text-green-600 text-sm font-medium">
                    ✓ Above department average
                  </p>
                ) : (
                  <p className="text-orange-600 text-sm font-medium">
                    ↓ Below department average
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SLA Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">SLA Compliance Comparison</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Your Compliance</span>
                  <span className="text-lg font-bold text-blue-600">
                    {p.sla_compliance_rate?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${p.sla_compliance_rate}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Dept Average</span>
                  <span className="text-lg font-bold text-gray-600">
                    {deptAvg.avg_sla_compliance?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${deptAvg.avg_sla_compliance}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                {comparisonData?.above_average?.sla_compliance ? (
                  <p className="text-green-600 text-sm font-medium">
                    ✓ Better than department average
                  </p>
                ) : (
                  <p className="text-orange-600 text-sm font-medium">
                    ↓ Needs improvement vs department
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Time Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Resolution Time</h4>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Your Avg Time</span>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {p.avg_resolution_time_days?.toFixed(1)} days
                </p>
                <p className="text-xs text-gray-500">{p.avg_resolution_time_hours?.toFixed(1)}h</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Dept Avg Time</span>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {(deptAvg.avg_resolution_time / 24)?.toFixed(1)} days
                </p>
                <p className="text-xs text-gray-500">{deptAvg.avg_resolution_time?.toFixed(1)}h</p>
              </div>
              <div className="pt-4 border-t">
                {comparisonData?.above_average?.resolution_time ? (
                  <p className="text-green-600 text-sm font-medium">
                    ✓ Faster than department average
                  </p>
                ) : (
                  <p className="text-orange-600 text-sm font-medium">
                    ↓ Slower than department average
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {selectedTab === 'trends' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Performance Summary</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Assigned</p>
                <p className="text-3xl font-bold text-gray-900">{p.total_assigned}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{p.total_resolved}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-gray-600">{p.total_rejected}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Ratings</p>
                <p className="text-3xl font-bold text-yellow-600">{p.total_ratings}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Last Updated</p>
              <p className="text-sm text-gray-900">
                {new Date(p.last_calculated).toLocaleDateString()} at{' '}
                {new Date(p.last_calculated).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
