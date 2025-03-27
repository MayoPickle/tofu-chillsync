/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7', // Deep space blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#082f49',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef', // Cosmic purple
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        space: {
          dark: '#0f172a', // Deep space background
          darker: '#020617', // Black hole darkness
          nebula: '#818cf8', // Nebula blue/purple
          mars: '#ef4444', // Mars red
          venus: '#f59e0b', // Venus orange/yellow
          saturn: '#f97316', // Saturn orange
          neptune: '#06b6d4', // Neptune blue
          moon: '#94a3b8', // Moon gray
          star: '#fef08a', // Star yellow
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        space: ['Space Grotesk', 'Orbitron', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '8px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
        glow: '0 0 15px rgba(56, 189, 248, 0.5), 0 0 30px rgba(56, 189, 248, 0.3)',
        'neon-purple': '0 0 10px rgba(217, 70, 239, 0.6), 0 0 20px rgba(217, 70, 239, 0.4)',
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom, #0f172a, #020617)',
        'aurora': 'linear-gradient(to right, #0284c7, #d946ef, #0ea5e9)',
        'planet-ring': 'radial-gradient(circle, transparent 50%, #f97316 51%, #f97316 70%, transparent 71%)',
      },
    },
  },
  plugins: [],
}

