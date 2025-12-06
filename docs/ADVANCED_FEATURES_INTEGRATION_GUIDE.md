
# Advanced Features Integration Guide

## Overview

This guide provides comprehensive instructions for integrating multi-language support, interactive heatmaps, and advanced analytics dashboards into your CivicConnect application.

---

## Part 1: Language Support Integration

### 1.1 Setting Up i18n Context

Update your `AuthContext.jsx` to include language state:

```javascript
import { createContext, useState, useEffect } from 'react'
import { i18nUtils } from '../config/i18n'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  
  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = i18nUtils.getLanguage()
    setLanguage(savedLanguage)
  }, [])

  const handleLanguageChange = (languageCode) => {
    i18nUtils.setLanguage(languageCode)
    setLanguage(languageCode)
  }

  // ... rest of your context
  
  return (
    <AuthContext.Provider 
      value={{
        // ... existing values
        language,
        setLanguage: handleLanguageChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
```

### 1.2 Adding LanguageSelector to Navigation

```javascript
// In your Navbar.jsx or Header component
import LanguageSelector from './LanguageSelector'

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and menu items */}
        
        {/* Language selector on the right */}
        <LanguageSelector className="ml-auto" />
      </div>
    </nav>
  )
}
```

### 1.3 Using Translations in Components

```javascript
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getTranslation } from '../utils/constants'

function ComplaintForm() {
  const { language } = useContext(AuthContext)

  const handleSubmit = () => {
    // Get translated text
    const successMessage = getTranslation(
      language,
      'citizen.complaintSubmitted',
      'Complaint submitted successfully'
    )
    console.log(successMessage)
  }

  return (
    <form>
      <label>
        {getTranslation(language, 'citizen.reportIssue', 'Report Issue')}
      </label>
      {/* Form fields */}
    </form>
  )
}
```

### 1.4 Adding New Translations

To add new translations for a feature:

1. Update `TRANSLATIONS_EN` in `constants.js`:
```javascript
citizen: {
  // ... existing
  newFeature: 'New Feature Title',
  newFeatureDescription: 'Feature description',
}
```

2. Add equivalent in `TRANSLATIONS_MR`:
```javascript
citizen: {
  // ... existing
  newFeature: 'नई वैशिष्ट्य शीर्षक',
  newFeatureDescription: 'वैशिष्ट्य विवरण',
}
```

3. Add equivalent in `TRANSLATIONS_HI`:
```javascript
citizen: {
  // ... existing
  newFeature: 'नई वैशिष्ट्य शीर्षक',
  newFeatureDescription: 'वैशिष्ट्य विवरण',
}
```

---

## Part 2: Interactive Heatmap Integration

### 2.1 Adding Heatmap to Map View

```javascript
// In MapView.jsx or similar
import InteractiveHeatmap from '../components/Visualizations/InteractiveHeatmap'

function MapView({ complaints }) {
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: '',
    ward: '',
  })

  return (
    <div>
      <InteractiveHeatmap
        complaints={complaints}
        title="Complaint Hotspots - Mumbai"
        filters={filters}
        onFilterChange={setFilters}
        height="700px"
        showLegend={true}
        showFilters={true}
      />
    </div>
  )
}
```

### 2.2 Adding Heatmap to Ward Dashboard

```javascript
// In WardAdminDashboard.jsx
import InteractiveHeatmap from '../components/Visualizations/InteractiveHeatmap'

function WardAdminDashboard() {
  const [wardComplaints, setWardComplaints] = useState([])
  
  return (
    <div className="space-y-6">
      <h1>Ward A Administration</h1>
      
      <InteractiveHeatmap
        complaints={wardComplaints}
        title={`Ward A Complaint Density`}
        height="600px"
      />
    </div>
  )
}
```

### 2.3 Heatmap Data Requirements

Ensure your complaint objects have these properties:

```javascript
{
  id: 1,
  title: 'Pothole on Main Road',
  category: 'Pothole',
  status: 'PENDING',
  priority: 'HIGH',
  ward: 'A',
  latitude: 19.0760, // Required for heatmap
  longitude: 72.8777, // Required for heatmap
  created_at: '2024-01-15T10:30:00Z',
  description: '...',
}
```

---

## Part 3: Analytics Dashboard Integration

### 3.1 Adding Analytics to Department Dashboard

```javascript
// In DepartmentAdminDashboard.jsx
import AnalyticsDashboard from '../components/Visualizations/AnalyticsDashboard'

function DepartmentAdminDashboard() {
  const [complaints, setComplaints] = useState([])

  const handleExport = (filteredComplaints) => {
    exportToCSV(filteredComplaints, 'department-analytics.csv')
  }

  return (
    <div>
      <AnalyticsDashboard
        complaints={complaints}
        title="Department Analytics"
        showDateFilter={true}
        showCategoryFilter={true}
        showDepartmentFilter={false}
        onExport={handleExport}
      />
    </div>
  )
}
```

### 3.2 Adding Ward Performance Dashboard

```javascript
// In WardAdminDashboard.jsx
import WardPerformanceDashboard from '../components/Dashboards/WardPerformanceDashboard'

function WardAdminDashboard() {
  const [wardComplaints, setWardComplaints] = useState([])

  return (
    <div>
      <WardPerformanceDashboard
        complaints={wardComplaints}
        wardName="Ward A"
      />
    </div>
  )
}
```

### 3.3 Adding Department Performance Dashboard

```javascript
// In DepartmentAdminDashboard.jsx
import DepartmentPerformanceDashboard from '../components/Dashboards/DepartmentPerformanceDashboard'

function DepartmentAdminDashboard() {
  const [deptComplaints, setDeptComplaints] = useState([])

  return (
    <div>
      <DepartmentPerformanceDashboard
        complaints={deptComplaints}
        departmentName="Water Supply Department"
      />
    </div>
  )
}
```

### 3.4 Using Analytics Utilities

```javascript
import {
  calculateMetrics,
  groupComplaints,
  getDepartmentPerformance,
  getCategoryPerformance,
  getWardPerformance,
  filterComplaints,
  exportToCSV,
} from '../utils/analyticsUtils'

// Calculate metrics
const metrics = calculateMetrics(complaints)

// Group by category
const byCategory = groupComplaints(complaints, 'category')

// Get department performance
const deptPerf = getDepartmentPerformance(complaints)

// Filter complaints
const filtered = filterComplaints(complaints, {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  category: 'Pothole',
})

// Export to CSV
exportToCSV(filtered, 'complaints-jan-2024.csv')
```

---

## Part 4: Component Props Reference

### AnalyticsDashboard Props

```javascript
<AnalyticsDashboard
  complaints={Array}              // Required: Array of complaint objects
  title={String}                  // Optional: Dashboard title
  showDateFilter={Boolean}        // Optional: Show date range filter
  showCategoryFilter={Boolean}    // Optional: Show category filter
  showDepartmentFilter={Boolean}  // Optional: Show department filter
  onExport={Function}             // Optional: Export callback
/>
```

### InteractiveHeatmap Props

```javascript
<InteractiveHeatmap
  complaints={Array}              // Required: Array of complaint objects
  title={String}                  // Optional: "Complaint Heatmap"
  filters={Object}                // Optional: Current filter state
  onFilterChange={Function}       // Optional: Filter change callback
  height={String}                 // Optional: "600px"
  showLegend={Boolean}            // Optional: true
  showFilters={Boolean}           // Optional: true
/>
```

### WardPerformanceDashboard Props

```javascript
<WardPerformanceDashboard
  complaints={Array}              // Required: Array of complaint objects
  wardName={String}               // Optional: "Ward A"
/>
```

### DepartmentPerformanceDashboard Props

```javascript
<DepartmentPerformanceDashboard
  complaints={Array}              // Required: Array of complaint objects
  departmentName={String}         // Optional: "Water Supply Department"
/>
```

### LanguageSelector Props

```javascript
<LanguageSelector
  className={String}              // Optional: Custom CSS classes
/>
```

---

## Part 5: Data Processing Examples

### Example 1: Filter and Analyze Department Performance

```javascript
import {
  filterComplaints,
  getDepartmentPerformance,
} from '../utils/analyticsUtils'

// Get January complaints for Water department
const filtered = filterComplaints(allComplaints, {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  department: 'Water Supply',
})

// Analyze performance
const performance = getDepartmentPerformance(filtered)
console.log(performance)
// Output: [
//   {
//     name: 'Ward A',
//     total: 15,
//     resolved: 12,
//     pending: 2,
//     inProgress: 1,
//     resolutionRate: 80
//   },
//   ...
// ]
```

### Example 2: Generate Monthly Analytics Report

```javascript
import {
  calculateMetrics,
  getCategoryPerformance,
  groupComplaints,
  getComplaintsByDate,
} from '../utils/analyticsUtils'

function generateMonthlyReport(complaints, month = '2024-01') {
  const monthComplaints = complaints.filter(c =>
    c.created_at.startsWith(month)
  )

  return {
    period: month,
    metrics: calculateMetrics(monthComplaints),
    byCategory: getCategoryPerformance(monthComplaints),
    dailyTrend: getComplaintsByDate(monthComplaints),
    totalCategories: new Set(monthComplaints.map(c => c.category)).size,
  }
}
```

### Example 3: SLA Compliance Tracking

```javascript
function calculateSLACompliance(complaints, slaDays = 7) {
  const resolved = complaints.filter(c => c.status === 'RESOLVED')
  
  const slaCompliant = resolved.filter(c => {
    const days = (new Date(c.resolved_at) - new Date(c.created_at)) /
                 (1000 * 60 * 60 * 24)
    return days <= slaDays
  })

  return {
    total: resolved.length,
    compliant: slaCompliant.length,
    percentage: (slaCompliant.length / resolved.length * 100).toFixed(1),
    slaDays,
  }
}
```

---

## Part 6: Styling and Customization

### Custom Colors for Charts

```javascript
// In your component
const CUSTOM_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Salmon
  '#98D8C8', // Mint
]

// Use in Recharts components
<Bar dataKey="value" fill={CUSTOM_COLORS[0]} />
```

### Responsive Design

All components are responsive out of the box using Tailwind CSS grid:

```javascript
// Grid layouts automatically adapt
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Components */}
</div>
```

---

## Part 7: Performance Optimization

### Memoization for Large Datasets

```javascript
import { useMemo } from 'react'

function ComplaintAnalysis({ complaints }) {
  // Recalculate only when complaints change
  const metrics = useMemo(() => {
    return calculateMetrics(complaints)
  }, [complaints])

  return <div>{metrics.total}</div>
}
```

### Lazy Loading Charts

```javascript
import { lazy, Suspense } from 'react'

const AnalyticsDashboard = lazy(() =>
  import('./AnalyticsDashboard')
)

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <AnalyticsDashboard complaints={complaints} />
    </Suspense>
  )
}
```

---

## Part 8: Troubleshooting

### Issue: Heatmap Not Displaying

**Solution:**
- Ensure complaint objects have `latitude` and `longitude` properties
- Check that coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Verify Leaflet CSS is included in your HTML

### Issue: Language Not Changing

**Solution:**
- Ensure AuthContext is properly updated with language state
- Check that `setLanguage` is being called in AuthContext
- Verify localStorage is not blocked by browser

### Issue: Charts Not Rendering

**Solution:**
- Ensure Recharts is installed: `npm install recharts`
- Check that complaint data is in correct format
- Verify ResponsiveContainer has proper parent dimensions

### Issue: Performance Slow with Large Datasets

**Solution:**
- Use `useMemo` to prevent unnecessary recalculations
- Consider pagination for very large datasets
- Use lazy loading for dashboard components

---

## Part 9: API Integration Points

### Fetching Complaints for Heatmap

```javascript
useEffect(() => {
  fetch('/api/complaints/')
    .then(res => res.json())
    .then(data => {
      // Ensure data has latitude/longitude
      const processedData = data.map(complaint => ({
        ...complaint,
        latitude: parseFloat(complaint.latitude),
        longitude: parseFloat(complaint.longitude),
      }))
      setComplaints(processedData)
    })
}, [])
```

### Exporting Analytics Data

```javascript
const handleExport = async (filteredComplaints) => {
  // Option 1: Client-side CSV export
  exportToCSV(filteredComplaints, 'analytics.csv')

  // Option 2: Server-side PDF generation
  const response = await fetch('/api/export/pdf/', {
    method: 'POST',
    body: JSON.stringify({ complaints: filteredComplaints }),
  })
  const blob = await response.blob()
  // Download blob as file
}
```

---

## Part 10: Testing

### Testing Language Switching

```javascript
// Component test
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSelector from './LanguageSelector'

test('changes language on selection', () => {
  render(<LanguageSelector />)
  const btn = screen.getByTitle(/Language/)
  fireEvent.click(btn)
  // Assert language changed
})
```

### Testing Analytics Utilities

```javascript
import { calculateMetrics } from '../utils/analyticsUtils'

test('calculates metrics correctly', () => {
  const complaints = [
    { status: 'RESOLVED', created_at: '2024-01-01', resolved_at: '2024-01-08' },
    { status: 'PENDING', created_at: '2024-01-02', resolved_at: null },
  ]
  
  const metrics = calculateMetrics(complaints)
  expect(metrics.total).toBe(2)
  expect(metrics.resolved).toBe(1)
  expect(metrics.pending).toBe(1)
})
```

---

## Conclusion

This integration guide covers all major components and utilities for implementing multi-language support, interactive heatmaps, and advanced analytics in your CivicConnect application. Refer back to specific sections as needed during implementation.

For additional support, consult the component documentation or reach out to your development team.

