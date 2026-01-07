/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EF3124',
          hover: '#D92D20',
        },
        secondary: '#0B1F35',
        background: {
          light: '#F3F4F6',
          dark: '#121212',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E1E1E',
          darker: '#2D2D2D',
        },
        text: {
          main: '#1F2937',
          secondary: '#6B7280',
          dark: {
            main: '#F9FAFB',
            secondary: '#9CA3AF',
          },
        },
        border: {
          light: '#E5E7EB',
          dark: '#374151',
        },
        accent: {
          red: {
            light: '#FEF2F2',
          },
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
