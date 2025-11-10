import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, Check, Globe } from 'lucide-react'

const LanguageSwitcher = ({ className = '', variant = 'default' }) => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇬🇧',
      dir: 'ltr'
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳',
      dir: 'ltr'
    }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode)
    setIsOpen(false)
    
    // Update document direction if needed
    document.documentElement.dir = languages.find(l => l.code === languageCode)?.dir || 'ltr'
    
    // Emit custom event for components that need to re-render
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: languageCode } 
    }))
  }

  // Compact variant for mobile/small spaces
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          aria-label={t('common.changeLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currentLanguage.code.toUpperCase()}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                  i18n.language === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.nativeName}</span>
                {i18n.language === language.code && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          aria-label={t('common.changeLanguage')}
        >
          <Languages className="h-5 w-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('common.changeLanguage')}
              </p>
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3 ${
                  i18n.language === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                </div>
                {i18n.language === language.code && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default variant - full button with text
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.nativeName}</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('common.changeLanguage')}
              </p>
            </div>
            
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors ${
                    i18n.language === language.code 
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-gray-500">{language.name}</div>
                  </div>
                  {i18n.language === language.code && (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-600">
                {i18n.language === 'en' 
                  ? 'Mumbai BMC supports multiple languages for better accessibility'
                  : 'मुंबई महानगरपालिका चांगल्या प्रवेशक्षमतेसाठी अनेक भाषांना समर्थन देते'
                }
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSwitcher