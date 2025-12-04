# Frontend Development Guide

Complete guide to the React + Vite frontend for Snap & Report system.

---

## Project Structure

```
frontend/
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/              # Shared components (Header, Footer, etc.)
│   │   ├── complaints/          # Complaint-related components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── forms/               # Form components
│   │   ├── modals/              # Modal dialogs
│   │   └── maps/                # Map components
│   │
│   ├── pages/                    # Page-level components
│   │   ├── admin/               # Admin dashboard pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ComplaintsList.jsx
│   │   │   ├── OfficerManagement.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── BMCZoneManagement.jsx
│   │   ├── citizen/             # Citizen pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ReportIssue.jsx
│   │   │   └── MyComplaints.jsx
│   │   ├── officer/             # Officer pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AssignedComplaints.jsx
│   │   │   └── Performance.jsx
│   │   └── auth/                # Authentication pages
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       └── ForgotPassword.jsx
│   │
│   ├── context/                  # React Context for state management
│   │   ├── AuthContext.jsx       # Authentication state
│   │   ├── ThemeContext.jsx      # Theme (dark/light mode)
│   │   ├── NotificationContext.jsx # Toast notifications
│   │   └── LanguageContext.jsx   # i18n language selection
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.js           # Auth state hook
│   │   ├── useQuery.js          # Data fetching hook
│   │   ├── usePagination.js     # Pagination logic
│   │   ├── useLocalStorage.js   # LocalStorage wrapper
│   │   └── useMapView.js        # Map utilities
│   │
│   ├── api/                      # API client layer
│   │   ├── axiosConfig.js       # Axios instance with interceptors
│   │   ├── authApi.js           # Authentication endpoints
│   │   ├── complaintsApi.js     # Complaints endpoints
│   │   ├── departmentsApi.js    # Departments endpoints
│   │   └── analyticsApi.js      # Analytics endpoints
│   │
│   ├── routes/                   # Routing configuration
│   │   ├── AppRouter.jsx        # Main router with role-based routes
│   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   └── RoleBasedRoute.jsx   # Role-aware route component
│   │
│   ├── utils/                    # Utility functions
│   │   ├── roleBasedAccess.js   # Role checking utilities
│   │   ├── formatters.js        # Date/text formatting
│   │   ├── validators.js        # Form validation rules
│   │   ├── constants.js         # App constants
│   │   ├── mumbaiWards.js       # Ward information
│   │   └── helpers.js           # General helpers
│   │
│   ├── store/                    # State management (Zustand)
│   │   ├── authStore.js         # Auth store
│   │   ├── uiStore.js           # UI state store
│   │   └── complaintStore.js    # Complaint store
│   │
│   ├── config/                   # Configuration files
│   │   ├── constants.js         # API URLs, endpoints
│   │   ├── theme.js             # Tailwind theme config
│   │   └── permissions.js       # Role-based permissions
│   │
│   ├── locales/                  # i18n translations
│   │   ├── en.json             # English translations
│   │   ├── hi.json             # Hindi translations
│   │   └── mr.json             # Marathi translations
│   │
│   ├── i18n/                     # i18n configuration
│   │   └── i18n.js             # i18n setup
│   │
│   ├── App.jsx                   # Root component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
│
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── .env.example                   # Environment template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── package.json                   # Dependencies
└── README.md                       # Frontend README
```

---

## Key Components

### Context API Setup

#### AuthContext

```jsx
// context/AuthContext.jsx
import { createContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    
    case 'LOGOUT':
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      return initialState;
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token,
          user: JSON.parse(userData),
          refreshToken: localStorage.getItem('refresh_token'),
        },
      });
    }
  }, []);
  
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('auth_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: response.access,
          user: response.user,
          refreshToken: response.refresh,
        },
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
    }
  };
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### API Layer

#### axiosConfig.js

```javascript
// api/axiosConfig.js
import axios from 'axios';

// Public axios instance
export const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Private axios instance (with auth)
export const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axiosPublic.post('/users/token/refresh/', {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('auth_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        return axiosPrivate(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### complaintsApi.js

```javascript
// api/complaintsApi.js
import { axiosPrivate, axiosPublic } from './axiosConfig';

export const complaintsApi = {
  // Get user's complaints
  getUserComplaints: (filters = {}) => {
    return axiosPrivate.get('/complaints/', { params: filters });
  },
  
  // Get single complaint
  getComplaintById: (id) => {
    return axiosPrivate.get(`/complaints/${id}/`);
  },
  
  // Create complaint
  createComplaint: (formData) => {
    // formData is FormData object with files
    return axiosPrivate.post('/complaints/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Update complaint status
  updateComplaintStatus: (id, status, message) => {
    return axiosPrivate.patch(`/complaints/${id}/status/`, {
      status,
      update_message: message,
    });
  },
  
  // Get complaints for map view
  getMapComplaints: (bounds = null) => {
    const params = bounds ? { bounds } : {};
    return axiosPrivate.get('/complaints/map/', { params });
  },
  
  // Get analytics
  getAnalytics: (filters = {}) => {
    return axiosPrivate.get('/complaints/analytics/', { params: filters });
  },
  
  // Assign complaint (admin only)
  assignComplaint: (id, officerId) => {
    return axiosPrivate.post(`/complaints/${id}/assign/`, {
      assigned_to: officerId,
    });
  },
};
```

---

### Role-Based Access Control

#### roleBasedAccess.js

```javascript
// utils/roleBasedAccess.js
export const ROLE_PERMISSIONS = {
  citizen: {
    canViewOwnComplaints: true,
    canReportIssue: true,
    canViewMap: true,
    canAccessDashboard: false,
    canManageOfficers: false,
    canViewAnalytics: false,
    canManageDepartments: false,
  },
  officer: {
    canViewOwnComplaints: true,
    canReportIssue: false,
    canViewMap: true,
    canAccessDashboard: true,
    canManageOfficers: false,
    canViewAnalytics: false,
    canManageDepartments: false,
    canUpdateComplaints: true,
  },
  department_admin: {
    canViewOwnComplaints: true,
    canReportIssue: false,
    canViewMap: true,
    canAccessDashboard: true,
    canManageOfficers: true,
    canViewAnalytics: true,
    canManageDepartments: false,
    canAssignComplaints: true,
  },
  super_admin: {
    canViewOwnComplaints: true,
    canReportIssue: false,
    canViewMap: true,
    canAccessDashboard: true,
    canManageOfficers: true,
    canViewAnalytics: true,
    canManageDepartments: true,
    canAssignComplaints: true,
    canCreateDepartments: true,
  },
};

export const isSuperAdmin = (user) => {
  return user?.role === 'ADMIN' && user?.is_superuser;
};

export const isDepartmentAdmin = (user) => {
  return user?.role === 'ADMIN' && !user?.is_superuser;
};

export const isOfficer = (user) => {
  return user?.role === 'DEPARTMENT_STAFF';
};

export const isCitizen = (user) => {
  return user?.role === 'CITIZEN';
};

export const hasPermission = (user, permission) => {
  const adminTier = user?.admin_tier || 'citizen';
  return ROLE_PERMISSIONS[adminTier]?.[permission] || false;
};

export const getPageAccess = (user) => {
  const adminTier = user?.admin_tier || 'citizen';
  return ROLE_PERMISSIONS[adminTier] || {};
};

export const getRoleLabel = (role) => {
  const labels = {
    'CITIZEN': 'Citizen',
    'ADMIN': 'Administrator',
    'DEPARTMENT_STAFF': 'Department Staff',
  };
  return labels[role] || role;
};

export const getAdminTierLabel = (tier) => {
  const labels = {
    'citizen': 'Citizen',
    'officer': 'BMC Officer',
    'department_admin': 'Department Admin',
    'super_admin': 'Super Admin',
  };
  return labels[tier] || tier;
};
```

---

### Routing

#### AppRouter.jsx

```jsx
// routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isCitizen, isDepartmentAdmin, isOfficer, isSuperAdmin } from '../utils/roleBasedAccess';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/Dashboard';
import ReportIssue from '../pages/citizen/ReportIssue';
import MyComplaints from '../pages/citizen/MyComplaints';

// Admin Pages
import AdminPortal from '../pages/admin/AdminPortal';
import AdminDashboard from '../pages/admin/Dashboard';
import ComplaintsList from '../pages/admin/ComplaintsList';
import OfficerManagement from '../pages/admin/OfficerManagement';
import Analytics from '../pages/admin/Analytics';
import BMCZoneManagement from '../pages/admin/BMCZoneManagement';

// Officer Pages
import OfficerDashboard from '../pages/officer/Dashboard';
import AssignedComplaints from '../pages/officer/AssignedComplaints';

const RoleBasedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (requiredRole && !requiredRole(user)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export const AppRouter = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Citizen Routes */}
        {isCitizen(user) && (
          <>
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/dashboard/report" element={<ReportIssue />} />
            <Route path="/dashboard/complaints" element={<MyComplaints />} />
          </>
        )}
        
        {/* Officer Routes */}
        {isOfficer(user) && (
          <>
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/complaints" element={<AssignedComplaints />} />
          </>
        )}
        
        {/* Admin Routes */}
        {(isDepartmentAdmin(user) || isSuperAdmin(user)) && (
          <>
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<ComplaintsList />} />
            <Route path="/admin/officers" element={<OfficerManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
          </>
        )}
        
        {/* Super Admin Only Routes */}
        {isSuperAdmin(user) && (
          <Route path="/admin/zones" element={<BMCZoneManagement />} />
        )}
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
```

---

## Page Components

### ReportIssue (Citizen)

```jsx
// pages/citizen/ReportIssue.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../../components/maps/MapComponent';
import { complaintsApi } from '../../api/complaintsApi';
import { useNotification } from '../../hooks/useNotification';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    address: '',
    ward: '',
    latitude: null,
    longitude: null,
    image: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const handleLocationSelect = (lat, lng, ward) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      ward: ward,
    }));
    setSelectedLocation({ lat, lng });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageSelect = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0],
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      showNotification('Please fill all required fields', 'error');
      return;
    }
    
    if (!formData.latitude || !formData.longitude) {
      showNotification('Please select location on map', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('address', formData.address);
      form.append('ward', formData.ward);
      form.append('latitude', formData.latitude);
      form.append('longitude', formData.longitude);
      
      if (formData.image) {
        form.append('image', formData.image);
      }
      
      const response = await complaintsApi.createComplaint(form);
      
      showNotification('Complaint submitted successfully!', 'success');
      navigate('/dashboard/complaints');
    } catch (error) {
      showNotification(error.message || 'Failed to submit complaint', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Report an Issue</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Issue Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief title of the issue"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Detailed description"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="POTHOLE">Pothole</option>
                <option value="GARBAGE">Garbage</option>
                <option value="WATER">Water Issue</option>
                <option value="STREETLIGHT">Street Light</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Detailed address"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="mt-1 block w-full"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
        
        {/* Map */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Location *
          </label>
          <MapComponent
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>
    </div>
  );
}
```

---

### ComplaintsList (Admin)

```jsx
// pages/admin/ComplaintsList.jsx
import { useState, useEffect } from 'react';
import { complaintsApi } from '../../api/complaintsApi';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchComplaints();
  }, [filters, pagination.currentPage]);
  
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsApi.getUserComplaints({
        ...filters,
        page: pagination.currentPage,
      });
      
      setComplaints(response.data.results || response.data);
      setPagination({
        ...pagination,
        total: response.data.count || response.data.length,
        totalPages: Math.ceil((response.data.count || response.data.length) / 20),
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Complaints Management</h1>
      
      <ComplaintFilters onFilterChange={handleFilterChange} />
      
      <ComplaintTable
        complaints={complaints}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, currentPage: page })}
      />
    </div>
  );
}
```

---

## Custom Hooks

### useAuth

```javascript
// hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### useQuery

```javascript
// hooks/useQuery.js
import { useState, useEffect } from 'react';

export const useQuery = (queryFn, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await queryFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [options.dependencies]);
  
  const refetch = async () => {
    setLoading(true);
    try {
      const result = await queryFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, refetch };
};
```

---

## Environment Configuration

### .env.example

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=Snap & Report
VITE_APP_VERSION=1.0.0

# Environment
VITE_ENVIRONMENT=development

# Map Configuration
VITE_MAPBOX_TOKEN=pk_test_your_token

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE_MODE=false

# Logging
VITE_DEBUG_MODE=false
```

---

## Styling with Tailwind CSS

### tailwind.config.js

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#ff6b6b',
        success: '#51cf66',
        danger: '#ff6b6b',
        warning: '#ffa500',
      },
    },
  },
  plugins: [],
};
```

---

## Building & Deployment

### Build for Production

```bash
# Build
npm run build

# Preview build locally
npm run preview

# Build analysis
npm run build -- --analyze
```

### Output

```
dist/
├── index.html
├── assets/
│   ├── index-*.js          # Bundled JavaScript
│   ├── index-*.css         # Bundled CSS
│   └── vendor-*.js         # Vendor libraries
└── vite.svg
```

---

## Performance Optimization

### Code Splitting

```javascript
// Use React.lazy for route-based code splitting
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));

// In router
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
</Suspense>
```

### Image Optimization

```jsx
// Use responsive images
<img
  src={image}
  alt="description"
  className="w-full h-auto"
  loading="lazy"
  srcSet={`${image}?w=300 300w, ${image}?w=600 600w`}
  sizes="(max-width: 600px) 300px, 600px"
/>
```

### Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Check dependencies
npm ls
npm audit

# Remove unused
npm prune
```

---

## Testing

### Unit Tests

```jsx
// __tests__/components/LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../../components/auth/LoginForm';

describe('LoginForm', () => {
  it('should submit form with email and password', () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### Running Tests

```bash
npm run test           # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

---

## Debugging Tips

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools in browser
3. Click "Components" or "Profiler" tab
4. Inspect component props, state, and renders

### Network Tab

1. Open browser DevTools → Network tab
2. Check API requests/responses
3. Monitor status codes and response times
4. Debug CORS issues

### Console Logging

```javascript
// Log API calls
axiosPrivate.interceptors.request.use(config => {
  console.log('API Request:', config);
  return config;
});

// Log state changes
useEffect(() => {
  console.log('User updated:', user);
}, [user]);
```

---

## Common Issues & Solutions

### CORS Error

**Problem**: "Access to XMLHttpRequest blocked by CORS"

**Solution**:
- Check `VITE_API_BASE_URL` is correct
- Verify backend CORS settings
- Check Network tab for actual request

### Token Expired

**Problem**: "Invalid token" errors

**Solution**:
- Token refresh interceptor handles this
- Check localStorage for tokens
- Clear cache if needed

### Images Not Loading

**Problem**: "404 on image URLs"

**Solution**:
- Check image path in API response
- Use absolute URLs
- Verify media server is running

