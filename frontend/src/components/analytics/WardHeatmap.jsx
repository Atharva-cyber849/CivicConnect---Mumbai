import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WardHeatmap = ({ data }) => {
  if (!data) {
    return <div className="text-slate-600">No heatmap data available</div>;
  }

  const { wards, dates, summary } = data;

  // Calculate max value for color scaling
  const maxComplaints = Math.max(...Object.values(summary?.by_ward || {}));
  const minComplaints = Math.min(...Object.values(summary?.by_ward || {}));

  // Color intensity function
  const getHeatmapColor = (value) => {
    if (!value) return 'bg-slate-50';
    
    const intensity = (value - minComplaints) / (maxComplaints - minComplaints || 1);
    
    if (intensity < 0.2) return 'bg-blue-100';
    if (intensity < 0.4) return 'bg-blue-300';
    if (intensity < 0.6) return 'bg-blue-500';
    if (intensity < 0.8) return 'bg-blue-700';
    return 'bg-blue-900';
  };

  const getHeatmapTextColor = (value) => {
    if (!value) return 'text-slate-900';
    
    const intensity = (value - minComplaints) / (maxComplaints - minComplaints || 1);
    return intensity > 0.5 ? 'text-white' : 'text-slate-900';
  };

  // Calendar Heatmap View
  const CalendarHeatmap = () => {
    // Guard against undefined dates
    if (!dates || !Array.isArray(dates)) {
      return <div className="text-slate-600">No date data available</div>;
    }
    
    // Show every 3rd date to avoid crowding
    const displayDates = dates.filter((_, i) => i % 3 === 0);

    return (
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header with dates */}
          <div className="flex gap-1 mb-2">
            <div className="w-16 flex-shrink-0"></div>
            <div className="flex gap-1">
              {displayDates.map((date) => (
                <div key={date} className="w-12 text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap rows (one per ward) */}
          {wards && wards.map((ward) => (
            <div key={ward} className="flex gap-1 mb-2 items-center">
              <div className="w-16 flex-shrink-0">
                <p className="text-sm font-bold text-slate-900">Ward {ward}</p>
              </div>
              <div className="flex gap-1">
                {displayDates.map((date) => {
                  const dateIndex = dates.indexOf(date);
                  const count = data.data[ward]?.[dateIndex] || 0;
                  
                  return (
                    <div
                      key={`${ward}-${date}`}
                      className={`w-12 h-12 rounded border border-slate-200 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${getHeatmapColor(count)}`}
                      title={`${ward}: ${count} complaints on ${date}`}
                    >
                      <span className={`text-xs font-bold ${getHeatmapTextColor(count)}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Top Wards Table
  const TopWardsTable = () => {
    const sortedWards = Object.entries(summary?.by_ward || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return (
      <div className="space-y-3">
        {sortedWards.map(([ward, count], idx) => (
          <div key={ward} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-slate-600 w-6 text-center">
                {idx + 1}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Ward {ward}</p>
                <p className="text-xs text-slate-600">{count} complaints</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${(count / maxComplaints) * 100}%`
                }}
              />
            </div>
            
            <div className="text-right">
              <p className="font-bold text-slate-900">
                {((count / (summary?.total || 1)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Ward Comparison Chart
  const WardComparisonChart = () => {
    const chartWards = wards?.slice(0, 12) || [];
    const chartData = {
      labels: chartWards.map(w => `Ward ${w}`),
      datasets: [
        {
          label: 'Total Complaints',
          data: chartWards.map(w => summary?.by_ward[w] || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };

    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {chartWards.map((ward) => {
            const count = summary?.by_ward[ward] || 0;
            const percentage = ((count / (summary?.total || 1)) * 100).toFixed(1);
            
            return (
              <div key={ward} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-slate-900">Ward {ward}</p>
                  <p className="text-sm font-semibold text-blue-600">{percentage}%</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Summary Stats
  const SummaryStats = () => {
    const stats = [
      {
        label: 'Total Complaints',
        value: summary?.total || 0,
        color: 'blue'
      },
      {
        label: 'Highest Ward',
        value: `Ward ${Object.entries(summary?.by_ward || {}).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}`,
        color: 'green'
      },
      {
        label: 'Average per Ward',
        value: (summary?.total / (wards?.length || 1)).toFixed(1),
        color: 'purple'
      },
      {
        label: 'Active Wards',
        value: Object.values(summary?.by_ward || {}).filter(v => v > 0).length,
        color: 'amber'
      }
    ];

    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200'
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-lg border p-4 ${colorClasses[stat.color]}`}>
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <SummaryStats />

      {/* Calendar Heatmap */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Heatmap Calendar</h3>
        <CalendarHeatmap />
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-600">Less</span>
          {[
            'bg-blue-100',
            'bg-blue-300',
            'bg-blue-500',
            'bg-blue-700',
            'bg-blue-900'
          ].map((bg, i) => (
            <div key={i} className={`w-4 h-4 rounded ${bg}`}></div>
          ))}
          <span className="text-slate-600">More</span>
        </div>
      </div>

      {/* Top Wards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top 10 Wards by Complaints</h3>
          <TopWardsTable />
        </div>

        {/* Ward Comparison Grid */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Ward Comparison</h3>
          <WardComparisonChart />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Period Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-600">Date Range</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {summary?.date_range?.start} to {summary?.date_range?.end}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Wards</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{wards?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Complaints</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{summary?.total || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardHeatmap;
