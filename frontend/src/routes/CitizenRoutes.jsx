import React from 'react';
import { Outlet } from 'react-router-dom';

// Layout
import CitizenLayout from '../components/Layout/UserLayout';
import ErrorBoundary from '../components/ErrorBoundary';

const CitizenRoutes = () => {
  console.log('🏠 CitizenRoutes rendering...', window.location.pathname)
  
  return (
    <ErrorBoundary>
      <CitizenLayout>
        <Outlet />
      </CitizenLayout>
    </ErrorBoundary>
  );
};

export default CitizenRoutes;