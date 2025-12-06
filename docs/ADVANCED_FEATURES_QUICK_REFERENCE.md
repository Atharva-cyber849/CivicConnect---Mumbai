# Advanced Features - Quick Reference Guide

## Language Support Quick Reference

### 1. Using Translations in JSX

```javascript
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getTranslation } from '../utils/constants'

function MyComponent() {
  const { language } = useContext(AuthContext)

  return (
    <div>
      <h1>{getTranslation(language, 'citizen.reportIssue')}</h1>
      <p>{getTranslation(language, 'common.welcome')}</p>
    </div>
  )
}
```

### 2. Available Language Codes

```javascript
'en'  // English
'mr'  // Marathi (मराठी)
'hi'  // Hindi (हिंदी)
```

### 3. Translation Key Paths

```javascript
// Common keys
'common.welcome'
'common.dashboard'
'common.settings'

// Citizen keys
'citizen.reportIssue'
'citizen.trackComplaint'
'citizen.viewStatus'

// Admin keys
'wardAdmin.analytics'
'wardAdmin.officers'
'wardAdmin.complaints'

// Department keys
'deptAdmin.performance'
'deptAdmin.slaTracking'
'deptAdmin.officers'

// Super Admin keys
'superAdmin.governance'
'superAdmin.reports'
'superAdmin.users'

// Analytics keys
'analytics.metrics'
'analytics.reports'
'analytics.trends'
```

### 4. Changing Language Programmatically

```javascript
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function LanguageManager() {
  const { setLanguage } = useContext(AuthContext)

  return (
    <div>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('mr')}>मराठी</button>
      <button onClick={() => setLanguage('hi')}>हिंदी</button>
    </div>
  )
}
```

---

## Heatmap Quick Reference

### 1. Basic Heatmap Implementation

```javascript
import InteractiveHeatmap from '../components/Visualizations/InteractiveHeatmap'
import { useState } from 'react'

function MyMap() {
  const [complaints, setComplaints] = useState([])

  return (
    <InteractiveHeatmap
      complaints={complaints}
      title="Complaint Hotspots"
      height="600px"
    />
  )
}
```

### 2. Heatmap with All Features

```javascript
<InteractiveHeatmap
  complaints={complaints}
  title="Ward A - Complaint Distribution"
  filters={{
    category: 'Pothole',
    status: 'PENDING',
    priority: 'HIGH',
    ward: 'A'
  }}
  onFilterChange={(newFilters) => console.log(newFilters)}
  height="700px"
  showLegend={true}
  showFilters={true}
/>
```

### 3. Complaint Data Structure for Heatmap

```javascript
const complaint = {
  id: 1,
  title: "Pothole on Main Road",
  category: "Pothole",          // Matches: CATEGORIES
  status: "PENDING",            // PENDING, IN_PROGRESS, RESOLVED
  priority: "HIGH",             // URGENT, HIGH, MEDIUM, LOW
  ward: "A",                    // A-T
  latitude: 19.0760,            // Required!
  longitude: 72.8777,           // Required!
  created_at: "2024-01-15T10:30:00Z",
  resolved_at: null,
  description: "Large pothole causing traffic"
}
```

### 4. Filter Options

```javascript
const filters = {
  category: "Pothole",                    // Any category or empty for all
  status: "PENDING",                      // PENDING, IN_PROGRESS, RESOLVED
  priority: "HIGH",                       // URGENT, HIGH, MEDIUM, LOW
  ward: "A"                               // A-T or empty for all
}
```

### 5. Heatmap Color Meanings

```
🔵 Blue    → Few complaints (low density)
🔷 Cyan    → Some complaints (low-medium)
🟩 Lime    → More complaints (medium)
🟨 Yellow  → Many complaints (medium-high)
🔴 Red     → Very many complaints (high density)
```

---

## Analytics Dashboard Quick Reference

### 1. Basic Analytics Dashboard

```javascript
import AnalyticsDashboard from '../components/Visualizations/AnalyticsDashboard'
import { useState } from 'react'

function Analytics() {
  const [complaints, setComplaints] = useState([])

  return (
    <AnalyticsDashboard
      complaints={complaints}
      title="Monthly Analytics"
    />
  )
}
```

### 2. Analytics with CSV Export

```javascript
const handleExport = (filteredComplaints) => {
  const data = filteredComplaints.map(c => ({
    ID: c.id,
    Category: c.category,
    Status: c.status,
    Ward: c.ward,
    Priority: c.priority,
    Created: c.created_at
  }))
  // Trigger download
}

<AnalyticsDashboard
  complaints={complaints}
  onExport={handleExport}
/>
```

### 3. Analytics Utility Functions

```javascript
import {
  calculateMetrics,
  groupComplaints,
  getDepartmentPerformance,
  getCategoryPerformance,
  getWardPerformance,
  filterComplaints,
  exportToCSV
} from '../utils/analyticsUtils'

// Calculate all metrics
const metrics = calculateMetrics(complaints)
// Output: {
//   total: 100,
//   resolved: 75,
//   pending: 15,
//   inProgress: 10,
//   avgResolutionTime: 5.2,
//   slaAdherence: 75,
//   resolutionRate: 75,
//   avgResponseTime: 2.1
// }

// Group by category
const byCategory = groupComplaints(complaints, 'category')
// Output: [
//   { name: 'Pothole', value: 45 },
//   { name: 'Garbage', value: 30 },
//   ...
// ]

// Get ward performance
const wardPerf = getWardPerformance(complaints)
// Output: [
//   {
//     name: 'Ward A',
//     total: 25,
//     resolved: 20,
//     pending: 3,
//     inProgress: 2,
//     resolutionRate: 80
//   },
//   ...
// ]
```

### 4. Filtering Complaints

```javascript
const filtered = filterComplaints(complaints, {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  category: 'Pothole',
  department: 'Roads',
  status: 'PENDING',
  priority: 'HIGH',
  ward: 'A'
})
```

### 5. Export Complaints to CSV

```javascript
import { exportToCSV } from '../utils/analyticsUtils'

// Export all complaints
exportToCSV(complaints, 'all-complaints.csv')

// Export filtered complaints
const filtered = filterComplaints(complaints, { status: 'RESOLVED' })
exportToCSV(filtered, 'resolved-complaints.csv')
```

---

## Dashboard Components Quick Reference

### 1. Ward Performance Dashboard

```javascript
import WardPerformanceDashboard from '../components/Dashboards/WardPerformanceDashboard'

<WardPerformanceDashboard
  complaints={wardComplaints}
  wardName="Ward A"
/>
```

### Metrics Shown:
- Total complaints in ward
- Resolved count and rate
- Pending and in-progress counts
- Urgent/High priority count
- Average resolution time
- Category breakdown
- Status distribution
- 2-week trend

### 2. Department Performance Dashboard

```javascript
import DepartmentPerformanceDashboard from '../components/Dashboards/DepartmentPerformanceDashboard'

<DepartmentPerformanceDashboard
  complaints={deptComplaints}
  departmentName="Water Supply Department"
/>
```

### Metrics Shown:
- Total complaints handled
- Resolution rate
- SLA compliance (7-day target)
- Average resolution time
- Performance by ward
- Officer efficiency
- Status distribution
- 30-day trend
- Alert system for SLA/pending

---

## Common Patterns and Examples

### Pattern 1: Fetch and Display Heatmap

```javascript
useEffect(() => {
  fetch('/api/complaints/')
    .then(res => res.json())
    .then(data => {
      // Process coordinates
      const processed = data.map(c => ({
        ...c,
        latitude: parseFloat(c.latitude),
        longitude: parseFloat(c.longitude)
      }))
      setComplaints(processed)
    })
}, [])

return <InteractiveHeatmap complaints={complaints} />
```

### Pattern 2: Real-time Analytics Update

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    fetch('/api/complaints/')
      .then(res => res.json())
      .then(setComplaints)
  }, 5000) // Update every 5 seconds

  return () => clearInterval(interval)
}, [])

return <AnalyticsDashboard complaints={complaints} />
```

### Pattern 3: Filtered Analytics by Department

```javascript
const deptComplaints = useMemo(() => {
  return filterComplaints(complaints, {
    department: 'Water Supply'
  })
}, [complaints])

return (
  <DepartmentPerformanceDashboard
    complaints={deptComplaints}
    departmentName="Water Supply"
  />
)
```

### Pattern 4: Language-Aware Error Messages

```javascript
import { getTranslation } from '../utils/constants'

const showError = (messageKey) => {
  const message = getTranslation(language, `errors.${messageKey}`)
  toast.error(message)
}
```

### Pattern 5: SLA Compliance Check

```javascript
const slaCompliant = complaints.filter(c => {
  if (c.status !== 'RESOLVED') return false
  const days = (new Date(c.resolved_at) - new Date(c.created_at)) /
               (1000 * 60 * 60 * 24)
  return days <= 7
})

const slaRate = (slaCompliant.length / complaints.length) * 100
```

---

## Performance Tips

### 1. Memoize Expensive Calculations

```javascript
const metrics = useMemo(() => {
  return calculateMetrics(complaints)
}, [complaints])

const wardPerf = useMemo(() => {
  return getWardPerformance(complaints)
}, [complaints])
```

### 2. Lazy Load Dashboards

```javascript
const AnalyticsDashboard = lazy(() =>
  import('./AnalyticsDashboard')
)

<Suspense fallback={<Loading />}>
  <AnalyticsDashboard complaints={complaints} />
</Suspense>
```

### 3. Pagination for Large Lists

```javascript
const [page, setPage] = useState(1)
const pageSize = 20
const paginatedComplaints = complaints.slice(
  (page - 1) * pageSize,
  page * pageSize
)
```

### 4. Debounce Filter Changes

```javascript
const [filters, setFilters] = useState({})

const handleFilterChange = useMemo(
  () => debounce((newFilters) => {
    setFilters(newFilters)
  }, 300),
  []
)
```

---

## Troubleshooting Quick Fixes

### Issue: Heatmap Not Showing
**Fix**: Check that complaint objects have valid latitude/longitude

```javascript
const hasCoordinates = complaints.every(c =>
  typeof c.latitude === 'number' &&
  typeof c.longitude === 'number' &&
  c.latitude >= -90 && c.latitude <= 90 &&
  c.longitude >= -180 && c.longitude <= 180
)
console.log('Coordinates valid:', hasCoordinates)
```

### Issue: Language Not Persisting
**Fix**: Ensure AuthContext calls setLanguage() properly

```javascript
const handleLanguageChange = (code) => {
  i18nUtils.setLanguage(code)
  setLanguage(code)
}
```

### Issue: Analytics Showing Old Data
**Fix**: Ensure data dependency in useMemo

```javascript
const metrics = useMemo(() => {
  return calculateMetrics(complaints)
}, [complaints]) // Include complaints dependency!
```

### Issue: Charts Not Rendering
**Fix**: Verify ResponsiveContainer has a parent with defined height

```javascript
<div className="h-96"> {/* Define height on parent */}
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      {/* Chart config */}
    </BarChart>
  </ResponsiveContainer>
</div>
```

---

## API Integration Endpoints

```javascript
// Get all complaints
GET /api/complaints/

// Get complaints for specific department
GET /api/complaints/?department=Water_Supply

// Get complaints for specific ward
GET /api/complaints/?ward=A

// Filter by date range
GET /api/complaints/?start_date=2024-01-01&end_date=2024-01-31

// Export complaints
POST /api/export/csv/
Body: { complaints: [...] }

// Get analytics data
GET /api/analytics/metrics/
GET /api/analytics/trends/
GET /api/analytics/heatmap/
```

---

## Testing Examples

### Test Language Switching

```javascript
test('switches language', () => {
  const { language, setLanguage } = useContext(AuthContext)
  
  setLanguage('mr')
  expect(language).toBe('mr')
  
  const marathi = getTranslation('mr', 'citizen.reportIssue')
  expect(marathi).toBeTruthy()
})
```

### Test Analytics Calculation

```javascript
test('calculates metrics', () => {
  const complaints = [
    { status: 'RESOLVED', created_at: '2024-01-01', resolved_at: '2024-01-05' },
    { status: 'PENDING', created_at: '2024-01-02' },
  ]
  
  const metrics = calculateMetrics(complaints)
  
  expect(metrics.total).toBe(2)
  expect(metrics.resolved).toBe(1)
  expect(metrics.resolutionRate).toBe(50)
})
```

### Test Heatmap Rendering

```javascript
test('renders heatmap with complaints', () => {
  const { container } = render(
    <InteractiveHeatmap complaints={mockComplaints} />
  )
  
  expect(container.querySelector('.leaflet-container')).toBeTruthy()
})
```

---

## Constants Reference

### Chart Colors
```javascript
const COLORS = [
  '#3B82F6',  // Blue
  '#10B981',  // Green
  '#F59E0B',  // Amber
  '#EF4444',  // Red
  '#8B5CF6',  // Purple
  '#EC4899',  // Pink
  '#14B8A6',  // Teal
  '#F97316',  // Orange
]
```

### Heatmap Gradient
```javascript
const gradient = {
  0.0: 'blue',    // Low
  0.25: 'cyan',   // Low-Medium
  0.5: 'lime',    // Medium
  0.75: 'yellow', // Medium-High
  1.0: 'red'      // High
}
```

### Status Values
```javascript
'PENDING'
'IN_PROGRESS'
'RESOLVED'
```

### Priority Values
```javascript
'URGENT'
'HIGH'
'MEDIUM'
'LOW'
```

### Categories
```javascript
'Pothole'
'Garbage'
'Water'
'Street Light'
'Sidewalk'
'Traffic Signal'
'Sanitation'
'Others'
```

---

**Quick Reference Complete**  
For detailed information, see ADVANCED_FEATURES_INTEGRATION_GUIDE.md
