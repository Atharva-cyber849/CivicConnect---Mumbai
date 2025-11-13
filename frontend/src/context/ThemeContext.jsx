import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';

// Theme context
const ThemeContext = createContext();

// Theme types
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolvedTheme = action.payload === THEMES.SYSTEM 
        ? (isSystemDark ? THEMES.DARK : THEMES.LIGHT)
        : action.payload;
      
      return {
        ...state,
        theme: action.payload,
        resolvedTheme,
        isDark: resolvedTheme === THEMES.DARK
      };
    case 'TOGGLE_THEME':
      const currentTheme = state.theme === THEMES.SYSTEM 
        ? (state.isDark ? THEMES.LIGHT : THEMES.DARK)
        : (state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT);
      
      return {
        ...state,
        theme: currentTheme,
        resolvedTheme: currentTheme === THEMES.SYSTEM 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT)
          : currentTheme,
        isDark: currentTheme === THEMES.DARK || 
               (currentTheme === THEMES.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches)
      };
    case 'UPDATE_SYSTEM_THEME':
      if (state.theme === THEMES.SYSTEM) {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return {
          ...state,
          resolvedTheme: systemIsDark ? THEMES.DARK : THEMES.LIGHT,
          isDark: systemIsDark
        };
      }
      return state;
    default:
      return state;
  }
};

// Initial state
const initialState = {
  theme: THEMES.SYSTEM,
  resolvedTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT,
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      dispatch({
        type: 'SET_THEME',
        payload: savedTheme
      });
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? THEMES.DARK : THEMES.LIGHT;
      
      dispatch({
        type: 'SET_THEME',
        payload: systemTheme
      });
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (state.theme === THEMES.SYSTEM) {
        dispatch({ type: 'UPDATE_SYSTEM_THEME' });
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [state.theme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM);
    
    // Add current theme class
    root.classList.add(state.resolvedTheme);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        state.isDark ? '#1f2937' : '#ffffff'
      );
    }
  }, [state.theme, state.resolvedTheme, state.isDark]);

  // Set specific theme
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      dispatch({
        type: 'SET_THEME',
        payload: theme
      });
    }
  };
  
  // Get the current theme display name
  const getThemeDisplayName = () => {
    if (state.theme === THEMES.SYSTEM) {
      return `System (${state.resolvedTheme === THEMES.DARK ? 'Dark' : 'Light'})`;
    }
    return state.theme.charAt(0).toUpperCase() + state.theme.slice(1);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  // Get theme-specific classes
  const getThemeClasses = () => {
    return {
      // Background classes
      bg: state.isDark ? 'bg-gray-900' : 'bg-white',
      bgSecondary: state.isDark ? 'bg-gray-800' : 'bg-gray-50',
      bgTertiary: state.isDark ? 'bg-gray-700' : 'bg-gray-100',
      
      // Text classes
      text: state.isDark ? 'text-white' : 'text-gray-900',
      textSecondary: state.isDark ? 'text-gray-300' : 'text-gray-600',
      textMuted: state.isDark ? 'text-gray-400' : 'text-gray-500',
      
      // Border classes
      border: state.isDark ? 'border-gray-700' : 'border-gray-200',
      borderSecondary: state.isDark ? 'border-gray-600' : 'border-gray-300',
      
      // Card classes
      card: state.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      
      // Input classes
      input: state.isDark 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
      
      // Button classes
      button: {
        primary: state.isDark
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: state.isDark
          ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
          : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300',
        ghost: state.isDark
          ? 'hover:bg-gray-700 text-gray-300'
          : 'hover:bg-gray-100 text-gray-600'
      }
    };
  };

  const value = {
    ...state,
    setTheme,
    toggleTheme,
    getThemeClasses,
    getThemeDisplayName,
    THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};