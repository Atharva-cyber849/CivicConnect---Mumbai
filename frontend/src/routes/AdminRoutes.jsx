import React from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../config/constants';

// This file is kept for reference but admin routes are now handled in AppRouter.jsx
// The AppRouter.jsx file contains all admin routing logic and should be the source of truth

// If you need to add new admin routes, update AppRouter.jsx instead

const AdminRoutes = () => {
  const { user } = useAuth();
  
  console.warn('AdminRoutes.jsx is deprecated. Use AppRouter.jsx for admin routing.');
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Routing Configuration</h1>
        <p className="text-gray-600 mb-2">Admin routes are now configured in AppRouter.jsx</p>
        <p className="text-sm text-gray-500">Current user role: {user?.role || 'Not authenticated'}</p>
      </div>
    </div>
  );
};

export default AdminRoutes;