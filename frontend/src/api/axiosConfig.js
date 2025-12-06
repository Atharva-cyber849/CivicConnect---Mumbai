import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Function to get CSRF token from cookie
const getCsrfToken = () => {
  const name = 'csrftoken='
  const decodedCookie = decodeURIComponent(document.cookie)
  const cookieArray = decodedCookie.split(';')
  for(let i = 0; i < cookieArray.length; i++) {
    let c = cookieArray[i].trim()
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
})

// Add CSRF token to non-safe methods
api.interceptors.request.use(config => {
  if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(config.method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }
  return config
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    
    // Add token to headers if available
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // Handle FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refreshing, queue the request
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      // If no refresh token available, redirect to login
      if (!refreshToken) {
        // Clear auth data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        
        // Redirect to login
        window.location.href = '/auth/login'
        return Promise.reject(new Error('Authentication required'))
      }

      try {
        // Try to get new access token
        const response = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('auth_token', access)

        // Update Authorization header
        originalRequest.headers['Authorization'] = `Bearer ${access}`
        
        // Handle FormData
        if (originalRequest.data instanceof FormData) {
          const newFormData = new FormData()
          for (const [key, value] of originalRequest.data.entries()) {
            newFormData.append(key, value)
          }
          originalRequest.data = newFormData
          delete originalRequest.headers['Content-Type']
        }

        // Process queued requests
        processQueue(null, access);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear auth data on refresh failure
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        
        // Redirect to login
        window.location.href = '/auth/login'
        return Promise.reject(new Error('Session expired. Please log in again.'))
      }
    }

    // Handle CSRF errors (but don't logout - just reload)
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      // Reload the page to get a new CSRF token
      window.location.reload()
      return Promise.reject(new Error('Session expired. Please try again.'))
    }

    // Handle permission denied (403) errors - actual auth errors
    if (error.response?.status === 403 && !error.response?.data?.detail?.includes('CSRF')) {
      // This is a permission error, not an auth error - don't logout
      console.warn('Permission denied:', error.response?.data);
      
      // Show user-friendly permission denied message
      const permissionMessage = error.response?.data?.error || 
                               error.response?.data?.detail ||
                               'You do not have permission to perform this action';
      toast.error(permissionMessage);
      
      return Promise.reject(error);
    }

    // Handle 404 and other client errors - don't show toast, just reject silently for dashboard queries
    // These can happen during data fetching and shouldn't trigger error notifications
    if (error.response?.status === 404) {
      console.warn('Resource not found:', originalRequest.url);
      return Promise.reject(error);
    }

    // Show error toast only for actual server errors (5xx) and rate limiting
    if (error.response?.status >= 500 || error.response?.status === 429) {
      let errorMessage
      if (error.response?.status === 413) {
        errorMessage = 'File size exceeds the maximum limit'
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.'
      } else {
        errorMessage = error.response?.data?.detail || 
                      error.response?.data?.message ||
                      'Server error occurred'
      }
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

// Create public axios instance without auth
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Response interceptor for public API
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show error toast
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'An error occurred'
    toast.error(errorMessage)
    return Promise.reject(error)
  }
)

// Export instances
export default api
export const axiosPrivate = api
export const axiosPublic = publicApi
