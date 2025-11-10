/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
       // Mumbai Civic Theme
       'civic-blue': {
         50: '#e6f3ff',
         100: '#b3dbff',
         200: '#80c3ff',
         300: '#4dabff',
         400: '#1a93ff',
         500: '#0078D7', // Primary Mumbai Civic Blue
         600: '#0066b8',
         700: '#005499',
         800: '#00427a',
         900: '#00305b',
       },
       'civic-orange': {
         50: '#fff7ed',
         100: '#ffedd5',
         200: '#fed7aa',
         300: '#fdba74',
         400: '#fb923c',
         500: '#FF9E00', // Accent Orange
         600: '#ea580c',
         700: '#c2410c',
         800: '#9a3412',
         900: '#7c2d12',
       },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
