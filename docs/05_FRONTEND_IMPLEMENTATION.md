# 5. Frontend Implementation

## Application Structure

### 5.1 Application Entry (`App.jsx`)

```jsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <LanguageProvider>
                <AppRouter />
              </LanguageProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

**Providers Stack:**
1. **QueryClientProvider**: React Query for server state
2. **BrowserRouter**: Client-side routing
3. **ThemeProvider**: Dark/Light theme
4. **AuthProvider**: Authentication state
5. **NotificationProvider**: Notifications
6. **LanguageProvider**: Multi-language support

---

## Context Providers

### 5.2 Auth Context (`context/AuthContext.jsx`)

Manages authentication state and user session:

```javascript
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(credentials);
      const { user, access, refresh } = response;
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: access } });
      return response;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
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

**Features:**
- JWT token management
- Session timeout handling
- User profile updates
- Auto-refresh token mechanism

---

## Role-Based Access

### 5.3 Role-Based Access (`utils/roleBasedAccess.js`)

```javascript
export const isSuperAdmin = (user) => {
  return user?.role === 'ADMIN' && user?.is_superuser === true;
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

export const getRoleLabel = (user) => {
  if (isSuperAdmin(user)) return 'Super Admin';
  if (isDepartmentAdmin(user)) return 'Department Admin';
  if (isOfficer(user)) return 'BMC Officer';
  if (isCitizen(user)) return 'Citizen';
  return 'Unknown';
};

export const getPageAccess = (user) => {
  const superAdmin = isSuperAdmin(user);
  const deptAdmin = isDepartmentAdmin(user);
  const officer = isOfficer(user);
  
  return {
    dashboard: true,
    complaints: true,
    analytics: superAdmin || deptAdmin || officer,
    departmentManagement: superAdmin,
    officerManagement: superAdmin || deptAdmin,
    zoneManagement: superAdmin,
    settings: superAdmin,
    createAdmin: superAdmin,
  };
};
```

**Usage:**
```jsx
import { useAuth } from '../context/AuthContext';
import { isSuperAdmin, getPageAccess } from '../utils/roleBasedAccess';

function Dashboard() {
  const { user } = useAuth();
  const pageAccess = getPageAccess(user);
  
  if (!pageAccess.dashboard) {
    return <Unauthorized />;
  }
  
  return <div>Dashboard Content</div>;
}
```

---

## API Layer

### 5.4 API Configuration (`api/axiosConfig.js`)

```javascript
import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

// Public axios instance (no auth)
export const axiosPublic = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Private axios instance (with auth)
export const axiosPrivate = axios.create({
  baseURL: API_URL,
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
  }
);

// Response interceptor for token refresh
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Attempt token refresh
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosPrivate(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 5.5 Complaints API (`api/complaintsApi.js`)

```javascript
export const complaintsApi = {
  // Get user's complaints
  getUserComplaints: async () => {
    const response = await axiosPrivate.get('/complaints/');
    return response.data;
  },

  // Get complaint by ID
  getComplaintById: async (id) => {
    const response = await axiosPrivate.get(`/complaints/${id}/`);
    return response.data;
  },

  // Create new complaint
  createComplaint: async (complaintData) => {
    const formData = new FormData();
    Object.keys(complaintData).forEach(key => {
      if (complaintData[key] !== null && complaintData[key] !== undefined) {
        formData.append(key, complaintData[key]);
      }
    });
    return await axiosPrivate.post('/complaints/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update complaint status
  updateComplaintStatus: async (id, statusData) => {
    return await axiosPrivate.patch(`/complaints/${id}/status/`, statusData);
  },

  // Get complaints for map view
  getMapComplaints: async (bounds) => {
    return await axiosPublic.get('/complaints/map/', { params: bounds });
  },

  // Get analytics
  getAnalytics: async (days = 30) => {
    return await axiosPrivate.get('/complaints/analytics/', { 
      params: { days } 
    });
  },
};
```

---

## Routing

### 5.6 App Router (`routes/AppRouter.jsx`)

```jsx
const AppRouter = () => {
  const { isAuthenticated, user, authCheckComplete } = useAuth();
  
  if (!authCheckComplete) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* Citizen Routes */}
      {isAuthenticated && user?.role === 'CITIZEN' && (
        <Route path="/dashboard" element={<CitizenLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
        </Route>
      )}

      {/* Admin Routes */}
      {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_STAFF') && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPortal />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="complaints" element={<ComplaintsList />} />
          <Route path="analytics" element={<MumbaiBMCAnalytics />} />
          <Route path="officers" element={<OfficerManagement />} />
        </Route>
      )}

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
```

---

## Page Components

| Component | Path | Role | Description |
|-----------|------|------|-------------|
| `LandingPage` | `/` | Public | Homepage |
| `Login` | `/auth/login` | Public | Login page |
| `Register` | `/auth/register` | Public | Registration page |
| `ReportIssue` | `/dashboard/report` | Citizen | Submit complaint |
| `MyComplaints` | `/dashboard/complaints` | Citizen | View complaints |
| `Dashboard` | `/dashboard` | Citizen | Dashboard |
| `AdminPortal` | `/admin` | Admin | Admin home |
| `AdminDashboard` | `/admin/dashboard` | Admin | Analytics |
| `ComplaintsList` | `/admin/complaints` | Admin | Manage complaints |
| `OfficerManagement` | `/admin/officers` | Admin | Manage officers |
| `MumbaiBMCAnalytics` | `/admin/analytics` | Admin | Analytics |
| `BMCZoneManagement` | `/admin/zones` | Super Admin | Manage zones |

---

## Key Components

### Layout Components

- **PublicLayout**: For unauthenticated users
- **CitizenLayout**: For citizen dashboard
- **AdminLayout**: For admin/officer dashboard

### Common Components

- **LoadingSpinner**: Loading indicator
- **ErrorBoundary**: Error handling
- **SessionTimeoutModal**: Session management
- **BottomNavigation**: Mobile navigation

### Form Components

- **ComplaintForm**: Complaint submission
- **LoginForm**: User authentication
- **OfficerForm**: Officer management

