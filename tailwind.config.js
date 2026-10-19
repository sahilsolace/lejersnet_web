/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F4B',
          dark: '#081637',
          light: '#1B3270',
        },
        accent: '#3B82F6',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        bg: '#F5F7FB',
        card: '#FFFFFF',
        border: '#E5E9F2',
        ink: {
          DEFAULT: '#0B1F4B',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(11,31,75,0.06), 0 1px 2px rgba(11,31,75,0.04)',
        cardLg: '0 10px 30px -12px rgba(11,31,75,0.18)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
