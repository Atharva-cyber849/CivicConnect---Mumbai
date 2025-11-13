import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const AuthLayout = ({ children }) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              🏛️ Snap & Report Mumbai
            </Link>
            
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 min-h-screen">
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Mumbai Municipal Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;