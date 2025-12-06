/**
 * i18n Configuration - Multi-language support
 * Supports: English (en), Marathi (mr), Hindi (hi)
 */

import { getTranslation, LANGUAGE_OPTIONS } from '../utils/constants'

// Default language
export const DEFAULT_LANGUAGE = 'en'

// Available languages
export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.map(lang => lang.code)

/**
 * Initialize i18n - called once on app startup
 */
export const initializeI18n = () => {
  const savedLanguage = localStorage.getItem('language')
  return savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage) 
    ? savedLanguage 
    : DEFAULT_LANGUAGE
}

/**
 * Set language preference and save to localStorage
 */
export const setLanguage = (languageCode) => {
  if (SUPPORTED_LANGUAGES.includes(languageCode)) {
    localStorage.setItem('language', languageCode)
    // Trigger app-wide language change (handled by context)
    return true
  }
  return false
}

/**
 * Get current language from localStorage
 */
export const getLanguage = () => {
  const saved = localStorage.getItem('language')
  return saved || DEFAULT_LANGUAGE
}

/**
 * Translate a text key
 * Usage: t('citizen.reportIssue')
 */
export const translate = (path, defaultValue = '') => {
  const currentLanguage = getLanguage()
  return getTranslation(currentLanguage, path, defaultValue)
}

/**
 * Get language name
 */
export const getLanguageName = (code) => {
  const lang = LANGUAGE_OPTIONS.find(l => l.code === code)
  return lang?.nativeName || code
}

/**
 * Get language flag emoji
 */
export const getLanguageFlag = (code) => {
  const lang = LANGUAGE_OPTIONS.find(l => l.code === code)
  return lang?.flag || '🌐'
}

/**
 * i18n context helper functions
 */
export const i18nUtils = {
  initializeI18n,
  setLanguage,
  getLanguage,
  translate,
  getLanguageName,
  getLanguageFlag,
  getTranslation,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
}

export default i18nUtils
