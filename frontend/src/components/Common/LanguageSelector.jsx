import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { LANGUAGE_OPTIONS, getLanguageFlag } from '../config/i18n'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

/**
 * LanguageSelector Component
 * Dropdown to switch between English, Marathi, Hindi
 */
const LanguageSelector = ({ className = '' }) => {
  const { language, setLanguage } = useContext(AuthContext) || {}

  if (!language || !setLanguage) {
    return null
  }

  const currentLanguage = LANGUAGE_OPTIONS.find(l => l.code === language)

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative group">
        {/* Dropdown Toggle Button */}
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          title="Change Language"
        >
          <span className="text-lg">{getLanguageFlag(language)}</span>
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage?.nativeName || 'Language'}
          </span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                language === lang.code
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-gray-500">{lang.name}</div>
              </div>
              {language === lang.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LanguageSelector
