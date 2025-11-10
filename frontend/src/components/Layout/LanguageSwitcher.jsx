import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ className = '', showLabel = true, variant = 'dropdown' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Show notification
    const message = languageCode === 'mr' 
      ? 'भाषा मराठीमध्ये बदलली' 
      : 'Language changed to English';
    
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  };

  // Toggle button variant
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.changeLanguage')}:
          </span>
        )}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                i18n.language === language.code
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-1">{language.flag}</span>
              {language.nativeName}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('common.changeLanguage')}
        </label>
      )}
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {currentLanguage.nativeName}
            </span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
              <div className="py-1" role="listbox">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                      i18n.language === language.code
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                    role="option"
                    aria-selected={i18n.language === language.code}
                  >
                    <span className="text-lg mr-3">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{language.nativeName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {language.name}
                      </span>
                    </div>
                    {i18n.language === language.code && (
                      <svg
                        className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Compact language switcher for navbar
export const CompactLanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'mr', name: 'मराठी', short: 'मर', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const otherLanguage = languages.find(lang => lang.code !== i18n.language);

  const handleToggle = () => {
    i18n.changeLanguage(otherLanguage.code);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center space-x-1 px-2 py-1 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      title={`Switch to ${otherLanguage.name}`}
    >
      <span>{currentLanguage.flag}</span>
      <span className="hidden sm:inline">{currentLanguage.short}</span>
    </button>
  );
};

// Language badge component
export const LanguageBadge = ({ className = '' }) => {
  const { i18n } = useTranslation();
  
  const languages = {
    'en': { name: 'English', flag: '🇬🇧', color: 'blue' },
    'mr': { name: 'मराठी', flag: '🇮🇳', color: 'orange' }
  };

  const currentLang = languages[i18n.language] || languages['en'];

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-${currentLang.color}-100 text-${currentLang.color}-800 dark:bg-${currentLang.color}-900 dark:text-${currentLang.color}-200 ${className}`}>
      <span>{currentLang.flag}</span>
      <span>{currentLang.name}</span>
    </span>
  );
};

export default LanguageSwitcher;