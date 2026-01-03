/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode colors (default)
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#141414',
        'bg-tertiary': '#1e1e1e',
        'bg-hover': '#2a2a2a',
        
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'text-muted': '#606060',
        
        'border': '#2a2a2a',
        'border-hover': '#3a3a3a',
        
        'accent': '#6366f1',
        'accent-hover': '#818cf8',
        
        'success': '#22c55e',
        'error': '#ef4444',
        'warning': '#f59e0b',
      },
    },
  },
  plugins: [],
}
