
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { STORAGE_KEYS, USER_ROLES } from '../config/constants';

// Auth context
const AuthContext = createContext();

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

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext - Checking for existing auth');
      
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
          console.log('AuthContext - Found existing auth for:', user.email);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user }
          });
        } catch (error) {
          console.log('AuthContext - Invalid stored auth data, clearing');
          // Clear all auth data
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } else {
        console.log('AuthContext - No existing auth found');
      }
      
      // Mark auth check as complete immediately
      setAuthCheckComplete(true);
      console.log('AuthContext - Auth check complete');
    };

    checkAuth();
  }, []);

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
      console.log('AuthContext - Login response:', response);
      
      const { access, refresh, user } = response;
      console.log('AuthContext - Extracted data:', { access: !!access, refresh: !!refresh, user });
      
      if (!access) {
        throw new Error('No access token received');
      }
      
      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      } else {
        console.warn('AuthContext - No user data in login response, user data missing');
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
      if (!isAdminLogin && user.role !== USER_ROLES.CITIZEN) {
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

  const hasRole = (role) => {
    return state.user?.role === role;
  };

  const value = {
    ...state,
    loading: state.loading || !authCheckComplete, // Include auth check state
    login,
    register,
    adminRegister,
    logout,
    updateProfile,
    clearError,
    isAdmin,
    isOfficer,
    isCitizen,
    hasRole
  };

  console.log('AuthContext - Providing value:', { 
    loading: value.loading, 
    stateLoading: state.loading, 
    authCheckComplete,
    isAuthenticated: state.isAuthenticated 
  });

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