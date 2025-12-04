import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, isPast, differenceInDays } from 'date-fns';

/**
 * AssignmentTracker Component
 * Displays officer's active complaint assignments with SLA status tracking
 */
const AssignmentTracker = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch officer's assignments
  const { data: assignmentData, isLoading, error } = useQuery({
    queryKey: ['myAssignments'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/complaints/assignments/my_assignments/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        <p className="text-red-800">Failed to load assignments</p>
      </div>
    );
  }

  const assignments = assignmentData?.assignments || [];
  const totalAssignments = assignmentData?.total_assignments || 0;
  const overdueCount = assignmentData?.overdue || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-semibold">Total Assignments</div>
          <div className="text-3xl font-bold text-blue-900">{totalAssignments}</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 font-semibold">Pending</div>
          <div className="text-3xl font-bold text-yellow-900">
            {assignments.filter(a => a.complaint.status === 'PENDING').length}
          </div>
        </div>

        <div className={`${overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
          <div className={`text-sm font-semibold ${overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            SLA Overdue
          </div>
          <div className={`text-3xl font-bold ${overdueCount > 0 ? 'text-red-900' : 'text-green-900'}`}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">My Assignments</h3>
        </div>

        {assignments.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No active assignments</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <AssignmentItem key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * AssignmentItem Component
 * Individual assignment row with SLA status indicator
 */
const AssignmentItem = ({ assignment }) => {
  const complaint = assignment.complaint;
  const slaDeadline = new Date(assignment.sla_deadline);
  const now = new Date();
  const isOverdue = isPast(slaDeadline);
  const daysRemaining = differenceInDays(slaDeadline, now);

  // Determine SLA status color
  const getSLAStatusColor = () => {
    if (isOverdue) return 'text-red-600';
    if (daysRemaining <= 1) return 'text-red-600';
    if (daysRemaining <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSLABGColor = () => {
    if (isOverdue) return 'bg-red-50';
    if (daysRemaining <= 1) return 'bg-red-50';
    if (daysRemaining <= 3) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  // Priority color
  const getPriorityColor = () => {
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

  // Status color
  const getStatusColor = () => {
    switch (complaint.status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'IN_PROGRESS':
        return 'text-blue-600';
      case 'RESOLVED':
        return 'text-green-600';
      case 'REJECTED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Complaint Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{complaint.title}</h4>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{complaint.description}</p>

          {/* Tags */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor()}`}>
              {complaint.priority}
            </span>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium font-semibold ${getStatusColor()}`}>
              {complaint.status}
            </span>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Ward {complaint.ward}
            </span>
          </div>
        </div>

        {/* Right: SLA Status */}
        <div className={`flex-shrink-0 p-3 rounded-lg text-right ${getSLABGColor()}`}>
          <div className={`text-xs font-semibold ${getSLAStatusColor()}`}>
            {isOverdue ? 'OVERDUE' : 'SLA'}
          </div>
          <div className={`text-lg font-bold ${getSLAStatusColor()}`}>
            {isOverdue ? '0' : daysRemaining}
          </div>
          <div className={`text-xs ${getSLAStatusColor()}`}>
            {isOverdue ? 'days past' : 'days left'}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {format(slaDeadline, 'MMM dd, yyyy')}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex gap-4 mt-3 text-xs text-gray-600">
        <span>ID: {complaint.id}</span>
        <span>Assigned: {format(new Date(assignment.assigned_at), 'MMM dd, yyyy HH:mm')}</span>
        <span>Category: {complaint.category}</span>
      </div>
    </div>
  );
};

export default AssignmentTracker;
