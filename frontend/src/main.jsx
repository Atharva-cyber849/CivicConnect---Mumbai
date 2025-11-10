import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'leaflet/dist/leaflet.css'

// Initialize i18n
import './i18n'

// Initialize auth store
import { useAuthStore } from './store/authStore'

// Initialize auth on app start
useAuthStore.getState().initialize()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
