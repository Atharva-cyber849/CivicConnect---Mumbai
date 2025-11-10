# CivicConnect Frontend Flow Guide

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Application Entry Point](#application-entry-point)
- [Routing System](#routing-system)
- [Authentication Flow](#authentication-flow)
- [User Role-Based Navigation](#user-role-based-navigation)
- [State Management](#state-management)
- [PWA Features](#pwa-features)
- [Component Structure](#component-structure)
- [API Integration](#api-integration)
- [Internationalization](#internationalization)
- [Data Flow Patterns](#data-flow-patterns)

## 🏗 Architecture Overview

CivicConnect is a **Progressive Web Application (PWA)** built with **React 18** that serves as Mumbai's civic complaint management system. The application follows a modular architecture with clear separation of concerns.

### Core Technologies Stack
- **Frontend Framework**: React 18 with JSX
- **Routing**: React Router v6
- **State Management**: Context API + useReducer + Zustand stores
- **HTTP Client**: Axios with React Query for caching
- **Styling**: Tailwind CSS
- **Icons**: Lucide React + React Icons
- **Maps**: Leaflet + React Leaflet
- **Internationalization**: react-i18next
- **Build Tool**: Vite
- **PWA Features**: Service Workers, Push Notifications

## 🚀 Application Entry Point

### App.jsx - Main Application Bootstrap
```
App.jsx
├── QueryClientProvider (React Query setup)
├── BrowserRouter (React Router)
├── Context Providers Stack:
│   ├── ThemeProvider (Dark/Light mode)
│   ├── AuthProvider (Authentication state)
│   └── NotificationProvider (Push notifications)
├── PWA Components:
│   ├── PWAInstallPrompt (App installation)
│   ├── PWAUpdateNotification (Service worker updates)
│   └── OfflineIndicator (Connectivity status)
├── AppRouter (Main routing logic)
└── Toast Notifications (Global feedback)
```

### Application Initialization Flow
1. **React Query Client** initialized with caching strategies
2. **PWA Service** automatically initialized on app start
3. **Context Providers** wrap the entire app for global state
4. **Service Worker** registration for offline capabilities
5. **Authentication** state restoration from localStorage
6. **Theme** and **Language** preferences loaded

## 🛤 Routing System

### AppRouter.jsx - Central Route Management

The application uses a **hierarchical routing structure** with role-based access control:

```
/ (Root)
├── / → LandingPage (Public)
├── /track → TrackComplaint (Public)
├── /auth/
│   ├── /login → Login
│   └── /register → Register
├── /dashboard/* → CitizenRoutes (Protected)
└── /admin/* → AdminRoutes (Protected, Role-based)
```

### Route Protection Levels
1. **Public Routes**: Accessible to all users
2. **Protected Routes**: Require authentication
3. **Role-based Routes**: Require specific user roles

### Navigation Flow Logic
```javascript
// Route determination based on authentication
if (!authenticated) → Public routes or Auth routes
if (authenticated && role === 'citizen') → /dashboard/*
if (authenticated && role === 'admin|officer') → /admin/*
```

## 🔐 Authentication Flow

### AuthContext.jsx - Centralized Authentication

The authentication system uses **React Context** with **useReducer** for state management:

#### Authentication States
```javascript
{
  isAuthenticated: boolean,
  user: UserObject | null,
  token: string | null,
  loading: boolean,
  error: string | null
}
```

#### Authentication Flow
1. **Token Check**: On app load, check localStorage for existing tokens
2. **Auto-login**: If valid token exists, restore user session
3. **Login Process**: Credentials → API → Store tokens → Update state
4. **Logout Process**: Clear tokens → Reset state → Redirect to public
5. **Token Refresh**: Automatic token refresh on API calls

#### User Role System
```javascript
USER_ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer', 
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}
```

## 👥 User Role-Based Navigation

### Citizen Dashboard Flow (`/dashboard/*`)
```
CitizenRoutes (UserLayout)
├── / → Dashboard (Overview + Quick actions)
├── /report → ReportIssue (File new complaint)
├── /complaints → MyComplaints (User's complaint list)
├── /complaints/:id → ComplaintDetail (Specific complaint)
├── /map → MapView (Complaints on map)
├── /notifications → Notifications (User notifications)
└── /profile → Profile (User settings)
```

### Admin/Officer Dashboard Flow (`/admin/*`)
```
AdminRoutes (AdminLayout)
├── / → Dashboard (Admin overview)
├── /complaints → ComplaintsList (All complaints)
├── /complaints/:id → ComplaintDetails (Complaint management)
├── /map → MapView (Administrative map view)
├── /reports → Reports (Analytics dashboard)
├── /officers → OfficerManagement (User management)
├── /settings → Settings (System settings)
└── /register → AdminRegister (Super admin only)
```

## 🏪 State Management

The application uses a **hybrid state management approach**:

### 1. Global Context (React Context + useReducer)
- **AuthContext**: User authentication state
- **ThemeContext**: UI theme preferences
- **NotificationContext**: Real-time notifications

### 2. Local Component State (useState)
- Form inputs and validation
- UI component states (modals, dropdowns)
- Local loading states

### 3. Zustand Stores
- **authStore.js**: Authentication utilities
- **languageStore.js**: Internationalization state
- **notificationStore.js**: Notification preferences

### 4. React Query Cache
- API response caching
- Background data synchronization
- Optimistic updates

## 📱 PWA Features

### PWA Service (`pwaService.js`)
The PWA service provides comprehensive Progressive Web App functionality:

#### Core PWA Features
1. **Service Worker Registration**: Automatic registration and lifecycle management
2. **Install Prompt**: Native app installation prompts
3. **Offline Support**: Cached resources and offline fallbacks
4. **Push Notifications**: Browser push notification system
5. **Background Sync**: Queue actions when offline
6. **Update Detection**: Automatic app update notifications

#### PWA Components
```javascript
// PWA-related React components
PWAInstallPrompt.jsx     // App installation UI
PWAUpdateNotification.jsx // Update notification
OfflineIndicator.jsx     // Connectivity status
```

#### Service Worker Features (`public/sw.js`)
- **Cache Strategy**: Network-first for API, cache-first for static assets
- **Offline Fallback**: Serves cached pages when offline
- **Background Sync**: Syncs data when connection restored
- **Push Notifications**: Handles incoming push messages

## 🧩 Component Structure

### Layout Components
```
components/Layout/
├── PublicLayout.jsx     // Landing page layout
├── AuthLayout.jsx       // Login/register layout  
├── UserLayout.jsx       // Citizen dashboard layout
├── AdminLayout.jsx      // Admin dashboard layout
├── Navbar.jsx           // Navigation header
├── Sidebar.jsx          // Navigation sidebar
├── Footer.jsx           // Page footer
└── LoadingSpinner.jsx   // Global loading component
```

### Feature Components
```
components/
├── Common/              // Shared components
│   ├── LanguageSwitcher.jsx
│   └── NotificationPanel.jsx
├── Settings/            // Settings-related components
│   └── NotificationSettings.jsx
├── Map/                 // Map components (Leaflet-based)
├── Modals/              // Modal dialogs
├── Cards/               // Card layouts
├── Buttons/             // Button variants
└── Inputs/              // Form inputs
```

## 🔌 API Integration

### API Structure (`src/api/`)
```javascript
api/
├── axiosConfig.js       // Axios base configuration
├── authApi.js          // Authentication endpoints
├── complaintsApi.js    // Complaint management
├── notificationsApi.js // Notification services
├── reportsApi.js       // Analytics and reports
└── index.js            // API exports
```

### API Integration Pattern
1. **Axios Configuration**: Base URL, interceptors, auth headers
2. **React Query Integration**: Caching, background updates
3. **Error Handling**: Global error interceptors
4. **Token Management**: Automatic token refresh
5. **Offline Handling**: Request queuing when offline

### HTTP Client Setup
```javascript
// Axios interceptors for auth and error handling
axios.interceptors.request  // Add auth tokens
axios.interceptors.response // Handle token refresh, errors
```

## 🌐 Internationalization

### Language Support
- **English** (en): Default language
- **Marathi** (mr): Local Mumbai language

### i18n Structure (`src/locales/`)
```javascript
locales/
├── translations.js      // Translation key-value pairs
└── index.js            // i18n configuration

// Usage in components
const { t } = useTranslation()
return <h1>{t('welcome_message')}</h1>
```

### Language Switching
- **LanguageSwitcher.jsx**: Multiple UI variants (default, compact, icon-only)
- **Persistent Storage**: Language preference saved to localStorage
- **Dynamic Loading**: Translations loaded based on user selection

## 📊 Data Flow Patterns

### Complaint Management Flow
```
1. User Reports Issue:
   ReportIssue.jsx → complaintsApi.create() → Backend

2. Admin Views Complaints:
   ComplaintsList.jsx → complaintsApi.getAll() → Display Grid

3. Status Updates:
   ComplaintDetails.jsx → complaintsApi.updateStatus() → Real-time Sync

4. Real-time Notifications:
   WebSocket/Push → NotificationContext → UI Update
```

### Authentication Flow
```
1. Login:
   Login.jsx → AuthContext.login() → authApi.login() → Store Tokens

2. Protected Route Access:
   ProtectedRoute.jsx → AuthContext.isAuthenticated → Allow/Redirect

3. API Calls:
   Component → React Query → Axios (with auth headers) → Backend
```

### Map Integration Flow
```
1. Map Initialization:
   MapView.jsx → Leaflet Map → Mumbai Ward Boundaries

2. Complaint Plotting:
   complaintsApi.getAll() → Filter by location → Plot markers

3. Interactive Features:
   Click Marker → Show Complaint Details → Navigation
```

### PWA Offline Flow
```
1. Online State:
   Normal API calls → Real-time data → Immediate updates

2. Going Offline:
   Service Worker → Cache API responses → Queue user actions

3. Coming Online:
   Background Sync → Process queued actions → Sync with server
```

## 🔄 Component Lifecycle & Updates

### React Query Data Fetching
```javascript
// Automatic background updates
useQuery({
  queryKey: ['complaints'],
  queryFn: complaintsApi.getAll,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  refetchOnWindowFocus: false
})
```

### Real-time Updates
- **Push Notifications**: Server-sent updates for complaint status changes
- **WebSocket Integration**: Real-time complaint updates
- **Optimistic Updates**: Immediate UI updates before server confirmation

### State Synchronization
- **Cross-tab Communication**: Service worker messaging
- **Storage Events**: localStorage change detection
- **Context Propagation**: Global state updates across components

## 🎯 Key User Journeys

### Citizen Journey
1. **Landing Page** → Learn about the service
2. **Register/Login** → Create account or sign in
3. **Dashboard** → View overview of complaints and quick actions
4. **Report Issue** → Submit new complaint with photos and location
5. **Track Complaints** → Monitor progress and receive updates
6. **Map View** → See complaints in geographic context

### Admin Journey
1. **Admin Login** → Secure administrative access
2. **Admin Dashboard** → System overview and metrics
3. **Complaint Management** → Review, assign, and update complaints
4. **Officer Management** → Manage department officers
5. **Analytics** → Generate reports and insights
6. **System Settings** → Configure application parameters

---

## 📝 Summary

The CivicConnect frontend is a sophisticated PWA that provides:
- **Role-based access control** for citizens and administrators
- **Offline-first architecture** with service worker caching
- **Real-time updates** through push notifications
- **Bilingual support** for English and Marathi
- **Interactive mapping** for geographic complaint visualization
- **Mobile-first design** with PWA installation capabilities

The application follows modern React patterns with a clear separation of concerns, making it maintainable, scalable, and user-friendly for Mumbai's civic complaint management needs.