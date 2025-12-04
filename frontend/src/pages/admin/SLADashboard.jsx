import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, isPast, differenceInDays } from 'date-fns';

/**
 * SLADashboard
 * Admin view for monitoring all complaint assignments and SLA compliance
 */
const SLADashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const [filterStatus, setFilterStatus] = useState('all'); // all, on_track, warning, overdue

  // Fetch SLA status
  const { data: slaData, isLoading, error } = useQuery({
    queryKey: ['slaStatus', filterStatus],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/complaints/assignments/sla_status/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load SLA data</p>
      </div>
    );
  }

  const summary = slaData?.summary || {};
  const onTrack = slaData?.on_track || { count: 0, assignments: [] };
  const warning = slaData?.warning || { count: 0, assignments: [] };
  const overdue = slaData?.overdue || { count: 0, assignments: [] };

  // Get filtered assignments
  const getFilteredAssignments = () => {
    switch (filterStatus) {
      case 'on_track':
        return onTrack.assignments;
      case 'warning':
        return warning.assignments;
      case 'overdue':
        return overdue.assignments;
      default:
        return [
          ...onTrack.assignments,
          ...warning.assignments,
          ...overdue.assignments,
        ];
    }
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">SLA Compliance Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor complaint assignment deadlines and officer performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard
          label="Total Assignments"
          value={summary.total || 0}
          color="blue"
        />
        <SummaryCard
          label="On Track"
          value={onTrack.count}
          color="green"
          isActive={filterStatus === 'on_track'}
          onClick={() => setFilterStatus('on_track')}
        />
        <SummaryCard
          label="Warning (80%)"
          value={warning.count}
          color="yellow"
          isActive={filterStatus === 'warning'}
          onClick={() => setFilterStatus('warning')}
        />
        <SummaryCard
          label="Overdue"
          value={overdue.count}
          color="red"
          isActive={filterStatus === 'overdue'}
          onClick={() => setFilterStatus('overdue')}
        />
        <SummaryCard
          label="SLA Compliance"
          value={`${(summary.sla_compliance_rate || 0).toFixed(1)}%`}
          color="indigo"
          isPercentage
        />
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('on_track')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'on_track'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          On Track
        </button>
        <button
          onClick={() => setFilterStatus('warning')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'warning'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Warning
        </button>
        <button
          onClick={() => setFilterStatus('overdue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filterStatus === 'overdue'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Assignments Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Assignments ({filteredAssignments.length})
          </h3>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No assignments in this category</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SLA Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Days Left
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <SLATableRow key={assignment.id} assignment={assignment} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SummaryCard Component
 */
const SummaryCard = ({ label, value, color, isActive, onClick, isPercentage }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  const textClasses = {
    blue: 'text-blue-900',
    green: 'text-green-900',
    yellow: 'text-yellow-900',
    red: 'text-red-900',
    indigo: 'text-indigo-900',
  };

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 transition-all cursor-pointer ${
        colorClasses[color]
      } ${isActive ? 'ring-2 ring-offset-2 ring-' + color + '-500' : ''}`}
    >
      <div className={`text-xs font-semibold ${textClasses[color]}`}>{label}</div>
      <div className={`text-3xl font-bold mt-2 ${textClasses[color]}`}>{value}</div>
    </div>
  );
};

/**
 * SLATableRow Component
 */
const SLATableRow = ({ assignment }) => {
  const complaint = assignment.complaint;
  const slaDeadline = new Date(assignment.sla_deadline);
  const now = new Date();
  const isOverdue = isPast(slaDeadline);
  const daysRemaining = differenceInDays(slaDeadline, now);

  // Row color based on SLA status
  const getRowColor = () => {
    if (isOverdue) return 'bg-red-50 hover:bg-red-100';
    if (daysRemaining <= 1) return 'bg-red-50 hover:bg-red-100';
    if (daysRemaining <= 3) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'hover:bg-gray-50';
  };

  const getStatusBadgeColor = () => {
    switch (complaint.status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = () => {
    switch (complaint.priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLATextColor = () => {
    if (isOverdue) return 'text-red-900 font-bold';
    if (daysRemaining <= 1) return 'text-red-900 font-bold';
    if (daysRemaining <= 3) return 'text-yellow-900 font-bold';
    return 'text-green-900';
  };

  return (
    <tr className={getRowColor()}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{complaint.title}</div>
        <div className="text-xs text-gray-600">ID: {complaint.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {assignment.assigned_to.first_name} {assignment.assigned_to.last_name}
        </div>
        <div className="text-xs text-gray-600">{assignment.assigned_to.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
          {complaint.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor()}`}>
          {complaint.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{format(slaDeadline, 'MMM dd, yyyy')}</div>
        <div className="text-xs text-gray-600">{format(slaDeadline, 'HH:mm')}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-bold ${getSLATextColor()}`}>
          {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
        </div>
      </td>
    </tr>
  );
};

export default SLADashboard;
