import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';

// Language context
const LanguageContext = createContext();

// Supported languages
export const LANGUAGES = {
  ENGLISH: { code: 'en', name: 'English' },
  MARATHI: { code: 'mr', name: 'मराठी' },
  HINDI: { code: 'hi', name: 'हिंदी' }
};

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(LANGUAGES.ENGLISH.code);
  const [isLoading, setIsLoading] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    
    if (savedLanguage && Object.values(LANGUAGES).some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Default to browser language if available, otherwise English
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = Object.values(LANGUAGES).some(lang => lang.code === browserLang)
        ? browserLang
        : LANGUAGES.ENGLISH.code;
      
      setLanguage(defaultLang);
    }
    
    setIsLoading(false);
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      document.documentElement.lang = language;
    }
  }, [language, isLoading]);

  // Set specific language
  const setLanguagePreference = (langCode) => {
    if (Object.values(LANGUAGES).some(lang => lang.code === langCode)) {
      setLanguage(langCode);
    }
  };

  // Get current language name
  const getLanguageName = () => {
    const lang = Object.values(LANGUAGES).find(lang => lang.code === language);
    return lang ? lang.name : LANGUAGES.ENGLISH.name;
  };

  const value = {
    language,
    setLanguage: setLanguagePreference,
    getLanguageName,
    LANGUAGES: Object.values(LANGUAGES)
  };

  return (
    <LanguageContext.Provider value={value}>
      {!isLoading ? children : null}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
