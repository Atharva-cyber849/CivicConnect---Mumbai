import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResponseTimeMetrics = ({ data }) => {
  if (!data) {
    return <div className="text-slate-600">No response time data available</div>;
  }

  const { wards, summary } = data;

  // Get top and worst wards
  const sortedWards = Object.entries(wards || {})
    .filter(([, m]) => m.total_complaints > 0)
    .sort(([, a], [, b]) => (b.sla_compliance_rate || 0) - (a.sla_compliance_rate || 0));

  const topWards = sortedWards.slice(0, 5);
  const worstWards = sortedWards.slice(-5).reverse();

  // Color for SLA compliance
  const getSLAColor = (rate) => {
    if (rate >= 90) return 'text-green-600 bg-green-50';
    if (rate >= 75) return 'text-blue-600 bg-blue-50';
    if (rate >= 60) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getSLABadge = (rate) => {
    if (rate >= 90) return 'bg-green-100 text-green-800';
    if (rate >= 75) return 'bg-blue-100 text-blue-800';
    if (rate >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  // Summary Cards
  const SummaryCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<ClockIcon className="w-6 h-6" />}
          label="Avg Response Time"
          value={`${summary?.avg_response_time || 0}h`}
          color="blue"
        />
        <StatCard
          icon={<ArrowTrendingUpIcon className="w-6 h-6" />}
          label="Overall SLA Compliance"
          value={`${summary?.overall_sla_compliance || 0}%`}
          color={summary?.overall_sla_compliance >= 80 ? 'green' : 'red'}
        />
        <StatCard
          icon={<CheckCircleIcon className="w-6 h-6" />}
          label="Best Performing Ward"
          value={`Ward ${summary?.best_performing_ward || 'N/A'}`}
          color="green"
        />
        <StatCard
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          label="Worst Performing Ward"
          value={`Ward ${summary?.worst_performing_ward || 'N/A'}`}
          color="red"
        />
      </div>
    );
  };

  // Ward Response Time Comparison
  const ResponseTimeComparison = () => {
    const wardNames = Object.keys(wards || {}).sort();
    const avgResponseTimes = wardNames.map(
      w => wards[w].avg_response_time_hours || 0
    );
    const slaCompliance = wardNames.map(
      w => wards[w].sla_compliance_rate || 0
    );

    const chartData = {
      labels: wardNames.map(w => `Ward ${w}`),
      datasets: [
        {
          label: 'Avg Response Time (hours)',
          data: avgResponseTimes,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'SLA Compliance Rate (%)',
          data: slaCompliance,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };

    return (
      <div className="h-96 w-full">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Response Time (hours)'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'SLA Compliance (%)'
                },
                grid: {
                  drawOnChartArea: false,
                }
              }
            }
          }}
        />
      </div>
    );
  };

  // Top Performing Wards
  const TopPerformingWards = () => {
    return (
      <div className="space-y-3">
        {topWards.map(([ward, metrics]) => (
          <div
            key={ward}
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-lg text-slate-900">Ward {ward}</p>
                <p className="text-sm text-slate-600">{metrics.total_complaints} complaints</p>
              </div>
              <div className={`px-3 py-1 rounded-full font-semibold ${getSLABadge(metrics.sla_compliance_rate)}`}>
                {metrics.sla_compliance_rate}% SLA
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-600">Avg Response</p>
                <p className="font-bold text-slate-900">{metrics.avg_response_time_hours}h</p>
              </div>
              <div>
                <p className="text-slate-600">Resolved</p>
                <p className="font-bold text-slate-900">{metrics.resolved}/{metrics.total_complaints}</p>
              </div>
              <div>
                <p className="text-slate-600">Avg Resolution</p>
                <p className="font-bold text-slate-900">{metrics.avg_resolution_time_hours}h</p>
              </div>
            </div>

            {/* Response Distribution */}
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-slate-700">Response Time Distribution</p>
              <div className="space-y-1">
                {[
                  { label: '< 4h', value: metrics.response_distribution.under_4_hours, color: 'bg-green-400' },
                  { label: '4-8h', value: metrics.response_distribution['4_to_8_hours'], color: 'bg-blue-400' },
                  { label: '8-24h', value: metrics.response_distribution['8_to_24_hours'], color: 'bg-amber-400' },
                  { label: '1-3d', value: metrics.response_distribution['1_to_3_days'], color: 'bg-orange-400' },
                  { label: '3+d', value: metrics.response_distribution['3_plus_days'], color: 'bg-red-400' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 w-8">{item.label}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{
                          width: `${(item.value / metrics.total_complaints) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Worst Performing Wards
  const WorstPerformingWards = () => {
    return (
      <div className="space-y-3">
        {worstWards.map(([ward, metrics]) => (
          <div
            key={ward}
            className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-lg text-slate-900">Ward {ward}</p>
                <p className="text-sm text-slate-600">{metrics.total_complaints} complaints</p>
              </div>
              <div className={`px-3 py-1 rounded-full font-semibold ${getSLABadge(metrics.sla_compliance_rate)}`}>
                {metrics.sla_compliance_rate}% SLA
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-600">Avg Response</p>
                <p className="font-bold text-slate-900">{metrics.avg_response_time_hours}h</p>
              </div>
              <div>
                <p className="text-slate-600">SLA Breached</p>
                <p className="font-bold text-red-600">{metrics.sla_breached}</p>
              </div>
              <div>
                <p className="text-slate-600">Avg Resolution</p>
                <p className="font-bold text-slate-900">{metrics.avg_resolution_time_hours}h</p>
              </div>
            </div>

            {/* Response Distribution */}
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-slate-700">Response Time Distribution</p>
              <div className="space-y-1">
                {[
                  { label: '< 4h', value: metrics.response_distribution.under_4_hours, color: 'bg-green-400' },
                  { label: '4-8h', value: metrics.response_distribution['4_to_8_hours'], color: 'bg-blue-400' },
                  { label: '8-24h', value: metrics.response_distribution['8_to_24_hours'], color: 'bg-amber-400' },
                  { label: '1-3d', value: metrics.response_distribution['1_to_3_days'], color: 'bg-orange-400' },
                  { label: '3+d', value: metrics.response_distribution['3_plus_days'], color: 'bg-red-400' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 w-8">{item.label}</span>
                    <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{
                          width: `${(item.value / metrics.total_complaints) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-6 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Response Time Distribution Overall
  const ResponseDistributionChart = () => {
    // Aggregate distribution across all wards
    const aggregated = {
      under_4_hours: 0,
      '4_to_8_hours': 0,
      '8_to_24_hours': 0,
      '1_to_3_days': 0,
      '3_plus_days': 0
    };

    Object.values(wards || {}).forEach(metric => {
      Object.keys(aggregated).forEach(key => {
        aggregated[key] += metric.response_distribution[key] || 0;
      });
    });

    const total = Object.values(aggregated).reduce((a, b) => a + b, 0);

    const chartData = {
      labels: [
        '< 4 hours',
        '4-8 hours',
        '8-24 hours',
        '1-3 days',
        '3+ days'
      ],
      datasets: [
        {
          data: [
            aggregated.under_4_hours,
            aggregated['4_to_8_hours'],
            aggregated['8_to_24_hours'],
            aggregated['1_to_3_days'],
            aggregated['3_plus_days']
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',    // Green
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(251, 191, 36, 0.8)',   // Amber
            'rgba(249, 115, 22, 0.8)',   // Orange
            'rgba(239, 68, 68, 0.8)'     // Red
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(251, 191, 36)',
            'rgb(249, 115, 22)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2
        }
      ]
    };

    return (
      <div className="h-80 w-full">
        <Doughnut
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right'
              }
            }
          }}
        />
      </div>
    );
  };

  // Metrics Table
  const MetricsTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-900">Ward</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Complaints</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Resolved</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Avg Response</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">Avg Resolution</th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900">SLA Rate</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(wards || {})
              .filter(([, m]) => m.total_complaints > 0)
              .sort(([, a], [, b]) => (b.sla_compliance_rate || 0) - (a.sla_compliance_rate || 0))
              .map(([ward, metrics]) => (
                <tr key={ward} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">Ward {ward}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{metrics.total_complaints}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{metrics.resolved}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{metrics.avg_response_time_hours || 'N/A'}h</td>
                  <td className="px-4 py-3 text-right text-slate-700">{metrics.avg_resolution_time_hours || 'N/A'}h</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSLABadge(metrics.sla_compliance_rate)}`}>
                      {metrics.sla_compliance_rate}%
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <SummaryCards />

      {/* Response Time Comparison */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Response Time by Ward</h3>
        <ResponseTimeComparison />
      </div>

      {/* Metrics Table */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Detailed Metrics</h3>
        <MetricsTable />
      </div>

      {/* Response Distribution */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Response Time Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponseDistributionChart />
          <div className="flex flex-col justify-center space-y-3">
            {[
              { label: '< 4 hours', color: 'bg-green-400', ideal: true },
              { label: '4-8 hours', color: 'bg-blue-400', ideal: true },
              { label: '8-24 hours', color: 'bg-amber-400', ideal: false },
              { label: '1-3 days', color: 'bg-orange-400', ideal: false },
              { label: '3+ days', color: 'bg-red-400', ideal: false }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${item.color}`}></div>
                <span className="text-sm text-slate-700">{item.label}</span>
                {item.ideal && <span className="text-xs text-green-600 font-semibold">IDEAL</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Wards */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Performing Wards</h3>
        <TopPerformingWards />
      </div>

      {/* Worst Performing Wards */}
      {worstWards.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Bottom 5 Performing Wards</h3>
          <WorstPerformingWards />
        </div>
      )}
    </div>
  );
};

// Helper Component
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200'
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-50">{icon}</div>
      </div>
    </div>
  );
};

export default ResponseTimeMetrics;
