# Snap & Report Frontend

React + Vite frontend for the Snap & Report civic issue reporting system.

## Features

- 🎨 **Modern UI** with Tailwind CSS
- 🔐 **JWT Authentication** with role-based access
- 📱 **Responsive Design** for all devices
- 🗺️ **Interactive Maps** with React Leaflet
- 📊 **Analytics Dashboard** with Recharts
- ⚡ **Fast Development** with Vite HMR

## Tech Stack

- **React 18** with Hooks
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Zustand** for state management
- **Axios** for API calls
- **React Leaflet** for maps

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to: http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable React components
│   ├── common/      # Shared components (Navbar, Sidebar)
│   └── layouts/     # Layout components
├── pages/           # Page components
│   ├── Public/      # Public pages (Landing)
│   ├── Auth/        # Authentication pages
│   ├── User/        # User dashboard pages
│   └── Admin/       # Admin dashboard pages
├── store/           # Zustand stores
├── utils/           # Utility functions
└── main.jsx         # Application entry point
```

## Available Routes

### Public Routes
- `/` - Landing page
- `/login` - User login
- `/register` - User registration

### User Routes
- `/dashboard` - User dashboard
- `/dashboard/report` - Report new issue
- `/dashboard/my-complaints` - View user's complaints
- `/dashboard/complaints/:id` - Complaint detail
- `/dashboard/profile` - User profile

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/complaints` - All complaints list
- `/admin/complaints/:id` - Complaint management
- `/admin/departments` - Department management
- `/admin/users` - User management

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Snap & Report
```

## Development

- **Hot Module Replacement** - Changes reflect immediately
- **ESLint** - Code linting
- **PostCSS** - CSS processing with Tailwind

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy the 'dist' folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy the 'dist' folder to Netlify
```

### Docker
```bash
docker build -t snap-and-report-frontend .
docker run -p 80:80 snap-and-report-frontend
```

## License

MIT License
