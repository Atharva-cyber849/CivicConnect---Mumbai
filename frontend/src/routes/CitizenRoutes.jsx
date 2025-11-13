import React from 'react';

// This file is kept for reference but citizen routes are now handled in AppRouter.jsx
// The AppRouter.jsx file contains all citizen routing logic and should be the source of truth

// If you need to add new citizen routes, update AppRouter.jsx instead

const CitizenRoutes = () => {
  console.warn('CitizenRoutes.jsx is deprecated. Use AppRouter.jsx for citizen routing.');
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Routing Configuration</h1>
        <p className="text-gray-600 mb-2">Citizen routes are now configured in AppRouter.jsx</p>
      </div>
    </div>
  );
};

export default CitizenRoutes;