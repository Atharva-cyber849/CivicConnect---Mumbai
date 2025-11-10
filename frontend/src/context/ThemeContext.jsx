import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';

// Theme context
const ThemeContext = createContext();

// Theme types
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
        isDark: action.payload === THEMES.DARK
      };
    case 'TOGGLE_THEME':
      const newTheme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      return {
        ...state,
        theme: newTheme,
        isDark: newTheme === THEMES.DARK
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  theme: THEMES.LIGHT,
  isDark: false
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

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Add current theme class
    root.classList.add(state.theme);
    
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
  }, [state.theme]);

  // Set specific theme
  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      dispatch({
        type: 'SET_THEME',
        payload: theme
      });
    }
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