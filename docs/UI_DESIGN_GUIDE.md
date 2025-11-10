# 🌆 Snap & Report — Mumbai UI Design Guide

**Complete UI/UX Specification for BMC Civic Issue Reporting Platform**

---

## 📐 Design System

### Color Palette

#### Primary Colors
```css
/* Mumbai Civic Blue */
--civic-blue-50: #e6f3ff;
--civic-blue-100: #b3dbff;
--civic-blue-200: #80c3ff;
--civic-blue-300: #4dabff;
--civic-blue-400: #1a93ff;
--civic-blue-500: #0078D7; /* Primary */
--civic-blue-600: #0066b8;
--civic-blue-700: #005499;
--civic-blue-800: #00427a;
--civic-blue-900: #00305b;

/* Civic Orange (Accent) */
--civic-orange-50: #fff7ed;
--civic-orange-100: #ffedd5;
--civic-orange-200: #fed7aa;
--civic-orange-300: #fdba74;
--civic-orange-400: #fb923c;
--civic-orange-500: #FF9E00; /* Accent */
--civic-orange-600: #ea580c;
--civic-orange-700: #c2410c;
--civic-orange-800: #9a3412;
--civic-orange-900: #7c2d12;
```

#### Status Colors
```css
/* Pending */
--status-pending: #FCD34D; /* Yellow */
--status-pending-bg: #FEF3C7;

/* In Progress */
--status-progress: #3B82F6; /* Blue */
--status-progress-bg: #DBEAFE;

/* Resolved */
--status-resolved: #10B981; /* Green */
--status-resolved-bg: #D1FAE5;

/* Rejected */
--status-rejected: #EF4444; /* Red */
--status-rejected-bg: #FEE2E2;
```

#### Priority Colors
```css
/* Low */
--priority-low: #6B7280; /* Gray */
--priority-low-bg: #F3F4F6;

/* Medium */
--priority-medium: #F59E0B; /* Amber */
--priority-medium-bg: #FEF3C7;

/* High */
--priority-high: #F97316; /* Orange */
--priority-high-bg: #FFEDD5;

/* Urgent */
--priority-urgent: #DC2626; /* Red */
--priority-urgent-bg: #FEE2E2;
```

### Typography

#### Font Families
```css
/* Primary Font (English) */
--font-primary: 'Inter', 'Roboto', system-ui, -apple-system, sans-serif;

/* Marathi Font */
--font-marathi: 'Noto Sans Devanagari', 'Inter', sans-serif;

/* Monospace (IDs, Codes) */
--font-mono: 'Roboto Mono', 'Courier New', monospace;
```

#### Font Sizes
```css
/* Headings */
--text-5xl: 3rem;      /* Hero Title */
--text-4xl: 2.25rem;   /* Page Title */
--text-3xl: 1.875rem;  /* Section Title */
--text-2xl: 1.5rem;    /* Card Title */
--text-xl: 1.25rem;    /* Subsection */
--text-lg: 1.125rem;   /* Large Body */

/* Body */
--text-base: 1rem;     /* Default */
--text-sm: 0.875rem;   /* Small Text */
--text-xs: 0.75rem;    /* Caption */
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius
```css
--radius-sm: 0.25rem;  /* 4px - Small elements */
--radius-md: 0.5rem;   /* 8px - Cards, buttons */
--radius-lg: 0.75rem;  /* 12px - Modals */
--radius-xl: 1rem;     /* 16px - Large cards */
--radius-full: 9999px; /* Circular elements */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## 🏠 Page Layouts

### 1. Landing Page (Public)

#### Hero Section
```
┌────────────────────────────────────────────────┐
│  [🇮🇳 BMC Mumbai]                              │
│                                                 │
│        📸 Snap & Report                        │
│   Empowering Mumbaikars to Report             │
│        Civic Issues                            │
│                                                 │
│  [🆕 Report an Issue] [🔍 Track Complaint]    │
│                                                 │
│  🕐 24/7 Service | 🗺️ 24 Wards | 🔒 Secure   │
└────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Gradient from civic-blue-50 → white → civic-orange-50
- Pattern overlay: Subtle grid pattern at 5% opacity
- Title: 5xl font (7xl on desktop), civic-blue-600
- Subtitle: 2xl font, gray-700
- Buttons: Large (px-8 py-4), primary with shadow-lg
- Spacing: py-20 on container

#### How It Works Section
```
┌──────────────┬──────────────┬──────────────┐
│  [📱 Icon]   │  [📍 Icon]   │  [✓ Icon]    │
│      1       │      2       │      3       │
│ Snap a Photo │ Add Location │ Track Status │
│  Description │  Description │  Description │
└──────────────┴──────────────┴──────────────┘
```

**Specifications:**
- Card: White background, rounded-xl, shadow-lg
- Border-top: 4px solid (blue/orange/green)
- Icon container: 64px circle, colored background
- Number: 3xl font, colored
- Hover: shadow-2xl, transform scale-105

#### Features Grid
```
┌─────────┬─────────┬─────────┐
│ 🤖 AI   │ 🗺️ Ward │ ⚡ Real │
│ Smart   │ Level   │ Time    │
│ Route   │ Track   │ Updates │
└─────────┴─────────┴─────────┘
```

**Specifications:**
- 3-column grid (1 column on mobile)
- Card: White, p-6, rounded-lg, shadow-md
- Emoji: 3xl size at top
- Title: xl font, bold
- Description: base font, gray-600

#### Statistics Section
```
┌────────────────────────────────────────────────┐
│         Mumbai's Civic Impact                  │
│                                                 │
│  25,000+    21,000+    15,000+    84%          │
│  Reported   Resolved   Citizens   Resolution   │
└────────────────────────────────────────────────┘
```

**Specifications:**
- Background: civic-blue-600 (primary gradient)
- Text: White
- Numbers: 5xl font, bold
- Labels: lg font
- 4-column grid (2 columns on tablet, 1 on mobile)

---

### 2. Citizen Dashboard

```
┌────────────────────────────────────────────────┐
│  [Logo] Snap & Report    [🔔 3] [Profile ▼]   │
├────────────────────────────────────────────────┤
│                                                 │
│  Welcome back, Raj! 👋                         │
│                                                 │
│  ┌─────────┬─────────┬─────────┬─────────┐   │
│  │📝 Total │⏳ Pending│✓ Resolved│📊 Avg   │   │
│  │   12    │    3    │    9     │ 5 days  │   │
│  └─────────┴─────────┴─────────┴─────────┘   │
│                                                 │
│  Recent Complaints                              │
│  ┌──────────────────────────────────────┐     │
│  │ [IMG] Pothole on SV Road             │     │
│  │       H/W - Bandra West              │     │
│  │       Status: In Progress            │     │
│  │       5 hours ago                    │     │
│  └──────────────────────────────────────┘     │
│                                                 │
│  [+ Report New Issue]                          │
└────────────────────────────────────────────────┘
```

**Components:**
- **Top Navigation:** Fixed, white background, shadow-sm
- **Stats Cards:** 4-column grid, white cards with icons
- **Complaint Cards:** Image thumbnail (left), details (right)
- **CTA Button:** Large, civic-orange-500, floating or fixed
- **Mobile:** Bottom tab navigation

---

### 3. Report Issue Page

```
┌────────────────────────────────────────────────┐
│  Report Civic Issue                            │
├────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │             │  │ 📷 Upload Photo       │   │
│  │   Camera    │  │                       │   │
│  │   Preview   │  │ Title*                │   │
│  │             │  │ [________________]    │   │
│  │             │  │                       │   │
│  └─────────────┘  │ Description*          │   │
│                    │ [________________]    │   │
│  🗺️ Select Location│ [________________]    │   │
│  ┌─────────────┐  │                       │   │
│  │             │  │ Category*             │   │
│  │   Mumbai    │  │ [Dropdown ▼]          │   │
│  │    Map      │  │                       │   │
│  │             │  │ Ward*                 │   │
│  │     📍       │  │ [Dropdown ▼]          │   │
│  │             │  │                       │   │
│  └─────────────┘  │ [📍 Use My Location]  │   │
│                    │                       │   │
│                    │ Address               │   │
│                    │ [Auto-filled____]     │   │
│                    │                       │   │
│                    │ [Submit Complaint]    │   │
│                    └──────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Layout:**
- Two-column layout (desktop)
- Left: Image preview + Map (sticky)
- Right: Form fields
- Mobile: Single column, stacked

**Form Fields:**
- Image upload: Drag-drop or click, 5MB max
- Title: Text input, max 100 chars
- Description: Textarea, max 500 chars
- Category: Dropdown with icons (🕳️ Pothole, 🗑️ Garbage, etc.)
- Ward: Dropdown (A to T with names)
- Location: Interactive map with marker
- Address: Auto-filled from map, editable

**Map Features:**
- Centered on Mumbai (19.0760, 72.8777)
- Click to place marker
- Draggable marker
- "Use My Location" button (GPS)
- Ward boundaries overlay (optional toggle)
- Zoom controls

---

### 4. Admin Dashboard

```
┌────────────────────────────────────────────────┐
│  [Logo]  [Complaints] [Departments] [Users]    │
├────┬───────────────────────────────────────────┤
│ S  │  BMC Complaint Management Dashboard       │
│ I  │                                            │
│ D  │  ┌──────┬──────┬──────┬──────┬──────┐    │
│ E  │  │Total │Pending│Progress│Resolved│Avg│    │
│ B  │  │ 450  │  85  │   120  │  245   │6d│    │
│ A  │  └──────┴──────┴──────┴──────┴──────┘    │
│ R  │                                            │
│    │  ┌──────────────┬──────────────────┐     │
│ F  │  │  📊 Chart:   │  🗺️ Map:          │     │
│ i  │  │  Complaints  │  Active           │     │
│ l  │  │  by Ward     │  Complaints       │     │
│ t  │  │              │                   │     │
│ e  │  └──────────────┴──────────────────┘     │
│ r  │                                            │
│    │  Recent Complaints                        │
│ W  │  ┌──────────────────────────────────┐    │
│ a  │  │ #1234 │ Pothole │ H/W │ Pending  │    │
│ r  │  ├──────────────────────────────────┤    │
│ d  │  │ #1233 │ Garbage │ K/E │ Progress │    │
│    │  └──────────────────────────────────┘    │
│ C  │                                            │
│ a  │  [Export Report] [View All Complaints]    │
│ t  │                                            │
└────┴───────────────────────────────────────────┘
```

**Layout:**
- Left Sidebar: Filters and navigation (240px wide)
- Main Content: Dashboard widgets and data
- Top Bar: Navigation tabs and user menu

**Sidebar Filters:**
- Ward: Multi-select dropdown
- Category: Checkboxes
- Status: Radio buttons
- Date Range: Date picker
- Priority: Checkboxes
- Department: Multi-select

**Dashboard Widgets:**
- Stats Cards: 5-column grid
- Charts: Bar chart (ward-wise), Pie chart (status)
- Map: Interactive with clustering
- Recent Activity: Table or card list
- Quick Actions: Buttons for common tasks

---

### 5. Complaint Detail Page (Admin)

```
┌────────────────────────────────────────────────┐
│  ← Back to List        Complaint #1234         │
├────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │             │  │ Pothole on SV Road    │   │
│  │   Image     │  │                       │   │
│  │             │  │ Reported by: Raj S.   │   │
│  │             │  │ Ward: H/W - Bandra    │   │
│  │             │  │ Category: 🕳️ Pothole  │   │
│  └─────────────┘  │                       │   │
│                    │ Status: [Dropdown ▼]  │   │
│  🗺️ Location      │ Priority: [Dropdown ▼]│   │
│  ┌─────────────┐  │ Department: Roads     │   │
│  │             │  │                       │   │
│  │   Map with  │  │ Description:          │   │
│  │   Marker    │  │ Large pothole causing │   │
│  │     📍       │  │ traffic issues...     │   │
│  │             │  │                       │   │
│  └─────────────┘  └──────────────────────┘   │
│                                                 │
│  Timeline                                       │
│  ○──●──○   Submitted → In Progress → Resolved │
│                                                 │
│  Updates & Comments                             │
│  ┌─────────────────────────────────────────┐  │
│  │ [Officer Name] - 2 hours ago            │  │
│  │ Investigation started. Work crew        │  │
│  │ dispatched.                             │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Add Update                                     │
│  [____________________________________]         │
│  [Send Update & Notify User]                   │
└────────────────────────────────────────────────┘
```

**Components:**
- **Image Gallery:** Lightbox on click, zoom support
- **Info Panel:** Editable fields for admin
- **Status Selector:** Dropdown with color indicators
- **Timeline:** Visual progress indicator
- **Map:** Static or interactive based on role
- **Comments:** Chronological list with timestamps
- **Actions:** Update status, assign department, add comment

---

## 🎨 Component Specifications

### Button Styles

#### Primary Button
```jsx
className="
  bg-civic-blue-600 
  hover:bg-civic-blue-700 
  text-white 
  px-6 py-3 
  rounded-lg 
  font-semibold 
  shadow-lg 
  hover:shadow-xl 
  transition-all 
  duration-300 
  transform 
  hover:-translate-y-1
"
```

#### Secondary Button
```jsx
className="
  bg-white 
  hover:bg-gray-50 
  text-civic-blue-600 
  border-2 
  border-civic-blue-600 
  px-6 py-3 
  rounded-lg 
  font-semibold 
  shadow-lg 
  hover:shadow-xl 
  transition-all 
  duration-300
"
```

#### Accent Button (CTA)
```jsx
className="
  bg-civic-orange-500 
  hover:bg-civic-orange-600 
  text-white 
  px-8 py-4 
  rounded-lg 
  text-lg 
  font-semibold 
  shadow-lg 
  hover:shadow-xl 
  transition-all 
  duration-300 
  transform 
  hover:-translate-y-1
"
```

### Card Styles

#### Default Card
```jsx
className="
  bg-white 
  rounded-xl 
  shadow-md 
  hover:shadow-xl 
  transition-shadow 
  duration-300 
  p-6 
  border 
  border-gray-100
"
```

#### Status Card
```jsx
// Pending
className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-400"

// In Progress
className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"

// Resolved
className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"

// Rejected
className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500"
```

### Badge Styles

#### Status Badge
```jsx
// Pending
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
  Pending
</span>

// In Progress
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
  In Progress
</span>

// Resolved
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
  Resolved
</span>

// Rejected
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
  Rejected
</span>
```

### Input Styles

#### Text Input
```jsx
className="
  w-full 
  px-4 py-3 
  border 
  border-gray-300 
  rounded-lg 
  focus:outline-none 
  focus:ring-2 
  focus:ring-civic-blue-500 
  focus:border-transparent 
  transition-all
"
```

#### Dropdown
```jsx
className="
  w-full 
  px-4 py-3 
  border 
  border-gray-300 
  rounded-lg 
  bg-white 
  cursor-pointer 
  focus:outline-none 
  focus:ring-2 
  focus:ring-civic-blue-500 
  focus:border-transparent
"
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Small (mobile): default */
/* Medium (tablet): 768px */
@media (min-width: 768px) { ... }

/* Large (desktop): 1024px */
@media (min-width: 1024px) { ... }

/* Extra Large: 1280px */
@media (min-width: 1280px) { ... }
```

### Mobile Adaptations
- Single column layouts
- Bottom tab navigation
- Collapsible filters
- Swipeable cards
- Larger touch targets (min 44px)
- Simplified forms (step-by-step)

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Normal text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Civic Blue on white: ✅ Pass
- Civic Orange on white: ✅ Pass

**Keyboard Navigation:**
- All interactive elements accessible via Tab
- Skip to main content link
- Visible focus indicators
- Logical tab order

**Screen Readers:**
- Semantic HTML (header, nav, main, footer)
- ARIA labels for icons
- Alt text for images
- Form labels properly associated

**Touch Targets:**
- Minimum 44x44px for mobile
- Adequate spacing between elements
- Large enough for finger taps

---

## 🌐 Internationalization (i18n)

### Language Support
- **English** (default)
- **Marathi** (मराठी)

### Font Loading
```jsx
// Google Fonts
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
```

### Language Toggle Component
```jsx
<LanguageToggle />
// Displays: [🇬🇧 English] [🇮🇳 मराठी]
```

---

## 🎭 Animation Guidelines

### Transitions
```css
/* Standard transition */
transition: all 0.3s ease;

/* Transform only (better performance) */
transition: transform 0.3s ease, opacity 0.3s ease;
```

### Hover Effects
```css
/* Cards */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Buttons */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Loading States
```jsx
// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-blue-600" />

// Skeleton
<div className="animate-pulse bg-gray-200 h-20 rounded-lg" />

// Progress Bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div className="bg-civic-blue-600 h-2 rounded-full" style={{width: '60%'}} />
</div>
```

---

## 🖼️ Image Guidelines

### Complaint Images
- **Format:** JPG, PNG
- **Max Size:** 5MB
- **Recommended:** 1920x1080px
- **Thumbnail:** 400x300px
- **Compression:** 80% quality

### Optimization
```jsx
// Lazy loading
<img loading="lazy" src="..." alt="..." />

// Responsive images
<img 
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  src="image-800.jpg"
  alt="..."
/>
```

---

## 🗺️ Map Configuration

### OpenStreetMap Tiles
```javascript
const tileLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '© OpenStreetMap contributors'
```

### Mumbai Center
```javascript
const center = [19.0760, 72.8777]
const defaultZoom = 11
const minZoom = 10
const maxZoom = 18
```

### Custom Markers
- Pothole: 🕳️ on yellow background
- Garbage: 🗑️ on brown background
- Water: 💧 on blue background
- Streetlight: 💡 on yellow background

---

## 📊 Data Visualization

### Chart Colors (Recharts)
```javascript
const chartColors = {
  primary: '#0078D7',    // Civic Blue
  secondary: '#FF9E00',  // Civic Orange
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Red
}
```

### Chart Types
- **Bar Chart:** Complaints by ward
- **Pie Chart:** Status distribution
- **Line Chart:** Daily trends
- **Area Chart:** Category trends over time
- **Heatmap:** Complaint density on map

---

## ✅ UI Checklist

### Before Launch
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements keyboard accessible
- [ ] Loading states for all async operations
- [ ] Error states with helpful messages
- [ ] Success feedback for user actions
- [ ] Consistent spacing and alignment
- [ ] All images optimized and compressed
- [ ] Fonts loaded properly (English + Marathi)
- [ ] Language toggle working
- [ ] Browser testing complete (Chrome, Firefox, Safari, Edge)
- [ ] Performance: Lighthouse score > 90

---

**Made with ❤️ for Mumbai | मुंबईसाठी प्रेमाने बनवलेले** 🇮🇳
