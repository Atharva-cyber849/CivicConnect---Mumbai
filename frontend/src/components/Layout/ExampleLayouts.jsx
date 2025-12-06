/**
 * Example: Main Application Layout with Role-Based Navigation
 * 
 * This file demonstrates how to integrate the new role-based navigation system
 * into your application layout. You can replace the existing Header/Sidebar
 * with RoleBasedNavigation component.
 */

import React from 'react';
import { RoleBasedNavigation } from '../Navigation';
import { useAuth } from '../../context/AuthContext';

/**
 * Option 1: Simple Layout with Top Navigation
 * Best for: Most use cases
 */
export const SimpleLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role-based navigation appears at top */}
      {isAuthenticated && <RoleBasedNavigation />}
      
      {/* Main content area */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

/**
 * Option 2: Layout with Footer
 * Best for: Public-facing pages
 */
export const LayoutWithFooter = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isAuthenticated && <RoleBasedNavigation />}
      
      <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Mumbai BMC Portal - Snap & Report</p>
        </div>
      </footer>
    </div>
  );
};

/**
 * Option 3: Dashboard Layout (Full Width)
 * Best for: Admin dashboards with wide content
 */
export const DashboardLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <RoleBasedNavigation />}
      
      {/* Full width content for dashboards */}
      <main className="py-6">
        {children}
      </main>
    </div>
  );
};

/**
 * Option 4: Two-Column Layout (Navigation + Content)
 * Best for: Complex admin interfaces requiring persistent sidebar
 * Note: Only use this if you need BOTH top nav AND side nav
 */
export const TwoColumnLayout = ({ children, sidebar }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <RoleBasedNavigation />}
      
      <div className="flex">
        {/* Optional sidebar for sub-navigation */}
        {sidebar && (
          <aside className="w-64 bg-white shadow-sm min-h-screen">
            {sidebar}
          </aside>
        )}
        
        {/* Main content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * Option 5: Conditional Layout (Auth vs Public)
 * Best for: Apps with both public and authenticated sections
 */
export const ConditionalLayout = ({ children, isPublicPage = false }) => {
  const { isAuthenticated } = useAuth();

  if (isPublicPage) {
    // Public pages without navigation
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  // Authenticated pages with navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <RoleBasedNavigation />}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

/**
 * USAGE EXAMPLES
 */

// Example 1: In App.jsx or Main Router
/*
import { SimpleLayout } from './components/Layout/ExampleLayouts';

function App() {
  return (
    <SimpleLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaints" element={<ComplaintsList />} />
      </Routes>
    </SimpleLayout>
  );
}
*/

// Example 2: Per-Route Layouts
/*
  <Routes>
    <Route element={<SimpleLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    
    <Route element={<DashboardLayout />}>
      <Route path="/admin/analytics" element={<Analytics />} />
    </Route>
    
    <Route path="/auth/login" element={<Login />} />
  </Routes>
*/

// Example 3: With Layout Wrapper HOC
/*
export const withLayout = (Component, LayoutComponent = SimpleLayout) => {
  return (props) => (
    <LayoutComponent>
      <Component {...props} />
    </LayoutComponent>
  );
};

// Usage:
export default withLayout(DashboardPage, DashboardLayout);
*/

export default SimpleLayout;
