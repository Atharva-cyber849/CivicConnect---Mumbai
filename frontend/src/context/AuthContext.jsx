
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { STORAGE_KEYS, USER_ROLES } from '../config/constants';

// Auth context
const AuthContext = createContext();

// Session timeout constants
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        loading: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  let sessionTimer;
  let warningTimer;

  // Handle session timeout
  const handleLogout = useCallback((message = 'Session expired') => {
    // Clear any existing timers
    if (sessionTimer) clearTimeout(sessionTimer);
    if (warningTimer) clearTimeout(warningTimer);
    
    // Clear auth data
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    // Reset state
    dispatch({ type: 'LOGOUT' });
    setShowSessionWarning(false);
    
    // Show message if provided
    if (message && state.isAuthenticated) {
      // User was logged out
    }
  }, [state.isAuthenticated]);

  // Extend session
  const extendSession = useCallback(() => {
    setLastActivity(Date.now());
    setShowSessionWarning(false);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    // Mark auth check as complete immediately
    setAuthCheckComplete(true);
    
    const checkAuth = async () => {
      
      // Check both old and new storage keys for compatibility
      let token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      let userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      // Fallback to authStore keys if not found
      if (!token) {
        token = localStorage.getItem('accessToken');
      }
      if (!userData) {
        const user = localStorage.getItem('user');
        if (user) userData = user;
      }

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          
          // If is_superuser field is missing, we need to refresh the user data
          // This handles the case where user data was stored before the is_superuser field was added
          if (user.is_superuser === undefined) {
            // Clear old session data to force fresh login
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return;
          }
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user }
          });
        } catch (error) {
          // Clear all auth data
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        // No auth found
      }
      
      // Auth check complete
    };

    checkAuth();
  }, []);

  // Session timeout effect
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const updateLastActivity = () => setLastActivity(Date.now());
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });

    // Set up session timeout check
    const checkSession = () => {
      const currentTime = Date.now();
      const timeElapsed = currentTime - lastActivity;
      const timeLeft = SESSION_TIMEOUT - timeElapsed;

      if (timeLeft <= 0) {
        handleLogout('Session expired due to inactivity');
      } else if (timeLeft <= SESSION_WARNING_TIME && !showSessionWarning) {
        setShowSessionWarning(true);
        warningTimer = setTimeout(() => {
          handleLogout('Session expired');
        }, timeLeft);
      }
    };

    const sessionCheckInterval = setInterval(checkSession, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(sessionCheckInterval);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [state.isAuthenticated, lastActivity, showSessionWarning, handleLogout]);

  // Helper function to get default redirect path
  const getDefaultRedirectPath = (user) => {
    if (!user) return '/';
    
    switch (user.role) {
      case USER_ROLES.ADMIN:
      case USER_ROLES.DEPARTMENT_STAFF:
        return '/admin/dashboard';
      case USER_ROLES.CITIZEN:
        return '/dashboard';
      default:
        return '/';
    }
  };

  // Login function
  const login = async (credentials, isAdminLogin = false) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authApi.login(credentials);
      
      const { access, refresh, user } = response;
      
      if (!access) {
        throw new Error('No access token received');
      }
      
      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token: access, user }
      });

      // Role validation for admin login
      if (isAdminLogin && user.role !== USER_ROLES.ADMIN && user.role !== USER_ROLES.DEPARTMENT_STAFF) {
        throw new Error('Access denied: Insufficient privileges');
      }

      // Role validation for citizen login
      if (!isAdminLogin && (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.DEPARTMENT_STAFF)) {
        throw new Error('This login is for citizens only. Please use the admin portal.');
      }
      
      return { 
        success: true, 
        user,
        redirectTo: getDefaultRedirectPath(user)
      };
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authApi.register(userData);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Admin register function
  const adminRegister = async (adminData, role) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authApi.adminRegister(adminData, role);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Admin registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      
      // Update local storage
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updatedUser
      });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Profile update failed' 
      };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Helper functions
  const isAdmin = () => {
    return state.user?.role === USER_ROLES.ADMIN;
  };

  const isOfficer = () => {
    return state.user?.role === USER_ROLES.DEPARTMENT_STAFF;
  };

  const isCitizen = () => {
    return state.user?.role === USER_ROLES.CITIZEN;
  };

  // Update user information
  const updateUser = useCallback((userData) => {
    try {
      // Update the state
      dispatch({ type: 'UPDATE_USER', payload: userData });
      
      // Update user data in localStorage if it exists
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, ...userData };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user information' };
    }
  }, []);

  const value = {
    ...state,
    loading: state.loading || !authCheckComplete,
    authCheckComplete,
    login,
    logout: logout,
    register,
    updateUser,
    clearError,
    showSessionWarning,
    resetSessionWarning: () => setShowSessionWarning(false),
    extendSession,
    isAdmin,
    isOfficer,
    isCitizen,
    hasRole: (role) => state.user?.role === role
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for direct usage
export { AuthContext };