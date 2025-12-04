import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <footer className={`${themeClasses.card} border-t py-8`}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              🏛️ Snap & Report Mumbai
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
              An initiative by Mumbai Municipal Corporation to make citizen complaint 
              management more efficient and transparent.
            </p>
            <p className={`text-sm ${themeClasses.textMuted}`}>
              Report issues in your ward and track their resolution status in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-medium ${themeClasses.text} mb-4`}>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/auth/register" 
                  className={`text-sm ${themeClasses.textSecondary} hover:text-blue-600 transition-colors`}
                >
                  Register
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth/login" 
                  className={`text-sm ${themeClasses.textSecondary} hover:text-blue-600 transition-colors`}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className={`font-medium ${themeClasses.text} mb-4`}>Support</h4>
            <ul className="space-y-2">
              <li className={`text-sm ${themeClasses.textSecondary}`}>
                📞 Helpline: 1916
              </li>
              <li className={`text-sm ${themeClasses.textSecondary}`}>
                📧 complaints@mcgm.gov.in
              </li>
              <li className={`text-sm ${themeClasses.textSecondary}`}>
                🕒 24/7 Support Available
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t ${themeClasses.border} mt-8 pt-6 flex flex-col md:flex-row justify-center items-center`}>
          <div className="flex space-x-6">
            <a 
              href="#" 
              className={`text-sm ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className={`text-sm ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className={`text-sm ${themeClasses.textMuted} hover:text-blue-600 transition-colors`}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;